// Define a variable to hold the socketlib reference for this module
let akariSocket;

// Register all socketlib functions once socketlib is ready
Hooks.once("socketlib.ready", () => {
  // Register the socketlib module
  akariSocket = socketlib.registerModule("akaris-options");

  // Register callable functions exposed to other clients or the server
  akariSocket.register("akariCreateBonfire", akariCreateBonfire); // Basic bonfire log
  akariSocket.register("akariTileAndReturnId", akariCreateTileAndReturnId); // Creates a tile and returns the ID
  akariSocket.register("storms-thunder-reaction", promptStormsThunder); // Handles Storm’s Thunder reaction logic
});

// Hook that fires when any Active Effect is deleted
Hooks.on("deleteActiveEffect", async (effect) => {
  const actor = effect.parent;
  // Ignore if there is no actor, or this effect isn't concentration
  if (!actor || !effect.getFlag("core", "statusId") === "concentration") return;

  // Get the stored bonfire tile ID from effect flag
  const tileId = effect.getFlag("akaris-options", "bonfireTileId");
  if (!tileId) return;

  // Resolve the appropriate scene (actor's parent or current canvas)
  const scene = game.scenes.get(actor.parent?.id || canvas.scene.id);
  const tile = scene.tiles.get(tileId);
  if (!tile) return;

  // Remove the tile when concentration ends
  await scene.deleteEmbeddedDocuments("Tile", [tileId]);
  ui.notifications.info("🔥 Bonfire extinguished (concentration ended).");
});

// Dummy placeholder for Create Bonfire logic
function akariCreateBonfire(userName) {
  console.log(`User ${userName} called CreateBonfire!`);
}

// Create a tile on the scene and return its ID, used in Bonfire spell logic
async function akariCreateTileAndReturnId(tileParams) {
  // Only allow this function to run as GM
  if (!game.user.isGM) {
    console.warn("createTileAndReturnId called by non-GM context.");
    return null;
  }

  const scene = canvas.scene;
  if (!scene) {
    ui.notifications.warn("No active scene.");
    return null;
  }

  // Basic tile properties; overrideable via `tileParams`
  const tileData = {
    bg: tileParams.img || "modules/jb2a_patreon/Library/Generic/Fire/Eruption_01_Regular_Blue_600x600.webm",
    x: tileParams.x,
    y: tileParams.y,
    width: tileParams.width,
    height: tileParams.height,
    z: tileParams.z || 100,
    hidden: tileParams.hidden ?? false,
    locked: tileParams.locked ?? false
  };

  // Create the tile on the scene
  const createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", [tileData]);
  const newTile = createdTiles[0];
  if (!newTile) return null;

  // Ensure tiles are rendered before proceeding
  await canvas.tiles.draw();

  // Get the canvas Tile object
  const placedTile = canvas.tiles.get(newTile.id);
  if (!placedTile) {
    ui.notifications.error("Could not find the newly placed tile on canvas.");
    return null;
  }

  // Select/control the tile
  placedTile.control({ releaseOthers: true });

  // Apply Monk's Active Tile Trigger actions (e.g., saving throw and damage on enter/turn end)
  await placedTile.document.update({
    'flags.monks-active-tiles': {
      "name": "Bonfire Tile",
      "active": true,
      "record": false,
      "restriction": "all",
      "controlled": "all",
      "trigger": ["enter", "turnend"],
      "allowpaused": false,
      "usealpha": false,
      "pointer": false,
      "vision": true,
      "pertoken": false,
      "minrequired": 0,
      "cooldown": null,
      "chance": 100,
      "fileindex": 0,
      "actions": [
        { "action": "anchor", "data": { "tag": "_turnend", "stop": false } },
        { "action": "distance", "data": { "entity": { "id": "token", "name": "Triggering Token" }, "measure": "lt", "distance": { "value": 1, "var": "px" }, "from": "edge", "continue": "within" } },
        { "action": "monks-tokenbar.requestroll", "data": { "entity": { "id": "token", "name": "Triggering Token" }, "request": "save:dex", "dc": "10", "flavor": "Burned by Bonfire", "rollmode": "roll", "silent": true, "fastforward": true, "usetokens": "fail", "continue": "always" } },
        { "action": "hurtheal", "data": { "entity": { "id": "token", "name": "Triggering Token" }, "value": "-[[1d8]]", "chatMessage": true, "rollmode": "roll", "showdice": true } },
        { "action": "anchor", "data": { "tag": "_enter", "stop": true } },
        { "action": "monks-tokenbar.requestroll", "data": { "entity": { "id": "token", "name": "Triggering Token" }, "request": "save:dex", "dc": "10", "flavor": "Burned by the Bonfire", "rollmode": "roll", "silent": true, "fastforward": true, "usetokens": "fail", "continue": "always" } },
        { "action": "hurtheal", "data": { "entity": { "id": "token", "name": "Triggering Token" }, "value": "-[[1d8]]", "chatMessage": true, "rollmode": "roll", "showdice": true } }
      ],
      "files": []
    }
  });

  // Update texture in case it was missing
  await placedTile.document.update({
    "texture.src": tileData.bg,
    width: 100,
    height: 100
  });

  ui.notifications.info("🔥 Bonfire tile created and activated!");
  return placedTile.id;
}

// Prompt user to activate Storm’s Thunder feature in reaction to an attack
async function promptStormsThunder(targetUuid, attackerUuid) {
  const targetToken = await fromUuid(targetUuid);
  const attackerTokenDoc = await fromUuid(attackerUuid); // This is the token Document
  const attackerToken = attackerTokenDoc?.object; // In-scene token object

  const targetActor = targetToken.actor;

  // Find the Storm’s Thunder feat on the actor
  const feature = targetActor.items.find(i => i.name === "Storm's Thunder" && i.type === "feat");
  if (!feature) {
    console.log(`❌ ${targetToken.name} does not have Storm's Thunder.`);
    return;
  }

  const uses = feature.system.uses;
  console.log(feature.system);
  console.log(`Total Uses Available: ${uses.max - uses.spent}`);
  if (!uses || uses.value < 1) {
    console.log(`❌ No uses left for Storm's Thunder on ${targetToken.name}.`);
    return;
  }

  console.log("🧪 Feature is embedded:", feature.parent === targetActor);

  // Prompt the player to confirm usage
  const confirm = await Dialog.confirm({
    title: "Storm's Thunder",
    content: `<p>${targetToken.name} took damage. Use Storm's Thunder to deal <strong>1d8 thunder</strong> damage to ${attackerToken.name}?</p>`
  });

  if (!confirm) {
    console.log(`🛑 ${targetToken.name} declined to use Storm's Thunder.`);
    return;
  }

  // Optionally target the attacker (for clarity and visual feedback)
  attackerToken.setTarget(true, {
    user: game.user,
    releaseOthers: true,
    groupSelection: false
  });

  // Use the item (triggers item use macro if defined, deducts use, etc.)
  await feature.use();

  console.log(`✅ ${targetToken.name} used Storm's Thunder.`);
}