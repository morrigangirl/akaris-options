Hooks.on("midi-qol.preItemRollComplete", async (workflow) => {
  if (!workflow || !workflow.item) return;

  // Match by name (case sensitive!)
  if (workflow.item.name === "Create Bonfire") {
    console.log("🔥 Create Bonfire was cast by:", workflow.actor.name);
  }
});