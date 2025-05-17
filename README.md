# Akari's Options (FoundryVTT Module)

This module provides custom rule logic and scripting designed for Akari’s homebrew campaigns. It is not a general-use module—this code assumes certain systems, player habits, and narrative-flavored pain responses.

---

## 💡 Module Overview

- **Homebrew Scripts** for specific campaign features
- **Custom flag-driven effects** using Dynamic Active Effects (DAE)
- **Player-controlled toggles** for reactive features
- **Midi-QOL integration** for flag management and workflow hooks  
  (_Note: This module **does not** use Midi-QOL's built-in `DamageOnlyWorkflow` system_)

---

## 🔥 Flame Cloak

Flame Cloak is a reactive fire damage feature triggered when a character with the flag `flags.midi-qol.flameCloak` is hit by a **melee weapon attack**.

### Key Features:
- Automatically retaliates for **1d6 fire damage**
- Triggers via the `dnd5e.rollDamage` hook
- Bypasses resistance and immunity manually—does **not** rely on Midi-QOL’s internal logic
- Manages state with a player-facing toggle button (via macro)
- Displays an effect icon on the token when active

---

## ⚙️ Requirements

- FoundryVTT v12+
- [Midi-QOL](https://foundryvtt.com/packages/midi-qol)
  - Used for flag tracking and combat workflow hooks
- [Dynamic Active Effects (DAE)](https://foundryvtt.com/packages/dae)
  - Used for setting and tracking custom actor flags
- [Optional] Active Token Effects (ATE)
  - For icon overlays and token toggles

---

## 🧯 Notes

- Fire damage is applied manually and **always bypasses resistance and immunity**
- You must ensure the attacking actor is using **melee weapon attacks** to trigger Flame Cloak
- Flag logic (`midi-qol.flameCloak`) must be set via macro, effect, or item

---

## 👑 Author

Akari (Aoibh Wood)  
GM | Writer | Burner of the Unburnable  
Custom-built for the *Himeko* campaign setting.

---

## 🧪 Not Designed For:
- Generic use across all systems
- Combat balance or strict 5e RAW
- NPC safety

---

## 📜 License

Personal use and modification encouraged. If you share it, do it with style. If you fix it, tell me so I can take credit.
