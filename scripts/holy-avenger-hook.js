console.log("🛡️ Holy Avenger Code Loaded");

Hooks.once("ready", () => {
  console.log("🛡️ Holy Avenger Damage Hook Initialized");

Hooks.on("midi-qol.preDamageRollComplete", async (workflow) => {
  if (!workflow.item || workflow.item.type !== "weapon") return;

  const weaponName = workflow.item.name?.toLowerCase() || "";
  if (!weaponName.includes("holy avenger")) return;

  const target = workflow.hitTargets.first();
  if (!target) return;

  const creatureType = target.actor?.system.details?.type?.value?.toLowerCase();
  if (!["fiend", "undead"].includes(creatureType)) return;

  console.log("🛡️ Holy Avenger target is Fiend or Undead — boosting radiant damage.");

  // Clone the damage parts array so we don't mutate future uses
  const damageParts = foundry.utils.deepClone(workflow.item.system.damage.parts);

  // Find the second radiant entry and change its value
  for (let i = 0; i < damageParts.length; i++) {
    if (damageParts[i][1] === "radiant" && damageParts[i][0] === "0") {
      damageParts[i][0] = "2d10";
      break;
    }
  }

  // Inject into workflow damage (overrides item damage for this roll)
  workflow.damageRoll = null; // clear cached damage
  workflow.item.system.damage.parts = damageParts;
  });
});