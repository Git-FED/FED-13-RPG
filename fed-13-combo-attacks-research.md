# FED-13 Combo Attacks Research

Research date: 2026-11-22. Sources: Final Fantasy Wiki, GameFAQs guides (Mechanics Guide by Terence Fergusson, Dark_Vortex FFTA2 guide, Dev FAQ), GameSpot walkthroughs, the official FFTA instruction booklet, StrategyWiki, RPGamer, and the FFTA2 Clan Privilege and Opportunity Command pages. Every claim below carries its source. Combo attacks are the most important system in FED-13, so this file is thorough.

Headline finding: only Final Fantasy Tactics Advance has a combo system. The original Final Fantasy Tactics (PS1) has no combo system at all. Final Fantasy Tactics A2 removed combos entirely and replaced them with Opportunity Commands and the Smash Gauge. FED-13 takes its combo system from FFTA.

## 1. Final Fantasy Tactics Advance (GBA): the combo system

### 1.1 What a combo is and how it triggers

- Combos are a fourth ability category in FFTA, separate from action, reaction, and support abilities. Combo abilities allow party members to initiate or join in on a combo. Source: Final Fantasy Wiki, Final Fantasy Tactics Advance abilities page, https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_Advance_abilities
- In game description: "All allies with combo abilities attack together." Source: Final Fantasy Wiki, Combo (Tactics Advance), https://finalfantasy.fandom.com/wiki/Combo_(Tactics_Advance)
- A combo is selected with the separate Combo command in battle, as an alternative to the Fight command. Source: FFTA instruction booklet, https://dn720001.ca.archive.org/0/items/final-fantasy-tactics-advance-usa-manual/3.5%20Manual%20Scan_text.pdf
- To initiate, the initiator must have at least 1 Judge Point (JP) and must have a combo ability set. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- Joiners do not need JP. Only the initiator's JP matters, and joiners do not spend JP. Source: GameFAQs Mechanics Guide, https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/26262
- Joiners do not need to take a turn, act consecutively, or be adjacent to the initiator. When the initiator selects a target, all allied units equipped with a combo ability and in range of that same enemy pulse white and may join. Source: GameFAQs Mechanics Guide
- There is no turn order combo window. Turn order itself is Speed based, with a Counter that increments by Speed each clocktick and a turn at 1000, ties broken by starting position, west first then north, and Quick taking priority. Combos bypass that sequencing because joiners act instantly during the initiator's turn. Source: GameFAQs Mechanics Guide
- A combo targets one enemy only. No source found for a combo hitting multiple enemies or an area. Source: Final Fantasy Wiki, Combo (Tactics Advance)

### 1.2 Positioning, range, and weapon rules

- Initiator range: the initiator may Combo anything within the range of the weapon currently equipped. Source: GameFAQs Mechanics Guide
- Joiner range: measured from the joiner to the target, not from the joiner to the initiator, and not from the joiner's weapon. Each combo ability has its own unique join range. Source: GameFAQs Mechanics Guide
- Example from GameFAQs: an Assassin with Killer Combo 2 squares from the target was in range, a Juggler with Gun Combo 5 squares away was in range, and a Gunner with Gun Combo 6 squares away was out of range because Gun Combo range is 5 regardless of weapon equipped. Source: GameFAQs FFTA board, https://gamefaqs.gamespot.com/boards/560436-final-fantasy-tactics-advance/42177943
- Animation and range of the finishing strike are determined by the initiator's equipped weapon. Accuracy, damage added, elemental alignment, and join range are determined by the type of combo equipped. Source: GameSpot FFTA walkthrough, https://www.gamespot.com/articles/final-fantasy-tactics-advance-walkthrough/1100-6072833/
- A combo takes the element of the initiator's weapon. Source: GameFAQs Mechanics Guide
- Joiner weapon, Weapon Attack, level, and other joiner stats do not matter for whether they add their percentage. The GameFAQs example states the Assassin hits regardless of the Assassin's weapon, Weapon Attack, level, or anything else. Source: GameFAQs FFTA board
- Maximum participants: at most 6 units can be deployed in a battle, so the theoretical maximum is 1 initiator plus 5 joiners. Guests can push the side above 6 in some missions, but they are not controllable. Source: Final Fantasy Wiki, FFTA walkthrough pages
- The Mechanics Guide's best damage example uses 4 allies with 15 percent combos plus 1 ally with Monk Combo or Gadget Combo, plus the initiator, which is 6 units total. Source: GameFAQs Mechanics Guide

### 1.3 Exact damage mechanics

- The initiator's attack is 100 percent accurate, ignores reaction abilities, and deals damage equal to a basic attack with the primary weapon. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- Base damage is non-random and is exactly the predicted damage from the Fight command, including weapon element and other bonuses, before the combo multiplier is applied. Source: GameFAQs Mechanics Guide
- Chain hit test for each joiner: if Rand 0 to 9999 divided by 100 is less than Hit percent, the combo succeeds. The enemy cannot alter this chance with any kind of evasion. Source: GameFAQs Mechanics Guide
- If no ally joins, or no joining combo connects, the multiplier stays at 100 percent. The finishing strike does normal damage no matter how much JP the initiator had. Source: GameFAQs Mechanics Guide
- If at least one joining combo connects, each connecting combo adds its Power percent to the multiplier, starting from 100 percent. Example in the Mechanics Guide: two 10 percent combos and a 5 percent combo make 125 percent. Source: GameFAQs Mechanics Guide
- JP formula, only applied if at least one joiner connects, and only using the initiator's JP: Final Multiplier equals Multiplier times (10 plus 4 times JP) divided by 10. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- At 5 JP the multiplier is multiplied by 3. At 10 JP it is multiplied by 5. Source: GameFAQs Mechanics Guide
- Worked example from GameFAQs: 100 base damage, Killer Combo adds 10 percent to make 110 percent, Gun Combo fails, then with 10 JP the multiplier becomes 110 percent times (10 plus 40) divided by 10, equal to 550 percent, so 100 damage becomes 550 damage. Source: GameFAQs FFTA board
- Maximum stated in the Mechanics Guide: 860 percent of normal damage, requiring four allies each with 15 percent Power combos, a single ally with Monk Combo or Gadget Combo for range, 10 JP on the initiator, and the initiator using a ranged weapon. The math is (100 plus 60 plus 12) equals 172 percent, times 5 equals 860 percent. Source: GameFAQs Mechanics Guide
- Overall damage cap in the Mechanics Guide damage algorithm is 999 maximum. Source: GameFAQs Mechanics Guide
- Double Sword exception: with Double Sword equipped, the unit begins with a standard hit chance strike from the primary weapon before the combo begins. That pre-hit can miss, but the combo is still advantageous. Source: GameFAQs Mechanics Guide
- Tradeoff noted in the Mechanics Guide: combos with more range or more damage added are usually less accurate. Source: Final Fantasy Wiki, Combo (Tactics Advance)

### 1.4 Costs and resources: AP, JP, MP

- Combo use in battle costs 0 MP. Source: RPGClassics FFTA guide, https://alexandria.rpgclassics.com/GBA/finalfantasytacticsadvance/finalfantasytacticsadvance_8.txt
- Learning cost: every combo ability costs 100 AP to master. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- JP cost: the initiator uses up all JP currently held in the attack. Other participating units use no JP. Source: FFTA instruction booklet
- The GameFAQs Board FAQ states the same: combo abilities cost JP, cannot be used at 0 JP, and no matter how much JP you have, you lose all of your JP when using a combo. Source: GameFAQs FFTA board, https://gamefaqs.gamespot.com/boards/560436-final-fantasy-tactics-advance/44957549?page=1
- Correction to one source: the me_frog GameFAQs guide says "Combos cost one judge point." That contradicts the manual, the Mechanics Guide, the Final Fantasy Wiki, and the Board FAQ, which all say all JP is spent. Do not use the one JP claim. Source for the incorrect line: https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/25687
- JP maximum is 10 per character. Source: Final Fantasy Wiki, Judge Points, http://finalfantasy.fandom.com/wiki/Judge_Points
- JP are earned by legally KOing an opponent, 1 JP to the unit dealing the final blow, or by performing an action recommended by the law of the day, 1 JP. Source: FFTA instruction booklet
- A character can gain a maximum of one JP per turn. Source: https://aperiodic.net/pip/archives/Video_Games/final-fantasy-tactics-advance/
- JP cannot be stacked from one action. Using Last Breath to KO an opponent under a Holy law does not grant two JP. Source: Final Fantasy Wiki, Judge Points
- The other JP spend is Totema summoning, which requires 10 JP, the maximum a character can hold. Source: Final Fantasy Wiki, Judge Points
- Units can also lose JP through penalties. Source: FFTA instruction booklet
- JP transfer and theft: Thief Steal: JP, learned for 200 AP from Orichalcum, range 1, attempts to steal one Judge Point from the target. Source: FFTA/A2 Wiki, FFTA Hume Thief, https://ffta-a2.fandom.com/wiki/FFTA_-_Hume_-_Thief
- Bishop Prayer ability Judge, costs 6 MP, learned for 300 AP from the Cheer Staff, steals up to two Judge Points from a target, range 3, cannot be reflected, can be countered with Return Magic, and is stealable through Steal: Ability. Source: Final Fantasy Wiki, Judge (ability), https://finalfantasy.fandom.com/wiki/Judge_(ability)
- Hunter skill Hunting awards ten Judge Points upon a successful kill. Source: Final Fantasy Wiki, Judge Points

