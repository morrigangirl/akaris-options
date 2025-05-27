console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");

  Hooks.on("dnd5e.rollDamageV2", async (item, roll) => {
    console.log("🛡️ Holy Avenger Hook Triggered");
    console.log(item);

    if (!item) {
      console.log("❌ No item found in the hook context.");
      return;
    }

    if (item.type !== "weapon") {
      console.log(`❌ Item is not a weapon: ${item.type}`);
      return;
    }

    const weaponName = item.name?.toLowerCase() || "";
    console.log(`🔍 Weapon name: ${weaponName}`);
    if (!weaponName.includes("holy avenger")) {
      console.log("❌ Weapon is not Holy Avenger. Skipping.");
      return;
    }

    const actionType = item.system.actionType;
    console.log(`🔍 Action type: ${actionType}`);
    if (!["mwak", "rwak"].includes(actionType)) {
      console.log("❌ Not a melee or ranged weapon attack. Skipping.");
      return;
    }

    const target = Array.from(game.user.targets)[0];
    if (!target) {
      console.log("❌ No target selected.");
      return;
    }

    console.log(`🎯 Target name: ${target.name}`);

    const targetActor = target.actor;
    if (!targetActor) {
      console.log("❌ Target has no actor.");
      return;
    }

    const creatureType = targetActor.system.details?.type?.value?.toLowerCase() || "";
    console.log(`🔍 Target creature type: ${creatureType}`);
    if (!["fiend", "undead"].includes(creatureType)) {
      console.log("❌ Target is not Fiend or Undead. Skipping bonus damage.");
      return;
    }

    console.log("✅ Target is Fiend or Undead. Adding bonus 2d10 radiant damage.");
  
  console.log("✅ Holy Avenger: Triggering damageOnlyWorkflow bonus");

    await MidiQOL.damageOnlyWorkflow(
      workflow.actor,
      target,
      "2d10",                     // damage
      "radiant",                  // damage type
      [target],                   // array of targets
      {
        flavor: "Holy Avenger: Bonus radiant damage vs Fiend/Undead",
        itemCardId: workflow.itemCardId, // makes sure the card stacks visually
        itemData: workflow.item,
        isBonus: true
      }
    );

  return {}; // no direct damage return; handled by workflow
  }); // end hook damageRoll
});