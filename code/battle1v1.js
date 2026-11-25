/* FED-13 1v1 Battle System - battle1v1.js
 *
 * Batch 1, code worker C3. Plain JavaScript, no frameworks.
 * Built to the FED-13 DS style guide, section 4 and 4D (Diamond and Pearl
 * 1v1 battles) and the complete story, Parts 5 and 6 (prologue is Mankind
 * only, 1v1 battles on the road to Saltquay, Trial Battle 1 against
 * Maren Saltwright in the Saltquay harbor hall).
 *
 * CANVAS VERSION (fix batch, code worker C2): the battle draws inside
 * the two engine DS canvases, topScreen and bottomScreen (256x192 each,
 * scaled 2x by CSS), instead of building its own DOM block. There is no
 * .fed13-ds block, no injected CSS, no DOM plates or tokens. All sizes
 * below are canvas pixels, which are the old 512x384 DOM sizes halved,
 * so the on-screen look at 2x display scale is unchanged.
 *
 * Layout: top screen holds the battle action, foe top right with its info
 * plate top left, player bottom left with its info plate bottom right.
 * Bottom screen holds the commands: a dark message box on the left and
 * a 2x2 command grid on the right. Move selection shows name, type and
 * PP, plus a Back option. HP bars follow the Gen IV color rules: green
 * above 52.1 percent, yellow at 52.1 percent down to above 20.8 percent,
 * red at 20.8 percent and below. HP drains slowly, with a 0.5 second
 * pause after the attack animation. Front sprite uses a 2-pose idle bob,
 * back sprite gets an entrance movement, then holds mostly still with a
 * small bob. Every effect is shake plus flash plus a projectile or
 * particle burst.
 *
 * Card battle system look: two cream stat plates, two circular sprite
 * tokens (foe green 118px top right, mine gold 104px bottom left, in old
 * DOM pixels; 59px and 52px on the 256x192 canvas), and a bottom command
 * strip with a dark message box on the left and a 2x2 command grid on
 * the right.
 *
 * Names used here: Mankind, Bondkin, Wildlife. The catch item is the
 * Snare Orb. The prompt reads "What will [Wildlife] do?"
 * The king is King Malachar Duskspire. The 5 core Bondkin are Elf,
 * Puffkin, Elderkin, Harefolk and Drakescale. Elf is #001, Totem Spirit
 * Starwarden.
 *
 * All art paths are relative: assets/<filename>.
 *
 * Use: FED13.battle1v1.startBattle(config, onEnd)
 *   config.player: { name, gender: "boy" or "girl", wildlife: {...},
 *                    bondkin: [...], bag: {...} }
 *   config.player.wildlife: { species: "Whelp", level, hp, maxHp,
 *                    xp, xpNext, moves: ["Tackle", "Ember"] }
 *   config.foe: { species: "Ghoul", level, hp, maxHp, moves: [...],
 *                  isWild: true, trainerName: "Maren Saltwright",
 *                  displayName: "Maren Saltwright" }
 *   config.scriptedLoss: { turn: 3 } for an unwinnable battle that
 *                  ends in a scripted loss on that foe attack count, no XP gained
 *   config.resetSpeed: true forces 1x for this battle (Trial Battles,
 *                  Elite Four, Champion, Crown Trial); the remembered
 *                  speed returns after the battle ends
 *   config.battleKind: 'trial' | 'elite' | 'eliteFour' | 'champion' |
 *                  'crown' | 'crownTrial', same 1x force as resetSpeed
 *   config.firstBattle: true forces 1x for the first battle of the game
 *   Battle Fast Forward: a 1x / 2x / 4x button at the top right of the
 *   top canvas, cycled with one tap or FED13.press('speed'). Speed is
 *   remembered between battles in FED13.state.battleSpeed (saved with
 *   the game) and resets to 1x for the first battle, the cold open
 *   scripted loss, and any battle passed resetSpeed or battleKind
 *   above. See the Fast Forward block in the helpers section.
 *   config.environment: "grass", "mountain", "harbor" or "hall"
 *   onEnd(result): result.outcome is "win", "lose", "fled" or "caught".
 *   result also carries the updated player state, xp gained, level ups,
 *   and the caught species when one was caught.
 *
 * Input: FED13.battle1v1.handlePress(action) takes the engine press
 * actions (up, down, left, right, confirm, cancel, menu, start). The
 * engine forwards FED13.press to handlePress while a battle is active
 * (see the engine hook in engine.js), so the page on-screen buttons and
 * the keyboard work through the engine path. Tapping a command, move,
 * item or Bondkin on the bottom canvas works too. F, B and R keys are
 * still shortcuts for Fight, Bag and Run.
 *
 * If engine.js has not loaded yet, this file creates window.FED13 itself
 * so the battle still runs standalone, as long as the two engine
 * canvases (topScreen and bottomScreen) exist on the page.
 */