### 1.5 Every named FFTA combo ability: 33 total

All cost 100 AP to master. All are learned from Mythril Weapons, which can only be obtained as rewards for defeating another clan or via trading from Nono's shop. Source for the learning route: Final Fantasy Wiki, Combo (Tactics Advance). Table source for Range, Power, and Hit for all rows: Final Fantasy Wiki, Combo (Tactics Advance). Job mapping source: Final Fantasy Wiki, Final Fantasy Tactics Advance abilities.

- Combat Combo: Soldier (Hume) and Warrior (Bangaa), Mythril Sword, Range 1, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for soldiers and warriors."
- Knight Combo: Paladin, Mythril Brand, Range 1, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for paladins."
- Fight Combo: Fighter, Mythril Blade, Range 1, Power 15 percent, Hit 70 percent. Flavor: "Easily chained combo ability for fighters."
- Thief Combo: Thief, Mythril Knife, Range 2, Power 5 percent, Hit 70 percent on the Wiki, 100 percent in the Mechanics Guide, see the discrepancies section. Flavor: "Failproof combo ability for thieves."
- Ninja Combo: Ninja, Mythril Epee, Range 2, Power 5 percent, Hit 100 percent. Flavor: "Failproof combo ability for ninjas."
- White Combo: White Mage, Mythril Staff, Range 4, Power 5 percent, Hit 60 percent. Flavor: "Ranged combo ability for white mages."
- Black Combo: Black Mage, Mythril Rod, Range 4, Power 5 percent, Hit 60 percent. Flavor: "Ranged combo ability for black mages."
- Spell Combo: Illusionist, Mythril Rod, Range 4, Power 10 percent, Hit 40 percent. Flavor: "Ranged combo ability for illusionists."
- Blue Combo: Blue Mage, Mythril Saber, Range 4, Power 10 percent, Hit 40 percent. Flavor: "Ranged combo ability for blue mages."
- Bow Combo: Archer, Mythril Bow, Range 6, Power 5 percent, Hit 40 percent. Flavor: "Long-ranged combo ability for archers."
- Hunt Combo: Hunter, Mythril Shot, Range 4, Power 8 percent, Hit 50 percent. Flavor: "Ranged combo ability for hunters."
- Animal Combo: Animist (Moogle), Mythril Bell, Range 1, Power 12 percent, Hit 100 percent. Flavor: "Failproof combo ability for animists."
- Charge Combo: Mog Knight, Mythril Blade, Range 1, Power 15 percent, Hit 70 percent. Flavor: "Easily chained combo ability for mog knights."
- Gun Combo: Gunner, Mythril Gun, Range 5, Power 5 percent, Hit 40 percent. Flavor: "Long-ranged combo ability for gunners."
- Juggle Combo: Juggler, Mythril Knife, Range 3, Power 10 percent, Hit 70 percent. Flavor: "Easily chained combo ability for jugglers."
- Gadget Combo: Gadgeteer, Mythril Claws, Range 6, Power 12 percent, Hit 30 percent. Flavor: "Long-ranged combo ability for gadgeteers."
- Time Combo: Time Mage, Mythril Rod, Range 4, Power 5 percent, Hit 60 percent. Flavor: "Ranged combo ability for time mages."
- Beast Combo: Beastmaster (Nu Mou), Mythril Bell, Range 1, Power 12 percent, Hit 100 percent. Flavor: "Failproof combo ability for beastmasters."
- Morph Combo: Morpher, Mythril Soul, Range 2, Power 10 percent, Hit 100 percent. Flavor: "Ranged combo ability for morphers."
- Gold Combo: Alchemist, Mythril Mace, Range 2, Power 10 percent, Hit 60 percent. Flavor: "Ranged combo ability for alchemists."
- Wise Combo: Sage, Mythril Mace, Range 2, Power 10 percent, Hit 60 percent. Flavor: "Ranged combo ability for sages."
- Monk Combo: White Monk (Bangaa), Mythril Claws, Range 2, Power 12 percent, Hit 90 percent. Flavor: "Very easy chained combo ability for white monks."
- Pray Combo: Bishop (Bangaa), Mythril Staff, Range 4, Power 8 percent, Hit 60 percent. Flavor: "Ranged combo ability for bishops."
- Sacred Combo: Templar, Mythril Brand, Range 1, Power 12 percent, Hit 100 percent. Flavor: "Failproof combo ability for templars."
- Dragon Combo: Dragoon, Mythril Spear, Range 2, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for dragoons."
- Defend Combo: Defender, Mythril Brand, Range 1, Power 15 percent, Hit 70 percent. Flavor: "Easily chained combo ability for defenders."
- Sword Combo: Gladiator, Mythril Blade, Range 1, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for gladiators."
- Lunge Combo: Fencer (Viera), Mythril Rapier, Range 1, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for fencers."
- Spirit Combo: Elementalist, Mythril Rapier, Range 3, Power 10 percent, Hit 60 percent. Flavor: "Well-balanced combo ability for elementalists."
- Red Combo: Red Mage, Mythril Rapier, Range 2, Power 10 percent, Hit 70 percent. Flavor: "Easily chained combo ability for red mages."
- Summon Combo: Summoner, Mythril Staff, Range 4, Power 10 percent, Hit 40 percent. Flavor: "Ranged combo ability for summoners."
- Killer Combo: Assassin, Mythril Epee, Range 2, Power 10 percent, Hit 100 percent. Flavor: "Failproof combo ability for assassins."
- Sniper Combo: Sniper, Mythril Shot, Range 4, Power 8 percent, Hit 50 percent. Flavor: "Ranged combo ability for snipers."

No combo ability exists for the special jobs Biskmatar, Hermetic, Judge, Judgemaster, Runeseeker, or the New Kid school jobs. The Final Fantasy Wiki abilities page lists those under Other jobs with no combo attached. Source: Final Fantasy Wiki, Final Fantasy Tactics Advance abilities.

### 1.6 Judge and law system as it relates to combos

- Judges award JP to combatants who perform recommended actions, and issue Yellow and Red Cards to any unit successfully performing forbidden actions. They also teleport Red Card units to prison. Source: Final Fantasy Wiki, Judge (Tactics Advance), https://finalfantasy.fandom.com/wiki/Judge_(Tactics_Advance)
- Every day a certain action, element, weapon type, job skill, and/or status effect is forbidden during a standard engagement. If a fighter performs the forbidden action, the Judge issues a card. The card type depends on the effect of the action. Source: Final Fantasy Wiki, Law system (Tactics Advance), https://finalfantasy.fandom.com/wiki/Law_system_(Tactics_Advance)
- First break without a KO: Yellow Card, unit continues fighting. Break with a KO: Red Card, unit is removed from battle. Breaking the law twice in one battle, even under different laws, gives Yellow then Red in sequence. If Marche gets a Red Card, it is instant Game Over. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Reactions are not bound by the law, including Dmg2 and Weapon Type laws. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Forbidden types include Actions (Fight, Color Magic, Items, Dmg2), Elements (Fire, Ice, Thunder, Wind, later Dark and Holy), Weapon Type, Job Skills, and Status effects (Charm, Bind / Immobilize, Berserk, later status ailments outright). Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Recommended actions counter the forbidden laws and grant one JP whether or not the user scores a KO. For most laws the recommended action is the opposite of the forbidden law, for example Ice is recommended when Fire is banned. Recommended actions are not in the Japanese version. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Punishments after battle are random and get harsher as cards build up: Card Fine (confiscation of about 3 law cards), EqpItem Fine, Gil Fine, Item Fine, Stat Reductions (one stat permanently reduced), Monster Run (a captured monster released from the Monster Bank), and Volunteer (no gil from winning). Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Red Card units go to Sprohm Prison, cannot take part in Dispatch, Engagements, or Captures, and cannot have equipped items managed. Bail can free them early, but cards stay on record until a pardon is paid for at the prison. Marche serves jail time in days, others in battles. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Laws start at one per day, then rise to two, then three, with Lawshifts adding new laws each time a Totema is defeated. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- The Ganging Up law specifically penalizes initiating a combo attack. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Ganging Up is Rank 3, R3. Its text in the Laws FAQ is: "Using a combo, Only the initiating unit is rewarded/penalized." Source: RPGClassics FFTA Laws FAQ, http://alexandria.rpgclassics.com/GBA/finalfantasytacticsadvance/finalfantasytacticsadvance_15.txt
- Only the initiator is penalized or rewarded, not the joiners. The GameFAQs Gameplay Guide states: "The Ganging Up law prohibits the Combo command, but only the character initiating the combo is penalized." Source: GameFAQs FFTA Gameplay Guide, https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/62342
- A forum correction to a common misunderstanding states the same: you get a yellow card every time you use the Combo command under Ganging Up, even if no one else joins in. Source: https://www.cheathappens.com/show_board2.asp?headID=19445&titleID=7851
- Ganging Up paired law: in the Laws FAQ, Copycat is listed with Recommended: Ganging Up, and Ganging Up is listed with Forbidden: Copycat, meaning the two are paired as forbidden versus recommended on a given day. Source: RPGClassics FFTA Laws FAQ

