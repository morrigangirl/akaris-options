console.log("🔥 Flame Cloak Module: Loaded");

Hooks.once("ready", () => {
  console.log("🔥 Flame Cloak: Hook registered for dnd5e.rollDamage");

  Hooks.on("dnd5e.rollDamage", async (item, roll) => {
    console.log("🔥 Flame Cloak Hook Triggered", { item, roll });

    // Only trigger for melee weapon attacks
    const isMelee = item?.system?.actionType === "mwak";
    if (!isMelee) {
      console.log("🔥 Flame Cloak: Not a melee weapon attack. Skipping.");
      return;
    }

    const attackerToken = item.parent.getActiveTokens()[0];
    if (!attackerToken) {
      console.warn("🔥 Flame Cloak: No attacker token found.");
      return;
    }

    const targets = Array.from(game.user.targets);
    if (targets.length === 0) {
      console.warn("🔥 Flame Cloak: No targets found.");
      return;
    }

    for (const target of targets) {
      const targetActor = target.actor;
      const flagValue = targetActor?.flags?.["midi-qol"]?.flameCloak;

      if (!flagValue == true) {
        console.log(`🔥 Flame Cloak: ${target.name} does NOT have the flameCloak flag active.`);
        continue;
      }

      console.log(`🔥 Flame Cloak: Retaliating against ${attackerToken.name} for attacking ${target.name} with a melee weapon.`);

      let damageRoll = await new Roll("1d6").roll();
      await game.dice3d?.showForRoll(damageRoll);
      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        flavor: `${target.name}'s Flame Cloak scorches ${attackerToken.name}!`,
      });
      
      new MidiQOL.DamageOnlyWorkflow(
        targetActor,
        target,
        damageRoll.total,
        "fire",
        [attackerToken],
        damageRoll,
        {
          flavor: `${target.name}'s Flame Cloak scorches ${attackerToken.name}!`,
          itemCardId: item?.uuid || null,
          itemData: item,
          isCritical: false
        }
      );

    /*
      const damageRoll = await new Roll("1d6").roll({ async: true });
      await game.dice3d?.showForRoll(damageRoll);

      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        flavor: `${target.name}'s Flame Cloak scorches ${attackerToken.name}!`,
      });

      if (typeof attackerToken.actor.applyDamage === "function") {
        await attackerToken.actor.applyDamage(damageRoll.total);
      } else {
        console.warn("🔥 Flame Cloak: applyDamage() not available on attacker actor.");
      }
      */
    }
  });
});