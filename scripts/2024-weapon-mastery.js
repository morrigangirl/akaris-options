Hooks.once("ready", () => {

// Register the "Slowed" status condition
  CONFIG.statusEffects.push({
    id: "slowed",
    label: "Slowed", // This can be localized later
    icon: "modules/akaris-options/icons/slowed-icon.webp",
    // Optional: set to true if the effect has mechanical impact
    flags: {
      "akaris-options": true
    }
  });

  CONFIG.statusEffects.push({
    id: "sapped",
    label: "Sapped", // Can be localized
    icon: "modules/akaris-options/icons/sapped-icon.webp",
    flags: {
      "akaris-options": true
    }
  });

  console.log("✅ Registered custom 'Slowed' status effect and custom 'Sapped' effect.");


  console.log("✅ Mastery Hook Initialized (Topple + Slow)");

  Hooks.on("dnd5e.rollDamage", async (item, roll) => {
    console.debug("📌 [Mastery] Hook triggered: dnd5e.rollDamage");

    if (!item || item.type !== "weapon") {
      console.debug("⛔ [Mastery] Not a weapon item.");
      return;
    }

    const mastery = item.system.mastery?.toLowerCase() ?? "";
    if (!["topple", "slow"].includes(mastery)) {
      console.debug(`⛔ [Mastery] Mastery '${mastery}' not handled.`);
      return;
    }

    const attackerToken = item.parent?.getActiveTokens?.()[0];
    if (!attackerToken) {
      console.debug("⛔ [Mastery] No active attacker token found.");
      return;
    }

    console.debug(`[Mastery] Attacker: ${attackerToken.name}`);
    console.debug(`[Mastery] Detected mastery: ${mastery}`);

    const targets = Array.from(game.user.targets);
    if (!targets.length) {
      console.debug("⛔ [Mastery] No targets selected.");
      return;
    }

    for (const targetToken of targets) {
      const targetActor = targetToken.actor;
      if (!targetActor) {
        console.debug("⛔ [Mastery] Target has no actor.");
        continue;
      }

      console.debug(`[Mastery] Evaluating target: ${targetToken.name}`);

      // Handle "Topple"
      if (mastery === "topple") {
        const alreadyProne = targetActor.effects.some(e => e.label === "Prone");
        console.debug(`[Topple] Is ${targetToken.name} already prone? ${alreadyProne}`);
        if (alreadyProne) {
          console.debug(`[Topple] Skipping: ${targetToken.name} is already prone.`);
        } else {
          if (game.dfreds?.effectInterface) {
            console.debug(`[Topple] Applying 'Prone' to ${targetToken.name} via DFreds.`);
            await game.dfreds.effectInterface.addEffect({
              effectName: "Prone",
              uuid: targetActor.uuid,
              origin: item.uuid,
            });
          } else {
            console.debug(`[Topple] Applying fallback Prone to ${targetToken.name}.`);
            await targetActor.createEmbeddedDocuments("ActiveEffect", [{
              label: "Prone",
              icon: "icons/svg/falling.svg",
              origin: item.uuid,
              changes: [],
              duration: { rounds: 1 }
            }]);
          }

          console.debug(`✅ [Topple] Prone applied to ${targetToken.name}`);
        }
      }

      // Handle "Slow"
      if (mastery === "slow") {
        const originId = item.uuid;
        const existing = targetActor.effects.find(e => e.origin === originId && e.label === "Slowed");
        if (existing) {
          console.debug(`[Slow] Target ${targetToken.name} already has a Slow effect from this weapon.`);
          continue;
        }

        console.debug(`[Slow] Applying -10ft speed to ${targetToken.name}`);

        await targetActor.createEmbeddedDocuments("ActiveEffect", [{
          label: "Slowed",
          icon: "modules/akaris-options/icons/slowed-icon.webp",
          origin: originId,
          changes: [
            {
              key: "system.attributes.movement.walk",
              mode: CONST.ACTIVE_EFFECT_MODES.ADD,
              value: -10,
              priority: 20
            }
          ],
          duration: {
            rounds: 1,
            startRound: game.combat?.round,
            startTurn: game.combat?.turn
          },
          statuses: ["slowed"],
          flags: {
            "akaris-options": { "mastery": "slow" }
          }
        }]);

        console.debug(`✅ [Slow] Speed debuff applied to ${targetToken.name}`);
      }

      if (mastery === "sap") {
        const originId = item.uuid;
        const existing = targetActor.effects.find(e => e.origin === originId && e.label === "Sapped");

        if (existing) {
          console.debug(`[Sap] ${targetToken.name} is already sapped by this weapon.`);
          continue;
        }

        console.debug(`[Sap] Applying 'Sapped' to ${targetToken.name}`);

        await targetActor.createEmbeddedDocuments("ActiveEffect", [{
          label: "Sapped",
          icon: "modules/akaris-options/icons/sapped-icon.webp", // Use your custom icon or swap with a valid one
          origin: originId,
          changes: [
            {
              key: "flags.dnd5e.disadvantage.attack.all",
              mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
              value: true,
              priority: 20
            }
          ],
          duration: {
            rounds: 1,
            startRound: game.combat?.round,
            startTurn: game.combat?.turn
          },
          statuses: ["sapped"],
          flags: {
            "akaris-options": { "mastery": "sap" }
          }
        }]);

        console.debug(`✅ [Sap] ${targetToken.name} now has disadvantage on their next attack.`);
      }
      
    }
  });


});

Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {

  console.log(" Graze Hook Fired.");
  const item = workflow.item;
  const actor = workflow.actor;
  const token = workflow.token;

  if (!item || item.type !== "weapon" || !item.system) {
    console.debug(`[Graze] Invalid or unsupported item.`);
    return;
  }

  const mastery = item.system.mastery?.toLowerCase?.() ?? "";
  if (mastery !== "graze") return;

  if (workflow.hitTargets.size > 0) {
    console.debug(`[Graze] Attack hit. No graze effect applied.`);
    return;
  }

  const allTargets = Array.from(workflow.targets);
  const hitTargets = Array.from(workflow.hitTargets);

  const missedTargets = allTargets.filter(t => !hitTargets.includes(t));

  console.debug(`Missed Target: ${workflow.missedTargets}`);

  console.log (`Item type pased ${item.type}.`);

  const ability = item.system.ability ?? "str";
  const mod = actor.system.abilities[ability]?.mod ?? 0;

  if (mod <= 0) {
    console.debug(`[Graze] No positive ${ability.toUpperCase()} modifier.`);
    return;
  }

  const damageType = item.system.damage?.parts?.[0]?.[1] ?? "bludgeoning";
  console.debug(`[Graze] Damage type resolved as: ${damageType}`);

  for (const targetToken of workflow.targets) {
    const damage = mod;

    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ token }),
      content: `<strong>Graze:</strong> ${actor.name} deals ${damage} ${damageType} damage to ${targetToken.name} despite missing.`
    });

    await new MidiQOL.DamageOnlyWorkflow(actor, token, item, damage, damageType, [targetToken], {
      flavor: `Graze Damage (${item.name})`,
      itemCardId: "new",
      useOther: true
    });
  }
});