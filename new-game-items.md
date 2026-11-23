# FED-13 RPG - Item System

This file is the full item system design for FED-13 RPG. It is built from the Items reminder in new-game.md (lines 111-157) and the feature picks in MEMORY.md (Pokemon, Kingdom Hearts, Trails, Undawn, Final Fantasy Tactics Advance). It is a design doc, not a build.

Terms used in this file:
- Bondkin is the trained partner. Monster, also called Feral, is the wild one. Creature is the generic word for both.
- The character has classes (cap 150). Bondkin have jobs, called Paths (117 Paths plus 30 Ascended Paths).
- Surge Forms, in this order: Gale Form, Aegis Form, Zephyr Form, Tempest Form, Zenith Form.
- Elements: Earth, Fire, Wind, Water, Time, Space, Mirage, plus Dark (Hollow variants) and Ghost (Echo variants).
- Every item is graded: F 0, E 1-21, D 22-51, C 52-79, B 80-99, A 100-139, S 140-169, SS 170-199, SSS 200-249, SSSS 250+. See section 5 for the full ladder.
- Currency is unnamed in the design. See open questions.

Where the design is silent, this file says so and lists an open question for Git-FED. Nothing here invents a new system, currency, or item type.

## 1. Shops and synthesis

### 1.1 Puffkin shops

Puffkin run the shops. Every shop is a Puffkin shop. A Puffkin shop sells items, weapons, armor, and accessories, and it hosts synthesis. Shops are the main way the player turns what they have collected and earned into gear they can use.

Shops supply usable items for combat. Items are usable during battle, and shops are where the player stocks up on them. Shops also supply the weapons that the item-to-attack system runs on: buy a certain weapon to use a certain skill, and Bondkin learn action, reaction, support, combo, and movement abilities from weapons and accessories bought this way.

### 1.2 What shops sell

The sources name the following shop stock: items, weapons, armor, accessories, shoes, gloves, swords, blades, sabers, shields, elemental weapons, elemental armor, costumes, growth items, Shards, and food. Growth items train and grow Bondkin. Costumes and accessories are collected as well as worn. Food is bought at shops, while water comes from other sources: people give water, water is found in the field, and water fountains and vending machines sit where they belong.

### 1.3 Synthesis

Synthesis combines collected items to make new items, like Metamonsters items. That is the whole rule the design states: collected items in, new item out. Synthesis is hosted at Puffkin shops.

Two gates apply to crafting in the design, and both are stated as hard rules. Blueprints are required to make a thing in the first place: no blueprint, no craft. A workbench is required to even get to work: no workbench, no crafting. The design does not say whether the workbench a synthesis needs is the one at a Puffkin shop, a homestead workbench, or a separate crafting station, so that is an open question below.

Weapon crafting is in the design, kept small in scope. A weapon modification system is also named in the design. Neither one is defined further: what can be crafted, what can be modified, and what either costs are all open questions.

### 1.4 Shard synthesis

Shard synthesis comes from the Trails picks. Shards are synthesized, and Shards slot into The Lattice to gain stats, passive effects, and Arts. Shards come as Normal and Rare crystal circuits.

The Core Shard determines a Bondkin affinity, and affinity is not a fixed type. Swap Fire for Electric and the creature can learn electric abilities. The design does not say whether Shards and Core Shards are sold in Puffkin shops, synthesized only, or both, so that is an open question below.

### 1.5 Shop tiers

The design does not define shop tiers. No tier names, no tier unlock rules, and no stock differences between shops are stated anywhere in the sources. What the sources do support is this much:

- Shops exist in towns, and there are 5 visible towns on the world map.
- Every time the player enters a new town, they can find new items there. That is the treasure hunt rule.
- Shops sell the same broad stock everywhere the design describes them: items, weapons, armor, and accessories.
- Synthesis is hosted at Puffkin shops, with no shop-by-shop difference stated.

Anything beyond that, tier names, tiered stock, unlock conditions, or one shop offering synthesis while another does not, is not in the design and is listed as an open question.

### 1.6 Currency

The design says currency and materials are given, but it never names a currency. There is no currency name in the sources, no price list, and no statement of how currency is earned or what it can buy beyond shop stock. This section does not invent a currency name. The currency is unnamed in the design, and its name, sources, and rules are open questions below.

### 1.7 Trade shop

The FFTA gear pick lists three sources for weapons and gear: shops, mission rewards, and trade shop. The trade shop is named only as a source. The design does not say what the trade shop trades, what it accepts in return, how it differs from a Puffkin shop, or where it is found. It is covered here as a source only, and everything about how it works is an open question.

### 1.8 How shops connect to the rest of the game

- New towns, new items. The treasure hunt rule ties shops and towns together: 5 visible towns, and new items to find in every new town the player enters. Shops are part of how each new town pays off.
- Mission rewards feed back into gear. Story missions, dispatch missions, guild missions, and turf missions give items, and mission rewards sit beside shops and the trade shop as a gear source. Clan battles are fought for items. Dispatch missions deploy for 5 to 10 to 20 days and return with their results.
- Dungeons feed shops and synthesis. Treasure chests in dungeons hold items, and those collected items are the input for synthesis.
- Gathering feeds synthesis. Gathering resources and basic tools supply materials: the axe, the pickaxe, and the fishing rod are the named tools. The backpack holds only so much, and homestead cabinets store the extra, so gathered synthesis materials have a home.
- The Lattice and Shards run through shops and synthesis. Shards bought or synthesized slot into The Lattice for stats, passive effects, and Arts, and the Core Shard sets Bondkin affinity.
- Drive orbs fill the Surge Gauge, along with taking damage and attacking. Drive orbs are a named item in the design, but the design does not say whether shops sell them.
- New Game Plus carries equipment over after clearing, so shop-bought and synthesized gear keeps its value past the end of the game.

### Named items in this section

27 distinct items, tools, and requirements are named in this section: Sword, Shield, Staff, Soulblade, Saber, Blade, Armor, Shoes, Gloves, Accessories, Elemental weapons, Elemental armor, Shards, Core Shard, Drive orbs, Growth items, Mission items, U-Materials, Blueprints, Workbench, Food, Water, Cooking results, Axe, Pickaxe, Fishing rod, Costumes.

### Open questions

