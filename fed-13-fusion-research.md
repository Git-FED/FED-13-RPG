# FED-13 Fusion Research: Pokemon Infinite Fusion

Research compiled 2026-11-23 from the Infinite Fusion Wiki (Fandom), the Switchblade Gaming guide, the CheatCC guide, the PokeCoders guide, the EeveeExpo release thread, the TechBii guide, the RandomGenerate fusion generator page, the Prima Games generator guide, the Infinite Fusion calculator sprite progress page, and the Triple Fusions wiki page. Every claim carries its source. No art, sprites, or game files were copied. Concepts and mechanics only.

No em dashes are used in this file.

## What Pokemon Infinite Fusion is

Pokemon Infinite Fusion is a fan game developed by Schrroms, released in 2015, built on Pokemon Essentials and based on Pokemon FireRed. It is free and takes no donations. Source: CheatCC guide, introduction; Pokemon Fan Game Wiki.

Version note: sources disagree on the current version. TechBii says the current stable version is 6.7.2 (October 2025). Switchblade says its guide was verified against version 6.8 (July 2026). A sequel set in Hoenn, Infinite Fusion Hoenn, is already playable in early access (June 2026). Source: TechBii guide; Switchblade guide; Instagram post by RWNorthPole.

## 1. How fusion works, step by step

- Fusion is done with a splicer item used on two Pokemon in the player's party or box. Source: Fusion FAQs, Fusing Pokemon.
- When fusing, the player is shown previews of the resulting fusions and decides which Pokemon is the body and which is the head. If the player has not seen the fusion before, the preview is a silhouette. Pokemon that have custom sprites have a green tinted preview. Source: Fusion FAQs, Fusing Pokemon.
- Items held by either Pokemon are returned to the backpack when fusing. Source: Fusion FAQs, Fusing Pokemon.
- Pokemon with a different original trainer, such as those obtained in a trade, change their original trainer to the player after fusing. They keep the player as their original trainer even when unfused. Source: Fusion FAQs, Fusing Pokemon.
- After fusing, the player chooses a name, a nature, and a set of moves based on what either Pokemon has at the time. Source: Fusion FAQs, Name, Nature, and Moves.
- The player then chooses an ability from the two abilities the parent Pokemon had at the time of fusion. Source: Fusion FAQs, Ability.
- A fusion item can fuse two Pokemon in the party or the box. Source: Fusion FAQs, Fusing Pokemon.
- Fusions act as regular Pokemon and have their own movesets, stats, and Pokedex entries. Source: Fusion FAQs, Fusion Basics.
- Fusions are used often among trainers and can be found uncommonly in the wild, appearing as fusions of wild Pokemon found in the area. Source: Fusion FAQs, Fusion Basics.
- The resulting species cannot be fused further. A fusion Pokemon can be unfused to gain both of the base Pokemon back. Source: Fusion FAQs, Fusion Basics.

## 2. Head and body

- When two Pokemon fuse, one Pokemon becomes the head and the other becomes the body. The same pair can be fused two different ways, which can change the looks, characteristics, and strengths of the fusion drastically. Source: Fusion FAQs, Head and Body.
- The head Pokemon determines the colour palette and pattern. Source: Fusion FAQs, Head and Body.
- The head governs HP, Special Attack, and Special Defense. The body governs Attack, Defense, and Speed. Source: Switchblade guide, Quick Start; EeveeExpo thread.
- Switchblade advises deciding head and body before touching a splicer, since that single choice fixes four of the fusion's six stats and its entire typing. Source: Switchblade guide, Quick Start.
- Older rule, now changed: the EeveeExpo thread (version 3.0 era) says whichever Pokemon is the highest level will be the body, and the other will be the head and color. The current wiki says the player chooses head and body at the preview screen. The automatic level based assignment is superseded. Source: EeveeExpo thread; Fusion FAQs, Fusing Pokemon.

## 3. Exact stat formulas

- The base stats of a fused Pokemon are a weighted average with a bias toward the body Pokemon for physical stats (Attack, Defense, Speed) and a bias toward the head Pokemon for special stats (HP, Special Attack, Special Defense). Source: Fusion FAQs, Stats.
- Attack, Defense, Speed: FusionStat = floor((2 x BodyStat / 3) + (HeadStat / 3)). Source: Fusion FAQs, Stats.
- HP, Special Defense, Special Attack: FusionStat = floor((2 x HeadStat / 3) + (BodyStat / 3)). Source: Fusion FAQs, Stats.
- Worked example from Switchblade: Alakazam head (HP 55, Atk 50, Def 45, SpA 135, SpD 95, Spe 120) fused with Machamp body (HP 90, Atk 130, Def 80, SpA 65, SpD 85, Spe 55) produces HP 66, Atk 103, Def 68, SpA 111, SpD 91, Spe 76. Reversing the roles produces a completely different spread. Source: Switchblade guide, Worked Example.
- Worked example from EeveeExpo: Gyarados body with Caterpie head gives Caterdos (HP 62, Atk 93, Def 64, SpAtk 33, SpDef 47, Spd 69); Gyarados head with Caterpie body gives Gyarapie (HP 78, Atk 62, Def 50, SpAtk 47, SpDef 73, Spd 57). Source: EeveeExpo thread.

## 4. Typing rule

- Generally, the fused Pokemon has its head's primary type and its body's secondary type. If the body Pokemon has no secondary type, its primary type is used instead. Source: Fusion FAQs, Typing; Switchblade guide.
- If the head already provides the type the body would normally contribute, the body provides its primary type instead, to avoid redundancy. Example: Grimer head with Oddish body is Poison/Grass, because Oddish would normally provide Poison as the body, but Grimer already provides Poison, so Oddish instead provides its primary type, Grass. Source: Fusion FAQs, Typing.
- If the two types are the same, the fusion is single type. Source: EeveeExpo thread.
- Normal/Flying head exception: in version 6.0, only the Normal/Flying always passing on the Flying type remains true. Any Normal/Flying type passes Flying as its dominant type. Before version 6.0, several Pokemon had a dominant type that always passed to a fusion regardless of head or body position (for example Charizard always passing Fire, Gyarados always passing Water, the Gastly line always passing Ghost); version 6.0 removed that system for every species except Normal/Flying types. Source: Fusion FAQs, Typing.
- Type swaps: in versions prior to 6.0, some Pokemon had their primary and secondary types swapped and would pass the new typing to fusions. In version 6.0, some had their types reverted to the official games, while some new Pokemon have their types swapped (for example Magnemite and Magneton pass Steel/Electric in both 5.x and 6.x; Dewgong passed Ice/Water in 5.x only). Source: Fusion FAQs, Typing.

## 5. Names and Pokedex numbers

- Fusion species have their own names. The first part of the name comes from the head, and the second part comes from the body. Source: Fusion FAQs, Names and IDs.
- The Pokedex number of a fusion is (body x X) + head, where X is the current number of basic Pokemon in the Infinite Fusion Pokedex. Source: Fusion FAQs, Names and IDs.
- Since names can be the same between different fusions (the wiki notes "Nidobat" can refer to 18 different Pokemon) and the Pokedex number may change, the community rarely uses these to identify Pokemon out of game. Source: Fusion FAQs, Names and IDs.
- The community often says "Head name/Body name" to refer to a species, and (Head number.Body number) to ID it. Examples on the wiki: Chardos, a Charizard/Gyarados fusion (6.130), and Gyaraizard, a Gyarados/Charizard fusion (130.6). Source: Fusion FAQs, Names and IDs; Fusion Basics.
- RandomGenerate states the same naming rule in plainer form: the game glues the front of the head's name to the back of the body's name, which is where names like "Charsaur" and "Pikameow" come from. Source: RandomGenerate, How fusion works, Name.

## 6. Abilities

