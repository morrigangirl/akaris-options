console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");

  Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    console.log("🔁 [Hook: midi-qol.preAttackRoll] Fired");

    const item = workflow.item;
    console.log(`📦 Item: ${item?.name ?? "None"}`);
    if (!item) {
      console.log("❌ [Step 1] No item found in workflow.");
      return;
    }

    if (item.type !== "weapon") {
      console.log(`❌ [Step 2] Item is not a weapon. Type: ${item.type}`);
      return;
    }
    console.log("✅ [Step 2] Item is a weapon.");

    const effects = item.effects;
    console.log(`🧪 [Step 3] Item has ${effects?.size ?? 0} active effects.`);

    const hasHolyAvengerEffect = Array.from(effects ?? []).some(effect => {
      const isMatch = effect.name?.toLowerCase() === "holy avenger";
      console.log(`🔍 Checking effect: "${effect.name}" — Match: ${isMatch}`);
      return isMatch;
    });

    if (!hasHolyAvengerEffect) {
      console.log("❌ [Step 4] No Active Effect named 'Holy Avenger' found on item.");
      return;
    }
    console.log("✅ [Step 4] Found 'Holy Avenger' effect on item.");

    const targets = Array.from(workflow?.targets ?? []);
    console.log(`🎯 [Step 5] Number of targets: ${targets.length}`);

    const target = targets[0];
    if (!target || !target.actor) {
      console.log("❌ [Step 5] No valid target or target has no actor.");
      return;
    }
    console.log(`✅ [Step 5] Target acquired: ${target.name}`);

    const creatureType = target.actor.system.details?.type?.value?.toLowerCase() ?? "unknown";
    console.log(`🔍 [Step 6] Target creature type: ${creatureType}`);

    if (!["fiend", "undead"].includes(creatureType)) {
      console.log("❌ [Step 6] Target is not Fiend or Undead.");
      return;
    }
    console.log("✅ [Step 6] Target is Fiend or Undead. Preparing to apply bonus damage.");



  // Clone item data and inject new damage part
  const cloned = foundry.utils.deepClone(workflow.item.system);
  cloned.damage.parts.push(["2d10", "radiant"]);
  console.log("✅ Adding 2d10 radiant to item damage parts.");

  workflow.overrideItemData = cloned;
  console.log("✅ overrideItemData set.");
  });
});