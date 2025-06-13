Hooks.once("ready", () => {
  console.log("✅ Topple Mastery (Midi-QOL) Hook Initialized");

  // Store the hook ID globally in case you want to remove it later
  window.toppleHookId = Hooks.on("midi-qol.postDamageRollComplete", async (workflow) => {
    const item = workflow.item;
    const actor = workflow.actor;

    if (!item || item.type !== "weapon") return;
    const mastery = item.system.mastery?.toLowerCase() ?? "";
    if (mastery !== "topple") return;

    console.log(`🌀 Topple triggered by ${actor.name} with ${item.name}`);

    for (const targetToken of workflow.hitTargets) {
      const target = targetToken.actor;
      if (!target) continue;

      // Optional: Check if already Prone
      const alreadyProne = target.effects.some(e => e.label === "Prone");
      if (alreadyProne) continue;

      // Apply the "Prone" condition using DFreds if available
      if (game.dfreds?.effectInterface) {
        await game.dfreds.effectInterface.addEffect({
          effectName: "Prone",
          uuid: target.uuid,
          origin: item.uuid,
        });
      } else {
        // Fallback: Add a basic prone effect manually
        await target.createEmbeddedDocuments("ActiveEffect", [{
          label: "Prone",
          icon: "icons/svg/falling.svg",
          origin: item.uuid,
          changes: [],
          duration: { rounds: 1 }
        }]);
      }
    }
  });
});