### 1.7 Law cards and Anti-Laws

- After Mission 006 Antilaws, the player can collect cards to influence the law during an engagement. Four types: Law Cards add a law, Anti-Law Cards nullify a law, R# Anti-Law Cards nullify all laws of the same rank, Almighty Anti-Law nullifies all laws for the battle. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- White cards with a pink crescent moon are Law Cards, used to add new World Laws. Black cards with a yellow star are Anti-Law Cards, used to remove or disable World Laws. Maximum carry is 12 cards. Source: GameSpot FFTA walkthrough
- R# Anti-Law Cards disable all laws of that rank. For example, an R2 Anti-Law Card disables Fight Ban, which is Rank 2. All-Mighty is the only R7 card and disables all laws regardless of rank. Source: GameSpot FFTA walkthrough
- Law Ranks run 1 to 6, with only two Rank 7 laws in existence, seen only in specific battles. Rank is determined by how strict the law is and which laws an R# Anti-Law removes. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- The two Rank 7 laws are NoLawCrds, forbidding use of law cards during Bervenia Palace tourney missions 040 to 043, and NoClrMgc, in mission 041 Mage Tourney, preventing any attack other than Black, White, Red, or Blue Magic. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Cards are gained by completing missions or traded at Ezel Berbier's underground card shop in Cadoan. To trade, give Ezel cards whose Ranks add up to the Rate of his card. Rates are usually double the rank, R# Antilaws go for 24 points, and world events can halve or double rates. Source: Final Fantasy Wiki, Cadoan, https://finalfantasy.fandom.com/wiki/Cadoan, and GameSpot FFTA walkthrough
- Ezel is the Nu Mou inventor of law and Anti-Law cards. He becomes recruitable after Mission 006 Antilaws, Mission 106 Resistance, Mission 022 To Ambervale, Mission 056 New Antilaw, and Mission Reconciliation, with at least one empty clan slot. Source: GameFAQs FFTA answers, https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/answers/48598-how-to-get-ezel-succesfully
- A Ganging Up Anti-Law card exists by name in the item lists. Source: https://mw.prismativerse.com/games/Final%20Fantasy%20Tactics%20Advance/player-options
- Using a law card does not waste the turn of the unit using it. Press Start during a fight, choose the law cards section, and the unit can still act afterwards. Source: GameFAQs FFTA answers, https://Gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/answers/115113-how-can-i-use-the-quotanti-law-cardsquot
- Law cards are obtained and traded through Ezel Berbier, who creates Law and Antilaw cards. His shop trade requires giving up cards whose point value matches the Rate of the card wanted. Source: Thonky FFTA Anti-Laws, https://www.thonky.com/tactics-advance/antilaws

### 1.8 Judgemaster job: FFTA only

- Judgemaster is a job in FFTA available to Cid Randell, head of the Judges. His stat growth is identical to Paladin, and he can use Paladin equipment. His action ability is Advanced Law. Source: Final Fantasy Wiki, Judgemaster (Tactics Advance), https://finalfantasy.fandom.com/wiki/Judgemaster_(Tactics_Advance)
- Advanced Law abilities, all with no AP learning cost listed because Cid starts with them mastered:
  - Abate, 32 MP, infinite range, skips the Judge's turn once to allow a law violation. It is the only ability that can be used on a Judge.
  - Judge Sword, no MP, damage as weapon, range as weapon, slash to damage and steal JP.
  - Bind, 16 MP, range 3, immobilizes and disables target for arrest.
  - JP Gift, no MP, range 1, give own JP to a deserving friend.
  - Yellow Clip, 8 MP, range 1, nullifies a yellow card from record.
  Source: Final Fantasy Wiki, Judgemaster (Tactics Advance)
- Cid cannot learn any reaction, support, or combo abilities. He cannot be hasted. He is recruited only after completing all 300 missions and then the Corrupt Judges missions. Source: Final Fantasy Wiki, Judgemaster (Tactics Advance)
- Judgemaster is listed as FFTA Only in job compendiums. There is no Judgemaster job in FFTA2. Source: https://www.ffcompendium.com/h/jobs/ffta.shtml
- Cid can issue Advanced Laws, which can result in a Red Card for any action forbidden by that Advanced Law, and he used one of Ezel's Anti-Laws against Llednar Twem to remove his protection. Source: Final Fantasy Wiki, Cid Randell, https://finalfantasy.fandom.com/wiki/Cid_Randell
- Judge NPC abilities, Judgement command: Yellow Card, Range 1, gives target a yellow card; Judge Sword, Power As Weapon, Range As Weapon, slash to damage and steal JP, element same as equipped weapon; Palaistra, Range Self, deadly whirl to deal damage around, element same as equipped weapon. Source: Final Fantasy Wiki, Judge (Tactics Advance)

### 1.9 Jagds: lawless zones

- Jagds are law-free zones. There is no Judge to supervise, law cards cannot be used, and team members still KOed after battle die and are lost forever. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Judges cannot enter Ivalice's three Jagds, but they can move corpses or petrified units out of the way to avoid gridlock elsewhere. Source: Final Fantasy Wiki, Judge (Tactics Advance)
- The three Jagds are Jagd Dorsa, Jagd Ahli, and Jagd Helje. Source: Final Fantasy Wiki, Jagd, https://finalfantasy.fandom.com/wiki/Jagd
- Gap flagged: no source found that explicitly states whether JP can be earned in a Jagd, or whether a combo can be initiated there with JP carried in. Since JP are awarded by Judges, and Jagds have no Judge, JP earning in a Jagd is not established by the sources checked.

### 1.10 Clan and team combos in FFTA

- There is no separate named clan joint attack, clan combo skill, or clan skill that performs a combo. The only multi unit attack found is the combo chain described above, where allies with combo abilities join the initiator. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- Clan skills listed in the GameSpot walkthrough are Combat, Smithing, Appraise, Negotiate, Magic, Craft, Gather, and Track. They develop as missions are completed and affect success at non-battle and free-area missions. No combo function is listed for them. Source: GameSpot FFTA walkthrough
- The GameFAQs Team Strategy/Combo FAQ uses "combo" in the second sense, meaning job and ability build combinations, for example Fighter/Paladin with Ninja Combo or Fight Combo listed in the Combo slot, not a separate team attack system. Source: GameFAQs FFTA Team Strategy, https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/26405
- A note in that same FAQ claims combos do more damage if the combo equipped is the same as the current job class. That claim was not found in the Mechanics Guide or the Final Fantasy Wiki Combo page, so treat it as unverified. Source for the claim itself: GameFAQs FFTA Team Strategy

### 1.11 Status effects, elements, Break, and Unbalanced in FFTA