- A fusion has access to any of the abilities of the fused Pokemon. When fusing, the player is only able to choose between the two abilities that the parent Pokemon had at the time of fusion. Example: fusing Politoed with Damp and Glaceon with Snow Cloak will only show those two abilities, regardless of fusion order. Source: Fusion FAQs, Ability.
- Switchblade flags a circulating claim that Super Splicers unlock Hidden Ability selection as unsupported: the Fusion FAQ states the player can only choose between the two abilities the parents had at fusion, with no splicer tier distinction. If a Hidden Ability option is wanted, the parent needs to have that Hidden Ability equipped before fusing, regardless of which splicer is used. Source: Switchblade guide.
- Older rule, now changed: the EeveeExpo thread says a fused Pokemon can get any of the four abilities from the two base Pokemon, at random. That conflicts with the current player choice rule and is treated as superseded. Source: EeveeExpo thread; Fusion FAQs, Ability.
- CheatCC gives a narrower account: the options are the head's second Ability and the body's first Ability. This differs from the wiki. Both accounts are reported as written. Source: CheatCC guide, Building A Monster; Fusion FAQs, Ability.
- On unfusing, if the fusion was created by the player and then unfused, the head's ability is rerolled and the body keeps its original ability. If a fusion was obtained through a wild encounter or trade and then unfused, both the head and body get a random non-hidden ability. Source: Fusion FAQs, Unfusing, Ability.

## 7. Movepool

- At fusion, the player chooses a set of moves based on what either Pokemon has at the time. Source: Fusion FAQs, Name, Nature, and Moves.
- The Move Teacher found on the top floor of Pokemon Centers can teach moves from either original Pokemon. Source: Fusion FAQs, Name, Nature, and Moves.
- Fusions come with special moves that can be learned at either of two move experts, around Gym 7 and post-game respectively: the Move Expert in Knot Island and the Legendary Move Expert in Boon Island, available post-game in the Sevii Islands after using Dive to get past the boulder blocking the way. Source: Fusion FAQs, Special Fusion Moves.
- Older rule, now changed: the EeveeExpo thread says a fused Pokemon gets the full movesets of both parents, so for example Blastizard learns Hydro Pump at level 60 and then Inferno at level 62. That describes automatic combined level up learning in version 3.0, while the current wiki describes choosing moves at fusion and relearning from either parent via the Move Teacher. Source: EeveeExpo thread; Fusion FAQs, Name, Nature, and Moves.

## 8. Level, EXP, EVs, IVs, growth rate

### Fusion level

- With DNA Splicers, FusionLevel = ((HigherLevel x 2) + LowerLevel) / 3, where HigherLevel and LowerLevel are the current levels of the two Pokemon. Source: Fusion FAQs, Level.
- With Super Splicers, the highest level of the two Pokemon is used. Source: Fusion FAQs, Level.
- The Infinite Splicer uses the same weighted formula as the DNA Splicer. Worked example from Switchblade: Alakazam level 50 and Machamp level 44 give level 48 with a DNA or Infinite Splicer and level 50 with a Super Splicer. Source: Switchblade guide, The 3 Splicer Tiers.
- PokeCoders gives a simplified version: fusing a level 10 Pokemon with a level 30 Pokemon results in a level 20 Pokemon (a plain average). That conflicts with the wiki formula, which would give (60 + 10) / 3 = 23. The wiki formula is the precise one. Source: PokeCoders guide; Fusion FAQs, Level.

### EVs and IVs

- When fusing, EVs are taken from the body Pokemon. Source: Fusion FAQs, EVs and IVs.
- With DNA Splicers, an average of both Pokemon's IVs is used. With Super Splicers, the higher IV in each stat is used. Source: Fusion FAQs, EVs and IVs.
- Worked example from Switchblade, Alakazam IVs 31/20/25/31/28/31 and Machamp IVs 20/31/31/15/31/18: DNA or Infinite gives 25/25/28/23/29/24 (averaged, rounded down); Super gives 31/31/31/31/31/31. Source: Switchblade guide, The 3 Splicer Tiers.
- A fusion cannot be bred at all, so a specific IV spread must be built on the donor Pokemon first, then fused. Source: Switchblade guide; Fusion FAQs, Breeding.

### EXP gained while fused, and unfusing

- Levels on unfusing are calculated from the original experience of the Pokemon before being fused, plus the experience gained since being fused. Due to a bug, intermediate experience is only given to the head, with the body receiving no progress toward the next level. Source: Fusion FAQs, Unfusing, Experience and Level.
- Any experience gained through using Rare Candies while fused will be lost. Worked example from the wiki: two level 5 Pokemon fused, Rare Candies used to make the fusion level 55, unfused, both are level 5 again. By contrast, leveling up before fusing is kept: two level 5 Pokemon raised with Rare Candies to level 55, fused (level 53 fusion), unfused, both are level 55 again. Source: Fusion FAQs, Unfusing, Experience and Level.
- If the Pokemon were fused before the player met them, the levels of both on unfusing are 90 percent of the fusion's level if unfusing with a Super Splicer, 75 percent with a normal splicer, and 65 percent if it was obtained in a trade and a Super Splicer is not used. All levels are rounded down to whole numbers, and no intermediate experience is gained. Source: Fusion FAQs, Unfusing, Experience and Level.

### Growth rate

- The growth rate of a fusion is selected from the head or body species by a priority order: whichever growth rate has the highest priority between the head and body species is always selected. Priority order is Fast (800,000 EXP to level 100), Medium Fast (1,000,000), Medium Slow (1,059,860), Fluctuating (1,640,000), Erratic (600,000), Slow (1,250,000). Between versions 6.0 and 6.2 the priority was the reverse order of 6.4 and later; before version 6.0 the growth rate was always Medium. Source: Fusion FAQs, Growth Rate.

### Body based attributes

- Many miscellaneous things are based on the body: current health, status conditions, gender, marks, the Poke Ball, and the capture information, though the method of capture is lost when fusing. Source: Fusion FAQs, Other.

## 9. Evolution

- When fused, both halves evolve at their normal levels and/or with their normal evolution items. Source: Fusion FAQs, Evolution.
- If both halves evolve at the same level, or with the same item, the game asks which one the player wants to evolve, then the next level up or using the item again evolves the other half. Source: Fusion FAQs, Evolution.
- Worked chain from EeveeExpo: Squirtle plus Pidgey gives Squirtgey, which evolves at level 16 to Wargey, at level 18 to Wareotto, at level 36 to Blasteot. The same applies to Pokemon that evolve with stones. Trade evolutions evolve at level 40. Source: EeveeExpo thread.
- Trade evolution Pokemon (Kadabra, Haunter, Machoke, Graveler in generation 1) now evolve at level 40, and those are the only Pokemon whose evolution method was changed. Source: EeveeExpo thread.
- No page describes a distinct fused evolution species beyond the two halves evolving in sequence. Source: Fusion FAQs, Evolution; EeveeExpo thread.

## 10. Self fusion

- Two Pokemon of the same species can be fused to create a self fusion, but the resulting fusion only gains a 50 percent XP bonus and shares the same stats as the base species. Source: Fusion FAQs, Fusion Basics.
- No page gives further detail on self fusion, such as how the bonus is applied or how typing, ability, or nature are handled for a self fusion. Source: Fusion FAQs; Switchblade guide; EeveeExpo thread.

## 11. Wild fusions

- Fusions are used often among trainers and can be found uncommonly in the wild, appearing as fusions of wild Pokemon found in the area. Source: Fusion FAQs, Fusion Basics.
- When facing a wild fusion Pokemon, the catch rate is the lowest catch rate between the two Pokemon, and the experience it gives is an average of the two base Pokemon species. The base happiness when caught is based on the body Pokemon. Source: Fusion FAQs, Wild Fusion Stats.
- When fighting a wild fusion, the player's Pokemon gain a rounded down average of the EVs from both halves: EVsGained = floor((HeadEV + BodyEV) / 2). Example from the wiki: Mankey normally gives 1 Attack EV and Pikachu gives 2 Speed EVs; as a fusion, Mankey gives 0.5 Attack and Pikachu gives 1 Speed, rounded down, so the fusion gives 1 Speed EV. Source: Fusion FAQs, EVs.
- No page gives a spawn rate or encounter rate for wild fusions beyond "uncommonly." Source: Fusion FAQs; PokeCoders guide.
- PokeCoders agrees the chances are low and says catching one gives a fused Pokemon without needing DNA Splicers. Source: PokeCoders guide, Wild Fused Pokemon.

