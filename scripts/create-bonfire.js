let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("akaris-options");
	socket.register("sockCreateBonfire", sockCreateBonfire);
});

function sockCreateBonfire(userName) {
	console.log(`User ${userName} called CreateBonfire!`);
}