1. What is the currency called, how is it earned, and what are the prices?
2. Are there shop tiers at all, and if so, what are the tier names, unlock rules, and stock differences?
3. Does shop stock differ by town, or do new towns only add new treasure-hunt finds while shop stock stays the same?
4. What are the synthesis recipes: which collected items combine into which new items, and are recipes fixed, discovered, or gated by blueprints?
5. Does synthesis at a Puffkin shop need a blueprint and a workbench there, or does the workbench live at the homestead or elsewhere?
6. What does the trade shop trade, what does it accept, where is it found, and how does it differ from a Puffkin shop?
7. Are drive orbs sold in Puffkin shops, or only found in the field?
8. Are Shards and Core Shards sold in shops, synthesized only, or both?
9. What does the weapon modification system change, what does it cost, and does it need blueprints or a workbench?
10. Do mission rewards ever change shop stock, with new items appearing in shops after missions are cleared?
11. Can the player sell items back to Puffkin shops, and if so, for how much?
12. Which items are shop-only, which are synthesis-only, and which come from both?

## 2. Combat items

This section covers items used in battle, items that grant attacks and skills, healing and status items, HP and MP and the Surge Gauge, charging stations, stealing, the battle loadout rule, and the boss finisher idea. Every mechanic below traces to a picked feature in new-game.md, fed-13-sora-skills.md, or the FED-13 picks in memory. Where the sources name no item or no rule, this section says so and leaves it open.

### 2.1 Items usable in battle

Items in combat is a kept Kingdom Hearts pick, listed as given. A Bondkin can use items during battle. Battle is FFTA small grid turn based battle, 1v1 to 6v6, with a larger map for more creatures. There are no random encounters. Enemies are visible on the field. Field attacks and encounter advantage apply. AT bonuses, Link Attacks, the Break system, and the Unbalanced status apply in battle.

Puffkin shops sell items, weapons, armor, and accessories, and host synthesis. Synthesis combines collected items to make new items. Weapons and gear also come from shops, mission rewards, and trade shops. Treasure chests in dungeons hold items, per the Trails pick.

Every item is graded. See section 5 for the full grading ladder.

The sources do not name a specific consumable battle item, do not say how many items a Bondkin can carry into battle, and do not say if using an item takes a turn. Those points are open. See Open questions.

### 2.2 Item to attack, and learning skills from gear

Item to attack is a kept FFTA pick: buy a certain weapon to use a certain skill. Abilities are learned from weapons and accessories. That is the rule for Bondkin: learn all action, reaction, support, combo, and movement abilities from weapons and accessories.

The weapons and gear kept from FFTA are swords, blades, sabers, shields, armor, shoes, gloves, and accessories. Elemental weapons and armor are kept, with elemental weakness and resistance. The sources do not list which weapon grants which skill, and do not say if a skill stays learned after the weapon or accessory is removed. Those points are open.

Character gear is separate in the sources. Weapons, armor, shoes, and accessories for the character are upgradable with U-Materials. The Lattice slots Shards and a Core Shard to gain stats, passive effects, and Arts. Shards are normal and rare crystal circuits. A Core Shard determines Bondkin affinity, not fixed type. The source example is swap Fire for Electric and the creature can learn electric abilities. Shard synthesis synthesizes Shards.

### 2.3 Healing, HP and MP, and the Surge Gauge

Every Bondkin has HP and MP bars. Healing spells are given in the Kingdom Hearts picks. Magic spells are effect-only to help or hurt, with a later-game function. Healing in the sources is by spell, not by a named healing item. The sources name no healing item, no MP restore item, and no revive item. Do not treat any such item as decided.

Drive orbs are a named item. Drive orbs fill the Surge Gauge. The Surge Gauge also fills by taking damage and by attacks. Transforming fully refills HP and MP.

Surge Forms, in this exact order, are Gale Form, Aegis Form, Zephyr Form, Tempest Form, Zenith Form. Form skills by form are: Gale Form unlocks Quick Run / Air Slide, Aegis Form unlocks Dodge Roll, Zephyr Form unlocks Glide, Tempest Form unlocks Aerial Dodge, Zenith Form unlocks High Jump. Higher form levels unlock stronger versions of that form's skills, Lv1, Lv2, Lv3, up to MAX. Surge Form and Summon levels are separate from character level, each to 7 by its own method.

The sources do not say how much gauge one drive orb gives, if drive orbs can be used in battle or only out of battle, or if the full HP and MP refill on transforming applies only to the transforming Bondkin. Those points are open.

### 2.4 Status effects, and what items cure or cause

Status effects work on bosses too. That is a kept Trails pick, and it applies to the full status list below.

Trails status effects kept are: burn, freeze, poison, blind, seal, confuse, faint, sleep, AT delay, and stat down, plus more unnamed in the source. FFTA status effects kept are: Idle, Astra, Auto-Life, Berserk, Blind, Boost, Charm, and Confused, plus more unnamed in the source. Blind appears in both lists. Confuse in the Trails list and Confused in the FFTA list are the same effect name in two lists. Unbalanced is kept as a new status effect, and the Break system and Break state are kept.

The FFTA pick adds two pacing rules. Introduce status effects reasonably and slowly, later into the game. By end game they are an absolute nightmare. Cap the number of characters that can even use status effect moves so the game does not get ridiculous.

The sources name no item that cures any status effect, and no item that causes any status effect. The sources also do not say which status effects a healing spell can cure, or if any status effect can be blocked by elemental gear. All cure and cause questions are open. See Open questions.

### 2.5 Charging stations

Charging stations in keeps and dungeons restore HP and EP free. That is a kept Trails pick. The sources do not say which keeps or dungeons have a station, if a station can be used more than once, or if a station also restores the Surge Gauge.

Naming conflict, not resolved here: this pick says EP, while the Bondkin bars elsewhere are HP and MP. Do not treat EP and MP as the same thing in this design. See Open questions.

### 2.6 Steal to learn and steal EXP

Steal to learn and steal EXP is a kept FFTA pick. Stealing from enemies is a way to learn and to gain EXP. The sources define it only at that level. They do not name which enemies can be stolen from, what can be stolen, if a stolen item goes into inventory, how steal to learn works step by step, or how much EXP stealing gives. Cover stolen items only as the sources define them, which is: no named stolen item exists in the sources. All of it is open. See Open questions.

Growth items are kept as a separate item type, to train and grow Bondkin. Mission items are kept as a separate item type, for story missions, dispatch missions, and turf missions. Neither type is defined in the sources as a stolen item.

