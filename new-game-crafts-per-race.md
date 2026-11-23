# FED-13 RPG - Crafts, Per Race (5 Bloodlines) — FINAL

Sources:
- Trails of Cold Steel 1 Crafts: `new-game-crafts-tocs1.md` — 58 regular Crafts + 16 S-Crafts, Kiseki Wiki List of crafts (Cold Steel), GameFAQs CS1 guide.
- Trails of Cold Steel 2 Crafts: `new-game-crafts-tocs2.md` — 193 table rows, about 187 unique names, Kiseki Wiki List of crafts (Cold Steel II).
- Trails of Cold Steel 3 Crafts: `new-game-crafts-tocs3.md` — 124 on-foot entries, 96 regular + 28 S-Crafts, 25 playable characters, Kiseki Wiki List of crafts (Cold Steel III).
- Final Fantasy Tactics Advance race abilities: FFTA action abilities report, 2026-11-22 — Final Fantasy Wiki FFTA action abilities / jobs, Thonky FFTA jobs, RPGClassics NeoBlitz Ability FAQ v2.0, UPC Archive FFTA Jobs. 42 race-job slots, 34 unique jobs.

Decisions applied 2026-11-22: all 8 open decisions in the earlier draft are decided here, per Git-FED's rules (only rename if legally necessary; if we can legally use it we can use it, if we legally can't we can't). No new Craft names invented, no Craft shared across races, race exclusivity unchanged.

## Rules for this list

- 5 bloodlines only: Hybrid, Puffkin, Elderkin, Harefolk, Drakescale.
- Each race gets its own exclusive Craft set. No Craft in this file is shared across races. Shared FFTA jobs were excluded on purpose: White Mage, Black Mage, Thief, Archer, Illusionist, Time Mage are shared across races, so none of their abilities are in this list, except where a job is exclusive to one race.
- Craft pool: FFTA race/job exclusive attack A-Abilities, plus one support or recovery ability per race. That is the pool Git-FED asked for: attacks only particular characters can use.
- Gauge: Trails CP (Craft Points), not FFTA MP/AP.
  - CP is built by attacking enemies and by taking damage. CP is lost entirely if the character is K.O.'d (CS3).
  - Regular Crafts in FED-13 cost 20-50 CP, exact cost per Craft assigned below (Decision 1).
  - S-Crafts need 100+ CP. At 200 CP they are stronger: x1.5 damage in CS2, about 50% more damage in CS1 guides. S-Crafts consume all CP.
  - S-Break: at 100+ CP, use an S-Craft at any time, interrupting turn order, still consuming the CP. CS2: afterward the user suffers only the S-Craft's normal delay (40 AT).
  - Max CP is 200 (CS2/CS3).
- FFTA AP and MP, and how they map to FED-13:
  - AP (Ability Points) in FFTA is LEARN cost only, not use cost. Equip the named weapon/armor/accessory, earn AP in battles / dispatch missions, master the ability at 100 / 200 / 300 / 999 AP. AP is not spent to use the ability in battle. That stays as the learn cost in FED-13.
  - MP in FFTA is USE cost in FFTA. In FED-13, use cost is CP, not MP. Do not use FFTA MP values as FED-13 costs. MP per ability was verified only for Gladiator in the FFTA report (Rush / Wild Swing / Beatdown / Blitz = no MP, Fire / Bolt / Ice Sword = 10 MP, Ultima Sword = 60 MP). MP for all other jobs in this file is UNVERIFIED, and is not used.
- Upgrade tiers (Decision 2, decided): one level per tier for all races, following the CS2 pattern (Lv 46-114).
  - True version: Lv 46
  - EX version: Lv 81
  - 2 version: Lv 114
  - Same levels for every race and every base Craft. No per-Craft levels.