## 12. Fusion items

### DNA Splicer

- Effect: fuses two Pokemon, or unfuses when used on a fused Pokemon. Source: List of Items, Fusion Items table.
- Price: 300. Consumed after one use. Bought in any Poke Mart. Source: Fusion FAQs, Fusion Items; List of Items; CheatCC guide; PokeCoders guide.
- Also found or given: Viridian Poke Mart, Route 22, Underground Paths, Silph Co. 4F, Ecruteak City, Pinkan Island (quest). Source: List of Items, Fusion Items table.

### Super Splicer

- Effect: same as a DNA Splicer, but with benefits to the levels and stats when fusing and unfusing Pokemon. Source: List of Items, Fusion Items table.
- Price: 1,000. Consumed after one use. Bought in any Poke Mart after Gym 4 (Rainbow Badge). Source: Fusion FAQs, Fusion Items; List of Items; CheatCC guide.
- Level benefit: the fusion takes the highest level of the two Pokemon instead of the DNA Splicer weighted average. IV benefit: the higher IV in each stat is used instead of the average. Source: Fusion FAQs, Level; EVs and IVs.
- Also found or given: Celadon City, Silph Co. 10F, Celadon Hotel (quest), Crimson Hotel (quest), Route 27, Route 34 (at night). Source: List of Items, Fusion Items table.

### Infinite Splicer

- Effect: a splicer that can be used unlimited times. A regular DNA Splicer that is never consumed. It is a key item. Source: List of Items, Fusion Items table; Fusion FAQs, Fusion Items.
- Price: none; it cannot be bought from any Poke Mart. Source: List of Items, Fusion Items table; PokeCoders guide.
- Obtained: defeat the R.E.D. robot in the Cinnabar Island lab. Source: List of Items; Fusion FAQs; CheatCC guide.
- Post Elite Four upgrade: after the Elite Four, it can be upgraded to function like a Super Splicer by returning to the lab and defeating more robots. Source: List of Items, Fusion Items table.

### DNA Reverser

- Effect: switches the body and head of a fused Pokemon. Source: List of Items, Fusion Items table; Fusion FAQs, Reversing Fusions.
- Price: 300. Bought in any Poke Mart after Gym 1 (Boulder Badge). Source: Fusion FAQs, Fusion Items; List of Items; CheatCC guide.
- Also found or given: Underground Paths, Silph Co. 10F, Pinkan Island (quest). Source: List of Items, Fusion Items table.
- What reversing changes: base stats and typing change to match the new fusion, and the ability is also swapped. Traded Pokemon can be reversed. Source: Fusion FAQs, Reversing Fusions.
- Switchblade adds that reversing keeps the fusion's accumulated experience intact and is cheaper than an unfuse then refuse cycle. Source: Switchblade guide.
- Data transfer trick noted by the wiki: some Pokemon attributes and data such as gender, EVs, happiness, and catch area can be given to another Pokemon by fusing, reversing, and unfusing. Source: Fusion FAQs, Reversing Fusions.
- Conflicting source: CheatCC describes the DNA Reverser as an item that "only switches an existing fusion back to the original Pokemon." That contradicts the wiki, which says it swaps head and body and does not unfuse. The wiki account is used here; the CheatCC wording appears to be an error. Source: CheatCC guide, Fusing Process; Fusion FAQs, Reversing Fusions.

### Infinite Reverser

- Effect: same as DNA Reversers, usable unlimited times. Source: List of Items, Fusion Items table.
- Price: none listed. Obtained: defeat all robots in the Cinnabar Island lab after defeating the Elite Four. Source: List of Items, Fusion Items table.

### Fusion Incense

- Effect: makes it so that every wild Pokemon encountered is a fusion. Lasts for 50 steps. Source: List of Items, Fusion Items table.
- Price: 700. Bought in any Poke Mart after Gym 3 (Thunder Badge), and at the Safari Zone Gate. Source: List of Items, Fusion Items table.
- Also found or given: Pewter City, Underground Paths. Source: List of Items, Fusion Items table.

### Related key items that produce legendary fusions

These are not splicers, but the List of Items page ties them to fused legendary encounters:

- Dark Stone and Light Stone: used to encounter a Reshiram/Zekrom fusion. Both found in Ecruteak City. Source: List of Items, Other key items table.
- Navel Ticket: used to encounter a Ho-oh/Lugia fusion. Found on Boon Island. Source: List of Items, Other key items table.
- GS Ball: used to encounter Celebi. Obtained at any hotel after completing 50 quests. Source: List of Items, Other key items table.
- Azure Flute: used to encounter Arceus. Found in Cherrygrove City. Source: List of Items, Other key items table.
- Ice Pick: used to encounter Articuno. Found on Mt. Ember. Source: List of Items, Other key items table.
- Power Plant Key: used to encounter Zapdos. Found on Mt. Ember. Source: List of Items, Other key items table.
- Ruby: used to encounter Groudon. Found in the Ruby Chamber. Source: List of Items, Other key items table.
- Sapphire: used to encounter Kyogre. Found in the Deep Sea. Source: List of Items, Other key items table.

## 13. Unfusing

- Method: use a splicer or Super Splicer on a fused Pokemon. PokeCoders describes it as: use the same DNA Splicer, click YES when asked if you want to unfuse the Pokemon, and seconds later the Pokemon are separated. Source: Fusion FAQs, Unfusing Pokemon; PokeCoders guide.
- Result: a fusion Pokemon can be unfused to gain both of the base Pokemon back. Source: Fusion FAQs, Fusion Basics.
- Full party behavior: when unfusing with a full party, the player is given the option to send one of the resulting Pokemon to the PC. Source: Fusion FAQs, Unfusing Pokemon.
- In most cases splicers act the same as Super Splicers when unfusing, so the wiki recommends the cheaper option. The exception is the level percentages for wild and traded fusions. Source: Fusion FAQs, Unfusing Pokemon.
- Names after unfusing: Pokemon that are separated lose their given names and have their default names when separated. Source: PokeCoders guide, Other Details.
- Fused Pokemon without the player's Trainer ID, such as those obtained from Wonder Trade, cannot be unfused until postgame. Source: Fusion FAQs, Unfusing Pokemon.
- EeveeExpo adds that a traded Pokemon cannot be unfused without the upgraded DNA splicers. Source: EeveeExpo thread.

### What each half keeps or loses on unfusing

- Kept on the body, or on the head if the body is sent to the PC due to a full party: current health and status effects, held item, nature and gender, EVs and IVs, history (marks, location where the Pokemon was met, Poke Ball type), happiness. Source: Fusion FAQs, Unfusing, Other.
- The other Pokemon is given a random nature, gender, and IVs, with EVs and happiness reset. Source: Fusion FAQs, Unfusing, Other.

### Full party bugs on unfusing

- When unfusing gives a species the player has not caught before, it is not added to the Pokedex if it is sent to the PC. Source: Fusion FAQs, Full Party Bugs.
- If specifically the body is sent to the PC: no intermediate experience is given for both the head and the body; the head determines if it is shiny based on the body, and the body is no longer shiny, so shininess can be transferred and lost; the head obtains the body's ability index (first, second, or hidden) and the body's ability is randomized, so the head's hidden ability can be unlocked by locking the body's, or a hidden ability already present on the head can be lost. Source: Fusion FAQs, Full Party Bugs.

## 14. Reversing

