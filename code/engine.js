/* FED-13 DS Engine
   Plain JavaScript. No frameworks. No libraries.
   Nintendo DS layout: two 256x192 screens, scaled 2x.
   Top screen: action. Bottom screen: commands and text.
   60 Hz render loop. 16 color friendly palettes.
   All asset paths are relative: assets/<filename>
   Save slot: localStorage key fed13_save_v1
   Story: King Malachar Duskspire sits above The Thirteen as the 14th.
   Bank: Monster Bank. Names: Mankind, Bondkin, Wildlife.
   ADV-ROAD (worker A8, 2026-11-24): the road down presentation.
   playRoadDownCinematic chains the Gate seal and Saltquay arrival
   cutscenes over map_gatehollow.png, map_road.png, map_saltquay.png
   and bg_harbor.png. Scratch copy only, build/code untouched.
   Pause menu (X): Party, Bag, Grimoire, Monster Bank, Save, Settings.
   Grimoire: in-game wiki and contact book. Guide form is picked at
   creation: Sword gives a fairy, Staff gives a mystical orb, Shield
   gives the Grimoire itself. Four guide Grimoires: Muse, Grok, the
   Wisp, the Chronicler. Same answers, only the voice differs.
   Staging: staged story scenes draw background plus sprites on the top
   screen, one beat per dialogue line (see FED13.engine.staging).
*/
(function () {
  'use strict';

  var W = 256;
  var H = 192;
  var SCALE = 1.75;
  var SAVE_KEY = 'fed13_save_v1';
  var VERSION = '4.0.0-overhaul';

  /* ---------- Exact 52 Mankind classes, in design file order ---------- */
  var CLASSES = [
    { name: 'Warrior', group: 'Tank', desc: 'Sword, shield, balanced tank.' },
    { name: 'Paladin', group: 'Tank', desc: 'Holy sword, shield, heal.' },
    { name: 'Knight', group: 'Tank', desc: 'Sword, shield, defense.' },
    { name: 'Guardian', group: 'Tank', desc: 'Shield, taunt, protect.' },
    { name: 'Warden', group: 'Tank', desc: 'Shield, nature, protect.' },
    { name: 'Defender', group: 'Tank', desc: 'Shield, heavy defense.' },
    { name: 'Keeper', group: 'Healer and Support', desc: 'Heal, support.' },
    { name: 'White Mage', group: 'Healer and Support', desc: 'Heal, holy magic.' },
    { name: 'Cleric', group: 'Healer and Support', desc: 'Heal, holy magic.' },
    { name: 'Priest', group: 'Healer and Support', desc: 'Heal, buff.' },
    { name: 'Druid', group: 'Healer and Support', desc: 'Heal, nature magic.' },
    { name: 'Bard', group: 'Healer and Support', desc: 'Buff, music, support.' },
    { name: 'Dancer', group: 'Healer and Support', desc: 'Buff, dance, support.' },
    { name: 'Fighter', group: 'Melee', desc: 'Sword, fist, balanced melee.' },
    { name: 'Monk', group: 'Melee', desc: 'Fist, fast, counter.' },
    { name: 'Rogue', group: 'Melee', desc: 'Dagger, steal, fast.' },
    { name: 'Thief', group: 'Melee', desc: 'Dagger, steal, fast.' },
    { name: 'Assassin', group: 'Melee', desc: 'Dagger, crit, stealth.' },
    { name: 'Samurai', group: 'Melee', desc: 'Katana, iaido, crit.' },
    { name: 'Dragoon', group: 'Melee', desc: 'Spear, jump, dragon.' },
    { name: 'Lancer', group: 'Melee', desc: 'Spear, jump, reach.' },
    { name: 'Berserker', group: 'Melee', desc: 'Axe, rage, high damage.' },
    { name: 'Dark Knight', group: 'Melee', desc: 'Sword, dark magic, drain.' },
    { name: 'Mage', group: 'Caster', desc: 'Magic, elemental.' },
    { name: 'Black Mage', group: 'Caster', desc: 'Dark magic, fire, ice, lightning.' },
    { name: 'Red Mage', group: 'Caster', desc: 'Magic and sword, balanced.' },
    { name: 'Blue Mage', group: 'Caster', desc: 'Learn enemy moves.' },
    { name: 'Summoner', group: 'Caster', desc: 'Summon, magic.' },
    { name: 'Necromancer', group: 'Caster', desc: 'Dark magic, undead.' },
    { name: 'Sorcerer', group: 'Caster', desc: 'Magic, raw power.' },
    { name: 'Wizard', group: 'Caster', desc: 'Magic, elemental.' },
    { name: 'Elementalist', group: 'Caster', desc: 'Magic, elements.' },
    { name: 'Time Mage', group: 'Caster', desc: 'Time magic, slow, haste.' },
    { name: 'Geomancer', group: 'Caster', desc: 'Magic, terrain.' },
    { name: 'Scholar', group: 'Caster', desc: 'Magic, books, support.' },
    { name: 'Archer', group: 'Ranged', desc: 'Bow, long range.' },
    { name: 'Hunter', group: 'Ranged', desc: 'Bow, trap, beast.' },
    { name: 'Ranger', group: 'Ranged', desc: 'Bow, nature, trap.' },
    { name: 'Sniper', group: 'Ranged', desc: 'Bow, crit, long range.' },
    { name: 'Gunner', group: 'Ranged', desc: 'Gun, long range.' },
    { name: 'Machinist', group: 'Ranged', desc: 'Gun, tech, gadgets.' },
    { name: 'Engineer', group: 'Ranged', desc: 'Gun, tech, traps.' },
    { name: 'Merchant', group: 'Other', desc: 'Money, trade, support.' },
    { name: 'Gambler', group: 'Other', desc: 'Luck, dice, crit.' },
    { name: 'Freelancer', group: 'Other', desc: 'Any skill, balanced.' },
    { name: 'Adventurer', group: 'Other', desc: 'Explore, balanced.' },
    { name: 'Chef', group: 'Other', desc: 'Cook, buff food.' },
    { name: 'Angler', group: 'Other', desc: 'Fish, support.' },
    { name: 'Miner', group: 'Other', desc: 'Mine, gather.' },
    { name: 'Logger', group: 'Other', desc: 'Chop wood, gather.' },
    { name: 'Gatherer', group: 'Other', desc: 'Harvest, gather.' },
    { name: 'Scavenger', group: 'Other', desc: 'Find items, gather.' }
  ];

  /* ---------- Class picker groups, in design file order ----------
   * Design file groups: Tank (6), Healer and Support (7), Melee (10),
   * Caster (12), Ranged (7), Other (10). Total 52 unique classes.
   * White Mage is listed in the design file under Healer and Support
   * and again under Caster, but it is one class, counted once.
   * Group tabs on the bottom screen, class detail on the top screen.
   * Icons are drawn procedurally, no new asset files needed. */
  var CLASS_GROUPS = [
    { group: 'Tank', short: 'TANK', color: '#e83838', blurb: 'Hold the line. Shield and guard.' },
    { group: 'Healer and Support', short: 'HEAL', color: '#38b838', blurb: 'Heal, buff, and keep the party standing.' },
    { group: 'Melee', short: 'MELEE', color: '#e88038', blurb: 'Close range blades, fists, and spears.' },
    { group: 'Caster', short: 'CAST', color: '#b838e8', blurb: 'Magic, elements, time, and summons.' },
    { group: 'Ranged', short: 'RANGD', color: '#38b8c8', blurb: 'Bows, guns, traps, and tech.' },
    { group: 'Other', short: 'OTHER', color: '#e8c838', blurb: 'Trade, luck, craft, and gather.' }
  ];
  function classGroupIndex(name) {
    for (var i = 0; i < CLASS_GROUPS.length; i++) { if (CLASS_GROUPS[i].group === name) { return i; } }
    return 0;
  }
  function classesInGroup(group) {
    var out = [];
    for (var i = 0; i < CLASSES.length; i++) { if (CLASSES[i].group === group) { out.push(i); } }
    return out;
  }
  var CLASS_ICONS = {
    'Warrior': 'sword', 'Paladin': 'holy', 'Knight': 'shield', 'Guardian': 'shield',
    'Warden': 'leaf', 'Defender': 'shield',
    'Keeper': 'cross', 'White Mage': 'holy', 'Cleric': 'cross', 'Priest': 'cross',
    'Druid': 'leaf', 'Bard': 'music', 'Dancer': 'music',
    'Fighter': 'fist', 'Monk': 'fist', 'Rogue': 'dagger', 'Thief': 'dagger',
    'Assassin': 'dagger', 'Samurai': 'katana', 'Dragoon': 'spear', 'Lancer': 'spear',
    'Berserker': 'axe', 'Dark Knight': 'dark',
    'Mage': 'staff', 'Black Mage': 'fire', 'Red Mage': 'sword', 'Blue Mage': 'book',
    'Summoner': 'star', 'Necromancer': 'skull', 'Sorcerer': 'staff', 'Wizard': 'staff',
    'Elementalist': 'fire', 'Time Mage': 'clock', 'Geomancer': 'mountain', 'Scholar': 'book',
    'Archer': 'bow', 'Hunter': 'bow', 'Ranger': 'bow', 'Sniper': 'bow',
    'Gunner': 'gun', 'Machinist': 'gear', 'Engineer': 'gear',
    'Merchant': 'coin', 'Gambler': 'dice', 'Freelancer': 'star', 'Adventurer': 'compass',
    'Chef': 'pot', 'Angler': 'rod', 'Miner': 'pick', 'Logger': 'axe',
    'Gatherer': 'basket', 'Scavenger': 'sack'
  };
  /* Draw one small class icon in a 16x16 cell, scaled to size.
   * ctx is a 2d canvas context, x/y is the cell top left, color is the
   * group color, ink is the glyph color. All shapes are rects, lines,
   * circles, and triangles, so the icon stays crisp at 2x pixel scale. */
  function drawClassIcon(ctx, cls, x, y, size, color) {
    var icon = CLASS_ICONS[cls.name] || 'star';
    var ink = '#ffffff';
    ctx.save();
    ctx.fillStyle = '#101030';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = color || '#e8c838';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    ctx.translate(x, y);
    var k = size / 16;
    ctx.scale(k, k);
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    function r(a, b, w, h) { ctx.fillRect(a, b, w, h); }
    function tri(x1, y1, x2, y2, x3, y3) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
    }
    function circ(cx, cy, rad) { ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill(); }
    function line(x1, y1, x2, y2, w) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineWidth = w || 1; ctx.stroke();
    }
    if (icon === 'sword') { r(7, 1, 2, 8); tri(8, 0, 6, 2, 10, 2); r(4, 9, 8, 2); r(7, 11, 2, 4); }
    else if (icon === 'shield') { ctx.beginPath(); ctx.moveTo(8, 1); ctx.lineTo(14, 3); ctx.lineTo(14, 8); ctx.lineTo(8, 15); ctx.lineTo(2, 8); ctx.lineTo(2, 3); ctx.closePath(); ctx.fill(); r(7, 4, 2, 7); r(5, 6, 6, 2); }
    else if (icon === 'holy') { r(7, 2, 2, 11); r(4, 5, 8, 2); circ(8, 2, 1.5); }
    else if (icon === 'cross') { r(7, 3, 2, 10); r(4, 6, 8, 2); }
    else if (icon === 'leaf') { ctx.beginPath(); ctx.moveTo(8, 1); ctx.lineTo(14, 7); ctx.lineTo(8, 14); ctx.lineTo(2, 7); ctx.closePath(); ctx.fill(); line(8, 3, 8, 13, 1); }
    else if (icon === 'music') { r(5, 3, 1, 9); r(10, 3, 1, 9); circ(4, 12, 2); circ(9, 12, 2); r(5, 3, 6, 1); }
    else if (icon === 'fist') { r(4, 5, 8, 7); r(4, 3, 2, 2); r(7, 3, 2, 2); r(10, 3, 2, 2); r(5, 12, 6, 2); }
    else if (icon === 'dagger') { tri(8, 0, 6, 6, 10, 6); r(7, 6, 2, 5); r(5, 11, 6, 2); r(7, 13, 2, 2); }
    else if (icon === 'katana') { line(2, 13, 13, 3, 2); line(3, 14, 5, 12, 2); r(11, 2, 3, 3); }
    else if (icon === 'spear') { tri(8, 0, 5, 5, 11, 5); r(7, 5, 2, 10); }
    else if (icon === 'axe') { r(3, 2, 8, 4); r(11, 2, 2, 12); r(3, 2, 2, 6); }
    else if (icon === 'dark') { circ(8, 8, 6); ctx.fillStyle = '#101030'; circ(10, 7, 5); ctx.fillStyle = ink; circ(5, 5, 1); circ(11, 11, 1); }
    else if (icon === 'staff') { circ(8, 3, 3); r(7, 6, 2, 9); r(5, 13, 6, 2); }
    else if (icon === 'fire') { tri(8, 1, 13, 10, 3, 10); tri(8, 6, 11, 13, 5, 13); r(7, 13, 2, 2); }
    else if (icon === 'book') { r(3, 3, 10, 11); ctx.fillStyle = '#101030'; r(7, 3, 1, 11); r(4, 5, 2, 7); r(9, 5, 2, 7); }
    else if (icon === 'star') { tri(8, 1, 10, 6, 6, 6); tri(8, 15, 10, 10, 6, 10); r(6, 7, 4, 2); tri(1, 8, 6, 6, 6, 10); tri(15, 8, 10, 6, 10, 10); }
    else if (icon === 'skull') { circ(8, 7, 5); r(5, 10, 6, 4); ctx.fillStyle = '#101030'; circ(6, 7, 1.2); circ(10, 7, 1.2); }
    else if (icon === 'clock') { circ(8, 8, 6); ctx.fillStyle = '#101030'; circ(8, 8, 4.5); ctx.fillStyle = ink; r(7, 4, 2, 4); r(8, 8, 4, 1); }
    else if (icon === 'mountain') { tri(8, 2, 15, 14, 1, 14); ctx.fillStyle = '#101030'; tri(8, 2, 11, 8, 5, 8); }
    else if (icon === 'bow') { ctx.beginPath(); ctx.arc(6, 8, 6, -1.2, 1.2); ctx.stroke(); line(6, 2, 6, 14, 1); line(4, 7, 11, 9, 1); }
    else if (icon === 'gun') { r(2, 5, 11, 3); r(4, 8, 3, 6); r(12, 6, 2, 2); }
    else if (icon === 'gear') { r(5, 2, 6, 12); r(2, 5, 12, 6); circ(8, 8, 3); ctx.fillStyle = '#101030'; circ(8, 8, 1.5); }
    else if (icon === 'coin') { circ(8, 8, 6); ctx.fillStyle = '#101030'; circ(8, 8, 4); ctx.fillStyle = ink; r(7, 5, 2, 6); }
    else if (icon === 'dice') { r(3, 3, 10, 10); ctx.fillStyle = '#101030'; circ(6, 6, 1.2); circ(10, 6, 1.2); circ(8, 8, 1.2); circ(6, 10, 1.2); circ(10, 10, 1.2); }
    else if (icon === 'compass') { circ(8, 8, 6); ctx.fillStyle = '#101030'; circ(8, 8, 4.5); ctx.fillStyle = ink; tri(8, 4, 10, 10, 6, 10); }
    else if (icon === 'pot') { r(4, 5, 8, 8); r(3, 3, 10, 2); r(6, 1, 4, 2); }
    else if (icon === 'rod') { line(3, 13, 12, 3, 1); r(11, 2, 3, 2); line(12, 4, 14, 6, 1); }
    else if (icon === 'pick') { line(4, 2, 12, 2, 2); line(8, 2, 8, 14, 2); tri(4, 2, 2, 5, 5, 4); tri(12, 2, 14, 5, 11, 4); }
    else if (icon === 'basket') { tri(4, 7, 12, 7, 10, 14); ctx.beginPath(); ctx.moveTo(4, 7); ctx.lineTo(12, 7); ctx.lineTo(10, 14); ctx.lineTo(6, 14); ctx.closePath(); ctx.fill(); line(5, 4, 11, 4, 1); line(5, 4, 4, 7, 1); line(11, 4, 12, 7, 1); }
    else if (icon === 'sack') { circ(8, 9, 5); r(6, 2, 4, 4); line(6, 2, 4, 1, 1); line(10, 2, 12, 1, 1); }
    ctx.restore();
  }

  /* ---------- 5 core Bondkin bloodlines ----------
     Showcase portraits live in assets/p_bondkin_<id>.png (96x96 each).
     Arc partner names are the story draft names in story.js NAMES_DRAFT.
     Greetings are the story draft greetings, quoted on the showcase. */
  var BLOODLINES = [
    { id: 'elf', num: '001', name: 'Elf', totem: 'Starwarden', totemTitle: 'guardian of the Elf bloodline', trait: 'Balanced, all special jobs.', reward: 'Starwarden Oath', desc: 'Forest and starlit. Long eared. Totem Spirit Starwarden.', img: 'assets/bl_elf.png', arc: 'Aelindra', line: 'Long eared, forest and starlit. A balanced wanderer, master of all jobs.', greeting: 'The stars have been watching this road a long time, trainer.' },
    { id: 'puffkin', num: '002', name: 'Puffkin', totem: 'Brightpom Sovereign', totemTitle: 'master tinkerer of the Puffkin bloodline', trait: 'Magic, fairy.', reward: 'Brightpom Gear', desc: 'Small, bright, clever. Totem Spirit Brightpom Sovereign.', img: 'assets/bl_puffkin.png', arc: 'Pip', line: 'Small, bright, clever. A master tinkerer from the Tinkerwright Guild.', greeting: 'Oh good, a trainer! I have six ideas and no hands free!' },
    { id: 'elderkin', num: '003', name: 'Elderkin', totem: 'Quiet Flame Sage', totemTitle: 'keeper of the Elderkin bloodline', trait: 'Magic, strong.', reward: 'Quiet Flame Tome', desc: 'Old, calm, deep magic. Totem Spirit Quiet Flame Sage.', img: 'assets/bl_elderkin.png', arc: 'Halden', line: 'Old, calm, deep magic. A quiet sage who keeps the old flame lore.', greeting: 'Quiet now. The harbor listens, and so do I.' },
    { id: 'harefolk', num: '004', name: 'Harefolk', totem: 'Moonhare Matriarch', totemTitle: 'swiftest of the Harefolk bloodline', trait: 'Fighting, fast.', reward: 'Moonhare Flute', desc: 'Swift, sharp, moonlit. Totem Spirit Moonhare Matriarch.', img: 'assets/bl_harefolk.png', arc: 'Marnie', line: 'Swift, sharp, moonlit. Fastest runners of the deep forest.', greeting: 'You walk like prey that never learned to run. I can fix that.' },
    { id: 'drakescale', num: '005', name: 'Drakescale', totem: 'Emberwyrm King', totemTitle: 'strongest of the Drakescale bloodline', trait: 'Dragon, tough.', reward: 'Emberwyrm Horn', desc: 'Scaled, hardy, ember born. Totem Spirit Emberwyrm King.', img: 'assets/bl_drakescale.png', arc: 'Cinder', line: 'Scaled, hardy, ember born. Tough warriors with fire in their blood.', greeting: 'Hmph. Small trainer, loud harbor. Let us see your fire.' }
  ];

  /* ---------- Craft Grimoires (hold Crafts, picked at creation) ---------- */
  var GRIMOIRES = [
    { name: 'Grimoire of Dawn', desc: 'Light Crafts. Healing and guard. For trainers who stand in front.' },
    { name: 'Grimoire of Dusk', desc: 'Shadow Crafts. Dark strikes and drains. For trainers who end fights fast.' },
    { name: 'Grimoire of Stars', desc: 'Star Crafts. Balanced light and fate. Linked to the Starwarden.' },
    { name: 'Grimoire of Tides', desc: 'Water Crafts. Swift strikes and flow. For trainers who keep moving.' }
  ];

  /* ---------- Guide forms: picked at creation, Sword, Staff, Shield ----------
   * The opening choice sets the first guide. Sword gives a fairy, Staff
   * gives a mystical orb, Shield gives the Grimoire itself. The fairy,
   * the orb, and the Grimoire do the same job: the wiki and the contacts.
   * ---------------------------------------------------------------------- */
  var GUIDE_FORMS = [
    { name: 'Sword', guide: 'fairy', desc: 'Attack. Your guide is a fairy.' },
    { name: 'Staff', guide: 'mystical orb', desc: 'Magic. Your guide is a mystical orb.' },
    { name: 'Shield', guide: 'Grimoire itself', desc: 'In between. Your guide is the Grimoire itself.' }
  ];

  /* ---------- Guide Grimoires: the in-game AI wiki and contact book -------
   * Four are offered: Muse, Grok, the Wisp, the Chronicler. All four do
   * the same two jobs only, the wiki and the contacts, and all four give
   * the same answers. Only the voice differs. Switch at any Puffkin shop
   * for 500 Crests, as often as wanted. Contacts and notes carry over.
   * ---------------------------------------------------------------------- */
  var GUIDE_GRIMOIRES = [
    { name: 'Muse', voice: 'Calm, plain, direct.' },
    { name: 'Grok', voice: 'Blunt, quick, dry.' },
    { name: 'Wisp', voice: 'Warm, soft, a guiding light.' },
    { name: 'Chronicler', voice: 'Formal, careful, keeper of records.' }
  ];

  /* Arc Bondkin names, one per starter bloodline (story.js namesDraft). */
  var ARC_BONDKIN_NAMES = {
    elf: 'Aelindra', puffkin: 'Pip', elderkin: 'Halden',
    harefolk: 'Marnie', drakescale: 'Cinder'
  };

  /* Starter Wildlife, from the 3 eggs the kind Wisp dropped. */
  var STARTER_DEFS = {
    whelp: { name: 'Whelp', codex: '002', type: 'Fire', note: 'A small ember cub. Quick to spark, quick to learn.' },
    puk: { name: 'Puk', codex: '104', type: 'Flying and Dragon', note: 'A bright winged whelp. Fast in the air, proud on the ground.' },
    mandragora: { name: 'Mandragora', codex: '029', type: 'Grass', note: 'A root singer. Slow to move, steady to grow.' }
  };

  var PRONOUNS = [
    { id: 'him', label: 'him', he: 'he', him: 'him', his: 'his' },
    { id: 'her', label: 'her', he: 'she', him: 'her', his: 'her' },
    { id: 'they', label: 'they', he: 'they', him: 'them', his: 'their' }
  ];

  /* V9-ART: eggs redrawn from scratch (egg9_*.png), each distinct and
   * matched to what hatches. front is the front-facing hatch reveal
   * sprite: the reveal shows the Wildlife facing the player, never
   * its back. hint is the one-line hatch preview shown at the pick. */
  var EGGS = [
    { id: 'whelp', codex: '002', name: 'Whelp', type: 'Fire', img: 'assets/egg9_whelp.png', cracked: 'assets/egg9_cracked_whelp.png', front: 'assets/b_whelp_front.png', back: 'assets/b_whelp_back.png', hint: 'Hatches a Whelp, Fire. A small ember cub, quick to spark.' },
    { id: 'puk', codex: '104', name: 'Puk', type: 'Flying and Dragon', img: 'assets/egg9_puk.png', cracked: 'assets/egg9_cracked_puk.png', front: 'assets/b_puk_front.png', back: 'assets/b_puk_back.png', hint: 'Hatches a Puk, Flying and Dragon. Fast in the air, proud on the ground.' },
    { id: 'mandragora', codex: '029', name: 'Mandragora', type: 'Grass', img: 'assets/egg9_mandragora.png', cracked: 'assets/egg9_cracked_mandragora.png', front: 'assets/b_mandragora_front.png', back: 'assets/b_mandragora_back.png', hint: 'Hatches a Mandragora, Grass. A root singer, slow to move, steady to grow.' }
  ];

  function hatchEggById(id) {
    for (var i = 0; i < EGGS.length; i++) {
      if (EGGS[i].id === id) { return EGGS[i]; }
    }
    return EGGS[0];
  }

  var WALLET_CAP = 999999;

  /* ---------- State ---------- */
  function freshState() {
    return {
      version: VERSION,
      trainer: {
        name: '',
        sex: '',           /* girl or boy */
        race: '',          /* Solar or Polar */
        path: '',          /* Rebel, Peacekeeper, Hunter, Peacemaker */
        pronouns: '',      /* him, her, they */
        klass: '',         /* Mankind class, one of the 52 */
        advancedClass: '',
        bloodline: '',     /* Elf, Puffkin, Elderkin, Harefolk, Drakescale */
        totem: '',
        grimoire: '',
        guideForm: '',     /* Sword, Staff, or Shield: fairy, orb, or Grimoire */
        guideGrimoire: '', /* Muse, Grok, the Wisp, or the Chronicler */
        level: 1,
        xp: 0,
        hp: 20,
        maxHp: 20
      },
      party: [],           /* Bondkin and Wildlife partners */
      monsterBank: null,   /* Roster 24, deploy 6, sales. Built by ensureMonsterBank. */
      contacts: [],        /* Grimoire contacts: trainers who wrote their names in */
      wallet: { cr: 0, cap: WALLET_CAP },
      bag: { snareOrbs: 5, potions: 3 },
      flags: {},
      location: 'Gatehollow',
      playtimeSec: 0,
      createdAt: ''
    };
  }

  var state = freshState();

  /* ---------- Asset loader (relative paths, missing files fall back) ---------- */
  var imageCache = {};
  function loadImage(path) {
    if (imageCache[path]) { return imageCache[path]; }
    var img = new Image();
    img.src = path;
    img.onerror = function () { img._missing = true; };
    imageCache[path] = img;
    return img;
  }
  function drawImageOrNull(ctx, path, x, y, w, h) {
    var img = loadImage(path);
    if (!img.complete || img.naturalWidth === 0 || img._missing) { return false; }
    if (w && h) { ctx.drawImage(img, x, y, w, h); }
    else { ctx.drawImage(img, x, y); }
    return true;
  }

  /* ---------- ov3 visual overhaul helpers (Phase B) ----------
   * 512x384 ov3 art covers one DS screen when drawn at 0,0,W,H.
   * RGB ov3 files have no alpha channel, so an overlay asset whose
   * surround must disappear is keyed in code, never drawn raw. */
  var _keyedWhiteCache = {};
  function keyedWhiteCanvas(path) {
    /* ov3_title_frame.png is RGB with a solid white center. Key out
     * near-white pixels to transparent so it composites as a frame
     * over the title background instead of painting a white box. */
    if (_keyedWhiteCache[path]) { return _keyedWhiteCache[path]; }
    var img = loadImage(path);
    if (!img.complete || img.naturalWidth === 0 || img._missing) { return null; }
    var c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    var g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    try {
      var d = g.getImageData(0, 0, c.width, c.height);
      var px = d.data;
      for (var i = 0; i < px.length; i += 4) {
        if (px[i] > 240 && px[i + 1] > 240 && px[i + 2] > 240) { px[i + 3] = 0; }
      }
      g.putImageData(d, 0, 0);
    } catch (e) { return null; }
    _keyedWhiteCache[path] = c;
    return c;
  }
  function drawTitleFrame(ctx) {
    var c = keyedWhiteCanvas('assets/ov3_title_frame.png');
    if (c) { ctx.drawImage(c, 0, 0, W, H); }
  }
  function drawScreenBg(ctx, path) {
    /* Full-screen ov3 backdrop. Falls back to the old flat fill. */
    if (!drawImageOrNull(ctx, path, 0, 0, W, H)) { clearScreen(ctx, '#0a0a1e'); }
  }
  function drawBannerOverBg(ctx, path, title, sub) {
    /* drawTopBanner without the clearScreen, so the ov3 backdrop
     * underneath survives. Title and sub sit at the same coords.
     * The sub sits on a dark strip so it stays readable over busy
     * art, which used to wash the faint grey question line out. */
    drawScreenBg(ctx, path);
    /* BANNER-FIX v8: title moved down 4px so the full glyphs show
     * clear of the top edge; the sub strip moves down with it. */
    drawText(ctx, title, 10, 14, '#e8c838', '14px monospace');
    if (sub) {
      ctx.fillStyle = 'rgba(5,5,15,0.62)';
      ctx.fillRect(0, 30, W, 16);
      /* BANNER-FIX v8: long subs (deploy, sell) ran off the right
       * edge at 10px. Measure first; shrink to 8px when the sub
       * would not fit, so every sub reads in full. Wording unchanged. */
      var subFont = '10px monospace';
      ctx.font = subFont;
      if (ctx.measureText(sub).width > W - 20) { subFont = '8px monospace'; }
      drawText(ctx, sub, 10, 34, '#ffffff', subFont);
    }
  }
  function drawOv3Panel(ctx, x, y, w, h, fill, border) {
    /* ov3_create_panel.png has black outside its rounded frame, not
     * transparency, so it is drawn as the full panel itself, never as
     * an overlay on top of the creation background. */
    if (!drawImageOrNull(ctx, 'assets/ov3_create_panel.png', x, y, w, h)) {
      drawBox(ctx, x, y, w, h, fill, border);
    } else if (border) {
      ctx.strokeStyle = border;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    }
  }
  function drawPortraitFrame(ctx, x, y, w, h) {
    /* BUBBLE-FIX: square DS frame, no circular ring art. Gold outer
     * border, dark inner line, gold corner studs. The portrait images
     * are square, so they fill the frame exactly. */
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(x - 2, y - 2, w + 4, 2);
    ctx.fillRect(x - 2, y + h, w + 4, 2);
    ctx.fillRect(x - 2, y - 2, 2, h + 4);
    ctx.fillRect(x + w, y - 2, 2, h + 4);
    ctx.strokeStyle = '#20242a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.fillRect(x + w - 2, y - 2, 4, 4);
    ctx.fillRect(x - 2, y + h - 2, 4, 4);
    ctx.fillRect(x + w - 2, y + h - 2, 4, 4);
  }
  function isNightHour() {
    var h = new Date().getHours();
    return h >= 21 || h < 5;
  }

  /* ---------- Canvas setup: two stacked 256x192 screens, scaled 2x ---------- */
  var topCanvas = null, bottomCanvas = null;
  var topCtx = null, bottomCtx = null;
  var rootEl = null;

  function setupCanvases() {
    topCanvas = document.getElementById('topScreen');
    bottomCanvas = document.getElementById('bottomScreen');
    if (!topCanvas || !bottomCanvas) {
      rootEl = document.createElement('div');
      rootEl.id = 'fed13-ds';
      rootEl.style.textAlign = 'center';
      rootEl.style.background = '#0a0a14';
      rootEl.style.padding = '8px';
      rootEl.style.fontFamily = 'monospace';
      topCanvas = document.createElement('canvas');
      topCanvas.id = 'topScreen';
      bottomCanvas = document.createElement('canvas');
      bottomCanvas.id = 'bottomScreen';
      rootEl.appendChild(topCanvas);
      rootEl.appendChild(document.createElement('br'));
      rootEl.appendChild(bottomCanvas);
      document.body.appendChild(rootEl);
    }
    [topCanvas, bottomCanvas].forEach(function (c) {
      c.width = W;
      c.height = H;
      c.style.width = (W * SCALE) + 'px';
      c.style.height = (H * SCALE) + 'px';
      c.style.imageRendering = 'pixelated';
      c.style.background = '#000';
      c.style.border = '2px solid #222244';
      c.style.display = 'inline-block';
    });
    /* START FIX: tapping either canvas on the title screen works like
     * START / Enter. Gated to the title screen only, so battle taps
     * (battle1v1 owns its own canvas handlers while it runs) and
     * overworld input are untouched. */
    function onTitleCanvasTap() {
      if (currentScreen === 'title') { press('start'); }
    }
    topCanvas.addEventListener('click', onTitleCanvasTap);
    bottomCanvas.addEventListener('click', onTitleCanvasTap);
    topCtx = topCanvas.getContext('2d');
    bottomCtx = bottomCanvas.getContext('2d');
    topCtx.imageSmoothingEnabled = false;
    bottomCtx.imageSmoothingEnabled = false;
  }

  /* ---------- On-screen controls: D-pad plus A / B / X ---------- */
  function setupControls() {
    var holder = document.getElementById('fed13-controls');
    if (holder) { return; }
    holder = document.createElement('div');
    holder.id = 'fed13-controls';
    holder.style.textAlign = 'center';
    holder.style.marginTop = '8px';
    holder.style.userSelect = 'none';
    var parent = rootEl || document.body;
    parent.appendChild(holder);

    function mkBtn(label, action, w) {
      var b = document.createElement('button');
      b.textContent = label;
      b.setAttribute('data-fed13-btn', action);
      b.style.width = (w || 44) + 'px';
      b.style.height = '44px';
      b.style.margin = '2px';
      b.style.fontSize = '16px';
      b.style.fontFamily = 'monospace';
      b.style.fontWeight = 'bold';
      b.style.cursor = 'pointer';
      /* DS controls: deep navy face, gold border, pale gold label. */
      b.style.background = '#1c2a4a';
      b.style.color = '#ffe9a8';
      b.style.border = '2px solid #d9a441';
      b.style.borderRadius = '4px';
      b.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        press(action);
      });
      holder.appendChild(b);
      return b;
    }
    /* D-pad cluster */
    mkBtn('UP', 'up'); mkBtn('LEFT', 'left'); mkBtn('DOWN', 'down'); mkBtn('RIGHT', 'right');
    mkBtn('A', 'confirm', 56);
    mkBtn('B', 'cancel', 56);
    mkBtn('X', 'menu', 56);
    /* START stands out: gold face, dark navy label. */
    var startBtn = mkBtn('START', 'start', 64);
    startBtn.style.background = '#d9a441';
    startBtn.style.color = '#101030';
  }

  /* ---------- Helpers: drawing ---------- */
  function clearScreen(ctx, color) {
    ctx.fillStyle = color || '#000';
    ctx.fillRect(0, 0, W, H);
  }
  function drawBox(ctx, x, y, w, h, fill, border) {
    ctx.fillStyle = fill || '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = border || '#101030';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
  function drawText(ctx, text, x, y, color, font) {
    ctx.fillStyle = color || '#101030';
    ctx.font = font || '10px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }
  function wrapLines(ctx, text, maxWidth) {
    var words = String(text).split(' ');
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && cur) {
        lines.push(cur);
        cur = words[i];
      } else { cur = test; }
    }
    if (cur) { lines.push(cur); }
    return lines;
  }
  /* DIALOGUE-FIT v9: the box art's cream interior is narrower than the
   * box rect. Light art 512x128, centre profiles: cream x 32-480,
   * y 24-104, drawn at 244x58 from x 6 y 128, so canvas cream is
   * x 15.5-239.6, y 137.1-176.9. The old textX 14 / textW 228 put the
   * first glyph on the left gold frame and full-width lines on the
   * right frame, and 4 lines on a 10px step ran descenders past the
   * cream bottom (10px DejaVu ink runs to y + 11.6). Text now sits
   * inside the cream: left 30, right 234 (portrait text starts at 64),
   * first line top 137, 9px step, so 4 lines end at canvas y 175.6.
   * The dark art's interior is full-bleed, so the same inset fits it.
   * Worker D's v8 "242.9 edge" was the box rect edge, not the cream,
   * which is why his portrait lines measured fine while full-width
   * narration lines still clipped on both sides.
   * V9 STUD FIX (2026-11-25): left 20 was still wrong. The box art's
   * corner stud diamond reaches canvas x 25.5 at y 130.7-139.8 on BOTH
   * arts (its bottom tip sits where line 1's first glyph starts), so
   * the tail page "single flaw anywhere ever." had its first 's'
   * clipped by the stud even though ink minX 20 was inside the cream.
   * The dark art's left frame line also runs to x 18.4 in the text
   * bands. Left 30 clears the diamond tip by 4.5px on every line
   * (top and bottom studs share the 25.5 tip). Right 234 clears the
   * dark art's right ornament, which starts at x 236.7. */
  var DIALOGUE_TEXT_X = 30;       /* no-portrait left edge, canvas px */
  var DIALOGUE_TEXT_PORTRAIT_X = 64;
  var DIALOGUE_TEXT_RIGHT = 234;  /* right edge for every layout */
  var DIALOGUE_TEXT_Y = 9;        /* first line top, relative to box y */
  var DIALOGUE_LINE_STEP = 9;
  var DIALOGUE_MAX_LINES = 4;
  var DIALOGUE_FONT_SIZES = [10, 9, 8];
  var measureCanvas = null;
  function dialogueMeasureCtx() {
    if (!measureCanvas) { measureCanvas = document.createElement('canvas'); }
    return measureCanvas.getContext('2d');
  }
  function dialogueTextW(portrait) {
    return DIALOGUE_TEXT_RIGHT - (portrait ? DIALOGUE_TEXT_PORTRAIT_X : DIALOGUE_TEXT_X);
  }
  /* Largest size (10, 9, 8) whose wrap of text fits 4 lines, plus the
   * wrapped lines at that size. Measured with the real font, on an
   * offscreen context, so the fit never depends on whatever font the
   * last draw left on a screen context (the v8 lesson). */
  function fitDialogueText(text, textW) {
    var mctx = dialogueMeasureCtx();
    var lines = null;
    var px = 8;
    for (var s = 0; s < DIALOGUE_FONT_SIZES.length; s++) {
      mctx.font = DIALOGUE_FONT_SIZES[s] + 'px monospace';
      lines = wrapLines(mctx, text, textW);
      px = DIALOGUE_FONT_SIZES[s];
      if (lines.length <= DIALOGUE_MAX_LINES) { break; }
    }
    return { fontPx: px, lines: lines };
  }
  function hpColor(hp, maxHp) {
    var r = hp / Math.max(1, maxHp);
    if (r > 0.521) { return '#38b838'; }
    if (r > 0.208) { return '#e8c838'; }
    return '#e83838';
  }
  function drawHpBar(ctx, x, y, w, hp, maxHp) {
    ctx.fillStyle = '#101030';
    ctx.fillRect(x - 1, y - 1, w + 2, 8);
    ctx.fillStyle = '#888';
    ctx.fillRect(x, y, w, 6);
    ctx.fillStyle = hpColor(hp, maxHp);
    ctx.fillRect(x, y, Math.round(w * hp / Math.max(1, maxHp)), 6);
  }
  function timeTint() {
    var h = new Date().getHours();
    if (h >= 5 && h < 9) { return 'rgba(40,40,90,0.18)'; }      /* morning */
    if (h >= 9 && h < 15) { return null; }                        /* day */
    if (h >= 15 && h < 18) { return 'rgba(230,120,40,0.12)'; }  /* afternoon */
    if (h >= 18 && h < 21) { return 'rgba(20,20,60,0.30)'; }    /* evening */
    return 'rgba(10,10,40,0.45)';                                /* night */
  }

  /* ---------- Save and load ---------- */
  function saveGame() {
    try {
      state.playtimeSec = state.playtimeSec || 0;
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (e) { return false; }
  }
  function loadGame() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) { return null; }
      var data = JSON.parse(raw);
      if (!data || !data.trainer) { return null; }
      state = data;
      return state;
    } catch (e) { return null; }
  }
  function hasSave() {
    try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
  }
  function addCr(amount, isBounty) {
    /* Wallet cap 999999. The 1000000 Cr bounty is the one reward
       allowed to land the wallet at 1000000 Cr. No other gain lands
       while the wallet is at or above the cap. */
    if (amount <= 0) { return state.wallet.cr; }
    if (isBounty) {
      state.wallet.cr = Math.min(1000000, state.wallet.cr + amount);
      return state.wallet.cr;
    }
    if (state.wallet.cr >= WALLET_CAP) { return state.wallet.cr; }
    state.wallet.cr = Math.min(WALLET_CAP, state.wallet.cr + amount);
    return state.wallet.cr;
  }
  function setFlag(name, value) { state.flags[name] = (value === undefined) ? true : value; }
  function getFlag(name) { return !!state.flags[name]; }

  /* ---------- Typewriter text engine ---------- */
  var textBox = {
    active: false,
    lines: [],
    portrait: null,
    speaker: null,
    lineIndex: 0,
    charsShown: 0,
    done: false,
    onDone: null,
    fontPx: 10,        /* DIALOGUE-FIT v9: size showText fitted for this call */
    speed: 2,          /* chars per frame at 60 Hz, slow DS text */
    timer: 0,
    speedSetting: 'slow'
  };
  function textSpeedChars() {
    if (textBox.speedSetting === 'fast') { return 4; }
    if (textBox.speedSetting === 'normal') { return 3; }
    return 2;
  }
  function showText(lines, portrait, onDone, speaker) {
    if (typeof lines === 'string') { lines = [lines]; }
    /* DIALOGUE-FIT v9: fit every line to the cream before it is shown.
     * Each line is measured at the real text width (portrait or not)
     * and shrunk 10 to 9 to 8px until it wraps to 4 lines. A line
     * still longer than 4 visual lines at 8px is split into 4-line
     * pages, one textBox line per page, so no tail is ever silently
     * dropped by the draw cap (the old code showed the first 4 wrapped
     * lines and threw the rest away: the tail of the 194-char creation
     * narration and the 212-char Petra opener never displayed). A page
     * types out like any other line: A finishes it, A again turns the
     * page. Short lines are untouched: one page at 10px. Every page
     * draws at the call's single fitted size, so the wrap on screen is
     * the wrap that was fitted. */
    var textW = dialogueTextW(!!portrait);
    var fitPx = 10;
    var perLine = [];
    for (var li = 0; li < lines.length; li++) {
      var fit0 = fitDialogueText(lines[li] || '', textW);
      perLine.push(fit0);
      if (fit0.fontPx < fitPx) { fitPx = fit0.fontPx; }
    }
    var expanded = [];
    for (var k = 0; k < lines.length; k++) {
      var fl = perLine[k].lines;
      if (perLine[k].fontPx !== fitPx) {
        var mctx = dialogueMeasureCtx();
        mctx.font = fitPx + 'px monospace';
        fl = wrapLines(mctx, lines[k] || '', textW);
      }
      if (fl.length <= DIALOGUE_MAX_LINES) {
        expanded.push(lines[k]);
      } else {
        for (var p = 0; p < fl.length; p += DIALOGUE_MAX_LINES) {
          expanded.push(fl.slice(p, p + DIALOGUE_MAX_LINES).join(' '));
        }
      }
    }
    textBox.lines = expanded.length ? expanded : lines.slice();
    textBox.fontPx = fitPx;
    textBox.portrait = portrait || null;
    textBox.speaker = speaker || null;
    textBox.lineIndex = 0;
    textBox.charsShown = 0;
    textBox.done = false;
    textBox.active = true;
    textBox.onDone = (typeof onDone === 'function') ? onDone : null;
    textBox.timer = 0;
  }
  function textAdvance() {
    if (!textBox.active) { return false; }
    var full = textBox.lines[textBox.lineIndex] || '';
    if (textBox.charsShown < full.length) {
      textBox.charsShown = full.length; /* A while typing: finish the line */
      return true;
    }
    textBox.lineIndex++;
    textBox.charsShown = 0;
    if (textBox.lineIndex >= textBox.lines.length) {
      textBox.active = false;
      textBox.done = true;
      var cb = textBox.onDone;
      textBox.onDone = null;
      if (cb) { cb(); }
    }
    return true;
  }
  function textUpdate() {
    if (!textBox.active) { return; }
    var full = textBox.lines[textBox.lineIndex] || '';
    if (textBox.charsShown < full.length) {
      textBox.charsShown = Math.min(full.length, textBox.charsShown + textSpeedChars());
    }
  }
  function drawTextBox(ctx, darkOpt) {
    if (!textBox.active) { return; }
    var x = 6, y = 128, w = W - 12, h = 58;
    /* Night (21:00 to 05:00) and cutscene boxes use the dark art.
     * Every other box uses the light art. Either falls back to the
     * old procedural box when its file is missing. */
    var dark = (darkOpt === true) || (darkOpt !== false && isNightHour());
    var boxOk = false;
    if (dark) {
      boxOk = drawImageOrNull(ctx, 'assets/ov3_dialog_box_dark.png', x, y, w, h);
    } else {
      boxOk = drawImageOrNull(ctx, 'assets/ov3_dialog_box.png', x, y, w, h);
    }
    if (!boxOk) { drawBox(ctx, x, y, w, h, dark ? '#10131a' : '#ffffff', '#101030'); }
    var ink = dark ? '#f8f0c8' : '#101030';
    /* Speaker name tag above the box, from the speakerName the story
     * line already carries. Cutscene lines carry the name only as a
     * "Name: " prefix in the text, so that prefix is the fallback. */
    var speaker = textBox.speaker;
    var full0 = textBox.lines[textBox.lineIndex] || '';
    if (!speaker) {
      var m = full0.match(/^([A-Za-z][A-Za-z .'\-]{1,30}): /);
      if (m) { speaker = m[1]; }
    }
    if (speaker) {
      /* NAME-TAG-FIX v8-grid-pill: the ov3_name_tag.png art is a small
       * pill floating in the middle of a 128x32 canvas (opaque x 42-84,
       * y 7-25), so stretching it to the tag rect put the pill on top
       * of the middle of a long name ("Guild Clerk Petra") while the
       * ends hung off it. Draw a procedural pill sized to the measured
       * name instead, so the pill always sits behind the whole name.
       * Text is drawn with an explicit middle baseline, centred in
       * the pill. */
      ctx.save();
      ctx.font = '9px monospace';
      var tagW = Math.min(W - 12, Math.ceil(ctx.measureText(speaker).width) + 16);
      var tagH = 16;
      var tagY = y - tagH - 2;
      if (tagY >= 0) {
        ctx.fillStyle = '#1c2c4e';
        ctx.fillRect(x, tagY, tagW, tagH);
        ctx.strokeStyle = '#e8c838';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, tagY + 0.5, tagW - 1, tagH - 1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f8f0c8';
        ctx.fillText(speaker, x + tagW / 2, tagY + tagH / 2 + 1);
      }
      ctx.restore();
    }
    /* DIALOGUE-FIT v9: text sits inside the cream, not the box rect:
     * left 30, right 234; portrait text starts at 64. The old x + 8 /
     * w - 16 (14 / 228) put the first glyph on the left gold frame and
     * full-width lines on the right frame. V9 STUD FIX: left 30 clears
     * the corner stud diamond (right tip x 25.5, both arts). */
    var textX = DIALOGUE_TEXT_X;
    var textW = DIALOGUE_TEXT_RIGHT - DIALOGUE_TEXT_X;
    if (textBox.portrait) {
      var ok = drawImageOrNull(ctx, textBox.portrait, x + 6, y + 6, 44, 44);
      if (!ok) {
        ctx.fillStyle = '#c8c8f0';
        ctx.fillRect(x + 6, y + 6, 44, 44);
        drawText(ctx, '?', x + 22, y + 18, '#101030', '16px monospace');
      }
      drawPortraitFrame(ctx, x + 6, y + 6, 44, 44);
      textX = DIALOGUE_TEXT_PORTRAIT_X;
      textW = DIALOGUE_TEXT_RIGHT - DIALOGUE_TEXT_PORTRAIT_X;
    }
    var full = textBox.lines[textBox.lineIndex] || '';
    var shown = full.slice(0, textBox.charsShown);
    /* DIALOGUE-FIX v8: measure with the font that is actually drawn.
     * wrapLines used to run before ctx.font was set to 10px, so it
     * measured with whatever font the previous draw left on this
     * context and wrapped lines wider than the box, clipping the
     * last words at the right edge. DIALOGUE-FIT v9: the size comes
     * from showText (textBox.fontPx), so the wrap on screen is the
     * wrap that was fitted, and a 4th line is allowed so a long
     * line is never silently dropped. */
    var fontPx = textBox.fontPx || 10;
    var font = fontPx + 'px monospace';
    ctx.font = font;
    var wrapped = wrapLines(ctx, shown, textW);
    /* DIALOGUE-LAYOUT-FIX v8-grid-pill: the box art's cream interior
     * is canvas y 137-177 (the art is 512x128 drawn at 244x58, cream
     * y 20-108). DIALOGUE-FIT v9: a 9px step (tops 137, 146, 155, 164)
     * keeps 4 lines of 10px ink (bottom 175.6) inside the cream; the
     * old 10px step put line 4 at 167-179, its descenders cut by the
     * bottom frame. */
    for (var i = 0; i < wrapped.length && i < DIALOGUE_MAX_LINES; i++) {
      drawText(ctx, wrapped[i], textX, y + DIALOGUE_TEXT_Y + i * DIALOGUE_LINE_STEP, ink, font);
    }
    /* Continue prompt when the line is complete */
    if (textBox.charsShown >= full.length) {
      var blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        var ax = x + w - 18, ay = y + h - 16;
        if (!drawImageOrNull(ctx, 'assets/ov3_dialog_arrow.png', ax, ay, 12, 12)) {
          ctx.fillStyle = '#101030';
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax + 8, ay);
          ctx.lineTo(ax + 4, ay + 6);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }
  function drawTextBoxTop(ctx) {
    /* Portrait on the top screen while text runs, DS style. */
    if (!textBox.active || !textBox.portrait) { return; }
    drawImageOrNull(ctx, textBox.portrait, 8, 8, 48, 48);
    drawPortraitFrame(ctx, 8, 8, 48, 48);
  }

  /* ---------- Story staging: one framed beat on the top screen ------- */
  /* A staged story scene (see FED13.story.ghoulEncounterStaging) names
   * one beat per dialogue line: a background plus sprites placed on the
   * 256x192 top screen. showDialogue picks the beat from line.beat and
   * the cutscene screen draws it. The bag has no image file, so it is
   * drawn procedurally. A missing sprite draws a labeled block, never
   * a blank screen and never a stop. FX reuse FED13.story.fx when the
   * story module is loaded, and are skipped when it is not. */
  var stagingState = null; /* { beats, beat, lineBeats } */
  function setStaging(beats, beat) {
    stagingState = { beats: beats || [], beat: (typeof beat === 'number') ? beat : 0, lineBeats: null };
  }
  function clearStaging() { stagingState = null; }
  function currentStagingBeat() {
    if (!stagingState || !stagingState.beats || stagingState.beats.length === 0) { return null; }
    var idx = stagingState.beat || 0;
    if (stagingState.lineBeats && textBox.active) {
      var li = Math.min(textBox.lineIndex, stagingState.lineBeats.length - 1);
      idx = stagingState.lineBeats[li];
    }
    idx = Math.max(0, Math.min(stagingState.beats.length - 1, idx || 0));
    return stagingState.beats[idx];
  }
  function drawProceduralBag(ctx, x, y, w, h) {
    /* Small cloth bag: brown sack, tied top, darker base. */
    var bw = w || 40, bh = h || 32;
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.moveTo(x + bw * 0.28, y + 2);
    ctx.lineTo(x + bw * 0.72, y + 2);
    ctx.lineTo(x + bw * 0.92, y + bh * 0.55);
    ctx.lineTo(x + bw * 0.82, y + bh);
    ctx.lineTo(x + bw * 0.18, y + bh);
    ctx.lineTo(x + bw * 0.08, y + bh * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6a4a22';
    ctx.fillRect(x + bw * 0.18, y + bh - 6, bw * 0.64, 6);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(x + bw * 0.28, y, bw * 0.44, 5);
    ctx.fillStyle = '#c8a86a';
    ctx.fillRect(x + bw * 0.30, y + bh * 0.35, bw * 0.12, bh * 0.30);
  }
  function drawStagingFrame(ctx, frame, t) {
    if (!ctx || !frame) { return false; }
    clearScreen(ctx, '#0a0a1e');
    if (frame.background) {
      var bgOk = drawImageOrNull(ctx, frame.background, 0, 0, W, H);
      if (!bgOk) {
        ctx.fillStyle = '#3a7a3a';
        ctx.fillRect(0, 0, W, H);
      }
    }
    var sprites = frame.sprites || [];
    for (var i = 0; i < sprites.length; i++) {
      var spr = sprites[i];
      var sx = spr.x || 0, sy = spr.y || 0, sw = spr.w || 48, sh = spr.h || 48;
      if (spr.draw === 'bag') {
        drawProceduralBag(ctx, sx, sy, sw, sh);
        continue;
      }
      var ok = drawImageOrNull(ctx, spr.img, sx, sy, sw, sh);
      if (!ok) {
        ctx.fillStyle = '#c8c8f0';
        ctx.fillRect(sx, sy, sw, sh);
        drawText(ctx, (spr.label || '?').charAt(0), sx + sw / 2 - 4, sy + sh / 2 - 6, '#101030', '14px monospace');
      }
    }
    /* FX at the beat anchor, else the frame center. */
    var fxList = frame.fx || [];
    if (fxList.length > 0) {
      var fxAt = frame.fxAt || { x: 128, y: 96 };
      var fxApi = null;
      try { fxApi = window.FED13 && window.FED13.story && window.FED13.story.fx; } catch (e) { fxApi = null; }
      if (fxApi && typeof fxApi.draw === 'function') {
        var ft = (typeof t === 'number') ? ((t / 1000) % 1) : 0.5;
        for (var f = 0; f < fxList.length; f++) {
          try { fxApi.draw(ctx, fxList[f], fxAt.x, fxAt.y, 72, ft); } catch (e) {}
        }
      }
    }
    if (frame.title) {
      ctx.fillStyle = 'rgba(10,10,30,0.65)';
      ctx.fillRect(0, 0, W, 16);
      drawText(ctx, frame.title, 6, 4, '#f8f0c8', '10px monospace');
    }
    return true;
  }

  /* ---------- Input: keyboard + on-screen buttons ---------- */
  var currentScreen = 'title';
  var screenData = null;
  var lastPressAt = 0;

  /* ---------- Delegated input forwarding (on-screen buttons) ----------
   * FED13.press is the on-screen button path: the D-pad and A / B / X /
   * START buttons in index.html and the engine fallback controls call
   * it. The overworld and grid modules own their screens and take
   * input only through their own document keydown listeners, and
   * neither module exposes a press hook, so a button press is
   * replayed here as a synthetic key event carrying the same code
   * and key a real key would carry. A module that later gains a
   * press hook is called directly instead. Real keyboard presses
   * already reach those listeners on their own, so they are never
   * replayed: setupKeyboard passes fromKeyboard true, and the
   * synthetic events themselves are flagged so the keyboard
   * listener ignores them instead of re-entering press. */
  var syntheticForward = false;
  var syntheticKeyTimers = {};
  var DELEGATED_KEY_BY_ACTION = {
    up: { code: 'ArrowUp', key: 'ArrowUp' },
    down: { code: 'ArrowDown', key: 'ArrowDown' },
    left: { code: 'ArrowLeft', key: 'ArrowLeft' },
    right: { code: 'ArrowRight', key: 'ArrowRight' },
    confirm: { code: 'Enter', key: 'Enter' },
    cancel: { code: 'Escape', key: 'Escape' },
    menu: { code: 'KeyX', key: 'x' },
    start: { code: 'Space', key: ' ' }
  };
  function dispatchSyntheticKey(type, spec) {
    if (typeof document === 'undefined' || !spec) { return; }
    var ev;
    try {
      ev = new KeyboardEvent(type, { code: spec.code, key: spec.key, bubbles: true, cancelable: true });
    } catch (e) { return; }
    syntheticForward = true;
    try { document.dispatchEvent(ev); } catch (e) {}
    syntheticForward = false;
  }
  function forwardPressToDelegated(action) {
    var mod = null;
    if (delegatedScreen === 'overworld') { mod = window.FED13 && window.FED13.overworld; }
    else if (delegatedScreen === 'grid') { mod = window.FED13 && window.FED13.grid; }
    else if (delegatedScreen === 'battle1v1') { mod = window.FED13 && window.FED13.battle1v1; }
    if (!mod) { return false; }
    /* Prefer a real press hook when the module offers one. */
    if (typeof mod.press === 'function') {
      try { mod.press(action); } catch (e) {}
      return true;
    }
    if (delegatedScreen === 'battle1v1' && typeof mod.handlePress === 'function') {
      try { mod.handlePress(action); } catch (e) {}
      return true;
    }
    var spec = DELEGATED_KEY_BY_ACTION[action];
    if (!spec) { return false; }
    /* The grid has no X key handling, so X backs out like Escape. */
    if (delegatedScreen === 'grid' && action === 'menu') {
      spec = { code: 'Escape', key: 'Escape' };
    }
    dispatchSyntheticKey('keydown', spec);
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      /* Directions are held, not tapped: the overworld steps while
       * the key is held and its menu latch clears on release, so
       * release after one tile step (170 ms) plus a frame. */
      if (syntheticKeyTimers[spec.code]) { clearTimeout(syntheticKeyTimers[spec.code]); }
      syntheticKeyTimers[spec.code] = setTimeout(function () {
        syntheticKeyTimers[spec.code] = null;
        dispatchSyntheticKey('keyup', spec);
      }, 200);
    }
    return true;
  }

  function press(action, fromKeyboard) {
    /* Route one logical press to the active screen. */
    var now = Date.now();
    if (now - lastPressAt < 90 && (action === 'up' || action === 'down' || action === 'left' || action === 'right')) {
      /* Light repeat guard for held keys; taps still pass. */
    }
    lastPressAt = now;
    /* FIX BATCH (battle1v1 canvas): while a 1v1 battle is active, route
     * the press to the battle module, which draws on the engine
     * canvases and owns its own input. This runs before the delegated
     * early return below, so it covers both entry paths: the engine
     * startBattle1v1 path (delegatedScreen is battle1v1) and the direct
     * overworld path (delegatedScreen is still overworld). */
    if (window.FED13.battle1v1 && typeof window.FED13.battle1v1.isActive === 'function' && window.FED13.battle1v1.isActive()) {
      if (typeof window.FED13.battle1v1.handlePress === 'function') { window.FED13.battle1v1.handlePress(action); }
      return;
    }
    if (textBox.active && (action === 'confirm' || action === 'start')) {
      textAdvance();
      return;
    }
    if (delegatedScreen) {
      /* On-screen buttons forward to the module that owns the
       * screen. Real keyboard presses already reached that module
       * through its own listener, so they stop here as before. */
      if (!fromKeyboard) { forwardPressToDelegated(action); }
      return;
    }
    var s = screens[currentScreen];
    if (s && s.onPress) { s.onPress(action); }
  }

  function keyToAction(e) {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': return 'up';
      case 'ArrowDown': case 'KeyS': return 'down';
      case 'ArrowLeft': case 'KeyA': return 'left';
      case 'ArrowRight': case 'KeyD': return 'right';
      case 'Enter': case 'NumpadEnter': return 'confirm';
      case 'Escape': return 'cancel';
      case 'KeyX': return 'menu';
      case 'Space': return 'start';
      default: return null;
    }
  }

  function setupKeyboard() {
    document.addEventListener('keydown', function (e) {
      /* Synthetic keys replayed by forwardPressToDelegated for the
       * on-screen buttons are for the delegated module only. Ignore
       * them here, or press would re-enter and forward them twice. */
      if (syntheticForward) { return; }
      /* BUG B1: on the name entry screen, typed letters take priority
         over the D-pad mapping. KeyW, KeyA, KeyS and KeyD are letters
         here, not up, left, down and right, and KeyA is not confirm
         here. Arrows still move the letter grid cursor. Confirm stays
         available on this screen through Enter, KeyZ and the on-screen
         A button, and delete stays available through KeyB, Backspace,
         Escape and the on-screen B button. This branch runs only on
         the creation name step, so no other screen changes. */
      if (currentScreen === 'creation' && CREATION_STEPS[creation.step] === 'name' &&
          !e.ctrlKey && !e.metaKey && !e.altKey &&
          (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD') &&
          e.key && e.key.length === 1 && NAME_LETTERS.indexOf(e.key) >= 0) {
        e.preventDefault();
        var nameScreen = screens[currentScreen];
        if (nameScreen && nameScreen.onKey) { nameScreen.onKey(e); }
        return;
      }
      /* In overworld, A moves left and Enter talks. In menus and text,
         A also confirms. KeyZ is a second confirm key. */
      if (e.code === 'KeyZ') {
        e.preventDefault();
        press('confirm', true);
        return;
      }
      if (textBox.active && (e.code === 'KeyA' || e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        press('confirm', true);
        return;
      }
      if (e.code === 'KeyB') {
        e.preventDefault();
        press('cancel', true);
        return;
      }
      /* FIX BATCH (battle1v1 canvas): on the direct overworld path the
       * engine currentScreen stays overworld while a battle runs, and
       * there A means left. A must still confirm while a battle is
       * active, so the battle check joins the confirm branch. */
      if (e.code === 'KeyA' && (currentScreen !== 'overworld' || (window.FED13.battle1v1 && typeof window.FED13.battle1v1.isActive === 'function' && window.FED13.battle1v1.isActive())) && !textBox.active) {
        e.preventDefault();
        press('confirm', true);
        return;
      }
      var action = keyToAction(e);
      if (!action) {
        /* Letter typing for the name entry screen. */
        var s = screens[currentScreen];
        if (s && s.onKey) { s.onKey(e); }
        return;
      }
      if (action === 'up' || action === 'down' || action === 'left' || action === 'right' || action === 'start') {
        e.preventDefault();
      }
      press(action, true);
    });
  }

  /* ---------- Screen manager ---------- */
  var screens = {};
  /* BUILD PATCH: delegation to the dedicated modules. When a module is
   * present, its screen owns input and drawing for that screen, and the
   * engine loop skips its own duplicate screen. If a module failed to
   * load, the engine fallback screens below still run. */
  var delegatedScreen = null;
  var delegatedOverworldStarted = false;
  function setScreen(name, data) {
    if (!screens[name]) { name = 'title'; }
    if (delegatedScreen === 'overworld' && name !== 'overworld') {
      delegatedScreen = null;
      try { if (window.FED13.overworld && typeof window.FED13.overworld.stop === 'function') { window.FED13.overworld.stop(); } } catch (e) {}
      delegatedOverworldStarted = false;
    }
    if (name === 'overworld' && window.FED13 && window.FED13.overworld && typeof window.FED13.overworld.start === 'function') {
      currentScreen = 'overworld';
      screenData = data || null;
      delegatedScreen = 'overworld';
      try {
        if (!delegatedOverworldStarted) {
          window.FED13.overworld.init(topCanvas);
          delegatedOverworldStarted = true;
        }
        window.FED13.overworld.start();
      } catch (e) { delegatedScreen = null; delegatedOverworldStarted = false; }
      /* ROUND 2 BUG A, defense in depth: a story trigger fired from
       * inside overworld.start() (or from a map load inside it) hands
       * off to another screen, which stops the module overworld and
       * changes currentScreen. The outer call must not then overwrite
       * currentScreen back to 'overworld' and enter the engine
       * fallback overworld. If the screen moved during start(), leave
       * the new screen alone. Only a start() that threw, leaving
       * currentScreen still 'overworld', falls through to fallback. */
      if (currentScreen !== 'overworld') { return; }
      /* BANK RETURN: the overworld module only resets its own mode
       * to field when it was 'battle'. A bank screen opened from the
       * pause menu leaves it at 'menu' (or 'submenu'), so a plain
       * return would land back in the menu instead of the field.
       * Clear a stale pause-menu mode here, on the engine side of
       * the handoff. Dialogue mode is left alone: a story trigger
       * may have fired inside start(). */
      try {
        var ow = window.FED13.overworld;
        if (ow && ow.state && (ow.state.mode === 'menu' || ow.state.mode === 'submenu')) {
          ow.state.mode = 'field';
          ow.state.submenu = null;
          ow.state.dialogue = null;
        }
      } catch (e) {}
      if (delegatedScreen) { return; }
    }
    if (delegatedScreen && name !== 'overworld' && name !== 'battle1v1' && name !== 'grid') {
      /* COLD OPEN POLISH: leaving a delegated battle or grid screen
       * for an engine screen (title, intro, creation, menu). The
       * battle module already ended, so the engine loop must draw
       * again. Without this, the intro farewell after a cold open
       * battle would never draw, because the loop skips drawing
       * while delegatedScreen is set. */
      delegatedScreen = null;
    }
    currentScreen = name;
    screenData = data || null;
    var s = screens[name];
    if (s && s.enter) { s.enter(data); }
  }

  /* ---------- Shared menu drawing ---------- */
  function drawMenuList(ctx, title, items, selected, y0, showIndex, x0) {
    var tx = (typeof x0 === 'number') ? x0 : 10;
    drawText(ctx, title, tx, 10, '#fff', '12px monospace');
    for (var i = 0; i < items.length; i++) {
      var y = y0 + i * 14;
      if (y > H - 16) { break; }
      if (i === selected) {
        /* DS selected row: gold bar with a navy border and a dark
         * arrow, bold dark text. */
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(tx - 4, y - 1, W - (tx - 4) - 6, 13);
        ctx.strokeStyle = '#20242a';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx - 3.5, y - 0.5, W - (tx - 4) - 7, 12);
        drawText(ctx, '> ' + items[i], tx, y, '#101030', 'bold 10px monospace');
      } else {
        drawText(ctx, '  ' + items[i], tx, y, '#d8d8f0');
      }
    }
    if (showIndex) {
      drawText(ctx, String(selected + 1) + ' / ' + items.length, W - 52, H - 14, '#8888aa');
    }
  }
  function drawBottomHint(ctx, text) {
    /* Hint sits on its own dark strip so it reads over bright art
     * (floor tiles, gold counter) instead of washing out on it. */
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(0, H - 16, W, 16);
    drawText(ctx, text, 10, H - 14, '#c8c8e8');
  }
  /* V9-SYS: shared Are you sure? panel. Any screen guarding a
   * destructive or irreversible action draws this on the bottom
   * screen: a gold title, plain lines saying exactly what will
   * happen and what will be lost, then Yes and No. The caller passes
   * sel defaulted to 1 (No), so an accidental A press backs out
   * instead of destroying something. B or X also backs out. The
   * bank sell flow keeps its own two step confirms; this panel is
   * the same pattern for the other guarded actions, not a second
   * copy of the sell flow. */
  var CONFIRM_ITEMS = ['Yes', 'No'];
  function drawConfirmPanel(ctx, title, lines, sel) {
    clearScreen(ctx, '#0a0a1e');
    drawText(ctx, title, 10, 10, '#e8c838', '12px monospace');
    ctx.font = '10px monospace';
    var y = 30;
    for (var i = 0; i < lines.length; i++) {
      var sub = wrapLines(ctx, lines[i], W - 20);
      for (var j = 0; j < sub.length; j++) {
        drawText(ctx, sub[j], 10, y, '#fff');
        y += 13;
      }
    }
    drawMenuList(ctx, '', CONFIRM_ITEMS, sel, y + 6, false);
    drawBottomHint(ctx, 'Up/Down pick. A: confirm  B: no');
  }
  function drawTopBanner(ctx, title, sub) {
    clearScreen(ctx, '#0a0a1e');
    drawText(ctx, title, 10, 10, '#e8c838', fitBannerFont(ctx, title, W - 20, 14, 10));
    if (sub) { drawText(ctx, sub, 10, 30, '#c8c8e8', fitBannerFont(ctx, sub, W - 20, 10, 8)); }
  }
  /* DIALOGUE-FIT v9: banner text used to draw unwrapped at a fixed size,
   * so a long subtitle ran off the right edge of the screen ("Saltquay
   * guild hall. First card on the bo"). Shrink it to fit in one line
   * instead; the layout has no room for a second subtitle line.
   * Returns a font string; leaves ctx.font at the fitted size. */
  function fitBannerFont(ctx, text, maxW, startPx, minPx) {
    var px = startPx;
    while (px > minPx) {
      ctx.font = px + 'px monospace';
      if (ctx.measureText(text).width <= maxW) { break; }
      px--;
    }
    return px + 'px monospace';
  }

  /* ---------- TITLE SCREEN ---------- */
  var titleSel = 0;
  var titleMode = 'menu'; /* menu, options, or confirmNewGame */
  var optionSel = 0;
  /* V9-SYS: New Game confirm selection. 1 is No, the default, so an
   * accidental A press keeps the saved game. */
  var titleConfirmSel = 1;
  var options = { textSpeed: 'slow', sound: true };

  function titleItems() {
    var items = ['New Game', 'Options'];
    if (hasSave()) { items.splice(1, 0, 'Continue'); }
    return items;
  }
  /* Title stars: fixed set, drifted by time. Deterministic positions so
   * the drift never jumps between frames. */
  var TITLE_STARS = [];
  (function () {
    for (var i = 0; i < 28; i++) {
      TITLE_STARS.push({
        x: (i * 53 + 11) % W,
        y: (i * 37 + 7) % H,
        s: (i % 3 === 0) ? 2 : 1,
        v: 2 + (i % 5),          /* drift px per second */
        ph: (i % 7) * 0.9        /* twinkle phase */
      });
    }
  })();
  function drawTitleStars(ctx, t, speedMul, alphaMul) {
    for (var i = 0; i < TITLE_STARS.length; i++) {
      var st = TITLE_STARS[i];
      var x = (st.x + t / 1000 * st.v * speedMul) % W;
      var tw = 0.5 + 0.5 * Math.sin(t / 700 + st.ph);
      ctx.fillStyle = 'rgba(200,220,255,' + ((0.25 + 0.45 * tw) * alphaMul) + ')';
      ctx.fillRect(Math.floor(x), st.y, st.s, st.s);
    }
  }
  /* Cover art is a full 512x384 scene, not a cutout. Draw it full bleed
   * with a slow pan, plus a gentle vertical float. Returns false when
   * the file is missing so the caller can fall back. */
  function drawCoverOrNull(ctx, t) {
    var img = loadImage('assets/ov3_title_bg.png');
    if (!img.complete || img.naturalWidth === 0 || img._missing) { return false; }
    var srcW = 448, srcH = 336; /* 7/8 of the art, leaves room to pan */
    var srcX = 32 + 24 * Math.sin(t / 9000);
    var srcY = 24 + 8 * Math.sin(t / 12000 + 1);
    var floatY = Math.round(2 * Math.sin(t / 1600));
    /* Dest is oversized by 8px so the float never shows a gap at an edge. */
    ctx.drawImage(img, srcX, srcY, srcW, srcH, -4, -4 + floatY, W + 8, H + 8);
    return true;
  }
  function drawTitleTop(ctx, t) {
    t = t || 0;
    clearScreen(ctx, '#05050f');
    var pulse = 0.5 + 0.5 * Math.sin(t / 1100); /* slow logo glow pulse */
    /* Cover figure: the art file full bleed, else a glowing hooded figure. */
    var ok = drawCoverOrNull(ctx, t);
    if (!ok) {
      /* Dark void with a slow blue glow behind the cover figure. */
      var g = ctx.createRadialGradient(128, 92, 8, 128, 92, 110);
      g.addColorStop(0, 'rgba(80,120,255,' + (0.35 + 0.3 * pulse) + ')');
      g.addColorStop(0.6, 'rgba(40,40,120,0.25)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      drawTitleStars(ctx, t, 1, 1);
      /* Gentle float on the hooded figure. */
      var floatY = Math.round(3 * Math.sin(t / 1400));
      ctx.fillStyle = 'rgba(180,200,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(128, 42 + floatY);
      ctx.lineTo(156, 96 + floatY);
      ctx.lineTo(148, 150 + floatY);
      ctx.lineTo(108, 150 + floatY);
      ctx.lineTo(100, 96 + floatY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#05050f';
      ctx.fillRect(118, 58 + floatY, 20, 14);
      /* Red eyes. */
      ctx.fillStyle = '#ff3030';
      ctx.fillRect(120, 63 + floatY, 5, 3);
      ctx.fillRect(131, 63 + floatY, 5, 3);
      /* Glowing jewel on the figure. */
      ctx.fillStyle = 'rgba(120,200,255,' + (0.6 + 0.4 * pulse) + ')';
      ctx.beginPath();
      ctx.arc(128, 108 + floatY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    /* Bottom shade so the logo stays readable over the art. */
    var shade = ctx.createLinearGradient(0, 110, 0, H);
    shade.addColorStop(0, 'rgba(5,5,15,0)');
    shade.addColorStop(1, 'rgba(5,5,15,0.85)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 110, W, H - 110);
    /* Game logo art over the y108-192 zone, 224x84 keeps the art's
     * own 512x192 aspect. Falls back to the canvas FED-13 text. */
    var logoOk = drawImageOrNull(ctx, 'assets/ov3_title_logo.png', 16, 108, 224, 84);
    if (!logoOk) {
      /* Gold halo behind the logo, breathing with the same pulse. */
      var halo = ctx.createRadialGradient(128, 158, 4, 128, 158, 90);
      halo.addColorStop(0, 'rgba(232,200,56,' + (0.10 + 0.12 * pulse) + ')');
      halo.addColorStop(1, 'rgba(232,200,56,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(38, 118, 180, 74);
      /* Game logo with a slow glow pulse. */
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 34px monospace';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#101030';
      ctx.strokeText('FED-13', 128, 168);
      ctx.shadowColor = '#e8c838';
      ctx.shadowBlur = 6 + 12 * pulse;
      ctx.fillStyle = '#f8f0c8';
      ctx.fillText('FED-13', 128, 168);
      ctx.restore();
    }
    drawTitleFrame(ctx);
    /* Tagline, always drawn under the FED-13 logo: it used to live
     * only in the no-logo fallback above, so the published title
     * with the logo art showed no tagline at all. It sits on its own
     * dark tab over the frame bottom ornament band (drawn after the
     * frame), so no frame ornament crosses a letter. */
    /* Tagline on a gold tab over the frame bottom ornament band,
     * dark text on gold so it reads as a DS title ribbon. */
    ctx.fillStyle = '#e8c838';
    ctx.fillRect(44, 178, 168, 14);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#101030';
    ctx.fillText('A MONSTER TRAINER TALE', 128, 180);
    ctx.restore();
    drawTextBoxTop(ctx);
  }
  function drawTitleBottom(ctx, t) {
    t = t || 0;
    /* DS title menu: deep navy gradient, not flat dark blue. */
    var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#141d42');
    bgGrad.addColorStop(0.6, '#0a0a1e');
    bgGrad.addColorStop(1, '#05050f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    drawTitleStars(ctx, t, 0.5, 0.5); /* slow faint drift behind the menu */
    if (titleMode === 'options') {
      drawText(ctx, 'OPTIONS', 10, 10, '#e8c838', '12px monospace');
      var opts = [
        'Text speed: ' + options.textSpeed,
        'Sound: ' + (options.sound ? 'ON' : 'OFF'),
        'Back'
      ];
      for (var i = 0; i < opts.length; i++) {
        var y = 40 + i * 18;
        if (i === optionSel) {
          ctx.fillStyle = '#e8c838';
          ctx.fillRect(6, y - 2, W - 12, 16);
          drawText(ctx, '> ' + opts[i], 10, y, '#101030');
        } else {
          drawText(ctx, '  ' + opts[i], 10, y, '#fff');
        }
      }
      drawBottomHint(ctx, 'A: change  B: back');
      drawTitleFrame(ctx);
      return;
    }
    /* V9-SYS: the New Game confirm replaces the title menu on the
     * bottom screen. It names the saved trainer and what starting
     * over costs, and defaults to No. */
    if (titleMode === 'confirmNewGame') {
      var savedName = (state && state.trainer && state.trainer.name) ? state.trainer.name : 'your trainer';
      var savedLv = (state && state.trainer && typeof state.trainer.level === 'number') ? state.trainer.level : 1;
      /* The panel draws last and clears the screen, so the title
       * frame never covers its title or first line. Drawing the
       * frame after the panel hid both behind its ornaments. */
      drawConfirmPanel(ctx, 'ARE YOU SURE?', [
        'A saved game exists: ' + savedName + ', Lv ' + savedLv + '.',
        'A new game replaces it. The saved trainer, party,',
        'and progress will be lost when the new game saves.'
      ], titleConfirmSel);
      return;
    }
    /* PRESS START: smooth fade in and out instead of a hard on/off blink.
     * The 256x64 art is drawn at 104x26 at y 24. The title frame art
     * covers the top 22 px of the screen, so the old y 8 strip had its
     * glyphs half hidden behind the frame, and the menu list moves to
     * y 52 so the strip ends clear of it. Same fade alpha applies. */
    var alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t / 500));
    ctx.save();
    ctx.globalAlpha = alpha;
    if (!drawImageOrNull(ctx, 'assets/ov3_press_start.png', 76, 24, 104, 26)) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#e8c838';
      ctx.shadowBlur = 8;
      ctx.fillText('PRESS START', 128, 32);
    }
    ctx.restore();
    ctx.textAlign = 'left';
    /* DS menu panel: dark navy field with a gold border behind the
     * menu list, so the title menu reads as a framed DS menu, not
     * bare text on stars. */
    ctx.fillStyle = '#0b0b20';
    ctx.fillRect(6, 50, W - 12, 52);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 1;
    ctx.strokeRect(6.5, 50.5, W - 13, 51);
    drawMenuList(ctx, '', titleItems(), titleSel, 52, false);
    /* Tagline inset to x 32: the frame art covers the left 20 px,
     * and its bottom corner ornament reaches further right still,
     * so the old x 10 start lost the first characters behind it. */
    drawText(ctx, 'King Malachar Duskspire', 32, 150, '#c8c8e8');
    drawText(ctx, 'watches from the Crownspire.', 32, 162, '#c8c8e8');
    drawText(ctx, '(c) 2026 FED-13', 32, 178, '#555577');
    drawTitleFrame(ctx);
    drawTextBox(ctx);
  }

  screens.title = {
    enter: function () { titleSel = 0; titleMode = 'menu'; },
    onPress: function (a) {
      /* V9-SYS: New Game with a save on file asks first. Yes starts
       * the new game; No and B go back to the title menu with the
       * save untouched. */
      if (titleMode === 'confirmNewGame') {
        if (a === 'up' || a === 'down') { titleConfirmSel = (titleConfirmSel + 1) % 2; }
        else if (a === 'cancel') { titleMode = 'menu'; }
        else if (a === 'confirm' || a === 'start') {
          if (titleConfirmSel === 0) { startNewGame(); }
          else { titleMode = 'menu'; }
        }
        return;
      }
      if (titleMode === 'options') {
        if (a === 'up') { optionSel = (optionSel + 2) % 3; }
        else if (a === 'down') { optionSel = (optionSel + 1) % 3; }
        else if (a === 'confirm' || a === 'start') {
          if (optionSel === 0) {
            options.textSpeed = options.textSpeed === 'slow' ? 'normal' : options.textSpeed === 'normal' ? 'fast' : 'slow';
            textBox.speedSetting = options.textSpeed;
          } else if (optionSel === 1) { options.sound = !options.sound; }
          else { titleMode = 'menu'; }
        }
        else if (a === 'cancel') { titleMode = 'menu'; }
        return;
      }
      var items = titleItems();
      if (a === 'up') { titleSel = (titleSel + items.length - 1) % items.length; }
      else if (a === 'down') { titleSel = (titleSel + 1) % items.length; }
      else if (a === 'confirm' || a === 'start') {
        var pick = items[titleSel];
        /* V9-SYS: New Game over an existing save asks first. The old
         * save is only replaced when the new trainer finishes
         * creation and saves, but the player must know that is what
         * starting a new game means before the intro plays. */
        if (pick === 'New Game') {
          if (hasSave()) { titleMode = 'confirmNewGame'; titleConfirmSel = 1; }
          else { startNewGame(); }
        }
        else if (pick === 'Continue') {
          /* ROUND 2 BUG C: Continue in the same page session is a
           * fresh entry, so the overworld loads the save instead of
           * resuming the old map and position. */
          try { if (window.FED13.overworld && typeof window.FED13.overworld.clearResume === 'function') { window.FED13.overworld.clearResume(); } } catch (e) {}
          if (loadGame()) { setScreen('overworld'); }
        }
        else if (pick === 'Options') { titleMode = 'options'; optionSel = 0; }
      }
    },
    update: function () {},
    draw: function (t) { drawTitleTop(topCtx, t); drawTitleBottom(bottomCtx, t); }
  };

  /* BUILD PATCH: mirror the engine trainer shape into state.player, the
   * shape overworld.js and story.js read. Called whenever state is
   * replaced or creation finishes. */
  function syncPlayerProfile() {
    if (!state) { return; }
    var t = state.trainer || {};
    state.player = state.player || {};
    state.player.name = t.name || state.player.name || '';
    state.player.gender = (t.sex === 'girl' || t.sex === 'boy') ? t.sex : (state.player.gender || 'boy');
    state.player.appearance = state.player.gender;
    state.player.race = (t.race || 'Solar').toLowerCase();
    state.player.bloodline = t.bloodline || state.player.bloodline || '';
    state.player.guideForm = t.guideForm || state.player.guideForm || '';
    state.player.guideGrimoire = t.guideGrimoire || state.player.guideGrimoire || '';
    state.player.starterBloodline = state.player.bloodline;
    if (state.party && state.party[0] && state.party[0].name) { state.player.starterWildlife = state.party[0].name; }
    state.flags = state.flags || {};
  }
  function startNewGame() {
    state = freshState();
    window.FED13.state = state;
    syncPlayerProfile();
    /* ROUND 2 BUG C: a New Game in the same page session is a fresh
     * entry, not a resume of the old overworld map and position. */
    try { if (window.FED13.overworld && typeof window.FED13.overworld.resetForNewGame === 'function') { window.FED13.overworld.resetForNewGame(); } } catch (e) {}
    setScreen('intro');
  }

  /* ---------- INTRO: cold open, unbeatable mission ---------- */
  /* COLD OPEN POLISH (adv-coldopen): the cold open plays as staged
   * beats, DS style. Beat 0 is the Realm Map banner. Beat 1 is Maren
   * walking in on her overworld sprite, ow_maren.png, sliding in from
   * the right. Beat 2 is the close up: her battle art,
   * b_maren_front.png, large on the top screen, with the defender
   * answer and the warning that this mission cannot be won. Beat 3
   * is the loss: white flash, slow fade to black, her farewell lines
   * with her portrait. Beat 4 is the farewell: the sky closes, then
   * a ONE YEAR LATER card, then creation. If a playable cold open
   * battle is wired in (FED13.startColdOpenBattle, worker C1), beat 2
   * hands off to it after the warning, and the farewell plays when
   * the battle ends with a scripted loss. Without it, the intro stays
   * text only, as in v1. All lines match story.js cold_open_defense
   * and cold_open_farewell. Pronouns follow the story file: he, him.
   */
  var COLD_OPEN = {
    banner: 'assets/map_realm.png',
    entranceSprite: 'assets/ow_maren.png',
    battleSprite: 'assets/b_maren_front.png',
    portrait: 'assets/p_maren.png',
    lossTurn: 3
  };
  var introStage = 0;        /* 0 banner, 1 entrance, 2 close up, 3 loss, 4 farewell, 5 year card */
  var introMarenX = 260;     /* entrance slide: starts off the right edge */
  var introFlash = 0;        /* white flash overlay, 0 to 1, decays fast */
  var introFade = 0;         /* black fade overlay, 0 to 1, moves slow */
  var introFadeTarget = 0;

  function introBeat(lines, portrait, next) {
    showText(lines, portrait, next);
  }
  function introStartBeat0() {
    introStage = 0;
    introMarenX = 260;
    introFlash = 0;
    introFade = 0;
    introFadeTarget = 0;
    introBeat([
      'One of the 13 has come to Earth.',
      'Mankind, Bondkin, and Wildlife rise together to defend their land.'
    ], null, introStartBeat1);
  }
  function introStartBeat1() {
    introStage = 1;
    introBeat([
      'So this is Earth. Small skies. Loud little defenders. I had heard so much more.',
      'Oh, good. You give orders. That makes this fun. Come at me, all of you.'
    ], COLD_OPEN.portrait, introStartBeat2);
  }
  function introStartBeat2() {
    introStage = 2;
    introBeat([
      'Hold the line! Mankind in front! Bondkin, guard the flanks! Wildlife, watch the sky!',
      'This mission cannot be won. It is not meant to be won.'
    ], null, function () {
      /* Hand off to the playable battle when one is wired in. */
      if (window.FED13 && typeof window.FED13.startColdOpenBattle === 'function') {
        try {
          window.FED13.startColdOpenBattle(function () { introStartFarewell(); });
          return;
        } catch (e) { /* fall through to the text only loss */ }
      }
      introStartBeat3();
    });
  }
  function introStartBeat3() {
    introStage = 3;
    introFlash = 1;
    introFadeTarget = 0;
    introBeat([
      'Down. All of you, down. I did not even have to try.',
      'I had fun, little defenders. Real fun. I will return again in one year.',
      'But this time I will not give you a second chance at defeating me. Train. Pray. It will not matter.'
    ], COLD_OPEN.portrait, introStartFarewell);
  }
  function introStartFarewell() {
    introStage = 4;
    introFadeTarget = 1;
    setFlag('cold_open_seen');
    introBeat([
      'Maren Saltwright is gone. The sky closes behind him like a door.',
      'One year later.'
    ], null, function () {
      introStage = 5;
    });
  }
  function introDrawOwFrame(ctx, path, col, row, x, y, w, h) {
    /* Overworld sheets are 4x4 frames of 32x32. Draw one frame only,
     * so the entrance shows one Maren, not the whole sheet. */
    var img = loadImage(path);
    if (!img.complete || img.naturalWidth === 0 || img._missing) { return false; }
    ctx.drawImage(img, col * 32, row * 32, 32, 32, x, y, w, h);
    return true;
  }
  function introUpdate() {
    textUpdate();
    if (introStage === 1 && introMarenX > 168) { introMarenX -= 2; }
    if (introFlash > 0) { introFlash = Math.max(0, introFlash - 0.02); }
    if (introFade < introFadeTarget) { introFade = Math.min(introFadeTarget, introFade + 0.01); }
    if (introFade > introFadeTarget) { introFade = Math.max(introFadeTarget, introFade - 0.01); }
  }
  function introDraw() {
    if (introStage === 5) {
      clearScreen(topCtx, '#000');
      topCtx.fillStyle = '#e8c838';
      topCtx.font = 'bold 16px monospace';
      topCtx.textAlign = 'center';
      topCtx.fillText('ONE YEAR LATER', 128, 88);
      topCtx.textAlign = 'left';
      topCtx.font = '10px monospace';
      topCtx.fillStyle = '#8888aa';
      topCtx.fillText('One year of waiting. One year of training.', 18, 112);
      clearScreen(bottomCtx, '#000');
      drawText(bottomCtx, 'Press A to begin creation.', 10, 90, '#e8c838');
      return;
    }
    drawTopBanner(topCtx, 'THE COLD OPEN', 'Realm Map. The day the darkness came.');
    drawImageOrNull(topCtx, COLD_OPEN.banner, 16, 52, 224, 110);
    if (introStage >= 1) {
      /* Maren entrance: overworld sprite slides in from the right. */
      introDrawOwFrame(topCtx, COLD_OPEN.entranceSprite, 0, 0, introMarenX, 96, 48, 48);
    }
    if (introStage >= 2) {
      /* Close up: her battle art, large, facing the defense line. */
      drawImageOrNull(topCtx, COLD_OPEN.battleSprite, 88, 56, 80, 80);
    }
    if (introFlash > 0) {
      topCtx.fillStyle = 'rgba(255,255,255,' + introFlash.toFixed(2) + ')';
      topCtx.fillRect(0, 0, W, H);
    }
    if (introFade > 0) {
      topCtx.fillStyle = 'rgba(0,0,0,' + introFade.toFixed(2) + ')';
      topCtx.fillRect(0, 0, W, H);
    }
    clearScreen(bottomCtx, '#0a0a1e');
    drawTextBox(bottomCtx);
  }
  screens.intro = {
    enter: function (data) {
      if (data && data.farewell) { introStartFarewell(); return; }
      introStartBeat0();
    },
    onPress: function (a) {
      if (introStage === 5 && (a === 'confirm' || a === 'start')) {
        setFlag('cold_open_farewell_seen');
        setScreen('creation');
      }
    },
    update: function () { introUpdate(); },
    draw: function () { introDraw(); }
  };

  /* ---------- CUTSCENE: line by line, then onDone ---------- */
  /* Optional 6th playCutscene arg staging: { beats, lineBeats }.
   * beats is a staging beat list (see FED13.story.ghoulEncounterStaging)
   * and lineBeats maps each cutscene line index to a beat index, so the
   * top screen shows the staged frame for the line being read. When no
   * staging is passed, the cutscene draws the banner and map as before. */
  var cutsceneCb = null;
  screens.cutscene = {
    enter: function (data) {
      cutsceneCb = (data && data.onDone) || null;
      showText((data && data.lines) || ['...'], (data && data.portrait) || null, function () {
        var cb = cutsceneCb;
        cutsceneCb = null;
        clearStaging();
        if (cb) { cb(); }
      });
      screens.cutscene._map = (data && data.map) || null;
      screens.cutscene._title = (data && data.title) || 'CUTSCENE';
      if (data && data.staging && data.staging.beats) {
        stagingState = {
          beats: data.staging.beats,
          beat: 0,
          lineBeats: data.staging.lineBeats || null
        };
      } else {
        clearStaging();
      }
    },
    onPress: function () {},
    update: function () { textUpdate(); },
    draw: function (t) {
      var beat = currentStagingBeat();
      if (beat) {
        /* Race matched staging art: the cutscene was passed a map,
         * and the staging beat drew its own bg over it, so the map
         * never showed. The old code overrode the beat background
         * only when the passed map was map_dreamrest.png, so the
         * Solar school cutscene still showed mountain and grass
         * art. Any passed map now overrides the beat background:
         * Solar shows its map_gatehollow.png art, Polar shows its
         * map_dreamrest.png art, with the beat sprites, FX and
         * title overlaid on top. */
        if (screens.cutscene._map) {
          var raceBeat = {};
          for (var bk in beat) { if (beat.hasOwnProperty(bk)) { raceBeat[bk] = beat[bk]; } }
          raceBeat.background = screens.cutscene._map;
          drawStagingFrame(topCtx, raceBeat, t);
        } else {
          drawStagingFrame(topCtx, beat, t);
        }
      } else {
        drawTopBanner(topCtx, screens.cutscene._title || 'CUTSCENE', '');
        if (screens.cutscene._map) { drawImageOrNull(topCtx, screens.cutscene._map, 16, 52, 224, 110); }
      }
      clearScreen(bottomCtx, '#0a0a1e');
      drawTextBox(bottomCtx, true);
    }
  };
  function playCutscene(title, lines, portrait, map, onDone, staging) {
    setScreen('cutscene', { title: title, lines: lines, portrait: portrait, map: map, onDone: onDone, staging: staging || null });
  }

  /* ADV-ROAD: the road down presentation, engine side. Each cinematic
   * chains two cutscene steps over the shipped map art, DS style:
   * full screen map on top, text box on the bottom, A advances.
   * gateSeal: map_gatehollow.png for a Gatehollow departure (Solar),
   * map_dreamrest.png for a Dreamrest departure (Polar), then
   * map_road.png. playRoadDownCinematic picks the departure art and
   * caption from the player's race and location at play time.
   * saltquayArrival: map_saltquay.png, then bg_harbor.png.
   * The story module holds the same beats as data; the overworld
   * drives the in-play seal and arrival, this player is the
   * engine-side route for the same beats. */
  var ROAD_DOWN_CINEMATIC = {
    gateSeal: {
      title: 'The Gatehollow Gate Seals',
      steps: [
        {
          map: 'assets/map_gatehollow.png',
          lines: [
            'You step through the Gatehollow Gate, the old land gate between the 14th world and the Realm Map.',
            'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.'
          ]
        },
        {
          map: 'assets/map_road.png',
          lines: [
            'The gate seals. It stays sealed until after the Hall of Fame. There is no way back now, only the road down.',
            'One bag. One permit. One small Wildlife in a sling. The pilgrim road runs south to Cragfall, then to Saltquay.'
          ]
        }
      ]
    },
    saltquayArrival: {
      title: 'Saltquay Arrival',
      steps: [
        {
          map: 'assets/map_saltquay.png',
          lines: [
            'Saltquay harbor gate, at dawn. Mankind level 5.',
            'Gulls, salt air, and the harbor spread out below the gate. You made it.'
          ]
        },
        {
          map: 'assets/bg_harbor.png',
          lines: [
            'Your arc Bondkin waits in this town. First, the guild hall. The board is already posted.',
            'The guild job board holds Main Mission 1: Maren Saltwright, 1,000,000 Cr.'
          ]
        }
      ]
    }
  };
  function playRoadDownCinematic(kind, onDone) {
    var def = ROAD_DOWN_CINEMATIC[kind];
    if (!def) {
      if (typeof onDone === 'function') { onDone(false); }
      return false;
    }
    if (kind === 'gateSeal') {
      /* A Dreamrest departure (Polar) seals the Dreamrest Gate over
       * Dreamrest art; a Gatehollow departure (Solar) keeps the
       * Gatehollow art and captions in ROAD_DOWN_CINEMATIC. The
       * second step (the road down) is the same for both. */
      var polarDeparture = (state.trainer && state.trainer.race === 'Polar') || state.location === 'Dreamrest';
      if (polarDeparture) {
        def = {
          title: 'The Dreamrest Gate Seals',
          steps: [
            {
              map: 'assets/map_dreamrest.png',
              lines: [
                'You step through the Dreamrest Gate, the old land gate between the 14th world and the Realm Map.',
                'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.'
              ]
            },
            ROAD_DOWN_CINEMATIC.gateSeal.steps[1]
          ]
        };
      }
    }
    var step = 0;
    (function nextStep() {
      if (step >= def.steps.length) {
        if (typeof onDone === 'function') { onDone(true); }
        return;
      }
      var s = def.steps[step];
      step++;
      playCutscene(def.title, s.lines, null, s.map, nextStep);
    })();
    return true;
  }

  /* ---------- STORY SCENE PLAYER: grad arc and other story.js scenes ---
   * The story module owns the dialogue. This screen plays one story scene
   * at a time: lines first, one text box each with its static portrait,
   * then the scene choice if it has one, then the next scene from
   * FED13.story.resolveNext. A scene with examQuestion shows Clerk Ivo
   * feedback after the answer, then moves on. A router scene jumps at
   * once, after its lines. A scene with gradArcEnd hands off to the
   * overworld instead of following next, so the road down stays with
   * the overworld story triggers (gateSeals). If the story module or
   * the scene is missing, this screen falls back to the overworld so
   * the game never stalls on a story beat.
   * Wired in from the egg pick: after THE HATCH cutscene, the game
   * starts grad_hatch here instead of dropping straight to overworld.
   * Before this patch the grad arc scenes existed as data only and
   * were never played. */
  var storyPlay = null;
  /* V9-SYS: egg pick confirm. The picked egg id waits here while the
   * player answers Yes or No. Selection defaults to No, so an
   * accidental A press leaves the pick unmade and the choice list
   * still open. */
  var storyEggConfirmSel = 1;
  var storyEggPending = null;
  /* FIX BATCH B1: single story battle consumer. The engine story
   * runner calls it from storyLinesDone; the overworld trigger chain
   * hands its scenes to this same story screen, so both paths run
   * battles through here and nowhere else. Set while a chain battle
   * is running so the battle's own return to the overworld is
   * suppressed and the chain owns the next screen. */
  var storyChainBattleActive = false;
  function storyBattleFoe(b) {
    var kind = (b && b.kind) || '';
    if (kind === 'scripted_loss') {
      return { name: 'Maren', displayName: (b && b.opponent) || 'Maren Saltwright', trainerName: (b && b.opponent) || 'Maren Saltwright', level: 50, hp: 999, maxHp: 999, isWild: false, scriptedLoss: { turn: 3 } };
    }
    /* Trial Battle 1 (kind 'trial', mm1_accept): NO LONGER ROUTED
     * HERE. The trial runs on the grid now: dispatchStoryBattle
     * sends kind 'trial' to startGridBattle with the trial roster
     * (grid.js makeTrialBattleRoster), per the design: a team battle
     * in the FFTA style with the Wildlife and the arc Bondkin beside
     * the player. This return stays only so a stale scene still
     * yields a foe instead of crashing. Never the cold open foe
     * above: that one is level 50, HP 999, loss on turn 3. */
    if (kind === 'trial') {
      return { name: 'Maren', displayName: (b && b.opponent) || 'Maren Saltwright', trainerName: (b && b.opponent) || 'Maren Saltwright', level: 5, isWild: false };
    }
    return { name: 'Ghoul', level: 5, hp: 20, maxHp: 20, isWild: true };
  }
  function dispatchStoryBattle(scene, done) {
    var list = scene.battles ? scene.battles.slice() : (scene.battle ? [scene.battle] : []);
    function runNext(i) {
      if (i >= list.length) { done(true); return; }
      var b = list[i] || {};
      var kind = b.kind || '';
      if (kind === 'grid') {
        storyChainBattleActive = true;
        startGridBattle(null, function (result) {
          if (result && result.victory) { runNext(i + 1); } else { done(false); }
        });
        return;
      }
      if (kind === 'trial') {
        /* TRIAL BATTLE 1 FIX: the design says Trial Battle 1 is a team
         * battle in the FFTA style (new-game.md, Saltquay: Trial
         * Battle 1) fought with the hatched Wildlife and the arc
         * Bondkin beside the player (complete story, Part 6), so it
         * runs on the grid, not as a 1v1. The 1v1 route below stays
         * for road battles and the scripted loss cold open. */
        storyChainBattleActive = true;
        startGridBattle(null, function (result) {
          var won = !!(result && result.victory);
          if (won) {
            /* Trial Battle 1 pays the Main Mission 1 bounty on the win:
             * the one reward allowed to land the wallet at 1,000,000 Cr. */
            if (b.rewardCr) { addCr(b.rewardCr, true); }
            runNext(i + 1);
          } else { done(false); }
        }, { trialBattle: true, map: 'harbor' });
        return;
      }
      if (kind === '1v1' || kind === 'wildlife_1v1' || kind === 'scripted_loss') {
        startBattle1v1(storyBattleFoe(b), function (result) {
          var won = !!(result && (result.outcome === 'win' || result.outcome === 'caught' || result.scriptedLoss));
          if (won) {
            runNext(i + 1);
          } else { done(false); }
        }, { noOverworldReturn: true });
        return;
      }
      /* Unknown kinds are skipped gracefully so the chain never
       * stalls on a battle block it does not know. */
      runNext(i + 1);
    }
    runNext(0);
  }
  function storyStateForEngine() {
    state.flags = state.flags || {};
    state.appearance = state.trainer.sex || 'boy';
    state.race = (state.trainer.race || 'Solar').toLowerCase();
    state.starterBloodline = (state.trainer.bloodline || 'Elf').toLowerCase();
    return state;
  }
  function startStoryScene(sceneId) {
    if (!window.FED13 || !window.FED13.story || typeof window.FED13.story.getScene !== 'function') {
      setScreen('overworld');
      return;
    }
    if (!window.FED13.story.getScene(sceneId)) {
      setScreen('overworld');
      return;
    }
    setScreen('storyScene', { sceneId: sceneId });
  }
  function storyAdvance() {
    if (!storyPlay || !storyPlay.scene) {
      saveGame();
      setScreen('overworld');
      return;
    }
    var scene = storyPlay.scene;
    if (scene.gradArcEnd) {
      /* FIX BATCH B2: the grad arc used to drop scene.next here, so the
       * road down was never reached through the story runner. Record
       * the pending road down before saving; the overworld fires the
       * gateSeals trigger from gatehollow when this flag is set, and
       * the gatehollow south exit fires it on foot as well. */
      state.flags = state.flags || {};
      state.flags.roadDownPending = true;
      saveGame();
      setScreen('overworld');
      return;
    }
    var next = null;
    try {
      next = window.FED13.story.resolveNext(scene, storyStateForEngine());
    } catch (e) { next = null; }
    if (!next) {
      saveGame();
      setScreen('overworld');
      return;
    }
    startStoryScene(next);
  }
  function storyLinesDone() {
    if (!storyPlay || !storyPlay.scene) {
      storyAdvance();
      return;
    }
    var scene = storyPlay.scene;
    if (scene.router && typeof scene.routeTo === 'function') {
      var routed = null;
      try { routed = scene.routeTo(storyStateForEngine()); } catch (e) { routed = null; }
      if (routed && routed !== scene.id) {
        startStoryScene(routed);
        return;
      }
      storyAdvance();
      return;
    }
    /* FIX BATCH B1/B3: a scene with a battle field fights it here,
     * through the one consumer above. Victory continues the chain at
     * the scene's next; defeat ends the chain at the overworld, except
     * for the first grid battle, which retries (see below). A scene
     * with a cinematic or a walk carries no battle, so it falls
     * through to the choice or advance below: the cinematic and walk
     * beats are skipped gracefully in this screen, and the chain
     * never stalls on them. */
    if (scene.battle || scene.battles) {
      storyPlay.phase = 'battle';
      dispatchStoryBattle(scene, function (won) {
        if (won) { storyAdvance(); return; }
        /* FIRST GRID DEFEAT RETRY: losing saltquay_first_grid_<bloodline>
         * used to strand the chain at the overworld, because the gate
         * was already sealed and the Saltquay arrival flag was already
         * set, so neither trigger re-fired. Send the player back to
         * the arc meeting scene for this bloodline, which leads to the
         * first grid battle again. Reset the arc flags the grid
         * callback set on defeat, so the retry is a clean first
         * attempt and the asking scene hook does not treat the loss
         * as a declined join. The gate and arrival flags are left
         * set: the retry re-enters directly through startStoryScene,
         * not through those triggers, so they do not block it. Other
         * battle defeats still end the chain at the overworld. */
        if (scene.id && String(scene.id).indexOf('saltquay_first_grid_') === 0) {
          var retryBloodline = String(scene.bloodline || storyStateForEngine().starterBloodline || 'elf').toLowerCase();
          state.flags = state.flags || {};
          state.flags.arcBondkinAsked = false;
          state.flags.arcBondkinJoined = false;
          saveGame();
          startStoryScene('saltquay_arc_meeting_' + retryBloodline);
          return;
        }
        saveGame(); setScreen('overworld');
      });
      return;
    }
    if (scene.choice) {
      storyPlay.phase = 'choice';
      storyPlay.choiceSel = 0;
      return;
    }
    storyAdvance();
  }
  function storyPlayLines(sceneId) {
    var story = window.FED13.story;
    /* Pass the race aware state so a race variant scene (road_down_gate
     * for a Polar player) draws with its Dreamrest title, location and
     * background instead of the Solar Gatehollow ones. */
    var scene = story.getScene(sceneId, storyStateForEngine());
    storyPlay.scene = scene;
    storyPlay.phase = 'lines';
    storyPlay.choiceSel = 0;
    var total = 0;
    var shown = 0;
    var res = story.playScene(sceneId, storyStateForEngine(), function (ln, next, sc) {
      /* V9-SYS: staged scenes pick their beat frame from the line,
       * the same rule FED13.engine.showDialogue uses. The story
       * runner passes its own display here, so showDialogue never
       * runs for story scenes and the staging state would stay
       * empty forever: the celebration sparkle and the Ghoul beats
       * would never draw. Set or clear the staging per line. */
      if (sc && sc.staging && sc.staging.beats && typeof ln.beat === 'number') {
        setStaging(sc.staging.beats, ln.beat);
      } else {
        clearStaging();
      }
      shown++;
      var portrait = (ln && ln.portrait) || null;
      var who = (ln && ln.speakerName) ? ln.speakerName + ': ' : '';
      var text = who + ((ln && ln.text) || '');
      showText([text], portrait, function () {
        if (total > 0 && shown >= total) {
          storyLinesDone();
        } else if (typeof next === 'function') {
          next();
        } else {
          storyLinesDone();
        }
      }, (ln && ln.speakerName) || null);
    });
    total = (res && res.lines) ? res.lines.length : 0;
    if (total === 0) {
      storyLinesDone();
    }
  }
  /* V9-ART: egg pick preview, top screen during the egg_choice
   * choice phase. All 3 eggs large in a row with name and type under
   * each, the selected one in a gold frame, and a preview panel below
   * showing the selected egg's hatched Wildlife FRONT sprite, its
   * name, Codex number, type, and one-line hatch hint. Nothing here
   * shows a back sprite: the preview faces the player. */
  function drawEggPickPreviewTop(ctx) {
    var sel = (storyPlay && storyPlay.choiceSel) || 0;
    for (var i = 0; i < EGGS.length; i++) {
      var x = 16 + i * 84;
      var ok = drawImageOrNull(ctx, EGGS[i].img, x, 44, 56, 56);
      if (!ok) {
        ctx.fillStyle = '#e8c838';
        ctx.beginPath();
        ctx.ellipse(x + 8, 52, 20, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (i === sel) {
        ctx.strokeStyle = '#e8c838';
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 4, 40, 64, 64);
      }
      drawText(ctx, EGGS[i].name, x + 6, 106, i === sel ? '#e8c838' : '#fff');
      /* Type centred under its egg: "Flying and Dragon" at 8px is
       * wider than the 84px column, and left aligned it ran into the
       * next egg's type ("Dragon Grass"). */
      ctx.font = '8px monospace';
      var typeW = ctx.measureText(EGGS[i].type).width;
      drawText(ctx, EGGS[i].type, x + 28 - Math.floor(typeW / 2), 118, '#8888aa', '8px monospace');
    }
    var egg = EGGS[sel];
    ctx.fillStyle = 'rgba(5,5,15,0.72)';
    ctx.fillRect(6, 130, W - 12, 58);
    ctx.strokeStyle = '#e8c838';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 131, W - 14, 56);
    drawImageOrNull(ctx, egg.front, 12, 134, 48, 48);
    drawText(ctx, 'Hatches: ' + egg.name + ', Codex ' + egg.codex, 66, 137, '#e8c838');
    drawText(ctx, egg.type, 66, 148, '#fff', '9px monospace');
    /* Hint wraps to 3 lines: the Puk and Mandragora hints run long,
     * and the old 2-line cap silently dropped the tail ("ground."). */
    ctx.font = '9px monospace';
    var hintLines = wrapLines(ctx, egg.hint, W - 76);
    for (var h = 0; h < hintLines.length && h < 3; h++) {
      drawText(ctx, hintLines[h], 66, 159 + h * 11, '#c8c8e8', '9px monospace');
    }
  }
  function drawStoryChoice(ctx, scene, selected) {
    ctx.font = '10px monospace';
    drawText(ctx, 'PICK ONE', 10, 8, '#e8c838', '11px monospace');
    var y = 26;
    var promptLines = wrapLines(ctx, scene.choice.prompt, W - 20);
    for (var i = 0; i < promptLines.length; i++) {
      drawText(ctx, promptLines[i], 10, y, '#fff');
      y += 12;
    }
    y += 4;
    for (var j = 0; j < scene.choice.options.length; j++) {
      var optLines = wrapLines(ctx, scene.choice.options[j].label, W - 34);
      var h = optLines.length * 12 + 4;
      if (j === selected) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(6, y - 2, W - 12, h + 2);
      }
      for (var k = 0; k < optLines.length; k++) {
        var marker = (j === selected && k === 0) ? '> ' : '  ';
        drawText(ctx, marker + optLines[k], 10, y + k * 12, j === selected ? '#101030' : '#fff');
      }
      /* V9-ART: egg pick rows carry their egg sprite at the right,
       * so each option reads as its egg at a glance. */
      if (scene.id === 'egg_choice') {
        var eggOpt = hatchEggById(scene.choice.options[j].id);
        drawImageOrNull(ctx, eggOpt.img, W - 34, y - 2, 20, 20);
      }
      y += h + 2;
    }
    drawBottomHint(ctx, 'Up and Down to pick. A to confirm.');
  }
  /* V9-SYS: the egg pick hatch, run only after the Yes on the egg
   * confirm panel. Moved here verbatim from the old egg_choice
   * branch in the choice handler (SCHOOL SCENES FIX v8-grid-pill):
   * the story choice hook (setStarterWildlife, already run) only
   * sets state fields, so this does the party push and the hatch
   * into grad_hatch, exactly as the old egg screen did. */
  function eggChoiceHatch(eggId) {
    var egg = hatchEggById(eggId);
    state.party.push({ kind: 'Wildlife', name: egg.name, codex: egg.codex, type: egg.type, level: 1, hp: 12, maxHp: 12, egg: true, bond: 1 });
    syncPlayerProfile();
    setFlag('egg_picked');
    setFlag('egg_' + egg.id);
    saveGame();
    /* V9-ART: the pick confirms visibly before the hatch starts: a
     * text box with the picked egg as its portrait, naming the egg
     * and its type. Phase flips to feedback so the text box draws
     * instead of the choice list. A advances it, then the hatch
     * sequence plays. */
    storyPlay.phase = 'feedback';
    showText(['You picked the ' + egg.name + ' egg, ' + egg.type + '.',
      'It is warm in your hands. The hatch begins.'], egg.img, function () {
      playHatchSequence(egg.id, function () {
        startStoryScene('grad_hatch');
      });
    });
  }
  screens.storyScene = {
    enter: function (data) {
      var sceneId = (data && data.sceneId) || null;
      var story = (window.FED13 && window.FED13.story) || null;
      if (!story || !sceneId || !story.getScene(sceneId)) {
        setScreen('overworld');
        return;
      }
      storyPlay = { sceneId: sceneId, scene: null, phase: 'lines', choiceSel: 0 };
      storyPlayLines(sceneId);
    },
    onPress: function (a) {
      if (textBox.active) { return; }
      /* V9-SYS: egg pick confirm. Up and Down flip Yes and No, B
       * backs out to the choice list, A on Yes hatches the pending
       * egg, A on No backs out. Nothing is picked until Yes. */
      if (storyPlay && storyPlay.phase === 'eggConfirm') {
        if (a === 'up' || a === 'down') { storyEggConfirmSel = (storyEggConfirmSel + 1) % 2; }
        else if (a === 'cancel') { storyEggPending = null; storyPlay.phase = 'choice'; }
        else if (a === 'confirm' || a === 'start') {
          if (storyEggConfirmSel === 0) {
            var pendingEgg = storyEggPending;
            storyEggPending = null;
            eggChoiceHatch(pendingEgg);
          } else {
            storyEggPending = null;
            storyPlay.phase = 'choice';
          }
        }
        return;
      }
      if (!storyPlay || storyPlay.phase !== 'choice' || !storyPlay.scene || !storyPlay.scene.choice) { return; }
      var opts = storyPlay.scene.choice.options || [];
      if (!opts.length) { return; }
      if (a === 'up') { storyPlay.choiceSel = (storyPlay.choiceSel + opts.length - 1) % opts.length; }
      else if (a === 'down') { storyPlay.choiceSel = (storyPlay.choiceSel + 1) % opts.length; }
      else if (a === 'confirm' || a === 'start') {
        var scene = storyPlay.scene;
        var opt = opts[storyPlay.choiceSel];
        var story = window.FED13.story;
        try { story.choose(scene.id, opt.id, storyStateForEngine()); } catch (e) {}
        saveGame();
        if (scene.id === 'egg_choice') {
          /* V9-SYS: the egg pick is the one story choice that cannot
           * be undone, so it asks first. The pick only hatches when
           * the player answers Yes on the confirm panel; No returns
           * to the choice list with nothing picked. */
          storyEggPending = opt.id;
          storyEggConfirmSel = 1;
          storyPlay.phase = 'eggConfirm';
          return;
        }
        if (scene.examQuestion && typeof story.examQuestionFeedback === 'function') {
          var fb = null;
          try { fb = story.examQuestionFeedback(scene.examQuestion, opt.id); } catch (e) { fb = null; }
          if (fb) {
            storyPlay.phase = 'feedback';
            var verdict = fb.correct ? 'Correct. ' : 'Wrong. ';
            showText(['Clerk Ivo: ' + verdict + fb.explain], story.portraits.hunterClerk, function () {
              storyAdvance();
            }, 'Clerk Ivo');
            return;
          }
        }
        storyAdvance();
      }
    },
    update: function () { textUpdate(); },
    draw: function (t) {
      if (!storyPlay || !storyPlay.scene) { return; }
      var scene = storyPlay.scene;
      clearScreen(topCtx, '#0a0a1e');
      topCtx.font = '12px monospace';
      var titleLines = wrapLines(topCtx, (scene.title || 'STORY').toUpperCase(), W - 20);
      for (var ti = 0; ti < titleLines.length && ti < 2; ti++) {
        drawText(topCtx, titleLines[ti], 10, 8 + ti * 14, '#e8c838', '12px monospace');
      }
      if (scene.location) {
        drawText(topCtx, scene.location, 10, 8 + Math.min(titleLines.length, 2) * 14, '#c8c8e8', '9px monospace');
      }
      /* V9-ART: during the egg pick, the top screen is the egg
       * preview (3 eggs, selected preview panel) instead of the
       * mountain background. */
      /* V9-SYS: a staged scene draws its current beat frame under
       * the title, clipped to the picture area so the title and
       * location stay readable. The beat carries the background,
       * sprites, and FX (sparkle for the permit celebration). A
       * scene without staging, or a line without a beat, falls back
       * to the plain background image as before. */
      var staged = (scene.staging && scene.staging.beats) ? currentStagingBeat() : null;
      if ((storyPlay.phase === 'choice' || storyPlay.phase === 'eggConfirm') && scene.id === 'egg_choice') { drawEggPickPreviewTop(topCtx); }
      else if (staged) {
        topCtx.save();
        topCtx.beginPath();
        topCtx.rect(0, 40, W, H - 40);
        topCtx.clip();
        drawStagingFrame(topCtx, staged, t);
        topCtx.restore();
      }
      else if (scene.background) { drawImageOrNull(topCtx, scene.background, 16, 52, 224, 110); }
      clearScreen(bottomCtx, '#0a0a1e');
      if (storyPlay.phase === 'eggConfirm') {
        /* V9-SYS: the egg pick confirm panel. It names the pending
         * egg and says the pick cannot be changed. */
        var pendEgg = hatchEggById(storyEggPending);
        drawConfirmPanel(bottomCtx, 'PICK THIS EGG?', [
          'The ' + pendEgg.name + ' egg, ' + pendEgg.type + ', will be',
          'your starter Wildlife. This pick cannot be changed.'
        ], storyEggConfirmSel);
        drawTextBox(bottomCtx);
      } else if (storyPlay.phase === 'choice' && scene.choice) {
        drawStoryChoice(bottomCtx, scene, storyPlay.choiceSel);
      } else {
        drawTextBox(bottomCtx);
      }
    }
  };

  /* ---------- GUILD JOB BOARD: Main Mission 1 card ---------- */
  /* DS style. Top screen: the pinned card, Maren Saltwright portrait,
   * seal, and the 1,000,000 Cr bounty in large gold type. Bottom
   * screen: the mission text, the stakes, the fine print toggle, and
   * the accept flow. Reading the card never accepts it. Accepting
   * happens only on the Accept option, and it calls the story choice
   * hook so the viewed, accepted, and declined flags stay in one
   * place. Declining, or B, walks away and stops the board dialogue
   * chain without accepting. After the board lines play, the menu
   * offers the harbor hall, which hands mm1_accept to the story
   * runner, so Trial Battle 1 launches, then the story continues
   * after the battle outcome. If the mission is already accepted, the card
   * opens straight at the harbor hall menu instead of Accept. */
  var jobBoardView = null;
  var jobBoardCb = null;
  var jobBoardSel = 0;
  var jobBoardFinePrint = false;
  var jobBoardMenuOpen = true;
  var jobBoardPhase = 'card'; /* card, accepted, ready, briefed, done */
  var jobBoardStoryMode = false;
  var jobBoardReturnScreen = 'overworld';

  function getMainMission1Card() {
    try {
      if (window.FED13 && window.FED13.story && window.FED13.story.mainMission1) {
        return window.FED13.story.mainMission1;
      }
    } catch (e) {}
    return null;
  }

  function normalizeMissionCard(card) {
    var raw = card || getMainMission1Card() || {};
    var c = raw.card || raw;
    return {
      rank: c.rank || 'Main Mission 1',
      heading: c.heading || 'TAKEDOWN: MAREN SALTWRIGHT',
      body: c.body || '',
      lines: c.lines || (c.body ? [c.body] : []),
      reward: c.reward || '1,000,000 Cr',
      postedBy: c.postedBy || 'Saltquay Guild',
      seal: c.seal || 'ONE OF THE 13',
      zodiac: c.zodiac || 'Pisces',
      targetRoleShort: c.targetRoleShort || 'Pisces of the 12 zodiacs',
      placeShort: c.placeShort || 'Realm Map member',
      danger: c.danger || '',
      stakes: c.stakes || '',
      location: c.location || raw.location || 'Saltquay harbor hall',
      trial: c.trial || 'Trial Battle 1',
      finePrint: c.finePrint || raw.rewardNote || '',
      acceptLabel: c.acceptLabel || 'Accept the mission',
      finePrintLabel: c.finePrintLabel || 'Read the fine print',
      declineLabel: c.declineLabel || 'Walk away for now',
      portrait: raw.targetPortrait || c.portrait || 'assets/p_maren.png',
      targetName: raw.target || 'Maren Saltwright'
    };
  }

  function jobBoardItems() {
    if (!jobBoardView) { return []; }
    if (jobBoardPhase === 'ready') { return ['Go to the harbor hall', 'Stay at the board']; }
    if (jobBoardPhase === 'done') { return ['Back to Saltquay']; }
    return [jobBoardView.acceptLabel, jobBoardView.finePrintLabel, jobBoardView.declineLabel];
  }

  function jobBoardClose() {
    var ret = jobBoardReturnScreen || 'overworld';
    if (ret === 'jobBoard') { ret = 'overworld'; }
    jobBoardView = null;
    jobBoardCb = null;
    jobBoardMenuOpen = true;
    jobBoardFinePrint = false;
    jobBoardPhase = 'card';
    jobBoardStoryMode = false;
    setScreen(ret);
  }

  function jobBoardAccept() {
    var cb = jobBoardCb;
    try {
      if (window.FED13 && window.FED13.story && window.FED13.story.hooks &&
          typeof window.FED13.story.hooks.chooseMainMission1 === 'function') {
        window.FED13.story.hooks.chooseMainMission1(state, 'accept');
      } else {
        setFlag('mainMission1Accepted', true);
        setFlag('mainMission1Declined', false);
      }
    } catch (e) {}
    jobBoardPhase = 'accepted';
    jobBoardMenuOpen = false;
    if (cb && typeof cb.onAccept === 'function') {
      cb.onAccept();
      return;
    }
    jobBoardClose();
  }

  function jobBoardDecline() {
    var cb = jobBoardCb;
    try {
      if (window.FED13 && window.FED13.story && window.FED13.story.hooks &&
          typeof window.FED13.story.hooks.chooseMainMission1 === 'function') {
        window.FED13.story.hooks.chooseMainMission1(state, 'decline');
      } else {
        setFlag('mainMission1Accepted', false);
        setFlag('mainMission1Declined', true);
      }
    } catch (e) {}
    jobBoardClose();
    if (cb && typeof cb.onDecline === 'function') { cb.onDecline(); }
  }

  function showMissionCard(card, cb) {
    if (!topCanvas || !bottomCanvas) { return { ok: false, error: 'engine not started' }; }
    var view = normalizeMissionCard(card);
    if (!view) { return { ok: false, error: 'no mission card data' }; }
    jobBoardView = view;
    jobBoardCb = cb || null;
    jobBoardSel = 0;
    jobBoardFinePrint = false;
    jobBoardMenuOpen = true;
    jobBoardStoryMode = !!(cb && cb.story);
    /* Reopening the card from the card screen itself (already
     * accepted, board lines replaying) must not overwrite the way
     * back out with the card screen. */
    if (currentScreen !== 'jobBoard') {
      jobBoardReturnScreen = currentScreen || 'overworld';
    }
    var already = !!(cb && cb.alreadyAccepted);
    if (!already && state && state.flags && state.flags.mainMission1Accepted) { already = true; }
    jobBoardPhase = already ? 'ready' : 'card';
    setScreen('jobBoard');
    return { ok: true, phase: jobBoardPhase, reward: view.reward, target: view.targetName };
  }

  function drawMissionCardTop(ctx, t) {
    var v = jobBoardView;
    drawTopBanner(ctx, 'GUILD JOB BOARD', 'Saltquay guild hall. First card on the board.');
    if (!v) { return; }
    drawBox(ctx, 6, 46, 244, 140, '#f8f0c8', '#e8c838');
    ctx.fillStyle = '#a01818';
    ctx.fillRect(8, 48, 240, 16);
    drawText(ctx, v.rank.toUpperCase(), 12, 52, '#ffffff', 'bold 9px monospace');
    var sealW = ctx.measureText(v.seal).width;
    drawText(ctx, v.seal, 248 - 4 - sealW, 52, '#ffe98a', 'bold 9px monospace');
    var pok = drawImageOrNull(ctx, v.portrait, 14, 70, 56, 56);
    if (!pok) {
      ctx.fillStyle = '#2a4a6a';
      ctx.fillRect(14, 70, 56, 56);
      drawText(ctx, 'M', 34, 82, '#a8d8f0', 'bold 28px monospace');
    }
    ctx.strokeStyle = '#101030';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 71, 54, 54);
    drawText(ctx, v.targetName.toUpperCase(), 78, 70, '#101030', 'bold 11px monospace');
    drawText(ctx, v.targetRoleShort, 78, 84, '#5a3a1a', '9px monospace');
    drawText(ctx, v.placeShort, 78, 96, '#5a3a1a', '9px monospace');
    ctx.font = '9px monospace';
    var dangerLines = wrapLines(ctx, v.danger, 168);
    for (var i = 0; i < dangerLines.length && i < 2; i++) {
      drawText(ctx, dangerLines[i], 78, 108 + i * 11, '#a01818', '9px monospace');
    }
    var pulse = 0.5 + 0.5 * Math.sin((t || 0) / 500);
    /* DIALOGUE-FIT v9: the label was drawn left-aligned at x 128, so it
     * sat right of centre over the centred reward below it. Centre it. */
    ctx.font = 'bold 9px monospace';
    var bountyW = ctx.measureText('BOUNTY').width;
    drawText(ctx, 'BOUNTY', 128 - bountyW / 2, 132, '#8a6d00', 'bold 9px monospace');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8a6d00';
    ctx.font = 'bold 20px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(v.reward, 128, 144);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(232,200,56,' + (0.4 + 0.5 * pulse) + ')';
    ctx.fillRect(58, 168, 140, 2);
  }

  function drawMissionCardBottom(ctx) {
    var v = jobBoardView;
    clearScreen(ctx, '#0a0a1e');
    if (!v) { return; }
    drawText(ctx, v.heading, 10, 8, '#e8c838', 'bold 11px monospace');
    ctx.font = '10px monospace';
    var y = 24;
    var lines = [];
    var i = 0;
    if (jobBoardFinePrint) {
      drawText(ctx, 'FINE PRINT', 10, y, '#a8d8f0', 'bold 10px monospace');
      y += 14;
      /* DIALOGUE-FIT v9: measure with the font that is drawn. The wrap
       * below used to measure with the bold 10px the label left on the
       * context; bold monospace advances the same as regular, so this
       * only locks the assumption in place. */
      ctx.font = '10px monospace';
      lines = wrapLines(ctx, v.finePrint, W - 20);
      for (i = 0; i < lines.length && i < 6; i++) {
        drawText(ctx, lines[i], 10, y + i * 12, '#c8c8e8');
      }
      y += Math.min(lines.length, 6) * 12 + 4;
      /* DIALOGUE-FIT v9: this line was drawn unwrapped at 9px, 67 chars
       * (363px) from x 10, so the 1,000,000 Cr tail ran off the right
       * edge of the screen. Wrap it at the size it is drawn. */
      ctx.font = '9px monospace';
      var walletLines = wrapLines(ctx, 'Wallet cap 999,999 Cr. This bounty alone lands at 1,000,000 Cr.', W - 20);
      for (i = 0; i < walletLines.length && i < 2; i++) {
        drawText(ctx, walletLines[i], 10, y + i * 11, '#ffe98a', '9px monospace');
      }
    } else {
      for (i = 0; i < v.lines.length; i++) {
        var wl = wrapLines(ctx, v.lines[i], W - 20);
        for (var j = 0; j < wl.length && y < 84; j++) {
          drawText(ctx, wl[j], 10, y, '#ffffff');
          y += 12;
        }
      }
      y += 2;
      drawText(ctx, 'STAKES', 10, y, '#e8c838', 'bold 9px monospace');
      y += 12;
      /* DIALOGUE-FIT v9: the wrap below used to measure with the bold
       * 9px font the STAKES label left on the context, then draw at
       * 10px, so lines that measured inside the box drew past its right
       * edge ("Wildlife from collar control, and open th"). Measure with
       * the font that is drawn (the v8 lesson, same bug in a new place). */
      ctx.font = '10px monospace';
      var sl = wrapLines(ctx, v.stakes, W - 20);
      for (i = 0; i < sl.length && i < 3; i++) {
        drawText(ctx, sl[i], 10, y + i * 12, '#c8c8e8');
      }
      y += Math.min(sl.length, 3) * 12 + 4;
      /* DIALOGUE-FIT v9: same overflow as the wallet line above (67
       * chars at 9px is 363px from x 10). Wrap it so it can never run
       * off the right edge. NOTE: on this card the menu at y 138 draws
       * over this line's y, so it stays hidden behind the menu until
       * the card bottom layout is reworked; wrapping it now means it
       * is at least correct if it ever shows. */
      ctx.font = '9px monospace';
      var trialLines = wrapLines(ctx, v.trial + '. ' + v.location + '. Posted by the ' + v.postedBy + '.', W - 20);
      for (i = 0; i < trialLines.length && i < 2; i++) {
        drawText(ctx, trialLines[i], 10, y + i * 11, '#8888aa', '9px monospace');
      }
    }
    if (textBox.active) {
      drawTextBox(ctx);
      return;
    }
    if (jobBoardMenuOpen) {
      var items = jobBoardItems();
      var y0 = 138;
      for (var m = 0; m < items.length; m++) {
        var my = y0 + m * 14;
        if (m === jobBoardSel) {
          ctx.fillStyle = '#e8c838';
          ctx.fillRect(6, my - 1, W - 12, 13);
          drawText(ctx, '> ' + items[m], 10, my, '#101030');
        } else {
          drawText(ctx, '  ' + items[m], 10, my, '#ffffff');
        }
      }
      drawBottomHint(ctx, 'A: choose  B: walk away');
    }
  }

  screens.jobBoard = {
    enter: function () { jobBoardSel = 0; },
    onPress: function (a) {
      if (textBox.active) { return; }
      if (!jobBoardView) { return; }
      var items = jobBoardItems();
      if (a === 'up') { jobBoardSel = (jobBoardSel + items.length - 1) % items.length; }
      else if (a === 'down') { jobBoardSel = (jobBoardSel + 1) % items.length; }
      else if (a === 'cancel') {
        if (jobBoardPhase === 'card') { jobBoardDecline(); }
        else { jobBoardClose(); }
      }
      else if (a === 'confirm' || a === 'start') {
        if (!jobBoardMenuOpen) { return; }
        if (jobBoardPhase === 'ready') {
          if (jobBoardSel === 0) {
            /* Harbor hall: hand mm1_accept to the story runner, the
             * same runner that plays the cold open and grad arc
             * battles, so Trial Battle 1 launches from its battle
             * block instead of playing as dialogue only. The bare
             * playScene call that used to sit here played the lines
             * through showDialogue and never consumed the battle.
             * Clear the board state first; the runner owns the next
             * screen from here, and the win continues the story. */
            jobBoardView = null;
            jobBoardCb = null;
            jobBoardMenuOpen = true;
            jobBoardFinePrint = false;
            jobBoardPhase = 'card';
            jobBoardStoryMode = false;
            try {
              if (window.FED13 && window.FED13.story && typeof window.FED13.story.getScene === 'function' && window.FED13.story.getScene('mm1_accept')) {
                startStoryScene('mm1_accept');
              } else { jobBoardClose(); }
            } catch (e) { jobBoardClose(); }
          } else { jobBoardClose(); }
          return;
        }
        if (jobBoardPhase === 'done') { jobBoardClose(); return; }
        if (jobBoardSel === 0) { jobBoardAccept(); }
        else if (jobBoardSel === 1) { jobBoardFinePrint = !jobBoardFinePrint; }
        else if (jobBoardSel === 2) { jobBoardDecline(); }
      }
    },
    update: function () {
      textUpdate();
      if (jobBoardStoryMode && jobBoardView && !textBox.active) {
        if (jobBoardPhase === 'accepted') {
          jobBoardPhase = 'ready';
          jobBoardMenuOpen = true;
          jobBoardSel = 0;
        } else if (jobBoardPhase === 'briefed') {
          jobBoardPhase = 'done';
          jobBoardMenuOpen = true;
          jobBoardSel = 0;
        }
      }
    },
    draw: function (t) {
      drawMissionCardTop(topCtx, t);
      drawMissionCardBottom(bottomCtx);
    }
  };

  /* ---------- CREATION SCREENS ---------- */
  var CREATION_STEPS = ['sex', 'race', 'path', 'pronouns', 'class', 'bloodline', 'grimoire', 'guideForm', 'guide', 'name', 'confirm'];
  var creation = { step: 0, sel: 0, name: '', nameCol: 0, nameRow: 0 };
  var NAME_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var NAME_COLS = 9;

  function creationOptions() {
    var step = CREATION_STEPS[creation.step];
    if (step === 'sex') { return ['girl', 'boy']; }
    if (step === 'race') { return ['Solar', 'Polar']; }
    if (step === 'path') {
      if (state.trainer.race === 'Polar') { return ['Hunter', 'Peacemaker']; }
      return ['Rebel', 'Peacekeeper'];
    }
    if (step === 'pronouns') { return ['him', 'her', 'they']; }
    if (step === 'class') { return CLASSES.map(function (c) { return c.name; }); }
    if (step === 'bloodline') { return BLOODLINES.map(function (b) { return b.name; }); }
    if (step === 'grimoire') { return GRIMOIRES.map(function (g) { return g.name; }); }
    if (step === 'guideForm') { return GUIDE_FORMS.map(function (g) { return g.name; }); }
    if (step === 'guide') { return GUIDE_GRIMOIRES.map(function (g) { return g.name; }); }
    return [];
  }
  function creationTitle() {
    var map = {
      sex: 'Are you a girl or a boy?',
      race: 'Pick your Mankind race.',
      path: 'Pick your path.',
      pronouns: 'Pick your pronouns.',
      class: 'Pick your Mankind class.',
      bloodline: 'Pick your starter bloodline.',
      grimoire: 'Pick your Craft Grimoire.',
      guideForm: 'Pick your guide form: Sword, Staff, or Shield.',
      guide: 'Pick your Grimoire guide.',
      name: 'What is your trainer name?',
      confirm: 'Is this your trainer?'
    };
    return map[CREATION_STEPS[creation.step]] || 'Creation';
  }
  function creationHint() {
    var step = CREATION_STEPS[creation.step];
    if (step === 'sex') { return 'Girl or boy sets how you look.'; }
    if (step === 'race') { return 'Solar: Gatehollow. Polar: Dreamrest.'; }
    if (step === 'path') { return 'Your path changes how you move.'; }
    if (step === 'pronouns') { return 'Pronouns change how others call you.'; }
    if (step === 'class') { return 'Up/Down pick. Left/Right change group.'; }
    if (step === 'bloodline') { return 'Up and Down to view. A picks it.'; }
    if (step === 'grimoire') { return 'Your Craft Grimoire holds your Crafts.'; }
    if (step === 'guideForm') { return 'Sword: fairy. Staff: orb. Shield: book.'; }
    if (step === 'guide') { return 'Same answers, only the voice differs.'; }
    if (step === 'name') { return 'Type letters, or use the D-pad.'; }
    return 'A: confirm  B: back';
  }
  function creationApply(step, value) {
    var t = state.trainer;
    if (step === 'sex') { t.sex = value; }
    else if (step === 'race') { t.race = value; }
    else if (step === 'path') { t.path = value; }
    else if (step === 'pronouns') { t.pronouns = value; }
    else if (step === 'class') { t.klass = value; }
    else if (step === 'bloodline') {
      t.bloodline = value;
      var b = BLOODLINES.filter(function (x) { return x.name === value; })[0];
      if (b) { t.totem = b.totem; }
    }
    else if (step === 'grimoire') { t.grimoire = value; }
    else if (step === 'guideForm') { t.guideForm = value; }
    else if (step === 'guide') { t.guideGrimoire = value; }
  }
  function creationNext() {
    if (creation.step < CREATION_STEPS.length - 1) {
      creation.step++;
      creation.sel = 0;
    }
  }
  function creationBack() {
    if (creation.step > 0) {
      creation.step--;
      creation.sel = 0;
    } else { setScreen('title'); }
  }
  function creationFinish() {
    state.trainer.name = creation.name || 'FED';
    syncPlayerProfile();
    state.createdAt = new Date().toISOString();
    state.location = state.trainer.race === 'Polar' ? 'Dreamrest' : 'Gatehollow';
    saveGame();
    /* SCHOOL SCENES FIX v8-grid-pill: the school arc lives in story.js
     * as creation_intro -> family_rival -> school_road_ghoul ->
     * egg_choice, with the egg choice wired to the hatch in the
     * storyScene choice handler below. The old hardcoded 6-line
     * cutscene skipped all of it, so none of those scenes ever
     * played (scenesPlayed was empty at the egg screen). Start the
     * chain and let it run to the hatch and the grad arc. */
    startStoryScene('creation_intro');
  }

  /* ---------- Creation helpers: home town, sprite, pronouns ---------- */
  function creationHomeTown() {
    return state.trainer.race === 'Polar' ? 'Dreamrest' : 'Gatehollow';
  }
  function creationSpritePath(race) {
    var sex = (state.trainer.sex || '').toLowerCase();
    var r = (race || state.trainer.race || '').toLowerCase();
    if ((sex !== 'girl' && sex !== 'boy') || (r !== 'solar' && r !== 'polar')) { return null; }
    return 'assets/ow_trainer_' + sex + '_' + r + '.png';
  }
  function drawCreationSprite(ctx, path, x, y, w, h) {
    if (!path) { return false; }
    var ok = drawImageOrNull(ctx, path, x, y, w, h);
    if (ok) { return true; }
    /* Fallback chibi when the sprite file is missing. */
    ctx.fillStyle = '#101030';
    ctx.fillRect(x + 6, y + h - 6, w - 12, 4);
    ctx.fillStyle = path.indexOf('_polar') >= 0 ? '#c8e8f8' : '#e8a860';
    ctx.fillRect(x + w / 2 - 8, y + 4, 16, 14);
    ctx.fillStyle = '#2848c8';
    ctx.fillRect(x + w / 2 - 10, y + 20, 20, 14);
    return false;
  }
  function drawCreationSpriteFrame(ctx, path, x, y, w, h) {
    /* Overworld sheets are 4x4 frames of 32x32. Draw the front facing
     * standing frame only: column 0, row 0. Drawing the whole sheet
     * would show all 16 frames at once. Same standing frame the
     * cold open uses for Maren through introDrawOwFrame. */
    if (!path) { return false; }
    var img = loadImage(path);
    if (!img.complete || img.naturalWidth === 0 || img._missing) {
      drawCreationSprite(ctx, path, x, y, w, h);
      return false;
    }
    ctx.drawImage(img, 0, 0, 32, 32, x, y, w, h);
    return true;
  }
  function creationPortraitPath(sex, race) {
    var s = (sex || state.trainer.sex || '').toLowerCase();
    var r = (race || state.trainer.race || '').toLowerCase();
    if ((s !== 'girl' && s !== 'boy') || (r !== 'solar' && r !== 'polar')) { return null; }
    return 'assets/ov4_portrait_trainer_' + s + '_' + r + '.png';
  }
  function drawCreationPortrait(ctx, sex, race, x, y, w, h) {
    var path = creationPortraitPath(sex, race);
    if (!path) { return false; }
    var ok = drawImageOrNull(ctx, path, x, y, w, h);
    if (!ok) {
      ctx.fillStyle = '#101030';
      ctx.fillRect(x, y, w, h);
      drawText(ctx, '?', x + Math.floor(w / 2) - 4, y + Math.floor(h / 2) - 8, '#e8c838', '16px monospace');
      return false;
    }
    drawPortraitFrame(ctx, x, y, w, h);
    return true;
  }
  function pronounExample(id) {
    var p = null;
    for (var i = 0; i < PRONOUNS.length; i++) { if (PRONOUNS[i].id === id) { p = PRONOUNS[i]; } }
    if (!p) { return ''; }
    var capHe = p.he.charAt(0).toUpperCase() + p.he.slice(1);
    var verb = p.id === 'they' ? 'are' : 'is';
    return capHe + ' ' + verb + ' ready. Talk to ' + p.him + '. That is ' + p.his + ' Grimoire.';
  }
  /* Race pick preview for the top screen: one panel per starting area.
   * The picked human is the dominant visual in each panel: the big
   * framed portrait for that race. Map art is dropped from the panel
   * so the landscape never outshines the human. */
  function drawRacePreviewTop(ctx) {
    var cols = [
      { race: 'Solar', town: 'Gatehollow', tone: 'Deep tones.', sub: 'Warm lowlands.', map: 'assets/ov3_create_race_solar.png' },
      { race: 'Polar', town: 'Dreamrest', tone: 'Palest tones.', sub: 'Cold highlands.', map: 'assets/ov3_create_race_polar.png' }
    ];
    for (var i = 0; i < cols.length; i++) {
      var c = cols[i];
      var x = 6 + i * 124;
      var selected = creationOptions()[creation.sel] === c.race;
      /* Panel 44 to 162. The panel art has a border band about an
       * eighth of its height top and bottom, so the header, portrait,
       * sprite and town all sit inside the light interior (about
       * y59 to y147), in dark ink that reads on the light art. The
       * tone and sub lines live on as the two summary lines below
       * the panels, so nothing overflows the panel bottom. */
      drawOv3Panel(ctx, x, 44, 120, 118, selected ? '#2a2a4e' : '#14142a', selected ? '#e8c838' : '#444466');
      drawText(ctx, c.race.toUpperCase(), x + 16, 60, '#101030', '10px monospace');
      /* Portrait shifts left so the full body sprite frame fits beside
       * it in the panel: 64 portrait plus 48 sprite plus margins. */
      drawCreationPortrait(ctx, state.trainer.sex, c.race, x + 6, 72, 64, 64);
      drawCreationSpriteFrame(ctx, creationSpritePath(c.race), x + 70, 80, 48, 48);
      drawText(ctx, c.town, x + 16, 138, '#101030', '9px monospace');
    }
  }

  screens.creation = {
    enter: function () {
      creation.step = 0;
      creation.sel = 0;
      creation.name = '';
      creation.nameCol = 0;
      creation.nameRow = 0;
    },
    onPress: function (a) {
      var step = CREATION_STEPS[creation.step];
      var opts = creationOptions();
      if (step === 'name') { creationNamePress(a); return; }
      if (step === 'confirm') {
        if (a === 'confirm') { creationFinish(); }
        else if (a === 'cancel') { creationBack(); }
        return;
      }
      if (step === 'class') {
        /* Class picker: Up and Down stay inside the current group,
         * Left and Right jump to the first class of the next group. */
        var curGroup = CLASSES[creation.sel].group;
        var inGroup = classesInGroup(curGroup);
        var pos = inGroup.indexOf(creation.sel);
        if (a === 'up') { creation.sel = inGroup[(pos + inGroup.length - 1) % inGroup.length]; }
        else if (a === 'down') { creation.sel = inGroup[(pos + 1) % inGroup.length]; }
        else if (a === 'left' || a === 'right') {
          var gi = classGroupIndex(curGroup);
          gi = (a === 'left') ? (gi + CLASS_GROUPS.length - 1) % CLASS_GROUPS.length : (gi + 1) % CLASS_GROUPS.length;
          creation.sel = classesInGroup(CLASS_GROUPS[gi].group)[0];
        }
        else if (a === 'confirm') {
          creationApply(step, opts[creation.sel]);
          creationNext();
        }
        else if (a === 'cancel') { creationBack(); }
        return;
      }
      if (a === 'up') { creation.sel = (creation.sel + opts.length - 1) % opts.length; }
      else if (a === 'down') { creation.sel = (creation.sel + 1) % opts.length; }
      else if (a === 'left') { creation.sel = Math.max(0, creation.sel - 1); }
      else if (a === 'right') { creation.sel = Math.min(opts.length - 1, creation.sel + 1); }
      else if (a === 'confirm') {
        creationApply(step, opts[creation.sel]);
        creationNext();
      }
      else if (a === 'cancel') { creationBack(); }
    },
    onKey: function (e) {
      /* Direct typing for the name step. */
      if (CREATION_STEPS[creation.step] !== 'name') { return; }
      if (e.code === 'Backspace') {
        creation.name = creation.name.slice(0, -1);
        e.preventDefault();
      } else if (e.key && e.key.length === 1 && NAME_LETTERS.indexOf(e.key) >= 0 && creation.name.length < 10) {
        creation.name += e.key;
      }
    },
    update: function () {},
    draw: function () { drawCreationTop(topCtx); drawCreationBottom(bottomCtx); }
  };

  /* ---------- BLOODLINE SHOWCASE: portrait, Totem Spirit, line, eggs ----------
     Top screen shows the selected bloodline large. Bottom screen shows the
     list of 5, the arc reward, and the 3 eggs that come next. */
  function drawPortraitOrPlaceholder(ctx, path, x, y, w, h) {
    var ok = drawImageOrNull(ctx, path, x, y, w, h);
    if (!ok) {
      ctx.fillStyle = '#c8c8f0';
      ctx.fillRect(x, y, w, h);
      drawText(ctx, '?', x + Math.floor(w / 2) - 4, y + Math.floor(h / 2) - 8, '#101030', '16px monospace');
    }
  }
  function drawBloodlineShowcaseTop(ctx) {
    var b = BLOODLINES[creation.sel];
    if (!b) { return; }
    drawOv3Panel(ctx, 8, 46, 84, 84, '#101030', '#e8c838');
    drawPortraitOrPlaceholder(ctx, b.img, 10, 48, 80, 80);
    drawPortraitFrame(ctx, 10, 48, 80, 80);
    /* Dark backing behind the right-column text: the bloodline art
     * has five gold medallions right where these lines sit, and the
     * white and gold text washed out on them. */
    ctx.fillStyle = 'rgba(5,5,15,0.72)';
    ctx.fillRect(96, 46, W - 102, 86);
    drawText(ctx, '#' + b.num + ' ' + b.name, 100, 48, '#e8c838', '11px monospace');
    drawText(ctx, 'Totem Spirit:', 100, 64, '#8888aa');
    drawText(ctx, b.totem, 100, 76, '#fff', '11px monospace');
    ctx.font = '10px monospace';
    var titleLines = wrapLines(ctx, b.totemTitle, 148);
    for (var i = 0; i < titleLines.length && i < 2; i++) {
      drawText(ctx, titleLines[i], 100, 92 + i * 12, '#c8c8e8');
    }
    drawText(ctx, 'Arc partner: ' + b.arc, 100, 118, '#fff');
    /* Dark backing behind the two lower lines, same reason: the
     * medallion row ends just above them. */
    ctx.fillStyle = 'rgba(5,5,15,0.72)';
    ctx.fillRect(6, 134, W - 12, 56);
    ctx.font = '10px monospace';
    var lineLines = wrapLines(ctx, b.line, W - 20);
    for (var j = 0; j < lineLines.length && j < 2; j++) {
      drawText(ctx, lineLines[j], 10, 138 + j * 12, '#fff');
    }
    ctx.font = '10px monospace';
    var greetLines = wrapLines(ctx, '"' + b.greeting + '"', W - 20);
    for (var k = 0; k < greetLines.length && k < 2; k++) {
      drawText(ctx, greetLines[k], 10, 164 + k * 12, '#e8c838');
    }
  }
  function drawBloodlineShowcaseBottom(ctx) {
    var b = BLOODLINES[creation.sel];
    /* Dark backing behind the list, the arc reward, and the eggs
     * header: the bloodline art medallions sit right behind them,
     * and the rows read struck through without it. */
    ctx.fillStyle = 'rgba(5,5,15,0.72)';
    ctx.fillRect(6, 26, W - 12, 110);
    for (var i = 0; i < BLOODLINES.length; i++) {
      var y = 30 + i * 14;
      var label = '#' + BLOODLINES[i].num + ' ' + BLOODLINES[i].name + '  ' + BLOODLINES[i].totem;
      if (i === creation.sel) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(6, y - 2, W - 12, 14);
        drawText(ctx, '> ' + label, 10, y, '#101030');
      } else {
        drawText(ctx, '  ' + label, 10, y, '#fff');
      }
    }
    if (b) { drawText(ctx, 'Arc reward: ' + b.reward, 10, 106, '#e8c838'); }
    drawText(ctx, 'The 3 eggs come next:', 10, 122, '#c8c8e8');
    for (var e = 0; e < EGGS.length; e++) {
      var x = 24 + e * 78;
      var ok = drawImageOrNull(ctx, EGGS[e].img, x, 136, 26, 26);
      if (!ok) {
        ctx.fillStyle = '#e8c838';
        ctx.beginPath();
        ctx.ellipse(x + 13, 149, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      drawText(ctx, EGGS[e].name, x - 4, 166, '#fff');
    }
    drawText(ctx, creationHint(), 10, H - 14, '#8888aa');
  }

  /* Long creation lines shrink from 10px to 8px when they would run
   * off the right edge, the same rule the banner sub uses. Wording
   * is never changed. maxW is the width the text has from x. */
  function drawCreationLine(ctx, text, x, y, color, maxW) {
    var f = '10px monospace';
    ctx.font = f;
    if (ctx.measureText(text).width > maxW) { f = '9px monospace'; ctx.font = f; }
    if (ctx.measureText(text).width > maxW) { f = '8px monospace'; }
    drawText(ctx, text, x, y, color, f);
  }

  function drawCreationTop(ctx) {
    var step = CREATION_STEPS[creation.step];
    /* Bloodline step gets its own showcase backdrop on both screens;
     * every other step gets the creation backdrop. */
    var createBg = (step === 'bloodline') ? 'assets/ov3_create_bloodline.png' : 'assets/ov3_create_bg.png';
    drawBannerOverBg(ctx, createBg, 'CREATION', creationTitle());
    if (step === 'bloodline') { drawBloodlineShowcaseTop(ctx); return; }
    var t = state.trainer;
    if (step === 'sex') {
      var sexPortraits = [
        { label: 'GIRL', sex: 'girl', x: 28 },
        { label: 'BOY', sex: 'boy', x: 148 }
      ];
      for (var si = 0; si < sexPortraits.length; si++) {
        var sp = sexPortraits[si];
        drawCreationPortrait(ctx, sp.sex, 'Solar', sp.x, 48, 80, 80);
        drawCreationSpriteFrame(ctx, 'assets/ow_trainer_' + sp.sex + '_solar.png', sp.x + 16, 136, 48, 48);
        if (creation.sel === si) {
          ctx.strokeStyle = '#e8c838';
          ctx.lineWidth = 3;
          ctx.strokeRect(sp.x - 4, 44, 88, 88);
        }
        /* Label sits inside the frame interior on its own dark tab,
         * clear of the frame edge and the sprite below: the old
         * y134 put the frame bottom border through the letters. */
        ctx.fillStyle = 'rgba(5,5,15,0.78)';
        ctx.fillRect(sp.x + 22, 112, 36, 16);
        drawText(ctx, sp.label, sp.x + 28, 114, creation.sel === si ? '#e8c838' : '#fff');
      }
      /* The two hint lines lived at y168 and y180, inside the sprite
       * band below the portraits. The hint still shows on the bottom
       * screen, so the top lines are dropped, not moved. */
      return;
    }
    if (step === 'race') {
      drawRacePreviewTop(ctx);
      /* Summary lines on their own dark strip, clear of the panels
       * above (panels end at y162). */
      ctx.fillStyle = 'rgba(5,5,15,0.55)';
      ctx.fillRect(0, 164, W, 26);
      drawText(ctx, 'Solar: deep tones, warm lowlands.', 10, 168, '#fff');
      drawText(ctx, 'Polar: pale tones, cold highlands.', 10, 180, '#fff');
      return;
    }
    /* The name step summary lines already show on the bottom screen
     * (Name line plus hint), so the top screen drops its two extra
     * lines here: they used to land on the summary rows below. */
    var y = 48;
    var rows = [
      'Name: ' + (creation.name || t.name || '-'),
      'Look: ' + (t.sex || '-'),
      'Race: ' + (t.race || '-'),
      'Path: ' + (t.path || '-'),
      'Pronouns: ' + (t.pronouns || '-'),
      'Mankind class: ' + (t.klass || '-'),
      'Bloodline: ' + (t.bloodline || '-'),
      'Totem Spirit: ' + (t.totem || '-'),
      'Craft Grimoire: ' + (t.grimoire || '-'),
      'Guide form: ' + (t.guideForm || '-'),
      'Guide Grimoire: ' + (t.guideGrimoire || '-')
    ];
    var rowCount = (step === 'class') ? 5 : rows.length;
    /* Guide steps keep their two guide lines at y168 and y180, so
     * their summary stops after 9 rows, clear of those lines. */
    if (step === 'guideForm' || step === 'guide') { rowCount = 9; }
    /* Dark backing behind the summary block so the lines read over
     * the hall art. The block starts at y48, clear of the banner sub
     * strip above it (which ends at y46): the old y40 start put the
     * first row straight on top of the sub line. 12 px pitch so each
     * row has its own clear row. Rows at or below y120 sit below the
     * YOU sprite (which ends at y102, label at y104), so those rows
     * get the full width to x246 instead of stopping at x182:
     * "Craft Grimoire: Grimoire of Dawn" is 32 chars and was
     * truncated to "Grimoire ..." at the old 172px cap. A row that
     * still does not fit at 10px is set at 9px first, and only then
     * truncated. */
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(6, 44, W - 12, rowCount * 12 + 8);
    for (var i = 0; i < rowCount; i++) {
      var rowText = rows[i];
      var rowY = y + i * 12;
      var rowMaxW = (rowY >= 120) ? 236 : 172;
      var rowFont = '10px monospace';
      ctx.font = rowFont;
      if (ctx.measureText(rowText).width > rowMaxW) {
        rowFont = '9px monospace';
        ctx.font = rowFont;
      }
      while (rowText.length > 1 && ctx.measureText(rowText + '...').width > rowMaxW) {
        rowText = rowText.slice(0, -1);
      }
      if (ctx.measureText(rows[i]).width > rowMaxW) { rowText = rowText + '...'; }
      drawText(ctx, rowText, 10, rowY, '#ffffff', rowFont);
    }
    /* Picked trainer sprite, top right, once sex and race are set.
     * Drawn AFTER the summary block, so the summary backing can no
     * longer dim the sprite and the YOU label: the old order drew
     * them first and the 62% dark backing painted over both. The
     * sprite is 56px now and the label sits at y104, clear of the
     * class panel below (which starts at y116). */
    var sprite = creationSpritePath();
    if (sprite) {
      drawCreationSpriteFrame(ctx, sprite, 188, 46, 56, 56);
      drawText(ctx, 'YOU', 212, 104, '#e8c838');
    }
    if (step === 'guideForm' || step === 'guide') {
      /* Guide lines sit on their own dark strip, clear of the
       * summary block above (which stops at 9 rows for these steps). */
      ctx.fillStyle = 'rgba(5,5,15,0.55)';
      ctx.fillRect(0, 164, W, 26);
    }
    if (step === 'guideForm') {
      var gf = GUIDE_FORMS[creation.sel];
      if (gf) {
        drawCreationLine(ctx, gf.name + ': your guide is a ' + gf.guide + '.', 10, 168, '#e8c838', W - 20);
        drawCreationLine(ctx, gf.desc, 10, 180, '#fff', W - 20);
      }
    }
    if (step === 'guide') {
      var gg = GUIDE_GRIMOIRES[creation.sel];
      if (gg) {
        drawCreationLine(ctx, gg.name + ': ' + gg.voice, 10, 168, '#e8c838', W - 20);
        drawCreationLine(ctx, 'Wiki and contacts only. Same answers, new voice.', 10, 180, '#fff', W - 20);
      }
    }
    if (step === 'class') {
      /* Class detail panel on the top screen: big icon, name, group,
       * one line description, group blurb, and count out of 52.
       * DARK panel, not the light ov3 panel art: the name, desc, and
       * blurb are light text made for a dark field, and on the light
       * art the name washed out, the desc sat on the bottom border
       * band, and the blurb fell below the panel entirely. The panel
       * starts at y116, clear of the YOU label above it (ends y114),
       * and every line sits inside it with room to spare. */
      var c = CLASSES[creation.sel];
      if (c) {
        var gm = CLASS_GROUPS[classGroupIndex(c.group)];
        var groupCount = classesInGroup(c.group).length;
        ctx.fillStyle = '#0b0b20';
        ctx.fillRect(6, 116, W - 12, 70);
        ctx.strokeStyle = gm.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(7, 117, W - 14, 68);
        drawClassIcon(ctx, c, 14, 122, 36, gm.color);
        drawText(ctx, c.name.toUpperCase(), 58, 122, '#f8f0c8', '12px monospace');
        drawText(ctx, gm.group + '  ' + groupCount + ' in group', 58, 138, gm.color, '9px monospace');
        drawText(ctx, 'Class ' + (creation.sel + 1) + ' of ' + CLASSES.length, 58, 150, '#8888aa', '9px monospace');
        /* Measure the desc with the font it is drawn in: the old code
         * wrapped at whatever font the previous line left, so a long
         * desc wrapped too late and ran past the panel edge. */
        ctx.font = '10px monospace';
        var descLines = wrapLines(ctx, c.desc, W - 20);
        for (var di = 0; di < descLines.length && di < 1; di++) {
          drawCreationLine(ctx, descLines[di], 58, 164, '#fff', W - 68);
        }
        drawText(ctx, gm.blurb, 10, 176, '#c8c8e8', '8px monospace');
      }
    }
  }

  /* Guide options carry a voice line each, and the Chronicler line
   * ran off the right edge on one row. Two lines per option: name
   * on line one, voice on line two, so the full wording fits. */
  function drawGuideListBottom(ctx) {
    /* Dark backing behind the option rows: the hall art is bright
     * where the rows sit, and the first letters of the unselected
     * rows washed out on the left arch pillar. */
    ctx.fillStyle = 'rgba(5,5,15,0.55)';
    ctx.fillRect(0, 26, W, 108);
    for (var i = 0; i < GUIDE_GRIMOIRES.length; i++) {
      var g = GUIDE_GRIMOIRES[i];
      var y = 30 + i * 26;
      if (i === creation.sel) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(6, y - 2, W - 12, 24);
        drawText(ctx, '> ' + g.name, 10, y, '#101030');
        drawText(ctx, '  ' + g.voice, 10, y + 12, '#101030', '9px monospace');
      } else {
        drawText(ctx, '  ' + g.name, 10, y, '#fff');
        drawText(ctx, '  ' + g.voice, 10, y + 12, '#c8c8e8', '9px monospace');
      }
    }
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(0, H - 16, W, 16);
    drawText(ctx, creationHint(), 10, H - 14, '#8888aa');
  }

  function drawCreationBottom(ctx) {
    var step = CREATION_STEPS[creation.step];
    /* Name step gets its own entry backdrop on the bottom screen;
     * bloodline step gets the showcase backdrop; other steps get the
     * creation backdrop. The step title is drawn over it. */
    var createBottomBg = 'assets/ov3_create_bg.png';
    if (step === 'bloodline') { createBottomBg = 'assets/ov3_create_bloodline.png'; }
    /* Name step uses the plain creation backdrop, not
     * ov3_create_name.png: that art has a whole keyboard grid
     * (A to Z plus Back and OK) baked into it, which printed a ghost
     * grid behind the drawn letter grid. */
    drawScreenBg(ctx, createBottomBg);
    drawText(ctx, creationTitle(), 10, 8, '#e8c838', '11px monospace');
    if (step === 'bloodline') { drawBloodlineShowcaseBottom(ctx); return; }
    if (step === 'name') { drawNameEntry(ctx); return; }
    if (step === 'confirm') {
      var t = state.trainer;
      var confirmName = creation.name || 'FED';
      /* Dark backing behind the summary lines: the hall art is bright
       * where these lines sit, and the first letters washed out on
       * the arch pillars. Drawn BEFORE the portrait, so the portrait
       * paints over it undimmed. */
      ctx.fillStyle = 'rgba(5,5,15,0.55)';
      ctx.fillRect(6, 30, W - 12, 122);
      drawCreationPortrait(ctx, t.sex, t.race, 166, 30, 80, 80);
      drawText(ctx, confirmName + ', ' + t.sex + ', ' + t.race + ' ' + t.path, 10, 34, '#fff');
      drawText(ctx, 'Pronouns: ' + t.pronouns, 10, 50, '#fff');
      drawText(ctx, 'Class: ' + t.klass, 10, 66, '#fff');
      drawText(ctx, 'Bloodline: ' + t.bloodline + ' #' + (BLOODLINES.filter(function (b) { return b.name === t.bloodline; })[0] || { num: '?' }).num, 10, 82, '#fff');
      drawText(ctx, 'Totem Spirit: ' + t.totem, 10, 98, '#fff');
      drawText(ctx, 'Craft Grimoire: ' + t.grimoire, 10, 114, '#fff');
      drawText(ctx, 'Guide form: ' + (t.guideForm || '-'), 10, 130, '#fff');
      drawText(ctx, 'Guide Grimoire: ' + (t.guideGrimoire || '-'), 10, 146, '#fff');
      /* Footer on its own dark strip, each line on its own row with
       * a clear gap, so the two lines can no longer read as one. */
      ctx.fillStyle = 'rgba(5,5,15,0.62)';
      ctx.fillRect(6, 156, W - 12, 32);
      drawText(ctx, 'A: begin  B: go back', 10, 160, '#e8c838');
      drawText(ctx, 'Your story starts in ' + creationHomeTown() + '.', 10, 176, '#e8e8f8');
      return;
    }
    if (step === 'class') { drawClassPickerBottom(ctx); return; }
    if (step === 'guide') { drawGuideListBottom(ctx); return; }
    var opts = creationOptions();
    var pageSize = 8;
    var page = Math.floor(creation.sel / pageSize);
    var start = page * pageSize;
    var end = Math.min(opts.length, start + pageSize);
    /* Dark backing behind the option rows: the hall art is bright
     * where the rows sit, and the first letters of the unselected
     * rows washed out on the left arch pillar. Sized to the rows
     * actually shown, so the race sprite below keeps its own space;
     * the pronouns step gets extra height for its two example lines
     * below the rows (y96 and y109), which washed out the same way. */
    ctx.fillStyle = 'rgba(5,5,15,0.55)';
    ctx.fillRect(0, 26, W, (step === 'pronouns') ? 96 : (end - start) * 15 + 2);
    for (var i = start; i < end; i++) {
      var y = 30 + (i - start) * 15;
      var label = opts[i];
      if (step === 'bloodline') {
        var b = BLOODLINES[i];
        label = '#' + b.num + ' ' + b.name + '  ' + b.totem;
      }
      if (step === 'guideForm') {
        label = GUIDE_FORMS[i].name + '  (' + GUIDE_FORMS[i].guide + ')';
      }
      if (step === 'guide') {
        label = GUIDE_GRIMOIRES[i].name + '  (' + GUIDE_GRIMOIRES[i].voice + ')';
      }
      if (step === 'class') {
        label = CLASSES[i].name + '  (' + CLASSES[i].group + ')';
      }
      if (step === 'race') {
        label = opts[i] + '  ' + (opts[i] === 'Solar' ? 'Gatehollow' : 'Dreamrest');
      }
      if (step === 'pronouns') {
        var pr = PRONOUNS[i];
        if (pr) { label = opts[i] + '  (' + pr.he + ' / ' + pr.him + ' / ' + pr.his + ')'; }
      }
      /* A label that would run off the right edge shrinks to 9px,
       * then 8px, rather than truncating. The guide step uses two
       * lines per option instead (drawGuideListBottom), so this net
       * only ever fires on a future long label. */
      var fullLabel = ((i === creation.sel) ? '> ' : '  ') + label;
      var labelFont = '10px monospace';
      ctx.font = labelFont;
      if (ctx.measureText(fullLabel).width > W - 20) { labelFont = '9px monospace'; ctx.font = labelFont; }
      if (ctx.measureText(fullLabel).width > W - 20) { labelFont = '8px monospace'; }
      if (i === creation.sel) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(6, y - 2, W - 12, 14);
        drawText(ctx, '> ' + label, 10, y, '#101030', labelFont);
      } else {
        drawText(ctx, '  ' + label, 10, y, '#fff', labelFont);
      }
    }
    if (opts.length > pageSize) {
      drawText(ctx, 'Page ' + (page + 1) + ' of ' + Math.ceil(opts.length / pageSize), W - 70, H - 28, '#8888aa');
    }
    if (step === 'race') {
      var raceSprite = creationSpritePath(opts[creation.sel]);
      if (raceSprite) {
        /* Clear of the option rows and their gold selection bar:
         * the sprite sits in the empty lower right instead. */
        drawCreationSpriteFrame(ctx, raceSprite, 200, 96, 48, 48);
        drawText(ctx, 'YOU', 212, 148, '#e8c838');
      }
    }
    if (step === 'pronouns') {
      var exLines = wrapLines(ctx, pronounExample(opts[creation.sel]), W - 20);
      ctx.font = '10px monospace';
      for (var li = 0; li < exLines.length && li < 2; li++) {
        drawText(ctx, exLines[li], 10, 96 + li * 13, '#fff');
      }
    }
    /* Hint lines sit on a dark strip so they read over the bright
     * floor tiles. The sex step has two hint lines, so its strip
     * covers both; other steps get the single-line strip. */
    if (step === 'sex') {
      ctx.fillStyle = 'rgba(5,5,15,0.62)';
      ctx.fillRect(0, H - 30, W, 30);
      drawText(ctx, 'Left/Right pick. A confirms.', 10, H - 28, '#8888aa');
    } else {
      ctx.fillStyle = 'rgba(5,5,15,0.62)';
      ctx.fillRect(0, H - 16, W, 16);
    }
    drawText(ctx, creationHint(), 10, H - 14, '#8888aa');
  }

  function drawClassPickerBottom(ctx) {
    /* DS class picker, bottom screen: 6 group tabs on top, then the
     * classes in the selected group, each with its small icon. The
     * whole group fits on screen, so there is no paging here. */
    var sel = CLASSES[creation.sel];
    var gi = classGroupIndex(sel.group);
    var gm = CLASS_GROUPS[gi];
    var inGroup = classesInGroup(sel.group);
    var pos = inGroup.indexOf(creation.sel);
    /* Group tabs: 6 tabs across 256 px, about 42 px each. */
    for (var g = 0; g < CLASS_GROUPS.length; g++) {
      var tx = 4 + g * 42;
      var tw = 40;
      if (g === gi) {
        ctx.fillStyle = CLASS_GROUPS[g].color;
        ctx.fillRect(tx, 26, tw, 14);
        drawText(ctx, CLASS_GROUPS[g].short, tx + 4, 29, '#101030', '9px monospace');
      } else {
        drawBox(ctx, tx, 26, tw, 14, '#101030', CLASS_GROUPS[g].color);
        drawText(ctx, CLASS_GROUPS[g].short, tx + 4, 29, '#c8c8e8', '9px monospace');
      }
    }
    drawText(ctx, gm.group + ' (' + inGroup.length + ')', 10, 46, gm.color, '9px monospace');
    drawText(ctx, (pos + 1) + ' / ' + inGroup.length, W - 46, 46, '#8888aa', '9px monospace');
    /* Dark backing behind the class rows: the hall art is bright
     * where the names sit, and the first letters washed out on the
     * left arch pillar. */
    ctx.fillStyle = 'rgba(5,5,15,0.55)';
    ctx.fillRect(0, 54, W, inGroup.length * 10 + 8);
    for (var i = 0; i < inGroup.length; i++) {
      var ci = inGroup[i];
      var c = CLASSES[ci];
      var y = 58 + i * 10;
      drawClassIcon(ctx, c, 10, y - 1, 10, CLASS_GROUPS[classGroupIndex(c.group)].color);
      if (i === pos) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(24, y - 2, W - 30, 11);
        drawText(ctx, '> ' + c.name, 26, y - 1, '#101030', '9px monospace');
      } else {
        drawText(ctx, '  ' + c.name, 26, y - 1, '#fff', '9px monospace');
      }
    }
    /* Hint on its own dark strip, like the other bottom screens:
     * it used to sit straight on the bright floor tiles. */
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(0, H - 16, W, 16);
    drawText(ctx, 'Up/Down pick. Left/Right group. A confirms.', 10, H - 14, '#8888aa', '8px monospace');
  }

  function drawNameEntry(ctx) {
    var nt = state.trainer;
    var ident = (nt.sex && nt.race) ? '  ' + nt.sex + ' ' + nt.race + ', ' + (nt.pronouns || '-') : '';
    /* 10 px name line: even a 10-letter name ends by x202, clear of
     * the portrait at x208. The 12 px line ran under the portrait. */
    drawText(ctx, 'Name: ' + (creation.name || '_') + ident, 10, 30, '#fff', '10px monospace');
    /* Dark backing panel behind the whole letter grid including
     * the DEL / DONE row, so every letter reads clean of the hall
     * art (torches, arches, bright floor) behind it. Grid rows run
     * y52 to y146, DEL / DONE at y156, so the panel runs y46 to
     * y174; the hint strip below starts at y176. */
    ctx.fillStyle = 'rgba(5,5,15,0.78)';
    ctx.fillRect(6, 46, W - 12, 128);
    var rows = Math.ceil(NAME_LETTERS.length / NAME_COLS);
    var gridPitch = 14;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < NAME_COLS; c++) {
        var idx = r * NAME_COLS + c;
        if (idx >= NAME_LETTERS.length) { break; }
        var x = 10 + c * 26, y = 52 + r * gridPitch;
        var ch = NAME_LETTERS[idx];
        if (r === creation.nameRow && c === creation.nameCol) {
          ctx.fillStyle = '#e8c838';
          ctx.fillRect(x - 2, y - 2, 22, 14);
          drawText(ctx, ch, x + 4, y, '#101030');
        } else {
          drawText(ctx, ch, x + 4, y, '#fff');
        }
      }
    }
    /* 14 px grid pitch leaves the DEL / DONE row clear of the hint
     * line below it; the old 16 px pitch ran the two together. */
    var extraY = 52 + rows * gridPitch + 6;
    var extras = ['DEL', 'DONE'];
    for (var e = 0; e < extras.length; e++) {
      var ex = 10 + e * 60;
      if (creation.nameRow === rows && creation.nameCol === e) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(ex - 2, extraY - 2, 54, 14);
        drawText(ctx, extras[e], ex + 4, extraY, '#101030');
      } else {
        drawText(ctx, extras[e], ex + 4, extraY, '#fff');
      }
    }
    drawCreationPortrait(ctx, nt.sex, nt.race, 208, 4, 44, 44);
    /* Hint on its own dark strip, clear of the bright floor. */
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(0, H - 16, W, 16);
    drawText(ctx, 'A picks a letter. DONE needs 1 letter.', 10, H - 14, '#8888aa');
  }
  function creationNamePress(a) {
    var rows = Math.ceil(NAME_LETTERS.length / NAME_COLS);
    if (a === 'up') {
      creation.nameRow = (creation.nameRow + rows) % (rows + 1);
    } else if (a === 'down') {
      creation.nameRow = (creation.nameRow + 1) % (rows + 1);
    } else if (a === 'left') {
      var maxCol = creation.nameRow === rows ? 1 : NAME_COLS - 1;
      creation.nameCol = (creation.nameCol + maxCol) % (maxCol + 1);
    } else if (a === 'right') {
      var maxCol2 = creation.nameRow === rows ? 1 : NAME_COLS - 1;
      creation.nameCol = (creation.nameCol + 1) % (maxCol2 + 1);
    } else if (a === 'confirm') {
      if (creation.nameRow === rows) {
        if (creation.nameCol === 0) {
          creation.name = creation.name.slice(0, -1);
        } else if (creation.name.length >= 1) {
          creationNext();
        }
      } else {
        var idx = creation.nameRow * NAME_COLS + creation.nameCol;
        if (idx < NAME_LETTERS.length && creation.name.length < 10) {
          creation.name += NAME_LETTERS[idx];
        }
      }
    } else if (a === 'cancel') {
      if (creation.name.length > 0) { creation.name = creation.name.slice(0, -1); }
      else { creationBack(); }
    }
  }

  /* ---------- EGG PICK: 3 eggs from the kind Wisp ---------- */
  var eggSel = 0;
  screens.egg = {
    enter: function () { eggSel = 0; },
    onPress: function (a) {
      if (a === 'left' || a === 'up') { eggSel = (eggSel + 2) % 3; }
      else if (a === 'right' || a === 'down') { eggSel = (eggSel + 1) % 3; }
      else if (a === 'confirm') {
        var egg = EGGS[eggSel];
        state.party.push({ kind: 'Wildlife', name: egg.name, codex: egg.codex, type: egg.type, level: 1, hp: 12, maxHp: 12, egg: true, bond: 1 });
        syncPlayerProfile();
        setFlag('egg_picked');
        setFlag('egg_' + egg.id);
        saveGame();
        /* The picked egg hatches on the hatch screen: shake, crack,
         * flash, reveal. Then the grad arc plays as story scenes
         * (hunter exam, permit, guild registration). */
        playHatchSequence(egg.id, function () {
          startStoryScene('grad_hatch');
        });
      }
    },
    update: function () {},
    draw: function () {
      drawTopBanner(topCtx, 'PICK ONE EGG', 'The kind Wisp left a bag of 3 eggs.');
      for (var i = 0; i < 3; i++) {
        var x = 20 + i * 78;
        var egg = EGGS[i];
        if (i === eggSel) {
          topCtx.fillStyle = '#e8c838';
          topCtx.fillRect(x - 4, 56, 68, 76);
        }
        drawImageOrNull(topCtx, egg.img, x, 62, 60, 60);
        drawText(topCtx, egg.name, x + 6, 128, '#fff');
        drawText(topCtx, '#' + egg.codex, x + 6, 140, '#8888aa');
        /* B2 fix: the Puk type "Flying and Dragon" is 17 chars, about
         * 102 px at 10px monospace, wider than the 78 px egg column,
         * so it ran into the next egg's label ("Flying and Dragaas").
         * Draw the type wrapped on " and " and centered in the egg
         * column, so every line fits its column with room to spare.
         * The type words, egg names, and Codex numbers are unchanged. */
        var typeLines = String(egg.type).split(' and ');
        topCtx.font = '10px monospace';
        for (var ti = 0; ti < typeLines.length; ti++) {
          var typeW = topCtx.measureText(typeLines[ti]).width;
          drawText(topCtx, typeLines[ti], x + 30 - typeW / 2, 152 + ti * 11, '#c8c8e8', '10px monospace');
        }
      }
      clearScreen(bottomCtx, '#0a0a1e');
      drawText(bottomCtx, 'Whelp: Fire. Puk: Flying and Dragon.', 10, 20, '#fff');
      drawText(bottomCtx, 'Mandragora: Grass.', 10, 36, '#fff');
      drawText(bottomCtx, 'Left and Right to pick. A to confirm.', 10, 60, '#e8c838');
    }
  };

  /* ---------- EGG HATCH: shake, crack, flash, reveal, DS style ----------
   * Plays the grad arc hatch for the picked egg. Steps in order:
   * shake (the egg wobbles, 3 beats), crack (cracked egg art when the
   * file is present, else a procedural crack overlay on the whole egg),
   * flash (white flash, auto), reveal (hatched Wildlife FRONT sprite,
   * facing the player, name, Codex number, and type, DS style). A
   * advances shake and crack. The flash runs on its own, then the
   * reveal text plays, then the party entry flips from egg to hatched
   * and the onDone callback runs. The closing lines carry the hunter
   * exam hook, the next step in the story order after grad_hatch.
   * V9-ART: the reveal used to show the back sprite, so the player
   * looked at the Whelp's back. It now shows the front sprite at
   * every step of the reveal, including the text portrait and the
   * party entry it creates. */
  var HATCH_FLASH_MS = 450;
  var hatch = { egg: null, phase: 'shake', flashStart: 0, onDone: null };

  function drawCrackOverlay(ctx, x, y, w, h) {
    /* Procedural fallback when the cracked egg art file is missing.
     * Three jagged dark cracks across the egg area, fixed shape so it
     * looks the same every time. */
    ctx.save();
    ctx.strokeStyle = '#201018';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    var cracks = [
      [[0.50, 0.06], [0.44, 0.30], [0.55, 0.52], [0.46, 0.78], [0.54, 0.96]],
      [[0.18, 0.28], [0.38, 0.40], [0.48, 0.52], [0.34, 0.72]],
      [[0.82, 0.32], [0.60, 0.46], [0.52, 0.55], [0.70, 0.80]]
    ];
    for (var c = 0; c < cracks.length; c++) {
      ctx.beginPath();
      for (var p = 0; p < cracks[c].length; p++) {
        var px = x + cracks[c][p][0] * w;
        var py = y + cracks[c][p][1] * h;
        if (p === 0) { ctx.moveTo(px, py); }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function hatchRevealLines(egg) {
    return [
      egg.name + ' hatched! Codex ' + egg.codex + ', ' + egg.type + '.',
      'Your starter Wildlife travels with you in a carry sling.',
      'It is too young to fight yet. Train it well.',
      'Next: the hunter exam, the permit, and the road to Saltquay.'
    ];
  }

  function hatchFinish() {
    var egg = hatch.egg || EGGS[0];
    /* Flip the party entry from egg to hatched at the reveal, the
     * visible moment the Wildlife exists. */
    for (var i = state.party.length - 1; i >= 0; i--) {
      var p = state.party[i];
      if (p.name === egg.name && p.egg) {
        p.egg = false;
        p.hatched = true;
        /* V9-ART: front sprite, facing the player. backImg stays the
         * back view for any battle back-view use. */
        p.img = egg.front;
        p.backImg = egg.back;
        break;
      }
    }
    setFlag('egg_hatched');
    setFlag('hatched_' + egg.id);
    saveGame();
    var cb = hatch.onDone;
    hatch.onDone = null;
    hatch.egg = null;
    if (cb) { cb(); }
    else { setScreen('overworld'); }
  }

  function playHatchSequence(eggId, onDone) {
    var egg = (typeof eggId === 'string') ? hatchEggById(eggId) : (eggId || EGGS[0]);
    setScreen('hatch', { egg: egg, onDone: onDone });
  }

  screens.hatch = {
    enter: function (data) {
      var egg = (data && data.egg) || EGGS[0];
      if (typeof egg === 'string') { egg = hatchEggById(egg); }
      hatch.egg = egg;
      hatch.phase = 'shake';
      hatch.flashStart = 0;
      hatch.onDone = (data && data.onDone) || null;
    },
    onPress: function (a) {
      if (textBox.active) { return; }
      if (a !== 'confirm' && a !== 'start') { return; }
      if (hatch.phase === 'shake') { hatch.phase = 'crack'; }
      else if (hatch.phase === 'crack') {
        hatch.phase = 'flash';
        hatch.flashStart = Date.now();
      }
    },
    update: function (t) {
      textUpdate();
      if (hatch.phase === 'flash' && Date.now() - hatch.flashStart >= HATCH_FLASH_MS) {
        hatch.phase = 'reveal';
        var egg = hatch.egg || EGGS[0];
        /* V9-ART: front sprite as the text portrait, so the hatched
         * Wildlife faces the player while the reveal lines play. */
        showText(hatchRevealLines(egg), egg.front, function () { hatchFinish(); });
      }
    },
    draw: function (t) {
      var egg = hatch.egg || EGGS[0];
      drawTopBanner(topCtx, 'THE EGG HATCHES', 'Graduation week. The egg is warm in your hands.');
      if (hatch.phase === 'shake') {
        /* Wobble: 3 beats, side to side, DS style. */
        var wob = Math.sin((t || 0) / 90) * 4;
        var tilt = Math.sin((t || 0) / 90) * 0.08;
        topCtx.save();
        topCtx.translate(128 + wob, 96);
        topCtx.rotate(tilt);
        drawImageOrNull(topCtx, egg.img, -32, -32, 64, 64);
        topCtx.restore();
      } else if (hatch.phase === 'crack') {
        /* Cracked art when present, else the whole egg plus a
         * procedural crack overlay. */
        var crackedOk = drawImageOrNull(topCtx, egg.cracked, 96, 64, 64, 64);
        if (!crackedOk) {
          drawImageOrNull(topCtx, egg.img, 96, 64, 64, 64);
          drawCrackOverlay(topCtx, 96, 64, 64, 64);
        }
      } else if (hatch.phase === 'flash') {
        var elapsed = Date.now() - hatch.flashStart;
        var alpha = Math.max(0, 1 - elapsed / HATCH_FLASH_MS);
        drawImageOrNull(topCtx, egg.cracked, 96, 64, 64, 64);
        topCtx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(2) + ')';
        topCtx.fillRect(0, 0, W, H);
      } else if (hatch.phase === 'reveal') {
        /* Hatched Wildlife, FRONT sprite facing the player, DS style,
         * with name, Codex number, and type under it. V9-ART: this
         * used to draw egg.back, so the Whelp showed its back. */
        var frontOk = drawImageOrNull(topCtx, egg.front, 80, 36, 96, 96);
        if (!frontOk) {
          drawImageOrNull(topCtx, egg.img, 96, 64, 64, 64);
        }
        drawText(topCtx, egg.name, 10, 140, '#e8c838', '14px monospace');
        drawText(topCtx, 'Codex ' + egg.codex + '  ' + egg.type, 10, 160, '#fff');
        drawText(topCtx, 'Lv 1  Your first partner.', 10, 174, '#8888aa');
      }
      clearScreen(bottomCtx, '#0a0a1e');
      if (hatch.phase === 'shake') {
        drawText(bottomCtx, 'The egg shakes. Once. Twice. Three times.', 10, 20, '#fff');
        drawText(bottomCtx, 'A: keep watching.', 10, 60, '#e8c838');
      } else if (hatch.phase === 'crack') {
        drawText(bottomCtx, 'Crack! Light spills out through the shell.', 10, 20, '#fff');
        drawText(bottomCtx, 'A: keep watching.', 10, 60, '#e8c838');
      } else if (hatch.phase === 'flash') {
        drawText(bottomCtx, 'A flash of white light fills the room.', 10, 20, '#fff');
      }
      drawTextBox(bottomCtx);
    }
  };

  /* ---------- OVERWORLD ---------- */
  var MAPS = {
    Gatehollow: [
      '################',
      '#..............#',
      '#..,,....,,....#',
      '#..,,....,,..N.#',
      '#..............#',
      '#....####......#',
      '#....#..#...,,.#',
      '#....#..#...,,.#',
      '#....####......#',
      '#..,,..........#',
      '#..,,....,,....#',
      '################'
    ],
    Dreamrest: [
      '################',
      '#..............#',
      '#..~~....~~....#',
      '#..~~....~~..N.#',
      '#..............#',
      '#....####......#',
      '#....#..#......#',
      '#....#..#...~~.#',
      '#....####...~~.#',
      '#..............#',
      '#..~~....~~....#',
      '################'
    ],
    Saltquay: [
      '################',
      '#..............#',
      '#..,,....,,....#',
      '#..,,....,,..N.#',
      '#......~~......#',
      '#....######....#',
      '#....#....#....#',
      '#....#....#..N.#',
      '#....######....#',
      '#..,,..........#',
      '#..,,....,,....#',
      '################'
    ]
  };
  var player = { tx: 2, ty: 2, px: 32, py: 32, dir: 'down', moving: false, step: 0 };
  var overworldReturn = null;

  function mapAt(map, tx, ty) {
    if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) { return '#'; }
    return map[ty][tx];
  }
  function isWalkable(map, tx, ty) {
    var c = mapAt(map, tx, ty);
    return c !== '#' && c !== '~';
  }
  function currentMap() {
    return MAPS[state.location] || MAPS.Gatehollow;
  }

  screens.overworld = {
    enter: function (data) {
      overworldReturn = (data && data.returnTo) || null;
      player.tx = 2; player.ty = 2;
      player.px = player.tx * 16; player.py = player.ty * 16;
      player.dir = 'down';
    },
    onPress: function (a) {
      if (textBox.active) { return; }
      var map = currentMap();
      var dx = 0, dy = 0;
      if (a === 'up') { dy = -1; player.dir = 'up'; }
      else if (a === 'down') { dy = 1; player.dir = 'down'; }
      else if (a === 'left') { dx = -1; player.dir = 'left'; }
      else if (a === 'right') { dx = 1; player.dir = 'right'; }
      else if (a === 'menu') { setScreen('menu'); return; }
      else if (a === 'confirm') {
        var fx = player.tx, fy = player.ty;
        if (player.dir === 'up') { fy--; }
        if (player.dir === 'down') { fy++; }
        if (player.dir === 'left') { fx--; }
        if (player.dir === 'right') { fx++; }
        var cell = mapAt(map, fx, fy);
        if (cell === 'N') {
          showText(['Traveler, the harbor road leads to Saltquay.', 'Maren Saltwright waits there. Train first.'], 'assets/p_warden.png');
        } else if (cell === ',') {
          showText(['Tall grass rustles. Wildlife moves in the field, visible, no surprise fights.'], null);
        } else if (cell === '~') {
          showText(['Cold water. No crossing here on foot.'], null);
        } else {
          showText([state.location + '. The road is open. Press X for the menu.'], null);
        }
        return;
      } else if (a === 'cancel') { return; }
      if (dx || dy) {
        var nx = player.tx + dx, ny = player.ty + dy;
        if (isWalkable(map, nx, ny)) {
          player.tx = nx; player.ty = ny;
          player.step++;
          var stepped = mapAt(map, nx, ny);
          if (stepped === ',' && Math.random() < 0.12) {
            showText(['Wildlife stirs in the tall grass nearby.'], null);
          }
        }
      }
    },
    update: function () {
      textUpdate();
      /* Smooth step toward the tile target. */
      var txp = player.tx * 16, typ = player.ty * 16;
      if (player.px < txp) { player.px = Math.min(txp, player.px + 2); }
      if (player.px > txp) { player.px = Math.max(txp, player.px - 2); }
      if (player.py < typ) { player.py = Math.min(typ, player.py + 2); }
      if (player.py > typ) { player.py = Math.max(typ, player.py - 2); }
    },
    draw: function () {
      var map = currentMap();
      clearScreen(topCtx, '#3a7a3a');
      var imgOk = drawImageOrNull(topCtx, 'assets/map_' + state.location.toLowerCase() + '.png', 0, 0, W, H);
      if (!imgOk) {
        for (var ty = 0; ty < 12; ty++) {
          for (var tx = 0; tx < 16; tx++) {
            var c = mapAt(map, tx, ty);
            if (c === '#') { topCtx.fillStyle = '#5a4a3a'; }
            else if (c === ',') { topCtx.fillStyle = '#2a6a2a'; }
            else if (c === '~') { topCtx.fillStyle = '#3a6ac8'; }
            else { topCtx.fillStyle = '#4a9a4a'; }
            topCtx.fillRect(tx * 16, ty * 16, 16, 16);
            if (c === 'N') {
              topCtx.fillStyle = '#e8c838';
              topCtx.fillRect(tx * 16 + 4, ty * 16 + 2, 8, 12);
            }
          }
        }
      }
      /* Player: try the overworld sheet, else a chibi figure. */
      var sprite = 'assets/ow_trainer_' + (state.trainer.sex || 'boy').toLowerCase() + '_' + (state.trainer.race || 'Solar').toLowerCase() + '.png';
      var drawn = drawImageOrNull(topCtx, sprite, player.px, player.py - 4, 16, 20);
      if (!drawn) {
        var bob = (player.px + player.py) % 32 === 0 ? 0 : 1;
        topCtx.fillStyle = '#101030';
        topCtx.fillRect(player.px + 3, player.py + 14, 10, 3); /* shadow */
        topCtx.fillStyle = state.trainer.race === 'Polar' ? '#c8e8f8' : '#e8a860';
        topCtx.fillRect(player.px + 4, player.py + 2 - bob, 8, 7); /* head */
        topCtx.fillStyle = '#2848c8';
        topCtx.fillRect(player.px + 3, player.py + 9 - bob, 10, 7); /* body */
        topCtx.fillStyle = '#101030';
        topCtx.fillRect(player.px + 5, player.py + 4 - bob, 2, 2);
        topCtx.fillRect(player.px + 9, player.py + 4 - bob, 2, 2);
      }
      var tint = timeTint();
      if (tint) { topCtx.fillStyle = tint; topCtx.fillRect(0, 0, W, H); }
      drawText(topCtx, state.location, 6, 4, '#fff', '10px monospace');
      /* Bottom screen: Poketch style watch panel. */
      clearScreen(bottomCtx, '#0a0a1e');
      drawBox(bottomCtx, 6, 8, W - 12, 52, '#c8e8c8', '#101030');
      drawText(bottomCtx, state.trainer.name || 'Trainer', 12, 14, '#101030', '11px monospace');
      drawText(bottomCtx, 'Lv ' + state.trainer.level + '  ' + state.trainer.klass, 12, 30, '#101030');
      drawText(bottomCtx, 'Cr ' + state.wallet.cr + ' / ' + state.wallet.cap, 12, 44, '#101030');
      drawText(bottomCtx, 'D-pad: move  A: talk  X: menu', 10, 72, '#c8c8e8');
      drawText(bottomCtx, 'Party: ' + state.party.length + '  Location: ' + state.location, 10, 88, '#8888aa');
      drawText(bottomCtx, 'Monster Bank: your stored Wildlife.', 10, 104, '#8888aa');
      drawTextBox(bottomCtx);
    }
  };

  /* COLD OPEN PATCH: playable scripted loss battle. New Game flow
   * is now intro text, cold open battle, farewell scene, creation.
   * The battle runs before creation, so there is no trainer name,
   * no egg and no Bondkin yet. The player fights as Defender, one
   * of the defense line, Lv 5, against Maren Saltwright Lv 50 with
   * 999 HP. The battle module ends it in a scripted loss on Maren
   * third attack, whatever the player does, and reports
   * result.scriptedLoss true. Any outcome here still goes to the
   * farewell scene: the loss is scripted, never a real defeat. */
  /* MERGE (C1 + A6): startColdOpenBattle takes the optional onDone
   * callback A6's intro beat 2 passes (introStartFarewell). When the
   * battle result carries scriptedLoss true, the battle calls
   * FED13.startColdOpenFarewell(), which re-enters the intro at the
   * farewell beat. Otherwise the callback runs, or the C1 cutscene
   * farewell plays as a fallback. */
  function startColdOpenBattle(onDone) {
    setFlag('cold_open_battle');
    var foe = {
      name: 'Maren',
      displayName: 'Maren Saltwright',
      trainerName: 'Maren Saltwright',
      level: 50,
      hp: 999,
      maxHp: 999,
      isWild: false,
      scriptedLoss: { turn: 3 }
    };
    startBattle1v1(foe, function (result) {
      if (result && result.scriptedLoss) {
        setFlag('cold_open_lost');
        if (window.FED13 && typeof window.FED13.startColdOpenFarewell === 'function') {
          window.FED13.startColdOpenFarewell();
          return;
        }
      }
      if (typeof onDone === 'function') { onDone(result); return; }
      playColdOpenFarewell();
    }, {
      noOverworldReturn: true,
      environment: 'grass',
      playerName: 'Defender',
      playerWildlife: { species: 'Defender', level: 5, hp: 34, maxHp: 34, moves: ['Tackle', 'Ember'] },
      bondkin: [],
      scriptedLoss: { turn: 3 }
    });
  }

  /* COLD OPEN PATCH: farewell scene cold_open_farewell from story.js,
   * read live so the story file stays the source of truth. Falls back
   * to the same lines written out here if the story module is missing.
   * After the farewell, creation follows, one year later. */
  function playColdOpenFarewell() {
    setFlag('cold_open_lost');
    var lines = [
      'Turn 3. Maren Saltwright does not even look tired. The defense line is broken. You are the last one standing, and you cannot stand much longer.',
      'Maren Saltwright: Down. All of you, down. I did not even have to try.',
      'Maren Saltwright: I had fun, little defenders. Real fun. I will return again in one year.',
      'Maren Saltwright: But this time I will not give you a second chance at defeating me. Train. Pray. It will not matter.',
      'Maren Saltwright is gone. The sky closes behind him like a door.',
      'One year later.',
      'One year of waiting. One year of training. One year of remembering his laugh. Now your story begins.'
    ];
    var scene = null;
    try {
      if (window.FED13 && window.FED13.story && typeof window.FED13.story.getScene === 'function') {
        scene = window.FED13.story.getScene('cold_open_farewell');
      }
    } catch (e) { scene = null; }
    if (scene && scene.lines && scene.lines.length) {
      lines = scene.lines.map(function (ln) {
        var who = ln.speakerName ? ln.speakerName + ': ' : '';
        return who + (ln.text || '');
      });
    }
    playCutscene('THE COLD OPEN: I WILL RETURN IN ONE YEAR', lines, 'assets/p_maren.png', null, function () {
      setScreen('creation');
    });
  }

  /* ---------- BATTLE 1v1 ---------- */
  var battle = null;
  function startBattle1v1(foe, onDone, opts) {
    if (window.FED13 && window.FED13.battle1v1 && typeof window.FED13.battle1v1.startBattle === 'function') {
      /* COLD OPEN PATCH: opts lets the cold open override the player
       * side (Defender, no Bondkin yet) and pass the scripted loss
       * through. Wild battles pass no opts and behave as before. */
      opts = opts || {};
      var lead0 = (opts.playerWildlife) || state.party[0] || { name: 'Whelp', level: 1, hp: 12, maxHp: 12 };
      var known = ['Whelp', 'Puk', 'Mandragora', 'Ghoul', 'Slime', 'Goblin', 'Maren', 'Defender'];
      var foeSpecies = (foe && known.indexOf(foe.name) !== -1) ? foe.name : 'Ghoul';
      var leadSpecies = (lead0 && known.indexOf(lead0.name) !== -1) ? lead0.name : ((lead0 && lead0.species && known.indexOf(lead0.species) !== -1) ? lead0.species : 'Whelp');
      var bondkin0 = null;
      for (var bi = 0; bi < state.party.length; bi++) {
        if (state.party[bi] && String(state.party[bi].kind || '').toLowerCase() === 'bondkin') { bondkin0 = state.party[bi]; }
      }
      var bondkinList = (opts.bondkin !== undefined) ? opts.bondkin
        : (bondkin0 ? [{ name: bondkin0.name, bloodline: bondkin0.bloodline || state.trainer.bloodline || 'Elf', level: bondkin0.level || 5 }] : [{ name: 'Starwarden', bloodline: 'Elf', level: 5 }]);
      var cfg = {
        environment: opts.environment || 'grass',
        scriptedLoss: opts.scriptedLoss || (foe && foe.scriptedLoss) || null,
        /* FAST FORWARD: forward the reset hook so Trial, Elite Four,
         * Champion, and Crown Trial callers can force 1x through
         * opts.resetSpeed or opts.battleKind. Wild battles pass
         * neither and keep the remembered speed. */
        resetSpeed: !!opts.resetSpeed,
        battleKind: opts.battleKind || null,
        player: {
          name: opts.playerName || state.trainer.name || 'Trainer',
          gender: (state.trainer.sex === 'girl') ? 'girl' : 'boy',
          wildlife: { species: leadSpecies, level: (lead0 && lead0.level) || 5, hp: lead0.hp, maxHp: lead0.maxHp, moves: lead0.moves },
          bondkin: bondkinList,
          bag: { snareOrb: state.bag.snareOrbs || 5, lurefruit: 2, tonic: state.bag.potions || 3 }
        },
        foe: { species: foeSpecies, displayName: (foe && foe.displayName) || null, trainerName: (foe && foe.trainerName) || null, level: (foe && foe.level) || 5, hp: foe && foe.hp, maxHp: foe && foe.maxHp, moves: foe && foe.moves, isWild: (foe && typeof foe.isWild === 'boolean') ? foe.isWild : true }
      };
      /* FIX BATCH (battle1v1 canvas): the battle now draws on the same
       * top canvas the overworld loop draws on, so stop the overworld
       * first, the same way startGridBattle does. The end callback
       * below returns to the overworld through setScreen, which
       * re-inits and restarts it. */
      try { if (window.FED13.overworld && typeof window.FED13.overworld.stop === 'function') { window.FED13.overworld.stop(); } } catch (e) {}
      delegatedOverworldStarted = false;
      delegatedScreen = 'battle1v1';
      currentScreen = 'battle1v1';
      window.FED13.battle1v1.startBattle(cfg, function (result) {
        delegatedScreen = null;
        if (typeof onDone === 'function') { try { onDone(result); } catch (e) {} }
        /* COLD OPEN PATCH: the cold open onDone plays the farewell
         * scene, which sets its own screen. Do not return to the
         * overworld after it. */
        if (!opts.noOverworldReturn) { setScreen('overworld'); }
      });
      return;
    }
    /* Legacy 1v1 fallback sprites rewired 2026-11-24 to existing front sprites (the old fallback names had no files). */
    var lead = state.party[0] || { name: 'Whelp', level: 1, hp: 12, maxHp: 12 };
    battle = {
      foe: { name: foe.name, level: foe.level || 5, hp: foe.hp || 20, maxHp: foe.maxHp || 20, img: foe.img || 'assets/b_ghoul_front.png' },
      me: { name: lead.name, level: lead.level || 1, hp: lead.hp || 12, maxHp: lead.maxHp || 12, img: lead.img || 'assets/b_whelp_front.png' },
      phase: 'menu', sel: 0, moveSel: 0, onDone: onDone || null,
      moves: [
        { name: 'Tackle', type: 'Normal', pp: 20 },
        { name: 'Ember', type: 'Fire', pp: 15 },
        { name: 'Guard', type: 'Normal', pp: 10 },
        { name: 'Focus', type: 'Normal', pp: 10 }
      ]
    };
    setScreen('battle1v1');
  }
  function battleEnd(won) {
    var cb = battle && battle.onDone;
    showText([won ? 'You won the 1v1 battle.' : 'Your Wildlife fainted. Back to Saltquay.'], null, function () {
      battle = null;
      if (cb) { cb(won); }
      setScreen('overworld');
    });
  }
  function battlePlayerMove(move) {
    var dmg = 4 + Math.floor(Math.random() * 6);
    battle.foe.hp = Math.max(0, battle.foe.hp - dmg);
    battle.phase = 'text';
    showText([state.party[0].name + ' used ' + move.name + '. It did ' + dmg + ' damage.'], null, function () {
      if (battle.foe.hp <= 0) { battleEnd(true); return; }
      var foeDmg = 3 + Math.floor(Math.random() * 5);
      battle.me.hp = Math.max(0, battle.me.hp - foeDmg);
      showText(['Foe ' + battle.foe.name + ' struck back for ' + foeDmg + ' damage.'], null, function () {
        if (battle.me.hp <= 0) { battleEnd(false); return; }
        battle.phase = 'menu';
      });
    });
  }

  screens.battle1v1 = {
    enter: function () { if (battle) { battle.phase = 'menu'; battle.sel = 0; } },
    onPress: function (a) {
      if (!battle || battle.phase === 'text') { return; }
      if (battle.phase === 'menu') {
        var items = ['FIGHT', 'BAG', 'BONDKIN', 'RUN'];
        if (a === 'left') { battle.sel = (battle.sel + 3) % 4; }
        else if (a === 'right') { battle.sel = (battle.sel + 1) % 4; }
        else if (a === 'up' || a === 'down') { battle.sel = (battle.sel + 2) % 4; }
        else if (a === 'confirm') {
          if (battle.sel === 0) { battle.phase = 'moves'; battle.moveSel = 0; }
          else if (battle.sel === 1) { showText(['Bag: Snare Orbs ' + state.bag.snareOrbs + ', Potions ' + state.bag.potions + '.'], null); }
          else if (battle.sel === 2) { setScreen('party', { returnTo: 'battle1v1' }); }
          else if (battle.sel === 3) {
            showText(['You ran from the battle.'], null, function () { battle = null; setScreen('overworld'); });
          }
        }
      } else if (battle.phase === 'moves') {
        if (a === 'up') { battle.moveSel = (battle.moveSel + 3) % 4; }
        else if (a === 'down') { battle.moveSel = (battle.moveSel + 1) % 4; }
        else if (a === 'confirm') { battlePlayerMove(battle.moves[battle.moveSel]); }
        else if (a === 'cancel') { battle.phase = 'menu'; }
      }
    },
    update: function () { textUpdate(); },
    draw: function () {
      if (!battle) { return; }
      clearScreen(topCtx, '#7ac87a');
      drawImageOrNull(topCtx, 'assets/bg_grass.png', 0, 0, W, H);
      /* Foe top right, player bottom left. */
      var foeOk = drawImageOrNull(topCtx, battle.foe.img, 168, 36, 64, 64);
      if (!foeOk) { topCtx.fillStyle = '#8a3a3a'; topCtx.fillRect(172, 40, 56, 56); }
      var meOk = drawImageOrNull(topCtx, battle.me.img, 28, 112, 64, 64);
      if (!meOk) { topCtx.fillStyle = '#3a6ac8'; topCtx.fillRect(32, 116, 56, 56); }
      drawBox(topCtx, 6, 6, 110, 34, '#fff', '#101030');
      drawText(topCtx, battle.foe.name.toUpperCase(), 10, 10, '#101030');
      drawText(topCtx, 'Lv ' + battle.foe.level, 10, 24, '#101030');
      drawBox(topCtx, 140, 150, 110, 36, '#fff', '#101030');
      drawText(topCtx, battle.me.name.toUpperCase(), 144, 154, '#101030');
      drawText(topCtx, 'Lv ' + battle.me.level, 144, 166, '#101030');
      drawHpBar(topCtx, 144, 178, 100, battle.me.hp, battle.me.maxHp);
      drawText(topCtx, battle.me.hp + ' / ' + battle.me.maxHp, 200, 166, '#101030', '8px monospace');
      clearScreen(bottomCtx, '#0a0a1e');
      if (battle.phase === 'moves') {
        drawText(bottomCtx, 'Pick a move. B goes back.', 10, 10, '#e8c838');
        for (var i = 0; i < 4; i++) {
          var m = battle.moves[i];
          var y = 34 + i * 16;
          if (i === battle.moveSel) {
            bottomCtx.fillStyle = '#e8c838';
            bottomCtx.fillRect(6, y - 2, W - 12, 14);
            drawText(bottomCtx, '> ' + m.name + '  ' + m.type + '  PP ' + m.pp, 10, y, '#101030');
          } else {
            drawText(bottomCtx, '  ' + m.name + '  ' + m.type + '  PP ' + m.pp, 10, y, '#fff');
          }
        }
      } else {
        drawText(bottomCtx, 'What will ' + battle.me.name + ' do?', 10, 10, '#fff', '11px monospace');
        var items = ['FIGHT', 'BAG', 'BONDKIN', 'RUN'];
        for (var j = 0; j < 4; j++) {
          var bx = 10 + (j % 2) * 124, by = 40 + Math.floor(j / 2) * 40;
          if (j === battle.sel) {
            bottomCtx.fillStyle = '#e8c838';
            bottomCtx.fillRect(bx, by, 116, 32);
            drawText(bottomCtx, items[j], bx + 10, by + 10, '#101030', '12px monospace');
          } else {
            drawBox(bottomCtx, bx, by, 116, 32, '#fff', '#101030');
            drawText(bottomCtx, items[j], bx + 10, by + 10, '#101030', '12px monospace');
          }
        }
      }
      drawTextBox(bottomCtx);
    }
  };

  /* ---------- GRID BATTLE (FFTA2 style) ---------- */
  var grid = null;
  function startGridBattle(units, onDone, opts) {
    if (window.FED13 && window.FED13.grid && typeof window.FED13.grid.startGridBattle === 'function') {
      opts = opts || {};
      var bloodId = (state.trainer.bloodline || 'Elf').toLowerCase();
      var arcName = null;
      try { if (window.FED13.story && window.FED13.story.namesDraft && window.FED13.story.namesDraft.arcBondkin) { arcName = window.FED13.story.namesDraft.arcBondkin[bloodId]; } } catch (e) {}
      var starterId = 'whelp';
      if (state.party[0] && state.party[0].name) { starterId = String(state.party[0].name).toLowerCase(); }
      if (['whelp', 'puk', 'mandragora'].indexOf(starterId) === -1) { starterId = 'whelp'; }
      var gcfg = { bloodline: bloodId, starter: starterId, bondkinName: arcName || undefined, playerName: state.trainer.name || 'Trainer', map: opts.map || 'grass', firstGridBattle: true };
      /* TRIAL BATTLE 1 FIX: the trial is a grid battle with its own
       * roster (grid.js makeTrialBattleRoster), not the first grid
       * battle, so it skips the first grid script and asking scene. */
      if (opts.trialBattle) {
        gcfg.trialBattle = true;
        gcfg.firstGridBattle = false;
      }
      /* FAST FORWARD: forward the reset hook so Trial, Elite Four,
       * Champion, and Crown Trial callers can force 1x through
       * opts.resetSpeed or opts.battleKind. Trial Battle 1 is
       * already detected by grid.js through trialBattle. */
      if (opts.resetSpeed) { gcfg.resetSpeed = true; }
      if (opts.battleKind) { gcfg.battleKind = opts.battleKind; }
      if (units && units.length) {
        gcfg.units = units.map(function (u) {
          return { name: u.name, kind: (u.side === 'foe') ? 'Wildlife' : 'Bondkin', side: (u.side === 'foe') ? 'enemy' : 'player', x: u.x, y: u.y, hp: u.hp || 30, maxHp: u.maxHp || u.hp || 30, sheet: null };
        });
        gcfg.firstGridBattle = false;
      }
      delegatedScreen = 'grid';
      currentScreen = 'grid';
      try { if (window.FED13.overworld && typeof window.FED13.overworld.stop === 'function') { window.FED13.overworld.stop(); } } catch (e) {}
      delegatedOverworldStarted = false;
      window.FED13.grid.startGridBattle(gcfg, function (result) {
        delegatedScreen = null;
        /* First grid win plus a yes in the asking scene: the arc
         * Bondkin joins the engine party, so the party screen shows
         * one Wildlife and one Bondkin from here. A no answer leaves
         * joined false and nothing is added. Record the answer on the
         * shared state first, so the story asking scene hook can
         * respect it and never double add. TRIAL BATTLE 1 FIX: this
         * block runs only for the first grid battle. The trial runs
         * after the Bondkin already joined and plays no asking scene,
         * so its joined false must never clobber arcBondkinJoined. */
        if (gcfg.firstGridBattle) {
          state.flags = state.flags || {};
          state.flags.arcBondkinAsked = true;
          state.flags.arcBondkinJoined = !!(result && result.victory && result.joined);
          if (result && result.victory && result.joined) { addArcBondkinToParty(); }
        }
        var fromChain = storyChainBattleActive;
        storyChainBattleActive = false;
        if (typeof onDone === 'function') { try { onDone(result); } catch (e) {} }
        /* FIX BATCH B1: a battle launched from the story chain must
         * not return to the overworld here; its onDone owns the next
         * screen (the chain continues, or the dispatcher ends it). */
        if (!fromChain) { setScreen('overworld'); }
      });
      return;
    }
    /* Legacy grid fallback roster rewired 2026-11-24 to existing grid sheets (the old fallback names had no files). No trainer grid sheet exists. */
    grid = {
      size: 8,
      units: units || [
        { name: state.trainer.name || 'Trainer', side: 'me', x: 1, y: 6, hp: 20, maxHp: 20, img: 'assets/g_elf.png' },
        { name: (state.party[0] && state.party[0].name) || 'Whelp', side: 'me', x: 2, y: 6, hp: 12, maxHp: 12, img: 'assets/g_elf.png' },
        { name: 'Foe', side: 'foe', x: 5, y: 1, hp: 16, maxHp: 16, img: 'assets/g_maren.png' }
      ],
      cursor: { x: 1, y: 6 },
      sel: null, phase: 'pick', menuSel: 0,
      onDone: onDone || null, turn: 0
    };
    setScreen('grid');
  }
  function gridUnitAt(x, y) {
    for (var i = 0; i < grid.units.length; i++) {
      if (grid.units[i].x === x && grid.units[i].y === y && grid.units[i].hp > 0) { return grid.units[i]; }
    }
    return null;
  }
  screens.grid = {
    enter: function () {},
    onPress: function (a) {
      if (!grid || textBox.active) { return; }
      if (grid.phase === 'menu') {
        var items = ['Move', 'Action', 'Wait'];
        if (a === 'up') { grid.menuSel = (grid.menuSel + 2) % 3; }
        else if (a === 'down') { grid.menuSel = (grid.menuSel + 1) % 3; }
        else if (a === 'confirm') {
          if (grid.menuSel === 2) {
            showText([grid.sel.name + ' waits. The turn comes back sooner.'], null, function () { grid.phase = 'pick'; grid.sel = null; });
          } else if (grid.menuSel === 1) {
            var target = null;
            for (var i = 0; i < grid.units.length; i++) {
              var u = grid.units[i];
              if (u.side === 'foe' && u.hp > 0 && Math.abs(u.x - grid.sel.x) + Math.abs(u.y - grid.sel.y) === 1) { target = u; }
            }
            if (target) {
              var dmg = 5 + Math.floor(Math.random() * 4);
              target.hp = Math.max(0, target.hp - dmg);
              showText([grid.sel.name + ' strikes ' + target.name + ' for ' + dmg + ' damage.'], null, function () {
                grid.phase = 'pick'; grid.sel = null;
                if (grid.units.filter(function (x) { return x.side === 'foe' && x.hp > 0; }).length === 0) {
                  var cb = grid.onDone;
                  showText(['Grid battle won.'], null, function () { grid = null; if (cb) { cb(true); } setScreen('overworld'); });
                }
              });
            } else {
              showText(['No foe next to ' + grid.sel.name + '. Move first, then act.'], null, function () { grid.phase = 'menu'; });
            }
          } else { grid.phase = 'move'; }
        }
        else if (a === 'cancel') { grid.phase = 'pick'; grid.sel = null; }
        return;
      }
      if (a === 'up') { grid.cursor.y = Math.max(0, grid.cursor.y - 1); }
      else if (a === 'down') { grid.cursor.y = Math.min(7, grid.cursor.y + 1); }
      else if (a === 'left') { grid.cursor.x = Math.max(0, grid.cursor.x - 1); }
      else if (a === 'right') { grid.cursor.x = Math.min(7, grid.cursor.x + 1); }
      else if (a === 'cancel') {
        if (grid.phase === 'move') { grid.phase = 'menu'; }
        else { grid.phase = 'pick'; grid.sel = null; }
      }
      else if (a === 'confirm') {
        var u = gridUnitAt(grid.cursor.x, grid.cursor.y);
        if (grid.phase === 'pick') {
          if (u && u.side === 'me') { grid.sel = u; grid.phase = 'menu'; grid.menuSel = 0; }
          else if (u) { showText([u.name + ', foe, HP ' + u.hp + ' / ' + u.maxHp + '.'], null); }
        } else if (grid.phase === 'move') {
          var dist = Math.abs(grid.cursor.x - grid.sel.x) + Math.abs(grid.cursor.y - grid.sel.y);
          if (dist <= 3 && !gridUnitAt(grid.cursor.x, grid.cursor.y)) {
            grid.sel.x = grid.cursor.x; grid.sel.y = grid.cursor.y;
            grid.phase = 'menu';
          } else {
            showText(['Too far, or the tile is taken. Move range is 3.'], null, function () { grid.phase = 'move'; });
          }
        }
      }
    },
    update: function () { textUpdate(); },
    draw: function () {
      if (!grid) { return; }
      clearScreen(topCtx, '#2a4a2a');
      drawImageOrNull(topCtx, 'assets/grid_harbor.png', 0, 0, W, H); /* Saltquay is a harbor town; using the harbor map (the old name had no file). */
      var ox = 48, oy = 8, ts = 22;
      for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
          var px = ox + x * ts, py = oy + y * ts;
          topCtx.fillStyle = (x + y) % 2 === 0 ? '#5a9a4a' : '#4a8a3a';
          topCtx.fillRect(px, py, ts - 1, ts - 1);
          if (grid.sel && Math.abs(x - grid.sel.x) + Math.abs(y - grid.sel.y) <= 3 && grid.phase === 'move') {
            topCtx.fillStyle = 'rgba(60,120,255,0.55)';
            topCtx.fillRect(px, py, ts - 1, ts - 1);
          }
          if (grid.cursor.x === x && grid.cursor.y === y) {
            topCtx.strokeStyle = '#fff';
            topCtx.lineWidth = 2;
            topCtx.strokeRect(px + 1, py + 1, ts - 3, ts - 3);
          }
        }
      }
      for (var i = 0; i < grid.units.length; i++) {
        var unit = grid.units[i];
        if (unit.hp <= 0) { continue; }
        var ux = ox + unit.x * ts, uy = oy + unit.y * ts;
        var ok = drawImageOrNull(topCtx, unit.img, ux + 2, uy + 1, 18, 18);
        if (!ok) {
          topCtx.fillStyle = unit.side === 'me' ? '#2848c8' : '#c82828';
          topCtx.fillRect(ux + 3, uy + 3, 16, 16);
          drawText(topCtx, unit.name.charAt(0), ux + 9, uy + 7, '#fff');
        }
      }
      drawText(topCtx, 'Turn order: speed decides. No fixed sides.', 6, 4, '#fff', '8px monospace');
      clearScreen(bottomCtx, '#0a0a1e');
      if (grid.phase === 'menu' && grid.sel) {
        drawText(bottomCtx, grid.sel.name + '  HP ' + grid.sel.hp + ' / ' + grid.sel.maxHp, 10, 10, '#fff');
        var items = ['Move', 'Action', 'Wait'];
        for (var j = 0; j < 3; j++) {
          var by = 36 + j * 18;
          if (j === grid.menuSel) {
            bottomCtx.fillStyle = '#e8c838';
            bottomCtx.fillRect(6, by - 2, 120, 16);
            drawText(bottomCtx, '> ' + items[j], 10, by, '#101030');
          } else { drawText(bottomCtx, '  ' + items[j], 10, by, '#fff'); }
        }
      } else {
        drawText(bottomCtx, 'D-pad: cursor  A: pick  B: cancel', 10, 10, '#fff');
        drawText(bottomCtx, 'Blue tiles: move range. Red: target.', 10, 26, '#8888aa');
        var cur = gridUnitAt(grid.cursor.x, grid.cursor.y);
        if (cur) { drawText(bottomCtx, cur.name + ' HP ' + cur.hp + ' / ' + cur.maxHp, 10, 44, '#e8c838'); }
      }
      drawTextBox(bottomCtx);
    }
  };

  /* ---------- PARTY: deploy 6, bond meter, arc Bondkin join ---------- */
  /* Deploy 6: the party holds up to 6. Early in the game the trainer
   * has one Wildlife and one Bondkin, after the first grid battle
   * asking scene in Saltquay. Slots 3 to 6 stay empty until filled.
   * Bond is 1 to 5, shown as filled boxes. A new partner starts at
   * bond 1. No bond gain rule exists yet, so the meter is display
   * only for now. It is stored on the party entry for later battles
   * to raise. Job and HP below mirror grid.js BLOODLINES, the same
   * table the first grid battle builds its Bondkin from. The Elderkin
   * portrait is p_bondkin_elderkin.png and the Elderkin arc Bondkin
   * is Halden (DRAFT FOR GIT-FED REVISION, renamed from Bram to end
   * the collision with Guildmaster Bram Hollis). */
  var PARTY_SIZE = 6;
  var PARTY_BOND_MAX = 5;
  var BONDKIN_PARTY = {
    elf: { job: 'Starwarden', hp: 34, portrait: 'assets/p_bondkin_elf.png', sprite: 'assets/g_elf.png' },
    puffkin: { job: 'Tinker', hp: 38, portrait: 'assets/p_bondkin_puffkin.png', sprite: 'assets/g_puffkin.png' },
    elderkin: { job: 'Sage', hp: 42, portrait: 'assets/p_bondkin_elderkin.png', sprite: 'assets/g_elderkin.png' },
    harefolk: { job: 'Scout', hp: 30, portrait: 'assets/p_bondkin_harefolk.png', sprite: 'assets/g_harefolk.png' },
    drakescale: { job: 'Warrior', hp: 40, portrait: 'assets/p_bondkin_drakescale.png', sprite: 'assets/g_drakescale.png' }
  };
  var WILDLIFE_PARTY = {
    whelp: { sprite: 'assets/b_whelp_front.png', portrait: 'assets/p_whelp.png', egg: 'assets/egg9_whelp.png' },
    puk: { sprite: 'assets/b_puk_front.png', portrait: 'assets/p_puk.png', egg: 'assets/egg9_puk.png' },
    mandragora: { sprite: 'assets/b_mandragora_front.png', portrait: 'assets/p_mandragora.png', egg: 'assets/egg9_mandragora.png' }
  };
  var ARC_BONDKIN_FALLBACK_NAMES = { elf: 'Aelindra', puffkin: 'Pip', elderkin: 'Halden', harefolk: 'Marnie', drakescale: 'Cinder' };
  function clampBond(v) {
    var n = parseInt(v, 10);
    if (isNaN(n)) { return 1; }
    if (n < 1) { return 1; }
    if (n > PARTY_BOND_MAX) { return PARTY_BOND_MAX; }
    return n;
  }
  function bloodlineByName(name) {
    var want = String(name || '').toLowerCase();
    for (var i = 0; i < BLOODLINES.length; i++) {
      if (BLOODLINES[i].name.toLowerCase() === want || BLOODLINES[i].id === want) { return BLOODLINES[i]; }
    }
    return BLOODLINES[0];
  }
  function eggByName(name) {
    var want = String(name || '').toLowerCase();
    for (var i = 0; i < EGGS.length; i++) {
      if (EGGS[i].name.toLowerCase() === want || EGGS[i].id === want) { return EGGS[i]; }
    }
    return null;
  }
  function arcBondkinName(bloodId) {
    try {
      if (window.FED13 && window.FED13.story && window.FED13.story.namesDraft && window.FED13.story.namesDraft.arcBondkin) {
        var n = window.FED13.story.namesDraft.arcBondkin[bloodId];
        if (n) { return n; }
      }
    } catch (e) {}
    return ARC_BONDKIN_FALLBACK_NAMES[bloodId] || ARC_BONDKIN_FALLBACK_NAMES.elf;
  }
  /* One normalized view per deploy slot. Accepts both party shapes in
   * the build: the engine shape (kind 'Wildlife' or 'Bondkin') and the
   * story hook shape (kind 'wildlife' or 'bondkin', no level or HP).
   * Missing fields fall back to the story facts, never to a throw. */
  function normalizePartyMember(p) {
    if (!p) { return null; }
    var kind = String(p.kind || '').toLowerCase() === 'bondkin' ? 'Bondkin' : 'Wildlife';
    var bond = clampBond(p.bond);
    if (kind === 'Bondkin') {
      var blood = bloodlineByName(p.bloodline || p.bloodlineId || state.trainer.bloodline || 'Elf');
      var table = BONDKIN_PARTY[blood.id] || BONDKIN_PARTY.elf;
      var hp = p.maxHp || p.hp || table.hp;
      return {
        kind: 'Bondkin', name: p.name || arcBondkinName(blood.id),
        bloodline: blood.name, bloodlineId: blood.id,
        job: p.job || table.job, totem: p.totem || blood.totem,
        level: p.level || 5, hp: p.hp || hp, maxHp: hp,
        type: null, codex: null, bond: bond,
        portrait: p.portrait || table.portrait, sprite: p.sprite || table.sprite
      };
    }
    var egg = eggByName(p.name || p.id);
    var art = WILDLIFE_PARTY[String(p.id || p.name || '').toLowerCase()] || (egg ? WILDLIFE_PARTY[egg.id] : null) || WILDLIFE_PARTY.whelp;
    var maxHp = p.maxHp || p.hp || 12;
    return {
      kind: 'Wildlife', name: p.name || (egg ? egg.name : 'Whelp'),
      bloodline: null, bloodlineId: null, job: null, totem: null,
      level: p.level || 1, hp: p.hp || maxHp, maxHp: maxHp,
      type: p.type || (egg ? egg.type : 'Fire'),
      codex: p.codex || (egg ? egg.codex : '002'), bond: bond,
      portrait: p.portrait || art.portrait, sprite: p.sprite || art.sprite
    };
  }
  function getPartySlots() {
    var slots = [];
    for (var i = 0; i < PARTY_SIZE; i++) {
      var m = normalizePartyMember(state.party[i]);
      if (m) { m.slot = i + 1; m.empty = false; slots.push(m); }
      else { slots.push({ slot: i + 1, empty: true, kind: null, name: 'Empty', level: 0, hp: 0, maxHp: 0, type: null, codex: null, bloodline: null, job: null, totem: null, bond: 0, portrait: null, sprite: null }); }
    }
    return slots;
  }
  /* The asking scene answer, in engine state. Called when the first
   * grid battle ends won with joined true. Adds the arc Bondkin once.
   * Returns true when a Bondkin was added, false when one is already
   * in the party or the bloodline cannot be resolved. */
  function addArcBondkinToParty() {
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i] && String(state.party[i].kind || '').toLowerCase() === 'bondkin') { return false; }
    }
    var blood = bloodlineByName(state.trainer.bloodline || 'Elf');
    var table = BONDKIN_PARTY[blood.id] || BONDKIN_PARTY.elf;
    state.party.push({
      kind: 'Bondkin', name: arcBondkinName(blood.id),
      bloodline: blood.name, bloodlineId: blood.id,
      job: table.job, totem: blood.totem,
      level: 5, hp: table.hp, maxHp: table.hp, bond: 1,
      portrait: table.portrait, sprite: table.sprite
    });
    setFlag('arc_bondkin_joined');
    saveGame();
    return true;
  }
  function drawBondMeter(ctx, x, y, bond) {
    drawText(ctx, 'Bond', x, y, '#c8c8e8', '9px monospace');
    for (var i = 0; i < PARTY_BOND_MAX; i++) {
      var bx = x + 34 + i * 12;
      if (i < bond) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(bx, y, 9, 9);
      } else {
        ctx.fillStyle = '#0a0a1e';
        ctx.fillRect(bx, y, 9, 9);
        ctx.strokeStyle = '#555577';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, y + 0.5, 8, 8);
      }
    }
    drawText(ctx, bond + ' / ' + PARTY_BOND_MAX, x + 34 + PARTY_BOND_MAX * 12 + 4, y, '#c8c8e8', '9px monospace');
  }
  function drawPartyImageOrInitial(ctx, path, x, y, w, h, initial, fill) {
    if (path && drawImageOrNull(ctx, path, x, y, w, h)) {
      drawPortraitFrame(ctx, x, y, w, h);
      return true;
    }
    ctx.fillStyle = fill || '#223344';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#555577';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    if (initial) { drawText(ctx, initial, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 5, '#ffffff', '12px monospace'); }
    drawPortraitFrame(ctx, x, y, w, h);
    return false;
  }
  /* ---------- GRIMOIRE: wiki and contact book ---------- */
  function guideFormDef() {
    var f = state.trainer.guideForm || '';
    for (var i = 0; i < GUIDE_FORMS.length; i++) {
      if (GUIDE_FORMS[i].name === f) { return GUIDE_FORMS[i]; }
    }
    return null;
  }
  function guideGrimoireDef() {
    var g = state.trainer.guideGrimoire || '';
    for (var i = 0; i < GUIDE_GRIMOIRES.length; i++) {
      if (GUIDE_GRIMOIRES[i].name === g) { return GUIDE_GRIMOIRES[i]; }
    }
    return null;
  }
  function guideSummary() {
    var f = guideFormDef();
    var g = guideGrimoireDef();
    if (!f && !g) { return 'No guide picked yet'; }
    return (f ? f.name + ' ' + f.guide : 'No form') + ', ' + (g ? g.name : 'No Grimoire');
  }
  function starterWildlife() {
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i] && state.party[i].kind === 'Wildlife') { return state.party[i]; }
    }
    return null;
  }
  function arcBondkin() {
    for (var i = 0; i < state.party.length; i++) {
      if (state.party[i] && state.party[i].kind === 'Bondkin') { return state.party[i]; }
    }
    return null;
  }
  function bloodlineDef() {
    var name = state.trainer.bloodline || 'Elf';
    for (var i = 0; i < BLOODLINES.length; i++) {
      if (BLOODLINES[i].name === name) { return BLOODLINES[i]; }
    }
    return BLOODLINES[0];
  }
  /* One entry per Grimoire page: starter Wildlife, arc Bondkin, guide,
   * contacts. Each entry has a title, a short sub line, and detail lines
   * for the top screen. */
  function grimoireEntries() {
    var entries = [];
    var w = starterWildlife();
    var wdef = STARTER_DEFS[(w && String(w.name).toLowerCase()) || 'whelp'] || STARTER_DEFS.whelp;
    entries.push({
      id: 'wildlife',
      title: 'Starter Wildlife: ' + (w ? w.name : wdef.name),
      sub: 'Codex #' + (w ? (w.codex || wdef.codex) : wdef.codex) + '  ' + wdef.type,
      lines: [
        (w ? w.name : wdef.name) + ', Codex #' + (w ? (w.codex || wdef.codex) : wdef.codex) + ', ' + wdef.type + ' type.',
        wdef.note,
        'Level ' + ((w && w.level) || 1) + ', HP ' + ((w && w.hp) || 12) + ' / ' + ((w && w.maxHp) || 12) + '.',
        'Hatched from one of the 3 eggs the kind Wisp dropped on the mountain road.',
        'It travels in a carry sling when young, too young to fight at first.',
        'Wildlife are caught with a Snare Orb. Bondkin are never caught.'
      ]
    });
    var blood = bloodlineDef();
    var arcName = ARC_BONDKIN_NAMES[blood.id] || blood.totem;
    var joined = arcBondkin();
    entries.push({
      id: 'bondkin',
      title: 'Arc Bondkin: ' + arcName,
      sub: 'Bloodline #' + blood.num + ' ' + blood.name + '  Totem Spirit ' + blood.totem,
      lines: [
        arcName + ', arc Bondkin of the ' + blood.name + ' bloodline, #' + blood.num + '.',
        'Totem Spirit: ' + blood.totem + '. ' + blood.desc,
        'Trait: ' + blood.trait + ' Reward: ' + blood.reward + '.',
        joined ? 'Status: Joined your party. Fights beside your Wildlife.' : 'Status: Not yet joined. Meet in Saltquay.',
        'Bondkin ask to join. Trainers never hunt them.',
        'First grid battle: the arc Bondkin lends a hand beside the hatched Wildlife.'
      ]
    });
    var f = guideFormDef();
    var g = guideGrimoireDef();
    entries.push({
      id: 'guide',
      title: 'Guide: ' + (f ? f.name + ' ' + f.guide : 'No guide picked yet'),
      sub: 'Grimoire: ' + (g ? g.name : 'Not picked yet'),
      lines: [
        f ? 'Guide form: ' + f.name + '. Your guide is a ' + f.guide + '.' : 'Guide form: not picked yet. Sword gives a fairy, Staff gives a mystical orb, Shield gives the Grimoire itself.',
        g ? 'Guide Grimoire: ' + g.name + '. Voice: ' + g.voice : 'Guide Grimoire: not picked yet. Muse, Grok, the Wisp, or the Chronicler.',
        'The Grimoire is the in-game wiki and contact book.',
        'It does two jobs only: the wiki and the contacts.',
        'All four Grimoires give the same answers. Only the voice differs.',
        'Switch Grimoires at any Puffkin shop for 500 Crests. Contacts and notes carry over.'
      ]
    });
    var contacts = [];
    if (state.contacts && state.contacts.length) {
      state.contacts.forEach(function (c) {
        contacts.push(typeof c === 'string' ? c : (c.name || String(c)));
      });
    }
    if (joined) { contacts.push(arcName + ' (' + blood.name + ' Bondkin, joined)'); }
    entries.push({
      id: 'contacts',
      title: 'Contacts: ' + contacts.length + ' name' + (contacts.length === 1 ? '' : 's') + ' written in',
      sub: 'Trainers write names in each other Grimoires for rematches',
      lines: contacts.length ? contacts.map(function (c) { return '- ' + c; }).concat([
        'Write a name in to call that trainer for a rematch.',
        'Contacts and notes carry over when you switch Grimoires.'
      ]) : [
        'No contacts yet.',
        'Trainers write each other names in each other Grimoires to call for a rematch.',
        'Meet trainers on the road, in towns, and at the guild to fill this page.'
      ]
    });
    return entries;
  }

  /* ---------- PARTY ---------- */
  var partySel = 0;
  screens.party = {
    enter: function (data) {
      screens.party._returnTo = (data && data.returnTo) || 'overworld';
      partySel = 0;
    },
    onPress: function (a) {
      if (a === 'up' || a === 'left') { partySel = (partySel + PARTY_SIZE - 1) % PARTY_SIZE; }
      else if (a === 'down' || a === 'right') { partySel = (partySel + 1) % PARTY_SIZE; }
      else if (a === 'cancel' || a === 'confirm' || a === 'menu') { setScreen(screens.party._returnTo || 'overworld'); }
    },
    update: function () { textUpdate(); },
    draw: function () {
      var slots = getPartySlots();
      var sel = slots[partySel] || slots[0];
      var filled = 0;
      for (var fi = 0; fi < slots.length; fi++) { if (!slots[fi].empty) { filled++; } }
      drawBannerOverBg(topCtx, 'assets/ov3_party_bg.png', 'PARTY', 'Deploy ' + PARTY_SIZE + '. ' + filled + ' of ' + PARTY_SIZE + ' slots filled.');
      /* PARTY-FIX: the detail text used to sit straight on the ring
       * art, so rings hid "Whelp", struck through "Codex 002", cut
       * the Bond line at the left, and the bottom lines ran off the
       * screen edge. The whole detail block now sits on one solid
       * dark panel, clear of the rings, with the bottom lines moved
       * up and the footer set smaller so it fits in full. */
      topCtx.fillStyle = '#0b0b20';
      topCtx.fillRect(6, 46, W - 12, 140);
      topCtx.strokeStyle = '#e8c838';
      topCtx.lineWidth = 1;
      topCtx.strokeRect(6.5, 46.5, W - 13, 139);
      if (sel.empty) {
        drawPartyImageOrInitial(topCtx, null, 12, 52, 56, 56, '?', '#14142a');
        drawText(topCtx, 'Slot ' + sel.slot + ': Empty', 76, 54, '#ffffff', '12px monospace');
        drawText(topCtx, 'No partner here yet.', 76, 72, '#c8c8e8');
        drawText(topCtx, 'Catch Wildlife or meet a', 76, 88, '#c8c8e8');
        drawText(topCtx, 'Bondkin to fill this slot.', 76, 104, '#c8c8e8');
      } else if (sel.kind === 'Wildlife') {
        drawPartyImageOrInitial(topCtx, sel.sprite, 12, 52, 56, 56, sel.name.charAt(0), '#3a2a1a');
        drawText(topCtx, sel.name, 76, 54, '#ffffff', '12px monospace');
        drawText(topCtx, 'Lv ' + sel.level + '  ' + sel.type, 76, 72, '#e8c838');
        drawText(topCtx, 'Wildlife  Codex ' + sel.codex, 76, 88, '#c8c8e8');
        drawText(topCtx, 'HP ' + sel.hp + ' / ' + sel.maxHp, 76, 104, '#ffffff', '9px monospace');
        drawHpBar(topCtx, 76, 118, 120, sel.hp, sel.maxHp);
        drawBondMeter(topCtx, 12, 134, sel.bond);
        drawText(topCtx, 'Hatched from the Wisp bag egg.', 12, 150, '#8888aa', '9px monospace');
      } else {
        drawPartyImageOrInitial(topCtx, sel.portrait, 12, 52, 56, 56, sel.name.charAt(0), '#1a2a3a');
        drawText(topCtx, sel.name, 76, 54, '#ffffff', '12px monospace');
        drawText(topCtx, sel.bloodline + '  ' + sel.job, 76, 72, '#e8c838');
        drawText(topCtx, 'Bondkin  Lv ' + sel.level, 76, 88, '#c8c8e8');
        drawText(topCtx, 'Totem: ' + sel.totem, 76, 104, '#c8c8e8', '9px monospace');
        drawText(topCtx, 'HP ' + sel.hp + ' / ' + sel.maxHp, 12, 120, '#ffffff', '9px monospace');
        drawHpBar(topCtx, 76, 118, 120, sel.hp, sel.maxHp);
        drawBondMeter(topCtx, 12, 134, sel.bond);
        drawText(topCtx, 'Asked to join after the first grid battle.', 12, 150, '#8888aa', '9px monospace');
      }
      /* Footer at 8px, not 9px: at 9px the 46 chars run 248px wide
       * and spill past the right edge from x12; at 8px it is 221px
       * and fits inside the panel with room to spare. */
      drawText(topCtx, 'Bondkin ask to join. Trainers never hunt them.', 12, 166, '#8888aa', '8px monospace');
      drawScreenBg(bottomCtx, 'assets/ov3_party_bg.png');
      drawText(bottomCtx, 'DEPLOY ' + PARTY_SIZE, 10, 8, '#e8c838', '12px monospace');
      for (var i = 0; i < slots.length; i++) {
        var s = slots[i];
        /* Two lines per slot at a 25 px pitch: name and level on
         * line one, kind and HP on line two, so every member shows
         * portrait or sprite, name, kind, level, and HP. Line two
         * sits at y+13, not y+12, so the 10px line one and the 9px
         * line two no longer touch, and the Bondkin kind drops the
         * job ("Bondkin Elf Starwarden" ran into the HP label), so
         * the kind and the HP label keep a clear gap. */
        var y = 24 + i * 25;
        var rowInk = i === partySel ? '#101030' : '#ffffff';
        var rowGold = i === partySel ? '#101030' : '#e8c838';
        /* BUBBLE-FIX: slot rows are drawn procedurally now, no slot
         * art with its circular portrait well at the left. Sharp DS
         * rows: dark navy field, gold border on the selected row,
         * navy border on the rest. The portrait at the left is a
         * square, framed by drawPortraitFrame. */
        bottomCtx.fillStyle = (i === partySel) ? '#e8c838' : '#0b0b20';
        bottomCtx.fillRect(6, y - 2, W - 12, 24);
        bottomCtx.strokeStyle = (i === partySel) ? '#20242a' : '#3a3a5a';
        bottomCtx.lineWidth = 1;
        bottomCtx.strokeRect(6.5, y - 1.5, W - 13, 23);
        /* PARTY-FIX 2: paint a flat field behind the text columns
         * (x62 to the right edge, the square portrait at the left
         * sits on the row field): solid gold for the selected row so
         * the dark text reads, solid dark for the rest so the white
         * and gold text reads. */
        bottomCtx.fillStyle = (i === partySel) ? '#e8c838' : '#0b0b20';
        bottomCtx.fillRect(62, y - 2, W - 68, 24);
        if (s.empty) {
          drawPartyImageOrInitial(bottomCtx, null, 27, y + 1, 16, 16, '', '#14142a');
          drawText(bottomCtx, 'Slot ' + s.slot + '  Empty', 66, y + 3, i === partySel ? '#101030' : '#8888aa');
        } else if (s.kind === 'Wildlife') {
          drawPartyImageOrInitial(bottomCtx, s.sprite, 27, y + 1, 16, 16, s.name.charAt(0), '#3a2a1a');
          drawText(bottomCtx, 'Slot ' + s.slot + '  ' + s.name, 66, y + 2, rowInk);
          drawText(bottomCtx, 'Lv ' + s.level, 196, y + 2, rowInk, '9px monospace');
          drawText(bottomCtx, 'Wildlife  ' + (s.type || ''), 66, y + 13, rowGold, '9px monospace');
          drawText(bottomCtx, 'HP ' + s.hp + '/' + s.maxHp, 196, y + 13, rowGold, '9px monospace');
        } else {
          drawPartyImageOrInitial(bottomCtx, s.portrait, 27, y + 1, 16, 16, s.name.charAt(0), '#1a2a3a');
          drawText(bottomCtx, 'Slot ' + s.slot + '  ' + s.name, 66, y + 2, rowInk);
          drawText(bottomCtx, 'Lv ' + s.level, 196, y + 2, rowInk, '9px monospace');
          drawText(bottomCtx, 'Bondkin  ' + s.bloodline, 66, y + 13, rowGold, '9px monospace');
          drawText(bottomCtx, 'HP ' + s.hp + '/' + s.maxHp, 196, y + 13, rowGold, '9px monospace');
        }
      }
      drawBottomHint(bottomCtx, 'D-pad: pick slot  A or B: back');
      drawTextBox(bottomCtx);
    }
  };

  /* Thousands separators for Cr amounts, so the bank wallet reads
   * 1,000,000 Cr the same way the pause menu shows it. */
  function fmtCr(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ---------- MONSTER BANK (Saltquay main branch, Broker Voss) ----------
   * Design source: new-game.md, Selling Wildlife at The Monster Bank.
   * Roster holds up to 24 Wildlife. Deploy team holds 6. Broker Voss
   * buys Wildlife at the Saltquay main branch, and his licensed agents
   * staff every other branch and post under his name, same rules.
   * Daily cap is 3 sales, reset each new day. A sold Wildlife is gone
   * forever: no buyback, no buyback window, no reclaim, no return.
   * Every sale needs a two step confirm showing name, rarity, Stage,
   * level, variant, fusion status, and the exact sale price in Cr.
   * Price = (base by rarity x Stage multiplier + level x 10 Cr)
   *          x variant multiplier x fusion multiplier, rounded down.
   * Base at Stage 1: Uncommon 150, Rare 400, Epic 900, Legendary 2500,
   * Mythic 6000, Common 0 and never sold. Stage: x1, x1.5, x2.
   * Variant: Standard x1, Hollow x2, Echo x2.5. Fused: x3.
   * Never sold: starters, story Wildlife, Common Wildlife, Wildlife
   * in the middle of evolution or fusion. Wildlife on the deploy team
   * must come off the team before it can be sold. At least 1 Wildlife
   * must stay in the roster. A sale that would pass the wallet cap of
   * 999,999 Cr is blocked. Bondkin are never sold here. The bank is
   * the Monster Bank, never Wild Bank.
   * Portraits and sheets: Broker Voss portrait assets/p_voss.png,
   * overworld sheet assets/ow_voss.png. Both exist in build/assets.
   * State lives on state.monsterBank so it saves with the game. Old
   * saves without it get it built on first open by ensureMonsterBank.
   */
  var BANK_ROSTER_MAX = 24;
  var BANK_DEPLOY_MAX = 6;
  var BANK_SELL_CAP = 3;
  var BANK_BASE_CR = { Common: 0, Uncommon: 150, Rare: 400, Epic: 900, Legendary: 2500, Mythic: 6000 };
  var BANK_STAGE_MULT = { 1: 1, 2: 1.5, 3: 2 };
  var BANK_VARIANT_MULT = { Standard: 1, Hollow: 2, Echo: 2.5 };
  var BANK_FUSED_MULT = 3;
  /* Real rarity by species, from the 19 wild spawns in overworld.js
   * WILD_DEFS (gatehollow 2, road 8, cragfall 4, saltquay 5) and their
   * kind: enemy is a common field enemy, wild is a common battlable
   * Wildlife, rare is a rare visible Wildlife, friendly is the one
   * rare friendly Wisp, never caught and never battled.
   * Slime Common (3 spawns), Goblin Common (4 spawns), Ghoul
   * Uncommon (3 spawns, Lv 5 to 6 field enemy), Whelp Uncommon
   * (4 spawns, wild), Puk Rare (2 spawns, kind rare), Mandragora
   * Rare (2 spawns, kind rare), Wisp Rare (1 spawn, friendly).
   * Tiers and Stage 1 base values are the design values in
   * new-game.md: Uncommon 150, Rare 400, Epic 900, Legendary 2500,
   * Mythic 6000 Cr. No wild spawn in the build is Epic or higher,
   * so those tiers stay available for later Wildlife and fusions.
   * The table wins over a stored default for a known wild species;
   * a species outside the table keeps its own rarity (fusions get
   * a new name and their own rarity tier). */
  var BANK_RARITY_BY_SPECIES = {
    Slime: 'Common', Goblin: 'Common', Ghoul: 'Uncommon',
    Whelp: 'Uncommon', Puk: 'Rare', Mandragora: 'Rare', Wisp: 'Rare'
  };
  function bankRarityFor(species) {
    return BANK_RARITY_BY_SPECIES[species] || 'Uncommon';
  }
  var BANK_CODEX_BY_SPECIES = { Whelp: '002', Puk: '104', Mandragora: '029' };

  function bankTodayStr() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }
  function bankIsWildlife(p) {
    return !!p && String(p.kind || '').toLowerCase() === 'wildlife';
  }
  function bankIsBondkin(p) {
    return !!p && String(p.kind || '').toLowerCase() === 'bondkin';
  }
  function ensureMonsterBank() {
    if (!state.monsterBank) {
      state.monsterBank = { roster: [], deployedIds: [], soldToday: 0, soldDay: bankTodayStr(), soldNames: [], nextId: 1 };
    }
    var bank = state.monsterBank;
    if (bank.soldDay !== bankTodayStr()) {
      bank.soldDay = bankTodayStr();
      bank.soldToday = 0;
    }
    /* Correct any roster entry stored under the old placeholder
     * default, so the Monster Bank displays the real rarity for
     * every stored Wildlife. Known wild species take the table
     * value; any other species keeps its own rarity. */
    for (var ri = 0; ri < bank.roster.length; ri++) {
      var knownRarity = BANK_RARITY_BY_SPECIES[bank.roster[ri].name];
      if (knownRarity) { bank.roster[ri].rarity = knownRarity; }
    }
    /* Migrate Wildlife already in the party into the roster. The first
     * Wildlife in party order is the starter from the hatched egg. */
    var firstWildlife = true;
    for (var i = 0; i < state.party.length; i++) {
      var p = state.party[i];
      if (!bankIsWildlife(p)) { continue; }
      var found = null;
      for (var j = 0; j < bank.roster.length; j++) {
        if (bank.roster[j].id === p._bankId) { found = bank.roster[j]; }
      }
      if (!found) {
        var entry = {
          id: 'bk_' + (bank.nextId++),
          kind: 'Wildlife',
          name: p.name || 'Wildlife',
          codex: p.codex || BANK_CODEX_BY_SPECIES[p.name] || '',
          type: p.type || '',
          level: p.level || 1,
          hp: p.hp || 12,
          maxHp: p.maxHp || 12,
          rarity: BANK_RARITY_BY_SPECIES[p.name] || p.rarity || 'Uncommon',
          stage: p.stage || 1,
          variant: p.variant || 'Standard',
          fused: !!p.fused,
          starter: firstWildlife || !!p.egg,
          story: firstWildlife || !!p.story || !!p.egg,
          evolving: false,
          fusing: false
        };
        p._bankId = entry.id;
        entry._bankId = entry.id;
        bank.roster.push(entry);
        found = entry;
        /* Only a newly migrated Wildlife joins the deploy team. A
         * Wildlife already in the roster keeps its deploy state, so
         * removing one from the team is never undone by a later sync. */
        if (bank.deployedIds.indexOf(found.id) === -1 && bank.deployedIds.length < BANK_DEPLOY_MAX) {
          bank.deployedIds.push(found.id);
        }
      }
      firstWildlife = false;
    }
    return bank;
  }
  function bankRoster() { return ensureMonsterBank().roster; }
  function bankDeployed() {
    var bank = ensureMonsterBank();
    var out = [];
    for (var i = 0; i < bank.deployedIds.length; i++) {
      var w = bankWildlifeById(bank.deployedIds[i]);
      if (w) { out.push(w); }
    }
    return out;
  }
  function bankWildlifeById(id) {
    var roster = ensureMonsterBank().roster;
    for (var i = 0; i < roster.length; i++) {
      if (roster[i].id === id) { return roster[i]; }
    }
    return null;
  }
  function bankPrice(w) {
    if (!w) { return 0; }
    var base = BANK_BASE_CR[w.rarity] || 0;
    if (!base) { return 0; }
    var stageMult = BANK_STAGE_MULT[w.stage] || 1;
    var variantMult = BANK_VARIANT_MULT[w.variant] || 1;
    var fusedMult = w.fused ? BANK_FUSED_MULT : 1;
    var level = (typeof w.level === 'number') ? w.level : 1;
    return Math.floor((base * stageMult + level * 10) * variantMult * fusedMult);
  }
  /* Returns a block reason string, or null when the sale can start. */
  function bankSellBlock(w) {
    var bank = ensureMonsterBank();
    if (!w) { return 'No Wildlife picked.'; }
    if (bank.deployedIds.indexOf(w.id) !== -1) { return 'Remove it from the deploy team of 6 first.'; }
    if (w.starter || w.story) { return 'Starters and story Wildlife are never sold.'; }
    if (w.evolving || w.fusing) { return 'It must finish evolving or fusing first.'; }
    if (!w.rarity || w.rarity === 'Common') { return 'Broker Voss does not buy Common Wildlife.'; }
    if (bank.roster.length <= 1) { return 'At least 1 Wildlife must stay in the roster.'; }
    if (bank.soldToday >= BANK_SELL_CAP) { return 'Daily cap reached. Broker Voss buys 3 Wildlife a day.'; }
    var price = bankPrice(w);
    if (state.wallet.cr + price > WALLET_CAP) { return 'The sale would pass the wallet cap of 999,999 Cr. Spend Crests first.'; }
    return null;
  }
  function bankSyncParty() {
    var bank = ensureMonsterBank();
    /* syncPlayerProfile takes the starter name from party[0]. Keep the
     * real starter name when the deploy order changes, so removing the
     * starter from the team never renames the starter. */
    var starterName = null;
    for (var s = 0; s < bank.roster.length; s++) {
      if (bank.roster[s].starter) { starterName = bank.roster[s].name; }
    }
    var bondkin = [];
    for (var i = 0; i < state.party.length; i++) {
      if (bankIsBondkin(state.party[i])) { bondkin.push(state.party[i]); }
    }
    state.party = bankDeployed().concat(bondkin);
    syncPlayerProfile();
    if (starterName && state.player) { state.player.starterWildlife = starterName; }
  }
  function bankToggleDeploy(id) {
    var bank = ensureMonsterBank();
    var w = bankWildlifeById(id);
    if (!w) { return 'No Wildlife in that slot.'; }
    var at = bank.deployedIds.indexOf(id);
    if (at !== -1) {
      bank.deployedIds.splice(at, 1);
      bankSyncParty();
      saveGame();
      return w.name + ' leaves the deploy team. It waits in the roster.';
    }
    if (bank.deployedIds.length >= BANK_DEPLOY_MAX) {
      return 'The deploy team is full at 6. Remove one first.';
    }
    bank.deployedIds.push(id);
    bankSyncParty();
    saveGame();
    return w.name + ' joins the deploy team. Deploy: ' + bank.deployedIds.length + ' / 6.';
  }
  /* Caught Wildlife goes to the Monster Bank roster, never straight
   * onto the deploy team. Returns ok plus the new roster count. */
  function bankAddCaught(species, level) {
    var bank = ensureMonsterBank();
    if (bank.roster.length >= BANK_ROSTER_MAX) {
      return { ok: false, message: 'The Monster Bank roster is full at 24 Wildlife.', rosterCount: bank.roster.length };
    }
    var entry = {
      id: 'bk_' + (bank.nextId++),
      kind: 'Wildlife',
      name: species || 'Wildlife',
      codex: BANK_CODEX_BY_SPECIES[species] || '',
      type: '',
      level: level || 1,
      hp: 12 + (level || 1),
      maxHp: 12 + (level || 1),
      rarity: bankRarityFor(species),
      stage: 1,
      variant: 'Standard',
      fused: false,
      starter: false,
      story: false,
      evolving: false,
      fusing: false
    };
    entry._bankId = entry.id;
    bank.roster.push(entry);
    saveGame();
    return { ok: true, entry: entry, rosterCount: bank.roster.length };
  }
  /* Runs only after both confirms. Re-checks every block at sale time. */
  function bankSellComplete(id) {
    var bank = ensureMonsterBank();
    var w = bankWildlifeById(id);
    var block = bankSellBlock(w);
    if (block) { return { ok: false, reason: block }; }
    var price = bankPrice(w);
    var name = w.name;
    bank.roster = bank.roster.filter(function (r) { return r.id !== id; });
    var at = bank.deployedIds.indexOf(id);
    if (at !== -1) { bank.deployedIds.splice(at, 1); }
    bank.soldToday += 1;
    bank.soldNames.push(name);
    addCr(price);
    bankSyncParty();
    saveGame();
    return { ok: true, name: name, price: price, cr: state.wallet.cr, soldToday: bank.soldToday };
  }
  var monsterBankApi = {
    ROSTER_MAX: BANK_ROSTER_MAX,
    DEPLOY_MAX: BANK_DEPLOY_MAX,
    SELL_CAP: BANK_SELL_CAP,
    WALLET_CAP: WALLET_CAP,
    ensure: ensureMonsterBank,
    rarityFor: bankRarityFor,
    roster: bankRoster,
    deployed: bankDeployed,
    price: bankPrice,
    canSell: bankSellBlock,
    addCaught: bankAddCaught,
    toggleDeploy: bankToggleDeploy,
    syncParty: bankSyncParty,
    sell: bankSellComplete
  };

  /* ---------- MONSTER BANK SCREEN (DS style, two screens) ---------- */
  var bankPhase = 'counter'; /* counter, roster, deploy, sell, sellConfirm1, sellConfirm2 */
  var bankSel = 0;
  var bankCursor = 0;        /* roster slot 0 to 23 */
  var bankSellId = null;
  var bankReturnTo = 'overworld';
  var BANK_COUNTER_ITEMS = ['View Roster', 'Deploy Team', 'Sell Wildlife', 'Leave'];

  function bankShortName(name) {
    return String(name || '').slice(0, 5);
  }
  function bankSlotAt(slot) {
    var roster = ensureMonsterBank().roster;
    return roster[slot] || null;
  }
  function bankIsDeployed(id) {
    return ensureMonsterBank().deployedIds.indexOf(id) !== -1;
  }
  function bankDrawGrid() {
    var bank = ensureMonsterBank();
    /* BANK-FIX v8: 4 columns of 60px at 8px, so full names fit. The
     * old 6x40 grid sliced names to 5 chars (Gobli, Mandr). Longest
     * roster name is Mandragora, 10 chars, 11 with the deploy star. */
    var x0 = 4, y0 = 48, cw = 60, ch = 15, gap = 2, cols = 4;
    for (var slot = 0; slot < BANK_ROSTER_MAX; slot++) {
      var col = slot % cols, row = Math.floor(slot / cols);
      var x = x0 + col * (cw + gap), y = y0 + row * (ch + gap);
      var w = bankSlotAt(slot);
      if (!w) { topCtx.fillStyle = '#30304a'; }
      else if (bankIsDeployed(w.id)) { topCtx.fillStyle = '#2a6a3a'; }
      else { topCtx.fillStyle = '#e8e8f0'; }
      topCtx.fillRect(x, y, cw, ch);
      if (slot === bankCursor) {
        topCtx.strokeStyle = '#e8c838';
        topCtx.lineWidth = 2;
        topCtx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
      }
      if (w) {
        var label = w.name + (bankIsDeployed(w.id) ? '*' : '');
        drawText(topCtx, label, x + 3, y + 3, bankIsDeployed(w.id) ? '#ffffff' : '#101030', '8px monospace');
      } else {
        drawText(topCtx, '-', x + 27, y + 3, '#8888aa', '8px monospace');
      }
    }
    /* BANK-FIX v8: both info lines sit on one dark strip, drawn
     * BEFORE the text. The old code drew the first line bare on the
     * bright gold seal, then put the strip under only the second
     * line, so the first line washed out. The first line is set at
     * 8px so the full Roster / Deploy / Sold counts fit the width. */
    topCtx.fillStyle = 'rgba(5,5,15,0.85)';
    topCtx.fillRect(6, 150, W - 12, 28);
    drawText(topCtx, 'Roster ' + bank.roster.length + ' / 24   Deploy ' + bank.deployedIds.length + ' / 6   Sold today ' + bank.soldToday + ' / 3', 6, 152, '#c8c8e8', '8px monospace');
    drawText(topCtx, '* = on the deploy team. Gold box = cursor.', 6, 166, '#c8c8e8', '9px monospace');
  }
  function bankDetailLines(w) {
    if (!w) { return ['Empty slot.', 'Catch Wildlife with a Snare Orb', 'to fill the roster.']; }
    var block = bankSellBlock(w);
    var lines = [
      w.name + (w.codex ? '  No. ' + w.codex : '') + '  Lv ' + (w.level || 1),
      'Rarity: ' + (w.rarity || 'Uncommon') + '  Stage ' + (w.stage || 1) + '  ' + (w.variant || 'Standard') + (w.fused ? '  Fused' : ''),
      'HP ' + (w.hp || 1) + ' / ' + (w.maxHp || 1) + '  ' + (w.type || ''),
      'Deployed: ' + (bankIsDeployed(w.id) ? 'yes, on the team of 6' : 'no, resting in the roster'),
      'Sale price: ' + bankPrice(w) + ' Cr'
    ];
    if (w.starter || w.story) { lines.push('Never sold: starter or story Wildlife.'); }
    else if (block) { lines.push('Cannot sell: ' + block); }
    else { lines.push('Sellable. Pick Sell Wildlife to sell it.'); }
    return lines;
  }
  function bankDrawDetail(lines) {
    drawScreenBg(bottomCtx, 'assets/ov3_bank_bg.png');
    /* BANK-FIX v8: wrap every detail line to the bottom screen width
     * with the drawn font, so long lines like the Cannot-sell wallet
     * cap line wrap inside the screen instead of running off the
     * right edge. First line stays gold. */
    bottomCtx.font = '10px monospace';
    var y = 12;
    for (var i = 0; i < lines.length; i++) {
      var sub = wrapLines(bottomCtx, lines[i], W - 20);
      for (var j = 0; j < sub.length; j++) {
        drawText(bottomCtx, sub[j], 10, y, (i === 0 && j === 0) ? '#e8c838' : '#fff');
        y += 15;
      }
    }
  }

  screens.monsterBank = {
    enter: function (data) {
      bankReturnTo = (data && data.returnTo) || 'overworld';
      ensureMonsterBank();
      bankPhase = 'counter';
      bankSel = 0;
      bankCursor = 0;
      bankSellId = null;
    },
    onPress: function (a) {
      if (textBox.active) { return; }
      var bank = ensureMonsterBank();
      if (bankPhase === 'counter') {
        if (a === 'up') { bankSel = (bankSel + BANK_COUNTER_ITEMS.length - 1) % BANK_COUNTER_ITEMS.length; }
        else if (a === 'down') { bankSel = (bankSel + 1) % BANK_COUNTER_ITEMS.length; }
        else if (a === 'cancel') { setScreen(bankReturnTo); }
        else if (a === 'confirm') {
          if (bankSel === 0) { bankPhase = 'roster'; }
          else if (bankSel === 1) { bankPhase = 'deploy'; }
          else if (bankSel === 2) { bankPhase = 'sell'; }
          else { setScreen(bankReturnTo); }
        }
        return;
      }
      if (bankPhase === 'roster' || bankPhase === 'deploy' || bankPhase === 'sell') {
        if (a === 'cancel') { bankPhase = 'counter'; return; }
        if (a === 'left') { bankCursor = (bankCursor + BANK_ROSTER_MAX - 1) % BANK_ROSTER_MAX; return; }
        if (a === 'right') { bankCursor = (bankCursor + 1) % BANK_ROSTER_MAX; return; }
        if (a === 'up') { bankCursor = (bankCursor + BANK_ROSTER_MAX - 4) % BANK_ROSTER_MAX; return; }
        if (a === 'down') { bankCursor = (bankCursor + 4) % BANK_ROSTER_MAX; return; }
        if (a === 'confirm') {
          var w = bankSlotAt(bankCursor);
          if (bankPhase === 'roster') {
            if (!w) { showText(['Empty slot. Catch Wildlife with a Snare Orb to fill the roster.'], null); }
            return;
          }
          if (bankPhase === 'deploy') {
            if (!w) { showText(['Empty slot. Nothing to deploy here.'], null); return; }
            showText([bankToggleDeploy(w.id)], null);
            return;
          }
          if (bankPhase === 'sell') {
            if (!w) { showText(['Empty slot. Nothing to sell here.'], null); return; }
            var block = bankSellBlock(w);
            if (block) { showText(['Cannot sell ' + w.name + '. ' + block], null); return; }
            bankSellId = w.id;
            bankPhase = 'sellConfirm1';
            return;
          }
        }
        return;
      }
      if (bankPhase === 'sellConfirm1') {
        if (a === 'cancel') { bankPhase = 'sell'; bankSellId = null; return; }
        if (a === 'confirm') { bankPhase = 'sellConfirm2'; return; }
        return;
      }
      if (bankPhase === 'sellConfirm2') {
        if (a === 'cancel') { bankPhase = 'sell'; bankSellId = null; return; }
        if (a === 'confirm') {
          var res = bankSellComplete(bankSellId);
          bankSellId = null;
          if (!res.ok) {
            showText(['Sale stopped. ' + res.reason], null, function () { bankPhase = 'sell'; });
            return;
          }
          showText([
            'Sold ' + res.name + ' for ' + res.price + ' Cr.',
            'Wallet: ' + res.cr + ' Cr. Sold today: ' + res.soldToday + ' / 3.',
            res.name + ' is gone forever. No buyback.'
          ], null, function () { bankPhase = 'sell'; });
          return;
        }
        return;
      }
    },
    update: function () { textUpdate(); },
    draw: function () {
      var bank = ensureMonsterBank();
      if (bankPhase === 'counter') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'MONSTER BANK', 'Saltquay main branch. Broker Voss.');
        var ok = drawImageOrNull(topCtx, 'assets/p_voss.png', 10, 52, 48, 48);
        if (!ok) {
          topCtx.fillStyle = '#c8c8f0';
          topCtx.fillRect(10, 52, 48, 48);
          drawText(topCtx, 'V', 28, 66, '#101030', '16px monospace');
        }
        drawPortraitFrame(topCtx, 10, 52, 48, 48);
        /* BANK-FIX v6: all four info lines now sit on one dark strip,
         * clear of the portrait at x10..58 and of the big gold seal
         * emblem behind them. The earlier strip only covered the two
         * footer lines below (y112), so the seal struck through
         * these four lines. */
        topCtx.fillStyle = 'rgba(5,5,15,0.85)';
        topCtx.fillRect(62, 48, W - 68, 64);
        drawText(topCtx, 'Broker Voss, licensed buyer.', 66, 56, '#fff');
        drawText(topCtx, 'Roster ' + bank.roster.length + ' / 24. Deploy ' + bank.deployedIds.length + ' / 6.', 66, 72, '#fff');
        drawText(topCtx, 'Sold today ' + bank.soldToday + ' / 3.', 66, 88, '#fff');
        drawText(topCtx, 'Wallet ' + fmtCr(state.wallet.cr) + ' Cr.', 66, 104, '#fff');
        /* BANK-FIX: these two lines used to sit straight on the big
         * gold seal emblem at low contrast (grey on gold, gold on
         * gold). They now sit on a solid dark strip, clear of the
         * emblem, with the grey line brightened to read on it. */
        topCtx.fillStyle = 'rgba(5,5,15,0.85)';
        topCtx.fillRect(6, 112, W - 12, 32);
        drawText(topCtx, 'Same roster at every branch and post.', 10, 116, '#c8c8e8');
        drawText(topCtx, 'A sold Wildlife is gone forever.', 10, 130, '#e8a838');
        drawScreenBg(bottomCtx, 'assets/ov3_bank_bg.png');
        /* Counter strip art behind the counter menu list. */
        drawImageOrNull(bottomCtx, 'assets/ov3_bank_counter.png', 0, 12, W, 64);
        /* BANK-FIX v6: the menu items sat bare on the counter art.
         * They now sit on a dark panel with a gold edge. Items run
         * y20 to y72, so the panel runs y14 to y78. */
        drawBox(bottomCtx, 6, 14, W - 12, 64, 'rgba(5,5,15,0.85)', '#e8c838');
        drawMenuList(bottomCtx, '', BANK_COUNTER_ITEMS, bankSel, 20, false);
        drawBottomHint(bottomCtx, 'A: pick  B: leave');
        drawTextBox(bottomCtx);
        return;
      }
      if (bankPhase === 'roster') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'MONSTER BANK ROSTER', 'Saltquay main branch. Broker Voss.');
        bankDrawGrid();
        bankDrawDetail(bankDetailLines(bankSlotAt(bankCursor)));
        drawBottomHint(bottomCtx, 'D-pad: move  B: back to the counter');
        drawTextBox(bottomCtx);
        return;
      }
      if (bankPhase === 'deploy') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'DEPLOY TEAM OF 6', 'A: add or remove. The team fights beside you.');
        bankDrawGrid();
        var lines = bankDetailLines(bankSlotAt(bankCursor));
        lines.push('Deploy ' + bank.deployedIds.length + ' / 6. A sold Wildlife must leave the team first.');
        bankDrawDetail(lines);
        drawBottomHint(bottomCtx, 'D-pad: move  A: toggle  B: back');
        drawTextBox(bottomCtx);
        return;
      }
      if (bankPhase === 'sell') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'SELL WILDLIFE', 'Broker Voss buys 3 Wildlife a day. Gone forever.');
        bankDrawGrid();
        var w = bankSlotAt(bankCursor);
        var sellLines = bankDetailLines(w);
        sellLines.push('A: pick this Wildlife  B: back to the counter');
        bankDrawDetail(sellLines);
        drawBottomHint(bottomCtx, 'Daily cap 3. No buyback. Two confirms.');
        drawTextBox(bottomCtx);
        return;
      }
      var sw = bankWildlifeById(bankSellId);
      if (bankPhase === 'sellConfirm1') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'SELL: FIRST CONFIRM', sw ? sw.name + '  ' + bankPrice(sw) + ' Cr' : 'No Wildlife picked.');
        if (sw) {
          drawText(topCtx, 'Name: ' + sw.name, 10, 52, '#fff');
          drawText(topCtx, 'Rarity: ' + sw.rarity + '  Stage ' + sw.stage + '  Lv ' + sw.level, 10, 68, '#fff');
          drawText(topCtx, 'Variant: ' + sw.variant + '  Fused: ' + (sw.fused ? 'yes' : 'no'), 10, 84, '#fff');
          drawText(topCtx, 'Sale price: ' + bankPrice(sw) + ' Cr, paid at once.', 10, 100, '#e8c838');
          drawText(topCtx, 'Wallet after sale: ' + (state.wallet.cr + bankPrice(sw)) + ' Cr.', 10, 116, '#fff');
        }
        drawScreenBg(bottomCtx, 'assets/ov3_bank_bg.png');
        drawText(bottomCtx, 'A sold Wildlife is gone forever.', 10, 12, '#e8a838', '11px monospace');
        drawText(bottomCtx, 'No buyback. No reclaim. No return.', 10, 30, '#e8a838');
        /* The two warning lines used to run straight off the right
         * edge (43 and 54 chars at 10px). They wrap to two lines
         * each now, same words, 16px pitch. */
        bottomCtx.font = '10px monospace';
        var warnLines = wrapLines(bottomCtx, 'Broker Voss trades it on to other Mankind.', W - 20)
          .concat(wrapLines(bottomCtx, 'The Codex entry stays unlocked. The Wildlife does not.', W - 20));
        for (var wi = 0; wi < warnLines.length; wi++) {
          drawText(bottomCtx, warnLines[wi], 10, 48 + wi * 16, '#fff');
        }
        drawBottomHint(bottomCtx, 'A: continue  B: stop, keep ' + (sw ? sw.name : 'it'));
        drawTextBox(bottomCtx);
        return;
      }
      if (bankPhase === 'sellConfirm2') {
        drawBannerOverBg(topCtx, 'assets/ov3_bank_bg.png', 'SELL: FINAL CHECK', sw ? sw.name + '  ' + bankPrice(sw) + ' Cr' : 'No Wildlife picked.');
        if (sw) {
          drawText(topCtx, 'Final check: ' + sw.name + ' for ' + bankPrice(sw) + ' Cr.', 10, 52, '#fff');
          drawText(topCtx, 'Sold today after this sale: ' + (bank.soldToday + 1) + ' / 3.', 10, 68, '#fff');
          drawText(topCtx, 'Roster after this sale: ' + (bank.roster.length - 1) + ' / 24.', 10, 84, '#fff');
        }
        drawScreenBg(bottomCtx, 'assets/ov3_bank_bg.png');
        drawText(bottomCtx, 'This is the last chance to stop.', 10, 12, '#e8a838', '11px monospace');
        drawText(bottomCtx, 'Press A and the sale goes through.', 10, 30, '#fff');
        drawText(bottomCtx, 'Press B and nothing is sold.', 10, 48, '#fff');
        drawBottomHint(bottomCtx, 'A: sell now  B: stop, keep ' + (sw ? sw.name : 'it'));
        drawTextBox(bottomCtx);
        return;
      }
    }
  };

  /* ---------- BAG ---------- */
  screens.bag = {
    enter: function (data) { screens.bag._returnTo = (data && data.returnTo) || 'menu'; },
    onPress: function (a) {
      if (a === 'cancel' || a === 'confirm' || a === 'menu') { setScreen(screens.bag._returnTo || 'menu'); }
    },
    update: function () {},
    draw: function () {
      drawTopBanner(topCtx, 'BAG', 'What you carry. Snare Orbs catch wild Wildlife.');
      drawText(topCtx, 'Snare Orbs: ' + (state.bag.snareOrbs || 0), 10, 52, '#fff');
      drawText(topCtx, 'Potions: ' + (state.bag.potions || 0), 10, 68, '#fff');
      drawText(topCtx, 'Cr: ' + state.wallet.cr + ' / ' + state.wallet.cap, 10, 84, '#fff');
      drawText(topCtx, 'The 1,000,000 Cr bounty is the one reward', 10, 108, '#8888aa');
      drawText(topCtx, 'allowed over the 999,999 Cr wallet cap.', 10, 120, '#8888aa');
      clearScreen(bottomCtx, '#0a0a1e');
      drawText(bottomCtx, 'A or B: back to the menu', 10, 20, '#e8c838');
      drawText(bottomCtx, 'A Snare Orb catches a wild Wildlife after', 10, 40, '#8888aa');
      drawText(bottomCtx, 'you weaken it in battle.', 10, 52, '#8888aa');
    }
  };

  /* ---------- SETTINGS ---------- */
  var settingsSel = 0;
  var SETTINGS_ITEMS = ['Text speed', 'Sound', 'Back'];
  screens.settings = {
    enter: function (data) { settingsSel = 0; screens.settings._returnTo = (data && data.returnTo) || 'menu'; },
    onPress: function (a) {
      if (a === 'up') { settingsSel = (settingsSel + SETTINGS_ITEMS.length - 1) % SETTINGS_ITEMS.length; }
      else if (a === 'down') { settingsSel = (settingsSel + 1) % SETTINGS_ITEMS.length; }
      else if (a === 'cancel' || a === 'menu') { setScreen(screens.settings._returnTo || 'menu'); }
      else if (a === 'confirm') {
        if (settingsSel === 0) {
          options.textSpeed = options.textSpeed === 'slow' ? 'normal' : options.textSpeed === 'normal' ? 'fast' : 'slow';
          textBox.speedSetting = options.textSpeed;
        } else if (settingsSel === 1) { options.sound = !options.sound; }
        else { setScreen(screens.settings._returnTo || 'menu'); }
      }
    },
    update: function () {},
    draw: function () {
      drawTopBanner(topCtx, 'SETTINGS', 'Text speed and sound. Saved with your game.');
      var vals = ['Text speed: ' + options.textSpeed, 'Sound: ' + (options.sound ? 'ON' : 'OFF'), 'Back to the menu'];
      for (var i = 0; i < vals.length; i++) {
        var y = 52 + i * 18;
        if (i === settingsSel) {
          topCtx.fillStyle = '#e8c838';
          topCtx.fillRect(6, y - 2, W - 12, 16);
          drawText(topCtx, '> ' + vals[i], 10, y, '#101030');
        } else { drawText(topCtx, '  ' + vals[i], 10, y, '#fff'); }
      }
      clearScreen(bottomCtx, '#0a0a1e');
      drawText(bottomCtx, 'A: change  B: back', 10, 20, '#e8c838');
      drawText(bottomCtx, 'Text speed changes how fast the words appear.', 10, 40, '#8888aa');
    }
  };

  /* ---------- GRIMOIRE SCREEN ---------- */
  var grimoireSel = 0;
  var grimoireDetail = -1;
  screens.grimoire = {
    enter: function (data) {
      grimoireSel = 0;
      grimoireDetail = -1;
      screens.grimoire._returnTo = (data && data.returnTo) || 'menu';
    },
    onPress: function (a) {
      var entries = grimoireEntries();
      if (grimoireDetail >= 0) {
        if (a === 'cancel' || a === 'confirm' || a === 'menu') { grimoireDetail = -1; }
        return;
      }
      if (a === 'up') { grimoireSel = (grimoireSel + entries.length - 1) % entries.length; }
      else if (a === 'down') { grimoireSel = (grimoireSel + 1) % entries.length; }
      else if (a === 'confirm') { grimoireDetail = grimoireSel; }
      else if (a === 'cancel' || a === 'menu') { setScreen(screens.grimoire._returnTo || 'menu'); }
    },
    update: function () { textUpdate(); },
    draw: function () {
      var entries = grimoireEntries();
      var shown = grimoireDetail >= 0 ? entries[grimoireDetail] : entries[grimoireSel];
      drawTopBanner(topCtx, 'GRIMOIRE', 'Wiki and contact book. Guide: ' + guideSummary() + '.');
      drawText(topCtx, shown.title, 10, 52, '#e8c838', '11px monospace');
      var lines = [];
      if (grimoireDetail >= 0) {
        shown.lines.forEach(function (ln) { lines = lines.concat(wrapLines(topCtx, ln, W - 20)); });
      } else {
        lines = wrapLines(topCtx, shown.sub, W - 20);
        lines.push('A: open this page. The Grimoire lists what you have met.');
      }
      for (var i = 0; i < lines.length && i < 9; i++) {
        drawText(topCtx, lines[i], 10, 68 + i * 12, '#fff');
      }
      clearScreen(bottomCtx, '#0a0a1e');
      drawText(bottomCtx, 'GRIMOIRE', 10, 8, '#e8c838', '11px monospace');
      for (var j = 0; j < entries.length; j++) {
        var y = 30 + j * 18;
        if (j === grimoireSel) {
          bottomCtx.fillStyle = '#e8c838';
          bottomCtx.fillRect(6, y - 2, W - 12, 16);
          drawText(bottomCtx, '> ' + entries[j].title, 10, y, '#101030');
        } else { drawText(bottomCtx, '  ' + entries[j].title, 10, y, '#fff'); }
      }
      drawBottomHint(bottomCtx, grimoireDetail >= 0 ? 'A or B: back to the list' : 'A: open  B or X: back to the menu');
      drawTextBox(bottomCtx);
    }
  };

  /* ---------- MENU (X) ---------- */
  var menuSel = 0;
  var MENU_ITEMS = ['Party', 'Bag', 'Grimoire', 'Monster Bank', 'Save', 'Settings', 'Quit to Title'];
  /* V9-SYS: menu confirm mode. main, confirmSave (overwrite the save
   * on file), or confirmQuit (quit to title without saving). The
   * selection defaults to No, so an accidental A press changes
   * nothing. */
  var menuMode = 'main';
  var menuConfirmSel = 1;
  screens.menu = {
    enter: function () { menuSel = 0; menuMode = 'main'; menuConfirmSel = 1; },
    onPress: function (a) {
      if (textBox.active) { return; }
      /* V9-SYS: confirm modes eat every press until they resolve.
       * Up and Down flip Yes and No, B and X back out to the menu,
       * A on No backs out, A on Yes does the guarded action. */
      if (menuMode === 'confirmSave' || menuMode === 'confirmQuit') {
        if (a === 'up' || a === 'down') { menuConfirmSel = (menuConfirmSel + 1) % 2; }
        else if (a === 'cancel' || a === 'menu') { menuMode = 'main'; }
        else if (a === 'confirm') {
          if (menuConfirmSel === 0) {
            if (menuMode === 'confirmSave') {
              menuMode = 'main';
              var ok = saveGame();
              showText([ok ? 'Saved. Do not turn off the power.' : 'Save failed.'], null, function () { setScreen('menu'); });
            } else {
              menuMode = 'main';
              setScreen('title');
            }
          } else { menuMode = 'main'; }
        }
        return;
      }
      if (a === 'up') { menuSel = (menuSel + MENU_ITEMS.length - 1) % MENU_ITEMS.length; }
      else if (a === 'down') { menuSel = (menuSel + 1) % MENU_ITEMS.length; }
      else if (a === 'cancel' || a === 'menu') { setScreen('overworld'); }
      else if (a === 'confirm') {
        var pick = MENU_ITEMS[menuSel];
        if (pick === 'Party') { setScreen('party', { returnTo: 'menu' }); }
        else if (pick === 'Bag') { setScreen('bag', { returnTo: 'menu' }); }
        else if (pick === 'Grimoire') { setScreen('grimoire', { returnTo: 'menu' }); }
        else if (pick === 'Monster Bank') {
          /* MENU-BANK fix: the bank screen existed but had no menu entry.
           * Locked line is A9 verbatim. Unlock flag is set by the
           * monster_bank_stop story scene (unlockMonsterBank hook). */
          if (!getFlag('monsterBankUnlocked')) {
            showText(['The Monster Bank unlocks on the road to Saltquay. Broker Voss waits at the Saltquay branch.'], null);
          } else {
            /* Back from the bank returns to the overworld in field
             * mode, not to the menu. setScreen('overworld') clears
             * the stale pause-menu mode on the way back. */
            setScreen('monsterBank', { returnTo: 'overworld' });
          }
        }
        else if (pick === 'Save') {
          /* V9-SYS: saving over a save on file asks first. First
           * save of a session has nothing to overwrite, so it saves
           * straight away. */
          if (hasSave()) { menuMode = 'confirmSave'; menuConfirmSel = 1; }
          else {
            var ok = saveGame();
            showText([ok ? 'Saved. Do not turn off the power.' : 'Save failed.'], null, function () { setScreen('menu'); });
          }
        }
        else if (pick === 'Settings') { setScreen('settings', { returnTo: 'menu' }); }
        else if (pick === 'Quit to Title') {
          /* V9-SYS: quitting never saves. The confirm says so, and
           * No or B leaves the player in the game, untouched. */
          menuMode = 'confirmQuit'; menuConfirmSel = 1;
        }
      }
    },
    update: function () { textUpdate(); },
    draw: function () {
      drawBannerOverBg(topCtx, 'assets/ov3_menu_bg.png', 'MENU', state.trainer.name + '  Lv ' + state.trainer.level + '  Cr ' + state.wallet.cr);
      drawText(topCtx, 'Guide: ' + guideSummary() + '.', 10, 52, '#c8c8e8');
      drawText(topCtx, 'Monster Bank: branches in every town.', 10, 66, '#c8c8e8');
      /* Menu panel art backs the bottom screen list. The list starts
       * at y38 and x24 so every item sits inside the art's blue
       * panel instead of straddling its top gold border or its left
       * gold edge. */
      drawScreenBg(bottomCtx, 'assets/ov3_menu_panel.png');
      if (menuMode === 'confirmSave') {
        drawConfirmPanel(bottomCtx, 'OVERWRITE SAVE?', [
          'Your saved game will be replaced by',
          'this session. The old save cannot',
          'be brought back.'
        ], menuConfirmSel);
      } else if (menuMode === 'confirmQuit') {
        drawConfirmPanel(bottomCtx, 'QUIT TO TITLE?', [
          'Any progress since your last save',
          'will be lost. Quitting does not',
          'save the game.'
        ], menuConfirmSel);
      } else {
        drawMenuList(bottomCtx, '', MENU_ITEMS, menuSel, 38, false, 24);
        drawBottomHint(bottomCtx, 'X or B: close');
      }
      drawTextBox(bottomCtx);
    }
  };

  /* ---------- Main loop: 60 Hz ---------- */
  var lastFrame = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    if (t - lastFrame < 16) { return; }
    lastFrame = t;
    var s = screens[currentScreen];
    if (!delegatedScreen) {
      if (s && s.update) { s.update(t); }
      if (s && s.draw) { s.draw(t); }
    }
    if (currentScreen === 'overworld' && !delegatedScreen) { state.playtimeSec += 1 / 60; }
  }

  /* ---------- Init and public API ---------- */
  var initDone = false;
  function init() {
    if (initDone) { return; }
    initDone = true;
    setupCanvases();
    setupControls();
    setupKeyboard();
    if (window.FED13) {
      window.FED13.screens = { top: topCanvas, bottom: bottomCanvas };
      window.FED13.canvasTop = topCanvas;
      window.FED13.canvasBottom = bottomCanvas;
      window.FED13.getScreen = function (which) { return which === 'bottom' ? bottomCanvas : topCanvas; };
      /* FIX BATCH (battle1v1 canvas): the battle module stops the
       * overworld itself on the direct overworld entry path, where the
       * engine startBattle1v1 stop above never runs. This helper also
       * clears the delegated overworld flag so the return to the
       * overworld re-inits it (key handlers and D-pad included). */
      window.FED13._stopOverworldForBattle = function () {
        try { if (window.FED13.overworld && typeof window.FED13.overworld.stop === 'function') { window.FED13.overworld.stop(); } } catch (e) {}
        delegatedOverworldStarted = false;
      };
      window.FED13.engine = {
        showDialogue: function (line, next, scene) {
          /* Staged scene: the line names its beat, the top screen draws
           * that beat. A scene without staging clears the frame. */
          if (scene && scene.staging && scene.staging.beats && typeof line.beat === 'number') {
            setStaging(scene.staging.beats, line.beat);
          } else {
            clearStaging();
          }
          /* Main Mission 1: the first line of the board scene opens
           * the DS mission card instead of a plain text box. Accept
           * continues the board lines on the card screen. Decline
           * walks away and the board lines never play. Later lines
           * of the same scene play as normal text on the card screen. */
          if (scene && scene.jobBoardCard && line && scene.lines && scene.lines[0] &&
              line.text === scene.lines[0].text) {
            var st = window.FED13.state;
            var already = !!(st && st.flags && st.flags.mainMission1Accepted);
            showMissionCard(scene.jobBoardCard, {
              story: true,
              alreadyAccepted: already,
              onAccept: function () { if (typeof next === 'function') { next(); } },
              onDecline: function () {}
            });
            return;
          }
          var who = (line && line.speakerName) ? line.speakerName + ': ' : '';
          var text = who + ((line && line.text) || '');
          showText([text], (line && line.portrait) || null, function () { if (typeof next === 'function') { next(); } }, (line && line.speakerName) || null);
        },
        playRoadDown: playRoadDownCinematic,
        roadDownCinematic: ROAD_DOWN_CINEMATIC,
        staging: {
          set: setStaging,
          clear: clearStaging,
          current: currentStagingBeat,
          drawFrame: drawStagingFrame,
          drawBag: drawProceduralBag
        },
        showMissionCard: showMissionCard,
        getMainMission1Card: getMainMission1Card,
        /* V9-SYS: read-only verification probe for the Are you sure?
         * confirms. The driver reads this to assert a panel is open
         * (title confirmNewGame, menu confirmSave / confirmQuit,
         * story eggConfirm) and that Cancel / No left it closed. It
         * reports state only and changes nothing. */
        confirmState: function () {
          return {
            title: titleMode,
            titleSel: titleConfirmSel,
            menu: menuMode,
            menuSel: menuConfirmSel,
            story: storyPlay ? storyPlay.phase : null,
            eggSel: storyEggConfirmSel,
            bank: bankPhase,
            bankSellId: bankSellId
          };
        },
        /* FIX BATCH B1: the one story battle consumer, shared by the
         * engine story runner and the overworld trigger chain. */
        startSceneBattle: dispatchStoryBattle
      };
    }
    syncPlayerProfile();
    loadGame();
    loadImage('assets/ov3_title_bg.png'); /* start the title art loading early so the title rarely shows the fallback */
    loadImage('assets/ov4_portrait_trainer_girl_solar.png');
    loadImage('assets/ov4_portrait_trainer_boy_solar.png');
    loadImage('assets/ov4_portrait_trainer_girl_polar.png');
    loadImage('assets/ov4_portrait_trainer_boy_polar.png');
    if (state && state.trainer && state.trainer.name) {
      /* A save exists. Title screen offers Continue. */
    } else {
      state = freshState();
    }
    window.FED13.state = state;
    setScreen('title');
    requestAnimationFrame(loop);
  }

  window.FED13 = {
    version: VERSION,
    state: state,
    get stateRef() { return state; },
    CLASSES: CLASSES,
    CLASS_GROUPS: CLASS_GROUPS,
    CLASS_ICONS: CLASS_ICONS,
    classesInGroup: classesInGroup,
    BLOODLINES: BLOODLINES,
    GRIMOIRES: GRIMOIRES,
    GUIDE_FORMS: GUIDE_FORMS,
    GUIDE_GRIMOIRES: GUIDE_GRIMOIRES,
    ARC_BONDKIN_NAMES: ARC_BONDKIN_NAMES,
    STARTER_DEFS: STARTER_DEFS,
    grimoireEntries: grimoireEntries,
    guideSummary: guideSummary,
    PRONOUNS: PRONOUNS,
    EGGS: EGGS,
    WALLET_CAP: WALLET_CAP,
    showText: showText,
    showMissionCard: showMissionCard,
    getMainMission1Card: getMainMission1Card,
    setScreen: setScreen,
    saveGame: saveGame,
    loadGame: loadGame,
    hasSave: hasSave,
    addCr: addCr,
    monsterBank: monsterBankApi,
    setFlag: setFlag,
    getFlag: getFlag,
    newGame: startNewGame,
    playCutscene: playCutscene,
    playHatchSequence: playHatchSequence,
    hatchEggById: hatchEggById,
    playRoadDownCinematic: playRoadDownCinematic,
    roadDownCinematic: ROAD_DOWN_CINEMATIC,
    coldOpen: COLD_OPEN,
    startColdOpenFarewell: function () { setScreen('intro', { farewell: true }); },
    startBattle1v1: startBattle1v1,
    startColdOpenBattle: startColdOpenBattle,
    playColdOpenFarewell: playColdOpenFarewell,
    startGridBattle: startGridBattle,
    getPartySlots: getPartySlots,
    addArcBondkinToParty: addArcBondkinToParty,
    press: press,
    init: init,
    get currentScreen() { return currentScreen; },
    get options() { return options; }
  };

  /* Keep window.FED13.state live: refresh the reference on load. */
  var _loadGame = loadGame;
  window.FED13.loadGame = function () {
    var r = _loadGame();
    window.FED13.state = state;
    syncPlayerProfile();
    return r;
  };

  /* BUILD PATCH: index.html calls FED13.init() on load, so the engine
   * does not auto start here. Loading engine.js alone does not start
   * the game. */
})();
