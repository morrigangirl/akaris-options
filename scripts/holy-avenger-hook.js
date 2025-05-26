Hooks.on("midi-qol.RollComplete", async (workflow) => {
  // Validate it's a weapon attack
  if (!workflow || workflow.item?.type !== "weapon") return;
  console.log("Holy Avenger Damage Triggered.")

  // Check weapon name matches Holy Avenger (case-insensitive match)
  const weaponName = workflow.item.name.toLowerCase();
  if (!weaponName.includes("holy avenger")) return;

  // Get the first valid target
  const target = workflow.targets.first();
  if (!target) return;

  // Check target creature type
  const type = target.actor?.system?.details?.type?.value?.toLowerCase() || "";
  if (!(type.includes("fiend") || type.includes("undead"))) return;

  // Add bonus damage
  const bonusRoll = await new Roll("2d10[radiant]").roll({ async: true });
  await workflow.damageBonus.push({
    damage: bonusRoll,
    flavor: "Holy Avenger - Extra vs Fiends/Undead"
  });
});