- Reversing fusions requires using a DNA Reverser on a fused Pokemon. Reversing means to swap the order of the Pokemon in the fusion, so the body becomes the head and the head becomes the body. This can change a lot about the fusion and how it can be used. Traded Pokemon can be reversed. Source: Fusion FAQs, Reversing Fusions.
- When reversing, the base stats and typing are changed to match the new fusion. The ability will also be swapped. Source: Fusion FAQs, Reversing Fusions.
- Some Pokemon attributes and data such as gender, EVs, happiness, and catch area can be given to another Pokemon by fusing, reversing, and unfusing. Source: Fusion FAQs, Reversing Fusions.

## 15. Triple fusions

- Triple fusions are a special kind of fusion that is possible with specific legendary trios or fully-evolved starters of the same region. They have special types that combine the attributes of their three types. Source: Triple Fusions wiki page.
- During the story, the player has to fight Zapmolcuno, a fusion between Zapdos, Moltres, and Articuno that was created by Team Rocket. Source: Triple Fusions wiki page.
- Triple fusions can only be obtained in the late post-game. To unlock triple fusions, the player brings the Black Stone and White Stone to Colress at the Lake of Rage. This allows the player to catch Kyurem. After catching Kyurem, Colress can be found in Mt. Moon where Team Rocket made the first attempted triple fusion. Source: Triple Fusions wiki page.
- To obtain a specific triple fusion, the player speaks to Colress at Mt. Moon with the three required legendaries or fully-evolved starters in the party. He clones the Pokemon and the player obtains an egg containing the triple fusion. This can only be done once for each trio. Source: Triple Fusions wiki page.
- When fusing a starter trio, the egg contains the unevolved triple form, which can go through all the evolution stages. Source: Triple Fusions wiki page.
- There are 27 types built into the game. Aside from the 18 types from the official Pokemon games, 8 out of the remaining 9 types are unique types related to Triple Fusion, which are independently defined and treated as a single type in calculations. Source: Triple Fusions wiki page.
- Note: the Zapmolcuno and Paldiatina boss fights do not use the same typing listed on the page. Each part's weaknesses are the same as their standard typing, for example Electric/Flying, Fire/Flying, and Ice/Flying for Zapmolcuno. Source: Triple Fusions wiki page.
- Triple fusion stats are fixed per triple fusion, not calculated from a formula. Examples: Zapmolcuno 90 HP, 92 Atk, 92 Def, 115 SpA, 100 SpD, 92 Spe, BST 581; Kyodonquaza 102 HP, 133 Atk, 107 Def, 133 SpA, 107 SpD, 92 Spe, BST 674; Paldiatina 113 HP, 113 Atk, 113 Def, 133 SpA, 113 SpD, 93 Spe, BST 678; Regiregi 80 HP, 100 Atk, 200 Def, 100 SpA, 200 SpD, 50 Spe, BST 730; Cheninphox 88 HP, 107 Atk, 122 Def, 114 SpA, 100 SpD, 122 Spe, BST 653. Source: Triple Fusions wiki page.
- Unobtainable triple fusion: Cool Dino, found in the basement of the Goldenrod City Department Store, only exists in version 1 of the game, used only in secret fights, cannot be obtained by the player. Source: Triple Fusions wiki page.

### Obtainable triple fusions (25 sections on the wiki page)

Legendary trios: Zapmolcuno (Articuno, Moltres, Zapdos), Enraicune (Entei, Raikou, Suicune), Kyodonquaza (Kyogre, Groudon, Rayquaza), Paldiatina (Palkia, Dialga, Giratina), Zekyushiram (Reshiram, Zekrom, Kyurem), Celemewchi (Mew, Celebi, Jirachi), Deosectwo (Mewtwo, Deoxys, Genesect), Regiregi (Regice, Regirock, Registeel), Solminiatone (Solrock, Lunatone, Minior), Luvbrufisk (Luvdisc, Bruxish, Stunfisk). Source: Triple Fusions wiki page.

Starter trios, all three evolution stages: Bulbmantle, Ivymelortle, Venustoizard (Kanto); Totoritaquil, Baylavanaw, Megaligasion (Johto); Torkipcko, Gromarshken, Swamptiliken (Hoenn); Turcharlup, Prinfernotle, Torterneon (Sinnoh); Chennekie, Brailladier, Cheninphox (Kalos). Source: Triple Fusions wiki page.

Count conflict: CheatCC lists 19 triple fusions (7 legendary trios and 12 starter trios across Kanto, Johto, Hoenn, and Sinnoh). The Triple Fusions wiki page intro says the player can obtain up to 23 triple fusions, while the same page lists 25 obtainable sections. A calculator site says the fan wiki lists 25 obtainable triple fusions. The counts differ by version. Source: CheatCC guide; Triple Fusions wiki page; pokemonfusionpro.com.

## 16. Breeding

- It is not possible to breed a fusion. Source: Fusion FAQs, Breeding.
- No page describes any offspring from a fusion, because breeding a fusion cannot be done. No page states what happens if a fused Pokemon is left at the Day Care. Source: Fusion FAQs, Breeding.

## 17. Trading

- The game has an online trading and battling system to share creations and test strategy. Source: CheatCC guide, NPC Update.
- Fused Pokemon without the player's Trainer ID, such as those obtained from Wonder Trade, cannot be unfused until postgame. Source: Fusion FAQs, Unfusing Pokemon.
- Fusing a traded Pokemon changes its original trainer to the player, and it keeps the player as original trainer even when unfused. Source: Fusion FAQs, Fusing Pokemon.
- Traded Pokemon can be reversed (head and body swapped) even though they cannot be unfused before postgame. Source: Fusion FAQs, Reversing Fusions.
- Once an NPC is defeated, the player can trade with them or strike up a rematch. Source: CheatCC guide, NPC Update.
- No page in the set describes a general rule for trading a fused Pokemon to another player beyond the unfusing restriction and the original trainer change above. Source: Fusion FAQs; CheatCC guide.

## 18. Pokedex

- Fusions have their own Pokedex entries. Source: Fusion FAQs, Fusion Basics; PokeCoders guide; CheatCC guide.
- Fused Pokemon are added to the Pokedex, which PokeCoders lists as a pro of fusing. Source: PokeCoders guide, Pros and Cons.
- Fusion Pokedex number formula: (body x X) + head, where X is the current number of basic Pokemon in the Infinite Fusion Pokedex. Source: Fusion FAQs, Names and IDs.
- Identification: names can be the same between different fusions and the Pokedex number may change, so the community rarely uses these to identify Pokemon out of game. The community says "Head name/Body name" to refer to a species, and (Head number.Body number) to ID it. Source: Fusion FAQs, Names and IDs.
- Pokedex and unfusing bug: when unfusing gives a species the player has not caught before, it is not added to the Pokedex if it is sent to the PC. Source: Fusion FAQs, Full Party Bugs.
- Scale: the game has every Pokemon from Generation 1 and Generation 2 plus 101 from Generations 3 to 7, a total base Pokedex of 420 Pokemon, with over 176,000 combinations. Source: CheatCC guide, Infinite Fusion. PokeCoders agrees on over 176,000 fused results. Source: PokeCoders guide, In Closing.

## 19. Shinies

- Shiny fusions have different colors available based on whether the head, body, or both were shiny. Source: Fusion FAQs, Shiny Pokemon.
- Shiny on unfusing: only Pokemon that were shiny before fusing remain shiny after unfusing. If the Pokemon were fused before the player met them and the fusion is shiny, the game randomly forces one or the other to become shiny when unfusing. Source: Fusion FAQs, Unfusing, Shiny Pokemon.
- Shiny loss bug: if the body is sent to the PC when unfusing with a full party, the head determines if it is shiny based on the body, and the body is no longer shiny, so shininess can be transferred and lost. Source: Fusion FAQs, Full Party Bugs.
- Shiny Charm: a key item that increases the chance of encountering shiny Pokemon. Obtained in Pallet Town after clearing Mt. Silver. Source: List of Items, Other key items table.
- No page describes the exact shiny odds for fusions, or what a specific shiny fusion looks like beyond the head/body/both color rule. Source: Fusion FAQs; List of Items.

