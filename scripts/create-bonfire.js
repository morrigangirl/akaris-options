let akariSocket;

Hooks.once("socketlib.ready", () => {
	akariSocket = socketlib.registerModule("akaris-options");
	akariSocket.register("sockCreateBonfire", sockCreateBonfire);
});

function sockCreateBonfire(userName) {
	console.log(`User ${userName} called CreateBonfire!`);
}
