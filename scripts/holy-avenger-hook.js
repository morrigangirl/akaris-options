Hooks.on("dnd5e.preRollDamage", async (item, config, options) => {
  if (!item || item.type !== "weapon") return;

  // Check weapon name
  const weaponName = item.name?.toLowerCase() || "";
  if (!weaponName.includes("holy avenger")) return;

  // Only apply to melee or ranged weapon attacks
  const actionType = item.system.actionType;
  if (!["mwak", "rwak"].includes(actionType)) return;

  // Must have a valid target
  const target = Array.from(game.user.targets)[0];
  if (!target) return;

  const targetActor = target.actor;
  if (!targetActor) return;

  // Check for creature type Fiend or Undead
  const creatureType = targetActor.system.details?.type?.value?.toLowerCase() || "";
  if (!["fiend", "undead"].includes(creatureType)) return;

  // Append 2d10 radiant damage
  const bonusDamage = {
    parts: [["2d10", "radiant"]],
    flavor: "Holy Avenger: extra damage vs Fiend/Undead"
  };

  if (!config.damageRoll) config.damageRoll = {};
  if (!config.damageRoll.criticalBonusDice) config.damageRoll.criticalBonusDice = [];

  config.damageBonusParts = (config.damageBonusParts || []).concat(bonusDamage.parts);
});