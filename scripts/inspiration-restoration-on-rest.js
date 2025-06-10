// Wait for Foundry to finish initializing before registering the hook
Hooks.once("ready", () => {

  // Hook into dnd5e's rest completion event
  Hooks.on("dnd5e.restCompleted", async (actor, data) => {

    // Find the actor's "Human" race item with rules source set to "2024"
    const raceItem = actor.items.find(i =>
      i.type === "race" &&
      i.name === "Human" &&
      i.system?.source?.rules === "2024"
    );

    // Check whether the actor already has inspiration
    const hasInspiration = actor.system.attributes.inspiration;

    // If they're a 2024 Human and don't already have Inspiration, grant it
    if (raceItem && !hasInspiration) {
      console.log(`🌟 Granting Heroic Inspiration to ${actor.name} (2024 Human) after long rest.`);
      await actor.update({ "system.attributes.inspiration": true });

    } else {
      // Log that no inspiration was granted and optionally show what was found
      console.log(`ℹ️ No Inspiration granted to ${actor.name}. Found race: ${raceItem?.name ?? "none"}`);
    }
  });

});