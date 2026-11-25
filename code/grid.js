/* FED-13 grid battles. FFTA2 style. Plain JavaScript, no frameworks.
 *
 * Uses window.FED13 from engine.js when it exists. If engine.js has not
 * loaded yet, this file builds the small FED13 shim it needs so the module
 * still runs standalone. Attach point: FED13.grid.startGridBattle.
 *
 * Hard rules honored here:
 * - No Drive anywhere. All art paths are relative: assets/<filename>.
 * - No ripped Nintendo sprites. Sheets are loaded from assets only.
 * - No professor anywhere. Names are Mankind, Bondkin, Wildlife.
 * - King is King Malachar Duskspire. The bank is the Monster Bank.
 * - 5 core Bondkin: Elf, Puffkin, Elderkin, Harefolk, Drakescale.
 * - Elf is bloodline 001. Totem Spirit Starwarden.
 * - No em dashes in any visible text. Only plain hyphens.
 * - No GitHub push from this file.
 *
 * Style guide sections 7, 9, 10, 11, 11E:
 * - 6x6 isometric grid, fixed angled view, no camera rotation.
 * - Bottom screen holds the field. Top screen holds the Unit Turn List
 *   in speed order plus the active unit status (HP, MP, portrait).
 * - Battle log lives in its own strip at the top of the bottom screen,
 *   clear of every menu. The grid starts below it (GRID_OY 50).
 * - Green deployment tiles, blue movement tiles, red target tiles.
 * - Commands: Move, Action, Wait, Combo. Attack sits inside Action.
 * - Move then attack is allowed. Attack then move is allowed.
 * - Facing choice after each action. Side attacks add 50 percent
 *   damage. Back attacks double damage.
 * - MP starts at 0 and gains 10 per turn. Basic spells cost 8 MP.
 * - Damage numbers are bold white with a dark outline. Healing is
 *   green. KO is shown clearly.
 * - Weather rain and fog are overlays. Poison flashes green. Blind
 *   shows sunglasses. Confuse flashes purple.
 *
 * Effect images: fx_fire, fx_fira, fx_firaga, fx_blizzard, fx_thunder,
 * fx_cure, fx_holy and fx_snare_burst are loaded from assets when they
 * exist. fx_slash, fx_smoke, fx_sparkle and fx_shield now exist as
 * files in build/assets, so drawFxImage tries the image first and only
 * draws procedurally on canvas when a file fails to load:
 * slash is a white sword slash arc with impact sparks, smoke is a grey
 * and purple dispersing puff, sparkle is gold star sparkles, shield is
 * an angular blue barrier hexagon with bright edge lines. A missing
 * file never stops the module.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* FED13 namespace. Use engine.js when present, shim when absent.     */
  /* ------------------------------------------------------------------ */

  var root = (typeof window !== 'undefined') ? window : this;
  var FED13 = root.FED13 || (root.FED13 = {});
  FED13.grid = FED13.grid || {};

  /* ------------------------------------------------------------------ */
  /* Constants                                                           */
  /* ------------------------------------------------------------------ */

  var SCREEN_W = 256;
  var SCREEN_H = 192;
  var GRID_N = 6;
  var TILE_W = 32;   /* isometric diamond width, 2 to 1 ratio */
  var TILE_H = 16;   /* isometric diamond height */
  var GRID_OX = 128; /* screen x of tile (0, 0) center */
  var GRID_OY = 50;  /* screen y of tile (0, 0) top. 50, not 24: the battle
   * log strip sits at the top of the bottom screen (y 0-14), and the
   * grid must start low enough that no unit chrome reaches it. The
   * topmost tile has py 50, so its HP bar sits at y 20-23, its active
   * marker at baseline y 22, and its sprite top at y 32: all clear
   * of the strip. Field bottom is tile (5, 5) at y 130-146. */
  var FRAME_W = 32;  /* grid unit sheet frame width */
  var FRAME_H = 32;  /* grid unit sheet frame height */

  var MP_PER_TURN = 10;
  var MP_MAX = 99;
  var COST_BASIC = 8;   /* Fire, Blizzard, Thunder, Cure */
  var COST_MID = 12;    /* Fira, Blizzara, Thundara */
  var COST_HIGH = 18;   /* Firaga and the next tier */
  var COMBO_PP_COST = 2;
  var COMBO_MAX_JOINERS = 5;

  var SIDE_MULT = 1.5;  /* side attack bonus */
  var BACK_MULT = 2.0;  /* back attack bonus */

  /* Sheet rows are directions, sheet columns are poses. */
  var DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
  var POSE = { IDLE: 0, WALK: 1, ATTACK: 2, CAST: 3, HIT: 4, KO: 5 };

  /* ------------------------------------------------------------------ */
  /* Bloodlines and rosters                                              */
  /* ------------------------------------------------------------------ */

  var BLOODLINES = {
    elf:       { id: 'elf',       name: 'Elf',       num: '001', totem: 'Starwarden',          sheet: 'g_elf.png',       color: '#7ec850', accent: '#d8f7a0', speed: 9,  hp: 34, atk: 7, move: 4, job: 'Starwarden' },
    puffkin:   { id: 'puffkin',   name: 'Puffkin',   num: '002', totem: 'Brightpom Sovereign', sheet: 'g_puffkin.png',   color: '#f2a541', accent: '#ffe1a8', speed: 7,  hp: 38, atk: 8, move: 3, job: 'Tinker' },
    elderkin:  { id: 'elderkin',  name: 'Elderkin',  num: '003', totem: 'Quiet Flame Sage',    sheet: 'g_elderkin.png',  color: '#b08ae8', accent: '#e8d8ff', speed: 6,  hp: 42, atk: 9, move: 3, job: 'Sage' },
    harefolk:  { id: 'harefolk',  name: 'Harefolk',  num: '004', totem: 'Moonhare Matriarch',  sheet: 'g_harefolk.png',  color: '#f2e6c8', accent: '#ffffff', speed: 11, hp: 30, atk: 6, move: 5, job: 'Scout' },
    drakescale:{ id: 'drakescale',name: 'Drakescale',num: '005', totem: 'Emberwyrm King',      sheet: 'g_drakescale.png',color: '#e84a3a', accent: '#ffb0a0', speed: 8,  hp: 40, atk: 10, move: 4, job: 'Warrior' }
  };

  var BONDIN_NAMES = {
    elf: 'Aelindra', puffkin: 'Pip', elderkin: 'Halden', /* DRAFT FOR GIT-FED REVISION: Halden is the new Elderkin arc Bondkin name, replacing Bram, which collided with Guildmaster Bram Hollis. */
    harefolk: 'Marnie', drakescale: 'Cinder'
  };

  var STARTERS = {
    whelp:     { name: 'Whelp',     codex: '002', kind: 'Wildlife', color: '#e8703a', accent: '#ffd0a0', speed: 8,  hp: 36, atk: 8, move: 4, sheet: null },
    puk:       { name: 'Puk',       codex: '104', kind: 'Wildlife', color: '#7ab8e8', accent: '#d8ecff', speed: 10, hp: 30, atk: 7, move: 5, sheet: null },
    mandragora:{ name: 'Mandragora',codex: '029', kind: 'Wildlife', color: '#68b868', accent: '#d8f7c8', speed: 6,  hp: 40, atk: 7, move: 3, sheet: null }
  };

  var ENEMIES = {
    saltwake_a: { name: 'Saltwake Cutthroat', sheet: 'g_saltwake_a.png', color: '#5a7a9a', accent: '#c8dce8', speed: 7, hp: 30, atk: 7, move: 4, job: 'Cutthroat' },
    saltwake_b: { name: 'Saltwake Lookout',   sheet: 'g_saltwake_b.png', color: '#8a6a9a', accent: '#e0c8f0', speed: 8, hp: 26, atk: 6, move: 4, job: 'Lookout' },
    maren:      { name: 'Maren Saltwright',   sheet: 'g_maren.png',      color: '#2a4a6a', accent: '#a8d8f0', speed: 10, hp: 90, atk: 12, move: 4, job: 'Pisces of The Thirteen' }
  };

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                       */
  /* ------------------------------------------------------------------ */

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ------------------------------------------------------------------ */
  /* Battle Fast Forward: 1x / 2x / 4x speed control.                  */
  /* Design: new-game.md, Battle Fast Forward. One button at the top    */
  /* right of the top screen, in the gap between the icon strip and     */
  /* the turn order display, shows the current speed at all times and   */
  /* cycles 1x to 2x to 4x to 1x. It must never sit on the 0-16 icon    */
  /* strip: the strip art is a full row of icons and the old y 0-16    */
  /* box covered the last icons, and its text spilled below the box     */
  /* whenever the shared top canvas still had textBaseline 'top' left   */
  /* over from a story scene. The button now lives at y 17-28, clear    */
  /* of the strip above (ends y 16) and the first turn row highlight    */
  /* below (starts y 29), and draws its text with an explicit middle    */
  /* baseline so no ambient baseline can move it.                       */
  /* Timing scale: every battle sleep runs through sleepScaled, the     */
  /* render loop advances floats, effects, HP bar drains, weather and  */
  /* the camera pan by dt times the speed, so 2x runs twice as fast    */
  /* and 4x four times as fast. Short flourishes keep a 30 ms floor,   */
  /* so at 4x they play at their shortest form, never skipped. Player  */
  /* input is never scaled: menus, targeting, dialogue and prompts     */
  /* always wait for the player.                                        */
  /* Memory: the chosen speed is remembered in FED13.state.battleSpeed */
  /* (saved with the game by FED13.saveGame) with a localStorage       */
  /* fallback key fed13_battle_speed. It resets to 1x for the first    */
  /* grid battle, Trial Battles, Elite Four / Champion and Crown Trial */
  /* battles, and the remembered speed returns after such a battle.    */
  /* Callers force 1x where the module cannot tell by itself with      */
  /* config.resetSpeed = true, or config.battleKind = 'trial' |        */
  /* 'eliteFour' | 'champion' | 'crownTrial' (also 'first'). The       */
  /* engine wrapper in engine.js startGridBattle must forward those   */
  /* fields from its opts into the grid config gcfg; grid.js detects   */
  /* trialBattle and the first grid battle on its own.                  */
  /* ------------------------------------------------------------------ */

  var SPEED_MIN_SLEEP_MS = 30;
  var SPEED_BANNER_MIN_MS = 400;
  var SPEED_BUTTON = { x: 208, y: 17, w: 44, h: 11 };
  var SPEED_SAVE_KEY = 'fed13_battle_speed';
  var RESET_BATTLE_KINDS = { trial: true, trialbattle: true, elitefour: true, elite: true, champion: true, crowntrial: true, crown: true, first: true };
  var rememberedSpeed = 1;

  function validSpeed(n) { return (n === 1 || n === 2 || n === 4) ? n : 1; }
  function speedOf(b) { return (b && b.speed) ? b.speed : rememberedSpeed; }
  function speedLabel(b) { return String(speedOf(b)) + 'x'; }

  function readSavedSpeed() {
    try {
      var st = FED13.state;
      if (st && (st.battleSpeed === 1 || st.battleSpeed === 2 || st.battleSpeed === 4)) { return st.battleSpeed; }
    } catch (e) {}
    try {
      if (typeof localStorage !== 'undefined') {
        var n = parseInt(localStorage.getItem(SPEED_SAVE_KEY), 10);
        if (n === 1 || n === 2 || n === 4) { return n; }
      }
    } catch (e) {}
    return 1;
  }

  function persistSpeed(n) {
    rememberedSpeed = validSpeed(n);
    try { if (FED13.state) { FED13.state.battleSpeed = rememberedSpeed; } } catch (e) {}
    try { if (typeof FED13.saveGame === 'function') { FED13.saveGame(); } } catch (e) {}
    try { if (typeof localStorage !== 'undefined') { localStorage.setItem(SPEED_SAVE_KEY, String(rememberedSpeed)); } } catch (e) {}
    return rememberedSpeed;
  }

  function setSpeed(n, b) {
    n = persistSpeed(n);
    b = b || currentBattle;
    if (b && !b.ended) { b.speed = n; b.speedForced = false; }
    return n;
  }

  function cycleSpeed(b) {
    b = b || currentBattle;
    var cur = speedOf(b);
    var next = cur === 1 ? 2 : (cur === 2 ? 4 : 1);
    return setSpeed(next, b);
  }

  function getSpeed() {
    if (currentBattle && !currentBattle.ended) { return currentBattle.speed; }
    return rememberedSpeed;
  }

  function isResetBattle(cfg) {
    if (!cfg) { return false; }
    if (cfg.resetSpeed === true) { return true; }
    if (cfg.trialBattle === true || cfg.trialBattle === 1) { return true; }
    if (cfg.trial !== undefined && cfg.trial !== null && cfg.trial !== false) { return true; }
    if (cfg.eliteFour === true || cfg.champion === true || cfg.crownTrial === true) { return true; }
    var kind = cfg.battleKind || cfg.kind || '';
    if (typeof kind === 'string' && kind) {
      var k = kind.toLowerCase().replace(/[^a-z]/g, '');
      if (RESET_BATTLE_KINDS[k]) { return true; }
    }
    return false;
  }

  function scaledSleepMs(ms, speed) {
    var s = (speed === 1 || speed === 2 || speed === 4) ? speed : 1;
    return Math.max(SPEED_MIN_SLEEP_MS, Math.round(ms / s));
  }

  function sleepScaled(b, ms) { return sleep(scaledSleepMs(ms, speedOf(b))); }

  function speedButtonHit(px, py) {
    return px >= SPEED_BUTTON.x && px <= SPEED_BUTTON.x + SPEED_BUTTON.w &&
      py >= SPEED_BUTTON.y && py <= SPEED_BUTTON.y + SPEED_BUTTON.h;
  }

  function resetCamPan(b) {
    if (!b || !b.cam) { return; }
    b.cam.ox = 0; b.cam.oy = 0; b.cam.t = 0; b.cam.active = false;
  }

  function setCamPan(b, unit) {
    if (!b || !b.cam || !unit) { return; }
    var p = tileToScreen(unit.x, unit.y);
    b.cam.tx = clamp((128 - p.x) * 0.10, -10, 10);
    b.cam.ty = clamp((96 - p.y) * 0.10, -8, 8);
    b.cam.t = 0;
    b.cam.dur = 260;
    b.cam.active = true;
  }

  function updateCamPan(b, sdt) {
    var cam = b.cam;
    if (!cam || !cam.active) { return; }
    cam.t += sdt;
    var prog = clamp(cam.t / cam.dur, 0, 1);
    var sway = Math.sin(prog * Math.PI);
    cam.ox = cam.tx * sway;
    cam.oy = cam.ty * sway;
    if (prog >= 1) { cam.ox = 0; cam.oy = 0; cam.active = false; }
  }

  /* Read the saved speed once at load; startGridBattle re-reads it,
   * so a loadGame after this file loads is still picked up. */
  rememberedSpeed = readSavedSpeed();
  function rand(n) { return Math.floor(Math.random() * n); }
  function manhattan(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }
  function key(x, y) { return x + ',' + y; }
  function asset(name) { return 'assets/' + name; }

  /* Iso math. Fixed angled view, no rotation, no zoom. */
  function tileToScreen(x, y) {
    return {
      x: GRID_OX + (x - y) * (TILE_W / 2),
      y: GRID_OY + (x + y) * (TILE_H / 2)
    };
  }
  function screenToTile(px, py) {
    var dx = (px - GRID_OX) / (TILE_W / 2);
    var dy = (py - GRID_OY) / (TILE_H / 2);
    var x = Math.round((dx + dy) / 2);
    var y = Math.round((dy - dx) / 2);
    if (x < 0 || y < 0 || x >= GRID_N || y >= GRID_N) { return null; }
    return { x: x, y: y };
  }

  /* ------------------------------------------------------------------ */
  /* Image loading. A missing file never stops the module.               */
  /* ------------------------------------------------------------------ */

  var imageCache = {};
  var PROCEDURAL_FX = { fx_slash: true, fx_smoke: true, fx_sparkle: true, fx_shield: true };

  function loadImage(name) {
    if (imageCache[name]) { return imageCache[name]; }
    var img = new Image();
    img._fed13Missing = false;
    img.onerror = function () { img._fed13Missing = true; };
    img.src = asset(name);
    imageCache[name] = img;
    return img;
  }

  function loadSheet(name) {
    if (!name) { return null; }
    return loadImage(name);
  }

  /* ov3 art readiness: an image counts only when it loaded. */
  function imageReady(img) {
    return !!(img && !img._fed13Missing && img.complete && img.naturalWidth > 0);
  }

  /* Grid field art for a battle config. ov3 files only. A forest
   * battle is one set in a forest area: cfg.map or cfg.env equal to
   * 'forest'. Harbor and grass keep their existing selection. An
   * explicit old grid_*.png mapImage is translated to its ov3 file
   * so an older caller still lands on the new art. */
  function gridMapImage(cfg) {
    if (cfg && cfg.mapImage) {
      if (cfg.mapImage === 'grid_grass.png') { return 'ov3_grid_grass.png'; }
      if (cfg.mapImage === 'grid_harbor.png') { return 'ov3_grid_harbor.png'; }
      if (cfg.mapImage === 'grid_forest.png') { return 'ov3_grid_forest.png'; }
      return cfg.mapImage;
    }
    if (cfg && (cfg.map === 'forest' || cfg.env === 'forest')) { return 'ov3_grid_forest.png'; }
    if (cfg && (cfg.map === 'harbor' || cfg.env === 'harbor')) { return 'ov3_grid_harbor.png'; }
    return 'ov3_grid_grass.png';
  }

  /* Preload every sheet and effect the battle may use. */
  function preloadAssets(cfg) {
    var names = ['ov3_grid_grass.png', 'ov3_grid_harbor.png', 'ov3_grid_forest.png',
      'ov3_grid_menu.png', 'ov3_grid_turnbar.png', 'ov3_grid_cursor.png', 'ov3_dialog_box_dark.png'];
    var list = ['g_elf.png', 'g_puffkin.png', 'g_elderkin.png', 'g_harefolk.png',
      'g_drakescale.png', 'g_maren.png', 'g_saltwake_a.png', 'g_saltwake_b.png'];
    list.forEach(function (n) { names.push(n); });
    ['fx_fire.png', 'fx_fira.png', 'fx_firaga.png', 'fx_blizzard.png',
     'fx_thunder.png', 'fx_cure.png', 'fx_holy.png', 'fx_snare_burst.png',
     'fx_slash.png', 'fx_smoke.png', 'fx_sparkle.png'
    ].forEach(function (n) { names.push(n); });
    if (cfg && cfg.starterSprite) { names.push(cfg.starterSprite); }
    if (cfg && cfg.mapImage) { names.push(cfg.mapImage); }
    names.forEach(loadImage);
  }

  /* ------------------------------------------------------------------ */
  /* Procedural effect drawing. Fallback for the four missing files,    */
  /* and for any other effect image that fails to load.                  */
  /* ------------------------------------------------------------------ */

  function drawFxImage(ctx, fxName, cx, cy, size, t) {
    /* t is 0 to 1 progress through the effect. */
    /* fx_shield is always procedural: the shield image file cannot be
     * pushed to the repo as a binary, so the hexagon is the shield on
     * every copy. No circle, no bubble. */
    if (fxName === 'fx_shield') {
      drawFxProcedural(ctx, fxName, cx, cy, size, t);
      return;
    }
    var img = loadImage(fxName + '.png');
    if (img && !img._fed13Missing && img.complete && img.naturalWidth > 0) {
      var s = size * (0.7 + 0.3 * Math.sin(t * Math.PI));
      ctx.save();
      ctx.globalAlpha = 1 - t * 0.4;
      ctx.drawImage(img, cx - s / 2, cy - s / 2, s, s);
      ctx.restore();
      return;
    }
    drawFxProcedural(ctx, fxName, cx, cy, size, t);
  }

  function drawFxProcedural(ctx, fxName, cx, cy, size, t) {
    ctx.save();
    if (fxName === 'fx_slash') {
      /* White sword slash arc with impact sparks. */
      var a0 = -0.4 + t * 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(2, size * 0.10);
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.45, a0 - 1.1, a0 + 0.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(180,220,255,0.9)';
      ctx.lineWidth = Math.max(1, size * 0.045);
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.45, a0 - 0.9, a0 + 0.3);
      ctx.stroke();
      for (var i = 0; i < 6; i++) {
        var ang = a0 + (i - 2.5) * 0.35;
        var r1 = size * (0.30 + t * 0.35);
        var r2 = r1 + size * 0.16;
        var sx = cx + Math.cos(ang) * r1;
        var sy = cy + Math.sin(ang) * r1;
        var ex = cx + Math.cos(ang) * r2;
        var ey = cy + Math.sin(ang) * r2;
        ctx.strokeStyle = (i % 2 === 0) ? '#ffffff' : '#ffe98a';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      }
    } else if (fxName === 'fx_smoke') {
      /* Grey and purple dispersing smoke puff. */
      for (var j = 0; j < 7; j++) {
        var ang2 = (j / 7) * Math.PI * 2 + t * 0.6;
        var dist = size * 0.12 * (1 + t * 1.4);
        var px = cx + Math.cos(ang2) * dist;
        var py = cy + Math.sin(ang2) * dist * 0.7 - t * size * 0.18;
        var rad = size * (0.16 + t * 0.16) * (1 - j * 0.04);
        ctx.globalAlpha = (0.75 - t * 0.55) * (j % 2 === 0 ? 1 : 0.8);
        ctx.fillStyle = (j % 3 === 0) ? '#8a7ab8' : '#9a9aa8';
        ctx.beginPath(); ctx.arc(px, py, Math.max(1, rad), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (fxName === 'fx_sparkle') {
      /* Gold star sparkles. */
      for (var k = 0; k < 8; k++) {
        var ang3 = (k / 8) * Math.PI * 2 + 0.4;
        var rr = size * (0.15 + ((k * 37) % 10) / 10 * 0.35);
        var qx = cx + Math.cos(ang3) * rr;
        var qy = cy + Math.sin(ang3) * rr;
        var s2 = size * (0.10 + 0.08 * Math.sin(t * Math.PI * 2 + k));
        drawStar(ctx, qx, qy, s2, '#ffd94a', '#fff7c8');
      }
    } else if (fxName === 'fx_shield') {
      /* Angular DS barrier: translucent blue hexagon, bright edge
       * lines, diagonal shimmer. No circle, no bubble. */
      var pulse = 1 + 0.08 * Math.sin(t * Math.PI * 2);
      var rad2 = size * 0.48 * pulse;
      var pts = [];
      for (var i = 0; i < 6; i++) {
        var a = -Math.PI / 2 + i * Math.PI / 3;
        pts.push([cx + Math.cos(a) * rad2, cy + Math.sin(a) * rad2]);
      }
      ctx.globalAlpha = 0.22 + 0.08 * Math.sin(t * Math.PI);
      ctx.fillStyle = '#5aa8f0';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var j = 1; j < 6; j++) { ctx.lineTo(pts[j][0], pts[j][1]); }
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var k = 1; k < 6; k++) { ctx.lineTo(pts[k][0], pts[k][1]); }
      ctx.closePath();
      ctx.clip();
      ctx.globalAlpha = 0.8 * (1 - t * 0.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      var off = (t * rad2 * 0.8) - rad2 * 0.4;
      for (var m = -1; m <= 1; m++) {
        ctx.beginPath();
        ctx.moveTo(cx - rad2 * 0.7 + off + m * rad2 * 0.35, cy + rad2 * 0.9);
        ctx.lineTo(cx + rad2 * 0.2 + off + m * rad2 * 0.35, cy - rad2 * 0.9);
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#c8e8ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (var n = 1; n < 6; n++) { ctx.lineTo(pts[n][0], pts[n][1]); }
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      /* Generic burst fallback for any other missing effect image. */
      var colors = {
        fx_fire: ['#ff7a2a', '#ffd23a'], fx_fira: ['#ff5a1a', '#ff9a3a'],
        fx_firaga: ['#ff3a1a', '#ffcf5a'], fx_blizzard: ['#bfe8ff', '#ffffff'],
        fx_thunder: ['#ffe94a', '#ffffff'], fx_cure: ['#7ae88a', '#d8ffd8'],
        fx_holy: ['#ffe98a', '#ffffff'], fx_snare_burst: ['#e8b8ff', '#ffffff']
      };
      var pair = colors[fxName] || ['#ffffff', '#c8c8ff'];
      for (var m = 0; m < 10; m++) {
        var ang4 = (m / 10) * Math.PI * 2;
        var d4 = size * 0.35 * t;
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = (m % 2 === 0) ? pair[0] : pair[1];
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang4) * d4, cy + Math.sin(ang4) * d4, size * 0.07, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawStar(ctx, x, y, r, fill, stroke) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
      var rad = (i % 2 === 0) ? r : r * 0.4;
      var px = x + Math.cos(ang) * rad;
      var py = y + Math.sin(ang) * rad;
      if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /* Procedural unit token. Used only when a sheet file is missing, so  */
  /* the battle still runs and still reads as a DS grid unit.            */
  /* ------------------------------------------------------------------ */

  function drawUnitToken(ctx, unit, sx, sy, bob) {
    var color = unit.color || '#7a9a5a';
    var accent = unit.accent || '#ffffff';
    var y = sy + bob;
    ctx.save();
    /* Rounded ground shadow, DS style. */
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
    /* Chibi body: big head, short body. */
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(sx, y - 18, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(sx - 6, y - 12, 12, 10);
    ctx.fillStyle = accent;
    ctx.fillRect(sx - 6, y - 12, 12, 3);
    /* Eyes. */
    ctx.fillStyle = '#202020';
    ctx.fillRect(sx - 4, y - 20, 2, 3);
    ctx.fillRect(sx + 2, y - 20, 2, 3);
    /* Side marker: player units get a blue base ring, foes a red one. */
    ctx.strokeStyle = unit.side === 'player' ? '#3a7ae8' : '#e84a3a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy + 2, 13, 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawUnitSprite(ctx, unit, sx, sy, frame, now) {
    var bob = (frame === POSE.IDLE) ? ((Math.floor(now / 500) % 2 === 0) ? 0 : -1) : 0;
    var img = unit.sheetImg;
    if (!img || img._fed13Missing || !img.complete || img.naturalWidth === 0) {
      drawUnitToken(ctx, unit, sx, sy, bob);
      return;
    }
    /* Sheet layout: rows are directions, columns are poses. A sheet
     * shorter than 6 columns falls back to the idle column. */
    var cols = Math.max(1, Math.floor(img.naturalWidth / FRAME_W));
    var rows = Math.max(1, Math.floor(img.naturalHeight / FRAME_H));
    var col = Math.min(frame, cols - 1);
    var row = Math.min(unit.facing, rows - 1);
    var mirror = false;
    if (unit.facing === DIR.LEFT && rows < 4) { row = DIR.RIGHT; mirror = true; }
    var dx = sx - FRAME_W / 2;
    var dy = sy - FRAME_H + 6 + bob;
    ctx.save();
    if (mirror) {
      ctx.translate(sx * 2, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H,
      dx, dy, FRAME_W, FRAME_H);
    ctx.restore();
    /* Status visuals, FFTA2 language. */
    if (unit.status === 'poison' && Math.floor(now / 300) % 2 === 0) {
      ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#3ac84a';
      ctx.fillRect(dx, dy, FRAME_W, FRAME_H); ctx.restore();
    }
    if (unit.status === 'confuse' && Math.floor(now / 300) % 2 === 0) {
      ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = '#a84ae8';
      ctx.fillRect(dx, dy, FRAME_W, FRAME_H); ctx.restore();
    }
    if (unit.status === 'blind') {
      ctx.save();
      ctx.fillStyle = '#202020';
      ctx.fillRect(sx - 7, sy - 20, 14, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 6, sy - 20, 3, 2);
      ctx.fillRect(sx + 3, sy - 20, 3, 2);
      ctx.restore();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Unit factory                                                        */
  /* ------------------------------------------------------------------ */

  var uidCounter = 0;

  function makeUnit(def) {
    var u = {
      id: 'u' + (++uidCounter),
      name: def.name || 'Unit',
      kind: def.kind || 'Bondkin',
      bloodline: def.bloodline || null,
      totem: def.totem || null,
      job: def.job || '',
      side: def.side || 'player',
      x: def.x || 0,
      y: def.y || 0,
      facing: (def.facing !== undefined) ? def.facing : DIR.DOWN,
      hp: def.hp || 30,
      maxHp: def.maxHp || def.hp || 30,
      dispHp: def.hp || 30,
      mp: 0,
      speed: def.speed || 7,
      atk: def.atk || 7,
      def: def.def || 2,
      move: def.move || 4,
      pathPoints: (def.pathPoints !== undefined) ? def.pathPoints : 4,
      status: def.status || null,
      alive: true,
      hasMoved: false,
      hasActed: false,
      waited: false,
      color: def.color || '#7a9a5a',
      accent: def.accent || '#ffffff',
      sheet: def.sheet || null,
      sheetImg: def.sheet ? loadSheet(def.sheet) : null,
      pose: POSE.IDLE,
      px: 0, py: 0, /* animated pixel position */
      spells: def.spells || ['Fire', 'Cure']
    };
    var p = tileToScreen(u.x, u.y);
    u.px = p.x; u.py = p.y;
    return u;
  }

  function makeFirstGridRoster(cfg) {
    cfg = cfg || {};
    var blood = BLOODLINES[cfg.bloodline] || BLOODLINES.elf;
    var starter = STARTERS[cfg.starter] || STARTERS.whelp;
    var bondkinName = cfg.bondkinName || BONDIN_NAMES[blood.id];
    var playerName = cfg.playerName || 'Trainer';

    var wildlife = makeUnit({
      name: starter.name, kind: 'Wildlife', side: 'player',
      x: 0, y: 2, facing: DIR.RIGHT,
      hp: starter.hp, speed: starter.speed, atk: starter.atk, move: starter.move,
      color: starter.color, accent: starter.accent,
      sheet: cfg.starterSprite || starter.sheet || null,
      spells: ['Tackle']
    });
    /* The arc Bondkin starts off the field and steps in during the
     * intro script, then fights beside the Wildlife. */
    var bondkin = makeUnit({
      name: bondkinName, kind: 'Bondkin', bloodline: blood.id,
      totem: blood.totem, job: blood.job, side: 'player',
      x: 0, y: 3, facing: DIR.RIGHT,
      hp: blood.hp, speed: blood.speed, atk: blood.atk, move: blood.move,
      color: blood.color, accent: blood.accent, sheet: blood.sheet,
      spells: ['Fire', 'Cure']
    });
    bondkin.offField = true;

    var foeA = makeUnit({
      name: ENEMIES.saltwake_a.name, kind: 'Wildlife', side: 'enemy',
      x: 5, y: 1, facing: DIR.LEFT,
      hp: ENEMIES.saltwake_a.hp, speed: ENEMIES.saltwake_a.speed,
      atk: ENEMIES.saltwake_a.atk, move: ENEMIES.saltwake_a.move,
      color: ENEMIES.saltwake_a.color, accent: ENEMIES.saltwake_a.accent,
      sheet: ENEMIES.saltwake_a.sheet, spells: []
    });
    var foeB = makeUnit({
      name: ENEMIES.saltwake_b.name, kind: 'Wildlife', side: 'enemy',
      x: 5, y: 4, facing: DIR.LEFT,
      hp: ENEMIES.saltwake_b.hp, speed: ENEMIES.saltwake_b.speed,
      atk: ENEMIES.saltwake_b.atk, move: ENEMIES.saltwake_b.move,
      color: ENEMIES.saltwake_b.color, accent: ENEMIES.saltwake_b.accent,
      sheet: ENEMIES.saltwake_b.sheet, spells: []
    });
    return { playerName: playerName, wildlife: wildlife, bondkin: bondkin, foes: [foeA, foeB] };
  }

  /* ------------------------------------------------------------------ */
  /* Cold open grid roster: three defenders against Maren alone.      */
  /* COLD OPEN POLISH (adv-coldopen): only built when config.coldOpen */
  /* is set, which nothing in the current build sets. The defenders   */
  /* are plain Mankind tokens with no sheet, Maren fights on her grid */
  /* sheet g_maren.png. The scripted loss itself lives in the 1v1     */
  /* cold open battle, not here.                                       */
  /* ------------------------------------------------------------------ */

  function makeColdOpenGridRoster(cfg) {
    cfg = cfg || {};
    var defenders = [];
    var spots = [{ x: 0, y: 1 }, { x: 0, y: 3 }, { x: 1, y: 2 }];
    for (var i = 0; i < 3; i++) {
      defenders.push(makeUnit({
        name: 'Defender', kind: 'Mankind', side: 'player',
        x: spots[i].x, y: spots[i].y, facing: DIR.RIGHT,
        hp: 20, speed: 7, atk: 6, move: 4,
        color: '#2848c8', accent: '#a8c8f0',
        sheet: null, spells: []
      }));
    }
    var maren = makeUnit({
      name: ENEMIES.maren.name, kind: 'Mankind', side: 'enemy',
      x: 5, y: 2, facing: DIR.LEFT,
      hp: ENEMIES.maren.hp, speed: ENEMIES.maren.speed,
      atk: ENEMIES.maren.atk, move: ENEMIES.maren.move,
      color: ENEMIES.maren.color, accent: ENEMIES.maren.accent,
      sheet: ENEMIES.maren.sheet, spells: []
    });
    maren.offField = true; /* she steps in during the staging script */
    return { playerName: cfg.playerName || 'Defender', defenders: defenders, maren: maren };
  }

  /* ------------------------------------------------------------------ */
  /* Trial Battle 1 roster: the hatched Wildlife plus the arc Bondkin  */
  /* against Maren Saltwright alone, in the Saltquay harbor hall.      */
  /* The design calls Trial Battle 1 a team battle in the FFTA style   */
  /* (new-game.md, Saltquay: Trial Battle 1) fought with the hatched   */
  /* Wildlife and the arc Bondkin beside the player (complete story,    */
  /* Part 6), so it is built here on the grid, never as a 1v1. The     */
  /* player units reuse the first grid roster stats. Maren reuses her  */
  /* grid stats (speed 10, atk 12) from ENEMIES.maren.                 */
  /* DRAFT FOR GIT-FED REVISION: the design sets no trial level or HP  */
  /* for Maren, so the trial Maren fights at 60 HP. 60 is the smallest */
  /* round number that sims 100 percent winnable for every straight    */
  /* story-path Lv 5 party (all 3 starters x all 5 arc bloodlines,    */
  /* simple attack and Fire play); her grid HP 90 stays untouched for  */
  /* the cold open staging roster, and the 1v1 Maren species HP is     */
  /* untouched.                                                         */
  /* ------------------------------------------------------------------ */

  var TRIAL_BATTLE_1_MAREN_HP = 60;

  function makeTrialBattleRoster(cfg) {
    cfg = cfg || {};
    var blood = BLOODLINES[cfg.bloodline] || BLOODLINES.elf;
    var starter = STARTERS[cfg.starter] || STARTERS.whelp;
    var bondkinName = cfg.bondkinName || BONDIN_NAMES[blood.id];
    var playerName = cfg.playerName || 'Trainer';

    var wildlife = makeUnit({
      name: starter.name, kind: 'Wildlife', side: 'player',
      x: 0, y: 2, facing: DIR.RIGHT,
      hp: starter.hp, speed: starter.speed, atk: starter.atk, move: starter.move,
      color: starter.color, accent: starter.accent,
      sheet: cfg.starterSprite || starter.sheet || null,
      spells: ['Tackle']
    });
    var bondkin = makeUnit({
      name: bondkinName, kind: 'Bondkin', bloodline: blood.id,
      totem: blood.totem, job: blood.job, side: 'player',
      x: 0, y: 3, facing: DIR.RIGHT,
      hp: blood.hp, speed: blood.speed, atk: blood.atk, move: blood.move,
      color: blood.color, accent: blood.accent, sheet: blood.sheet,
      spells: ['Fire', 'Cure']
    });
    var maren = makeUnit({
      name: ENEMIES.maren.name, kind: 'Mankind', side: 'enemy',
      x: 5, y: 2, facing: DIR.LEFT,
      hp: TRIAL_BATTLE_1_MAREN_HP, speed: ENEMIES.maren.speed,
      atk: ENEMIES.maren.atk, move: ENEMIES.maren.move,
      color: ENEMIES.maren.color, accent: ENEMIES.maren.accent,
      sheet: ENEMIES.maren.sheet
    });
    return { playerName: playerName, wildlife: wildlife, bondkin: bondkin, maren: maren };
  }

  /* ------------------------------------------------------------------ */
  /* Battle state                                                        */
  /* ------------------------------------------------------------------ */

  function newBattle(cfg, onEnd) {
    var roster = null;
    var units = [];
    if (cfg && cfg.units && cfg.units.length) {
      units = cfg.units.map(makeUnit);
    } else if (cfg && cfg.trialBattle) {
      roster = makeTrialBattleRoster(cfg);
      units = [roster.wildlife, roster.bondkin, roster.maren];
    } else if (cfg && cfg.coldOpen) {
      roster = makeColdOpenGridRoster(cfg);
      units = roster.defenders.concat([roster.maren]);
    } else {
      roster = makeFirstGridRoster(cfg);
      units = [roster.wildlife, roster.bondkin].concat(roster.foes);
    }
    return {
      cfg: cfg || {},
      onEnd: (typeof onEnd === 'function') ? onEnd : null,
      roster: roster,
      units: units,
      phase: 'deploy',      /* deploy, intro, turn, move, action, target, facing, enemy, anim, dialogue, won, lost */
      round: 1,
      order: [],
      orderIndex: 0,
      active: null,
      cursor: { x: 2, y: 2 },
      moveTiles: [],
      targetTiles: [],
      pending: null,        /* { kind: 'attack'|'spell'|'combo'|'cure', name, cost, range, fx } */
      menu: null,           /* { title, items: [{label, disabled, run}], x, y, w, h } */
      facingChoice: null,
      floats: [],           /* { x, y, text, color, t } */
      effects: [],          /* { fx, x, y, size, t, dur } */
      log: [],
      weather: (cfg && cfg.weather) || 'none',
      mapImage: gridMapImage(cfg),
      mapImg: null,
      message: '',
      dialogue: null,       /* { lines: [{speaker, text}], i, done } */
      dialogueResolve: null,
      selectedDeploy: null,
      joined: false,        /* asking scene answer */
      ended: false,
      startedAt: Date.now(),
      speed: rememberedSpeed,
      speedForced: false,
      speedBefore: rememberedSpeed,
      animClock: 0,
      cam: { ox: 0, oy: 0, tx: 0, ty: 0, t: 0, dur: 260, active: false }
    };
  }

  function aliveUnits(b, side) {
    return b.units.filter(function (u) { return u.alive && !u.offField && (!side || u.side === side); });
  }
  function unitAt(b, x, y) {
    for (var i = 0; i < b.units.length; i++) {
      var u = b.units[i];
      if (u.alive && !u.offField && u.x === x && u.y === y) { return u; }
    }
    return null;
  }
  function buildOrder(b) {
    var list = aliveUnits(b);
    list.sort(function (a, c) {
      if (c.speed !== a.speed) { return c.speed - a.speed; }
      if (a.side !== c.side) { return a.side === 'player' ? -1 : 1; }
      return a.id < c.id ? -1 : 1;
    });
    b.order = list;
    b.orderIndex = 0;
  }
  function log(b, text) {
    b.log.push(text);
    if (b.log.length > 6) { b.log.shift(); }
    b.message = text;
  }

  /* Facing math. Returns 1 front, 1.5 side, 2 back. */
  function facingMult(attacker, target) {
    var dx = target.x - attacker.x;
    var dy = target.y - attacker.y;
    var attackDir;
    if (Math.abs(dx) >= Math.abs(dy)) { attackDir = dx > 0 ? DIR.RIGHT : DIR.LEFT; }
    else { attackDir = dy > 0 ? DIR.DOWN : DIR.UP; }
    var tf = target.facing;
    var opposite = { 0: 3, 3: 0, 1: 2, 2: 1 };
    /* Attack direction is the travel direction, attacker to target.
     * If the attack travels the way the target faces, the attacker
     * stands behind the target: back attack. If it travels against
     * the facing, the attacker stands in front: front attack. */
    if (attackDir === tf) { return BACK_MULT; }
    if (attackDir === opposite[tf]) { return 1; }
    return SIDE_MULT;
  }
  function facingLabel(mult) {
    if (mult >= 2) { return 'Back attack x2'; }
    if (mult > 1) { return 'Side attack +50%'; }
    return 'Front attack';
  }
  function faceToward(u, tx, ty) {
    var dx = tx - u.x;
    var dy = ty - u.y;
    if (Math.abs(dx) >= Math.abs(dy)) { u.facing = dx > 0 ? DIR.RIGHT : DIR.LEFT; }
    else { u.facing = dy > 0 ? DIR.DOWN : DIR.UP; }
  }

  function moveRange(b, unit) {
    var seen = {};
    var out = [];
    var queue = [{ x: unit.x, y: unit.y, d: 0 }];
    seen[key(unit.x, unit.y)] = true;
    while (queue.length) {
      var n = queue.shift();
      if (n.d > 0 && !unitAt(b, n.x, n.y)) { out.push({ x: n.x, y: n.y }); }
      if (n.d >= unit.move) { continue; }
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (s) {
        var nx = n.x + s[0];
        var ny = n.y + s[1];
        if (nx < 0 || ny < 0 || nx >= GRID_N || ny >= GRID_N) { return; }
        if (seen[key(nx, ny)]) { return; }
        seen[key(nx, ny)] = true;
        queue.push({ x: nx, y: ny, d: n.d + 1 });
      });
    }
    return out;
  }

  function addFloat(b, unit, text, color) {
    var p = tileToScreen(unit.x, unit.y);
    b.floats.push({ x: p.x, y: p.y - 30, text: String(text), color: color || '#ffffff', t: 0 });
  }
  function addEffect(b, fxName, unit, size) {
    var p = tileToScreen(unit.x, unit.y);
    b.effects.push({ fx: fxName, x: p.x, y: p.y - 14, size: size || 48, t: 0, dur: 700 });
  }

  /* ------------------------------------------------------------------ */
  /* Damage, healing, KO                                                 */
  /* ------------------------------------------------------------------ */

  function dealDamage(b, attacker, target, base, fxName, label) {
    var mult = facingMult(attacker, target);
    var dmg = Math.max(1, Math.round((base + rand(4) - target.def) * mult));
    target.hp = Math.max(0, target.hp - dmg);
    target.pose = POSE.HIT;
    faceToward(attacker, target.x, target.y);
    if (fxName) { addEffect(b, fxName, target, 52); }
    addFloat(b, target, '-' + dmg, '#ffffff');
    if (mult > 1) { addFloat(b, target, facingLabel(mult), '#ffe98a'); }
    log(b, (label || attacker.name + ' attacks') + ': ' + target.name + ' takes ' + dmg + ' damage. ' + facingLabel(mult) + '.');
    if (target.hp <= 0) { knockOut(b, target); }
    return dmg;
  }

  function healUnit(b, caster, target, amount, fxName) {
    var healed = Math.min(amount, target.maxHp - target.hp);
    target.hp += healed;
    if (fxName) { addEffect(b, fxName, target, 48); }
    addFloat(b, target, '+' + healed, '#3ae84a');
    log(b, caster.name + ' heals ' + target.name + ' for ' + healed + ' HP.');
    return healed;
  }

  function knockOut(b, unit) {
    unit.alive = false;
    unit.pose = POSE.KO;
    addFloat(b, unit, 'KO', '#ff5a4a');
    log(b, unit.name + ' is knocked out.');
  }

  function checkEnd(b) {
    var players = aliveUnits(b, 'player');
    var foes = aliveUnits(b, 'enemy');
    if (foes.length === 0) { return 'won'; }
    if (players.length === 0) { return 'lost'; }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Screens. Bottom holds the field, top holds turn list and status.   */
  /* FED13 from engine.js may supply screens; otherwise build them.     */
  /* ------------------------------------------------------------------ */

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.style.width = (w * 2) + 'px';
    c.style.height = (h * 2) + 'px';
    c.style.imageRendering = 'pixelated';
    c.style.display = 'block';
    return c;
  }

  function findScreen(b, which) {
    var f = FED13;
    if (f.screens && f.screens[which]) { return f.screens[which]; }
    if (f['canvas' + which.charAt(0).toUpperCase() + which.slice(1)]) {
      return f['canvas' + which.charAt(0).toUpperCase() + which.slice(1)];
    }
    if (typeof f.getScreen === 'function') { return f.getScreen(which); }
    var el = document.getElementById(which + '-screen') || document.getElementById('fed13-' + which);
    if (el && el.getContext) { return el; }
    return null;
  }

  function setupScreens(b) {
    var top = findScreen(b, 'top');
    var bottom = findScreen(b, 'bottom');
    if (!top || !bottom) {
      var host = document.getElementById('fed13-ds') || document.body;
      var wrap = document.createElement('div');
      wrap.id = 'fed13-ds';
      wrap.style.cssText = 'background:#101018;padding:8px;width:528px;margin:0 auto;font-family:monospace;';
      if (!top) { top = makeCanvas(SCREEN_W, SCREEN_H); top.id = 'top-screen'; wrap.appendChild(top); }
      if (!bottom) { bottom = makeCanvas(SCREEN_W, SCREEN_H); bottom.id = 'bottom-screen'; wrap.appendChild(bottom); }
      if (wrap.childNodes.length) { host.appendChild(wrap); }
    }
    b.topCanvas = top;
    b.bottomCanvas = bottom;
    b.topCtx = top.getContext('2d');
    b.bottomCtx = bottom.getContext('2d');
    b.topCtx.imageSmoothingEnabled = false;
    b.bottomCtx.imageSmoothingEnabled = false;
  }

  /* ------------------------------------------------------------------ */
  /* Dialogue. Static portrait plus text, DS style.                      */
  /* ------------------------------------------------------------------ */

  function showDialogue(b, lines) {
    return new Promise(function (resolve) {
      b.dialogue = { lines: lines, i: 0 };
      b.dialogueResolve = resolve;
      b.phase = 'dialogue';
    });
  }

  function advanceDialogue(b) {
    var d = b.dialogue;
    if (!d) { return; }
    d.i++;
    if (d.i >= d.lines.length) {
      var resolve = b.dialogueResolve;
      b.dialogue = null;
      b.dialogueResolve = null;
      if (resolve) { resolve(); }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Menus. Drawn on the bottom screen, clicked or keyed.               */
  /* ------------------------------------------------------------------ */

  function openMenu(b, title, items) {
    resetCamPan(b);
    var w = 148;
    var h = 22 + items.length * 18;
    var sel = 0;
    for (var i = 0; i < items.length; i++) { if (!items[i].disabled) { sel = i; break; } }
    b.menu = {
      title: title,
      items: items,
      sel: sel,
      x: SCREEN_W - w - 6,
      y: SCREEN_H - h - 6,
      w: w, h: h
    };
  }
  function closeMenu(b) { b.menu = null; }

  function menuHit(b, px, py) {
    var m = b.menu;
    if (!m) { return -1; }
    if (px < m.x || px > m.x + m.w || py < m.y || py > m.y + m.h) { return -1; }
    var idx = Math.floor((py - m.y - 20) / 18);
    if (idx < 0 || idx >= m.items.length) { return -1; }
    return idx;
  }

  function runMenuItem(b, idx) {
    var m = b.menu;
    if (!m || idx < 0 || idx >= m.items.length) { return; }
    var item = m.items[idx];
    if (item.disabled) { return; }
    closeMenu(b);
    item.run();
  }

  /* ------------------------------------------------------------------ */
  /* Turn flow                                                           */
  /* ------------------------------------------------------------------ */

  function startRound(b) {
    buildOrder(b);
    b.round++;
    nextTurn(b);
  }

  function nextTurn(b) {
    if (b.ended) { return; }
    var end = checkEnd(b);
    if (end) { return finishBattle(b, end); }
    while (b.orderIndex < b.order.length) {
      var u = b.order[b.orderIndex++];
      if (!u.alive || u.offField) { continue; }
      b.active = u;
      setCamPan(b, u);
      u.hasMoved = false;
      u.hasActed = false;
      u.waited = false;
      u.mp = Math.min(MP_MAX, u.mp + MP_PER_TURN);
      if (u.status === 'poison') {
        u.hp = Math.max(0, u.hp - 3);
        addFloat(b, u, '-3', '#3ac84a');
        log(b, u.name + ' takes 3 poison damage.');
        if (u.hp <= 0) { knockOut(b, u); var e2 = checkEnd(b); if (e2) { return finishBattle(b, e2); } continue; }
      }
      var p = tileToScreen(u.x, u.y);
      b.cursor = { x: u.x, y: u.y };
      log(b, u.name + ' takes a turn. MP is now ' + u.mp + '.');
      if (u.side === 'enemy') {
        b.phase = 'enemy';
        runEnemyTurn(b, u);
      } else {
        b.phase = 'turn';
        openCommandMenu(b, u);
      }
      return;
    }
    startRound(b);
  }

  function endActiveTurn(b, waited) {
    var u = b.active;
    if (!u) { return; }
    if (waited) {
      u.waited = true;
      log(b, u.name + ' waits. The next turn comes sooner.');
    }
    b.phase = 'anim';
    b.moveTiles = [];
    b.targetTiles = [];
    b.pending = null;
    closeMenu(b);
    b.facingChoice = null;
    chooseFacing(b, u, function () { nextTurn(b); });
  }

  function chooseFacing(b, unit, done) {
    b.phase = 'facing';
    openMenu(b, 'Face which way?', [
      { label: 'Up', run: function () { unit.facing = DIR.UP; done(); } },
      { label: 'Down', run: function () { unit.facing = DIR.DOWN; done(); } },
      { label: 'Left', run: function () { unit.facing = DIR.LEFT; done(); } },
      { label: 'Right', run: function () { unit.facing = DIR.RIGHT; done(); } }
    ]);
  }

  function openCommandMenu(b, unit) {
    var canCombo = unit.kind === 'Bondkin' && unit.pathPoints >= COMBO_PP_COST;
    openMenu(b, unit.name + ' - Command', [
      { label: 'Move', disabled: unit.hasMoved, run: function () { startMove(b, unit); } },
      { label: 'Action', disabled: unit.hasActed, run: function () { openActionMenu(b, unit); } },
      { label: 'Combo' + (canCombo ? ' (' + COMBO_PP_COST + ' PP)' : ' (Bondkin only)'),
        disabled: unit.hasActed || !canCombo,
        run: function () { startCombo(b, unit); } },
      { label: 'Wait', run: function () { endActiveTurn(b, true); } }
    ]);
  }

  function openActionMenu(b, unit) {
    var items = [
      { label: 'Attack', run: function () { startTargeting(b, unit, { kind: 'attack', name: 'Attack', range: 1, fx: 'fx_slash' }); } },
      { label: 'Fire - 8 MP', disabled: unit.mp < COST_BASIC, run: function () { startTargeting(b, unit, { kind: 'spell', name: 'Fire', cost: COST_BASIC, range: 3, fx: 'fx_fire', power: 14 }); } },
      { label: 'Fira - 12 MP', disabled: unit.mp < COST_MID, run: function () { startTargeting(b, unit, { kind: 'spell', name: 'Fira', cost: COST_MID, range: 3, fx: 'fx_fira', power: 20 }); } },
      { label: 'Cure - 8 MP', disabled: unit.mp < COST_BASIC, run: function () { startTargeting(b, unit, { kind: 'cure', name: 'Cure', cost: COST_BASIC, range: 3, fx: 'fx_cure', power: 16 }); } }
    ];
    openMenu(b, 'Action', items.concat([
      { label: 'Back', run: function () { openCommandMenu(b, unit); } }
    ]));
  }

  function startMove(b, unit) {
    b.phase = 'move';
    b.moveTiles = moveRange(b, unit);
    log(b, unit.name + ': pick a blue tile to move to. B cancels.');
  }

  function startTargeting(b, unit, pending) {
    b.phase = 'target';
    b.pending = pending;
    b.targetTiles = [];
    for (var x = 0; x < GRID_N; x++) {
      for (var y = 0; y < GRID_N; y++) {
        if (manhattan(unit.x, unit.y, x, y) > pending.range) { continue; }
        var t = unitAt(b, x, y);
        if (pending.kind === 'cure') {
          if (t && t.side === 'player' && t.alive) { b.targetTiles.push({ x: x, y: y }); }
        } else {
          if (t && t.side === 'enemy' && t.alive) { b.targetTiles.push({ x: x, y: y }); }
        }
      }
    }
    if (!b.targetTiles.length) {
      log(b, 'No target in range for ' + pending.name + '.');
      openActionMenu(b, unit);
      return;
    }
    log(b, pending.name + ': pick a red tile. B cancels.');
  }

  function startCombo(b, unit) {
    var foes = aliveUnits(b, 'enemy').filter(function (f) {
      return manhattan(unit.x, unit.y, f.x, f.y) <= 2;
    });
    if (!foes.length) {
      log(b, 'Combo needs a foe within 2 tiles.');
      openCommandMenu(b, unit);
      return;
    }
    b.phase = 'target';
    b.pending = { kind: 'combo', name: 'Combo', range: 2, fx: 'fx_sparkle', cost: 0 };
    b.targetTiles = foes.map(function (f) { return { x: f.x, y: f.y }; });
    log(b, 'Combo: pick a red tile. Nearby Bondkin and Wildlife join in.');
  }

  async function doMove(b, unit, tx, ty) {
    b.phase = 'anim';
    b.moveTiles = [];
    var path = findPath(b, unit, tx, ty);
    unit.pose = POSE.WALK;
    for (var i = 0; i < path.length; i++) {
      unit.x = path[i].x;
      unit.y = path[i].y;
      var p = tileToScreen(unit.x, unit.y);
      unit.px = p.x; unit.py = p.y;
      await sleepScaled(b, 130);
    }
    unit.pose = POSE.IDLE;
    unit.hasMoved = true;
    if (checkEnd(b)) { return finishBattle(b, checkEnd(b)); }
    if (unit.hasActed) { endActiveTurn(b, false); }
    else { b.phase = 'turn'; openCommandMenu(b, unit); }
  }

  function findPath(b, unit, tx, ty) {
    /* Straight Manhattan path, step by step. Good enough for a 6x6 field. */
    var path = [];
    var cx = unit.x, cy = unit.y;
    while (cx !== tx || cy !== ty) {
      if (cx < tx) { cx++; } else if (cx > tx) { cx--; }
      else if (cy < ty) { cy++; } else if (cy > ty) { cy--; }
      path.push({ x: cx, y: cy });
    }
    return path;
  }

  async function doAttack(b, unit, target) {
    b.phase = 'anim';
    b.targetTiles = [];
    unit.pose = POSE.ATTACK;
    faceToward(unit, target.x, target.y);
    await sleepScaled(b, 220);
    dealDamage(b, unit, target, unit.atk + 4, b.pending.fx || 'fx_slash', unit.name + ' attacks');
    unit.pose = POSE.IDLE;
    await sleepScaled(b, 650);
    unit.hasActed = true;
    afterAction(b, unit);
  }

  async function doSpell(b, unit, target, pending) {
    b.phase = 'anim';
    b.targetTiles = [];
    unit.mp -= pending.cost;
    unit.pose = POSE.CAST;
    await sleepScaled(b, 300);
    dealDamage(b, unit, target, pending.power, pending.fx, unit.name + ' casts ' + pending.name);
    unit.pose = POSE.IDLE;
    await sleepScaled(b, 650);
    unit.hasActed = true;
    afterAction(b, unit);
  }

  async function doCure(b, unit, target, pending) {
    b.phase = 'anim';
    b.targetTiles = [];
    unit.mp -= pending.cost;
    unit.pose = POSE.CAST;
    await sleepScaled(b, 300);
    healUnit(b, unit, target, pending.power, pending.fx);
    unit.pose = POSE.IDLE;
    await sleepScaled(b, 500);
    unit.hasActed = true;
    afterAction(b, unit);
  }

  async function doCombo(b, unit, target) {
    b.phase = 'anim';
    b.targetTiles = [];
    unit.pathPoints -= COMBO_PP_COST;
    var joiners = aliveUnits(b, 'player').filter(function (u) {
      return u !== unit && manhattan(unit.x, unit.y, u.x, u.y) <= 2;
    }).slice(0, COMBO_MAX_JOINERS);
    var hitters = [unit].concat(joiners);
    log(b, unit.name + ' starts a Combo. ' + hitters.length + ' unit(s) join in.');
    for (var i = 0; i < hitters.length; i++) {
      var h = hitters[i];
      h.pose = POSE.ATTACK;
      faceToward(h, target.x, target.y);
      await sleepScaled(b, 180);
      var mult = facingMult(h, target);
      var dmg = Math.max(1, Math.round((h.atk + 2) * 0.75 * mult));
      target.hp = Math.max(0, target.hp - dmg);
      addEffect(b, 'fx_sparkle', target, 56);
      addFloat(b, target, '-' + dmg, '#ffffff');
      if (target.hp <= 0) { knockOut(b, target); break; }
      h.pose = POSE.IDLE;
      await sleepScaled(b, 260);
    }
    addFloat(b, target, 'Combo!', '#ffd94a');
    await sleepScaled(b, 500);
    unit.hasActed = true;
    afterAction(b, unit);
  }

  function afterAction(b, unit) {
    if (checkEnd(b)) { return finishBattle(b, checkEnd(b)); }
    if (unit.hasMoved) { endActiveTurn(b, false); }
    else { b.phase = 'turn'; openCommandMenu(b, unit); }
  }

  /* Enemy AI: close in on the nearest player unit, attack when adjacent,
   * cast Fire when MP allows and a target sits in range, else wait. */
  async function runEnemyTurn(b, unit) {
    await sleepScaled(b, 500);
    var players = aliveUnits(b, 'player');
    if (!players.length) { return finishBattle(b, 'lost'); }
    var nearest = players[0];
    var best = manhattan(unit.x, unit.y, nearest.x, nearest.y);
    players.forEach(function (p) {
      var d = manhattan(unit.x, unit.y, p.x, p.y);
      if (d < best) { best = d; nearest = p; }
    });
    if (unit.mp >= COST_BASIC && best <= 3 && best > 1 && unit.spells.indexOf('Fire') >= 0) {
      unit.mp -= COST_BASIC;
      unit.pose = POSE.CAST;
      await sleepScaled(b, 300);
      dealDamage(b, unit, nearest, 12, 'fx_fire', unit.name + ' casts Fire');
      unit.pose = POSE.IDLE;
      await sleepScaled(b, 600);
    } else if (best <= 1) {
      unit.pose = POSE.ATTACK;
      await sleepScaled(b, 220);
      dealDamage(b, unit, nearest, unit.atk + 4, 'fx_slash', unit.name + ' attacks');
      unit.pose = POSE.IDLE;
      await sleepScaled(b, 600);
    } else {
      var tiles = moveRange(b, unit);
      var step = null;
      var stepD = best;
      tiles.forEach(function (t) {
        var d = manhattan(t.x, t.y, nearest.x, nearest.y);
        if (d < stepD) { stepD = d; step = t; }
      });
      if (step) {
        unit.pose = POSE.WALK;
        unit.x = step.x; unit.y = step.y;
        var p = tileToScreen(unit.x, unit.y);
        unit.px = p.x; unit.py = p.y;
        await sleepScaled(b, 200);
        unit.pose = POSE.IDLE;
        if (manhattan(unit.x, unit.y, nearest.x, nearest.y) <= 1) {
          unit.pose = POSE.ATTACK;
          await sleepScaled(b, 220);
          dealDamage(b, unit, nearest, unit.atk + 4, 'fx_slash', unit.name + ' attacks');
          unit.pose = POSE.IDLE;
          await sleepScaled(b, 600);
        }
      } else {
        log(b, unit.name + ' waits.');
        await sleepScaled(b, 300);
      }
    }
    if (checkEnd(b)) { return finishBattle(b, checkEnd(b)); }
    b.phase = 'anim';
    chooseFacing(b, unit, function () { nextTurn(b); });
  }

  /* ------------------------------------------------------------------ */
  /* Rendering: top screen                                               */
  /* ------------------------------------------------------------------ */

  function drawText(ctx, text, x, y, color, bold, size) {
    ctx.save();
    ctx.font = (bold ? 'bold ' : '') + (size || 8) + 'px monospace';
    ctx.fillStyle = color || '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function hpColor(hp, max) {
    var r = hp / max;
    if (r > 0.5) { return '#3ac84a'; }
    if (r > 0.2) { return '#e8c83a'; }
    return '#e84a3a';
  }

  function drawHpBar(ctx, x, y, w, hp, max) {
    ctx.fillStyle = '#202028';
    ctx.fillRect(x, y, w, 5);
    ctx.fillStyle = hpColor(hp, max);
    ctx.fillRect(x, y, Math.max(0, Math.round(w * hp / max)), 5);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w, 5);
  }

  /* Fast Forward: displayed HP drains toward real HP in the render
   * loop, at a rate scaled by the battle speed. Text still shows the
   * real HP number; only the bar drains. */
  function dispHp(u) { return (u && u.dispHp !== undefined) ? u.dispHp : (u ? u.hp : 0); }

  /* Fast Forward speed button, top right of the top screen, in the
   * gap between the icon strip (y 0-16) and the turn rows (first
   * highlight starts y 29). 44x11, always shows the current speed.
   * Text is drawn with an explicit middle baseline: the top canvas
   * is shared with the engine, which leaves textBaseline 'top' set
   * after story scenes, and the old bare fillText at y+11 then drew
   * the label from y 11 down, half below the box. */
  function drawSpeedButton(b, ctx) {
    var r = SPEED_BUTTON;
    ctx.fillStyle = '#101826';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#3a5a8a';
    ctx.fillRect(r.x, r.y, r.w, 2);
    ctx.strokeStyle = '#ffe98a';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    ctx.save();
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe98a';
    ctx.fillText(speedLabel(b), r.x + r.w / 2, r.y + r.h / 2 + 1);
    ctx.restore();
  }

  function drawTopScreen(b, now) {
    var ctx = b.topCtx;
    ctx.fillStyle = '#1a2438';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    /* ov3 turn order bar art for the y 0-16 strip, text drawn on top. */
    var turnbar = loadImage('ov3_grid_turnbar.png');
    if (imageReady(turnbar)) {
      ctx.drawImage(turnbar, 0, 0, SCREEN_W, 16);
    } else {
      ctx.fillStyle = '#28344f';
      ctx.fillRect(0, 0, SCREEN_W, 16);
    }
    /* Turn list header sits BELOW the 0-16 icon strip, never on it:
     * the strip art is a row of portraits that covered the text.
     * Rows start at y 38 so the header has clear space above them.
     * The speed button sits in the y 17-28 gap between the strip
     * and the first row highlight, clear of both. */
    drawText(ctx, 'UNIT TURN LIST', 6, 27, '#ffe98a', true, 9);
    drawText(ctx, 'Round ' + b.round, 150, 27, '#ffffff', false, 8);
    drawSpeedButton(b, ctx);

    var list = b.order.length ? b.order : aliveUnits(b);
    var y = 38;
    for (var i = 0; i < list.length && i < 6; i++) {
      var u = list[i];
      var isActive = b.active && u.id === b.active.id;
      if (isActive) {
        ctx.fillStyle = '#3a5a8a';
        ctx.fillRect(2, y - 9, SCREEN_W - 4, 15);
      }
      var label = (isActive ? '> ' : '  ') + u.name + '  ' + u.kind;
      /* GRID-FIX: a long name plus kind runs into the HP label at
       * x152 ("Saltwake Cutthroat WildlifeHP 30/30" had a 2px gap).
       * Shorten the kind to a 4-letter abbreviation with a dot
       * ("Wild.") until the whole label measures 140px or less, so
       * at least 6px of clear space stays before the HP label. The
       * unit name itself is never cut. */
      ctx.font = (isActive ? 'bold ' : '') + '8px monospace';
      if (ctx.measureText(label).width > 140) {
        var labelKind = String(u.kind || '').slice(0, 4);
        label = (isActive ? '> ' : '  ') + u.name + '  ' + labelKind + '.';
        while (labelKind.length > 1 && ctx.measureText(label).width > 140) {
          labelKind = labelKind.slice(0, -1);
          label = (isActive ? '> ' : '  ') + u.name + '  ' + labelKind + '.';
        }
      }
      drawText(ctx, label, 6, y, u.alive ? '#ffffff' : '#888888', isActive, 8);
      /* HP label and HP bar share the row but never the same x range:
       * the label reads in full at x 152, the bar sits to its right
       * at x 194, so the bar can no longer cover the "HP" text. */
      drawText(ctx, 'HP ' + Math.max(0, u.hp) + '/' + u.maxHp, 152, y, '#ffffff', false, 8);
      drawHpBar(ctx, 194, y - 5, 28, Math.max(0, Math.round(dispHp(u))), u.maxHp);
      if (u.status) { drawText(ctx, u.status.toUpperCase(), 226, y, '#e8a8ff', true, 7); }
      y += 16;
    }

    /* Active unit status box with portrait. */
    var a = b.active;
    ctx.fillStyle = '#101826';
    ctx.fillRect(2, 122, SCREEN_W - 4, 68);
    ctx.strokeStyle = '#5a7ab8';
    ctx.lineWidth = 1;
    ctx.strokeRect(2.5, 122.5, SCREEN_W - 5, 68);
    if (a) {
      /* Portrait: sprite frame drawn large, token fallback if missing. */
      ctx.save();
      ctx.beginPath(); ctx.rect(8, 128, 56, 56); ctx.clip();
      ctx.fillStyle = '#28344f'; ctx.fillRect(8, 128, 56, 56);
      if (a.sheetImg && !a.sheetImg._fed13Missing && a.sheetImg.complete && a.sheetImg.naturalWidth > 0) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(a.sheetImg, 0, 0, FRAME_W, FRAME_H, 8, 128, 56, 56);
      } else {
        ctx.fillStyle = a.color || '#7a9a5a';
        ctx.beginPath(); ctx.arc(36, 152, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = a.accent || '#ffffff';
        ctx.beginPath(); ctx.arc(36, 172, 20, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#202020';
        ctx.fillRect(28, 150, 4, 5);
        ctx.fillRect(40, 150, 4, 5);
      }
      ctx.restore();
      drawText(ctx, a.name, 72, 140, '#ffffff', true, 10);
      drawText(ctx, a.kind + (a.job ? ' - ' + a.job : ''), 72, 152, '#a8c8e8', false, 8);
      drawText(ctx, 'HP ' + Math.max(0, a.hp) + '/' + a.maxHp, 72, 164, '#ffffff', false, 8);
      drawHpBar(ctx, 120, 158, 80, Math.max(0, Math.round(dispHp(a))), a.maxHp);
      drawText(ctx, 'MP ' + a.mp + '/' + MP_MAX, 72, 176, '#8ac8ff', false, 8);
      drawText(ctx, 'SPD ' + a.speed + '  ATK ' + a.atk + '  PP ' + a.pathPoints, 120, 176, '#ffffff', false, 8);
      if (a.status) { drawText(ctx, 'Status: ' + a.status, 72, 186, '#e8a8ff', true, 8); }
    } else {
      drawText(ctx, 'No active unit.', 8, 140, '#a8a8c8', false, 8);
    }

    /* Dialogue on the top screen, portrait plus text. */
    if (b.dialogue) { drawDialogue(b, ctx, now); }
  }

  function drawDialogue(b, ctx, now) {
    var d = b.dialogue;
    var line = d.lines[d.i];
    /* ov3 dark dialogue box art, opaque, scaled to 0,96,256,96.
     * Speaker, text and prompt are drawn on top, unchanged. */
    var dialogBox = loadImage('ov3_dialog_box_dark.png');
    if (imageReady(dialogBox)) {
      ctx.drawImage(dialogBox, 0, 96, SCREEN_W, 96);
    } else {
      ctx.fillStyle = 'rgba(8,10,18,0.92)';
      ctx.fillRect(0, 96, SCREEN_W, 96);
    }
    ctx.strokeStyle = '#ffe98a';
    ctx.lineWidth = 1;
    ctx.strokeRect(1.5, 97.5, SCREEN_W - 3, 93);
    var speaker = line.speaker || '';
    drawText(ctx, speaker, 8, 110, '#ffe98a', true, 9);
    wrapText(ctx, line.text, 8, 124, SCREEN_W - 16, 11, '#ffffff');
    var blink = Math.floor(now / 400) % 2 === 0;
    if (blink) { drawText(ctx, 'A: next', 210, 186, '#a8c8e8', false, 8); }
  }

  function wrapText(ctx, text, x, y, maxW, lineH, color) {
    ctx.save();
    ctx.font = '8px monospace';
    ctx.fillStyle = color;
    var words = String(text).split(' ');
    var line = '';
    var cy = y;
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, cy);
        line = w;
        cy += lineH;
      } else { line = test; }
    });
    if (line) { ctx.fillText(line, x, cy); }
    ctx.restore();
  }

  /* ------------------------------------------------------------------ */
  /* Rendering: bottom screen                                            */
  /* ------------------------------------------------------------------ */

  function drawTile(ctx, x, y, fill, stroke) {
    var p = tileToScreen(x, y);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + TILE_W / 2, p.y + TILE_H / 2);
    ctx.lineTo(p.x, p.y + TILE_H);
    ctx.lineTo(p.x - TILE_W / 2, p.y + TILE_H / 2);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawBottomScreen(b, now) {
    var ctx = b.bottomCtx;
    ctx.fillStyle = '#0e1a12';
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    /* Fast Forward camera pan: a small nudge toward the active unit
     * that always eases back to zero, so the full field stays in view
     * and the camera is back to the full field view before any player
     * choice opens (openMenu resets it). The log strip, menus and
     * banners below are drawn untranslated. */
    ctx.save();
    ctx.translate(b.cam ? (b.cam.ox || 0) : 0, b.cam ? (b.cam.oy || 0) : 0);

    /* Field background image when present, else painted grass tiles. */
    var bg = b.mapImg;
    if (bg && !bg._fed13Missing && bg.complete && bg.naturalWidth > 0) {
      ctx.drawImage(bg, 0, 0, SCREEN_W, SCREEN_H);
    } else {
      ctx.fillStyle = '#3a7a3a';
      ctx.fillRect(0, 0, SCREEN_W, 156);
      ctx.fillStyle = '#2a5a2a';
      for (var gy = 0; gy < 156; gy += 8) {
        for (var gx = 0; gx < SCREEN_W; gx += 8) {
          if ((gx + gy) % 16 === 0) { ctx.fillRect(gx, gy, 8, 8); }
        }
      }
    }

    /* Deployment tiles stay green while placing. */
    var showDeploy = b.phase === 'deploy';
    for (var x = 0; x < GRID_N; x++) {
      for (var y = 0; y < GRID_N; y++) {
        var isDeploy = showDeploy && x <= 1;
        var base = (x + y) % 2 === 0 ? 'rgba(90,180,90,0.55)' : 'rgba(70,150,70,0.55)';
        if (isDeploy) { base = 'rgba(60,200,80,0.75)'; }
        drawTile(ctx, x, y, base, 'rgba(0,0,0,0.25)');
      }
    }

    /* Blue movement tiles, red target tiles. */
    b.moveTiles.forEach(function (t) {
      drawTile(ctx, t.x, t.y, 'rgba(60,120,255,0.65)', '#c8dcff');
    });
    b.targetTiles.forEach(function (t) {
      drawTile(ctx, t.x, t.y, 'rgba(255,60,50,0.65)', '#ffc8c8');
    });

    /* Cursor tile. ov3 cursor art is 64x64, the iso diamond is
     * 32x16, so the art is scaled into the diamond footprint and
     * clipped to the diamond. Diamond size and position unchanged. */
    if (b.phase !== 'dialogue') {
      var c = b.cursor;
      var cursorImg = loadImage('ov3_grid_cursor.png');
      if (imageReady(cursorImg)) {
        var cp = tileToScreen(c.x, c.y);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cp.x, cp.y);
        ctx.lineTo(cp.x + TILE_W / 2, cp.y + TILE_H / 2);
        ctx.lineTo(cp.x, cp.y + TILE_H);
        ctx.lineTo(cp.x - TILE_W / 2, cp.y + TILE_H / 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(cursorImg, cp.x - TILE_W / 2, cp.y, TILE_W, TILE_H);
        ctx.restore();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cp.x, cp.y);
        ctx.lineTo(cp.x + TILE_W / 2, cp.y + TILE_H / 2);
        ctx.lineTo(cp.x, cp.y + TILE_H);
        ctx.lineTo(cp.x - TILE_W / 2, cp.y + TILE_H / 2);
        ctx.closePath();
        ctx.stroke();
      } else {
        drawTile(ctx, c.x, c.y, 'rgba(255,255,255,0.12)', '#ffffff');
      }
    }

    /* Units, sorted by tile depth so nearer units draw over farther ones. */
    var drawList = b.units.filter(function (u) { return u.alive && !u.offField; });
    drawList.sort(function (a, c) { return (a.x + a.y) - (c.x + c.y); });
    drawList.forEach(function (u) {
      drawUnitSprite(ctx, u, u.px, u.py + 8, u.pose, now);
      /* Small HP bar over each unit. */
      var hpW = 24;
      ctx.fillStyle = '#202028';
      ctx.fillRect(u.px - hpW / 2, u.py - 30, hpW, 3);
      ctx.fillStyle = hpColor(u.hp, u.maxHp);
      ctx.fillRect(u.px - hpW / 2, u.py - 30, Math.max(0, Math.round(hpW * dispHp(u) / u.maxHp)), 3);
      if (b.active && u.id === b.active.id) {
        drawText(ctx, '>', u.px - 20, u.py - 28, '#ffe98a', true, 9);
      }
    });

    /* KO markers for fallen units stay visible on their tile. */
    b.units.filter(function (u) { return !u.alive && !u.offField; }).forEach(function (u) {
      var p = tileToScreen(u.x, u.y);
      drawText(ctx, 'KO', p.x - 8, p.y + 4, '#ff5a4a', true, 9);
    });

    /* Spell and attack effects. */
    b.effects.forEach(function (e) {
      var t = clamp(e.t / e.dur, 0, 1);
      drawFxImage(ctx, e.fx, e.x, e.y, e.size, t);
    });

    /* Damage numbers: bold white with a dark outline, healing green. */
    b.floats.forEach(function (f) {
      var rise = f.t * 22;
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#101010';
      ctx.globalAlpha = 1 - f.t * 0.7;
      ctx.strokeText(f.text, f.x, f.y - rise);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - rise);
      ctx.restore();
    });

    /* Weather overlays: rain streaks, fog drift. */
    drawWeather(ctx, b, now);
    ctx.restore();

    /* Battle log strip. Top of the bottom screen, in its own dedicated
     * strip, clear of the menus: every menu sits at x >= 102 and
     * y >= 74 (Action menu, 5 items, is the highest at y 74), so this
     * strip (y 0-26, full width) never intersects any menu rect. The
     * grid starts at GRID_OY 50, so no unit chrome reaches the strip.
     * The message wraps by measured width to at most two lines, so a
     * long hint is never sliced mid-word: the old 52-char slice cut
     * the deployment hint off at "Press" and the single line was
     * drawn at y 10 with the ambient 'top' baseline, hanging below
     * the 14px strip. Lines are drawn with an explicit 'top'
     * baseline at y 4 and y 15, inside the 26px strip. */
    ctx.fillStyle = 'rgba(8,10,18,0.85)';
    ctx.fillRect(0, 0, SCREEN_W, 26);
    ctx.save();
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';
    var logWords = String(b.message || '').split(' ');
    var logLine = '';
    var logY = 4;
    var logDrawn = 0;
    for (var wi = 0; wi < logWords.length && logDrawn < 2; wi++) {
      var logTest = logLine ? logLine + ' ' + logWords[wi] : logWords[wi];
      if (ctx.measureText(logTest).width > SCREEN_W - 8 && logLine) {
        drawText(ctx, logLine, 4, logY, '#ffffff', false, 8);
        logLine = logWords[wi];
        logY += 11;
        logDrawn++;
      } else { logLine = logTest; }
    }
    if (logLine && logDrawn < 2) { drawText(ctx, logLine, 4, logY, '#ffffff', false, 8); }
    ctx.restore();

    /* Command menu. */
    if (b.menu) { drawMenu(ctx, b.menu); }

    /* Win and lose banners. */
    if (b.phase === 'won' || b.phase === 'lost') {
      ctx.fillStyle = 'rgba(8,10,18,0.75)';
      ctx.fillRect(0, 60, SCREEN_W, 50);
      var title = b.phase === 'won' ? 'VICTORY' : 'DEFEAT';
      var color = b.phase === 'won' ? '#ffe98a' : '#ff5a4a';
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#101010';
      ctx.strokeText(title, SCREEN_W / 2, 86);
      ctx.fillStyle = color;
      ctx.fillText(title, SCREEN_W / 2, 86);
      ctx.restore();
      drawText(ctx, b.phase === 'won' ? 'The harbor is safe.' : 'The party has fallen.', 78, 102, '#ffffff', false, 8);
    }
  }

  function drawWeather(ctx, b, now) {
    if (b.weather === 'rain') {
      ctx.save();
      ctx.strokeStyle = 'rgba(180,200,255,0.7)';
      ctx.lineWidth = 1;
      for (var i = 0; i < 24; i++) {
        var rx = ((i * 37 + Math.floor(now / 30) * 3) % 270) - 8;
        var ry = (i * 53 + Math.floor(now / 18) * 7) % 150;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 8);
        ctx.stroke();
      }
      ctx.restore();
    } else if (b.weather === 'fog') {
      ctx.save();
      var off = (now / 40) % 256;
      ctx.fillStyle = 'rgba(200,200,210,0.16)';
      ctx.fillRect(-off, 20, 256, 26);
      ctx.fillRect(256 - off, 70, 256, 30);
      ctx.fillRect(-off + 128, 110, 256, 24);
      ctx.restore();
    }
  }

  function drawMenu(ctx, m) {
    /* One menu layer only. The ov3 menu art carries baked-in menu
     * text of its own (Move / Attack / Ability / Item / Wait /
     * Combo), so drawing it under the live items showed two item
     * sets at once. The panel is drawn plain and the live items
     * are the only text, exactly as the pre-v3 menu was. */
    ctx.fillStyle = '#101826';
    ctx.fillRect(m.x, m.y, m.w, m.h);
    ctx.strokeStyle = '#ffe98a';
    ctx.lineWidth = 1;
    ctx.strokeRect(m.x + 0.5, m.y + 0.5, m.w - 1, m.h - 1);
    drawText(ctx, m.title, m.x + 6, m.y + 12, '#ffe98a', true, 8);
    ctx.strokeStyle = '#5a7ab8';
    ctx.beginPath(); ctx.moveTo(m.x + 4, m.y + 16); ctx.lineTo(m.x + m.w - 4, m.y + 16); ctx.stroke();
    m.items.forEach(function (item, i) {
      var y = m.y + 20 + i * 18;
      if (i === m.sel) {
        ctx.fillStyle = '#3a5a8a';
        ctx.fillRect(m.x + 2, y, m.w - 4, 16);
      }
      drawText(ctx, item.label, m.x + 6, y + 8, item.disabled ? '#666a78' : '#ffffff', false, 8);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Input: touch and click on the bottom screen, plus keyboard.         */
  /* ------------------------------------------------------------------ */

  function bindInput(b) {
    var cv = b.bottomCanvas;
    function toGameCoords(ev) {
      var r = cv.getBoundingClientRect();
      var px = (ev.clientX - r.left) * (SCREEN_W / r.width);
      var py = (ev.clientY - r.top) * (SCREEN_H / r.height);
      return { x: px, y: py };
    }
    cv.addEventListener('click', function (ev) {
      var p = toGameCoords(ev);
      handleTap(b, p.x, p.y);
    });
    cv.addEventListener('touchstart', function (ev) {
      ev.preventDefault();
      var t = ev.touches[0];
      var r = cv.getBoundingClientRect();
      handleTap(b, (t.clientX - r.left) * (SCREEN_W / r.width), (t.clientY - r.top) * (SCREEN_H / r.height));
    }, { passive: false });
    /* Fast Forward button lives on the top screen, above the turn
     * order display. One tap cycles the speed. Bound once per canvas
     * element so a later battle reusing the same screen does not
     * stack a second listener and cycle twice per tap. */
    var topCv = b.topCanvas;
    if (topCv && !topCv._fed13SpeedBound) {
      topCv._fed13SpeedBound = true;
      topCv.addEventListener('click', function (ev) {
        var r = topCv.getBoundingClientRect();
        var px = (ev.clientX - r.left) * (SCREEN_W / r.width);
        var py = (ev.clientY - r.top) * (SCREEN_H / r.height);
        if (speedButtonHit(px, py)) { cycleSpeed(currentBattle); }
      });
      topCv.addEventListener('touchstart', function (ev) {
        ev.preventDefault();
        var t = ev.touches[0];
        var r = topCv.getBoundingClientRect();
        var px = (t.clientX - r.left) * (SCREEN_W / r.width);
        var py = (t.clientY - r.top) * (SCREEN_H / r.height);
        if (speedButtonHit(px, py)) { cycleSpeed(currentBattle); }
      }, { passive: false });
    }
    b._keyHandler = function (ev) {
      handleKey(b, ev);
    };
    document.addEventListener('keydown', b._keyHandler);
  }

  function unbindInput(b) {
    if (b._keyHandler) { document.removeEventListener('keydown', b._keyHandler); }
  }

  function handleTap(b, px, py) {
    if (b.ended) { return; }
    if (b.dialogue) { advanceDialogue(b); return; }
    if (b.phase === 'won' || b.phase === 'lost') { return; }
    if (b.menu) {
      var idx = menuHit(b, px, py);
      if (idx >= 0) { runMenuItem(b, idx); return; }
    }
    var tile = screenToTile(px, py);
    if (!tile) { return; }
    b.cursor = tile;
    if (b.phase === 'deploy') {
      var sel = b.selectedDeploy;
      if (sel) {
        var occupant = unitAt(b, tile.x, tile.y);
        if (tile.x <= 1 && !occupant) {
          sel.x = tile.x; sel.y = tile.y;
          var p = tileToScreen(tile.x, tile.y);
          sel.px = p.x; sel.py = p.y;
          b.selectedDeploy = null;
          log(b, sel.name + ' placed.');
        }
      } else {
        var u = unitAt(b, tile.x, tile.y);
        if (u && u.side === 'player') { b.selectedDeploy = u; log(b, u.name + ': pick a green tile.'); }
      }
      return;
    }
    if (b.phase === 'move') {
      var ok = b.moveTiles.some(function (t) { return t.x === tile.x && t.y === tile.y; });
      if (ok) { doMove(b, b.active, tile.x, tile.y); }
      return;
    }
    if (b.phase === 'target') {
      var hit = b.targetTiles.some(function (t) { return t.x === tile.x && t.y === tile.y; });
      if (!hit) { return; }
      var target = unitAt(b, tile.x, tile.y);
      if (!target) { return; }
      var unit = b.active;
      var pending = b.pending;
      if (pending.kind === 'attack') { doAttack(b, unit, target); }
      else if (pending.kind === 'spell') { doSpell(b, unit, target, pending); }
      else if (pending.kind === 'cure') { doCure(b, unit, target, pending); }
      else if (pending.kind === 'combo') { doCombo(b, unit, target); }
      return;
    }
    if (b.phase === 'turn') {
      var tapped = unitAt(b, tile.x, tile.y);
      if (tapped && b.active && tapped.id === b.active.id) { openCommandMenu(b, b.active); }
    }
  }

  function handleKey(b, ev) {
    if (b.ended) { return; }
    var k = ev.key;
    if (k === 'f' || k === 'F') { cycleSpeed(b); return; }
    if (b.dialogue) {
      if (k === 'Enter' || k === ' ' || k === 'a' || k === 'A') { advanceDialogue(b); }
      return;
    }
    if (b.phase === 'won' || b.phase === 'lost') { return; }
    if (b.menu && (k >= '1' && k <= '9')) {
      var idx = parseInt(k, 10) - 1;
      runMenuItem(b, idx);
      return;
    }
    if (k === 'Escape' || k === 'b' || k === 'B') {
      if (b.phase === 'move') { b.phase = 'turn'; b.moveTiles = []; openCommandMenu(b, b.active); }
      else if (b.phase === 'target') { b.phase = 'turn'; b.targetTiles = []; openActionMenu(b, b.active); }
      return;
    }
    if (k === 'Enter' || k === ' ') {
      if (b.phase === 'turn' && b.active) { openCommandMenu(b, b.active); }
      return;
    }
    var dx = 0, dy = 0;
    if (k === 'ArrowLeft') { dx = -1; }
    else if (k === 'ArrowRight') { dx = 1; }
    else if (k === 'ArrowUp') { dy = -1; }
    else if (k === 'ArrowDown') { dy = 1; }
    else { return; }
    b.cursor = {
      x: clamp(b.cursor.x + dx, 0, GRID_N - 1),
      y: clamp(b.cursor.y + dy, 0, GRID_N - 1)
    };
    ev.preventDefault();
  }

  /* ------------------------------------------------------------------ */
  /* On-screen controls: FED13.grid.press(action).                       */
  /* The engine forwards FED13.press to the active module, and the      */
  /* on-screen D-pad and A/B/X/START buttons in index.html call         */
  /* FED13.press with logical names: up, down, left, right, confirm,    */
  /* cancel, menu, start. The grid keyboard handler above only listens */
  /* to the real keyboard, so these buttons did nothing on the grid     */
  /* screen. This entry mirrors that handler without changing it:       */
  /* D-pad moves the cursor, A/confirm selects, B/cancel goes back,     */
  /* X opens or closes a menu, START acts as confirm. When a menu is    */
  /* open the D-pad moves the menu selection instead, so the on-screen   */
  /* buttons can drive the Move/Action/Combo/Wait menus, the facing     */
  /* choice, deployment and the asking scene with no digit keys.        */
  /* ------------------------------------------------------------------ */

  var currentBattle = null;

  function normalizeAction(action) {
    if (action === ' ') { return 'confirm'; }
    if (action === null || action === undefined) { return null; }
    var a = String(action).trim().toLowerCase();
    if (a === 'arrowup') { return 'up'; }
    if (a === 'arrowdown') { return 'down'; }
    if (a === 'arrowleft') { return 'left'; }
    if (a === 'arrowright') { return 'right'; }
    if (a === 'a' || a === 'enter' || a === 'z') { return 'confirm'; }
    if (a === 'b' || a === 'escape' || a === 'esc') { return 'cancel'; }
    if (a === 'speed' || a === 'ff' || a === 'fastforward' || a === 'fast-forward') { return 'speed'; }
    if (a === 'x') { return 'menu'; }
    if (a === 'up' || a === 'down' || a === 'left' || a === 'right' ||
        a === 'confirm' || a === 'cancel' || a === 'menu' || a === 'start') { return a; }
    return null;
  }

  function moveMenuSel(b, delta) {
    var m = b.menu;
    if (!m || !m.items || !m.items.length) { return; }
    var n = m.items.length;
    var idx = (typeof m.sel === 'number') ? m.sel : 0;
    for (var step = 0; step < n; step++) {
      idx = ((idx + delta) % n + n) % n;
      if (!m.items[idx].disabled) { m.sel = idx; return; }
    }
  }

  function reopenDeployMenu(b) {
    if (typeof b._deployResolve !== 'function') { return; }
    var resolve = b._deployResolve;
    openMenu(b, 'Deployment', [
      { label: 'Start Battle', run: function () { resolve(); } }
    ]);
  }

  function cancelToMenu(b) {
    if (b.phase === 'move') {
      b.phase = 'turn'; b.moveTiles = [];
      if (b.active) { openCommandMenu(b, b.active); }
    } else if (b.phase === 'target') {
      b.phase = 'turn'; b.targetTiles = [];
      if (b.active) { openActionMenu(b, b.active); }
    }
  }

  function handlePress(b, action) {
    if (!b) { return; }
    action = normalizeAction(action);
    if (!action) { return; }
    if (b.ended) { return; }
    if (action === 'speed') { cycleSpeed(b); return; }
    if (b.dialogue) {
      if (action === 'confirm' || action === 'start') { advanceDialogue(b); }
      return;
    }
    if (b.phase === 'won' || b.phase === 'lost') { return; }
    if (b.menu) {
      if (action === 'up') { moveMenuSel(b, -1); }
      else if (action === 'down') { moveMenuSel(b, 1); }
      else if (action === 'confirm' || action === 'start') {
        runMenuItem(b, (typeof b.menu.sel === 'number') ? b.menu.sel : 0);
      }
      else if (action === 'cancel') {
        if (b.menu.title === 'Action' && b.active) { openCommandMenu(b, b.active); }
      }
      else if (action === 'menu') {
        if (b.menu.title === 'Deployment') { closeMenu(b); }
        else if (b.menu.title === 'Action' && b.active) { openCommandMenu(b, b.active); }
        else if (b.phase === 'turn') { closeMenu(b); }
      }
      return;
    }
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
      var dx = 0, dy = 0;
      if (action === 'left') { dx = -1; }
      else if (action === 'right') { dx = 1; }
      else if (action === 'up') { dy = -1; }
      else if (action === 'down') { dy = 1; }
      b.cursor = {
        x: clamp(b.cursor.x + dx, 0, GRID_N - 1),
        y: clamp(b.cursor.y + dy, 0, GRID_N - 1)
      };
      return;
    }
    if (action === 'confirm' || action === 'start') {
      if (b.phase === 'turn' && b.active) { openCommandMenu(b, b.active); }
      else if (b.phase === 'deploy' || b.phase === 'move' || b.phase === 'target') {
        var p = tileToScreen(b.cursor.x, b.cursor.y);
        handleTap(b, p.x, p.y);
      }
      return;
    }
    if (action === 'cancel') { cancelToMenu(b); return; }
    if (action === 'menu') {
      if (b.phase === 'deploy') { reopenDeployMenu(b); }
      else if (b.phase === 'turn' && b.active) { openCommandMenu(b, b.active); }
      else if (b.phase === 'move' || b.phase === 'target') { cancelToMenu(b); }
      return;
    }
  }

  function gridPress(action) {
    if (currentBattle) { handlePress(currentBattle, action); }
    else if (normalizeAction(action) === 'speed') { cycleSpeed(null); }
  }

  function gridIsActive() {
    return !!currentBattle && !currentBattle.ended;
  }

  /* ------------------------------------------------------------------ */
  /* Deployment phase                                                    */
  /* ------------------------------------------------------------------ */

  function runDeployment(b) {
    return new Promise(function (resolve) {
      b.phase = 'deploy';
      var players = aliveUnits(b, 'player');
      players.forEach(function (u, i) {
        if (!u.offField) {
          u.x = i % 2;
          u.y = 1 + i * 2;
          if (u.y >= GRID_N) { u.y = GRID_N - 1; }
          var p = tileToScreen(u.x, u.y);
          u.px = p.x; u.py = p.y;
        }
      });
      log(b, 'Deployment: tap a unit, then tap a green tile. Press Start when ready.');
      b._deployResolve = resolve;
      openMenu(b, 'Deployment', [
        { label: 'Start Battle', run: function () { resolve(); } }
      ]);
    });
  }

  /* ------------------------------------------------------------------ */
  /* First grid battle script, story Part 6.                             */
  /* The arc Bondkin steps in beside the hatched Wildlife, fights, then */
  /* asks to join the party. Bondkin ask to join. The trainer never      */
  /* hunts them.                                                         */
  /* ------------------------------------------------------------------ */

  async function runFirstGridScript(b) {
    var r = b.roster;
    if (!r) { return; }
    var blood = BLOODLINES[r.bondkin.bloodline] || BLOODLINES.elf;
    var w = r.wildlife;
    var k = r.bondkin;
    await showDialogue(b, [
      { speaker: 'Saltquay Harbor', text: 'Dawn at the harbor gate. Saltwake thugs block the road to the guild hall.' },
      { speaker: w.name, text: 'Your hatched Wildlife steps forward, ready for its first group battle.' },
      { speaker: k.name, text: 'Hold on. You will not face them alone.' },
      { speaker: k.name, text: 'I am ' + k.name + ', ' + blood.name + ' of Saltquay. My Totem Spirit is the ' + blood.totem + '. Let me lend a hand.' },
      { speaker: 'Saltwake Cutthroat', text: 'Two against two? That still favors us.' }
    ]);
    /* The arc Bondkin steps in beside the Wildlife. */
    k.offField = false;
    k.x = w.x;
    k.y = clamp(w.y + 1, 0, GRID_N - 1);
    if (unitAt(b, k.x, k.y) && k.y > 0) { k.y = w.y - 1; }
    var p = tileToScreen(k.x, k.y);
    k.px = p.x; k.py = p.y;
    addEffect(b, 'fx_sparkle', k, 56);
    log(b, k.name + ' steps in beside ' + w.name + '.');
    await sleepScaled(b, 700);
  }

  /* COLD OPEN POLISH: Maren entrance staging on the grid. Only runs
   * when config.coldOpen is set. Maren speaks her two entrance
   * lines, then steps onto the far edge of the field with a sparkle
   * burst, on her grid sheet g_maren.png. The scripted loss itself
   * lives in the 1v1 cold open battle, not here. */
  var COLD_OPEN_STAGING = {
    banner: 'assets/map_realm.png',
    portrait: 'assets/p_maren.png',
    battleSprite: 'assets/b_maren_front.png',
    gridSprite: 'assets/g_maren.png',
    entranceLines: [
      { speaker: 'Maren Saltwright', text: 'So this is Earth. Small skies. Loud little defenders. I had heard so much more.' },
      { speaker: 'Maren Saltwright', text: 'Oh, good. You give orders. That makes this fun. Come at me, all of you.' }
    ]
  };

  async function runColdOpenGridStaging(b) {
    var maren = (b.roster && b.roster.maren) || null;
    if (!maren) {
      b.units.forEach(function (u) { if (u.name === 'Maren Saltwright') { maren = u; } });
    }
    await showDialogue(b, COLD_OPEN_STAGING.entranceLines);
    if (maren) {
      /* Her grid sheet, even if the caller passed no sheet. */
      if (!maren.sheet) { maren.sheet = ENEMIES.maren.sheet; maren.sheetImg = loadSheet(ENEMIES.maren.sheet); }
      maren.offField = false;
      maren.x = GRID_N - 1;
      maren.y = 2;
      maren.facing = DIR.LEFT;
      var p = tileToScreen(maren.x, maren.y);
      maren.px = p.x; maren.py = p.y;
      addEffect(b, 'fx_sparkle', maren, 56);
      log(b, 'Maren Saltwright steps onto the far edge of the field.');
      await sleepScaled(b, 700);
    }
  }

  async function runAskingScene(b) {
    var r = b.roster;
    if (!r) { return; }
    var k = r.bondkin;
    var w = r.wildlife;
    /* FIX BATCH B5: the old branch auto set joined true when the
     * Bondkin was knocked out, without ever asking the player. Always
     * ask, even when knocked out: the KO line plays first, then the
     * same Yes / Not yet choice as the standing branch. */
    if (!k.alive) {
      await showDialogue(b, [
        { speaker: k.name, text: 'I fought beside you, and I fell. Rest, and I will stand with you again.' },
        { speaker: k.name, text: 'Bondkin choose their trainer. I choose you. Will you let me join your party?' }
      ]);
    } else {
      await showDialogue(b, [
        { speaker: k.name, text: 'That was a fine fight. You and ' + w.name + ' fight as one already.' },
        { speaker: k.name, text: 'Bondkin choose their trainer. I choose you. Will you let me join your party?' }
      ]);
    }
    var answer = await new Promise(function (resolve) {
      b.phase = 'dialogue';
      openMenu(b, k.name + ' asks to join', [
        { label: 'Yes, join us', run: function () { resolve(true); } },
        { label: 'Not yet', run: function () { resolve(false); } }
      ]);
    });
    closeMenu(b);
    b.joined = answer;
    if (answer) {
      await showDialogue(b, [
        { speaker: k.name, text: 'Then we travel together from here. One Wildlife, one Bondkin, one trainer.' },
        { speaker: 'Saltquay', text: k.name + ' joined the party. The guild job board waits inside.' }
      ]);
    } else {
      await showDialogue(b, [
        { speaker: k.name, text: 'I understand. I will wait at Saltquay. When you are ready, call for me.' }
      ]);
    }
  }

  /* ------------------------------------------------------------------ */
  /* End of battle                                                       */
  /* ------------------------------------------------------------------ */

  function finishBattle(b, result) {
    if (b.ended) { return; }
    b.ended = true;
    b.phase = result;
    b.moveTiles = [];
    b.targetTiles = [];
    b.pending = null;
    closeMenu(b);
    if (result === 'won') {
      log(b, 'Victory. All foes are knocked out.');
    } else {
      log(b, 'Defeat. The party has fallen.');
    }
    var summary = {
      victory: result === 'won',
      result: result,
      coldOpen: !!(b.cfg && b.cfg.coldOpen),
      rounds: b.round,
      joined: b.joined,
      survivors: aliveUnits(b, 'player').map(function (u) {
        return { name: u.name, kind: u.kind, hp: u.hp, maxHp: u.maxHp };
      }),
      log: b.log.slice()
    };
    setTimeout(function () {
      /* The loop has painted the VICTORY / DEFEAT banner every
       * frame during this wait. Stop it here, before onEnd hands
       * the screens back: a stopped loop never repaints, so the
       * frozen frame cannot overpaint the overworld, pause menu,
       * party, or Monster Bank screens that follow. The loop is
       * NOT stopped in finishBattle itself, only here, so the
       * banner stays visible for the full wait. The first grid
       * win restarts the loop for the asking scene in run(). */
      stopGridLoop(b);
      unbindInput(b);
      /* First grid victory defers onEnd until the asking scene has
       * played, so onEnd fires exactly once. */
      if (b._deferEnd && result === 'won') {
        if (b._resolve) { b._resolve(summary); }
        return;
      }
      if (b.onEnd) { b.onEnd(summary); }
      if (b._resolve) { b._resolve(summary); }
    }, Math.max(SPEED_BANNER_MIN_MS, Math.round(1600 / speedOf(b))));
  }

  /* ------------------------------------------------------------------ */
  /* Main loop                                                           */
  /* ------------------------------------------------------------------ */

  /* Stop the render loop for good. Set b.stopped and the loop
   * frame exits without drawing again and without re-registering,
   * which releases both canvases: the next screen paints them
   * with no grid frame coming back over it. The canvases are not
   * cleared here on purpose: the next screen owns painting them
   * (the overworld repaints both every frame, engine screens
   * paint on entry), and clearing after onEnd could wipe a
   * screen that already painted synchronously. */
  function stopGridLoop(b) {
    if (!b) { return; }
    b.stopped = true;
  }

  function startLoop(b) {
    /* One live frame chain per battle. The first grid win stops
     * the loop and run() restarts it for the asking scene: a frame
     * queued before the stop may still be pending when the restart
     * happens, and registering a second chain would draw every
     * frame twice. If a chain is already live (or pending), the
     * restart is a no-op and the pending frame carries on. */
    if (b._loopRunning) { return; }
    b._loopRunning = true;
    var last = 0;
    function frame(now) {
      if (b.stopped) { b._loopRunning = false; return; }
      if (b.ended && b.phase !== 'won' && b.phase !== 'lost') { b._loopRunning = false; return; }
      var dt = now - last;
      last = now;
      /* Clamp a jumped frame (first frame, tab switch) so one huge dt
       * never fast forwards every clock at once, including the pan. */
      if (dt > 50) { dt = 50; }
      if (dt > 0) {
        /* Fast Forward: every animated clock in the loop advances by
         * dt times the speed, so floats, effects, HP bar drains,
         * weather, idle bob and the camera pan all run faster. */
        var sdt = dt * speedOf(b);
        b.animClock += sdt;
        b.floats.forEach(function (f) { f.t += sdt / 800; });
        b.floats = b.floats.filter(function (f) { return f.t < 1; });
        b.effects.forEach(function (e) { e.t += sdt; });
        b.effects = b.effects.filter(function (e) { return e.t < e.dur; });
        b.units.forEach(function (u) {
          var diff = u.hp - dispHp(u);
          if (diff !== 0) {
            var step = Math.max(1, Math.abs(diff) * sdt / 220);
            u.dispHp = dispHp(u) + (diff > 0 ? 1 : -1) * Math.min(Math.abs(diff), step);
          }
        });
        updateCamPan(b, sdt);
      }
      drawTopScreen(b, b.animClock);
      drawBottomScreen(b, b.animClock);
      if (!b.stopped) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ */
  /* Public entry point                                                  */
  /* ------------------------------------------------------------------ */

  function startGridBattle(config, onEnd) {
    config = config || {};
    if (typeof onEnd === 'function' && config && typeof config.onEnd === 'function') {
      /* onEnd argument wins when both are given. */
    } else if (!onEnd && config && typeof config.onEnd === 'function') {
      onEnd = config.onEnd;
    }
    var b = newBattle(config, onEnd);
    currentBattle = b;
    /* Fast Forward: re-read the saved speed, then force 1x for the
     * first grid battle and for Trial / Elite Four / Champion /
     * Crown Trial battles (see isResetBattle). The remembered speed
     * is never overwritten by the reset; it returns after the battle. */
    rememberedSpeed = readSavedSpeed();
    var isFirstBattle = !config.units && (config.firstGridBattle !== false) && !config.coldOpen;
    b.speedForced = isResetBattle(config) || isFirstBattle;
    b.speedBefore = rememberedSpeed;
    b.speed = b.speedForced ? 1 : rememberedSpeed;
    b.mapImg = loadImage(b.mapImage);
    preloadAssets(config);
    setupScreens(b);
    bindInput(b);
    startLoop(b);

    var promise = new Promise(function (resolve) { b._resolve = resolve; });

    (async function run() {
      try {
        var isColdOpen = !!config.coldOpen;
        var isFirst = isFirstBattle;
        b._deferEnd = isFirst;
        if (isFirst) { await runFirstGridScript(b); }
        else if (isColdOpen) { await runColdOpenGridStaging(b); }
        await runDeployment(b);
        closeMenu(b);
        buildOrder(b);
        b.round = 1;
        nextTurn(b);
        var summary = await promise;
        /* A forced 1x battle ends: the remembered speed returns. */
        if (b.speedForced) { b.speed = b.speedBefore; }
        /* The loop was stopped when the battle ended; keep it
         * stopped, so no frame can repaint after the result. */
        stopGridLoop(b);
        if (isFirst && summary.victory) {
          /* Asking scene plays after the win, before the result lands.
           * The loop was stopped at the win, so restart it here for
           * the scene alone, then stop it again when the scene ends.
           * onEnd fires once, here, after the scene. */
          b.ended = false;
          b.stopped = false;
          startLoop(b);
          bindInput(b);
          await runAskingScene(b);
          summary.joined = b.joined;
          b.ended = true;
          stopGridLoop(b);
          unbindInput(b);
          if (b.onEnd) { b.onEnd(summary); }
        }
        if (currentBattle === b) { currentBattle = null; }
      } catch (err) {
        if (b.speedForced) { b.speed = b.speedBefore; }
        b.ended = true;
        stopGridLoop(b);
        unbindInput(b);
        if (currentBattle === b) { currentBattle = null; }
        if (b.onEnd) { b.onEnd({ victory: false, result: 'error', error: String(err) }); }
      }
    })();

    return {
      battle: b,
      press: function (action) { handlePress(b, action); },
      end: function () { finishBattle(b, checkEnd(b) || 'lost'); },
      state: function () {
        return {
          phase: b.phase, round: b.round,
          active: b.active ? b.active.name : null,
          units: b.units.map(function (u) {
            return { name: u.name, side: u.side, hp: u.hp, maxHp: u.maxHp, mp: u.mp, x: u.x, y: u.y, alive: u.alive };
          })
        };
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /* Exports                                                             */
  /* ------------------------------------------------------------------ */

  FED13.grid.startGridBattle = startGridBattle;
  FED13.grid.press = gridPress;
  FED13.grid.getSpeed = getSpeed;
  FED13.grid.setSpeed = function (n) { return setSpeed(n, currentBattle); };
  FED13.grid.cycleSpeed = function () { return cycleSpeed(currentBattle); };
  FED13.grid.speedButtonRect = SPEED_BUTTON;
  FED13.grid.speedButtonHit = speedButtonHit;
  FED13.grid.isResetBattle = isResetBattle;
  FED13.grid.scaledSleepMs = scaledSleepMs;
  FED13.grid.readSavedSpeed = readSavedSpeed;
  FED13.grid.handlePress = gridPress;
  FED13.grid.isActive = gridIsActive;
  FED13.grid.coldOpenStaging = COLD_OPEN_STAGING;
  FED13.grid.makeColdOpenGridRoster = makeColdOpenGridRoster;
  FED13.grid.BLOODLINES = BLOODLINES;
  FED13.grid.STARTERS = STARTERS;
  FED13.grid.ENEMIES = ENEMIES;
  FED13.grid.makeFirstGridRoster = makeFirstGridRoster;
  FED13.grid.makeTrialBattleRoster = makeTrialBattleRoster;
  FED13.grid.TRIAL_BATTLE_1_MAREN_HP = TRIAL_BATTLE_1_MAREN_HP;
  FED13.grid.makeUnit = makeUnit;
  FED13.grid.facingMult = facingMult;
  FED13.grid.drawFxProcedural = drawFxProcedural;
  FED13.grid.PROCEDURAL_FX = PROCEDURAL_FX;

  /* Node smoke test hook: loadable without a browser. */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FED13.grid;
  }
})();
