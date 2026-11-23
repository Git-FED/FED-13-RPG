# FED-13 RPG - Update

Updated 2026-11-23 ~10:07 EST.

## The game in one paragraph

FED-13 RPG. FED for Git-FED, 13 for The Thirteen. Sources: Pokemon (heavy base, all games and hack ROMs), Kingdom Hearts 2, Trails of Cold Steel 3, Undawn survival, Final Fantasy Tactics Advance. Mankind, Bondkin, and Beast are 100 percent separate. Mankind is the player and trainer. Bondkin is the partner creature and starter. Beasts are Feral, wild, catchable, the Pokemon side. 13 worlds, one member of The Thirteen per world, beat the member to unlock the next world. Elite Four and Hall of Fame after all 13. Currency is the Crest, symbol Cr, wallet cap 999,999 Cr. Caps: Mankind 150, Bondkin 200. Graphics Level 3, 256x256 HD 2D, FFTA2 DS look, 4 directional sprites plus battle front and back per sprite. Design only, no game build. Git-FED makes all art and animations himself from the prompts.

## What changed today, 2026-11-23

- Young and elder titles named for the 9 other Bondkin bloodlines. 18 titles in prompts 704-712 and 718-726. 0 "not decided yet" left in the prompt file.
- Wayfinder Relief added. Anti-stuck quests and missions on the 3 guild boards, 8 quest types, rewards matched to the shop tiers. Sell items back at 50 percent. At 0 Cr a free Emergency Relief errand gives the exact item needed plus 100 Cr.
- Selling Beasts at The Bank added. Broker Voss buys Beasts, only Uncommon and up. Common cannot be sold. Price scales with stage, level, Hollow or Echo, and fusion. Sold is gone forever, daily cap 3.
- Turf battles added. 39 turf areas, 3 per world, 6v6 Bondkin grid battles. A world joins your clan's turf at 3 of 3, paying up to 8,450 Cr a day. All 13 rival clans are affiliated with Thirteen members, so turf fights introduce the shadowy organization early.
- Pronoun choice added. Character creation asks him, her, or they instead of boy or girl. Dialogue pronouns only, no stat or story changes.
- Prompts grew 928 to 953. 25 new prompts: Broker Voss, Turf Banner, 13 clan banners, 10 Wayfinder Relief item icons.
- Three pushes to Git-FED/FED-13-RPG today. 09:02 commit 9c8a2976 (38 files, full design sync). Titles push commit ea0abf23. Prompts and new-game push commit c0ee9ade. All verified byte for byte.

## Current numbers

- new-game.md: 1,697 lines, the one design source.
- fed-13-all-prompts.md: 953 prompts.
- fed-13-effect-prompts.md: 171 prompts.
- Codex: 134 Feral Beasts, Hollow 134, Echo 134.
- Fusion: 17,956 ordered two-Beast fusions possible from 134 Beasts, each makes a new Beast species. Sprites auto-generated, he only draws the 134 base Beasts.
- Worlds: 13, 65 towns, 5 per world.
- Mankind classes: 52. Bondkin bloodlines: 14 (5 core, 9 other).
- Apex Forms: 14 Beasts. Surge Forms: 5. Totem Forms: 5 core plus 9 other bloodlines.
- Guests: 13 helpers, one per world. Pets: 12 kinds. Card game: Thirteen Crowns. Outfits: 13, one per world.
- Grovefruit: 21 types. Showcases: 5 halls, 5 categories.
- Combo attacks: Bondkin only, Link Attacks in grid battles. Fusion: Beasts only.

## Still open

- Slack #video-game push: still open, his call.
- Save period: 6h, 12h, or daily, never picked.
- 176 never-decided features: deferred out of v1, untouched.
- App unique picture per card: never finished, some cards still share pictures.
- Art and animations: his job, in progress from the 953 prompts and 171 effect prompts.
- Scepter and Megalith lean list note: needs correcting to CS2.

## File tree

```
~/workspace/your_files/
├── new-game.md
├── new-game-1-character.md
├── new-game-2-bondkin.md
├── new-game-3-monsters.md
├── new-game-bondkin-advancement.md
├── new-game-bondkin-jobs.md
├── new-game-character-classes.md
├── new-game-codex.md
├── new-game-codex-renewed.md
├── new-game-hollow-creatures.md
├── new-game-echo-creatures.md
├── new-game-evolution-system.md
├── new-game-world-themes.md
├── new-game-items.md
├── new-game-transport-items-materials.md
├── new-game-quartz-arts-items-tocs.md
├── new-game-arts-tocs1.md
├── new-game-arts-tocs2.md
├── new-game-arts-tocs3.md
├── new-game-crafts-tocs1.md
├── new-game-crafts-tocs2.md
├── new-game-crafts-tocs3.md
├── new-game-crafts-per-race.md
├── new-game-crafts-ffta-races.md
├── new-game-crafts-diff.md
├── fed-13-all-prompts.md
├── fed-13-all-prompts-v1-backup.md
├── fed-13-all-prompts-v2-backup.md
├── fed-13-effect-prompts.md
├── fed-13-combo-attacks-research.md
├── fed-13-fusion-research.md
├── fed-13-transport-professions.md
├── fed-13-elderkin-nu-mou-races.md
├── fed-13-monster-legal-renames.md
├── fed-13-game-item-list.md
├── fed-13-game-item-list-lean.md
├── fed-13-sora-skills.md
├── fed-13-unused-features.md
├── fed-13-rpg-readme.md
├── fed-13-rpg-what-it-is.md
├── fed-13-rpg-summarized.md
├── fed-13-worker-results.md
├── fed-13-whats-next.md
├── fed-13-not-resolved.md
└── fed-13-update.md
```
