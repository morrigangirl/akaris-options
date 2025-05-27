console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");
  
  Hooks.on("midi-qol.preAttackRoll", async (workflow) => {
    console.log("Executing preAttackRoll Hook for 🛡️ Holy Avenger!")
    const item = workflow.item;
    if (!item || item.type !== "weapon") return;

    const enchantment = item.flags?.yourmod?.enchantment;
    if (enchantment === "holy-avenger") {
      console.log("🛡️ Holy Avenger weapon selected for attack.");
    }
  });
});