- Element interaction: combos take the initiator's weapon element, and base damage is affected by it. The Mechanics Guide damage algorithm applies element before the combo multiplier: Weak is damage times 3 divided by 2, Resist is damage divided by 2, Null is 0, Absorb is negative damage, Normal is unchanged. The base damage is exactly the predicted Fight damage, so element handling happens before the multiplier. Source: GameFAQs Mechanics Guide
- Attacker status effects that change base damage in the Mechanics Guide, and therefore change combo base damage before the multiplier: Berserk on a physical ability, about 20 percent increase; Frog, about 90 percent decrease; Boost on a physical ability, about 50 percent increase; WAtk UP, about 10 percent increase; WAtk DOWN, about 10 percent decrease; MPow UP or DOWN for magical abilities. Source: GameFAQs Mechanics Guide
- Target status and support effects that change base damage before the multiplier: Shell for magical, Protect for physical, Petrify, Frog, Defense status, MRes UP or DOWN, WDef UP or DOWN, and Weapon Def+ support, each with the percentages in the Mechanics Guide damage steps 7 and 8. Source: GameFAQs Mechanics Guide
- No combo in the list inflicts a status effect. Every combo flavor text describes only a combo attack for that job, with no status, element, healing, or debuff listed. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- Element laws in FFTA ban elemental abilities, not elemental weapons. For example, Day 8 Fire is penalty for using fire-based abilities, and fire weaponry does not count. The same wording applies to Ice and Lightning. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- Status laws can forbid inflicting a status, for example Poison, Confuse, Charm, Stop, Silence, Slow, Berserk, Bind, Frog, and Addle. The recommended action for that day is usually the opposite status or action, and performing it grants 1 JP. Source: Final Fantasy Wiki, Law system (Tactics Advance)
- No source found links a combo hit to inflicting one of those statuses. Combo damage is described only as equal to a basic attack, plus the joiner percent and JP multiplier. Source: Final Fantasy Wiki, Combo (Tactics Advance)
- Break in FFTA is not a combo system and not a status. Break is a Bishop Prayer ability: Snake Staff, 200 AP, 20 MP, Range 3, "Halts metabolization, petrifying target." It inflicts Petrify. Source: Final Fantasy Wiki, Bishop (Tactics Advance), https://finalfantasy.fandom.com/wiki/Bishop_(Tactics_Advance)
- Petrify in FFTA: the unit turns into an immovable statue, counts as KOed for mission completion, takes minimal damage while Petrified, and can be cured with Gold Needle, Soft, Nurse, or Esuna. Other Petrify sources are Assassin Rockseal and Coeurl Blaster. Source: Final Fantasy Wiki, Petrify (status), https://finalfantasy.fandom.com/wiki/Petrify_(status)
- Unbalanced: no Unbalanced status was found in the Final Fantasy Wiki FFTA statuses list. That list includes Addle, Advice, Astra, Auto-Life, Berserk, Blind, Boost, Charm, Defense, Disable, Frog, Haste, Immobilize, KO, MPow DOWN, MPow UP, MRes DOWN, MRes UP, Petrify, Poison, Protect, Quicken, Reflect, Shell, Silence, Sleep, Slow, Speed DOWN, Stop, WAtk DOWN, WAtk UP, WDef DOWN, WDef UP, and Zombie. No Unbalanced entry appears. Source: Final Fantasy Wiki, Final Fantasy Tactics Advance statuses, https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_Advance_statuses
- No source found for a Break gauge, Break damage bonus, or Unbalanced interaction with combos in FFTA. Those terms do not appear in the Mechanics Guide combo section. Source: GameFAQs Mechanics Guide

### 1.12 Support abilities with combo in the name in FFTA

- None found. Combo abilities are a separate fourth category, not support abilities. Source: Final Fantasy Wiki, Final Fantasy Tactics Advance abilities
- The full FFTA support ability list on the Final Fantasy Wiki is: Concentrate, Doublehand, Double Sword, Geomancy, Half MP, Immunity, Learning, Magic Pow+, Maintenance, Monkey Grip, Shieldbearer, Turbo MP, Weapon Atk+, and Weapon Def+. No entry contains the word Combo. Source: Final Fantasy Wiki, Final Fantasy Tactics Advance support abilities, https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_Advance_support_abilities
- Support abilities that indirectly help combos, by the Mechanics Guide damage steps, are Weapon Atk+ (about 20 percent increase to Attack for a physical ability) and Doublehand (about 20 percent increase for Fight with a single handed weapon), plus Concentrate for hit rate, though the initiator already has 100 percent accuracy. Source: GameFAQs Mechanics Guide

## 2. Final Fantasy Tactics A2: Grimoire of the Rift (DS): combos removed

### 2.1 Headline: FFTA2 has no combo attacks

- Final Fantasy Tactics A2 removed the combo system from Final Fantasy Tactics Advance. There is no Combo command, no combo ability category, no Judge Points, and no Mythril weapon combo learning in FFTA2. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities, https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_A2:_Grimoire_of_the_Rift_abilities
- A summary of FFTA2 gameplay states: "The combos, however, were removed from the game as well as the mythical weapon from which they learned." Source: https://ff9dba89-6132-4485-99c2-ace8a2453124.filesusr.com/ugd/c3f59f_1e033c7e1d2149faa1e5c4199aae5bcf.pdf?index=true
- A GameFAQs review states: "Job Points or Judge Points as they've been known in the past games are gone (since there isn't a 'recommendation' to go along with the laws now, only restrictions) and they've been replaced by this idea known as the smash gauge." Source: GameFAQs FFTA2 review, https://gamefaqs.gamespot.com/ds/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/reviews/127325
- Another review states: "The combo attacks have been replaced, it seems, with Opportunity Commands. Opportunity Commands can cause combo attacks, but far more often, they randomly allow a character to use a buff for him/herself and his/her allies." Source: https://forums2.battleon.com/f/fb.asp?m=14341262
- The FFTA2 abilities page lists only three ability categories for every race: Action abilities, Reaction abilities, and Passive (support) abilities. There is no Combo abilities section. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
- No Thief Combo, Knight Combo, Fight Combo, or any other "[Job] Combo" exists in FFTA2. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
- No support ability with "combo" in the name exists in FFTA2. The Passive lists include Attack up, Defense up, Turbo MP, Geomancy, Pierce, Monkey Grip, Doublehand, Dual Wield, Safeguard, Halve MP, Immunity, Learn, Concentration, Shieldbearer, Death Strike, Ribbon-bearer, Vigilance, Charged Attacks, Magick up, Spellbound, Blood Price, Unscarred, Tank, Item Lore, Avoid Traps, Resistance up, and similar, but no Combo ability. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
- Community guides use the word "combo" in FFTA2 only in the loose build sense, for example Paladin/Parivir with Geomancy, Seer with Magick Frenzy plus Illusionist magick, or two Scholars using hit-all Lore spells. Those are job and ability pairings, not a combo mechanic. Source: http://ffta2.pbworks.com/w/page/5653368/Tactics?rev=1212881355 and http://home.eyesonff.com/showthread.php/118210-FFTA2-First-Impressions/page10

### 2.2 The FFTA2 replacement: Opportunity Commands

- An Opportunity Command is a gameplay feature in FFTA2. Opportunity Commands are actions that become randomly available to any allied character when their turn comes up in battle. Source: Final Fantasy Wiki, Opportunity Command, https://finalfantasy.fandom.com/wiki/Opportunity_Command
- The command offered depends on how many allies and enemies are directly adjacent to the acting unit. Source: Final Fantasy Wiki, Opportunity Command
- The Luck Clan Privileges can increase the chance of getting an Opportunity turn. Source: Final Fantasy Wiki, Opportunity Command
- When an Opportunity Command is available to a unit, that unit cannot open treasure chests or interact with other terrain features. Source: Final Fantasy Wiki, Opportunity Command
- Opportunity Commands also increase the stats of the Knightsword, Sequencer, and the armor, Peytral. Source: Final Fantasy Wiki, Opportunity Command
- The GameFAQs Dev walkthrough describes the trigger differently, as Smash Gauge driven: the Smash Gauge "normally fills by 10% upon completion of a successful action. When it completely fills for a given character, they will have the option of performing an Opportunity ability at their next turn." Source: GameFAQs FFTA2 Dev FAQ, https://Gamefaqs.gamespot.com/ds/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/faqs/53627
- No source found reconciles the wiki "randomly available" wording with the Dev FAQ "full Smash Gauge" wording, so treat the exact trigger as disputed between those two sources. Both agree the offered command is decided by adjacent units.

Full Opportunity Command list. Source for all rows: Final Fantasy Wiki, Opportunity Command.

- No adjacent units: Tough as nails! Casts Protect and Shell on user.
- One party member, no adjacent enemies: Tougher than nails! Casts Reraise on user.
- 1 adjacent ally: Battle shout! Increases Resilience of user and adjacent ally.
- 2 adjacent allies: Fleet of Foot! Casts Hastega on user and adjacent allies.
- 3 adjacent allies: Shield of Steel! Casts Astra on user and adjacent allies.
- 4 adjacent allies: Second Wind! Casts Curaga on user and adjacent allies.
- 1 adjacent enemy: Flurry! Attacks target twice in succession.
- 2 adjacent enemies: Eye for an eye! Attacks both targets.
- 3 adjacent enemies: Frenzy! Attacks all three targets.
- 4 adjacent enemies: Last Stand! Attacks all four targets.

Notes on the attack commands:

- Flurry! is the only true double hit in the list. It attacks one target twice, with normal weapon attacks. Source: https://lparchive.org/Final-Fantasy-Tactics-A2-Grimoire-of-the-Rift/Update%2002/
- Eye for an eye!, Frenzy!, and Last Stand! are one attack against each adjacent enemy, not a chain of allies joining. Source: Final Fantasy Wiki, Opportunity Command
- The Dev FAQ list gives slightly different wording for the ally buffs, for example Battle Shout! as "Attack up and Resilience up on all" and Fleet of Foot! as Hastega on all, versus the wiki's adjacent only wording. Source: GameFAQs FFTA2 Dev FAQ
- The solo variant Tougher than nails! was also reported by players running solo battles: with no one directly adjacent, the command switches from Tough as Nails! (Protect plus Shell) to Tougher than Nails! (Reraise). Source: http://home.eyesonff.com/archive/index.php/t-125230.html