## 20. Forms: alternate forms, Mega Evolution, regional forms

- None of the four pages in worker B's set mentions Mega Evolution, alternate forms, or regional forms in fusions. No page states whether a Mega Evolved Pokemon can be fused, whether a fusion can Mega Evolve, or how regional forms interact with fusion. Source: Fusion FAQs; List of Items; CheatCC guide; PokeCoders guide.
- The closest related material is the Reshiram/Zekrom fusion encounter (Dark Stone and Light Stone) and the Ho-oh/Lugia fusion encounter (Navel Ticket) in the List of Items, plus the wiki note that both halves of a fusion evolve at their normal levels or with their normal evolution items. Source: List of Items, Other key items table; Fusion FAQs, Evolution.

## 21. Limits and edge cases

- A fusion cannot be fused again: when Pokemon are fused, the resulting species cannot be fused further. Source: Fusion FAQs, Fusion Basics; CheatCC guide; PokeCoders guide.
- Same species fusion: two Pokemon of the same species can be fused to create a self fusion, but the resulting fusion only gains a 50 percent XP bonus and shares the same stats as the base species. Source: Fusion FAQs, Fusion Basics; CheatCC guide.
- Any two Pokemon: any two Pokemon can be combined with each other to create a fusion. Source: Fusion FAQs, Fusion Basics; CheatCC guide.
- Legendaries: all 25 Legendary Pokemon can be fused. Source: CheatCC guide, NPC Update. Legendary trios also appear as triple fusions. Source: CheatCC guide, List of Triple Fusion.
- Gender: gender is one of the body-based attributes when fusing, and on unfusing the body keeps its nature and gender while the other Pokemon gets a random nature and gender. Source: Fusion FAQs, Other; Unfusing, Other.
- No page states a gender restriction on which Pokemon can fuse, a rule against fusing genderless Pokemon, or any restriction tied to egg groups. Source: Fusion FAQs; CheatCC guide; PokeCoders guide.
- Fusing is not limited to the party: a fusion item can fuse two Pokemon in the party or the box. Source: Fusion FAQs, Fusing Pokemon.
- Blue and Red versions: the two versions are the exact same game, except that in Blue version trainers use inverse fusions. For example if a trainer has a Pikasaur in Red, the same trainer will have a Bulbachu in Blue. Source: EeveeExpo thread.
- Practical tips from PokeCoders: save in separate slots before experimenting, because some Pokemon are rare; experimenting costs DNA Splicers, so save first and load if the results are not liked. Source: PokeCoders guide, Tips.

## 22. Sprites: how fused sprites are made

### Two tier system: auto generation plus community custom art

- Every fusion's look comes from one of two places: an auto-generated sprite from Japeal's fusion generator approach, or a hand-drawn custom sprite made by a community artist. The head Pokemon sets the colors and pattern, the body sets the shape, and if the fusion preview shows a green tint, that combination has a custom sprite waiting. Source: pokemon-infinitefusions.site, How Fusion Sprites Work.
- The game ships with auto-generated sprites for every combination and thousands of hand-drawn custom ones contributed by players. Source: RandomGenerate, How fusion works, Sprites.
- The bottom tier is the auto-generated sprite: when no custom art exists for a pairing, the game builds a sprite automatically from the two parents' parts using the same approach as Japeal's Pokemon Fusion Generator, the web tool that inspired the entire game. These autogen sprites cover every possible combination, which means the player never fuses blind, but they are visibly rough: odd scaling, flat colors, and missing detail are the norm, not the exception. Source: pokemon-infinitefusions.site, Every fusion sprite comes from one of two places.
- The top tier is the custom sprite: a hand-drawn replacement created by a community artist. Thousands of these are drawn every week on the game's Discord server, and the base game ships with a quality-controlled collection of the best ones plus an auto-downloader that fetches art for sprites the player does not have yet. Source: pokemon-infinitefusions.site, Every fusion sprite comes from one of two places.
- The current released version is 6.7.2 (October 2025). If a site claims 6.8.2 is out, that version is unreleased and its changelog is undated on the wiki; sprite behavior described here matches 6.7.2. Source: pokemon-infinitefusions.site.
- Most sprites are automatically generated but the spriting community on the developer's Discord frequently creates new high quality sprites. Source: Pokemon Fan Game Wiki.
- The game allows the player to replace sprites directly: add the new sprite in the Graphics/CustomSprites folder (with the right dimensions and name) and the game uses it instead of the generated one. Source: foxnu507.netlify.app, Pokemon Infinite Fusion page.

### How auto generation works

- Each Pokemon sprite is separated into a head part and a body part. A script then combines the head of one Pokemon with the body of the other, and alters the body colors to match the colors of the face. Source: Prima Games, How "Pokemon Fusion" Works; How Pokemon Fusion Generator 2 Works.
- The head Pokemon determines the colour palette and pattern. Source: Fusion FAQs, Head and Body.
- The script description comes from Prima, about the web generators. RandomGenerate states the in-game result (auto-generated sprites for every combination) without describing the in-game script. The in-game code path is not described in any page read. Source: Prima Games; RandomGenerate.

### Preview signals

- When fusing, the player is shown previews of the resulting fusions, where the player decides which is the body and which is the head. If the player has not seen the fusion before, the preview is a silhouette. Pokemon that have custom sprites have a green tinted preview. Source: Fusion FAQs, Fusing Pokemon.
- The preview does three jobs at once: it shows both orders, it hides unseen fusions behind a silhouette, and it flags custom-sprite fusions with a green tint before the player commits. Source: Fusion FAQs, Fusing Pokemon.
- The web generator equivalent: the First Pokemon is the head and the Second Pokemon is the body, and the site generates the reverse fusion on the right as well, so the player does not need to swap manually. Source: Prima Games, How to Use the Pokemon Infinite Fusion Generator.
- A fan-made web generator can fail where no drawn sprite exists: a missing fan-made sprite renders as a question mark. That failure belongs to the jokaes.github.io web generator, not to the in-game auto generation, which ships an auto sprite for every pair. Source: Prima Games, How Pokemon Infinite Fusion Generator Works.

### FusionDex and community contribution

- TechBii tells readers to browse FusionDex at fusiondex.org for the sprite before committing to a fusion in game. Source: TechBii guide, How to Use a Fusion Calculator Before You Commit.
- RandomGenerate says sprite artists and Discord fusion threads use random pairs to avoid always drawing the same popular combos, and that custom fusion sprites exist only for pairs the community has drawn. Source: RandomGenerate, Ways to use the pairs; What you get, and what you don't.
- The Fandom wiki's Custom Sprites page describes thousands being made every week, with anyone able to submit work for feedback in the spritework channels and apply for the Spriter role. Source: pokemon-infinitefusions.site, How Fusion Sprites Work.
- The official game team updates the Custom Sprites Pack every few months, adding new sprites and updating existing ones. There are 98 Custom Sprites Packs as of the calculator site's article. Source: infinite-fusion-calculator.com, Custom Sprites Progress.
- No page read describes the submission pipeline in detail: how a player submits a custom sprite, who reviews it, what format or size rules apply, or how sprite packs ship. Source: RandomGenerate; Prima Games; TechBii guide.
- A fusion calculator at pokefusioncalc.com lets the player preview any pair in both head/body orders before spending anything in game: enter both parents, check typing for nasty 4x weaknesses, flip head/body order and compare stat lines, check which ability each order lets the player keep, then browse FusionDex for the sprite. Source: TechBii guide, How to Use a Fusion Calculator Before You Commit.

### The sprite problem verdict

