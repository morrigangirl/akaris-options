const MODULE_NAME = "akaris-options";

Hooks.once("ready", () => {
  console.log("⚡ Storm's Thunder Hook Initialized");

  Hooks.on("dnd5e.rollDamage", async (item, roll) => {
    console.log("Storm's Thunder Hook Triggered", { item, roll });
    const attackerToken = item.parent.getActiveTokens()[0];
    if (!attackerToken) {
      console.warn("Storm's Thunder: No attacker token found.");
      return;
    }

    const targets = Array.from(game.user.targets);
    if (targets.length === 0) {
      console.warn(`🔥 Storm's Thunder: No targets found.`);
      return;
    }
    for (const target of targets) {
      const targetActor = target.actor;
      const feature = targetActor.items.find(i => i.name === "Storm's Thunder" && i.type === "feat");
      if (!feature) {
        console.log(`❌ ${targetToken.name} does not have Storm's Thunder.`);
        continue;
      }
      const uses = feature.system.uses;
      if (!uses || uses.value < 1) {
        console.log(`❌ ${targetToken.name} has no uses left for Storm's Thunder.`);
        continue;
      }

      const distance = canvas.grid.measureDistance(target, attackerToken);
      console.log(`📏 Distance from ${target.name} to attacker: ${distance}ft`);

      if (distance > 60) {
        console.log(`❌ Attacker is out of range for ${targetToken.name}.`);
        continue;
      } 

      const socket = socketlib.registerModule(MODULE_NAME);
      console.log(`📡 Calling promptReaction for ${target.name}`);
      await socket.executeAsUser("storms-thunder-reaction", user, target.document.uuid, attackerToken.document.uuid);
    }
        
  });


});
