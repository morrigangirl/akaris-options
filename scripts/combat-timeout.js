Hooks.on("ready", () => {
  console.log("🐺 Turn Timeout Script Initialized");

  const TURN_TIMEOUT = 30000; // 30 seconds
  const PEBBLE_NAME = "Fighter Woman";

  const SNARKY_GHOST_MESSAGES = [
    "Your ancestors sigh in ancestral disappointment.",
    "The spirits of your lineage facepalm in unison.",
    "A thousand generations of warriors just disowned you.",
    "Even your great-grandmother, the baker, is judging you.",
    "The family ghosts are drafting a new will—you're out.",
    "Your forebears are shaking their ethereal heads.",
    "A proud heritage, squandered in hesitation.",
    "You’re one 'um' away from being a cautionary tale.",
    "The ancestors whisper: 'Seriously?'",
    "Somewhere, your bloodline just took psychic damage."
  ];

  Hooks.on("updateCombat", async (combat, changed, options, userId) => {
    console.log("⚔️ Combat Updated");
    if (!changed.hasOwnProperty("turn")) return;

    const currentCombatant = combat.combatant;
    if (!currentCombatant) return;

    const token = canvas.tokens.get(currentCombatant.tokenId);
    if (!token) return;

    

    const actor = token.actor;
    const actorname = actor.name;
    if (!(actor.type === "character")) return;
    console.log(`✅ ${actorname} turn detected.`);

    let recipientUser = game.users.find(u => u.character?.id === actor.id && u.active);



    // Fallback to GM if Pebble has no user assigned or they’re offline
    if (!recipientUser) {
      console.warn("⚠️ No active user associated with Pebble. Defaulting to first active GM.");
      recipientUser = game.users.find(u => u.isGM && u.active);
    }

    if (!recipientUser) {
      console.error("❌ No valid recipient found (no active User or GM user). Aborting dialog.");
      return;
    }

    ui.notifications.info(`${actorname} has 30 seconds to act.`);

    // Show Dialog
    let remainingTime = TURN_TIMEOUT / 1000;
    const dialogId = `pebble-timeout-${Date.now()}`;
    let userClosed = false;

    const dialog = new Dialog({
      title: `🐺 Your Turn, ${actorname}`,
      content: `<p>You have <strong id="pebble-countdown">${remainingTime}</strong> seconds to act.</p>`,
      buttons: {
        ok: {
          label: "I'm Acting!",
          callback: () => {
            console.log("✅ Pebble clicked 'I'm Acting!'");
            clearInterval(countdown);
            clearTimeout(timerId);
            userClosed = true;
          }
        }
      },
      close: () => {
        console.log("🔒 Dialog closed.");
      }
    }, {
      id: dialogId,
      width: 300
    });

    dialog.render(true, { userId: recipientUser.id });

    // Countdown display
    const countdown = setInterval(() => {
      remainingTime--;
      const countdownEl = document.getElementById("pebble-countdown");
      if (countdownEl) countdownEl.textContent = remainingTime;
    }, 1000);

    // Timeout
    const timerId = setTimeout(async () => {
      clearInterval(countdown);
      dialog.close();

      const stillPebble = combat.turns[combat.turn]?.tokenId === token.id;
      if (!stillPebble) {
        console.log("🔄 Turn changed before timer ended.");
        return;
      }

      if (!userClosed) {
        console.log("⏰ Pebble failed to act. Auto-skipping turn.");

        const ghostMessage = SNARKY_GHOST_MESSAGES[Math.floor(Math.random() * SNARKY_GHOST_MESSAGES.length)];

        await ChatMessage.create({
          content: `<strong style="color: #c92a2a;">${actorname} loses their edge. Move on. Delay action.</strong><br><em style="color: #666;">${ghostMessage}</em>`,
          speaker: { alias: PEBBLE_NAME }
        });

        await combat.nextTurn(); // Skip her turn
      }
    }, TURN_TIMEOUT);
  });
});