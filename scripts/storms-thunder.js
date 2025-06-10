// Module name used when registering with socketlib
const MODULE_NAME = "akaris-options";

// Wait for Foundry to finish initializing
Hooks.once("ready", () => {
  console.log("⚡ Storm's Thunder Hook Initialized");

  // Register a hook that triggers whenever a damage roll occurs in dnd5e
  Hooks.on("dnd5e.rollDamage", async (item, roll) => {
    console.log("Storm's Thunder Hook Triggered", { item, roll });

    // Get the token that initiated the attack
    const attackerToken = item.parent.getActiveTokens()[0];
    if (!attackerToken) {
      console.warn("Storm's Thunder: No attacker token found.");
      return;
    }

    // Get the current targets selected by the user
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) {
      console.warn(`🔥 Storm's Thunder: No targets found.`);
      return;
    }

    // Loop through all the selected targets
    for (const target of targets) {
      const targetActor = target.actor;

      // Check if the actor has the "Storm's Thunder" feat
      const feature = targetActor.items.find(i => i.name === "Storm's Thunder" && i.type === "feat");
      if (!feature) {
        console.log(`❌ ${target.name} does not have Storm's Thunder.`);
        continue;
      }

      // Check if the feat has remaining uses
      const uses = feature.system.uses;
      if (!uses || uses.value < 1) {
        console.log(`❌ ${target.name} has no uses left for Storm's Thunder.`);
        continue;
      }

      // Ensure attacker is within 60 feet for the reaction to be legal
      const distance = canvas.grid.measureDistance(target, attackerToken);
      console.log(`📏 Distance from ${target.name} to attacker: ${distance}ft`);

      if (distance > 60) {
        console.log(`❌ Attacker is out of range for ${target.name}.`);
        continue;
      } 

      // Determine which user owns the target actor
      // Prefer a non-GM user if available, otherwise fall back to a GM
      const ownerIds = Object.entries(targetActor.ownership)
        .filter(([_, level]) => level >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
        .map(([id]) => id);

      let ownerUser = game.users.find(u => ownerIds.includes(u.id) && !u.isGM)
                    || game.users.find(u => ownerIds.includes(u.id) && u.isGM);

      if (!ownerUser) {
        console.warn(`❌ Could not find a user owner for ${target.name}.`);
        continue;
      }

      // Use socketlib to request the reaction be prompted on the owner’s client
      const socket = socketlib.registerModule(MODULE_NAME);
      console.log(`📡 Calling promptReaction for ${target.name}`);
      await socket.executeAsUser(
        "storms-thunder-reaction", 
        ownerUser.id,                     // User to run the dialog
        target.document.uuid,            // The target taking damage
        attackerToken.document.uuid      // The attacker who triggered it
      );
    }
  });
});