- S-Crafts: 2 per race. S-Craft 1 is the race's 999 AP Ultima-tier ability, verified in FFTA for every race. S-Craft 2 is a FED-13 promotion of a strong verified attack from the same race, unlocked late. It is labelled as a promotion, not a source S-Craft, because FFTA has no S-Crafts.
- Core Shard / Lattice (Decision 7, decided, confirmed): character-only, stays. Quartz / The Lattice system is for the CHARACTER, not Bondkin, per Git-FED 2026-11-22 ~09:41 EST. No Bondkin in this file gets a Core Shard affinity Craft. No Core Shard swap Craft is listed for any race.
- U-Material (Decision 6, decided): U-Material does NOT apply to learning or upgrading Crafts. In Trails, U-Material upgrades quartz (to R / SR) and weapons. That is character quartz and character weapons only, per Git-FED 2026-11-22 ~10:31 EST. No U-Material cost for learning or upgrading any Craft in this file.
- Not in this list: Brave Orders (BP, not CP, CS3 only, not Crafts), EX Arts (mech battles only, Git-FED dropped mech battles), Valimar / Panzer Soldat Finishers (BP, mech only), Totem Spirit (guardian move, separate from Crafts, see note per race), Morpher / Soul morph (separate system, Hunter captures a Feral, it goes to The Bank, it drops a Soul, a Morpher-type Bondkin equips the Soul and morphs into that monster type in battle).
- HP-for-CP and EP summon exceptions in Trails (Gaius Wild Rage, Agate Wild Rage, Rean Awakener's Call 500 EP) belong to those Trails characters. They are NOT copied into this per-race list. No Craft in this file drains HP or EP instead of CP.
- Effects marked UNVERIFIED in this file mean the name / AP / weapon are verified in the FFTA report, but the effect was not in the sources read. Do not present those effects as fact. Swarmstrike is the one exception, see Decision 5 below.

## Totals

| Race | Bloodline | Base Crafts | S-Crafts | Total |
|---|---|---|---|---|
| Hybrid | Human | 4 | 2 | 6 |
| Puffkin | Moogle | 4 | 2 | 6 |
| Elderkin | Nu Mou | 4 | 2 | 6 |
| Harefolk | Viera | 4 | 2 | 6 |
| Drakescale | Bangaa | 4 | 2 | 6 |
| **Total** | **5 bloodlines** | **20** | **10** | **30** |

No Craft name appears in more than one race section. Count is 30 distinct Craft names.

## 1. Hybrid (Human) — 6 Crafts

FFTA jobs, Human only: Soldier, Paladin, Fighter, Ninja, Hunter, Blue Mage. Shared jobs excluded: Thief, Archer, White Mage, Black Mage, Illusionist.
Totem Spirit: Mateus, uses all JP in FFTA, massive HP damage to all enemies. Totem is a guardian move in FED-13, not a Craft in this list.

### Base Crafts, 4

1. Rush — 20 CP. Fighter, Fighter Tech, 100 AP, Sweep Blade. Attack. Damage + push back target. Verified.
2. Wild Swing — 30 CP. Fighter, Fighter Tech, 200 AP, Ogun Blade. Attack. Damage all adjacent units. Verified.
3. First Aid — 30 CP. Soldier, Battle Tech, 100 AP, Shortsword. Recovery. Cure HP and status. Verified. This is the race's recovery Craft.
4. Throw — 20 CP. Ninja, Ninja Skill, 100 AP, Ninja Knife. Attack. Throw weapon, damage. Verified. Ninja requires 2 Thief A-Abilities in FFTA; that requirement is FFTA job unlock, not a FED-13 Craft cost.

### S-Crafts, 2 — 100+ CP, consume all CP, stronger at 200 CP

1. Ultima Shot — Hunter, Hunt, 999 AP, Seventh Heaven. S-Craft 1. Attack. Effect UNVERIFIED in sources read beyond name / AP / weapon. Hunter requires 2 Archer A-Abilities in FFTA.
2. Saint Cross — Paladin, Chivalry, 300 AP, Arch Sword. S-Craft 2, late unlock, FED-13 promotion, kept per Decision 3. Attack. Holy damage, cross-shaped area. Verified. Paladin requires 2 Soldier A-Abilities in FFTA.

### Upgrades

Each base Craft gains a True version at Lv 46, an EX version at Lv 81, and a 2 version at Lv 114. Same levels for all races.

## 2. Puffkin (Moogle) — 6 Crafts

FFTA jobs, Moogle only: Animist, Mog Knight, Gunner, Juggler, Gadgeteer. Shared jobs excluded: Thief, Black Mage, White Mage, Time Mage.
Totem Spirit: Famfrit, uses all JP in FFTA, massive HP damage to all enemies. Totem is a guardian move in FED-13, not a Craft in this list.

### Base Crafts, 4

1. Mog Attack — 20 CP. Mog Knight, Charge, 100 AP, Flametongue. Attack. Attack. Verified. Mog Knight requires 1 Animist A-Ability in FFTA.
2. Fireshot — 20 CP. Gunner, Gunmanship, 100 AP, Aiot Gun. Attack. Fire damage shot. Verified. Gunner requires 1 Animist A-Ability in FFTA.
3. Cuisine — 40 CP. Animist, Call, 300 AP, Heal Chime. Recovery. Completely recover HP on adjacent target. Verified. This is the race's recovery Craft.
4. Gil Toss — 20 CP. Juggler, Stunt, 100 AP, Jack Knife. Attack. Throw gil, damage. Verified. Juggler requires 2 Thief (Moogle) A-Abilities in FFTA.

### S-Crafts, 2 — 100+ CP, consume all CP, stronger at 200 CP

1. Ultima Charge — Mog Knight, Charge, 999 AP, Materia Blade. S-Craft 1. Attack. Ultima attack. Verified.
2. Chocobo Rush — Animist, Call, 300 AP, Satyr Flute. S-Craft 2, late unlock, FED-13 promotion, kept per Decision 3. Attack. Chocobo stampede, damage target. Verified.

### Upgrades

Each base Craft gains a True version at Lv 46, an EX version at Lv 81, and a 2 version at Lv 114. Same levels for all races.

## 3. Elderkin (Nu Mou) — 6 Crafts

FFTA jobs, Nu Mou only: Beastmaster, Morpher, Sage, Alchemist. Shared jobs excluded: White Mage, Black Mage, Illusionist, Time Mage.
Totem Spirit: Ultima, uses all JP in FFTA, massive MP damage to all enemies. Totem is a guardian move in FED-13, not a Craft in this list.

### Base Crafts, 4

1. Drain — 20 CP. Sage, Sagacity Skill, 100 AP, Energy Mace. Attack. Drain HP from target. Verified. Sage requires 2 Beastmaster + 3 White Mage A-Abilities in FFTA.
2. Water — 30 CP. Sage, Sagacity Skill, 200 AP, Battle Mace. Attack. Water damage. Verified.
3. Control — 40 CP. Beastmaster, Control, 200 AP, instrument (see note). Support. Control a monster for a turn; controlled enemy acts on its turn while Beastmaster lives. Verified. This is the race's support Craft. Control covers 13 types in FFTA: Goblin, Flan, Bomb, Dragon, Lamia, Bug, Tonberry, Panther, Malboro, Floateye, Undead, Fairy, Rockbeast. Instruments teach overlapping types in the sources (for example Flan from Demon Bell and Glass Bell), so do not present a 1-to-1 instrument list as settled. Control is one Craft entry here, not 13 separate Crafts.
4. Flare — 40 CP. Alchemist, Alchemy Tech, 300 AP, Lotus Mace. Attack. Heavy damage, solar explosion. Verified. Alchemist requires 3 White Mage + 5 Black Mage A-Abilities in FFTA.

### S-Crafts, 2 — 100+ CP, consume all CP, stronger at 200 CP

1. Ultima Blow — Sage, Sagacity Skill, 999 AP, Zeus Mace. S-Craft 1. Attack. Ultima attack. Verified.
2. Giga Flare — Sage, Sagacity Skill, 300 AP, Lotus Mace. S-Craft 2, late unlock, FED-13 promotion, kept per Decision 3. Attack. Heavy damage. Verified.

### Upgrades

Each base Craft gains a True version at Lv 46, an EX version at Lv 81, and a 2 version at Lv 114. Same levels for all races.
Note: Morpher is a Nu Mou job, but Morph is not listed as a base Craft here. Morpher / Soul morph is a separate system in FED-13, not a Craft. Beastmaster Control is the support Craft for this race, not Morpher.

## 4. Harefolk (Viera) — 6 Crafts

FFTA jobs, Viera only: Fencer, Elementalist, Red Mage, Summoner, Sniper, Assassin. Viera is the only race with a tertiary tier (Assassin, Summoner). Shared jobs excluded: Archer, White Mage.
Totem Spirit: Exodus, uses all JP in FFTA, massive MP damage to all enemies. Totem is a guardian move in FED-13, not a Craft in this list.

### Base Crafts, 4

1. Swarmstrike — 20 CP. Fencer, Lunge Tech, 100 AP, Stinger. Attack. FED-13 defined effect (Decision 5, kept): quick lunging sword strike, damage to a single target. This effect is FED-13 defined, NOT FFTA verified — the FFTA report marks Fencer effects UNVERIFIED beyond "quick, lunging sword attacks" / name / AP / weapon.
2. Fire Whip — 20 CP. Elementalist, Spirit Magic, 100 AP, Scarlette. Attack. Fire damage. Verified. Elementalist requires 1 Fencer + 1 White Mage A-Ability in FFTA.
3. Cure — 30 CP. Red Mage, Red Magic, 100 AP, Fleuret. Recovery. Heal. Verified. This is the race's recovery Craft. Red Mage is Viera only in FFTA, requires 1 Fencer A-Ability. Do not confuse this with White Mage Cure, which is shared and excluded.
4. Doubleshot — 40 CP. Sniper, Sharpshoot, 300 AP, Twin Bow. Attack. Shoot twice. Verified. Sniper requires 2 Archer A-Abilities in FFTA.

### S-Crafts, 2 — 100+ CP, consume all CP, stronger at 200 CP

1. Ultima Masher — Assassin, Corner, 999 AP, Zanmato. S-Craft 1. Attack. Ultima attack. Verified. Assassin requires 1 Sniper + 2 Elementalist A-Abilities in FFTA, tertiary tier.
2. Last Breath — Assassin, Corner, 300 AP, Petalchaser. S-Craft 2, late unlock, FED-13 promotion, kept per Decision 3. Attack. Instant KO, "ability to instantly KO an enemy" per Thonky. Verified.

### Upgrades

Each base Craft gains a True version at Lv 46, an EX version at Lv 81, and a 2 version at Lv 114. Same levels for all races.
Note: Summoner is Viera only, tertiary, with 8 summons (Ifrit, Ramuh, Kirin, Unicorn, Shiva, Carbuncle, Madeen, Phoenix). Summoner as a full job was flagged wild for a Pokemon-like game in the FFTA report; Totem Spirit is the guardian move instead. No Summoner summon is listed as a Craft here.

## 5. Drakescale (Bangaa) — 6 Crafts

FFTA jobs, Bangaa only, all 7 exclusive: Warrior, Dragoon, Defender, Gladiator, White Monk, Bishop, Templar. No shared jobs.
Totem Spirit: Adrammelech (Decision 8, decided: use Adrammelech, the spelling on most FF Wiki pages; Adrammalech appears in RPGClassics / FF Wiki action list), uses all JP in FFTA, massive HP damage to all enemies. Totem is a guardian move in FED-13, not a Craft in this list.

### Base Crafts, 4

1. Jump — 20 CP. Dragoon, Dragon Tech, 100 AP, Javelin. Attack. Jump attack, requires spear. Verified. Dragoon requires 2 Warrior A-Abilities in FFTA.
2. Fire Breath — 40 CP. Dragoon, Dragon Tech, 300 AP, Lava Spear. Attack. Fire breath damage. Verified.
3. Revive — 40 CP. White Monk, Monk Tech, 300 AP, Survivor. Recovery. Revive ally. Verified. This is the race's recovery Craft. Replaces Chakra per Decision 4: Chakra's effect was UNVERIFIED in the FFTA report, Revive is verified. Chakra is NOT in this list.
4. Body Slam — 40 CP. Warrior, Battle Tech, 300 AP, Striborg. Attack. Body slam damage. Verified.

### S-Crafts, 2 — 100+ CP, consume all CP, stronger at 200 CP

1. Ultima Sword — Gladiator, Spellblade Tech, 999 AP, Materia Blade. S-Craft 1. Attack. Mageblade attack born from ultima magic. Verified. Gladiator is the only job with a verified MP column in the FFTA report: Ultima Sword 60 MP in FFTA, which is NOT used in FED-13, use cost is CP 100+ in FED-13. Gladiator requires 2 Warrior A-Abilities in FFTA.
2. Wyrmkiller — Dragoon, Dragon Tech, 300 AP, Blood Sword. S-Craft 2, late unlock, FED-13 promotion, kept per Decision 3. Attack. Dragon-killer damage. Verified.

### Upgrades

Each base Craft gains a True version at Lv 46, an EX version at Lv 81, and a 2 version at Lv 114. Same levels for all races.

## What was excluded, and why

- Shared FFTA jobs: White Mage, Black Mage, Thief, Archer, Illusionist, Time Mage. Their abilities are shared across races, so they cannot be race-exclusive Crafts. Blue Mage is Human only, but its abilities are learned differently (equip Learning, have a monster use the ability on the unit, no weapon teaches the A-Abilities themselves), AP / MP per Blue Magic ability UNVERIFIED, so no Blue Mage ability is in this list.
- Gadgeteer Pandora (Puffkin): random target, sun = allies affected, moon = enemies affected, can hurt or help own team. Excluded from the base 4, because it is random-target, not a reliable race Craft. It remains a Puffkin job ability in FFTA, not a FED-13 Craft here.
- Beastmaster Control instruments: overlapping / confusing in sources, same ability from multiple instruments. Control is listed once, with the 13 types named, no 1-to-1 instrument mapping claimed.
- Movement abilities: FFTA (GBA) has no separate Movement ability slot / list in the sources read. Jobs list Move / Jump as stats. Do not invent a Movement Craft list. If FED-13 needs Movement Crafts, that is a FED-13 invention, not an FFTA pull.
- Special / secret jobs: Judgemaster, Hermetic, Runeseeker, Biskmatar. In FED-13 these are recorded as special/secret jobs as evolutions (Git-FED 2026-11-22 ~07:35 EST), not as base race Crafts. AP / weapon for these is UNVERIFIED in the FFTA report.
- Trails character Crafts: Rean, Alisa, Elliot, Laura, Machias, Emma, Jusis, Fie, Gaius, Millium, Crow, Sara, Angelica, Juna, Kurt, Altina, Musse, Ash, and the rest in CS1/CS2/CS3 are character-specific, not race-specific. Their CP costs, levels, and effects are in `new-game-crafts-tocs1.md`, `new-game-crafts-tocs2.md`, and `new-game-crafts-tocs3.md`. They were used only for the gauge, upgrade, and S-Craft pattern in this file, not copied as race Crafts. No Trails Craft name appears as a race Craft here.

## Decisions Decided — all 8, 2026-11-22

1. Exact CP cost per Craft: assigned, 20-50 CP base, S-Crafts 100+ CP, stronger at 200 CP. Hybrid: Rush 20, Wild Swing 30, First Aid 30, Throw 20. Puffkin: Mog Attack 20, Fireshot 20, Cuisine 40, Gil Toss 20. Elderkin: Drain 20, Water 30, Control 40, Flare 40. Harefolk: Swarmstrike 20, Fire Whip 20, Cure 30, Doubleshot 40. Drakescale: Jump 20, Fire Breath 40, Revive 40, Body Slam 40.
2. Upgrade unlock levels: one level per tier for all races. True Lv 46, EX Lv 81, 2 Lv 114, following the CS2 pattern (Lv 46-114).
3. S-Craft 2 names kept: Saint Cross, Chocobo Rush, Giga Flare, Last Breath, Wyrmkiller. All 5 kept, FED-13 promotions, unlocked late.
4. Chakra replaced with Revive for Drakescale recovery: Revive, White Monk, 300 AP, Survivor, revive ally, verified. Chakra removed, its effect was UNVERIFIED.
5. Swarmstrike kept: effect is FED-13 defined, not FFTA verified — quick lunging sword strike, damage to a single target. Flagged as FED-13 defined in the Harefolk section.
6. U-Material does NOT apply to learning or upgrading Crafts. It is only for character quartz (to R / SR) and character weapons. No U-Material cost for any Craft in this file.
7. Core Shard character-only, confirmed, stays. No Bondkin Core Shard affinity Craft.
8. Totem spelling: Adrammelech. Most FF Wiki pages use Adrammelech; Adrammalech appears in RPGClassics / FF Wiki action list.

## Sources

- `new-game-crafts-tocs1.md` (CS1, 76 entries)
- `new-game-crafts-tocs2.md` (CS2, about 187 unique names)
- `new-game-crafts-tocs3.md` (CS3, 124 on-foot entries)
- FFTA race abilities report, 2026-11-22 (42 race-job slots, 34 unique jobs, AP / weapon from RPGClassics / UPC, effects where stated)
- MEMORY.md, U-Material rule 2026-11-22 ~10:31 EST, Quartz for character 2026-11-22 ~09:41 EST, Craft skills for the 5 races 2026-11-22 ~09:58 EST