Cost:

- Opportunity Commands cost no AP, Judge Points, or MP as listed. They are a free bonus action offered on that turn, in place of the normal action choice.
- There is a law named "Opportunity Commands" that forbids using a command that appears above "Attack", including Battle Shout, Tough as Nails, Flurry, and Take Treasure. Source: Thonky FFTA2 laws, https://www.thonky.com/ffta2/laws

### 2.3 The other FFTA2 replacement: Smash Gauge and Scions

- Judge Points are gone. The Smash Gauge is the per unit meter that replaces them for summoning. Source: GameFAQs FFTA2 review
- Scions are summoned using certain rare accessories, but the character's Smash Gauge must be filled by one-third before they can be summoned. Every Action that is successfully completed by a unit raises that unit's Smash Gauge by one-ninth its full value. Source: Final Fantasy Wiki, Scion (Ivalice), https://finalfantasy.fandom.com/wiki/Scion_(Ivalice)
- The Dev FAQ says it normally fills by 10 percent upon completion of a successful action. That is close to, but not identical to, the wiki's one-ninth figure. Source: GameFAQs FFTA2 Dev FAQ
- A GameFAQs sticky summary says: "A flashing gold Smash Gauge enables Totema Summon, if Totema accessory is equipped on that character. Having a higher Smash Gauge also seems to result in more bonus EXP gain at the end of battle." Source: GameFAQs FFTA2 board, https://gamefaqs.gamespot.com/boards/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/44171056
- A GameFAQs board answer says the gauge does not deplete after a Scion is summoned, and it serves no purpose other than to allow Scions to be summoned once the unit has acted three times, and that multiple Scion accessories can then be used one after another. That is a player report, not a wiki verified mechanic. Source: GameFAQs FFTA2 board, https://gamefaqs.gamespot.com/boards/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/77975867
- Another board answer says Scions can only be summoned once per battle. Source: GameFAQs FFTA2 board
- The Smash Gauge is per unit, shown at the right side of the character's stats during battle. Source: Final Fantasy Wiki, Scion (Ivalice)

Scion summons: the FFTA2 team wide attacks. Scions are the FFTA2 version of FFTA Totemas, but they are equipment gated, not race gated. They are summoned by equipping a specific accessory, and the summon is called Scion's Wrath. Source: Final Fantasy Wiki, Scion (Ivalice)

Examples from the wiki list, all from Final Fantasy Wiki, Scion (Ivalice):

- Belias, Gigas Pendant, Hellfire, deals Fire damage to all foes, from Camoa Cup 1.
- Mateus, Corsage of Corruption, Frostwave, deals Ice damage to all foes, from Graszton Cup 1.
- Adrammelech, Raging Brooch, Judgement Bolt, deals Lightning damage to all foes, from Moorabella Cup 1.
- Hashmal, Pin of Order / Bringer's Pin, Gaia's Wrath, deals Earth damage to all foes, from Fluorgis Cup 1.
- Famfrit, Ewer of Darkness, Tsunami, deals Water damage to all foes, from Goug Cup 1.
- Zalera, Earrings of the Dead / Reaper's Rings, Condemnation, deals Dark damage to all foes, inflicting Sleep and Doom, from The Last Step.
- Ultima, High Seraph's Plume, Ultima, restores HP to all allies and deals Holy damage to all foes, from Hunted.

Other Scion notes:

- Instead of using Judge Points, you use a Smash Gauge that fills whenever you successfully execute an action. Source: Hooked Gamers FFTA2 review, https://hookedgamers.com/nds/final_fantasy_tactics_advance_2/review/article-234-2.html
- Scion accessories earned through cups can only be obtained once per file. Source: Final Fantasy Wiki, Scion (Ivalice)
- Shemhazai is summoned by anyone equipping the Armlet of Whispers when the Smash Gauge is orange, and deals damage equal to the total amount of damage a character has done over the course of the game. Source: Final Fantasy Wiki, Shemhazai, https://finalfantasy.fandom.com/wiki/Shemhazai

### 2.4 Costs and resources in FFTA2

- There is no combo cost, because there is no combo.
- AP: Abilities are learned from equipment by earning AP. FFTA2 uses an AP system like Final Fantasy IX. Abilities are embedded in equipment, and a unit can permanently learn them by mastering them. Source: GameFAQs FFTA2 Dev FAQ
- MP: Every unit starts a battle with 0 MP and generates 10 MP per turn. Some items and abilities speed this up. Basic Fire, Thunder, and Blizzard cost 8 MP, the -ra tier costs 12 MP, and the -ga tier costs 18 MP. Source: GameFAQs FFTA2 review
- Judge Points: None in FFTA2. Do not exist as a spendable resource.
- Smash Gauge: The only gauge spent or used for a big team attack is the Smash Gauge, for Scion summons, as above. It is filled by successful actions, not spent in the same way as JP.
- Clan Points: Clan Trials cost Clan Points, and Clan Points are a separate clan progression resource, not a battle combo resource. Source: https://cdn-cms.f-static.net/uploads/4448110/normal_60493fd2c636d.pdf
- The closest FFTA2 ability to a combo resource interaction is Steal Limelight, Thief, learned for 400 AP from the Orichalcum Dirk, range 1, effect "Steal the target's accumulated Smash Gauge points." Source: Final Fantasy Wiki, Thief (Tactics A2), https://finalfantasy.fandom.com/wiki/Thief_(Tactics_A2), and GameFAQs FFTA2 guide, https://gamefaqs.gamespot.com/ds/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/faqs/53241
- Steal Limelight is useful if the Thief can summon a Scion, because it greatly decreases the time it takes to fill enough Smash Gauge for an attack, and it can also be used on a teammate. Source: StrategyWiki, Final Fantasy Tactics A2 Thief, https://dev.library.kiwix.org/content/strategywiki_en_all_nopic_2025-07/Final_Fantasy_Tactics_A2%3A_Grimoire_of_the_Rift/Thief

### 2.5 Judge and law system in FFTA2

- In FFTA2, laws are regulations announced by Judges at the start of combat that forbid certain actions. In exchange for heeding these laws, clans are allowed a privilege of their own choosing to also apply during the battle. Source: Final Fantasy Wiki, Law system (Tactics A2), https://finalfantasy.fandom.com/wiki/Law_system_(Tactics_A2)
- Before each battle, Judges still announce which law will be in effect, but there are no more red and yellow cards issued when a law is broken. Instead, when the player breaks a law, the Judge departs, and the upper screen changes to a gray theme. Source: Final Fantasy Wiki, Law system (Tactics A2)
- Without the support of Judges, players may not be revived, and once they are knocked out, they will be displayed as trapped in a metal cage at the top of the upper screen. Source: Final Fantasy Wiki, Law system (Tactics A2)
- Privileges have replaced recommended moves from FFTA. They allow the clan special bonuses, such as a boost in speed or agility or extra advantages for certain classes or races. The presence of the Judges enables these privileges, and thus they cease once the Judge leaves. Source: Final Fantasy Wiki, Law system (Tactics A2)
- Judges in FFTA2 have slightly different roles than in FFTA. At the start of every battle a Judge will appear and proclaim which action will be Forbidden for the duration of combat. The clan will also be allowed to inform the judge which of their Privileges they would like to use. After a successful battle a Judge may award the clan bonus loot and items. Source: Final Fantasy Wiki, Judge (Tactics A2), https://finalfantasy.fandom.com/wiki/Judge_(Tactics_A2)
- If a clan member performs a forbidden action, the Judge will depart the play field. It is the presence of Judges that allow clan members to be revived and privileges to be used. Source: Final Fantasy Wiki, Judge (Tactics A2)
- Since the Judge is tied to specific clans, the enemy is not affected by laws the way they were in the first game. Source: Final Fantasy Wiki, Judge (Tactics A2)
- Unlike the Judges in FFTA and Final Fantasy XII, the judges of this game are magic golems exclusive to the continent of Jylland. Source: Final Fantasy Wiki, Judge (Tactics A2)
- Laws are predetermined for every battle, and there can only ever be one law set for a battle. Source: GameFAQs FFTA2 review
- Punishment for breaking a law, per GameFAQs Dark_Vortex guide: 1. Judge leaves, meaning dead units cannot be revived until battle is over. 2. Clan Privilege annulled. 3. Reward at end of battle is removed. Source: GameFAQs FFTA2 guide, https://gamefaqs.gamespot.com/ds/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/faqs/53446
- There is no playable Anti-Law card system in FFTA2 like FFTA. In FFTA, Ezel Berbier traded law cards that could add or remove laws, and Anti-Law Cards disabled all laws of a given Rank. That system does not exist as a player mechanic in FFTA2. Source for FFTA system: Thonky FFTA Anti-Laws, https://www.thonky.com/tactics-advance/antilaws, and GameSpot FFTA walkthrough
- In FFTA2, Ezel appears only in story form: he provides the clan a law card with the ability to protect the Judge from magicks used against it, which proves useful in future battles against Khamja. Source: Final Fantasy Wiki, Ezel Berbier, https://finalfantasy.fandom.com/wiki/Ezel_Berbier
- Judges can also be barred from battle, demonstrated only by Illua and Ewen. That effect could be countered by the use of a magic card created by Ezel Berbier, earned as a reward from a certain mission involving Ezel. Source: Final Fantasy Wiki, Judge (Tactics A2)
- There is no Judgemaster job in FFTA2, and no Judgemaster ability that spends Judge Points on combos. Judgemaster Cid is an FFTA character and job. The FFTA abilities page lists Judge and Judgemaster among FFTA other jobs, while the FFTA2 abilities page has no such job. Sources: Final Fantasy Wiki, Final Fantasy Tactics Advance abilities, and Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
- There is no law in FFTA2 that specifically forbids "combos", because combos do not exist. The closest law is "Opportunity Commands", which forbids using Opportunity Commands. Source: Thonky FFTA2 laws, https://www.thonky.com/ffta2/laws