(function () {
  'use strict';

  var root = (typeof window !== 'undefined') ? window : this;
  root.FED13 = root.FED13 || {};
  var FED13 = root.FED13;

  /* ---------------- canvas size and layout ----------------
   * All numbers are 256x192 canvas pixels: the old 512x384 DOM sizes
   * halved, so the 2x display look is unchanged. */

  var W = 256;
  var H = 192;

  /* Top screen. DS layout: sprites stand large on the field, no
   * token discs. Foe upper right, player lower left, Pokemon
   * Diamond and Pearl style. */
  var FOE_PLATE = { x: 7, y: 7, w: 108, h: 32 };
  var FOE_TOKEN = { x: 168, y: 12, d: 76 };
  var MY_TOKEN = { x: 6, y: 112, d: 68 };
  var MY_PLATE = { x: 141, y: 137, w: 108, h: 48 };

  /* Bottom screen. */
  var MSG_BOX = { x: 7, y: 7, w: 128, h: 178 };
  var GRID_BOX = { x: 141, y: 7, w: 108, h: 178 };

  /* ---------------- assets ---------------- */

  var ASSET = 'assets/';
  function asset(name) { return ASSET + name; }

  /* OV3 (Phase B): grass and harbor backgrounds are ov3 art.
   * Mountain and hall keep the old files, no ov3 art exists for them. */
  var BACKGROUNDS = {
    grass: 'ov3_battle_bg_grass.png',
    mountain: 'bg_mountain.png',
    harbor: 'ov3_battle_bg_harbor.png',
    hall: 'bg_hall.png'
  };
  var BACKGROUND_ALIASES = {
    forest: 'grass', field: 'grass', meadow: 'grass', route: 'grass',
    cave: 'mountain', peak: 'mountain', road: 'grass',
    town: 'harbor', port: 'harbor', saltquay: 'harbor',
    league: 'hall', guild: 'hall', palace: 'hall'
  };
  function backgroundFor(env) {
    var key = String(env || 'grass').toLowerCase();
    if (BACKGROUNDS[key]) { return asset(BACKGROUNDS[key]); }
    if (BACKGROUND_ALIASES[key]) { return asset(BACKGROUNDS[BACKGROUND_ALIASES[key]]); }
    return asset(BACKGROUNDS.grass);
  }

  /* ---------------- moves ---------------- */

  var MOVES = {
    'Tackle':   { name: 'Tackle',   type: 'Normal', power: 40, pp: 35, maxPp: 35, fx: 'fx_slash.png', text: 'charges straight in' },
    'Ember':    { name: 'Ember',    type: 'Fire',   power: 40, pp: 25, maxPp: 25, fx: 'fx_fire.png',  text: 'spits small embers' },
    'Leaf Cut': { name: 'Leaf Cut', type: 'Grass',  power: 45, pp: 30, maxPp: 30, fx: 'fx_slash.png', text: 'slashes with a sharp leaf' },
    'Gust':     { name: 'Gust',     type: 'Flying', power: 40, pp: 35, maxPp: 35, fx: 'fx_slash.png', text: 'whips up a sharp gust' },
    /* COLD OPEN: Maren Saltwright only. No water effect image
     * exists, so the crushing tide uses the blue fx_blizzard image. */
    'Tidal Crush': { name: 'Tidal Crush', type: 'Dark', power: 40, pp: 25, maxPp: 25, fx: 'fx_blizzard.png', text: 'calls a crushing tide' }
  };

  /* COLD OPEN POLISH (adv-coldopen): presentation only. Maren
   * Saltwright, Pisces of the 12, Realm Map member. The turn 3 loss
   * cinematic plays from this spec: white flash, her portrait on
   * screen, her farewell lines, slow fade to black. Damage rules,
   * the no win guard, and the no catch rule belong to the cold open
   * battle worker (C1). This file only stages the loss. */
  var COLD_OPEN = {
    scriptedLossTurn: 3,
    member: 'Maren Saltwright',
    sign: 'Pisces',
    portrait: 'p_maren.png',
    battleSprite: 'b_maren_front.png',
    gridSprite: 'g_maren.png',
    banner: 'map_realm.png',
    lossLines: [
      'Maren Saltwright does not even look tired. The defense line is broken.',
      'Down. All of you, down. I did not even have to try.',
      'I had fun, little defenders. Real fun. I will return again in one year. But this time I will not give you a second chance at defeating me. Train. Pray. It will not matter.'
    ]
  };

  var TYPE_CHART = {
    Fire:   { Fire: 0.5, Grass: 2, Flying: 1, Normal: 1, Ghost: 1, Dark: 1, Dragon: 0.5 },
    Grass:  { Fire: 0.5, Grass: 0.5, Flying: 0.5, Normal: 1, Ghost: 1, Dark: 1, Dragon: 0.5 },
    Flying: { Fire: 1, Grass: 2, Flying: 1, Normal: 1, Ghost: 1, Dark: 1, Dragon: 1 },
    Normal: { Fire: 1, Grass: 1, Flying: 1, Normal: 1, Ghost: 0, Dark: 1, Dragon: 1 },
    Ghost:  { Fire: 1, Grass: 1, Flying: 1, Normal: 0, Ghost: 2, Dark: 0.5, Dragon: 1 },
    Dark:   { Fire: 1, Grass: 1, Flying: 1, Normal: 1, Ghost: 2, Dark: 0.5, Dragon: 1 }
  };
  function effectiveness(moveType, targetTypes) {
    var mult = 1;
    var row = TYPE_CHART[moveType] || {};
    for (var i = 0; i < targetTypes.length; i++) {
      var m = row[targetTypes[i]];
      if (typeof m === 'number') { mult *= m; }
    }
    return mult;
  }

  /* ---------------- Wildlife species ---------------- */

  var SPECIES = {
    Whelp:     { file: 'b_whelp_front.png',     types: ['Fire'],          baseHp: 22, speed: 12, moves: ['Tackle', 'Ember'] },
    Puk:       { file: 'b_puk_front.png',       types: ['Flying', 'Dragon'], baseHp: 20, speed: 16, moves: ['Tackle', 'Gust'] },
    Mandragora:{ file: 'b_mandragora_front.png',types: ['Grass'],         baseHp: 24, speed: 8,  moves: ['Tackle', 'Leaf Cut'] },
    Ghoul:     { file: 'b_ghoul_front.png',     types: ['Ghost', 'Dark'], baseHp: 20, speed: 10, moves: ['Tackle', 'Gust'] },
    Slime:     { file: 'b_slime_front.png',     types: ['Normal'],        baseHp: 26, speed: 6,  moves: ['Tackle'] },
    Goblin:    { file: 'b_goblin_front.png',    types: ['Dark'],          baseHp: 22, speed: 11, moves: ['Tackle', 'Ember'] },
    /* COLD OPEN: Maren Saltwright, Pisces of the 12, Realm Map
     * member. Far stronger than any defender. Only ever fought in the
     * scripted loss cold open (and Trial Battle 1, later). File
     * b_maren_front.png exists in assets. */
    Maren:     { file: 'b_maren_front.png',     types: ['Dark'],          baseHp: 90, speed: 30, moves: ['Tidal Crush'] },
    /* COLD OPEN: the cold open defender. Mankind, one of the
     * defense line, fought before creation, so there is no egg, no
     * starter Wildlife and no Bondkin yet. The player token still
     * shows the trainer back sprite, as for every 1v1. Basic strikes
     * only. Maren shrugs them off in scripted loss mode. */
    Defender:  { file: 'b_trainer_boy_back.png', types: ['Normal'],       baseHp: 24, speed: 10, moves: ['Tackle', 'Ember'] }
  };

  /* ---------------- Bondkin bloodlines ---------------- */

  var BLOODLINES = {
    Elf:       { totem: 'Starwarden',          num: '001', move: 'Leaf Cut', types: ['Grass'] },
    Puffkin:   { totem: 'Brightpom Sovereign', num: '002', move: 'Gust',     types: ['Flying'] },
    Elderkin:  { totem: 'Quiet Flame Sage',    num: '003', move: 'Ember',    types: ['Fire'] },
    Harefolk:  { totem: 'Moonhare Matriarch',  num: '004', move: 'Gust',     types: ['Flying'] },
    Drakescale:{ totem: 'Emberwyrm King',      num: '005', move: 'Ember',    types: ['Fire'] }
  };

  var TRAINER_BACK = {
    boy: 'b_trainer_boy_back.png',
    girl: 'b_trainer_girl_back.png'
  };

  /* ---------------- HP bar color rules (Gen IV) ----------------
   * Green above 52.1 percent, yellow at 52.1 percent down to above
   * 20.8 percent, red at 20.8 percent and below.
   */
  function hpColor(hp, maxHp) {
    if (!maxHp || maxHp <= 0) { return '#e5484d'; }
    var frac = hp / maxHp;
    if (frac > 0.521) { return '#3fae4a'; }
    if (frac > 0.208) { return '#f5c542'; }
    return '#e5484d';
  }
  function hpColorName(hp, maxHp) {
    var c = hpColor(hp, maxHp);
    if (c === '#3fae4a') { return 'green'; }
    if (c === '#f5c542') { return 'yellow'; }
    return 'red';
  }

  /* ---------------- helpers ---------------- */

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  /* ---------------- Battle Fast Forward ----------------
   * Spec: new-game.md "Battle Fast Forward". Three speeds, 1x, 2x, 4x,
   * cycled with one press. The button sits top right of the top
   * canvas (SPEED_BUTTON) and always shows the current speed. Speed
   * scales every timed part of a battle: message waits (sayWait),
   * sleeps, later() delays, HP drains, effect, damage number, shake,
   * wobble, flash and fade visuals. Player choices are never scaled:
   * handlePress still waits for input, and the command menu never
   * auto advances. At 4x every flourish still plays, at its shortest
   * form: the floors below (sayWait 100 ms, sleep 40 ms, drain
   * 200 ms) keep each beat visible instead of skipping it.
   *
   * Memory: the chosen speed lives in rememberedSpeed and is written
   * to the save data as FED13.state.battleSpeed (engine saveGame
   * serializes the whole state, so it saves with the game), mirrored
   * to localStorage key fed13_battle_speed for standalone runs.
   *
   * Reset: startBattle forces 1x when opts.resetSpeed is true, when
   * opts.battleKind is 'trial', 'elite', 'eliteFour', 'champion' or
   * 'crown' (also 'crownTrial'), when the battle is the scripted
   * cold open loss, or when it is the first battle of the game (no
   * speed was ever remembered). Callers that run those battles pass
   * the option: engine.js startBattle1v1 should forward
   * opts.resetSpeed / opts.battleKind into the cfg it hands to
   * startBattle, and story/grid callers for Trial, Elite Four,
   * Champion and Crown Trial battles do the same. After such a
   * battle ends, currentSpeed returns to the remembered speed.
   * No caller passes the option today, so the cold open and first
   * battle defaults above are what enforce 1x for them.
   */
  var SPEEDS = [1, 2, 4];
  var SPEED_BUTTON = { x: 212, y: 6, w: 38, h: 16 };
  var RESET_BATTLE_KINDS = ['trial', 'elite', 'elitefour', 'champion', 'crown', 'crowntrial', 'crown-trial'];
  var currentSpeed = 1;
  var rememberedSpeed = 1;
  var battleCount = 0;
  function validSpeed(n) { return SPEEDS.indexOf(n) >= 0 ? n : 1; }
  function loadRememberedSpeed() {
    var found = false;
    try {
      if (FED13.state && typeof FED13.state.battleSpeed === 'number') {
        rememberedSpeed = validSpeed(FED13.state.battleSpeed);
        found = true;
      }
    } catch (e) { /* no save state yet */ }
    if (!found) {
      try {
        if (typeof localStorage !== 'undefined') {
          var raw = localStorage.getItem('fed13_battle_speed');
          if (raw !== null && !isNaN(Number(raw))) { rememberedSpeed = validSpeed(Number(raw)); found = true; }
        }
      } catch (e) { /* storage unavailable */ }
    }
    return found;
  }
  function persistSpeed() {
    try {
      if (FED13.state && typeof FED13.state === 'object') { FED13.state.battleSpeed = rememberedSpeed; }
    } catch (e) { /* no save state yet */ }
    try {
      if (typeof localStorage !== 'undefined') { localStorage.setItem('fed13_battle_speed', String(rememberedSpeed)); }
    } catch (e) { /* storage unavailable */ }
    try {
      if (typeof FED13.saveGame === 'function') { FED13.saveGame(); }
    } catch (e) { /* save is optional here */ }
  }
  function getSpeed() { return currentSpeed; }
  function getRememberedSpeed() { return rememberedSpeed; }
  function setSpeed(n) {
    var v = validSpeed(n);
    rememberedSpeed = v;
    currentSpeed = v;
    persistSpeed();
    return v;
  }
  function cycleSpeed() {
    var next = SPEEDS[(SPEEDS.indexOf(currentSpeed) + 1) % SPEEDS.length];
    return setSpeed(next);
  }
  /* Scale a millisecond delay by the current speed, never below the
   * floor, so a flourish at 4x is short, never skipped. */
  function scaleMs(ms, minMs) {
    return Math.max(typeof minMs === 'number' ? minMs : 1, Math.round(ms / currentSpeed));
  }
  function sleep(ms, minMs) { return new Promise(function (res) { setTimeout(res, scaleMs(ms, typeof minMs === 'number' ? minMs : 40)); }); }
  function sfx(name) {
    try {
      if (FED13.audio && typeof FED13.audio.play === 'function') { FED13.audio.play(name); }
    } catch (e) { /* sound is optional */ }
  }
  function upperName(name) { return String(name || '').toUpperCase(); }

  /* Image cache. Missing files are marked _missing so the draw code can
   * fall back to a letter token instead of retrying every frame. */
  var imageCache = {};
  function loadImage(path) {
    if (imageCache[path]) { return imageCache[path]; }
    var img = new Image();
    img.src = path;
    img.onerror = function () { img._missing = true; };
    imageCache[path] = img;
    return img;
  }
  function imageReady(img) {
    return !!img && !img._missing && img.complete && img.naturalWidth > 0;
  }

  /* Find the engine canvases, the same way grid.js findScreen does:
   * FED13.screens, then FED13.canvasTop / canvasBottom, then
   * FED13.getScreen, then the page ids topScreen / bottomScreen. This
   * module never creates its own canvases. */
  function findScreen(which) {
    var f = FED13;
    if (f.screens && f.screens[which]) { return f.screens[which]; }
    var cap = which.charAt(0).toUpperCase() + which.slice(1);
    if (f['canvas' + cap]) { return f['canvas' + cap]; }
    if (typeof f.getScreen === 'function') {
      try { return f.getScreen(which); } catch (e) { /* fall through */ }
    }
    if (typeof document !== 'undefined') {
      var el = document.getElementById(which === 'top' ? 'topScreen' : 'bottomScreen');
      if (el && el.getContext) { return el; }
    }
    return null;
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = String(text || '').split(' ');
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
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------------- battler factory ---------------- */

  function makeWildlifeBattler(data, isPlayerSide) {
    var species = (data && data.species) || 'Whelp';
    var spec = SPECIES[species] || SPECIES.Whelp;
    var level = (data && data.level) || 5;
    var maxHp = (data && data.maxHp) || Math.round(spec.baseHp + level * 2);
    var hp = (data && typeof data.hp === 'number') ? data.hp : maxHp;
    var moves = (data && data.moves && data.moves.length) ? data.moves.slice() : spec.moves.slice();
    var pp = {};
    moves.forEach(function (m) {
      var def = MOVES[m] || MOVES.Tackle;
      pp[m] = (data && data.pp && typeof data.pp[m] === 'number') ? data.pp[m] : def.pp;
    });
    return {
      kind: 'wildlife',
      name: species,
      species: species,
      displayName: species,
      level: level,
      hp: clamp(hp, 0, maxHp),
      maxHp: maxHp,
      xp: (data && data.xp) || 0,
      xpNext: (data && data.xpNext) || level * 20,
      types: spec.types.slice(),
      speed: spec.speed,
      moves: moves,
      pp: pp,
      sprite: spec.file,
      isPlayerSide: !!isPlayerSide
    };
  }

  function makeBondkinBattler(data) {
    var bloodline = (data && data.bloodline) || 'Elf';
    var info = BLOODLINES[bloodline] || BLOODLINES.Elf;
    var level = (data && data.level) || 5;
    var maxHp = (data && data.maxHp) || (20 + level * 2);
    var hp = (data && typeof data.hp === 'number') ? data.hp : maxHp;
    var move = info.move;
    var moves = ['Tackle', move];
    var pp = {};
    moves.forEach(function (m) {
      var def = MOVES[m] || MOVES.Tackle;
      pp[m] = (data && data.pp && typeof data.pp[m] === 'number') ? data.pp[m] : def.pp;
    });
    return {
      kind: 'bondkin',
      name: (data && data.name) || bloodline,
      species: bloodline,
      displayName: (data && data.name) || bloodline,
      bloodline: bloodline,
      totem: info.totem,
      level: level,
      hp: clamp(hp, 0, maxHp),
      maxHp: maxHp,
      xp: (data && data.xp) || 0,
      xpNext: (data && data.xpNext) || level * 20,
      types: info.types.slice(),
      speed: 11,
      moves: moves,
      pp: pp,
      sprite: null,
      isPlayerSide: true
    };
  }

  function calcDamage(attacker, defender, move) {
    var stab = attacker.types.indexOf(move.type) >= 0 ? 1.5 : 1;
    var eff = effectiveness(move.type, defender.types);
    var rand = 0.85 + Math.random() * 0.15;
    var base = move.power * (attacker.level / 8 + 1);
    var dmg = Math.round((base * stab * eff * rand) / 6);
    return { damage: Math.max(1, dmg), eff: eff };
  }

  function pickFoeMove(foe, player) {
    var usable = foe.moves.filter(function (m) {
      return (foe.pp[m] || 0) > 0 && MOVES[m];
    });
    if (!usable.length) { return 'Tackle'; }
    var best = usable.filter(function (m) {
      return effectiveness(MOVES[m].type, player.types) > 1;
    });
    if (best.length && Math.random() < 0.6) {
      return best[Math.floor(Math.random() * best.length)];
    }
    return usable[Math.floor(Math.random() * usable.length)];
  }

  /* The active battle, if any. The engine press hook reads isActive and
   * forwards to handlePress, so FED13.press works while a battle runs. */
  var activeBattle = null;

  /* Module level live battle state for verification. startBattle fills
   * liveBattle with live references to its own state, battlers and bag,
   * so FED13.battle1v1.getState() reads the current turn count, HP and
   * outcome without starting a new battle. It is kept after endBattle
   * so the final outcome stays readable. Null when no battle ran yet. */
  var liveBattle = null;

  function getState() {
    if (!liveBattle) { return null; }
    var s = liveBattle.state;
    var a = liveBattle.getActive();
    var f = liveBattle.foe;
    var rt = liveBattle.runtime;
    return {
      active: !s.over,
      isActive: !s.over,
      over: s.over,
      outcome: liveBattle.outcome || null,
      turns: s.turns,
      turn: s.turns,
      playerHp: a ? a.hp : null,
      playerMaxHp: a ? a.maxHp : null,
      playerSpecies: a ? a.species : null,
      playerLevel: a ? a.level : null,
      player: a ? { species: a.species, displayName: a.displayName, level: a.level, hp: a.hp, maxHp: a.maxHp } : null,
      playerBattler: a || null,
      foeHp: f ? f.hp : null,
      foeMaxHp: f ? f.maxHp : null,
      foeSpecies: f ? f.species : null,
      foeLevel: f ? f.level : null,
      foe: f ? { species: f.species, displayName: f.displayName, level: f.level, hp: f.hp, maxHp: f.maxHp } : null,
      foeBattler: f || null,
      bag: liveBattle.bag ? { snareOrb: liveBattle.bag.snareOrb, lurefruit: liveBattle.bag.lurefruit, tonic: liveBattle.bag.tonic } : null,
      panel: rt ? rt.panel : null,
      sel: rt ? rt.sel : null,
      speed: currentSpeed,
      rememberedSpeed: rememberedSpeed
    };
  }

  /* ---------------- startBattle ---------------- */

  function startBattle(config, onEnd) {
    config = config || {};
    var done = false;
    var timers = [];
    function later(fn, ms) {
      /* FAST FORWARD: every later() delay scales with the speed. */
      var id = setTimeout(fn, scaleMs(ms, 10));
      timers.push(id);
      return id;
    }
    function finish(result) {
      if (done) { return; }
      done = true;
      timers.forEach(function (id) { clearTimeout(id); });
      if (typeof onEnd === 'function') {
        try { onEnd(result); } catch (e) { /* callback errors stay with the caller */ }
      }
    }

    /* ----- find the engine canvases (never create our own) ----- */
    var topCanvas = findScreen('top');
    var bottomCanvas = findScreen('bottom');
    if (!topCanvas || !bottomCanvas) {
      throw new Error('FED13.battle1v1.startBattle: engine canvases topScreen and bottomScreen not found');
    }
    var topCtx = topCanvas.getContext('2d');
    var bottomCtx = bottomCanvas.getContext('2d');
    topCtx.imageSmoothingEnabled = false;
    bottomCtx.imageSmoothingEnabled = false;

    /* ----- normalize config ----- */
    var playerCfg = config.player || {};
    var foeCfg = config.foe || {};
    var environment = config.environment || foeCfg.environment || 'grass';
    var isWild = (typeof foeCfg.isWild === 'boolean') ? foeCfg.isWild
      : (typeof config.isWild === 'boolean') ? config.isWild : true;
    var trainerName = foeCfg.trainerName || config.trainerName || null;
    var gender = (playerCfg.gender === 'girl') ? 'girl' : 'boy';
    var trainerName2 = playerCfg.name || 'Trainer';

    var active = makeWildlifeBattler(playerCfg.wildlife || { species: 'Whelp', level: 5 }, true);
    var foe = makeWildlifeBattler({
      species: foeCfg.species || 'Ghoul',
      level: foeCfg.level || 5,
      hp: foeCfg.hp,
      maxHp: foeCfg.maxHp,
      moves: foeCfg.moves,
      pp: foeCfg.pp
    }, false);
    /* COLD OPEN: a foe display name longer than its species key.
     * Maren fights as species Maren but is shown as Maren Saltwright
     * on the plate and in every message. */
    if (foeCfg.displayName) { foe.displayName = foeCfg.displayName; }
    /* COLD OPEN: scripted loss. config.scriptedLoss is
     * { turn: 3 } or true (turn defaults to 3, the turn in
     * story.js COLD_OPEN_SCRIPTED_LOSS_TURN). When set, the battle
     * cannot be won, the foe cannot be caught, running is refused
     * (trainer battle), and the foe ends the battle on that turn. */
    var scriptedCfg = config.scriptedLoss || foeCfg.scriptedLoss || null;
    var scriptedLossTurn = COLD_OPEN.scriptedLossTurn;
    if (scriptedCfg && typeof scriptedCfg.turn === 'number') { scriptedLossTurn = scriptedCfg.turn; }

    /* FAST FORWARD: decide the speed for this battle. */
    battleCount += 1;
    var hadRememberedSpeed = loadRememberedSpeed();
    var resetKind = config.resetSpeed ? 'resetspeed'
      : (config.battleKind ? String(config.battleKind).toLowerCase().replace(/[\s_]+/g, '') : '');
    var forcedReset = !!config.resetSpeed
      || !!config.firstBattle
      || RESET_BATTLE_KINDS.indexOf(resetKind) >= 0
      || !!scriptedCfg
      || (battleCount === 1 && !hadRememberedSpeed);
    currentSpeed = forcedReset ? 1 : rememberedSpeed;

    /* OV3 (Phase B): Saltquay battles use the harbor background. No
     * caller passes environment harbor today, and the engine fills in
     * grass as the default, so when the battle location is Saltquay
     * (or the overworld map is saltquay) a default grass battle
     * becomes a harbor battle. Scripted loss battles keep the
     * environment they were given. */
    if (!scriptedCfg && environment === 'grass') {
      var battleLoc = '';
      try { battleLoc = String((FED13.state && FED13.state.location) || ''); } catch (e) { battleLoc = ''; }
      var owMapId = '';
      try { owMapId = String((FED13.overworld && FED13.overworld.state && FED13.overworld.state.mapId) || ''); } catch (e) { owMapId = ''; }
      if (/saltquay/i.test(battleLoc) || /harbor/i.test(battleLoc) || owMapId.toLowerCase() === 'saltquay') { environment = 'harbor'; }
    }

    var bench = [];
    var bondkinCfg = playerCfg.bondkin || [{ name: 'Starwarden', bloodline: 'Elf', level: 5 }];
    bondkinCfg.forEach(function (b) { bench.push(makeBondkinBattler(b)); });

    var bag = {
      snareOrb: 5,
      lurefruit: 2,
      tonic: 3
    };
    if (playerCfg.bag) {
      if (typeof playerCfg.bag.snareOrb === 'number') { bag.snareOrb = playerCfg.bag.snareOrb; }
      if (typeof playerCfg.bag.lurefruit === 'number') { bag.lurefruit = playerCfg.bag.lurefruit; }
      if (typeof playerCfg.bag.tonic === 'number') { bag.tonic = playerCfg.bag.tonic; }
    }

    /* Preload the images the battle draws, so showFx can tell a missing
     * effect file from one that simply has not loaded yet. */
    /* BUBBLE-FIX: the token ring art and the plate art are no longer
     * drawn. Sprites stand straight on the field, plates and command
     * buttons are drawn procedurally below. The asset files stay on
     * disk, they are just not used. */
    var bgImg = loadImage(backgroundFor(environment));
    var dialogImg = loadImage(asset('ov3_dialog_box_dark.png'));
    var foeImg = loadImage(asset(foe.sprite));
    var myImg = loadImage(asset(TRAINER_BACK[gender]));
    loadImage(asset('fx_slash.png'));
    var marenImg = loadImage(asset(COLD_OPEN.portrait));
    loadImage(asset('fx_fire.png'));
    loadImage(asset('fx_cure.png'));
    loadImage(asset('fx_snare_burst.png'));

    /* The overworld owns the top canvas while it runs. Stop it for the
     * battle, the same way the engine stops it for a grid battle, and
     * restart it before the end callback runs. The engine path already
     * stops it in startBattle1v1, so this only fires on the direct
     * overworld path, where the battle is started straight from
     * overworld.js. */
    var stoppedOverworld = false;
    var usedEngineHelper = false;
    try {
      if (FED13.overworld && FED13.overworld.state && FED13.overworld.state.running) {
        if (typeof FED13._stopOverworldForBattle === 'function') {
          FED13._stopOverworldForBattle();
          usedEngineHelper = true;
        } else if (typeof FED13.overworld.stop === 'function') {
          FED13.overworld.stop();
        }
        stoppedOverworld = true;
      }
    } catch (e) { stoppedOverworld = false; }

    var state = {
      busy: true,
      over: false,
      lureActive: false,
      xpGained: 0,
      levelUps: [],
      caught: null,
      turns: 0,
      scriptedLoss: !!scriptedCfg,
      scriptedLossTurn: scriptedLossTurn,
      scriptedTurns: 0,
      scriptedLossPlayed: false
    };

    /* ----- battle runtime (canvas state) ----- */
    var b = {
      topCanvas: topCanvas,
      bottomCanvas: bottomCanvas,
      topCtx: topCtx,
      bottomCtx: bottomCtx,
      msg: '',
      panel: 'commands',
      panelForced: false,
      sel: 0,
      hitRects: [],
      raf: 0,
      startedAt: Date.now(),
      introAt: Date.now(),
      foeShownHp: foe.hp,
      myShownHp: active.hp,
      foeFainted: false,
      myFainted: false,
      foeFaintAt: 0,
      myFaintAt: 0,
      foeShakeAt: 0,
      myShakeAt: 0,
      foeWobbleAt: 0,
      flashAt: 0,
      marenCardAt: 0,
      fadeAt: 0,
      fxList: [],
      dmgList: []
    };
    activeBattle = b;
    liveBattle = {
      state: state,
      foe: foe,
      bag: bag,
      runtime: b,
      outcome: null,
      getActive: function () { return active; }
    };

    /* ----- message and panel helpers ----- */
    function say(text) {
      b.msg = text;
    }
    function sayWait(text, ms) {
      say(text);
      /* FAST FORWARD: message advance scales, floor 100 ms so the
       * text stays readable at 4x. */
      return sleep(typeof ms === 'number' ? ms : 1100, 100);
    }
    function syncShown() {
      b.foeShownHp = foe.hp;
      b.myShownHp = active.hp;
    }
    function setPanel(mode, forced) {
      b.panel = mode;
      b.panelForced = !!forced;
      b.sel = 0;
    }
    function tokenRect(battler) {
      return battler.isPlayerSide ? MY_TOKEN : FOE_TOKEN;
    }
    function shakeToken(battler) {
      if (battler.isPlayerSide) { b.myShakeAt = Date.now(); }
      else { b.foeShakeAt = Date.now(); }
      later(function () { /* shake is time based, drawn from the timestamp */ }, 400);
    }
    function doFlash() {
      b.flashAt = Date.now();
    }

    /* BUILD PATCH, kept from the DOM version: procedural slash fallback.
     * fx_slash.png now exists in build/assets, so this only runs when
     * the image fails to load: draw
     * the white sword slash arc with impact sparks at the target token,
     * same look as grid.js drawFxSlash, animated over about 550 ms.
     * In the canvas version the slash is an entry in b.fxList, drawn
     * each frame by drawTop instead of a DOM canvas overlay. */
    function drawSlashFallback(token) {
      b.fxList.push({ kind: 'slash', token: token, started: Date.now(), dur: 550 });
      later(function () {
        b.fxList = b.fxList.filter(function (e) { return e.kind !== 'slash' || e.token !== token || Date.now() - e.started < 900; });
      }, 900);
    }
    function showFx(file, targetBattler, big) {
      var token = tokenRect(targetBattler);
      var img = loadImage(asset(file));
      if (imageReady(img)) {
        b.fxList.push({ kind: 'img', img: img, token: token, big: !!big, started: Date.now(), dur: 900 });
        return;
      }
      if (img._missing) {
        if (file === 'fx_slash.png') { drawSlashFallback(token); }
        return;
      }
      /* Not loaded yet: draw it when it arrives, or fall back then. */
      img.onload = function () {
        if (!state.over) { b.fxList.push({ kind: 'img', img: img, token: token, big: !!big, started: Date.now(), dur: 900 }); }
      };
      img.onerror = function () {
        if (file === 'fx_slash.png' && !state.over) { drawSlashFallback(token); }
      };
    }
    function showDamageNumber(targetBattler, amount) {
      var token = tokenRect(targetBattler);
      b.dmgList.push({ text: '-' + amount, x: token.x + 10, y: token.y - 4, started: Date.now(), dur: 900 });
    }

    /* Slow HP drain: 0.5s pause after the attack, then a slow drain.
     * The plates draw b.foeShownHp / b.myShownHp, so the drain animates
     * the shown value while battler.hp already holds the final value. */
    function drainHp(battler, fromHp, toHp) {
      return new Promise(function (resolve) {
        var total = Math.abs(fromHp - toHp);
        if (total === 0) { syncShown(); resolve(); return; }
        /* FAST FORWARD: the drain duration scales, floor 200 ms. The
         * step interval scales through later(), so the step count
         * stays the same at every speed. */
        var duration = scaleMs(clamp(600 + total * 45, 700, 2600), 200);
        var start = Date.now();
        var step = function () {
          var t = clamp((Date.now() - start) / duration, 0, 1);
          var shown = Math.round(fromHp + (toHp - fromHp) * t);
          if (battler.isPlayerSide) { b.myShownHp = shown; } else { b.foeShownHp = shown; }
          if (t >= 1) {
            battler.hp = toHp;
            syncShown();
            resolve();
          } else {
            later(step, 50);
          }
        };
        later(step, 500);
      });
    }

    /* ----- canvas drawing ----- */
    function tokenAnim(battler, now) {
      /* Returns the draw offset, rotation and alpha for a token. Idle
       * bob, entrance, shake, wobble and faint all come from timestamps,
       * so the render loop needs no per-frame state of its own. */
      var out = { dx: 0, dy: 0, rot: 0, alpha: 1 };
      var isMine = battler.isPlayerSide;
      /* FAST FORWARD: entrance, shake, wobble and faint all run on
       * scaled elapsed time, so they finish 2x / 4x faster. The idle
       * bob below is ambient and stays at normal speed. */
      var enterMs = (now - b.introAt) * currentSpeed;
      if (enterMs < 600) {
        var p = 1 - Math.pow(1 - enterMs / 600, 3);
        if (isMine) { out.dy = (1 - p) * 30; out.alpha = p; }
        else { out.dx = (1 - p) * 45; out.alpha = p; }
        return out;
      }
      var shakeAt = isMine ? b.myShakeAt : b.foeShakeAt;
      var shakeMs = (now - shakeAt) * currentSpeed;
      if (shakeMs >= 0 && shakeMs < 350) {
        var seq = [0, -4, 4, -3, 2, 0];
        out.dx = seq[Math.min(seq.length - 1, Math.floor(shakeMs / 60))];
      }
      var wobbleAt = isMine ? 0 : b.foeWobbleAt;
      var wobbleMs = (now - wobbleAt) * currentSpeed;
      if (!isMine && wobbleMs >= 0 && wobbleMs < 550) {
        out.rot = Math.sin((wobbleMs / 550) * Math.PI * 2) * 0.16;
      }
      var faintAt = isMine ? b.myFaintAt : b.foeFaintAt;
      var fainted = isMine ? b.myFainted : b.foeFainted;
      if (fainted) {
        var f = faintAt ? clamp((now - faintAt) * currentSpeed / 600, 0, 1) : 1;
        out.alpha = 1 - f;
        out.dy = f * 15;
        return out;
      }
      var period = isMine ? 1300 : 1100;
      out.dy = Math.sin((now / period) * Math.PI * 2) * -2;
      return out;
    }

    function drawToken(ctx, battler, now) {
      var rect = tokenRect(battler);
      var isMine = battler.isPlayerSide;
      var anim = tokenAnim(battler, now);
      var cx = rect.x + rect.d / 2 + anim.dx;
      var cy = rect.y + rect.d / 2 + anim.dy;
      var d = rect.d;
      ctx.save();
      ctx.globalAlpha = anim.alpha;
      ctx.translate(cx, cy);
      if (anim.rot) { ctx.rotate(anim.rot); }
      ctx.translate(-cx, -cy);
      /* DS ground shadow only: a flat dark ellipse under the sprite.
       * No solid disc, no circle clip, no ring art. The sprite stands
       * straight on the battle field, Pokemon Diamond and Pearl style. */
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + d / 2 - 3, d * 0.42, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      /* Sprite drawn full size, bottom anchored, never clipped. */
      var img = null;
      var letter = battler.displayName.charAt(0);
      if (isMine) {
        if (battler.kind === 'bondkin') { img = null; letter = battler.displayName.charAt(0); }
        else { img = myImg; }
      } else {
        img = foeImg;
      }
      if (imageReady(img)) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, cx - d / 2, cy - d / 2, d, d);
      } else {
        /* Square name tile, DS style, for a Bondkin with no battle art. */
        ctx.fillStyle = '#20242a';
        ctx.fillRect(cx - 14, cy - 14, 28, 28);
        ctx.strokeStyle = '#d9a441';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 14, cy - 14, 28, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, cx, cy + 1);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
      }
      ctx.restore();
    }

    function drawPlate(ctx, rect, name, level, hp, maxHp, showNumbers, xp, xpNext) {
      ctx.save();
      /* DS plate, drawn procedurally: sharp corners, cream body, navy
       * border, gold rule along the bottom, colored top stripe (red
       * for the foe plate, blue for the player plate). No plate art,
       * no rounded edge. */
      var isFoePlate = rect.y < 100;
      ctx.fillStyle = '#20242a';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = '#fffbe8';
      ctx.fillRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
      ctx.fillStyle = isFoePlate ? '#c0392b' : '#2a5db0';
      ctx.fillRect(rect.x + 2, rect.y + 2, rect.w - 4, 2);
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(rect.x + 2, rect.y + rect.h - 4, rect.w - 4, 2);
      ctx.fillStyle = '#20242a';
      ctx.font = 'bold 8px monospace';
      ctx.textBaseline = 'top';
      /* V4 FIX: shrink a long plate name to fit instead of truncating
       * it. "MAREN SALTWRIGHT" at 8px is wider than the name area, so
       * try 8px, then 7px, then 6px, and only truncate with an
       * ellipsis if it still does not fit at 6px. Short names stay at
       * 8px, untouched. No em dashes in any visible text. */
      var lvText = 'Lv ' + level;
      var nameText = upperName(name);
      var nameSize = 8;
      var lvWidth = 0;
      var maxNameWidth = 0;
      while (nameSize >= 6) {
        ctx.font = 'bold ' + nameSize + 'px monospace';
        lvWidth = ctx.measureText(lvText).width;
        maxNameWidth = rect.w - 6 - 4 - lvWidth - 6;
        if (ctx.measureText(nameText).width <= maxNameWidth) { break; }
        nameSize -= 1;
      }
      if (ctx.measureText(nameText).width > maxNameWidth) {
        while (nameText.length > 0 && ctx.measureText(nameText + '...').width > maxNameWidth) {
          nameText = nameText.slice(0, -1);
        }
        nameText = nameText + '...';
      }
      ctx.fillText(nameText, rect.x + 6, rect.y + 4);
      ctx.fillText(lvText, rect.x + rect.w - 6 - lvWidth, rect.y + 4);
      /* HP bar. */
      var barX = rect.x + 6;
      var barY = rect.y + 16;
      var barW = rect.w - 12;
      ctx.fillStyle = '#20242a';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, 7);
      ctx.fillStyle = '#888888';
      ctx.fillRect(barX, barY, barW, 5);
      ctx.fillStyle = hpColor(hp, maxHp);
      ctx.fillRect(barX, barY, Math.round(barW * clamp(hp / Math.max(1, maxHp), 0, 1)), 5);
      if (showNumbers) {
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#20242a';
        var num = hp + ' / ' + maxHp;
        ctx.fillText(num, rect.x + rect.w - 6 - ctx.measureText(num).width, barY + 9);
        /* XP bar. */
        var xpY = barY + 20;
        ctx.fillStyle = '#cfc4a0';
        ctx.fillRect(barX, xpY, barW, 3);
        ctx.fillStyle = '#4a90d9';
        ctx.fillRect(barX, xpY, Math.round(barW * clamp((xp || 0) / Math.max(1, xpNext || 1), 0, 1)), 3);
      }
      ctx.restore();
    }

    function drawSlash(ctx, entry, now) {
      var token = entry.token;
      var t = clamp((now - entry.started) * currentSpeed / 550, 0, 1);
      var cx = token.x + token.d / 2;
      var cy = token.y + token.d / 2;
      var size = 44;
      ctx.save();
      ctx.lineCap = 'round';
      var a0 = -0.4 + t * 1.6;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(2, size * 0.10);
      ctx.beginPath(); ctx.arc(cx, cy, size * 0.45, a0 - 1.1, a0 + 0.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(180,220,255,0.9)';
      ctx.lineWidth = Math.max(1, size * 0.045);
      ctx.beginPath(); ctx.arc(cx, cy, size * 0.45, a0 - 0.9, a0 + 0.3); ctx.stroke();
      for (var i = 0; i < 6; i++) {
        var ang = a0 + (i - 2.5) * 0.35;
        var r1 = size * (0.30 + t * 0.35);
        var r2 = r1 + size * 0.16;
        ctx.strokeStyle = (i % 2 === 0) ? '#ffffff' : '#ffe98a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawTop(now) {
      var ctx = topCtx;
      ctx.fillStyle = '#7fae6a';
      ctx.fillRect(0, 0, W, H);
      if (imageReady(bgImg)) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(bgImg, 0, 0, W, H);
      }
      drawPlate(ctx, FOE_PLATE, foe.displayName, foe.level, b.foeShownHp, foe.maxHp, false, 0, 0);
      drawToken(ctx, foe, now);
      drawToken(ctx, active, now);
      drawPlate(ctx, MY_PLATE, active.displayName, active.level, b.myShownHp, active.maxHp, true, active.xp, active.xpNext);
      /* Effects. FAST FORWARD: effect and damage number lifetimes run
       * on scaled elapsed time, so they clear 2x / 4x faster. */
      b.fxList = b.fxList.filter(function (e) { return (now - e.started) * currentSpeed < e.dur; });
      b.fxList.forEach(function (e) {
        if (e.kind === 'slash') { drawSlash(ctx, e, now); return; }
        if (!imageReady(e.img)) { return; }
        var size = e.big ? 95 : 48;
        var cx = e.token.x + e.token.d / 2 - size / 2;
        var cy = e.token.y + e.token.d / 2 - size / 2;
        var p = clamp((now - e.started) * currentSpeed / 550, 0, 1);
        var s = size * (0.4 + 0.75 * p);
        ctx.globalAlpha = clamp(1.2 - p, 0, 1);
        ctx.drawImage(e.img, cx + (size - s) / 2, cy + (size - s) / 2, s, s);
        ctx.globalAlpha = 1;
      });
      /* Damage numbers, rising and fading. */
      b.dmgList = b.dmgList.filter(function (d) { return (now - d.started) * currentSpeed < d.dur; });
      b.dmgList.forEach(function (d) {
        var p = (now - d.started) * currentSpeed / d.dur;
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.font = 'bold 13px monospace';
        ctx.fillStyle = '#20242a';
        ctx.fillText(d.text, d.x + 1, d.y - p * 12 + 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(d.text, d.x, d.y - p * 12);
        ctx.restore();
      });
      /* Flash. */
      var flashMs = (now - b.flashAt) * currentSpeed;
      if (flashMs >= 0 && flashMs < 300) {
        var fp = flashMs / 300;
        ctx.fillStyle = 'rgba(255,255,255,' + (fp < 0.3 ? (fp / 0.3) * 0.85 : 0.85 * (1 - (fp - 0.3) / 0.7)) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      /* Scripted loss cinematic: Maren portrait card with a gold
       * border, then a slow fade to black. */
      if (b.marenCardAt) {
        if (imageReady(marenImg)) {
          ctx.fillStyle = '#20242a';
          ctx.fillRect(84, 20, 88, 88);
          ctx.drawImage(marenImg, 88, 24, 80, 80);
          ctx.strokeStyle = '#d9a441';
          ctx.lineWidth = 4;
          ctx.strokeRect(84, 20, 88, 88);
        }
        ctx.fillStyle = '#20242a';
        ctx.fillRect(68, 112, 120, 20);
        ctx.strokeStyle = '#d9a441';
        ctx.lineWidth = 3;
        ctx.strokeRect(68, 112, 120, 20);
        ctx.fillStyle = '#ffe9a8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('MAREN SALTWRIGHT', 128, 126);
        ctx.textAlign = 'left';
      }
      if (b.fadeAt) {
        var fadeP = clamp((now - b.fadeAt) * currentSpeed / 1600, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,' + fadeP.toFixed(2) + ')';
        ctx.fillRect(0, 0, W, H);
      }
      /* FAST FORWARD: the speed button, drawn last so it stays visible
       * and tappable over the tokens and the fade. */
      drawSpeedButton(ctx);
    }

    /* FAST FORWARD: the speed button, top right of the top canvas.
     * 38x16 canvas pixels, always shows the current speed. */
    function drawSpeedButton(ctx) {
      var r = SPEED_BUTTON;
      ctx.save();
      roundRect(ctx, r.x, r.y, r.w, r.h, 3);
      ctx.fillStyle = '#20242a';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#d9a441';
      ctx.stroke();
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentSpeed + 'x', r.x + r.w / 2, r.y + r.h / 2 + 1);
      ctx.restore();
    }

    /* OV3 (Phase B): draw a bordered panel image as a 9-slice, so the
     * corners keep their shape while the edges and center stretch to
     * the box. s is the source corner inset, c the dest corner size. */
    function drawNineSlice(ctx, img, x, y, w, h, s, c) {
      var sw = img.naturalWidth;
      var sh = img.naturalHeight;
      var mw = w - c * 2;
      var mh = h - c * 2;
      ctx.drawImage(img, 0, 0, s, s, x, y, c, c);
      ctx.drawImage(img, sw - s, 0, s, s, x + w - c, y, c, c);
      ctx.drawImage(img, 0, sh - s, s, s, x, y + h - c, c, c);
      ctx.drawImage(img, sw - s, sh - s, s, s, x + w - c, y + h - c, c, c);
      ctx.drawImage(img, s, 0, sw - s * 2, s, x + c, y, mw, c);
      ctx.drawImage(img, s, sh - s, sw - s * 2, s, x + c, y + h - c, mw, c);
      ctx.drawImage(img, 0, s, s, sh - s * 2, x, y + c, c, mh);
      ctx.drawImage(img, sw - s, s, s, sh - s * 2, x + w - c, y + c, c, mh);
      ctx.drawImage(img, s, s, sw - s * 2, sh - s * 2, x + c, y + c, mw, mh);
    }

    function drawBottom(now) {
      var ctx = bottomCtx;
      ctx.fillStyle = '#2a2f3a';
      ctx.fillRect(0, 0, W, H);
      /* Message box, dark, left side. Sharp DS corners. */
      ctx.save();
      roundRect(ctx, MSG_BOX.x, MSG_BOX.y, MSG_BOX.w, MSG_BOX.h, 2);
      if (imageReady(dialogImg)) {
        /* OV3 (Phase B): dark dialogue art as the message box. The
         * 512x128 art is 9-sliced into the 128x178 portrait box so
         * the border and corner studs keep their shape. */
        ctx.save();
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        drawNineSlice(ctx, dialogImg, MSG_BOX.x, MSG_BOX.y, MSG_BOX.w, MSG_BOX.h, 24, 12);
        ctx.restore();
      } else {
        ctx.fillStyle = '#10131a';
        ctx.fill();
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f2f2f2';
      ctx.stroke();
      ctx.fillStyle = '#f2f2f2';
      ctx.font = '9px monospace';
      ctx.textBaseline = 'top';
      /* V8 FIX: the dialog art corner diamonds straddle the 9-slice
       * seam, so they render as a vertical spike at about +12px that
       * clips the first letter of the first line. Start text at +16px
       * and narrow the wrap to match. */
      var lines = wrapLines(ctx, b.msg, MSG_BOX.w - 24);
      for (var i = 0; i < lines.length && i < 12; i++) {
        ctx.fillText(lines[i], MSG_BOX.x + 16, MSG_BOX.y + 8 + i * 13);
      }
      if (Math.floor(now / 400) % 2 === 0) {
        ctx.fillText('v', MSG_BOX.x + MSG_BOX.w - 14, MSG_BOX.y + MSG_BOX.h - 14);
      }
      ctx.restore();
      b.hitRects = [];
      if (b.panel === 'commands') { drawCommandGrid(now); }
      else { drawPanel(now); }
    }

    function drawCommandGrid(now) {
      var ctx = bottomCtx;
      var labels = ['FIGHT', 'BAG', 'BONDKIN', 'RUN'];
      var gap = 5;
      var cw = (GRID_BOX.w - gap) / 2;
      var ch = (GRID_BOX.h - gap) / 2;
      for (var i = 0; i < 4; i++) {
        var x = GRID_BOX.x + (i % 2) * (cw + gap);
        var y = GRID_BOX.y + Math.floor(i / 2) * (ch + gap);
        b.hitRects.push({ x: x, y: y, w: cw, h: ch, index: i, kind: 'command' });
        ctx.save();
        /* DS command button, drawn procedurally: sharp corners, white
         * body, navy border, colored side stripe per command (FIGHT
         * red, BAG gold, BONDKIN green, RUN blue). Selected button
         * fills gold with a dark arrow marker. No command art. */
        var cmdColors = ['#c0392b', '#8a6414', '#2a7a3a', '#2a5db0'];
        roundRect(ctx, x, y, cw, ch, 2);
        ctx.fillStyle = (i === b.sel) ? '#ffe9a8' : '#ffffff';
        ctx.fill();
        ctx.fillStyle = cmdColors[i];
        ctx.fillRect(x + 2, y + 2, 4, ch - 4);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#20242a';
        ctx.stroke();
        if (i === b.sel) {
          /* Selection arrow sits left of the label: keep it clear of
           * the first letter (FIGHT and BONDKIN are wide enough that
           * a centered label runs into the arrow at x + 9). */
          ctx.fillStyle = '#20242a';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText('>', x + 8, y + ch / 2 + 1);
        }
        ctx.fillStyle = '#20242a';
        /* V4 FIX: BONDKIN at 10px is wider than its button, so draw
         * that label at 8px. The other three labels stay at 10px. */
        ctx.font = labels[i] === 'BONDKIN' ? 'bold 8px monospace' : 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        /* V8 FIX: shift a selected label right so the arrow clears it. */
        ctx.fillText(labels[i], x + cw / 2 + (i === b.sel ? 6 : 0), y + ch / 2 + 1);
        ctx.restore();
      }
    }

    /* Panel item lists, built live from the battle state so the draw
     * always shows current PP, counts and HP. Each entry carries its
     * hit rect and what confirming it does. */
    function panelItems() {
      if (b.panel === 'moves') {
        var moves = active.moves.map(function (moveName) {
          var move = MOVES[moveName] || MOVES.Tackle;
          return { kind: 'move', label: move.name, sub: 'PP ' + (active.pp[moveName] || 0) + ' / ' + move.maxPp, type: move.type, move: moveName, disabled: (active.pp[moveName] || 0) <= 0 };
        });
        moves.push({ kind: 'back', label: 'Back', disabled: false });
        return { title: 'Choose a move', items: moves };
      }
      if (b.panel === 'bag') {
        var items = [
          { kind: 'item', label: 'Snare Orb x' + bag.snareOrb, fn: 'snare', disabled: bag.snareOrb <= 0 },
          { kind: 'item', label: 'Lurefruit x' + bag.lurefruit, fn: 'lure', disabled: bag.lurefruit <= 0 },
          { kind: 'item', label: 'Tonic x' + bag.tonic, fn: 'tonic', disabled: bag.tonic <= 0 }
        ];
        items.push({ kind: 'back', label: 'Back', disabled: false });
        return { title: 'Bag', items: items };
      }
      if (b.panel === 'bondkin') {
        var mates = bench.map(function (mate) {
          return { kind: 'mate', label: mate.displayName + '  Lv ' + mate.level, sub: mate.hp + ' / ' + mate.maxHp, mate: mate, disabled: mate.hp <= 0 || mate === active };
        });
        mates.push({ kind: 'back', label: 'Back', disabled: b.panelForced });
        return { title: b.panelForced ? 'Send out a Bondkin' : 'Bondkin', items: mates };
      }
      return { title: '', items: [] };
    }

    function drawPanel(now) {
      var ctx = bottomCtx;
      var data = panelItems();
      var x = GRID_BOX.x;
      var y = GRID_BOX.y;
      var w = GRID_BOX.w;
      var h = GRID_BOX.h;
      ctx.save();
      /* DS panel: sharp corners, light body, navy border, gold title
       * bar. No command art. */
      roundRect(ctx, x, y, w, h, 2);
      ctx.fillStyle = '#f2f2f2';
      ctx.fill();
      ctx.fillStyle = '#20242a';
      ctx.fillRect(x + 2, y + 2, w - 4, 14);
      ctx.fillStyle = '#d9a441';
      ctx.fillRect(x + 2, y + 16, w - 4, 1);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#20242a';
      ctx.stroke();
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(data.title, x + 6, y + 6);
      var iy = y + 20;
      data.items.forEach(function (item, i) {
        var ih = item.kind === 'move' ? 30 : 22;
        if (item.kind === 'back') { ih = 18; }
        if (iy + ih > y + h - 4) { return; }
        b.hitRects.push({ x: x + 4, y: iy, w: w - 8, h: ih, index: i, kind: 'panel' });
        ctx.save();
        if (item.disabled) { ctx.globalAlpha = 0.45; }
        if (i === b.sel) {
          roundRect(ctx, x + 4, iy, w - 8, ih, 4);
          ctx.fillStyle = '#ffe9a8';
          ctx.fill();
        }
        if (item.kind === 'back') {
          roundRect(ctx, x + 4, iy, w - 8, ih, 4);
          ctx.fillStyle = (i === b.sel) ? '#3a3f4a' : '#20242a';
          ctx.fill();
          ctx.fillStyle = '#f2f2f2';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.label, x + w / 2, iy + ih / 2 + 1);
        } else {
          roundRect(ctx, x + 4, iy, w - 8, ih, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#20242a';
          ctx.stroke();
          ctx.fillStyle = '#20242a';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(item.label, x + 8, iy + 3);
          if (item.type) {
            ctx.font = '7px monospace';
            ctx.fillStyle = '#555555';
            ctx.fillText(item.type, x + w - 8 - ctx.measureText(item.type).width, iy + 3);
          }
          if (item.sub) {
            ctx.font = '7px monospace';
            ctx.fillStyle = '#555555';
            ctx.fillText(item.sub, x + 8, iy + 13);
          }
        }
        ctx.restore();
        iy += ih + 4;
      });
      ctx.restore();
    }

    function loop(now) {
      if (state.over && !b.raf) { return; }
      /* MERGE FIX: the rAF timestamp is ms since page load, but every
       * effect stamp (flashAt, shakeAt, wobbleAt, faintAt, introAt,
       * marenCardAt, fadeAt) is Date.now(). now - stamp was hugely
       * negative, so flash, shake, wobble, faint and the loss fade
       * never drew. Drive the frame from Date.now() instead. */
      var t = Date.now();
      drawTop(t);
      drawBottom(t);
      b.raf = requestAnimationFrame(loop);
    }

    /* ----- input: bottom canvas tap and engine press ----- */
    function toGameCoords(ev) {
      var r = bottomCanvas.getBoundingClientRect();
      var px = (ev.clientX - r.left) * (W / r.width);
      var py = (ev.clientY - r.top) * (H / r.height);
      return { x: px, y: py };
    }
    function hitAt(px, py) {
      for (var i = 0; i < b.hitRects.length; i++) {
        var r = b.hitRects[i];
        if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) { return r; }
      }
      return null;
    }
    function activateHit(hit) {
      if (!hit || state.busy || state.over) { return; }
      b.sel = hit.index;
      activateSel();
    }
    function onCanvasTap(ev) {
      if (ev && ev.preventDefault) { ev.preventDefault(); }
      var p = toGameCoords(ev.touches ? ev.touches[0] : ev);
      activateHit(hitAt(p.x, p.y));
    }
    /* FAST FORWARD: tapping the speed button on the top canvas cycles
     * the speed. Works during busy animations too, since the button
     * is checked before the busy guard. */
    function onTopCanvasTap(ev) {
      if (state.over) { return; }
      if (ev && ev.preventDefault) { ev.preventDefault(); }
      var r = topCanvas.getBoundingClientRect();
      var src = (ev.touches && ev.touches[0]) ? ev.touches[0] : ev;
      var px = (src.clientX - r.left) * (W / r.width);
      var py = (src.clientY - r.top) * (H / r.height);
      if (px >= SPEED_BUTTON.x && px <= SPEED_BUTTON.x + SPEED_BUTTON.w &&
          py >= SPEED_BUTTON.y && py <= SPEED_BUTTON.y + SPEED_BUTTON.h) {
        cycleSpeed();
        sfx('select');
      }
    }
    function activateSel() {
      if (state.busy || state.over) { return; }
      sfx('select');
      if (b.panel === 'commands') {
        var defs = [showMoves, showBag, showBondkin, attemptRun];
        var fn = defs[b.sel];
        if (fn) { fn(); }
        return;
      }
      var data = panelItems();
      var item = data.items[b.sel];
      if (!item || item.disabled) { return; }
      if (item.kind === 'back') { showCommands(); return; }
      if (item.kind === 'move') { usePlayerMove(item.move); return; }
      if (item.kind === 'item') {
        if (item.fn === 'snare') { useSnareOrb(); }
        else if (item.fn === 'lure') { useLurefruit(); }
        else if (item.fn === 'tonic') { useTonic(); }
        return;
      }
      if (item.kind === 'mate') { swapToBondkin(item.mate, b.panelForced); return; }
    }
    function moveSel(delta, wrap) {
      var count = b.panel === 'commands' ? 4 : panelItems().items.length;
      if (!count) { return; }
      b.sel = ((b.sel + delta) % count + count) % count;
    }
    function handlePress(action) {
      /* FAST FORWARD: 'speed' cycles 1x to 2x to 4x to 1x even while
       * the battle is busy (mid animation, enemy turn), so the player
       * can speed up a slow animation already in progress. The engine
       * routes FED13.press('speed') here while a battle is active. */
      if (action === 'speed') {
        if (!state.over) { cycleSpeed(); sfx('select'); }
        return;
      }
      if (state.over || state.busy) { return; }
      if (action === 'up') {
        if (b.panel === 'commands') { moveSel(-2); } else { moveSel(-1); }
      } else if (action === 'down') {
        if (b.panel === 'commands') { moveSel(2); } else { moveSel(1); }
      } else if (action === 'left') {
        if (b.panel === 'commands') { moveSel(-1); }
      } else if (action === 'right') {
        if (b.panel === 'commands') { moveSel(1); }
      } else if (action === 'confirm' || action === 'start') {
        activateSel();
      } else if (action === 'cancel') {
        if (b.panel !== 'commands' && !b.panelForced) { showCommands(); }
      }
    }
    b.handlePress = handlePress;

    bottomCanvas.addEventListener('click', onCanvasTap);
    var touchHandler = function (ev) { onCanvasTap(ev); };
    bottomCanvas.addEventListener('touchstart', touchHandler, { passive: false });
    topCanvas.addEventListener('click', onTopCanvasTap);
    var topTouchHandler = function (ev) { onTopCanvasTap(ev); };
    topCanvas.addEventListener('touchstart', topTouchHandler, { passive: false });
    function onKey(e) {
      if (state.over || state.busy) { return; }
      var k = (e.key || '').toLowerCase();
      if (k === 'f') { showMoves(); }
      /* B reaches the battle twice: the engine maps KeyB to
       * press('cancel'), which forwards here, and this listener also
       * fires. So B is only a Bag shortcut from the command panel,
       * where cancel is a no-op. In a submenu B is just Back. */
      else if (k === 'b' && b.panel === 'commands') { showBag(); }
      else if (k === 'r') { attemptRun(); }
    }
    document.addEventListener('keydown', onKey);

    function cleanupInput() {
      bottomCanvas.removeEventListener('click', onCanvasTap);
      bottomCanvas.removeEventListener('touchstart', touchHandler);
      topCanvas.removeEventListener('click', onTopCanvasTap);
      topCanvas.removeEventListener('touchstart', topTouchHandler);
      document.removeEventListener('keydown', onKey);
    }

    /* ----- command panels ----- */
    function showCommands() {
      if (state.over) { return; }
      state.busy = false;
      setPanel('commands', false);
      say('What will ' + active.displayName + ' do?');
    }

    /* MERGE FIX (fixbatch assembly): show commands after a foe attack
     * only when the round is truly over. A forced Bondkin swap pending
     * (panel bondkin, forced) must not be clobbered by the command panel,
     * or the player fights on with a fainted Wildlife. */
    function showCommandsAfterFoe() {
      if (state.over) { return; }
      if (b.panel === 'bondkin' && b.panelForced) { return; }
      showCommands();
    }

    function showMoves() {
      state.busy = false;
      setPanel('moves', false);
      say('Choose a move.');
    }

    function showBag() {
      state.busy = false;
      setPanel('bag', false);
      say('Choose an item.');
    }

    function showBondkin(forced) {
      state.busy = false;
      setPanel('bondkin', !!forced);
      var anyUsable = bench.some(function (m) { return m.hp > 0 && m !== active; });
      if (!anyUsable && !forced) {
        say('No Bondkin is ready to battle right now.');
      } else {
        say(forced ? 'Send out a Bondkin to keep fighting.' : 'Choose a Bondkin.');
      }
    }

    /* ----- battle flow ----- */
    function usePlayerMove(moveName) {
      if (state.busy || state.over) { return; }
      state.busy = true;
      setPanel('commands', false);
      var move = MOVES[moveName] || MOVES.Tackle;
      if ((active.pp[moveName] || 0) <= 0) {
        say('No PP left for ' + move.name + '.');
        later(function () { showCommands(); }, 900);
        return;
      }
      active.pp[moveName] -= 1;
      state.turns += 1;
      var playerFirst = active.speed >= foe.speed;
      if (playerFirst) {
        runMove(active, foe, move).then(function () {
          if (state.over) { return; }
          if (foe.hp <= 0) { return winBattle(); }
          return foeTurn(true).then(showCommandsAfterFoe);
        });
      } else {
        foeTurn(true).then(function () {
          if (state.over) { return; }
          if (active.hp <= 0) { return loseCheck(); }
          return runMove(active, foe, move);
        }).then(function () {
          if (state.over) { return; }
          if (foe.hp <= 0) { return winBattle(); }
          showCommandsAfterFoe();
        });
      }
    }

    function runMove(attacker, defender, move) {
      return sayWait(attacker.displayName + ' ' + move.text + '! ' + move.name + '!', 900)
        .then(function () {
          showFx(move.fx, defender, false);
          doFlash();
          sfx('attack');
          return sleep(350);
        })
        .then(function () {
          shakeToken(defender);
          var result = calcDamage(attacker, defender, move);
          /* COLD OPEN: scripted loss damage. Maren is far
           * stronger, so his hits land for exactly one third of the
           * defender max HP: three hits break the defense line on
           * turn 3, and no Tonic can change the count. The defender
           * scratches Maren for 1 damage a hit and can never drop
           * him below 1 HP, so the battle cannot be won early. */
          if (state.scriptedLoss) {
            if (defender === foe) {
              result.damage = 1;
              result.eff = 1;
            } else {
              result.damage = Math.max(1, Math.ceil(defender.maxHp / 3));
              result.eff = 1;
            }
          }
          var fromHp = defender.hp;
          var toHp = clamp(defender.hp - result.damage, 0, defender.maxHp);
          if (state.scriptedLoss && defender === foe) { toHp = Math.max(1, toHp); }
          showDamageNumber(defender, result.damage);
          var effText = '';
          if (result.eff === 0) { effText = ' It had no effect.'; }
          else if (result.eff > 1) { effText = ' It is super effective!'; }
          else if (result.eff < 1) { effText = ' It is not very effective.'; }
          return drainHp(defender, fromHp, toHp).then(function () {
            if (effText) { return sayWait(effText.trim(), 800); }
          });
        });
    }

    /* MERGE FIX (fixbatch assembly): foeTurn used to call showCommands()
     * after the foe attack even when called mid-round from usePlayerMove's
     * slow branch, where the player's move was still pending. That set
     * busy false and showed the command panel for ~1.75s while a move was
     * already queued, so a confirm press started a duplicate round: an
     * extra foe attack per round, and in the cold open scriptedTurns read
     * 4 instead of 3 with the loss cinematic played twice. Callers that
     * own the round end now pass skipCommands true and show commands
     * themselves; the bag/swap paths that end the round on the foe attack
     * keep the old behaviour (skipCommands falsy). */
    function foeTurn(skipCommands) {
      var moveName = pickFoeMove(foe, active);
      var move = MOVES[moveName] || MOVES.Tackle;
      if ((foe.pp[moveName] || 0) > 0) { foe.pp[moveName] -= 1; }
      return runMove(foe, active, move).then(function () {
        if (state.over) { return; }
        /* COLD OPEN: count Maren attacks, not player HP. Every
         * turn spent, Fight, Bag, Bondkin swap or Tonic, ends in a
         * Maren attack, so the count reaches the scripted turn no
         * matter what the player does. On that turn the scripted
         * loss plays instead of the normal faint or command flow.
         * One counter only: state.scriptedTurns (C1). */
        if (state.scriptedLoss) {
          state.scriptedTurns += 1;
          if (state.scriptedTurns >= state.scriptedLossTurn) { return scriptedLossEnd(); }
        }
        if (active.hp <= 0) { return loseCheck(); }
        if (!skipCommands && !state.over) { showCommands(); }
      });
    }

    function swapToBondkin(mate, forced) {
      state.busy = true;
      setPanel('commands', false);
      var old = active;
      var idx = bench.indexOf(mate);
      if (idx >= 0) { bench.splice(idx, 1); }
      if (old.kind === 'bondkin' || old.kind === 'wildlife') {
        bench.push(old);
      }
      active = mate;
      active.isPlayerSide = true;
      /* The new fighter shows again: clear the faint fade the old one
       * left on the player token. The DOM version left the fainted
       * class on the token after a swap, which hid the new fighter. */
      b.myFainted = false;
      b.myFaintAt = 0;
      syncShown();
      sayWait('Go! ' + mate.displayName + '!', 1100).then(function () {
        if (state.over) { return; }
        if (forced) {
          showCommands();
          return;
        }
        return foeTurn(true).then(showCommandsAfterFoe);
      });
    }

    function loseCheck() {
      /* COLD OPEN: a scripted loss never plays the generic
       * lose text. If the defender falls early for any reason,
       * Maren still delivers the scripted loss. */
      if (state.scriptedLoss) { return scriptedLossEnd(); }
      var usable = bench.filter(function (m) { return m.hp > 0; });
      if (usable.length) {
        return sayWait(active.displayName + ' fainted!', 1100).then(function () {
          b.myFainted = true;
          b.myFaintAt = Date.now();
          say('Send out a Bondkin to keep fighting.');
          showBondkin(true);
        });
      }
      b.myFainted = true;
      b.myFaintAt = Date.now();
      return sayWait(active.displayName + ' fainted!', 1100).then(function () {
        return loseBattle();
      });
    }

    function useTonic() {
      if (state.busy || state.over) { return; }
      if (bag.tonic <= 0) { return; }
      state.busy = true;
      setPanel('commands', false);
      bag.tonic -= 1;
      var healed = clamp(active.hp + 20, 0, active.maxHp) - active.hp;
      var fromHp = active.hp;
      var toHp = clamp(active.hp + 20, 0, active.maxHp);
      sayWait('You used a Tonic on ' + active.displayName + '.', 1000)
        .then(function () {
          showFx('fx_cure.png', active, false);
          doFlash();
          sfx('heal');
          return drainHp(active, fromHp, toHp);
        })
        .then(function () {
          return sayWait(active.displayName + ' recovered ' + healed + ' HP.', 900);
        })
        .then(function () {
          if (state.over) { return; }
          return foeTurn(true).then(showCommandsAfterFoe);
        });
    }

    function useLurefruit() {
      if (state.busy || state.over) { return; }
      if (bag.lurefruit <= 0) { return; }
      if (!isWild) {
        say('Lurefruit only works on wild Wildlife.');
        later(function () { showCommands(); }, 1000);
        return;
      }
      state.busy = true;
      setPanel('commands', false);
      bag.lurefruit -= 1;
      state.lureActive = true;
      sayWait('You offer a Lurefruit. The wild ' + foe.displayName + ' calms down and drifts closer.', 1400)
        .then(function () {
          if (state.over) { return; }
          return foeTurn(true).then(showCommandsAfterFoe);
        });
    }

    function useSnareOrb() {
      if (state.busy || state.over) { return; }
      if (bag.snareOrb <= 0) {
        say('No Snare Orbs left.');
        later(function () { showCommands(); }, 1000);
        return;
      }
      /* COLD OPEN: Maren Saltwright cannot be caught. */
      if (state.scriptedLoss) {
        say('You cannot catch Maren Saltwright.');
        later(function () { showCommands(); }, 1000);
        return;
      }
      if (!isWild) {
        say('You cannot catch a trainer Wildlife.');
        later(function () { showCommands(); }, 1000);
        return;
      }
      state.busy = true;
      setPanel('commands', false);
      bag.snareOrb -= 1;
      var hpFrac = foe.hp / foe.maxHp;
      var chance = 0.2 + (1 - hpFrac) * 0.55 + (state.lureActive ? 0.25 : 0);
      if (foe.level <= active.level) { chance += 0.05; }
      chance = clamp(chance, 0.05, 0.95);
      var caught = Math.random() < chance;
      sayWait('You throw a Snare Orb! The Burst swallows the light...', 1300)
        .then(function () {
          showFx('fx_snare_burst.png', foe, true);
          doFlash();
          sfx('catch');
          b.foeFainted = true;
          b.foeFaintAt = Date.now();
          return sleep(700);
        })
        .then(function () { return wobble(1); })
        .then(function () { return wobble(2); })
        .then(function () { return wobble(3); })
        .then(function () {
          if (caught) {
            state.caught = foe.species;
            return sayWait('Got it! ' + foe.displayName + ' was caught!', 1400)
              .then(function () { return endAsCaught(); });
          }
          b.foeFainted = false;
          b.foeFaintAt = 0;
          return sayWait('The Snare Orb broke open. The wild ' + foe.displayName + ' broke free!', 1300)
            .then(function () {
              if (state.over) { return; }
              return foeTurn(true).then(showCommandsAfterFoe);
            });
        });
    }
    function wobble(n) {
      b.foeWobbleAt = Date.now();
      sfx('wobble');
      return sleep(650);
    }

    function attemptRun() {
      if (state.busy || state.over) { return; }
      if (!isWild) {
        say('You cannot run from a trainer battle.');
        later(function () { showCommands(); }, 1100);
        return;
      }
      state.busy = true;
      setPanel('commands', false);
      var chance = foe.level <= active.level ? 0.85 : 0.6;
      if (Math.random() < chance) {
        sayWait('You got away safely!', 1100).then(function () { endBattle('fled'); });
      } else {
        sayWait('You could not get away!', 1000).then(function () {
          if (state.over) { return; }
          return foeTurn(true).then(showCommandsAfterFoe);
        });
      }
    }

    function xpForWin() {
      return foe.level * 12 + (isWild ? 10 : 25);
    }

    /* COLD OPEN: the turn 3 loss cinematic. Same name as the
     * cold open battle worker (C1) uses for the plain text ending,
     * so the merged file keeps one body: this cinematic one (A6).
     * Plays once, on the scripted turn, no matter the HP left. White
     * flash, Maren speaks with her portrait card on the top screen,
     * slow fade to black. The result carries scriptedLoss true so the
     * engine knows to play the farewell scene, never the generic loss.
     * Canvas adaptation: the DOM flash, portrait card and fade are
     * drawn by drawTop from b.marenCardAt / b.fadeAt instead. */
    function scriptedLossEnd() {
      if (state.over) { return Promise.resolve(); }
      /* MERGE FIX (fixbatch assembly): the loss cinematic takes ~7.7s
       * before endBattle sets over, so a second call in that window
       * used to play it twice. Play it once per battle. */
      if (state.scriptedLossPlayed) { return Promise.resolve(); }
      state.scriptedLossPlayed = true;
      state.busy = true;
      setPanel('commands', false);
      b.myFainted = true;
      b.myFaintAt = Date.now();
      sfx('lose');
      doFlash();
      b.marenCardAt = Date.now();
      return sayWait(COLD_OPEN.lossLines[0], 1600)
        .then(function () { return sayWait(COLD_OPEN.lossLines[1], 1800); })
        .then(function () { return sayWait(COLD_OPEN.lossLines[2], 2600); })
        .then(function () {
          b.marenCardAt = 0;
          b.fadeAt = Date.now();
          return sleep(1700);
        })
        .then(function () { endBattle('lose'); });
    }

    function winBattle() {
      if (state.over) { return Promise.resolve(); }
      /* COLD OPEN: a scripted loss battle can never be won.
       * Maren HP is floored at 1, so this is a second guard only. */
      if (state.scriptedLoss) { return Promise.resolve(); }
      state.busy = true;
      setPanel('commands', false);
      b.foeFainted = true;
      b.foeFaintAt = Date.now();
      var gain = xpForWin();
      state.xpGained += gain;
      var winText = isWild
        ? 'The wild ' + foe.displayName + ' fainted!'
        : 'You beat ' + (trainerName || 'the trainer') + '!';
      return sayWait(winText, 1200)
        .then(function () {
          active.xp += gain;
          return sayWait(active.displayName + ' gained ' + gain + ' XP.', 1100);
        })
        .then(function () { return levelUpCheck(); })
        .then(function () { endBattle('win'); });
    }

    function levelUpCheck() {
      /* Apply every level up synchronously first, then play the
       * messages one at a time. The XP math must finish before the
       * message chain runs, or the while loop never ends. */
      var newLevels = [];
      var guard = 0;
      while (active.xp >= active.xpNext && guard < 20) {
        guard += 1;
        active.xp -= active.xpNext;
        active.level += 1;
        active.xpNext = active.level * 20;
        active.maxHp += 4;
        active.hp = clamp(active.hp + 4, 0, active.maxHp);
        state.levelUps.push(active.level);
        newLevels.push(active.level);
      }
      syncShown();
      var chain = Promise.resolve();
      newLevels.forEach(function (lv) {
        chain = chain.then(function () {
          sfx('levelup');
          return sayWait(active.displayName + ' grew to Lv ' + lv + '! Max HP rose by 4.', 1300);
        });
      });
      return chain;
    }

    function loseBattle() {
      if (state.over) { return; }
      state.busy = true;
      setPanel('commands', false);
      say('You have no Wildlife left able to battle. You lost the battle.');
      sfx('lose');
      later(function () { endBattle('lose'); }, 1600);
    }

    function endAsCaught() {
      var gain = Math.round(xpForWin() / 2);
      state.xpGained += gain;
      active.xp += gain;
      return levelUpCheck().then(function () { endBattle('caught'); });
    }

    function playerStateOut() {
      var wildlifeOut = null;
      var bondkinOut = [];
      var all = bench.concat([active]);
      all.forEach(function (battler) {
        var out = {
          name: battler.displayName,
          species: battler.species,
          level: battler.level,
          hp: battler.hp,
          maxHp: battler.maxHp,
          xp: battler.xp,
          xpNext: battler.xpNext,
          moves: battler.moves.slice(),
          pp: JSON.parse(JSON.stringify(battler.pp))
        };
        if (battler.kind === 'bondkin') { out.bloodline = battler.bloodline; out.totem = battler.totem; }
        if (battler.kind === 'wildlife' && !wildlifeOut) { wildlifeOut = out; }
        if (battler.kind === 'bondkin') { bondkinOut.push(out); }
      });
      return {
        name: trainerName2,
        gender: gender,
        wildlife: wildlifeOut || {
          species: active.species, level: active.level, hp: active.hp,
          maxHp: active.maxHp, xp: active.xp, xpNext: active.xpNext,
          moves: active.moves.slice(), pp: JSON.parse(JSON.stringify(active.pp))
        },
        bondkin: bondkinOut,
        bag: { snareOrb: bag.snareOrb, lurefruit: bag.lurefruit, tonic: bag.tonic }
      };
    }

    /* ROUND 2 BUG B/C: fleeing (or winning, or losing) a wild battle
     * returns to the overworld in place. restartOverworldIfStopped
     * runs before the end callback, and overworld.start() now resumes
     * the current map and position instead of reloading the last
     * save, and re-attaches the keyboard listeners and D-pad that
     * stop() removed. Do not load a save or reset the position here:
     * the old reload is what teleported a fleeing player back to
     * Gatehollow (10,12) and wiped the road progress. */
    function restartOverworldIfStopped() {
      if (!stoppedOverworld) { return; }
      stoppedOverworld = false;
      try {
        if (usedEngineHelper && typeof FED13.setScreen === 'function') {
          FED13.setScreen('overworld');
        } else if (FED13.overworld) {
          var c = FED13.overworld.state && FED13.overworld.state.canvas;
          if (c && typeof FED13.overworld.init === 'function') { FED13.overworld.init(c); }
          if (typeof FED13.overworld.start === 'function') { FED13.overworld.start(); }
        }
      } catch (e) { /* the end callback still runs below */ }
    }

    function endBattle(outcome) {
      if (state.over) { return; }
      state.over = true;
      state.busy = true;
      /* FAST FORWARD: a forced 1x battle hands the remembered speed
       * back the moment it ends. */
      if (forcedReset) { currentSpeed = rememberedSpeed; }
      if (liveBattle && liveBattle.state === state) { liveBattle.outcome = outcome; }
      var result = {
        outcome: outcome,
        foeSpecies: foe.species,
        foeLevel: foe.level,
        isWild: isWild,
        trainerName: trainerName,
        environment: environment,
        xpGained: state.xpGained,
        levelUps: state.levelUps.slice(),
        caught: state.caught,
        turns: state.turns,
        scriptedLoss: state.scriptedLoss,
        scriptedLossTurn: state.scriptedLossTurn,
        scriptedTurns: state.scriptedTurns,
        player: playerStateOut()
      };
      later(function () {
        if (b.raf) { cancelAnimationFrame(b.raf); b.raf = 0; }
        cleanupInput();
        if (activeBattle === b) { activeBattle = null; }
        /* Clear the canvases so no stale battle UI stays on screen.
         * The overworld loop redraws the top canvas on its next frame. */
        topCtx.fillStyle = '#000000';
        topCtx.fillRect(0, 0, W, H);
        bottomCtx.fillStyle = '#0a0a1e';
        bottomCtx.fillRect(0, 0, W, H);
        restartOverworldIfStopped();
        finish(result);
      }, outcome === 'lose' || outcome === 'win' || outcome === 'caught' ? 400 : 200);
    }

    /* ----- intro ----- */
    function intro() {
      var first = state.scriptedLoss
        ? 'Maren Saltwright stands alone against the whole defense line.'
        : isWild
        ? 'A wild ' + foe.displayName + ' appeared!'
        : (trainerName || 'Trainer') + ' sent out ' + foe.displayName + '!';
      sayWait(first, 1300)
        .then(function () {
          return sayWait('Go! ' + active.displayName + '!', 1100);
        })
        .then(function () {
          if (state.over) { return; }
          showCommands();
        });
    }

    b.raf = requestAnimationFrame(loop);
    syncShown();
    intro();

    return {
      end: function (outcome) { endBattle(outcome || 'fled'); },
      handlePress: handlePress,
      getSpeed: getSpeed,
      setSpeed: setSpeed,
      cycleSpeed: cycleSpeed,
      getRememberedSpeed: getRememberedSpeed,
      isActive: function () { return !state.over; },
      getState: function () {
        return { active: active, foe: foe, bag: bag, over: state.over, panel: b.panel, sel: b.sel, turns: state.turns, turn: state.turns, playerHp: active.hp, playerMaxHp: active.maxHp, foeHp: foe.hp, foeMaxHp: foe.maxHp, foeSpecies: foe.species, foeLevel: foe.level, outcome: (liveBattle && liveBattle.state === state) ? liveBattle.outcome : null, speed: currentSpeed, rememberedSpeed: rememberedSpeed };
      }
    };
  }

  function isActive() {
    return !!activeBattle;
  }
  function handlePress(action) {
    if (activeBattle && typeof activeBattle.handlePress === 'function') {
      activeBattle.handlePress(action);
    }
  }

  FED13.battle1v1 = {
    version: '1.1.0-canvas-merged',
    coldOpen: COLD_OPEN,
    startBattle: startBattle,
    getState: getState,
    getSpeed: getSpeed,
    setSpeed: setSpeed,
    cycleSpeed: cycleSpeed,
    getRememberedSpeed: getRememberedSpeed,
    speedButton: SPEED_BUTTON,
    handlePress: handlePress,
    isActive: isActive,
    MOVES: MOVES,
    SPECIES: SPECIES,
    BLOODLINES: BLOODLINES,
    BACKGROUNDS: BACKGROUNDS,
    hpColor: hpColor,
    hpColorName: hpColorName,
    backgroundFor: backgroundFor,
    effectiveness: effectiveness
  };

})();
