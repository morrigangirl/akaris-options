// Log module load
console.log("🔥 Flame Cloak Module: Loaded");

// Register hook once Foundry is ready
Hooks.once("ready", () => {
  console.log("🔥 Flame Cloak: Hook registered for dnd5e.rollDamage");

  // Listen for all damage rolls (hooked into dnd5e system)
  Hooks.on("dnd5e.rollDamage", async (item, roll) => {
    console.log("🔥 Flame Cloak Hook Triggered", { item, roll });

    // Only trigger if the attack was a melee weapon attack
    const isMelee = item?.system?.actionType === "mwak";
    if (!isMelee) {
      console.log("🔥 Flame Cloak: Not a melee weapon attack. Skipping.");
      return;
    }

    // Find the attacker token from the item context
    const attackerToken = item.parent.getActiveTokens()[0];
    if (!attackerToken) {
      console.warn("🔥 Flame Cloak: No attacker token found.");
      return;
    }

    // Get targets selected by the user (assumes this is the target hit)
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) {
      console.warn("🔥 Flame Cloak: No targets found.");
      return;
    }

    // Loop through each target to check for active flame cloak
    for (const target of targets) {
      const targetActor = target.actor;

      // Check for custom flag on the target actor
      const flagValue = targetActor?.flags?.["midi-qol"]?.flameCloak;

      // If the flag is not explicitly true, skip
      if (!flagValue == true) {
        console.log(`🔥 Flame Cloak: ${target.name} does NOT have the flameCloak flag active.`);
        continue;
      }

      // Log that retaliation is happening
      console.log(`🔥 Flame Cloak: Retaliating against ${attackerToken.name} for attacking ${target.name} with a melee weapon.`);

      // Roll fire damage (1d6)
      let damageRoll = await new Roll("1d6").roll({ async: true });
      await game.dice3d?.showForRoll(damageRoll); // Optional 3D Dice

      // Apply retaliation damage to the attacker using midi-qol
      new MidiQOL.DamageOnlyWorkflow(
        targetActor,         // The retaliator (target who had Flame Cloak)
        target,              // Token of the retaliator
        damageRoll.total,    // Damage dealt
        "fire",              // Damage type
        [attackerToken],     // Target of the damage (the attacker)
        damageRoll,          // The actual roll
        {
          flavor: `${target.name}'s Flame Cloak scorches ${attackerToken.name}!`,
          itemCardId: "new", // Mark as a new item card (deprecated in newer versions)
          isCritical: false  // No crit on retaliation
        }
      );
    }
  });
});