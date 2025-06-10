// Log when the module is loaded
console.log("🛡️ Holy Avenger Module Code Loaded");

// Hook into Foundry's 'ready' lifecycle
Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Hook Initialized: midi-qol.postDamageRollComplete");

  // This hook fires after the damage roll is complete in a MidiQOL workflow
  Hooks.on("midi-qol.postDamageRollComplete", async (workflow) => {
    console.log("🔁 [Hook Fired] midi-qol.postDamageRollComplete");

    if (!workflow) {
      console.log("❌ No workflow object passed.");
      return;
    }

    const item = workflow.item;
    const actor = workflow.actor;
    const token = workflow.token;

    if (!item) {
      console.log("❌ [Step 1] No item in workflow.");
      return;
    }

    console.log(`📦 [Step 1] Item name: ${item.name}, Type: ${item.type}`);

    // Check that the item used was a weapon
    if (item.type !== "weapon") {
      console.log("❌ [Step 2] Item is not a weapon. Skipping.");
      return;
    }
    console.log("✅ [Step 2] Item is a weapon.");

    // Step 3: Look for an Active Effect named "Holy Avenger" on the weapon
    const effects = item.effects;
    const effectCount = effects?.size ?? 0;
    console.log(`🧪 [Step 3] Item has ${effectCount} active effects.`);

    const hasHolyAvengerEffect = Array.from(effects ?? []).some(effect => {
      const match = effect.name?.toLowerCase() === "holy avenger";
      console.log(`🔍 Checking effect "${effect.name}" → Match: ${match}`);
      return match;
    });

    if (!hasHolyAvengerEffect) {
      console.log("❌ [Step 4] No Active Effect named 'Holy Avenger' found on item.");
      return;
    }

    console.log("✅ [Step 4] 'Holy Avenger' effect found on weapon.");

    // Step 5: Get the list of hit targets from the workflow
    const targets = Array.from(workflow.hitTargets ?? []);
    console.log(`🎯 [Step 5] Hit Targets Count: ${targets.length}`);

    if (targets.length === 0) {
      console.log("❌ [Step 5] No hit targets. Skipping.");
      return;
    }

    // Step 6: Loop through each target to check if they are fiend or undead
    for (const target of targets) {
      console.log(`📌 [Step 6] Processing Target: ${target.name}`);
      const targetActor = target.actor;

      if (!targetActor) {
        console.log(`❌ [Step 6] Target ${target.name} has no actor.`);
        continue;
      }

      // Step 7: Determine the type of the target
      const type = targetActor.system.details?.type?.value?.toLowerCase() ?? "unknown";
      console.log(`🔍 [Step 7] Target Type: ${type}`);

      if (!["fiend", "undead"].includes(type)) {
        console.log(`⛔ [Step 7] Target ${target.name} is not Fiend or Undead.`);
        continue;
      }

      console.log(`✅ [Step 7] Target ${target.name} is Fiend or Undead. Applying bonus damage.`);

      // Step 8: Roll 2d10 radiant damage
      const damageRoll = await new Roll("2d10").roll({ async: true });
      console.log(`🎲 [Step 8] Radiant Damage Roll: ${damageRoll.total}`);
      await game.dice3d?.showForRoll(damageRoll); // Optional: Show roll with 3D dice

      // Step 9: Apply the bonus damage to the target via MidiQOL
      console.log("🚀 [Step 9] Triggering MidiQOL.DamageOnlyWorkflow");
      new MidiQOL.DamageOnlyWorkflow(
        actor,                 // Attacking actor
        token,                 // Attacker token
        damageRoll.total,      // Damage amount
        "radiant",             // Damage type
        [target],              // Target(s) to apply damage to
        damageRoll,            // The rolled damage object
        {
          flavor: `${actor.name}'s Holy Avenger smites ${target.name} with radiant force!`,
          itemCardId: workflow.itemCardId ?? "new", // For compatibility with older midi-qol versions
          damageRoll,
          isBonus: true        // Marks this as bonus damage, not part of the base attack
        }
      );
    }
  });
});