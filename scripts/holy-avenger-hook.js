console.log("🛡️ Holy Avenger Module Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Hook Initialized: midi-qol.postDamageRollComplete");

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

    if (item.type !== "weapon") {
      console.log("❌ [Step 2] Item is not a weapon. Skipping.");
      return;
    }
    console.log("✅ [Step 2] Item is a weapon.");

    // Check if weapon has an Active Effect named "Holy Avenger"
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

    // Proceed with checking targets
    const targets = Array.from(workflow.hitTargets ?? []);
    console.log(`🎯 [Step 5] Hit Targets Count: ${targets.length}`);

    if (targets.length === 0) {
      console.log("❌ [Step 5] No hit targets. Skipping.");
      return;
    }

    for (const target of targets) {
      console.log(`📌 [Step 6] Processing Target: ${target.name}`);
      const targetActor = target.actor;

      if (!targetActor) {
        console.log(`❌ [Step 6] Target ${target.name} has no actor.`);
        continue;
      }

      const type = targetActor.system.details?.type?.value?.toLowerCase() ?? "unknown";
      console.log(`🔍 [Step 7] Target Type: ${type}`);

      if (!["fiend", "undead"].includes(type)) {
        console.log(`⛔ [Step 7] Target ${target.name} is not Fiend or Undead.`);
        continue;
      }

      console.log(`✅ [Step 7] Target ${target.name} is Fiend or Undead. Applying bonus damage.`);

      const damageRoll = await new Roll("2d10").roll({ async: true });
      console.log(`🎲 [Step 8] Radiant Damage Roll: ${damageRoll.total}`);
      await game.dice3d?.showForRoll(damageRoll);

      // Apply the bonus damage
      console.log("🚀 [Step 9] Triggering MidiQOL.DamageOnlyWorkflow");
      new MidiQOL.DamageOnlyWorkflow(
        actor,
        token,
        damageRoll.total,
        "radiant",
        [target],
        damageRoll,
        {
          flavor: `${actor.name}'s Holy Avenger smites ${target.name} with radiant force!`,
          itemCardId: workflow.itemCardId ?? "new",
          damageRoll,
          isBonus: true
        }
      );
    }
  });
});