### 2.7 Battle loadout rule and AP

The loadout rule is from the Kingdom Hearts picks: one ability and one skill per Bondkin, one passive and one active. Every skill use takes a turn. Abilities cost AP to equip. That is the full rule in the sources.

The sources do not give AP costs for any ability, do not say if AP can be raised, and do not say if an equipped ability and an equipped skill can both be changed in battle. Those points are open.

### 2.8 Boss finisher, spitball only

Boss finisher rules at the tail end requiring a combination attack is a spitball in the Kingdom Hearts picks, not a locked rule. It is listed here only as a spitball. No combination is defined, no participants are defined, and no trigger is defined. Do not treat it as decided. See Open questions.

### Distinct items named in this section

Count: 14 distinct items named.

1. Drive orbs
2. Shards
3. Core Shard
4. Swords
5. Blades
6. Sabers
7. Shields
8. Armor
9. Shoes
10. Gloves
11. Accessories
12. U-Materials
13. Growth items
14. Mission items

Generic words in this section such as weapons, gear, and items are categories, not extra items in the count. Puffkin shops, The Lattice, treasure chests, and charging stations are places or systems, not items in the count.

### Open questions

- EP versus MP: the charging station pick says EP, the Bondkin bars say MP. Is EP a separate bar, a renamed MP bar, or a different resource for the character only?
- Healing items: is there an item that heals HP in battle, restores MP in battle, or revives a downed Bondkin, or is all healing by spell, by transforming, and by charging station only?
- Status cure items: what item, if any, cures each status effect in Section 2.4, and can a healing spell cure any of them?
- Status cause items: does any item cause a status effect, or do status effects come only from moves, Arts, Crafts, and skills?
- Item use and turns: does using an item in battle take a turn, the same as every skill use?
- Drive orbs: how much Surge Gauge does one drive orb give, can drive orbs be used in battle, and do they stack or have a grade?
- Transform refill: does the full HP and MP refill on transforming apply only to the transforming Bondkin, or to the deployed party?
- Item to attack: which weapon grants which skill, does an accessory grant a skill the same way, and does a learned skill stay after the gear is removed?
- AP: what is the AP cost of each ability, can AP be raised, and can loadout be changed in battle?
- Charging stations: which keeps and dungeons have one, can one be used more than once, and does it restore the Surge Gauge as well as HP and EP?
- Steal: which enemies can be stolen from, what can be stolen, does a stolen item go to inventory, how does steal to learn work, and how much EXP does stealing give?
- Status pacing: which status effects appear at which point in the game, and which characters can use status effect moves under the cap in Section 2.4?
- Boss finisher: is the combination attack finisher kept, and if so, what combination, who must take part, and what triggers it?

## 3. Growth and training items

This section covers items used to train and grow a Bondkin, items used by the Monster Bank daycare, and items used to evolve a Bondkin. A Bondkin is the trained partner. A Monster, also called Feral, is the wild one. A Monster becomes a Bondkin only after it is caught and trained. Wild Feral do not evolve before being caught. Bondkin cap is 200.

### 3.1 Growth items

- Growth items are kept from the Monster Bank pick: "Growth items, take it." The wording in new-game.md Items is: "Growth items: to train and grow Bondkin."
- No source defines what a growth item does in detail: no stat gain, no amount, no use timing, and no use rule beyond the general line is given.
- Growth items are distinct in the sources from gear learning: Bondkin learn abilities from gear, with AP to equip, one ability and one skill at a time, one passive and one active. The sources do not define any link between growth items and that AP gear system, or between growth items and Paths.
- Paths are Bondkin jobs: 117 Paths plus 30 Ascended Paths. The sources do not define whether growth items affect Path progress.

### 3.2 Monster Bank and daycare

- The Bank is Monster Bank plus daycare. Roster is 24 in The Bank, deploy 6.
- The Monster Bank pick says the daycare system goes inside the Monster Bank, the same thing as the Bank, in the style of Pokemon daycare.
- The only item the sources place in The Bank is the Growth Item, listed as found in The Bank, shops, missions.
- No other daycare item is named in the sources. The sources do not define what the daycare does with items, whether a creature left in the Bank gains levels, learns moves, or needs an item left with it, or whether there is a cost to use it.
- If all six deployed Bondkin are killed, the player is not auto sent to healing, and may choose other party members if they are available. That roster rule is from new-game.md, and no item changes it in the sources.

### 3.3 Evolution items

Distinct evolution items named in this section: 14. All 14 are from the Evolution Items list in new-game-evolution-system.md. No other evolution item is named there.

1. Growth Item - general evolution item, found in The Bank, shops, missions.
2. Fire Shard - evolve into that type.
3. Water Shard - evolve into that type.
4. Earth Shard - evolve into that type.
5. Air Shard - evolve into that type.
6. Dark Shard - evolve into that type.
7. Light Shard - evolve into that type.
8. Core Shard - swap type, for example Fire to Electric, and can trigger evolution.
9. Moon Stone - day / night evolution.
10. Sun Stone - day / night evolution.
11. Dusk Stone - day / night evolution.
12. Bond Stone - bond evolution, need Bond Lv 5+.
13. Hollow Stone - evolve into Hollow form, dark region only.
14. Echo Stone - evolve into Echo form, light region only.

- Hollow and Echo wording is not resolved in the sources: the same file also says Hollow and Echo are regional variants, not evolutions, and a variant carries through evolution. The stone list wording says evolve into Hollow form and evolve into Echo form. The sources do not resolve whether a stone creates the variant, or triggers evolution in a creature that already has the variant.
- One Dragon family example names a shard for a Drake to Wyvern evolution that does not match any of the 14 names above. The sources do not resolve whether that example uses a different name for Air Shard, or a separate item that is not listed. That example shard is not counted in the 14 above.

### 3.4 Evolution methods the items plug into

