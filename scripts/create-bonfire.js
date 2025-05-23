let akariSocket;

Hooks.once("socketlib.ready", () => {
	akariSocket = socketlib.registerModule("akaris-options");
	akariSocket.register("akariCreateBonfire", akariCreateBonfire);
	akariSocket.register("akariTileAndReturnId", akariCreateTileAndReturnId);
});

function akariCreateBonfire(userName) {
	console.log(`User ${userName} called CreateBonfire!`);
}

async function akariCreateTileAndReturnId(tileParams) {
  if (!game.user.isGM) {
    console.warn("createTileAndReturnId called by non-GM context.");
    return null;
  }
  const scene = canvas.scene;
  if (!scene) {
    ui.notifications.warn("No active scene.");
    return null;
  }
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
	
	const createdTiles = await canvas.scene.createEmbeddedDocuments("Tile", [tileData]);
  const newTile = createdTiles[0];
  if (!newTile) return null;

  // Get the tile object from canvas to control it
  await canvas.tiles.draw(); // Ensure tiles are drawn before accessing
  const placedTile = canvas.tiles.get(newTile.id);
  if (!placedTile) {
    ui.notifications.error("Could not find the newly placed tile on canvas.");
    return null;
  }

  // Control/select the tile
  placedTile.control({ releaseOthers: true });

  // Define Monk's Active Tile flags
  const monksFlags = {
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
      {
        "action": "distance",
        "data": {
          "entity": { "id": "token", "name": "Triggering Token" },
          "measure": "lt",
          "distance": { "value": 1, "var": "px" },
          "from": "edge",
          "continue": "within"
        }
      },
      {
        "action": "monks-tokenbar.requestroll",
        "data": {
          "entity": { "id": "token", "name": "Triggering Token" },
          "request": "save:dex",
          "dc": "10",
          "flavor": "Burned by Bonfire",
          "rollmode": "roll",
          "silent": true,
          "fastforward": true,
          "usetokens": "fail",
          "continue": "always"
        }
      },
      {
        "action": "hurtheal",
        "data": {
          "entity": { "id": "token", "name": "Triggering Token" },
          "value": "-[[1d8]]",
          "chatMessage": true,
          "rollmode": "roll",
          "showdice": true
        }
      },
      { "action": "anchor", "data": { "tag": "_enter", "stop": true } },
      {
        "action": "monks-tokenbar.requestroll",
        "data": {
          "entity": { "id": "token", "name": "Triggering Token" },
          "request": "save:dex",
          "dc": "10",
          "flavor": "Burned by the Bonfire",
          "rollmode": "none",
          "silent": true,
          "fastforward": true,
          "usetokens": "fail",
          "continue": "always"
        }
      },
      {
        "action": "hurtheal",
        "data": {
          "entity": { "id": "token", "name": "Triggering Token" },
          "value": "-[[1d8]]",
          "chatMessage": true,
          "rollmode": "roll",
          "showdice": true
        }
      }
    ],
    "files": []
  };

  // Update tile with Monk's flags
  await newTile.update({
    'flags.monks-active-tiles': monksFlags
  });

  ui.notifications.info("🔥 Bonfire tile created and activated!");
  return newTile.id;

}
   