Laws that interact with multi hit, knockback, and team positioning. From the Thonky FFTA2 law list, source: https://www.thonky.com/ffta2/laws

- Knockback: If you do an action that knocks back a unit, you break the law. Magick is safest. Avoid regular Attacks, because Attack has a chance of causing a Critical hit, which knocks the target back. If the unit is up against a wall, even a Critical Hit will not knock it back and you will not break the law.
- Grouping: If a unit is next to another unit, not counting diagonally, at the end of its turn, you break the law. This directly punishes the adjacent positioning that Opportunity Commands reward.
- Copycat: If you do the exact same action as the previous unit, friend or foe, you break the law. This applies only to actions with the same name.
- Buffs: If any of your units gets any beneficial status condition such as Haste, Protect, Reflect, etc., you break the law. Reaction ability status conditions do not count.
- Debuffs: If any of your units causes a negative status condition, except HP Critical, you break the law.
- Elemental Effects, Fire, Ice, Lightning: Using an elemental spell or weapon breaks the law. Elements are Fire, Ice, Lightning, Water, Air, Earth, Dark, Holy, and Gravity.
- Damage caps: Laws such as more than 20, more than 50, or more than 100 damage, and less than 20, less than 50, or less than 100 damage, count damage from reaction abilities such as Counter and Bonecrusher and Critical damage.

### 2.6 Clan Privileges in FFTA2

- A clan privilege is a gameplay factor in FFTA2. Privileges usually affect the entire party and are selectable at the beginning of each battle that a Judge facilitates. Source: Final Fantasy Wiki, Clan Privilege, https://finalfantasy.fandom.com/wiki/Clan_Privilege
- Starting privileges, per the Law System wiki: Power up 1 (slightly increases damage dealt and reduces damage received), Agility up 1 (slightly improves chance to hit and avoid being hit), Speed up 1 (slightly raises speed), Luck 1 (slightly increases critical hit rate and chance of an Opportunity turn), plus one additional privilege selected by a series of questions asked by an NPC during the introductory phase. Source: Final Fantasy Wiki, Law system (Tactics A2)
- Other privileges relevant to Opportunity Commands and Smash Gauge, sources Final Fantasy Wiki Clan Privilege and http://ffta2.pbworks.com/w/page/5653348/Clan%20abilities:
  - Luck 1 to Luck 5: Each tier increases critical hit rate and chance of an Opportunity Command, from very slightly to massively.
  - Smash Gauge Bonus 1 to 3, also called Smash up 1 to 3: Slightly, moderately, or greatly increase the rate at which the Smash Gauge fills. From Aptitude-Adaptability trials.
  - MP Channeling: Units regain additional MP each turn, 20 as opposed to the normal 10. From Aptitude-Adaptability, Master Explorers trial.
  - MP Efficiency: Halves the MP cost of all abilities.
  - Regen, Regenera, Regenega: Units regain 10 percent, 12 percent, or 15 percent HP each turn at rank 1, 2, or 3.
  - Move up 1 and 2: Increases Move stat by 1 or 2.
  - Empowered Hume, Bangaa, Nu Mou, Viera, Moogle, Seeq, Gria: Ability of the race increased.
  - Libra: Reveals the location of all traps on the field.
  - Bonus AP, Bonus CP, Bonus EXP, Bonus Gil, 1 to 3 tiers each: Slightly to greatly increase rewards.
  - Debuff Resistance 1 to 3: Grants immunity to Poison, and higher tiers to more debuffs.
- Privileges are gained by completing Clan Trials, which test four Clan Talents: Trial, Fitness, Teamwork, and Adaptability. Source: https://cdn-cms.f-static.net/uploads/4448110/normal_60493fd2c636d.pdf
- There is no joint clan attack, clan combo, or combo chain across multiple units in FFTA2. No clan ability lets two or more units attack the same target in sequence as one combined action.

### 2.7 Status effects, elements, Break, and Unbalanced in FFTA2

- No Break system and no Unbalanced system in FFTA2. Those terms do not appear as FFTA2 mechanics in the sources checked. Do not import them from other games.
- What FFTA2 does have with "Break" in the name is individual abilities, not a system:
  - Power Break, Mind Break, Magic Break, Speed Break: Soldier and Warrior Arts of War abilities. Power Break lowers target physical attack, Mind Break lowers magical attack, Magic Break damages target MP, Speed Break lowers target speed. Source: http://ffta2.pbworks.com/w/page/5653345/Ability?rev=1193833032
  - Rend Armor, also listed as Armor Break in other sources: Master Monk ability learned for 350 AP from the Cypress Pole. It attempts to destroy the target's equipped armor and has a range of 1. It is also used by the Reaver, which in addition tries to destroy armor and inflicts non-elemental physical damage. Source: Final Fantasy Wiki, Armor Break (ability), https://finalfantasy.fandom.com/wiki/Armor_Break_(ability)
  - Break, as a spell: Bishop ability that releases petrifying gas and inflicts Stone status. Source: http://ffta2.pbworks.com/w/page/5653345/Ability?rev=1193833032
  - None of these interact with combos, because combos do not exist in FFTA2.
- Knockback is the closest FFTA2 mechanic to a combo interaction, and it is a hazard, not a bonus.
  - Knockback is a side effect of a critical hit, which pushes the target back. Source: Thonky FFTA2 laws
  - Critical hits knock back the target, and that counts towards the Knockback law. Source: https://lparchive.org/Final-Fantasy-Tactics-A2-Grimoire-of-the-Rift/Update%2004/
  - Blink Counter, Master Monk and Lanista reaction, counters and knocks back. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
  - Fighter Rush can knock back a target, and was cited as the likely only way to knock the Head Editor off his spot in the Bonga Bugle Goldsun quest without breaking the Attack ban law. Source: GameFAQs FFTA2 answers, https://gamefaqs.gamespot.com:443/ds/937330-final-fantasy-tactics-a2-grimoire-of-the-rift/answers/534769-which-abilities-cause-knockback
  - Knockback can also break the Targeting Distant Units law, because a knocked back enemy counts as hit from afar. Source: RPGFan FFTA2 review, https://www.rpgfan.com/review/final-fantasy-tactics-a2-grimoire-of-the-rift/
- Status effects in FFTA2 were toned down versus FFTA. For example, Blind in FFTA2 reduces accuracy by 30 percent of the basic accuracy of the skill, instead of making hits impossible. Source: https://Allthetropes.org/wiki/Final_Fantasy_Tactics_A2
- Opportunity Commands interact with status directly: Tough as Nails! gives Protect plus Shell, Shield of Steel! gives Astra which prevents the next status effect, Tougher than Nails! gives Reraise, Battle Shout! raises Resilience which reduces the chance of being hit by status effects. Source: Final Fantasy Wiki, Opportunity Command, and https://lparchive.org/Final-Fantasy-Tactics-A2-Grimoire-of-the-Rift/Update%2002/
- Geomancy, Black Mage passive, reduces all target's elemental resistances by one level: Absorb to Null to Half to Norm to Weak. Source: Final Fantasy Wiki, Final Fantasy Tactics A2 abilities
- Scion attacks are elemental, Fire, Ice, Lightning, Earth, Water, Dark, Holy, as listed in section 2.3. Source: Final Fantasy Wiki, Scion (Ivalice)
- No source found shows a combo damage bonus for matching elements, exploiting weakness, or inflicting a status first. That interaction belongs to FFTA combos only in the limited sense that combo damage is physical attack based, not elemental.

### 2.8 What FFTA2 does with combos that FFTA did not

This is inverted: FFTA2 does less with combos than FFTA. It removes them and replaces them with:

- Opportunity Commands, random single unit bonus actions based on adjacency. FFTA had no Opportunity Commands. Source: Final Fantasy Wiki, Opportunity Command
- Smash Gauge, a per unit meter filled by successful actions, used to summon Scions. FFTA used Judge Points for both combos and Totema summons. Source: Final Fantasy Wiki, Scion (Ivalice)
- Clan Privileges, chosen at battle start, replacing FFTA recommended moves. Privileges include Luck tiers that raise Opportunity chance, and Smash Gauge Bonus tiers that raise Smash fill rate. Source: Final Fantasy Wiki, Law system (Tactics A2)
- A softer law system: no jail, no yellow or red cards, no stat penalties, only loss of privilege, loss of revive, and loss of end battle law bonus. Source: Final Fantasy Wiki, Law system (Tactics A2)
- MP starting at 0 and regenerating 10 per turn, instead of FFTA MP pools. Source: GameFAQs FFTA2 review
- StrategyWiki check: StrategyWiki has a page for Final Fantasy Tactics A2: Grimoire of the Rift, with sections for Controls, Jobs by Race, Items, Weapons, Armour, Bazaar, Monsters, Quests, and Secret Characters, but no StrategyWiki combo page or combo mechanics section was found in the search results. Source: https://strategywiki.org/w/index.php?title=Final_Fantasy_Tactics_A2:_Grimoire_of_the_Rift&oldid=1169912

## 3. Final Fantasy Tactics (PS1): no combo system

### 3.1 Verdict

- Original Final Fantasy Tactics (PS1) has no combo system, no Judge Points, no Judge, no law system, and no combo ability slot. Source: Final Fantasy Wiki, Final Fantasy Tactics abilities, https://finalfantasy.fandom.com/wiki/Final_Fantasy_Tactics_abilities
- FFT abilities are split into five categories: Action, Reaction, Support, Movement, and Monster abilities. There is no Combo category. Source: Final Fantasy Wiki, Final Fantasy Tactics abilities
- Each unit can equip only one Reaction, one Support, and one Movement ability. Reaction abilities activate only when their trigger condition is met, and the chance depends on Bravery in percent. Source: Final Fantasy Wiki, Final Fantasy Tactics abilities
- JP in FFT means Job Points, not Judge Points. JP is gained on acting and spent to learn abilities, with separate JP per job. Source: Final Fantasy Wiki, Walkthrough Final Fantasy Tactics, https://finalfantasy.fandom.com/wiki/Walkthrough:Final_Fantasy_Tactics/Catuse/Gameplay
- The GameFAQs FFT guide has a section titled "Ability Combos" under "Ability Strategies", but it is a strategy heading for synergistic builds, not a named in-game combo system, trigger, cost, or command. Source: GameFAQs FFT guide, https://gamefaqs.gamespot.com/ps/197339-final-fantasy-tactics/faqs/3849
- Zero support abilities, zero reaction abilities, and zero passive abilities in FFT have the word combo in the name, because FFT has no Combo category at all. Source: Final Fantasy Wiki, Final Fantasy Tactics abilities

### 3.2 Closest FFT analogues to a combo, and why they are not combos

- Counter, Counter Tackle, First Strike, Magick Counter, and similar Reaction abilities let a unit strike back after being hit. They are single-unit reactions, not team chain attacks. Source: https://www.finalfantasykingdom.net/tacticsabilities.php
- Dual Wield (Ninja support) lets a unit attack twice in one turn with two weapons. That is a double attack, not a multi-ally combo. Source: https://game8.co/games/Final-Fantasy-Tactics/archives/553798
- Mime can mimic allies, and Calculator / Arithmetician can hit map-wide, but neither is a combo command. Source: Final Fantasy Wiki, Final Fantasy Tactics abilities

### 3.3 Systems FFT has that FFTA and FFTA2 do not have

None of these is a combo system.

- Movement abilities as a separate equip slot: Move +1, Jump +1, Teleport, Fly, Treasure Hunter, Lifefont, Accrue JP, and others. FFTA replaced movement abilities with status effects from boots, and FFTA2 has no Movement slot in the same form. Source for FFT Movement list: https://www.finalfantasykingdom.net/tacticsabilities.php. Source for FFTA replacing movement with boots: GameSpot FFTA walkthrough
- Job Points as a spendable currency per job, with job levels unlocking new jobs, instead of FFTA and FFTA2 equipment-based AP mastery. Source: Final Fantasy Wiki, Walkthrough Final Fantasy Tactics
- Bravery and Faith as core stats, with Bravery driving reaction trigger chance and physical damage, Faith scaling magic dealt and taken, plus Zodiac compatibility affecting damage and hit rates. Source: https://www.romsget.com/579.html
- Knight Arts of War Rend / Break skills: Rend Helm, Rend Shield, Rend Armor, Rend Weapon, Rend Speed, Rend MP, Rend Power, Rend Magick. These lower stats or break equipment. They are Action abilities, not combo abilities, and they have no combo multiplier. Source: https://www.rpgsite.net/guide/18138-final-fantasy-tactics-the-ivalice-chronicles-jobs-guide
- Permanent death by crystal / countdown, and no Judge to move KO units out of the way. FFTA protects KO units except in Jagds, and FFTA2 allows revival only while the law is upheld. Source for FFTA Jagd death rule: Final Fantasy Wiki, Law system (Tactics Advance). Source for FFTA2 revival rule: GameFAQs FFTA2 review

### 3.4 Note on the 2026 mod

- A 2026 mod, FFT Combined Arms for Final Fantasy Tactics: The Ivalice Chronicles, adds an FFTA-style combo system to FFT, with a Team Points bar, a Combo command, skillchains, and a Concurrence finish. That is a mod, not the original PS1 game, and it is Enhanced Mode only. Source: https://www.nexusmods.com/finalfantasytacticstheivalicechronicles/mods/165/
- The same mod page states its model for FFTA behavior: while a combo runs, its target does not react (no Counter, no Auto-Potion), and combo strikes cast no weapon spells. Treat that as the mod author's description of FFTA, not as a wiki-verified FFTA rule.

## 4. Discrepancies and gaps

- Thief Combo Hit: Final Fantasy Wiki lists 70 percent, the GameFAQs Mechanics Guide lists 100 percent. All other combo rows checked match between the two sources. Sources: Final Fantasy Wiki, Combo (Tactics Advance), and GameFAQs Mechanics Guide
- Combo cost: one GameFAQs guide says combos cost 1 JP. The manual, the Mechanics Guide, the Final Fantasy Wiki, and the Board FAQ all say the initiator spends all JP held. Use all JP. Incorrect source: https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/25687
- Same job combo bonus: claimed only in the GameFAQs Team Strategy/Combo FAQ (combos do more damage if the combo equipped matches the current job class). Not verified in the Mechanics Guide or the Final Fantasy Wiki Combo page. Treat as unverified. Source for the claim itself: GameFAQs FFTA Team Strategy
- Jagd JP earning: no source found states whether JP can be earned in a Jagd, or whether a combo can be initiated there with JP carried in. Since JP are awarded by Judges and Jagds have no Judge, JP earning in a Jagd is not established by the sources checked.
- Smash Gauge fill rate: the wiki says one-ninth per successful action, the GameFAQs FFTA2 Dev FAQ says 10 percent. Both are cited in section 2.3. The difference is small and does not change the design.
- Opportunity Command trigger: the wiki says randomly available, the Dev FAQ says a full Smash Gauge grants one on the next turn. Both agree the offered command is decided by adjacent units. Treat the exact trigger as disputed.
- No wiki source found gives a full elemental or status table for FFTA combo hits. If a design needs combo plus element or status, that rule would need to be invented, not cited from FFTA.
- The browser open for the Judge Points page failed once with a receive timeout, so that page was used only from search result text, not from a fresh open. Its URL is http://finalfantasy.fandom.com/wiki/Judge_Points

## 5. How this maps to FED-13 combo attacks: design-ready rules

FED-13 takes its combo system from FFTA only. FFT has no combo system and FFTA2 removed it, so neither contributes combo mechanics. The rules below are concrete, not questions. They use FED-13 names: Bondkin for the job-changing creatures, Beasts for the Pokemon-style monsters, Mankind for the trainers, Path Points for the combo resource, Link Attacks for the FED-13 combo name, Totem Spirits for the summon system, and the Judge and law system already in the FED-13 design.

### 5.1 Where combos live in FED-13

- Combo attacks belong to the FFTA grid battle system (2v2 to 6v6 on a small grid), not to the Pokemon style 1v1 battles. The two battle systems need two different sprite prompt types: Pokemon style 1v1 battle sprites and FFTA grid battle sprites.
- Beasts do not combo. Combos are a Bondkin system: job-based, weapon-learned, team-based. Beasts fight Pokemon style, catch, train, evolve, battle. This is the duality: Bondkin are the deep job-changing side, Beasts are the simple Pokemon side.
- The Combo command is a separate battle command on the grid, alongside Fight, and it is the most prominent command in grid battles. Combo attacks are the most important thing in the game, so the Combo command sits first in the grid battle menu.