- Level: most evolve by level. Stage 1 to Stage 2 at Lv 16 to 25, Stage 2 to Stage 3 at Lv 32 to 50, depending on family. Stage sizes are Stage 1 = 0.7, Stage 2 = 0.85, Stage 3 = 1.0.
- Item: some evolve by a Growth Item, Shard, Stone, or Core Shard swap. Example in the sources: swap a Fire Core Shard for an Electric one, creature learns electric moves and can evolve into its electric form.
- Bond: some evolve by bond level. Fight together, bond up, evolve. Bondkin used a lot evolve faster.
- Time / day / night: some evolve only at day, only at night, or only in a specific world. Moon Stone, Sun Stone, and Dusk Stone are listed under day / night evolution, but the sources do not map each stone to a time of day.
- Evolution is a choice: when a Bondkin is ready to evolve, the player can say yes or no. If no, it keeps learning moves faster, then the player can evolve it later.
- Hollow and Echo are regional variants, not evolutions, and not shiny. Hollow adds Dark type, stronger attack, weaker defense. Echo adds Ghost type, stronger defense and speed, weaker attack. A Hollow or Echo variant carries through evolution: a Hollow Whelp evolves into a Hollow Drake, then a Hollow Dragon, and the same pattern applies to Echo.
- No evolution: legendaries, Totem Spirits, and some bosses do not evolve. They are Stage 3 only.

### 3.5 Bond and bond items

- Bond is built by fighting together. The evolution file says fight together, bond up, evolve, and Bondkin used a lot evolve faster.
- Bond Stone is the only bond item named in the sources. It is for bond evolution, and needs Bond Lv 5+.
- The sources name Bond Lv 5+ as a threshold, but do not define the bond level scale, what Bond Lv 1 to 4 do, how much bond is gained per fight, or whether bond changes anything other than evolution.
- The Trails pick is the source for bond levels in the design notes, but no bond level table is given in the sources read for this section.
- Growth items and bond: the sources do not define whether any growth item raises bond, or whether bond affects growth item use. That link is undefined.

### 3.6 Link trading - later, not now

- Link trading is mentioned in the Monster Bank pick as a later feature, to be created later. It is not part of growth and training items now, and no item for it is defined in the sources.

### Open questions

- What does a growth item do in detail: which stat or level effect, how much, when it can be used, and where it is obtained beyond The Bank, shops, and missions?
- What does the Monster Bank daycare do: does a creature left in the Bank gain levels or learn moves, does it need an item left with it, and is there a cost or time rule?
- How do growth items interact, if at all, with AP, gear learning, and Path progress for Bondkin?
- Which stone maps to which time: what are the exact day, night, and dusk rules for Moon Stone, Sun Stone, and Dusk Stone, and which worlds count for time or world evolution?
- Do Hollow Stone and Echo Stone create the Hollow or Echo variant, or do they trigger evolution in a creature that already has that variant, and does the dark region only and light region only rule apply to use, to the creature, or to both?
- Which shard name is correct for the Drake to Wyvern evolution example, and is the example shard the same as Air Shard under another name or a separate item not in the 14 item list?
- What is the Core Shard swap rule in full: which type swaps are allowed, does Electric exist as a type in this game, and does every swap trigger evolution or only some swaps?
- What is the bond scale: how is bond gained per fight, what do Bond Lv 1 to 4 do, and does bond affect anything other than Bond Stone evolution?
- What is Chemical X in FED-13, and does it have any role in growth, training, or evolution?
- Which Shard, if any, is used for Troll family branch evolutions and for Elemental family branch evolutions where the sources say "by Shard" without naming the shard?

## 4. Crafting, cooking, survival

This section covers the Undawn side of FED-13 RPG: craft, build, fight with creatures, survive. Biomes have different resources, enemies, and hazards. Crafting and survival support the adventure. They are not the main game. Food and water are an extra feature only. Hygiene is visual only.

### 4.1 Blueprints and the workbench

Two hard gates control all crafting.

- Blueprint: a blueprint is required to make a thing in the first place. No blueprint, no craft.
- Workbench: a workbench is required to even get to work. No workbench, no crafting.

Both gates come from the Undawn weapons and crafting pick, and both are kept. Where blueprints come from, and which workbench each recipe needs, is not picked yet. See the open questions at the end of this section.

### 4.2 Gathering and biome resources

Gathering is how crafting starts. The picked gathering actions are: chop wood, mine stone and ore, harvest plants, hunt animals, and fish. The picked basic tools are the axe, the pickaxe, and the fishing rod. Fishing catches fish.

Biomes have different resources, enemies, and hazards, but no per-biome resource list was picked. Which resource comes from which biome is an open question.

### 4.3 Weapon crafting and weapon modification

- Weapon crafting: cool but small in scope. Which weapons can be crafted and which cannot is not picked yet.
- Weapon modification system: keep. What a modification changes, and what it costs, is not picked yet.
- U-Materials upgrade character weapons, armor, shoes, and accessories. The picked gear set is swords, blades, sabers, shields, armor, elemental weapons, elemental armor, shoes, gloves, and accessories. Elemental weapons and elemental armor carry elemental weakness and resistance.
- Soulblade: the main player weapon, equippable and upgradable. Whether the Soulblade can be crafted or modified, or only upgraded with U-Materials, is not picked yet.
- Gear progression is viewed and enhanced. The amounts and steps for enhancement are not picked yet.

Synthesis at Puffkin shops, combining collected items to make new items, is a separate items system. It is not Undawn crafting and it is not covered here.

### 4.4 Roles that feed crafting

Roles belong to the character, not to Bondkin. Bondkin have Paths. Roles never affect Bondkin, and Bondkin jobs never affect roles. The picked roles are Logger, Miner, Gatherer, Hunter, Chef, Angler, Scavenger, and Firearms Master. That is 8 named roles, and the pick says 10 plus roles, so more roles exist but their names were not picked.

Role XP is the picked example: chop wood gains Logger points, and a Logger levels up to the top Logger rank one day. Character level and XP gain new abilities, skills, and talents. What each role grants as it levels, and whether every role gains points the same way as the Logger example, is not picked yet.

### 4.5 Cooking and the Chef role

Cooking and cooking results are side fun, from the Trails pick. The Chef role cooks. No dish names, no ingredient list, and no effect for cooked food was picked. What cooking makes, what it needs, and what cooking results do, if anything, are open questions.

### 4.6 Food and water

Food and water are an extra feature only, not a focus. The picked facts are: buy food, people give you water, find water, and water fountains and vending machines sit where they belong. Going unprepared into the desert should be a problem, but not a big problem. How much hunger and hydration food and water restore is not picked yet.

### 4.7 Survival indicators by biome

Survival indicators change based on where the character is.

- Hometown: hunger depletes slow.
- Desert: after a while, hunger and hydration deplete faster.
- Stinky area: mood drops faster.
- Poisonous swamp: health drops.
- City: fine, mood drops a little faster, everything else fine.

