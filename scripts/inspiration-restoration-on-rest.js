Hooks.once("ready", () => {
    Hooks.on("dnd5e.restCompleted", async (actor, data) => {
  const raceItem = actor.items.find(i =>
    i.type === "race" &&
    i.name === "Human" &&
    i.system?.source?.rules === "2024"
  );

  const hasInspiration = actor.system.attributes.inspiration;

  if (raceItem && !hasInspiration) {
    console.log(`🌟 Granting Heroic Inspiration to ${actor.name} (2024 Human) after long rest.`);
    await actor.update({ "system.attributes.inspiration": true });
  } else {
    console.log(`ℹ️ No Inspiration granted to ${actor.name}. Found race: ${raceItem?.name ?? "none"}`);
  }
    });
});