### 5.2 Trigger rule

- To start a combo, a Bondkin needs at least 1 Path Point and a combo ability set. Path Points are FED-13's version of FFTA Judge Points.
- When the initiator picks a target, every allied Bondkin on the grid with a combo ability set and in range of that same target joins the combo. Joiners need no Path Points, take no turn of their own, and do not need to be adjacent to the initiator. They act instantly during the initiator's turn.
- A combo targets one enemy only. No area combos.
- Joiner range is measured from the joiner to the target, using that joiner's own combo ability range (1 to 6 tiles), not from the joiner to the initiator and not from the joiner's weapon.
- Initiator range is the range of the initiator's equipped weapon.
- Maximum participants: 1 initiator plus up to 5 joiners, the 6 unit deploy limit.

### 5.3 Damage rule

- The initiator's hit is 100 percent accurate, ignores reaction abilities, and deals damage equal to a basic attack with the primary weapon.
- Each joiner rolls its own join chance (its combo ability Hit percent). Enemy evasion cannot change that roll.
- If no joiner connects, the combo deals normal damage and the Path Points are still spent, with no Path Point bonus.
- If at least one joiner connects, each connecting joiner adds its Power percent to the multiplier, starting from 100 percent.
- If at least one joiner connects, apply the Path Point multiplier using only the initiator's Path Points: Final Multiplier equals Multiplier times (10 plus 4 times Path Points) divided by 10. At 5 Path Points the multiplier is times 3. At 10 Path Points it is times 5. Maximum is 860 percent of normal damage with four 15 percent joiners plus one 12 percent joiner at 10 Path Points.
- Overall damage cap is 999, as in FFTA.
- A combo takes the element of the initiator's weapon, applied before the multiplier: Weak is damage times 3 divided by 2, Resist is damage divided by 2, Null is 0, Absorb is negative damage.
- Joiner weapon, Weapon Attack, level, and other joiner stats do not change the percent they add.
- Status effects change combo base damage before the multiplier, as in FFTA: Berserk about 20 percent up on physical, Frog about 90 percent down, Boost about 50 percent up on physical, WAtk UP or DOWN about 10 percent, Protect for physical and Shell for magical, Petrify, Defense status, MRes and WDef shifts.
- No combo ability inflicts a status effect by itself. Status comes from weapons, spells, and Arts, not from the combo.

### 5.4 Cost rule: Path Points and AP

- A combo costs 0 MP in battle.
- Learning a combo ability costs 100 AP, mastered from the weapon that teaches it, as in FFTA. One combo ability per Bondkin job, named after the job (Combat Combo for Soldier, Knight Combo for Paladin, and so on through the 33 FFTA jobs, adapted to the FED-13 job list).
- The initiator spends all Path Points it currently holds. Joiners spend none. A combo cannot start at 0 Path Points.
- Path Points cap at 10 per Bondkin.
- Path Points are earned exactly as in FFTA: 1 Path Point to the unit dealing the final blow on a legal KO, and 1 Path Point for performing the action the law of the day recommends. Maximum 1 Path Point per turn per unit. One action never grants 2 Path Points.
- The other Path Point spend is Totem Spirit summoning, which costs 10 Path Points, the maximum a Bondkin can hold. Totem Spirits are FED-13's version of FFTA Totemas.
- Path Point theft and gifting, adapted from FFTA: a Thief type ability steals 1 Path Point from the target, a Bishop type prayer steals up to 2 Path Points, and a Judgemaster type ability gives the user's own Path Points to an ally.
- Combo abilities are learned from rare weapons, as FFTA combos are learned from Mythril Weapons. In FED-13 those are rare weapons won by defeating another clan or bought from a special shop, matching the FFTA route (clan victory rewards and Nono's shop).

### 5.5 Range, power, and accuracy tradeoff

- Longer join range or higher added damage means lower join chance, as in FFTA. The table pattern is: range 1 melee combos at 100 percent or 70 percent hit with 10 to 15 percent power; range 2 combos at 60 to 100 percent hit with 5 to 12 percent power; range 4 mage combos at 40 to 60 percent hit with 5 to 10 percent power; range 5 to 6 long range combos at 30 to 40 percent hit with 5 to 12 percent power.
- Apply this tradeoff to every FED-13 combo ability when the job list is written. No FED-13 combo breaks the pattern.

### 5.6 Judge, laws, and cards in FED-13

- The Judge awards Path Points and issues Yellow and Red Cards, as in FFTA. Yellow Card on a first law break without a KO. Red Card on a break with a KO or a second break. Red Card units go to prison and cannot dispatch, fight, or be managed until bailed or pardoned.
- The Ganging Up law penalizes initiating a combo, and only the initiator is penalized, never the joiners. A combo under Ganging Up still costs all Path Points and still earns a Yellow Card even if no one joins. Ganging Up is Rank 3.
- Copycat is the paired law: Copycat forbids repeating the previous unit's action, Ganging Up is its recommended opposite.
- Law cards: white cards with a pink crescent add a law, black cards with a yellow star are Anti-Law cards that nullify a law. Ranked Anti-Law cards nullify all laws of that rank. The Almighty card nullifies all laws. Maximum carry is 12 cards. Cards come from missions and from a card trader, as Ezel Berbier trades them in FFTA.
- Using a law card does not use up the unit's turn.
- Laws start at one per battle and rise as the story advances, with Lawshifts adding laws when Totem Spirits are defeated.
- Judgemaster is a FED-13 special job with Advanced Law abilities adapted from FFTA: Abate (skip the Judge's turn once to allow a law violation, the only ability usable on a Judge), Judge Sword (damage as weapon and steal Path Points), Bind (immobilize a target for arrest), Path Gift (give own Path Points to an ally), Yellow Clip (nullify a yellow card from a record). The Judgemaster cannot learn reaction, support, or combo abilities.
- Jagds in FED-13 are law-free zones with no Judge and no law cards, and units KOed there can die permanently. Path Points cannot be earned in a Jagd because there is no Judge to award them, and combos cannot be started there for the same reason. This is FED-13's ruling on the gap the sources leave open.

### 5.7 Opportunity Commands: borrow from FFTA2 as a second system

- Opportunity Commands are a separate system from combos, borrowed from FFTA2. They are random single unit bonus actions offered on a Bondkin's turn, decided by how many allies and enemies are directly adjacent to that unit.
- The FFTA2 list, adapted to FED-13 names: no adjacent units gives Tough as Nails (Protect plus Shell on self); one party member and no adjacent enemies gives Tougher than Nails (Reraise on self); 1 adjacent ally gives Battle Shout (Resilience up on self and adjacent ally); 2 adjacent allies gives Fleet of Foot (Hastega on self and adjacent allies); 3 adjacent allies gives Shield of Steel (Astra on self and adjacent allies); 4 adjacent allies gives Second Wind (Curaga on self and adjacent allies); 1 adjacent enemy gives Flurry (attack one target twice); 2 adjacent enemies gives Eye for an Eye (attack both); 3 adjacent enemies gives Frenzy (attack all three); 4 adjacent enemies gives Last Stand (attack all four).
- Opportunity Commands cost no AP, Path Points, or MP. They replace the normal action on that turn.
- Do not merge Opportunity Commands with combos. A combo is a team chain started by one unit with allies joining. An Opportunity Command is one unit's bonus action. Keep them as two different systems with two different triggers.

### 5.8 What not to import

- Do not import a Smash Gauge. FED-13 uses Path Points as its one battle gauge for Bondkin teams. FFTA2's Smash Gauge and Scion accessories stay in FFTA2.
- Do not import Clan Privileges as a combo mechanic. Privileges are FFTA2 battle buffs chosen before a fight. If FED-13 wants them, they belong to the clan system, not to combos.
- Do not import a Break gauge or an Unbalanced status from the Tactics games. No Break system and no Unbalanced status exist in FFT, FFTA, or FFTA2. FFTA Break is a Bishop prayer that inflicts Petrify. FED-13's Break and Unbalanced systems are FED-13 original, not from these games, and they must be designed as FED-13 rules, not cited as FFTA rules.
- Do not import FFT's Job Points, Bravery and Faith, Zodiac compatibility, or Movement abilities into the combo system. They belong to FFT's own systems, not to combos.
- Do not import the 2026 FFT Combined Arms mod's Team Points bar, skillchains, or Concurrence finish. That is a mod, not the original games.
- Do not give Beasts combo abilities. Beasts are Pokemon. They have no jobs, no weapons, and no combo abilities. Combos are the Bondkin job system, and that is the point of the duality.
- Do not give combo abilities to the special jobs Biskmatar, Hermetic, Judge, Judgemaster, Runeseeker, or school jobs, matching FFTA, which gives them none.