Penalties, in the picked order, are reduced stamina regen, weakened combat, and eventually health loss. Exact numbers, thresholds, and how fast each indicator moves are not picked yet. Body type does not matter and is dropped.

### 4.8 Hygiene

Hygiene is minor visual only, and it is not a focus. The character gets progressively dirtier visually until they shower. You can shower and use the bathroom in game. No gameplay effect for dirtiness was picked. Whether dirtiness stays visual only is an open question for Git-FED to confirm.

### 4.9 Homestead

The homestead is a personal plot of land where the character builds a base. The pick says take all of it, and double expand it if possible. Building uses gathered materials, and the picked building parts are wall, roof, stairs, door, decorative furnishing, multi-storey building, and interior space.

Storage: the backpack holds a fixed amount, and a storage cabinet at the homestead stores extra. How much extra a storage cabinet holds, and how many cabinets a homestead can have, is not picked yet.

Homestead levels gate character level:

- Lv1 caps the character at level 15.
- Lv2 unlocks the character to level 25.
- Farmland is active at Lv3.
- Relocate is available at Lv2.
- Upgrades happen at the Homestead Sign outside the home.

What homestead levels above Lv3 do, and what character level caps they gate past 25 toward the 150 character cap, is not picked yet. Inviting friends to the homestead and homestead raiding are both marked discuss later in the sources, so they are open questions, not mechanics.

### 4.10 Transport building and the Sky Skiff editor

Find material and build your transport. Buy the Sky Skiff editor and put it in your base to build a skateboard, a bike, and more. The Sky Skiff is for traversing faster, not a weapon. What materials each transport needs, what the Sky Skiff editor costs, and what else it can build past a skateboard and a bike is not picked yet. More than 50 vehicle types are also kept from Undawn, but how that list maps to the editor builds, the Sky Skiff, the Sky Galleon, and the Golden Strider is not picked yet.

### Distinct items named in this section

38 distinct items are named in this section: Axe, Pickaxe, Fishing rod, Wood, Stone, Ore, Plants, Fish, Blueprint, Workbench, Homestead Sign, Sword, Blade, Saber, Shield, Armor, Shoes, Gloves, Accessories, U-Materials, Soulblade, Elemental weapon, Elemental armor, Wall, Roof, Stairs, Door, Decorative furnishing, Storage cabinet, Farmland, Sky Skiff, Sky Skiff editor, Skateboard, Bike, Food, Water, Water fountain, Vending machine.

### Open questions

1. Where do blueprints come from, and does every craftable thing need one?
2. Which weapons can be crafted and which cannot, since weapon crafting is small in scope?
3. What does the weapon modification system change, and what does it cost?
4. Can the Soulblade be crafted or modified, or is it only upgraded with U-Materials?
5. Which resource comes from which biome, and which tools work where?
6. What are the remaining roles past the 8 named, to reach 10 or more, and what does each role grant as it levels?
7. What dishes exist, what ingredients do they need, and what do cooking results do, if anything?
8. Does cooking need a workbench, or its own station?
9. How much hunger and hydration do food and water restore, and where exactly do water fountains and vending machines sit?
10. What are the exact survival numbers and thresholds for each biome, and in what order do the penalties bite?
11. Does dirtiness ever affect anything, or is hygiene visual only for good?
12. What do homestead levels above Lv3 do, and what character level caps do they gate past 25 toward the 150 character cap?
13. How much extra does a storage cabinet hold, and how many cabinets can a homestead have?
14. What materials build each transport, what does the Sky Skiff editor cost, and what else can it build past a skateboard and a bike?
15. How do the 50 plus Undawn vehicle types map to the editor builds, the Sky Skiff, the Sky Galleon, and the Golden Strider?
16. Is there a refining step between gathering and crafting, and if so, where does it happen?
17. Inviting friends to the homestead: in or out, and how?
18. Homestead raiding: in or out, and how?

## 5. Gear and grading

Gear in FED-13 RPG comes from two picked systems kept together. The weapon, armor, and accessory range is the FFTA weapons and gear pick, kept in full. The way gear is viewed, enhanced, and upgraded is the Undawn gear progression pick, with character gear upgraded by U-Materials from the Trails pick. Bondkin learn abilities from weapons and accessories, and the character carries a Soulblade as the main player weapon. Every item is graded on one ladder, given in full in 5.9.

### 5.1 Weapons

Weapons kept in full from the FFTA pick are swords, blades, sabers, staff, daggers, katanas, spears, axes, bows, guns, and fists. The opening choice is Sword, Shield, or Staff, and that choice affects the main player. Buying a certain weapon can let the holder use a certain skill, under the item-to-attack pick. No individual named weapon is given in the sources, only these weapon categories.

Distinct items and gear categories named in this section: 21. They are swords, blades, sabers, staff, daggers, katanas, spears, axes, bows, guns, fists, shields, armors, elemental weapons, elemental armor, shoes, gloves, other accessories, costumes, Soulblade, and U-Materials.

### 5.2 Armor and accessories

Armor kept in full from the FFTA pick is shields and armors, plus shoes, gloves, and other accessories. Equipment slots exist for the character and for Bondkin. Costumes and accessory collecting are part of the character equipment system, so costumes are collected as gear in their own right and accessories are collected in the same way. The sources do not name individual armor pieces, costume pieces, or accessory pieces, only these categories and slots.

### 5.3 Elemental gear

Elemental gear is kept in full from the FFTA elements and status pick. It covers elemental weapons and elemental armor, with elemental weakness and resistance gear. The elements are Earth, Fire, Wind, Water, Time, Space, and Mirage, plus Dark for Hollow variants and Ghost for Echo variants. A Hollow variant has the Dark type added, and an Echo variant has the Ghost type added. The sources say elemental weapons and armor exist and that weakness and resistance exist, but they do not say which weapon or armor piece carries which element, or how much weakness or resistance any piece gives.

### 5.4 Gear progression and enhancement

Gear progression is the Undawn pick: equipment is viewed and enhanced. That pick is kept as stated, with no extra enhancement step added here. Enhancement applies to gear in general under that pick. How enhancement changes a piece, what it costs, and how far it can go are not stated in the sources, so they are listed as open questions below.

### 5.5 U-Material upgrades

