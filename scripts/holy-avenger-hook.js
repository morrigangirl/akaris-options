console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");

  Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    console.log("Executing preAttackRoll Hook for 🛡️ Holy Avenger!");

    const item = workflow.item;
    if (!item || item.type !== "weapon") {
      console.log(`${item.type} not weapon.`);
      return;
    }

    // Check for an Active Effect on the weapon named "Holy Avenger"
    const hasHolyAvengerEffect = item.effects?.some(effect => {
      return effect.name?.toLowerCase() === "holy avenger";
    });

    if (hasHolyAvengerEffect) {
      console.log("🛡️ Holy Avenger effect found on weapon. Proceeding with logic.");
      // You can add logic here to modify damage parts, apply effects, etc.
    } else {
      console.log("❌ No Holy Avenger effect found on weapon.");
    }
  });
});