- The combination space is far larger than any art team can draw by hand. TechBii reports over 175,000 combinations from a 400+ roster. RandomGenerate reports around 470 species, which by ordered counting gives 220,430 distinct pairs before self fusions. Source: TechBii guide; RandomGenerate.
- Hand-drawn art covers only a fraction. RandomGenerate says the game ships thousands of hand-drawn custom sprites against auto-generated sprites for every combination. Thousands against hundreds of thousands is a small minority by count. Source: RandomGenerate, Sprites.
- Names collide and IDs shift. Fandom notes one name can refer to 18 different Pokemon and Pokedex numbers can change as X changes. Presentation cannot rely on the fused name alone as an identifier. Source: Fusion FAQs, Names and IDs.
- How the game solves it: auto generation guarantees coverage (every combination gets a sprite by rule); community art upgrades the result where it exists (custom sprites replace the auto sprite for that pair, flagged with a green tint); the preview manages expectations (unseen fusions show as a silhouette); browsing happens outside the fusion moment (FusionDex and calculators let the player preview before spending a splicer); the fusion is reversible and re-orderable (unfusing returns both parents, a DNA Reverser swaps head and body), so a bad visual or mechanical pick is cheap to undo. Source: Fusion FAQs; RandomGenerate; Prima Games; TechBii guide.
- No page compares auto sprite quality against custom sprite quality, or gives a coverage percentage for custom sprites. The verdict supported by the pages is narrower: auto generation solves coverage, community art solves quality where it exists, and the preview plus reversibility solve the player's risk. The game does not solve the scale problem by drawing everything. It solves it by not needing to draw everything. Source: RandomGenerate; Prima Games; TechBii guide.

## 23. Combination counts in Pokemon Infinite Fusion

The pages do not agree on one roster size, and none of them shows its arithmetic. The table below records exactly what each source says.

| Source | Species count stated | Combination or sprite count stated |
|---|---|---|
| CheatCC guide, PokeCoders guide | 420 base (Gen 1 and 2 plus 101 from Gen 3 to 7) | Over 176,000 combinations |
| TechBii guide, opening | 400+ in the 2026 build | Over 175,000 possible combinations |
| TechBii guide, calculator section | No species count | 200,000+ community-made custom sprites via FusionDex |
| RandomGenerate | Around 470, mostly Gen 1 and 2 plus later favorites | No combination total given |
| infinite-fusion-calculator.com | No species count | Over 216,225 unique fusion combinations; over 94,000 custom sprites |
| codegenes.net | No species count | Over 251,001 unique fusion combinations; 150,000+ handcrafted custom sprites |
| infinite-fusion.net | 576+ (Gen 1 to 7) | 331,776+ fusion possibilities; 212,013+ custom sprites; 7,714+ artists |
| Pokemon Fan Game Wiki | No species count | 176,400 possible combinations; over 15,000 custom sprites |
| foxnu507.netlify.app (old) | Gen 1 and 2 plus 71 from Gen 3 to 6 | 123,201 possible combinations; over 5,000 custom sprites |
| foxnu507.netlify.app (older) | 151 | 22,801 Pokemon |
| Instagram post by RWNorthPole | 576 | Over 330,000 possible combinations; over 180,000 hand-redrawn fusion sprites |

The pattern in the numbers: ordered pairs including self fusions equal the roster size squared. 420 x 420 = 176,400. 465 x 465 = 216,225. 501 x 501 = 251,001. 576 x 576 = 331,776. 351 x 351 = 123,201. 151 x 151 = 22,801. That is the formula behind the headline totals: every ordered head/body assignment, including same-species pairs.

Arithmetic check on TechBii's figures: for 400 species, 400 x 399 = 159,600 ordered distinct pairs, plus 400 self fusions = 160,000. That is below "over 175,000", so a roster of exactly 400 does not produce that total. The smallest roster that passes 175,000 under ordered distinct counting is 419: 419 x 418 = 175,142. TechBii says "400+", not 400 exactly, so the gap is consistent with a roster above 400. Source: TechBii guide; arithmetic is my own check on the stated numbers.

TechBii's "200,000+ community-made custom sprites" needs care: the page presents it as a count of custom sprites, not combinations. Taken literally as distinct custom sprites for distinct fusions, 200,000 exceeds the ordered distinct pair total for a 400-species roster (159,600) and even exceeds the ordered total including self fusions (160,000). It is below the ordered total for a 470-species roster (220,430). The article does not explain the figure, does not say whether it counts multiple sprites per fusion (for example front and back sprites, shiny variants, or alternate versions), and does not give a date for the count. It is recorded here exactly as TechBii states it, and it should not be quoted as a verified count of distinct custom fusions. Source: TechBii guide.

The counts show the same lesson three ways: the total is extremely sensitive to the roster size, because it grows with the square of the species count. A move from 400 to 470 species raises ordered distinct pairs from 159,600 to 220,430, a rise of 60,830, or about 38 percent, from a roster rise of only 17.5 percent. Any FED-13 comparison must therefore name the roster size it uses, or the totals cannot be compared. Source: arithmetic on the stated numbers.

## 24. FED-13 scale math for 134 Feral Beasts

This section is my own calculation from the roster size in the task: 134 Feral Beasts. Working is shown step by step. No source page gives FED-13 numbers.

### Ordered pairs, head plus body, order matters

A head Beast and a different body Beast. Order matters, because head and body change palette, name, typing, and stats, exactly as in Pokemon Infinite Fusion.

134 x 133 = 17,822

Working: 134 x 100 = 13,400; 134 x 30 = 4,020; 134 x 3 = 402; 13,400 + 4,020 + 402 = 17,822.

### Unordered pairs, order ignored

Same pairs as above, but A plus B counted once instead of twice.

134 x 133 / 2 = 17,822 / 2 = 8,911

### Self fusions, same species twice

One per Beast, by the same rule the Fusion FAQs reports for Pokemon Infinite Fusion self fusions. Source: Fusion FAQs, Fusion Basics.

134

### Total two-Beast fusions, ordered pairs plus self fusions

17,822 + 134 = 17,956

That is the full ordered two-Beast space: every head/body assignment, including same-species pairs. The unordered total including self fusions would be 8,911 + 134 = 9,045, but the ordered total is the right one for sprite work, because swapping head and body makes a different sprite.

### Triple fusion combinations, unordered triples

Three different Beasts, order ignored, using the combination formula n x (n minus 1) x (n minus 2) / 6.

134 x 133 x 132 / 6 = 392,084

Working: 134 x 133 = 17,822. 17,822 x 132 = 2,352,504. Working for that step: 17,822 x 100 = 1,782,200; 17,822 x 30 = 534,660; 17,822 x 2 = 35,644; 1,782,200 + 534,660 + 35,644 = 2,352,504. Then 2,352,504 / 6 = 392,084.

Note: this is unordered triples only. Ordered triples, where which Beast is head, middle, or body matters, would be 134 x 133 x 132 = 2,352,504. Triple fusions are not part of the two-Beast total above, and Pokemon Infinite Fusion itself treats triple fusions as a select few late-game exceptions, not as a full combination space. Source: Fusion FAQs, Fusion Basics. FED-13 must treat triples the same way: a chosen set, never the full space.

### Comparison with Pokemon Infinite Fusion's own counts

| System | Roster | Ordered distinct pairs | Ordered total incl. self fusions |
|---|---|---|---|
| Pokemon Infinite Fusion, TechBii roster | 400+ | 159,600 at exactly 400; over 175,000 needs at least 419 | 160,000 at exactly 400 |
| Pokemon Infinite Fusion, RandomGenerate roster | Around 470 | 220,430 | 220,900 |
| FED-13, 134 Feral Beasts | 134 | 17,822 | 17,956 |

FED-13 at 134 Beasts is about 8 percent of Pokemon Infinite Fusion's 470-species ordered total (17,956 / 220,900 = about 0.081), and about 11 percent of its 400-species ordered total (17,956 / 160,000 = about 0.112). That sounds small until it is stated as work: 17,956 distinct ordered sprites.

### What the numbers mean for sprite work

Plainly: no team can hand draw every fused sprite, at FED-13 scale or at Pokemon Infinite Fusion scale.