Character equipment is upgradable with U-Materials, from the Trails pick. The pieces named for this upgrade are weapons, armor, shoes, and accessories for the character. U-Materials are the upgrade material named in the sources. No U-Material type, amount, or source is named in the sources, so those points are listed as open questions below. Bondkin gear is not named in the U-Material upgrade pick, only character gear.

### 5.6 Soulblade system

The Soulblade is the main player weapon, in Keyblade style. It is equippable and upgradable, and it sits inside the character equipment system alongside weapons, armor, shoes, and accessories. The sources do not name Soulblade forms, Soulblade upgrade steps, or how a Soulblade is first obtained, so those points are listed as open questions below.

### 5.7 Abilities learned from weapons and accessories

Bondkin learn ALL action, reaction, support, combo, and movement abilities from weapons and accessories. This is the FFTA abilities pick, kept in full. A Bondkin equips only one ability and one skill at a time, one passive and one active, and abilities cost AP to equip. Every skill use takes a turn. Buying a weapon can teach its skill, and stealing can also teach, under the steal to learn pick. The sources do not give AP costs for any ability, or how long a weapon or accessory must be equipped before its ability is learned, so those points are listed as open questions below.

### 5.8 Sources and New Game Plus

Weapons and gear come from shops, mission rewards, and the trade shop. Puffkin shops sell items, weapons, armor, and accessories. Mission rewards and the trade shop are named as sources in the same pick. No price, trade rate, or mission reward list is given in the sources. New Game Plus carries over equipment after clearing, so gear kept through a cleared run is kept into the next run.

### 5.9 Grading

Every item is graded. The grading ladder from new-game.md line 156, stated exactly, is:

F 0, E 1-21, D 22-51, C 52-79, B 80-99, A 100-139, S 140-169, SS 170-199, SSS 200-249, SSSS 250+

The grade applies to every item. That is what the sources say. The sources do not give a scoring formula, and no scoring formula is invented here. Anything the design does not say about how a score is earned, what a score measures, or what a grade changes is listed as an open question below.

### Open questions

- How is a grade score earned for an item, and what does the score measure? No formula is given in the sources.
- Does a grade change what an item does, or is it only a rank? The sources do not say.
- Does enhancing a piece, or upgrading it with U-Materials, change its grade or its score?
- Is the Soulblade graded on the same ladder as other items?
- Are costumes graded on the same ladder as weapons, armor, shoes, and accessories?
- What does SSSS 250+ mean in practice? Is 250 a floor with no cap, or is there a top score?
- How many equipment slots does the character have, and how many does a Bondkin have, and which slot takes each gear category?
- Which individual weapons, armor pieces, shoes, gloves, and accessories exist in each category? Only categories are named in the sources.
- Which element does each elemental weapon and elemental armor piece carry, and how much weakness or resistance does each piece give?
- Does Dark elemental gear relate only to Hollow variants, and does Ghost elemental gear relate only to Echo variants?
- What U-Material types exist, how many are needed for each upgrade, and where are U-Materials obtained?
- How is a Soulblade first obtained, and what are its upgrade steps?
- How much AP does each ability cost to equip, and must a weapon or accessory be equipped for a set time or a set number of battles before its ability is learned?
- How does the trade shop work, what can be traded there, and what are shop prices and mission reward lists?
- Does New Game Plus carry over grades and scores with the equipment, or only the equipment itself?

## 6. Mission, treasure, clan items

This section covers the items that come from missions, quests, dispatch, dungeon chests, town treasure hunts, clan play, and tournaments. Every mechanic here traces to a picked feature in the sources. Where the design is silent, the gap is listed under Open questions at the end of this section.

### 6.1 Mission items and story missions

Story missions run in order, and mission items gate that order. The pick states it plainly: story missions in order to get items to go on missions. A mission item is therefore both a requirement and a handout of the story mission chain. The sources do not name any single mission item by its own name, so no specific mission item is listed here beyond the type itself: mission item.

### 6.2 Quests and quest rewards

Quests are mandatory content. The Trails pick says quests, no choice, must add, and quest rewards come with them. Every quest carries a quest reward. The sources do not fix a reward table per quest, so this section does not assign one. Quest rewards draw from the named item pool listed in 6.9.

### 6.3 Dispatch and guild missions

This is Git-FED's favorite part of the FFTA picks, and it is the reason the 24 clan slots exist. The dispatch system covers four mission kinds, all kept:

- Dispatch missions for characters
- Story missions
- Guild missions
- Turf missions

The whole guild thing is kept: dispatch system, guild missions, mission items, and reports. A dispatch deploys for 5, 10, or 20 days. The player walks around for a few days till the dispatched party comes back. On return, the dispatch brings back mission items and a dispatch report. The dispatch report is the return item that records what the dispatched party did and brought back.

One conflict is recorded here, not resolved: the world map pick scrapped calendar days passing as the player moves on the map, because it made no sense, yet dispatch lengths are still stated in days. How dispatch days are counted is an open question.

### 6.4 Treasure chests in dungeons

Dungeons are one of the 8 location types on the world map. The Trails pick keeps treasure chests with all the items in them, in dungeons. A dungeon chest holds items from the named item pool in 6.9. The sources do not say whether chest contents differ by dungeon, or whether any chest holds a fixed item, so this section claims neither.

Charging stations in keeps and dungeons restore HP and EP free. They are named here only because they sit in the same pick line as dungeon chests. They are not items, and their rules belong with dungeon systems, not with this section.

### 6.5 Treasure hunt in towns

The world map shows 5 visible towns. The FFTA world map pick adds treasure hunt: every time the player enters a new town, the player has the ability to find new items there. Each new town therefore holds new items to find. The sources do not name which items belong to which town, and they do not name the 5 towns.

Shore is named in the same world map pick line as treasure hunt, but the sources do not state what role the shore plays in finding items. Its item role is an open question.

Food and water are named as findable and givable items in the Undawn picks: buy food, people give you water, find water, with water fountains and vending machines where they belong. They sit in the named item pool as town-findable items on that basis only.

### 6.6 Clan turf and clan battles for items

The full clan system is kept. The numbers are fixed by the picks:

- Clan size up to 24
- Deploy up to 6 per battle
- The main six are shown, with an arrow button to show the full 24 member party
- If all six deployed party members are killed, the player loses the battle, but is not automatically sent to a healing area. The player has the choice to use the other party members if they are available.

