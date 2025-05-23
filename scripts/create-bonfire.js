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
		img: tileParams.img || "icons/svg/explosion.svg",
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
	return newTile?.id ?? null;
}
   