- At 134 Beasts, hand drawing every ordered two-Beast fusion means 17,956 sprites. At one sprite per day, that is over 49 years of work for one artist. At ten sprites per day, it is still over 4 years and 11 months. Those rates are illustrative, not sourced, but the count they divide is exact.
- Adding unordered triple fusions would add 392,084 combinations, about 22 times the entire two-Beast ordered space. Hand drawing triples is not a plan; it is a reason to restrict triples to a small chosen set.
- Pokemon Infinite Fusion, with a roster three to four times larger and a combination space ten to twelve times larger, does not hand draw every pair either. It ships auto-generated sprites for every combination and adds thousands of hand-drawn custom sprites from the community. Source: RandomGenerate, Sprites. The auto layer guarantees coverage; the hand layer upgrades only chosen pairs.

FED-13 needs the same approach:

- Auto generation as the base layer: head art plus body art, with the head setting the color palette and pattern, following the rule the Fusion FAQs states for Pokemon Infinite Fusion and the recoloring method Prima describes. Source: Fusion FAQs, Head and Body; Prima Games.
- Hand-drawn art only for a chosen set: popular pairs, story pairs, starter pairs, or showcase pairs, the same way Pokemon Infinite Fusion's custom sprites cover only a fraction of the space while the auto sprite covers the rest.
- The same preview signals: silhouette for unseen fusions, and a distinct tint or marker for fusions with custom art, following the Fusion FAQs preview rules, so the player can tell at a glance whether they are looking at auto art or hand art before they commit. Source: Fusion FAQs, Fusing Pokemon.
- The same reversibility: unfuse to recover both Beasts, and a reverser-style swap for head and body, so a player who dislikes an auto result is not locked into it. Source: Fusion FAQs, Unfusing Pokemon; Reversing Fusions.
- The current sprite counts are not final, and fusion combinations are the reason they explode. The 489 sprite prompts in the prompt file cover the base Beasts and Bondkin only. Fused Beast sprites are auto-generated, not hand prompts, or the prompt total would need 17,956 more entries.

## 25. Discrepancies and gaps

- Current version: TechBii says 6.7.2 (October 2025). Switchblade says verified against 6.8 (July 2026). The two pages do not agree on the latest version number. Recorded as a conflict, not resolved. Source: TechBii guide; Switchblade guide.
- Triple fusion count: CheatCC lists 19. The Triple Fusions wiki page intro says the player can obtain up to 23, while the same page lists 25 obtainable sections. A calculator site says the fan wiki lists 25 obtainable triple fusions. The counts differ by version. Source: CheatCC guide; Triple Fusions wiki page; pokemonfusionpro.com.
- Triple fusion unlock: the wiki says bring the Black Stone and White Stone to Colress at the Lake of Rage, then speak to Colress at Mt. Moon. A guide site says bring the three Unova legendaries to Colress at the Lake of Rage, then speak to Colress at Silph Co., where he clones them and the player receives an egg. The location and the cloning detail differ by version. Source: Triple Fusions wiki page; kjcesports.com.
- DNA Reverser purpose: the wiki says it swaps head and body. CheatCC says it switches a fusion back to the original Pokemon. The wiki account is used in this file; the CheatCC wording appears to be an error. Source: Fusion FAQs, Reversing Fusions; CheatCC guide.
- Fusion level math: the wiki gives the weighted formula ((Higher x 2) + Lower) / 3 for DNA Splicers. PokeCoders gives a plain average (level 10 + level 30 = level 20). The wiki formula is the precise one. Source: Fusion FAQs, Level; PokeCoders guide.
- Ability choice: the wiki says the player chooses between the two abilities the parents had at fusion. CheatCC says the options are the head's second Ability and the body's first Ability. Both accounts are reported as written. Source: Fusion FAQs, Ability; CheatCC guide.
- Nature choice: the wiki says the player chooses a nature at fusion. CheatCC says the nature is random at fusion and can be chosen later from an NPC near Cinnabar Island. Both accounts are reported as written. Source: Fusion FAQs, Name, Nature, and Moves; CheatCC guide.
- Head and body assignment: the current wiki says the player chooses head and body at the preview screen. The EeveeExpo thread (version 3.0 era) says the higher-level Pokemon is automatically the body. The automatic rule is superseded. Source: Fusion FAQs, Fusing Pokemon; EeveeExpo thread.
- Ability assignment: the current wiki says the player chooses between the two parents' current abilities. The EeveeExpo thread says a fusion gets any of the four abilities from the two base Pokemon, at random. The random rule is superseded. Source: Fusion FAQs, Ability; EeveeExpo thread.
- Movesets: the current wiki says the player chooses moves at fusion and relearns from either parent via the Move Teacher. The EeveeExpo thread says a fusion gets the full movesets of both parents with automatic combined level up learning. The automatic rule is superseded. Source: Fusion FAQs, Name, Nature, and Moves; EeveeExpo thread.
- CheatCC's background facts are dated: it says the game had four versions and the last update to fix bugs was in 2022, and that a copy of Pokemon FireRed is required. The wiki pages reflect later versions (6.0 to 6.4 growth rate notes). Source: CheatCC guide; Fusion FAQs, Growth Rate.
- Unverified from the sources read: self fusion details beyond the 50 percent XP bonus and identical stats; wild fusion spawn rate beyond "uncommonly"; nature selection mechanics (choice set, later changes); fused evolutions as distinct species; a clean rule for ordinary battle EXP gained while fused beyond the head-only bug note; Move Teacher limits; how triple fusions are made beyond the Colress procedure; whether triple fusions can be unfused; what happens to a fusion left at the Day Care; Mega Evolution, alternate forms, and regional forms in fusions; exact shiny odds or specific shiny appearances; any gender or egg group restriction on fusing; the in-game auto-generation code path; how custom sprites are submitted, reviewed, and shipped; FusionDex coverage and layout beyond TechBii's pointer to fusiondex.org; what TechBii's "200,000+ community-made custom sprites" counts.

## 26. Design-ready section: how these fusion concepts map to FED-13 Beast fusion

FED-13 decisions already made, kept as is: fusion is Beast only, Mankind and Bondkin cannot fuse. Three fusion routes are already decided: breeding a fused egg, daycare fuse for 300 Crests, Splicer items. A fused Beast can still become a Bondkin. Fusion can be undone. The rules below build on those decisions using the Pokemon Infinite Fusion concepts above. No rule below is a question.

### Rule 1: Head and body

Every fusion has a head Beast and a body Beast. The player picks which is which at the fusion preview, in both orders, before committing. The head sets the color palette and pattern. The body sets the shape. Swapping head and body makes a different fused Beast with a different name, look, typing, and stats.

### Rule 2: Stat formula

Use the Pokemon Infinite Fusion weighted formula on FED-13 Beast stats. Head governs HP, ATS (Arts attack), and ADF (Arts defense). Body governs STR, DEF, and SPD. Physical stats: floor((2 x Body + Head) / 3). HP and special stats: floor((2 x Head + Body) / 3). A special attacker belongs in the head slot and a physical attacker belongs in the body slot, exactly as in Pokemon Infinite Fusion.

### Rule 3: Typing

The fused Beast takes its head's primary type and its body's secondary type. If the body has no secondary type, its primary type is used instead. If the head already provides the type the body would contribute, the body provides its primary type instead, to avoid redundancy. If both types are the same, the fused Beast is single type.

### Rule 4: Name and Codex ID

The fused Beast's name is the front of the head Beast's name plus the back of the body Beast's name. Fused Beasts get their own Codex entries. Because names can collide between different fusions, the game IDs a fused Beast as Head name/Body name and by (Head Codex number.Body Codex number), exactly as the Pokemon Infinite Fusion community does.

### Rule 5: Splicer tiers