Clan titles, levels, and skills are kept. Clan turf and territory are kept. Clan battles are for items, and clan battles are 6v6. The sources do not name which items a clan battle or a turf win awards, so this section does not assign any.

Totem Spirits are a kept item type in the picks. The sources do not say whether clan battles award Totem Spirits, so that link is an open question, not a rule.

Growth items are kept in the FFTA weapons and gear pick and in the Monster Bank pick. They are the items used to train and grow Bondkin, and they sit in the named item pool as items a mission or clan reward can hand out, on the same basis as weapons, armor, shoes, and accessories, which the sources say come from shops, mission rewards, and trade shop.

### 6.7 Judge and laws, tournaments only

Scope note: the judge and law system applies at tournaments only, not everywhere in the game. That limit is part of the pick, and everything outside tournaments is out of scope for this section.

The judge items kept for tournaments are: judge points, yellow card, red card, and jail. Jail means contest jail only, for the duration of the match or tournament, not real jail, just for fun.

The only place judge rules touch items in this section is tournament rewards. How judge points, yellow cards, or red cards affect tournament rewards is not stated in the sources and is an open question. Law cards, anti laws, enemy laws, and judge areas belong with tournament and combat rules, not with this section.

### 6.8 Kept side systems: prison and card share

Prison was kept in the FFTA side systems picks. Card share was kept in the same picks. The design does not say what items either system uses. The item side of both is an open question. No prison item and no card share item is invented here.

### 6.9 Named items in this section

18 distinct items are named in this section: 1. mission item, 2. dispatch report, 3. quest reward, 4. growth item, 5. weapon, 6. armor, 7. shoes, 8. accessory, 9. Shard, 10. Core Shard, 11. drive orb, 12. U-Material, 13. currency, 14. material, 15. food, 16. water, 17. Soulblade, 18. Totem Spirit. Shards and Core Shards slot into The Lattice to gain stats, passive effects, and Arts, and drive orbs fill the Surge Gauge. The Soulblade is the main player weapon system, equippable and upgradable, and it is named here as a weapon type mission rewards can hand out, since the sources say weapons come from mission rewards.

### Open questions

1. What are the names of the 5 visible towns, and what are the 8 location types? Dungeons is named as one location type. The other seven are not named in the sources.
2. How are dispatch days counted, now that calendar days passing as the player moves on the map was scrapped?
3. Do dispatch returns give anything beyond mission items and dispatch reports, and do the 5, 10, and 20 day lengths change what comes back?
4. Is each quest reward fixed per quest, or drawn from the named item pool?
5. Do dungeon chests hold the full named item pool, and do chest contents differ by dungeon?
6. Which new items does each town's treasure hunt give, and what role does the shore play in the treasure hunt?
7. Which items do clan battles and turf wins award, and do Totem Spirits come from clan battles?
8. What are tournament rewards under judge rules, and do judge points, yellow cards, or red cards change them?
9. What items, if any, do prison and card share use?
10. Do clan titles, levels, and skills gate any items, and if so, which ones?

## 7. Complete item index

Every distinct item named anywhere in this file, de-duplicated. 69 in total. Quest reward, currency, material, and cooking results are categories or generics, not single items, and are marked as such. The currency is unnamed in the design.

Weapons (13): Sword, Blade, Saber, Staff, Dagger, Katana, Spear, Axe, Bow, Gun, Fists, Soulblade, Elemental weapon.

Armor and gear (7): Shield, Armor, Elemental armor, Shoes, Gloves, Accessories, Costumes.

Shards (8): Shard, Fire Shard, Water Shard, Earth Shard, Air Shard, Dark Shard, Light Shard, Core Shard.

Gauge (1): Drive orb.

Growth and evolution (7): Growth Item, Moon Stone, Sun Stone, Dusk Stone, Bond Stone, Hollow Stone, Echo Stone.

Mission and clan (4): Mission item, Dispatch report, Quest reward (category), Totem Spirit.

Crafting and gathering (17): Blueprint, Workbench, Pickaxe, Fishing rod, Wood, Stone, Ore, Plants, Fish, Homestead Sign, Wall, Roof, Stairs, Door, Decorative furnishing, Storage cabinet, Farmland.

Transport (4): Sky Skiff, Sky Skiff editor, Skateboard, Bike.

Food and survival (5): Food, Water, Water fountain, Vending machine, Cooking results (category).

Materials (3): U-Materials, Currency (unnamed), Material (generic).

## 8. Open questions for Git-FED

Every open question from sections 1 to 6, merged so no question is asked twice. 72 in total. The number in brackets is the section the question came from.

Currency, shops, trade:
1. What is the currency called, how is it earned, and what are the prices? (1)
2. Are there shop tiers at all, and if so, what are the tier names, unlock rules, and stock differences? (1)
3. Does shop stock differ by town, or do new towns only add new treasure-hunt finds while shop stock stays the same? (1)
4. Do mission rewards ever change shop stock, with new items appearing in shops after missions are cleared? (1)
5. Can the player sell items back to Puffkin shops, and if so, for how much? (1)
6. Which items are shop-only, which are synthesis-only, and which come from both? (1)
7. How does the trade shop work, what can be traded there, what does it accept, where is it found, how does it differ from a Puffkin shop, and what are shop prices and mission reward lists? (1, 5)

Synthesis and crafting:
8. What are the synthesis recipes: which collected items combine into which new items, and are recipes fixed, discovered, or gated by blueprints? (1)
9. Where do blueprints come from, does every craftable thing need one, and does synthesis at a Puffkin shop need a blueprint and a workbench there, or does the workbench live at the homestead or elsewhere? (1, 4)
10. What does the weapon modification system change, what does it cost, and does it need blueprints or a workbench? (1, 4)
11. Which weapons can be crafted and which cannot, since weapon crafting is small in scope? (4)
12. How is a Soulblade first obtained, what are its upgrade steps, and can it be crafted or modified, or is it only upgraded with U-Materials? (4, 5)
13. Does cooking need a workbench, or its own station? (4)
14. Is there a refining step between gathering and crafting, and if so, where does it happen? (4)

Shards and The Lattice:
15. Are Shards and Core Shards sold in shops, synthesized only, or both? (1)
16. What is the Core Shard swap rule in full: which type swaps are allowed, does Electric exist as a type in this game, and does every swap trigger evolution or only some swaps? (3)

