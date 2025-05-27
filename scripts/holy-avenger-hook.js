console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");

  Hooks.on("midi-qol.postDamageRollComplete", async (workflow) => {
    console.log("🛡️ Holy Avenger Hook Triggered");

    if (!workflow.item || workflow.item.type !== "weapon") {
      console.log("❌ Not a weapon or no item.");
      return;
    }

    const weaponName = workflow.item.name?.toLowerCase() || "";
    console.log(`🔍 Weapon name: ${weaponName}`);
    if (!weaponName.includes("holy avenger")) {
      console.log("❌ Weapon is not Holy Avenger. Skipping.");
      return;
    }

    const actionType = workflow.item.system.actionType;
    console.log(`🔍 Action type: ${actionType}`);
    if (!["mwak", "rwak"].includes(actionType)) {
      console.log("❌ Not a melee or ranged weapon attack. Skipping.");
      return;
    }

    const target = workflow?.targets?.first(); // Use hitTargets only
    if (!target) {
      console.log("❌ No hit target found.");
      return;
    }

    console.log(`🎯 Target name: ${target.name}`);

    const creatureType = target.actor?.system.details?.type?.value?.toLowerCase() || "";
    console.log(`🔍 Target creature type: ${creatureType}`);
    if (!["fiend", "undead"].includes(creatureType)) {
      console.log("❌ Target is not Fiend or Undead. Skipping bonus damage.");
      return;
    }

    console.log("✅ Holy Avenger: Triggering damageOnlyWorkflow bonus");

    await MidiQOL.damageOnlyWorkflow(
      workflow.actor,
      target,
      "2d10",                     // damage
      "radiant",                  // damage type
      [target],                   // targets
      {
        flavor: "Holy Avenger: Bonus radiant damage vs Fiend/Undead",
        itemCardId: workflow.itemCardId,
        itemData: workflow.item,
        isBonus: true
      }
    );
  });
});