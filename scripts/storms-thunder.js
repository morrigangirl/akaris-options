Hooks.once("ready", () => {
  console.log("⚡ Storm's Thunder Reaction Hook Initialized");

  Hooks.on("midi-qol.DamageApplied", async (workflow) => {
    console.log("🔁 [Hook Fired] midi-qol.DamageApplied");

    // Validate workflow object
    if (!workflow) {
      console.log("❌ No workflow provided. Exiting.");
      return;
    }

    const actor = workflow.actor;
    const targetToken = workflow.token;
    const item = workflow.item;

    if (!actor || !targetToken || !item) {
      console.log("❌ Missing actor, token, or item. Exiting.");
      return;
    }

    console.log(`🎭 Actor: ${actor.name}`);
    console.log(`📦 Item Used: ${item.name}`);
    console.log(`🛠️ Action Type: ${item.system?.actionType}`);

    // Only trigger on melee weapon attacks
    if (item.system.actionType !== "mwak") {
      console.log("❌ Not a melee weapon attack. Exiting.");
      return;
    }

    // Look for Storm’s Thunder feature on the defender
    const stormsThunderItem = actor.items.find(i => i.name === "Storm's Thunder");
    if (!stormsThunderItem) {
      console.log("❌ Storm's Thunder feature not found on actor.");
      return;
    }

    console.log("✅ Storm's Thunder feature found.");

    // Check if there are uses left
    const uses = stormsThunderItem.system.uses;
    if (!uses || uses.value <= 0) {
      console.log("❌ No uses left for Storm's Thunder.");
      return;
    }

    console.log(`🔋 Uses Remaining: ${uses.value}/${uses.max}`);

    // Find the attacker token (based on attackerUuid if available)
    const attackerUuid = workflow?.attackerUuid;
    if (!attackerUuid) {
      console.log("❌ No attacker UUID found. Exiting.");
      return;
    }

    const attackerToken = await fromUuid(attackerUuid);
    if (!attackerToken || !attackerToken.isToken) {
      console.log("❌ Could not resolve attacker token from UUID:", attackerUuid);
      return;
    }

    console.log(`🎯 Attacker Token: ${attackerToken.name}`);

    // Measure distance
    const distance = canvas.grid.measureDistance(targetToken, attackerToken);
    console.log(`📏 Distance to attacker: ${distance}ft`);

    if (distance > 60) {
      console.log("❌ Attacker is out of range (over 60ft). Exiting.");
      return;
    }

    // Prompt the player for confirmation
    console.log("📣 Prompting player for Storm's Thunder reaction...");
    const useReaction = await Dialog.confirm({
      title: "Storm's Thunder",
      content: `<p>Use your Reaction to deal <strong>1d8 Thunder damage</strong> to <strong>${attackerToken.name}</strong>?</p>`,
      yes: () => true,
      no: () => false
    });

    if (!useReaction) {
      console.log("⛔ Player declined to use Storm's Thunder.");
      return;
    }

    console.log("✅ Player confirmed Storm's Thunder reaction.");

    // Roll thunder damage
    const damageRoll = await new Roll("1d8").roll({ async: true });
    await game.dice3d?.showForRoll?.(damageRoll);

    console.log(`🎲 Damage Rolled: ${damageRoll.total} thunder`);

    // Apply bonus damage to attacker
    console.log("🚀 Applying thunder damage to attacker with DamageOnlyWorkflow...");
    new MidiQOL.DamageOnlyWorkflow(
      actor,                      // source actor
      targetToken,                // source token
      damageRoll.total,           // damage total
      "thunder",                  // damage type
      [attackerToken],            // targets
      damageRoll,                 // damage roll
      {
        flavor: `${actor.name} retaliates with Storm’s Thunder!`,
        itemCardId: "new",
        damageRoll,
        isReaction: true
      }
    );

    // Spend 1 use
    console.log("🧮 Reducing Storm's Thunder uses by 1.");
    await stormsThunderItem.update({ "system.uses.value": uses.value - 1 });

    console.log("✅ Storm’s Thunder Reaction Completed.");
  });
});