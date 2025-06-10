# 🌟 Akari's Options

**Akari's Options** is a utility module for FoundryVTT that adds high-quality, automated support for various D&D 5e (2024 Rules) character features and item-based reactions. It is designed for GMs and players who want immersive, rules-compliant automation without the overhead of macro maintenance.

---

## ✨ Features

This module includes prebuilt automation for the following mechanics:

### 🔥 Flame Cloak (Custom Effect)
- **Trigger:** When a creature hits the cloaked target with a melee weapon attack.
- **Effect:** Deals `1d6 fire` damage to the attacker automatically.
- **Requirements:** `flags.midi-qol.flameCloak = true` must be set on the target actor.

---

### ⚡ Storm’s Thunder (2024 Fighter Feature)
- **Trigger:** When the character takes damage from a creature within 60 feet.
- **Effect:** Prompts the player to use a Reaction to deal `1d8 thunder` damage to the attacker.
- **Use Consumption:** Automatically decrements the feature's available uses.
- **Range Check:** Enforced (60 ft).
- **Prompt:** Appears only to the owning user of the affected character.

---

### 🛡️ Holy Avenger (Magic Weapon Bonus)
- **Trigger:** When an Undead or Fiend is hit with a weapon attack from a weapon that has an active effect called "Holy Avenger".
- **Effect:** Deals `2d10 radiant` bonus damage automatically.

---

### 🔥 Create Bonfire (Spell Automation)
- **Prompt:** Spell use allows tile placement via active tile triggers (Monk's Active Tile Triggers required).
- **Effect:** A 5-foot tile is created which:
  - Deals `1d8 fire` to creatures ending their turn or entering it.
  - Makes a DEX save (DC 10) via Monk's Token Bar.
- **Auto Cleanup:** Tile is deleted when concentration ends.

---

### 🌟 2024 Human Inspiration (Long Rest Bonus)
- **Trigger:** When a 2024 Human completes a long rest.
- **Effect:** Automatically grants Heroic Inspiration (if they don’t already have it).
- **Condition:** Only applies to race items named `"Human"` with `rules: "2024"` in their source.

---

## 🔧 Dependencies

This module relies on the following FoundryVTT packages:

| Package              | Purpose                         |
|----------------------|----------------------------------|
| `dnd5e` v4.4.x       | D&D 5e 2024 ruleset support      |
| `midi-qol` ≥ 12.4.0  | Automation of damage workflows   |
| `socketlib`          | User-specific reaction prompts   |
| `dae` (optional)     | Enhanced effect tracking         |
| `monks-active-tiles` | Used for Create Bonfire triggers |

---

## 💻 Installation

1. Clone or download the repository.
2. Zip the contents (excluding hidden files).
3. Host the zipped file or upload to FoundryVTT.
4. Add the manifest URL to your Foundry installation.
5. Enable the module in your world.

---

## ⚙️ Usage Notes

- Some features require **player targeting** (e.g., Flame Cloak and Storm's Thunder).
- Ensure player tokens are selected or targeted appropriately for triggers to work.
- You can extend this module easily with your own automation hooks.

---

## 📦 GitHub Releases

The latest release is always available at: https://github.com/morrigangirl/akaris-options/releases/latest/download/module.json

> Replace `your-username` with your actual GitHub username.

---

## 🙋 Contribution

This module is open to contributions. Please:
- Follow the existing coding style.
- Add documentation to new features.
- Submit a PR or open an issue to discuss major features.

---

## 📄 License

This module is licensed under the **MIT License**. Do whatever you want—just don’t blame me if it breaks something.