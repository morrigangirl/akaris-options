console.log("🛡️ Holy Avenger Module Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Hook Initialized: midi-qol.damageBonus");

  Hooks.on("midi-qol.damageBonus", async (workflow) => {
    console.log("🔁 [Hook Fired] midi-qol.damageBonus");

    const item = workflow.item;
    const actor = workflow.actor;

    if (!item || item.type !== "weapon") {
      console.log("❌ Not a weapon. Skipping.");
      return {};
    }

    console.log(`📦 Item: ${item.name}`);

    // Check for Holy Avenger effect
    const effects = item.effects;
    const hasHolyAvengerEffect = Array.from(effects ?? []).some(effect => {
      const match = effect.name?.trim().toLowerCase() === "holy avenger";
      console.log(`🔍 Checking effect "${effect.name}" → Match: ${match}`);
      return match;
    });

    if (!hasHolyAvengerEffect) {
      console.log("❌ No Holy Avenger effect. Skipping.");
      return {};
    }

    // Check for valid target
    const target = workflow.targets?.first();
    if (!target || !target.actor) {
      console.log("❌ No valid target.");
      return {};
    }

    const creatureType = target.actor.system.details?.type?.value?.toLowerCase() ?? "unknown";
    console.log(`🎯 Target: ${target.name} | Type: ${creatureType}`);

    if (!["fiend", "undead"].includes(creatureType)) {
      console.log("⛔ Target is not Fiend or Undead. No bonus damage.");
      return {};
    }

    console.log("✅ Target qualifies. Adding 2d10 radiant damage.");

    const roll = await new Roll("2d10").roll({ async: true });
    await game.dice3d?.showForRoll(roll);

    return {
      damageRoll: roll,
      flavor: "Holy Avenger vs Fiend/Undead",
      damageType: "radiant"
    };
  });
});