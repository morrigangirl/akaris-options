let akariSocket;

Hooks.once("socketlib.ready", () => {
	akariSocket = socketlib.registerModule("akaris-options");
	akariSocket.register("akariCreateBonfire", akariCreateBonfire);
	akariSocket.register("akariTileAndReturnId", akariCreateTileAndReturnId);
});

Hooks.on("deleteActiveEffect", async (effect) => {
  const actor = effect.parent;
  if (!actor || !effect.getFlag("core", "statusId") === "concentration") return;

  const tileId = effect.getFlag("akaris-options", "bonfireTileId");
  if (!tileId) return;

  const scene = game.scenes.get(actor.parent?.id || canvas.scene.id);
  const tile = scene.tiles.get(tileId);
  if (!tile) return;

  await scene.deleteEmbeddedDocuments("Tile", [tileId]);
  ui.notifications.info("🔥 Bonfire extinguished (concentration ended).");
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
  await placedTile.document.update({'flags.monks-active-tiles': {"name":"Bonfire Tile","active":true,"record":false,"restriction":"all","controlled":"all","trigger":["enter","turnend"],"allowpaused":false,"usealpha":false,"pointer":false,"vision":true,"pertoken":false,"minrequired":0,"cooldown":null,"chance":100,"fileindex":0,"actions":[{"action":"anchor","data":{"tag":"_turnend","stop":false},"id":"aF73wfmzs8Gi7MFF"},{"action":"distance","data":{"entity":{"id":"token","name":"Triggering Token"},"measure":"lt","distance":{"value":1,"var":"px"},"from":"edge","continue":"within"},"id":"KnC5lBAma7IrloY0"},{"action":"monks-tokenbar.requestroll","data":{"entity":{"id":"token","name":"Triggering Token"},"request":"save:dex","dc":"10","flavor":"Burned by Bonfire","rollmode":"roll","silent":true,"fastforward":true,"usetokens":"fail","continue":"always"},"id":"p4L3rH8jcchrzxxz"},{"action":"hurtheal","data":{"entity":{"id":"token","name":"Triggering Token"},"value":"-[[1d8]]","chatMessage":true,"rollmode":"roll","showdice":true},"id":"QfOP4fBUzzBZ1Nzo"},{"action":"anchor","data":{"tag":"_enter","stop":true},"id":"2Y4aUUDrGWL7MfHz"},{"action":"monks-tokenbar.requestroll","data":{"entity":{"id":"token","name":"Triggering Token"},"request":"save:dex","dc":"10","flavor":"Burned by the Bonfire","rollmode":"roll","silent":true,"fastforward":true,"usetokens":"fail","continue":"always"},"id":"EM5ROfDwUuwiR23d"},{"action":"hurtheal","data":{"entity":{"id":"token","name":"Triggering Token"},"value":"-[[1d8]]","chatMessage":true,"rollmode":"roll","showdice":true},"id":"O5QIu5UUhEMb5see"}],"files":[]}});
  await placedTile.document.update({ "texture.src": "modules/jb2a_patreon/Library/Generic/Fire/Eruption_01_Regular_Blue_600x600.webm", width: 100, height: 100 });

  ui.notifications.info("Monk's Tile Update.")

  ui.notifications.info("🔥 Bonfire tile created and activated!");
  return placedTile.id;

}
   