FED-13 keeps its Splicer items and adds the three tier structure from Pokemon Infinite Fusion. Basic Splicer: fuses and unfuses, consumed on use, cheap, bought at any Puffkin shop. Super Splicer: consumed on use, costs more, gated behind story progress, the fusion takes the higher level of the two Beasts and the higher IV in each stat. Infinite Splicer: a key item, never consumed, earned late in the game by beating a boss in a lab, and upgraded to Super Splicer level after the endgame by beating more bosses there. The daycare fuse for 300 Crests stays as the cheap route. Breeding a fused egg stays as a FED-13 only route: unlike Pokemon Infinite Fusion, where breeding a fusion is impossible, FED-13 allows two Beasts to breed a fused egg.

### Rule 6: Reverser

FED-13 adds a Reverser item, cheap and bought at any Puffkin shop after the first Trial Battle. Using it on a fused Beast swaps head and body. Base stats, typing, and ability change to match the new order. The fused Beast keeps its accumulated experience. This is cheaper than unfusing and re-fusing.

### Rule 7: Fusion Lure

FED-13 adds a Fusion Lure item, the FED-13 version of Fusion Incense. Using it makes every wild Beast encountered a fused Beast for 50 steps. It is bought at Puffkin shops after the third Trial Battle.

### Rule 8: Unfusing

Use a Splicer on a fused Beast to unfuse it. Both Beasts return. Player-made fusions keep their levels. Wild or traded fusions return at 90 percent of the fusion's level with a Super Splicer, 75 percent with a normal Splicer, and 65 percent if obtained in a trade and no Super Splicer is used, all rounded down. Instant-level item EXP gained while fused is lost on unfusing. Battle EXP gained while fused is kept by both halves: FED-13 does not copy the Pokemon Infinite Fusion bug where only the head gets intermediate EXP. One half keeps its nature, gender, IVs, EVs, health, held item, and history; the other half is rerolled with a random nature, gender, and IVs, and its EVs and happiness reset. If the party is full on unfusing, the player sends one of the two Beasts to the Bank. Fused Beasts obtained in a trade cannot be unfused until postgame.

### Rule 9: Wild fusions

Wild fused Beasts appear uncommonly in the wild, as fusions of the wild Beasts found in that area. Catch rate is the lowest catch rate of the two Beasts. Experience given is the average of the two base Beasts. Base happiness when caught is based on the body Beast.

### Rule 10: Evolution

Each half of a fused Beast evolves separately at its normal stage. If both halves evolve at the same stage, the game asks which one the player wants to evolve first, then the next stage up evolves the other half. No fused Beast has a distinct fused evolution species.

### Rule 11: Self fusion

Two Beasts of the same species can be fused into a self fusion. It shares the same stats as the base species and gains a 50 percent EXP bonus.

### Rule 12: No re-fusing

A fused Beast cannot be fused again. It can only be unfused or reversed.

### Rule 13: Variant rule (Hollow and Echo)

Hollow and Echo are FED-13's variants, the equivalent of Pokemon Infinite Fusion shinies. A fused Beast's variant follows its head: a Hollow head makes a Hollow fused Beast, an Echo head makes an Echo fused Beast, a normal head makes a normal fused Beast. The body's variant is recorded on the fused Beast but does not change its variant type. If a fused Beast is unfused, only Beasts that were Hollow or Echo before fusing stay Hollow or Echo after unfusing; a wild or traded fused Beast that is Hollow or Echo randomly forces one half to become Hollow or Echo on unfusing.

### Rule 14: Triple fusions, chosen set only

Triple fusions in FED-13 are a small chosen set, never the full combination space. The full unordered triple space for 134 Beasts is 392,084 combinations, about 22 times the entire two-Beast ordered space, and the ordered triple space is 2,352,504. FED-13 picks a small set of triple fusions from legendary Beast trios and starter trios, obtainable only in the late post-game from one NPC with a machine, once per trio, as an egg that hatches the unevolved triple form. Triple fusions have fixed stats, not formula stats, and a combined unique type treated as a single type in calculations.

### Rule 15: Sprites, auto generation base plus hand art

Fused Beast sprites are auto-generated, not hand prompted. The base layer is head art plus body art, with the body recolored to the head and the head setting the palette and pattern, exactly as in Pokemon Infinite Fusion. Hand-drawn art is only for a chosen set: popular pairs, story pairs, starter pairs, and showcase pairs. The fusion preview shows both head/body orders before the player commits, hides unseen fusions behind a silhouette, and marks fusions with custom art with a distinct tint, so the player can tell auto art from hand art before committing. The prompt file total does not include fused sprites: 17,956 ordered two-Beast fusions would need 17,956 more sprite prompts, which is why the auto layer exists.

### Rule 16: Codex and Bondkin

A fused Beast gets its own Codex entry and acts as a regular Beast in every system: catching, training, evolving by halves, breeding (only after unfusing, since a fused Beast itself does not breed), Showcases, and dispatch. A fused Beast can still become a Bondkin after catch and train, as already decided. A fused Beast that becomes a Bondkin keeps its fused form, its fused stats, and its fused name.

### Rule 17: The three routes, final

The three FED-13 fusion routes, with the tiers above applied to each: breeding a fused egg at the daycare (FED-13 only, no Pokemon Infinite Fusion equivalent); daycare fuse in place for 300 Crests (the cheap route, uses basic Splicer math); Splicer items used directly on two Beasts in the party or the Bank (basic, Super, and Infinite tiers with their level and IV rules). All three routes show the same preview, the same head/body choice, and the same name, ability, and move choices. All three routes can be undone with a Splicer.

## Sources

1. Infinite Fusion Wiki (Fandom), Fusion FAQs, https://infinitefusion.fandom.com/wiki/Fusion_FAQs
2. Infinite Fusion Wiki (Fandom), Triple Fusions, https://infinitefusion.fandom.com/wiki/Triple_Fusions
3. Infinite Fusion Wiki (Fandom), List of Items, https://infinitefusion.fandom.com/wiki/List_of_Items
4. Switchblade Gaming, Pokemon Infinite Fusion Explained, https://www.switchbladegaming.com/pokemon/infinite-fusion-guide/
5. CheatCC, Pokemon Infinite Fusion Guide: How to Play, Tiers, and Download, https://www.cheatcc.com/articles/pokemon-infinite-fusion-guide-how-to-play-tiers-and-download/
6. PokeCoders, Pokemon Infinite Fusion: Pokemon Fusing Guide, https://www.pokemoncoders.com/infinite-fusion-pokemon-fusing-guide/
7. EeveeExpo, Released: Pokemon Infinite Fusion, https://eeveeexpo.com/threads/674/
8. TechBii, 10 Best Fusion Combinations In Pokemon Infinite Fusion (2026), https://techbii.com/top-fusion-combinations-in-pokemon-infinite-fusion/
9. RandomGenerate, Pokemon Infinite Fusion Generator, https://randomgenerate.io/pokemon-infinite-fusion-generator
10. Prima Games, How to Use Pokemon Infinite Fusion Generator, https://primagames.com/tips/how-to-use-pokemon-infinite-fusion-generator
11. Infinite Fusion Calculator, Custom Sprites Progress, https://infinite-fusion-calculator.com/sprite-progress/
12. pokemon-infinitefusions.site, How Fusion Sprites Work: Custom Sprites in Pokemon Infinite Fusion, https://pokemon-infinitefusions.site/how-fusion-sprites-work-custom-sprites/
13. Pokemon Fan Game Wiki, Pokemon Infinite Fusion, https://pokemon-fan-game.fandom.com/wiki/Pok%C3%A9mon_Infinite_Fusion
14. codegenes.net, Pokemon Infinite Fusion Download (2026 Guide), https://www.codegenes.net/blog/pokemon-infinite-fusion-download/
15. infinite-fusion.net, Pokemon Infinite Fusion, https://www.infinite-fusion.net/pokemon
16. kjcesports.com, How to do Triple Fusions in Pokemon Infinite Fusion, https://www.kjcesports.com/guide/how-to-do-triple-fusions-in-pokemon-infinite-fusion/
17. pokefusionpro.com, Unlock Triple Fusion in Pokemon Infinite Fusion (2026), https://pokefusionpro.com/triple-fusion-in-pokemon-infinite-fusion/