Combat, HP and MP, status:
17. EP versus MP: the charging station pick says EP, the Bondkin bars say MP. Is EP a separate bar, a renamed MP bar, or a different resource for the character only? (2)
18. Healing items: is there an item that heals HP in battle, restores MP in battle, or revives a downed Bondkin, or is all healing by spell, by transforming, and by charging station only? (2)
19. Status cure items: what item, if any, cures each status effect, and can a healing spell cure any of them? (2)
20. Status cause items: does any item cause a status effect, or do status effects come only from moves, Arts, Crafts, and skills? (2)
21. Item use and turns: does using an item in battle take a turn, the same as every skill use? (2)
22. Transform refill: does the full HP and MP refill on transforming apply only to the transforming Bondkin, or to the deployed party? (2)
23. Item to attack: which weapon grants which skill, does an accessory grant a skill the same way, and does a learned skill stay after the gear is removed? (2)
24. Charging stations: which keeps and dungeons have one, can one be used more than once, and does it restore the Surge Gauge as well as HP and EP? (2)
25. Steal: which enemies can be stolen from, what can be stolen, does a stolen item go to inventory, how does steal to learn work, and how much EXP does stealing give? (2)
26. Status pacing: which status effects appear at which point in the game, and which characters can use status effect moves under the cap? (2)
27. Boss finisher: is the combination attack finisher kept, and if so, what combination, who must take part, and what triggers it? (2)
28. Drive orbs: are they sold in Puffkin shops or only found in the field, how much Surge Gauge does one drive orb give, can drive orbs be used in battle, and do they stack or have a grade? (1, 2)

AP and loadout:
29. What is the AP cost of each ability, can AP be raised, can loadout be changed in battle, and must a weapon or accessory be equipped for a set time or a set number of battles before its ability is learned? (2, 5)

Growth, evolution, bond:
30. What does a growth item do in detail: which stat or level effect, how much, when it can be used, and where is it obtained beyond The Bank, shops, and missions? (3)
31. What does the Monster Bank daycare do: does a creature left in the Bank gain levels or learn moves, does it need an item left with it, and is there a cost or time rule? (3)
32. How do growth items interact, if at all, with AP, gear learning, and Path progress for Bondkin? (3)
33. Which stone maps to which time: what are the exact day, night, and dusk rules for Moon Stone, Sun Stone, and Dusk Stone, and which worlds count for time or world evolution? (3)
34. Do Hollow Stone and Echo Stone create the Hollow or Echo variant, or do they trigger evolution in a creature that already has that variant, and does the dark region only and light region only rule apply to use, to the creature, or to both? (3)
35. Which shard name is correct for the Drake to Wyvern evolution example, and is the example shard the same as Air Shard under another name or a separate item not in the 14 item list? (3)
36. What is the bond scale: how is bond gained per fight, what do Bond Lv 1 to 4 do, and does bond affect anything other than Bond Stone evolution? (3)
37. What is Chemical X in FED-13, and does it have any role in growth, training, or evolution? (3)
38. Which Shard, if any, is used for Troll family branch evolutions and for Elemental family branch evolutions where the sources say "by Shard" without naming the shard? (3)

Gear, grading, U-Materials:
39. How is a grade score earned for an item, and what does the score measure? No formula is given in the sources. (5)
40. Does a grade change what an item does, or is it only a rank? (5)
41. Does enhancing a piece, or upgrading it with U-Materials, change its grade or its score? (5)
42. Is the Soulblade graded on the same ladder as other items? (5)
43. Are costumes graded on the same ladder as weapons, armor, shoes, and accessories? (5)
44. What does SSSS 250+ mean in practice? Is 250 a floor with no cap, or is there a top score? (5)
45. How many equipment slots does the character have, and how many does a Bondkin have, and which slot takes each gear category? (5)
46. Which individual weapons, armor pieces, shoes, gloves, and accessories exist in each category? Only categories are named in the sources. (5)
47. Which element does each elemental weapon and elemental armor piece carry, and how much weakness or resistance does each piece give? (5)
48. Does Dark elemental gear relate only to Hollow variants, and does Ghost elemental gear relate only to Echo variants? (5)
49. What U-Material types exist, how many are needed for each upgrade, and where are U-Materials obtained? (5)
50. Does New Game Plus carry over grades and scores with the equipment, or only the equipment itself? (5)

Missions, dispatch, treasure, clan:
51. What are the names of the 5 visible towns, and what are the 8 location types? Dungeons is named as one location type. The other seven are not named in the sources. (6)
52. How are dispatch days counted, now that calendar days passing as the player moves on the map was scrapped? (6)
53. Do dispatch returns give anything beyond mission items and dispatch reports, and do the 5, 10, and 20 day lengths change what comes back? (6)
54. Is each quest reward fixed per quest, or drawn from the named item pool? (6)
55. Do dungeon chests hold the full named item pool, and do chest contents differ by dungeon? (6)
56. Which new items does each town's treasure hunt give, and what role does the shore play in the treasure hunt? (6)
57. Which items do clan battles and turf wins award, and do Totem Spirits come from clan battles? (6)
58. What are tournament rewards under judge rules, and do judge points, yellow cards, or red cards change them? (6)
59. What items, if any, do prison and card share use? (6)
60. Do clan titles, levels, and skills gate any items, and if so, which ones? (6)

Survival, food, homestead, roles:
61. Which resource comes from which biome, and which tools work where? (4)
62. What are the remaining roles past the 8 named, to reach 10 or more, and what does each role grant as it levels? (4)
63. What dishes exist, what ingredients do they need, and what do cooking results do, if anything? (4)
64. How much hunger and hydration do food and water restore, and where exactly do water fountains and vending machines sit? (4)
65. What are the exact survival numbers and thresholds for each biome, and in what order do the penalties bite? (4)
66. Does dirtiness ever affect anything, or is hygiene visual only for good? (4)
67. What do homestead levels above Lv3 do, and what character level caps do they gate past 25 toward the 150 character cap? (4)
68. How much extra does a storage cabinet hold, and how many cabinets can a homestead have? (4)
69. What materials build each transport, what does the Sky Skiff editor cost, and what else can it build past a skateboard and a bike? (4)
70. How do the 50 plus Undawn vehicle types map to the editor builds, the Sky Skiff, the Sky Galleon, and the Golden Strider? (4)
71. Inviting friends to the homestead: in or out, and how? (4)
72. Homestead raiding: in or out, and how? (4)
