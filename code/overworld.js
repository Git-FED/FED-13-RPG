/* FED-13 DS Overworld, Batch 1, code worker C2.
   Plain JavaScript, no frameworks. Uses window.FED13 from engine.js.
   Diamond and Pearl overworld rules from the DS style guide:
   top-down chibi, 32x32 sprite canvas, 14x19 art, 3-frame walk per
   direction, 4x4 sheet layout down/left/right/up, rounded shadow,
   top light, max 15 colors, tall grass with visible Wildlife,
   no random encounters, 5-period day/night tints, X opens menu,
   A talks and examines. All art is made from scratch for FED-13.
   No Drive. No ripped Nintendo sprites. No professor in this game.
   Pause menu (X): Party, Bag, Grimoire, Monster Bank, Save, Settings. Grimoire is
   the in-game wiki and contact book, with entries for the starter
   Wildlife, the arc Bondkin, the guide form picked at creation, and
   contacts. Guide form: Sword gives a fairy, Staff gives a mystical
   orb, Shield gives the Grimoire itself.
   Names: Mankind, Bondkin, Wildlife. King: King Malachar Duskspire.
   Bank: Monster Bank. 5 core Bondkin: Elf, Puffkin, Elderkin,
   Harefolk, Drakescale. Elf is bloodline 001, Totem Spirit Starwarden.
   Asset paths are relative: assets/<filename>.
   ADV-ROAD (worker A8, 2026-11-24): the road down presentation.
   Gate seal cinematic, pilgrim road auto walk with the trainer
   sprite, Saltquay arrival at dawn, first guild board sighting.
   See ROAD_DOWN below. Scratch copy only, build/code untouched.
   If engine.js, battle1v1, or story are not loaded yet, this module
   still runs on its own and queues those calls until they exist.
*/
(function () {
  'use strict';

  var FED13 = window.FED13 || (window.FED13 = {});
  FED13.state = FED13.state || {};
  FED13.state.player = FED13.state.player || {};
  FED13.state.flags = FED13.state.flags || {};

  var TILE = 16;              // logical tile size in screen pixels
  var VIEW_W = 256, VIEW_H = 192; // DS top screen size
  var VIEW_TILES_X = 16, VIEW_TILES_Y = 12;
  var FRAME = 32;             // overworld sprite canvas, 32x32
  var STEP_MS = 170;          // ms per tile step, DS walk pace
  var WALK_FRAMES = [0, 1, 2, 1]; // idle, right step, left step, right step

  // Sheet rows in the 4x4 layout: down, left, right, up.
  var DIR = { down: 0, left: 1, right: 2, up: 3 };
  var DIR_VEC = {
    down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0]
  };
  var DIR_NAMES = ['down', 'left', 'right', 'up'];

  // 5 day/night periods, Serebii tints from style guide section 5.
  // morning: darker than normal but visible. day: brightest.
  // afternoon: orange tint. evening: darker, building lights on.
  // night: dark, building lights off.
  var PERIODS = {
    morning:   { tint: 'rgba(70,90,140,0.18)',  label: 'Morning',   lights: false },
    day:       { tint: 'rgba(255,255,255,0)',   label: 'Day',       lights: false },
    afternoon: { tint: 'rgba(255,140,40,0.16)', label: 'Afternoon', lights: false },
    evening:   { tint: 'rgba(40,40,90,0.30)',   label: 'Evening',   lights: true },
    night:     { tint: 'rgba(10,10,40,0.45)',   label: 'Night',     lights: false }
  };
  var PERIOD_ORDER = ['morning', 'day', 'afternoon', 'evening', 'night'];

  function periodForHour(h) {
    if (h >= 5 && h < 8) return 'morning';
    if (h >= 8 && h < 15) return 'day';
    if (h >= 15 && h < 18) return 'afternoon';
    if (h >= 18 && h < 21) return 'evening';
    return 'night';
  }

  // Sprite sheets, 4x4 layout, 32x32 per frame, 3 walk frames used.
  // BUILD PATCH: the player and rival sheets are resolved at start from
  // the trainer (see resolvePlayerSheets). ow_player.png and
  // ow_rival.png are legacy aliases kept in assets but no longer
  // referenced. ow_bram.png, ow_voss.png, ow_mirelle.png, ow_wren.png
  // and ow_town.png are NPCs. ow_voss.png is the Broker Voss sheet
  // (byte identical art to ow_broker.png, kept as a duplicate alias),
  // ow_townsfolk_a.png (byte identical art to ow_town.png) and
  // ow_townsfolk_b.png are Saltquay townsfolk sheets.
  // ow_slime.png, ow_goblin.png, ow_ghoul.png, ow_whelp.png, ow_puk.png
  // and ow_mandragora.png are wild Wildlife. ow_wisp.png is a friendly
  // encounter, never a battle. ow_maren.png is a story figure only, never
  // a random encounter and never in WILD_DEFS or NPC_DEFS.
  var SHEETS = {
    player: 'assets/ow_player.png',
    rival: 'assets/ow_rival.png',
    bram: 'assets/ow_bram.png',
    broker: 'assets/ow_voss.png',
    voss: 'assets/ow_voss.png',
    townsfolk_a: 'assets/ow_townsfolk_a.png',
    townsfolk_b: 'assets/ow_townsfolk_b.png',
    mirelle: 'assets/ow_mirelle.png',
    wren: 'assets/ow_wren.png',
    town: 'assets/ow_town.png',
    slime: 'assets/ow_slime.png',
    goblin: 'assets/ow_goblin.png',
    whelp: 'assets/ow_whelp.png',
    ghoul: 'assets/ow_ghoul.png',
    puk: 'assets/ow_puk.png',
    mandragora: 'assets/ow_mandragora.png',
    wisp: 'assets/ow_wisp.png',
    maren: 'assets/ow_maren.png'
  };

  // Fallback palette per sheet, used only if the png is not present yet.
  // Top light: lighter shade on top, darker shade below the head.
  var FALLBACK_COLORS = {
    player: { hat: '#c0392b', hatTop: '#e74c3c', skin: '#f1c27d', shirt: '#2e6fb0', pants: '#34495e' },
    rival: { hat: '#8e44ad', hatTop: '#a569bd', skin: '#f1c27d', shirt: '#e67e22', pants: '#6c3483' },
    bram: { hat: '#7f8c8d', hatTop: '#aab7b8', skin: '#e0ac69', shirt: '#5d6d7e', pants: '#2c3e50' },
    broker: { hat: '#b7950b', hatTop: '#d4ac0d', skin: '#f1c27d', shirt: '#117864', pants: '#1a252f' },
    voss: { hat: '#b7950b', hatTop: '#d4ac0d', skin: '#f1c27d', shirt: '#117864', pants: '#1a252f' },
    townsfolk_a: { hat: '#6e2c00', hatTop: '#935116', skin: '#f1c27d', shirt: '#7d6608', pants: '#4d5656' },
    townsfolk_b: { hat: '#1a5276', hatTop: '#2e86c1', skin: '#e0ac69', shirt: '#b9770e', pants: '#2c3e50' },
    mirelle: { hat: '#f5f5f5', hatTop: '#ffffff', skin: '#f1c27d', shirt: '#85c1e9', pants: '#2e4053' },
    wren: { hat: '#f5f5f5', hatTop: '#ffffff', skin: '#e0ac69', shirt: '#aed6f1', pants: '#2e4053' },
    town: { hat: '#6e2c00', hatTop: '#935116', skin: '#f1c27d', shirt: '#7d6608', pants: '#4d5656' },
    slime: { hat: '#1e8449', hatTop: '#58d68d', skin: '#58d68d', shirt: '#1e8449', pants: '#145a32' },
    goblin: { hat: '#1e8449', hatTop: '#52be80', skin: '#7cb342', shirt: '#6e2c00', pants: '#4d5656' },
    whelp: { hat: '#b03a2e', hatTop: '#ec7063', skin: '#f5b041', shirt: '#b03a2e', pants: '#7b241c' },
    ghoul: { hat: '#5d6d7e', hatTop: '#aeb6bf', skin: '#d5dbdb', shirt: '#2c3e50', pants: '#1a252f' },
    puk: { hat: '#5b2c6f', hatTop: '#8e44ad', skin: '#aed6f1', shirt: '#5b2c6f', pants: '#2c3e50' },
    mandragora: { hat: '#1e8449', hatTop: '#58d68d', skin: '#a9dfbf', shirt: '#229954', pants: '#145a32' },
    wisp: { hat: '#f9e79f', hatTop: '#fef9e7', skin: '#fef9e7', shirt: '#f9e79f', pants: '#b7950b' },
    maren: { hat: '#1a5276', hatTop: '#2e86c1', skin: '#e0ac69', shirt: '#1a5276', pants: '#1a252f' }
  };

  /* BUILD PATCH: pick the player sheet from the trainer picked at
   * creation: boy or girl, Solar or Polar. The rival is the opposite
   * side of the pair: a girl player gets the male neighbor sheet, a boy
   * player gets the rival girl sheet. Runs before the first loadImages
   * call, and reloads the two sheets if the trainer changes later. */
  function resolvePlayerSheets() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var t = st.trainer || {};
    var p = st.player || {};
    var sex = (t.sex === 'girl' || t.sex === 'boy') ? t.sex : ((p.gender === 'girl' || p.appearance === 'girl') ? 'girl' : 'boy');
    var race = String(t.race || p.race || 'Solar').toLowerCase();
    if (race !== 'solar' && race !== 'polar') { race = 'solar'; }
    var playerFile = 'assets/ow_trainer_' + sex + '_' + race + '.png';
    var rivalFile = (sex === 'girl') ? 'assets/ow_neighbor_boy.png' : 'assets/ow_rival_girl.png';
    var changed = false;
    if (SHEETS.player !== playerFile) { SHEETS.player = playerFile; changed = true; }
    if (SHEETS.rival !== rivalFile) { SHEETS.rival = rivalFile; changed = true; }
    if (changed && imagesTried) {
      ['player', 'rival'].forEach(function (key) {
        var img = new Image();
        img.src = SHEETS[key];
        img.onload = function () { images[key] = img; };
        img.onerror = function () { images[key] = null; };
      });
    }
    return changed;
  }

  var images = {};
  var imagesTried = false;

  function loadImages() {
    if (imagesTried) return;
    imagesTried = true;
    Object.keys(SHEETS).forEach(function (key) {
      var img = new Image();
      img.src = SHEETS[key];
      img.onload = function () { images[key] = img; };
      img.onerror = function () { images[key] = null; };
    });
    preloadOv3();
  }

  function loadMapImage(name) {
    var img = new Image();
    img.src = 'assets/' + name;
    img.onload = function () { mapImages[name] = img; };
    img.onerror = function () { mapImages[name] = null; };
    return img;
  }
  var mapImages = {};

  // ov3 overworld art (Phase B wiring). One drawn map layer per
  // mapId in render(): gatehollow uses the town art, dreamrest the
  // snow art, road the road art, cragfall the cragfall art, saltquay
  // the harbor art. The grass art is the meadow tile art in
  // drawTile for gatehollow and the road, not a second map layer.
  // All ov3 files are 512x384 RGB except ov3_ow_grass (256x192 RGB),
  // the same 4:3 aspect as the 320x240 map, so the render layer
  // scales them exactly like the legacy map_<id>.png layer. The
  // frame is also RGB with no alpha, so render() draws only its
  // outer edge strips as a border, never the full image, or it
  // would cover the view. Dialog box, arrow, portrait frame and
  // D-pad are RGBA and draw directly. Missing ov3 art falls back
  // to the legacy map art, then to the procedural tiles.
  var OW_MAP_ART = {
    gatehollow: 'ov3_ow_town.png',
    dreamrest: 'ov3_ow_snow.png',
    road: 'ov3_ow_road.png',
    cragfall: 'ov3_ow_cragfall.png',
    saltquay: 'ov3_ow_harbor.png'
  };
  var OW_FILES = [
    'ov3_ow_grass.png', 'ov3_ow_town.png', 'ov3_ow_road.png',
    'ov3_ow_snow.png', 'ov3_ow_harbor.png', 'ov3_ow_cragfall.png',
    'ov3_ow_frame.png', 'ov3_dialog_box.png', 'ov3_dialog_arrow.png',
    'ov4_dpad.png', 'ov3_menu_panel.png',
    'tile_ground.png', 'tile_nature.png', 'tile_buildings.png',
    'tile_snow_harbor.png'
  ];
  // OV6 tilesets: each sheet is 64x64, a 4x4 grid of 16x16 tiles.
  // Cell index is row-major: index = col + row * 4.
  // tile_ground.png: 0 grass plain, 1 grass flower, 2 grass tuft,
  // 3 grass dark, 4 path center, 5 path grass-top edge,
  // 6 path grass-bottom edge, 7 path grass-left edge,
  // 8 path grass-right edge, 9 corner grass top-left,
  // 10 corner top-right, 11 corner bottom-left, 12 corner bottom-right,
  // 13 tall grass, 14 tall grass flower, 15 water.
  // tile_nature.png: 0 water sparkle, 1 shore grass-top,
  // 2 shore grass-bottom, 3 shore grass-left, 4 shore grass-right,
  // 5 shore corner grass top-left, 6 corner top-right,
  // 7 corner bottom-left, 8 corner bottom-right, 9 tree full,
  // 10 tree trunk, 11 bush, 12 fence horizontal, 13 fence vertical,
  // 14 fence post, 15 rock.
  // tile_buildings.png: 0 roof red left, 1 roof red middle,
  // 2 roof red right, 3 roof blue left, 4 roof blue middle,
  // 5 roof blue right, 6 roof gold left, 7 roof gold middle,
  // 8 roof gold right, 9 wall plain, 10 wall window, 11 wall door,
  // 12 timber wall, 13 chimney, 14 steps, 15 signpost.
  // tile_snow_harbor.png: 0 snow grass, 1 snow grass tuft,
  // 2 snow path center, 3 snow path grass-top edge, 4 frozen pond,
  // 5 frozen pond sparkle, 6 snow pine, 7 snow fence horizontal,
  // 8 snow rock, 9 harbor planks, 10 dock edge planks meeting water,
  // 11 sand, 12 sand grass-top edge, 13 gate arch, 14 lamp post,
  // 15 flower grass.
  var TILE_SHEETS = {
    ground: 'tile_ground.png',
    nature: 'tile_nature.png',
    buildings: 'tile_buildings.png',
    snow: 'tile_snow_harbor.png'
  };
  var ov3Images = {};
  function ov3Image(name) {
    if (ov3Images[name]) return ov3Images[name];
    var img = new Image();
    img.src = 'assets/' + name;
    img.onload = function () { ov3Images[name] = img; };
    img.onerror = function () { ov3Images[name] = null; };
    ov3Images[name] = img;
    return img;
  }
  function ov3Ready(img) {
    return !!(img && img.complete && img.naturalWidth > 0);
  }
  function preloadOv3() {
    OW_FILES.forEach(function (name) { ov3Image(name); });
  }

  // Stale bottom canvas fix. The overworld owns only the top
  // canvas, so the bottom canvas keeps whatever the last screen
  // drew there (the VICTORY screen after a grid battle, the title
  // screen after the title). Clear it to black whenever the
  // overworld takes over, in start(). Never cleared per frame:
  // battles use the bottom canvas while they run.
  // OV4 FIX: clearing once in start() was not enough, because a
  // grid loop still running after the battle repaints its VICTORY
  // frame after start() returns. drawBottomView() below redraws
  // the overworld bottom view, and loop() calls it every frame
  // while the overworld runs, so the stale frame cannot persist
  // past one frame. The per-frame redraw is skipped while
  // state.mode is 'battle', so a live battle keeps its own bottom.
  function clearBottomCanvas() {
    try {
      var b = null;
      if (typeof FED13 !== 'undefined' && FED13.canvasBottom) b = FED13.canvasBottom;
      else if (typeof FED13 !== 'undefined' && typeof FED13.getScreen === 'function') b = FED13.getScreen('bottom');
      if (!b && typeof document !== 'undefined') b = document.getElementById('bottomScreen');
      if (!b) return false;
      var bctx = b.getContext('2d');
      if (!bctx) return false;
      var w = b.width || 256, h = b.height || 192;
      bctx.save();
      bctx.clearRect(0, 0, w, h);
      bctx.fillStyle = '#000000';
      bctx.fillRect(0, 0, w, h);
      bctx.restore();
      return true;
    } catch (e) { return false; }
  }

  // Overworld bottom view, the Poketch style panel from the engine
  // fallback overworld: trainer name, level and class, Cr wallet,
  // party count and location. drawBottomView() paints it over
  // whatever the last screen left, so a grid VICTORY frame is gone
  // the moment the overworld takes over, not just on first start.
  function drawBottomView() {
    try {
      var b = null;
      if (typeof FED13 !== 'undefined' && FED13.canvasBottom) b = FED13.canvasBottom;
      else if (typeof FED13 !== 'undefined' && typeof FED13.getScreen === 'function') b = FED13.getScreen('bottom');
      if (!b && typeof document !== 'undefined') b = document.getElementById('bottomScreen');
      if (!b) return false;
      var bctx = b.getContext('2d');
      if (!bctx) return false;
      var w = b.width || 256, h = b.height || 192;
      var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
      var t = st.trainer || {};
      var party = st.party || [];
      var cap = (st.wallet && typeof st.wallet.cap === 'number') ? st.wallet.cap : 999999;
      bctx.save();
      bctx.clearRect(0, 0, w, h);
      bctx.fillStyle = '#0a0a1e';
      bctx.fillRect(0, 0, w, h);
      bctx.fillStyle = '#c8e8c8';
      bctx.fillRect(6, 8, w - 12, 52);
      bctx.strokeStyle = '#101030';
      bctx.lineWidth = 2;
      bctx.strokeRect(7, 9, w - 14, 50);
      bctx.fillStyle = '#101030';
      bctx.font = '11px monospace';
      bctx.textBaseline = 'top';
      bctx.fillText(playerName(), 12, 14);
      bctx.fillText('Lv ' + (t.level || 1) + '  ' + (t.klass || ''), 12, 30);
      bctx.fillText('Cr ' + formatCr(walletCr()) + ' / ' + formatCr(cap), 12, 44);
      bctx.fillStyle = '#c8c8e8';
      bctx.font = '10px monospace';
      bctx.fillText('D-pad: move  A: talk  X: menu', 10, 72);
      bctx.fillText('Party: ' + party.length + '  Location: ' + MAPS[state.mapId].name, 10, 88);
      bctx.fillStyle = '#8888aa';
      bctx.fillText('Monster Bank: your stored Wildlife.', 10, 104);
      bctx.restore();
      return true;
    } catch (e) { return false; }
  }

  // Speaker portraits for the overworld dialogue box. Dialogue
  // lines carry the speaker as a "Name: text" prefix; the portrait
  // file is the existing p_<id>.png for that speaker. Speakers
  // with no portrait file get no portrait and no frame, and the
  // text keeps its full width. No dialogue text is changed.
  var SPEAKER_PORTRAITS = {
    'Bram Hollis': 'assets/p_guildmaster_v10.png',
    'Warden Mirelle Voss': 'assets/p_mirelle.png',
    'Mirelle Voss': 'assets/p_mirelle.png',
    'Warden Wren Hallowlight': 'assets/p_wren.png',
    'Wren Hallowlight': 'assets/p_wren.png',
    'Broker Voss': 'assets/p_voss.png',
    'Guildmaster': 'assets/p_guildmaster_v10.png',
    'Guild Clerk Petra': 'assets/p_guild_clerk.png',
    'Maren Saltwright': 'assets/p_maren.png',
    'Wisp': 'assets/p_wisp.png'
  };
  var portraitImages = {};
  function portraitImage(file) {
    if (portraitImages[file]) return portraitImages[file];
    var img = new Image();
    img.src = file;
    img.onload = function () { portraitImages[file] = img; };
    img.onerror = function () { portraitImages[file] = null; };
    portraitImages[file] = img;
    return img;
  }
  function speakerPortraitFile(line) {
    var m = String(line || '').match(/^([^:]{1,30}):\s/);
    if (!m) return null;
    var name = m[1];
    if (name === 'Rival' || name === 'Neighbor') {
      return playerIsGirl() ? 'assets/p_neighbor_boy.png' : 'assets/p_rival_girl.png';
    }
    if (name === 'You') {
      var race = String(((FED13.state && FED13.state.trainer) || {}).race || 'Solar').toLowerCase();
      return 'assets/p_trainer_' + (playerIsGirl() ? 'girl' : 'boy') + (race === 'polar' ? '_polar' : '') + '.png';
    }
    return SPEAKER_PORTRAITS[name] || null;
  }

  // Map legend:
  // # tree or wall (solid)  . path or grass (walkable)
  // , meadow grass (walkable)  g tall grass (walkable, Wildlife live here)
  // ~ water (solid)  H house  G guild hall  B Monster Bank  M market
  // E exit tile (walkable, triggers a map transition)
  // All maps are 20 wide by 15 tall.
  var MAPS = {
    gatehollow: {
      name: 'Gatehollow',
      file: 'map_gatehollow.png',
      desc: 'Home town at the foot of the mountain, in the 14th world.',
      rows: [
        '####################',
        '#,,,,,##,,,,,,##,,,#',
        '#,HHHH,##,,HHHH,,#,#',
        '#,HHHH,##,,HHHH,,#,#',
        '#,....,##,,....,,#,#',
        '#,,....,,,,....,,#,#',
        '#,,.gg.,,,,,.gg..,,#',
        '#,.gg.,,##,,.gg..,,#',
        '#,....,##,,....,,#,#',
        '#,,,,,,,,,,,,,,,,#,#',
        '#,,..,,,,,..,,,,,#,#',
        '#,,..,,,,,..,,,,,#,#',
        '#,,,,,,,,,,,,,,,,#,#',
        '#,,,,,,,,E,,,,,,,,,#',
        '####################'
      ],
      exits: { south: { to: 'road', x: 9, y: 1, dir: 'down' } },
      start: { x: 10, y: 12, dir: 'up' }
    },
    dreamrest: {
      name: 'Dreamrest',
      file: 'map_dreamrest.png',
      desc: 'Snowy mountain temple town, home of the dreamsages, in the 14th world.',
      rows: [
        '####################',
        '#,,,,~~,,,,,,,,~~,,#',
        '#,HHHH,,GGGG,,HHHH,#',
        '#,HHHH,,GGGG,,HHHH,#',
        '#,....,,....,,....,#',
        '#,,,,,,,,,,,,,,,,,,#',
        '#,,.gg.,,,,,,.gg..,#',
        '#,,.gg.,,,,,,.gg..,#',
        '#,,,,,,,,,,,,,,,,,,#',
        '#,,~~,,,,,,,,,,~~,,#',
        '#,,,,,,,,,,,,,,,,,,#',
        '#,,.gg.,,,,,,.gg..,#',
        '#,,,,,,,,,,,,,,,,,,#',
        '#,,,,,,,,E,,,,,,,,,#',
        '####################'
      ],
      exits: { south: { to: 'road', x: 9, y: 1, dir: 'down' } },
      start: { x: 10, y: 12, dir: 'up' }
    },
    road: {
      name: 'Pilgrim Road',
      file: 'map_road.png',
      desc: 'The pilgrim road down from the Gatehollow Gate to Cragfall.',
      rows: [
        '####################',
        '#,,,,,,,,E,,,,,,,,,#',
        '#,,gg,,,.,,,,gg,,,,#',
        '#,,gg,,,.,,,,gg,,,,#',
        '#,,,,,,,,.,,,,,,,,,#',
        '#,,##,,,.,,,,##,,,,#',
        '#,,##,,,.,,,,##,,,,#',
        '#,,gg,,,.,,,,gg,,,,#',
        '#,,gg,,,.,,,,gg,,,,#',
        '#,,,,,,,,.,,,,,,,,,#',
        '#,,##,,,.,,,,##,,,,#',
        '#,,,,,,,,.,,,,,,,,,#',
        '#,,gg,,,.,,,,gg,,,,#',
        '#,,,,,,,,E,,,,,,,,,#',
        '####################'
      ],
      exits: {
        north: { to: 'gatehollow', x: 9, y: 12, dir: 'up', sealed: true },
        south: { to: 'cragfall', x: 9, y: 1, dir: 'down' }
      },
      start: { x: 10, y: 1, dir: 'down' }
    },
    cragfall: {
      name: 'Cragfall',
      file: 'map_cragfall.png',
      desc: 'Rocky road town on the highland road above Saltquay.',
      rows: [
        '####################',
        '#,,,,,,,,E,,,,,,,,,#',
        '#,HHHH,,,,,HHHH,,#,#',
        '#,HHHH,,,,,HHHH,,#,#',
        '#,,....,,,,....,,#,#',
        '#,....,##,,....,,#,#',
        '#,.gg.,,##,,.gg..,,#',
        '#,,.gg.,,,,,.gg..,,#',
        '#,,....,,,,....,,#,#',
        '#,,,,,,MMMM,,,,,,#,#',
        '#,,,,,,MMMM,,,,,,#,#',
        '#,,,,,,,,,,,,,,,,#,#',
        '#,,gg,,,,,,,,gg,,#,#',
        '#,,,,,,,,E,,,,,,,,,#',
        '####################'
      ],
      exits: {
        north: { to: 'road', x: 9, y: 13, dir: 'up' },
        south: { to: 'saltquay', x: 9, y: 1, dir: 'down' }
      },
      start: { x: 10, y: 1, dir: 'down' }
    },
    saltquay: {
      name: 'Saltquay',
      file: 'map_saltquay.png',
      desc: 'Harbor town on the Realm Map. The guild job board is here.',
      rows: [
        '####################',
        '#,,,,,,,,E,,,,,,,,,#',
        '#,GGGG,,,,,BBBB,,#,#',
        '#,GGGG,,,,,BBBB,,#,#',
        '#,,....,,,,....,,#,#',
        '#,....,##,,....,,#,#',
        '#,HHHH,,,,,MMMM,,#,#',
        '#,HHHH,,,,,MMMM,,#,#',
        '#,,....,,,,....,,#,#',
        '#,,,,,,,,,,,,,,,,#,#',
        '#,,gg,,,,,,,,gg,,#,#',
        '#,,gg,,,,,,,,gg,,#,#',
        '#,,,,,,,,,,,,,,,,#,#',
        '#,,,,,,,,~~,,,,,,,,#',
        '####################'
      ],
      exits: { north: { to: 'cragfall', x: 9, y: 13, dir: 'up' } },
      start: { x: 10, y: 1, dir: 'down' }
    }
  };

  // ADV-ROAD: the road down presentation. Mirrors FED13.story.roadDown.
  // Gate seal plays on map_gatehollow.png then map_road.png for a
  // Solar trainer. gateSealDef() swaps in map_dreamrest.png and the
  // Dreamrest Gate for a Polar trainer; startCinematic uses it.
  // The walk runs the trainer sprite down the road center path.
  // The arrival plays on map_saltquay.png then bg_harbor.png, at dawn.
  var ROAD_DOWN = {
    gateSeal: {
      id: 'gate_seal',
      title: 'The Gatehollow Gate Seals',
      beats: [
        { map: 'map_gatehollow.png', caption: 'You step through the Gatehollow Gate, the old land gate between the 14th world and the Realm Map.' },
        { map: 'map_gatehollow.png', caption: 'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.' },
        { map: 'map_road.png', caption: 'The gate seals. It stays sealed until after the Hall of Fame. There is no way back now, only the road down.' },
        { map: 'map_road.png', caption: 'One bag. One permit. One small Wildlife in a sling. The pilgrim road runs south to Cragfall, then to Saltquay.' }
      ]
    },
    roadWalk: {
      id: 'road_walk',
      title: 'The Pilgrim Road Walk',
      mapId: 'road',
      pathX: 9,
      fromY: 1,
      toY: 13,
      waypoints: [
        { x: 9, y: 3, line: 'The pilgrim road runs straight and steep. You walk it on foot, step by step, south toward Cragfall.' },
        { x: 9, y: 6, line: 'Tall grass on both sides. Wild Wildlife walk in the open here. There are no surprise attacks.' },
        { x: 9, y: 9, line: 'Cragfall lies ahead, then Saltquay harbor. The training on this road is what prepares you for Main Mission 1.' },
        { x: 9, y: 12, line: 'Last slope. Salt wind on the air now. The harbor gate at dawn is close.' }
      ]
    },
    saltquayArrival: {
      id: 'saltquay_arrival',
      title: 'Saltquay Arrival',
      period: 'morning',
      beats: [
        { map: 'map_saltquay.png', caption: 'Saltquay harbor gate, at dawn. Mankind level 5.' },
        { map: 'bg_harbor.png', caption: 'Gulls, salt air, and the harbor spread out below the gate. You made it.' },
        { map: 'bg_harbor.png', caption: 'Your arc Bondkin waits in this town. First, the guild hall. The board is already posted.' }
      ]
    },
    guildBoardSighting: {
      id: 'guild_board_sighting',
      board: 'Saltquay guild job board',
      topCard: 'Main Mission 1: Takedown of Maren Saltwright. Reward: 1,000,000 Cr.',
      lines: [
        'The guild hall steps. A posted copy of the job board hangs by the door, where every trainer walking in can read it.',
        'Guild Clerk Petra: That posted copy is real, trainer. Read the top card. It sits there in gold ink.',
        'You: Main Mission 1. Takedown of Maren Saltwright. Reward: 1,000,000 Cr.',
        'Guild Clerk Petra: Same man that beat you in the cold open. The full board is inside when you are ready to take it.',
        'You: I am ready. After the Monster Bank, I am taking that card.'
      ]
    }
  };

  var SOLID = { '#': true, '~': true, 'H': true, 'G': true, 'B': true, 'M': true };

  function tileAt(map, x, y) {
    if (x < 0 || y < 0 || y >= map.rows.length) return '#';
    var row = map.rows[y];
    if (x >= row.length) return '#';
    return row.charAt(x);
  }
  function isWalkable(map, x, y) {
    return !SOLID[tileAt(map, x, y)];
  }

  // Signs. Read with A while facing them.
  var SIGNS = {
    gatehollow: [
      { x: 3, y: 5, text: ['Gatehollow. Home town at the foot of the mountain.', 'The Gatehollow Gate stands at the south road.', 'Once you leave, the gate seals behind you.'] },
      { x: 16, y: 5, text: ['Mountain school. Lessons end at dusk.', 'Graduates take the hunter exam for a permit.'] }
    ],
    road: [
      { x: 3, y: 9, text: ['Pilgrim Road. Gatehollow Gate behind you.', 'Cragfall ahead. Saltquay lies past Cragfall.'] },
      { x: 16, y: 5, text: ['Tall grass ahead. Wild Wildlife walk in the open here.', 'Walk into one to start a 1v1 battle.'] }
    ],
    cragfall: [
      { x: 3, y: 9, text: ['Cragfall. Highland road town.', 'Dawnspire and the Sun Altar stand on the highland road above.'] },
      { x: 16, y: 9, text: ['Market ahead. Traders rest here on the way to Saltquay.'] }
    ],
    saltquay: [
      { x: 3, y: 9, text: ['Saltquay harbor. The guild hall stands to the north.', 'The job board inside holds Main Mission 1.'] },
      { x: 16, y: 9, text: ['Monster Bank. Store and raise your Wildlife here.', 'The bank is never called anything else.'] }
    ],
    dreamrest: [
      { x: 3, y: 5, text: ['Dreamrest. Snowy mountain temple town, home of the dreamsages.', 'The temple stands at the north end of the square.', 'Polar trainers start here, high above the pilgrim road.'] },
      { x: 16, y: 5, text: ['The mountain road south leads to the pilgrim road.', 'Cragfall lies past the road, then Saltquay harbor.'] }
    ]
  };

  // Buildings, faced with A. Houses open as dialogue scenes.
  var BUILDINGS = {
    gatehollow: [
      { x: 3, y: 2, kind: 'house', name: 'Home', scene: 'home' },
      { x: 14, y: 2, kind: 'house', name: 'Schoolhouse', scene: 'school' }
    ],
    road: [],
    cragfall: [
      { x: 3, y: 2, kind: 'house', name: 'Cragfall House', scene: 'cragfallHouse' },
      { x: 14, y: 2, kind: 'house', name: 'Cragfall House', scene: 'cragfallHouse' },
      { x: 8, y: 9, kind: 'market', name: 'Cragfall Market', scene: 'market' }
    ],
    saltquay: [
      { x: 3, y: 1, kind: 'guild', name: 'Guild Hall', scene: 'guild' },
      { x: 14, y: 1, kind: 'bank', name: 'Monster Bank', scene: 'bank' },
      { x: 14, y: 6, kind: 'market', name: 'Saltquay Market', scene: 'market' },
      { x: 3, y: 6, kind: 'house', name: 'Harbor House', scene: 'harborHouse' }
    ],
    dreamrest: [
      { x: 2, y: 2, kind: 'house', name: 'Dreamrest House', scene: 'dreamrestHouse' },
      { x: 8, y: 2, kind: 'temple', name: 'Dreamrest Temple', scene: 'temple' },
      { x: 14, y: 2, kind: 'house', name: 'Dreamrest House', scene: 'dreamrestHouse' }
    ]
  };

  function buildingAt(mapId, x, y) {
    var list = BUILDINGS[mapId] || [];
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      // Building tiles are 4 wide, 2 tall from the anchor tile.
      if (x >= b.x && x < b.x + 4 && y >= b.y && y < b.y + 2) return b;
    }
    return null;
  }
  function signAt(mapId, x, y) {
    var list = SIGNS[mapId] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].x === x && list[i].y === y) return list[i];
    }
    return null;
  }

  // NPC definitions. Dialogue lines come from the complete story.
  // NPCs wander a small patch, pause, and face the player when talked to.
  var NPC_DEFS = {
    gatehollow: [
      {
        id: 'rival', sheet: 'rival', name: 'Rival', x: 12, y: 6, dir: 'left',
        roam: { x0: 10, y0: 5, x1: 14, y1: 8 },
        lines: [
          'Rival: I waited a whole year for you to come back down that road.',
          'Rival: You left for the hunter exam and never even said goodbye.',
          'Rival: Fine. Go chase your 1,000,000 Cr quest. Just come back to Gatehollow.'
        ],
        linesMale: [
          'Neighbor: I waited a whole year for you to come back down that road.',
          'Neighbor: You left for the hunter exam and never even said goodbye.',
          'Neighbor: Fine. Go chase your 1,000,000 Cr quest. Just come back to Gatehollow.'
        ]
      },
      {
        id: 'bram', sheet: 'bram', name: 'Bram Hollis', x: 6, y: 9, dir: 'down',
        roam: { x0: 4, y0: 8, x1: 8, y1: 11 },
        lines: [
          'Bram Hollis: The Gatehollow Gate is the old land gate between our world and the Realm Map.',
          'Bram Hollis: It seals behind you once you leave. That is the old law, not my rule.',
          'Bram Hollis: Your father left through that gate for work long ago. He never came home.'
        ]
      },
      {
        id: 'town1', sheet: 'town', name: 'Gatehollow Townsfolk', x: 15, y: 11, dir: 'up',
        roam: { x0: 13, y0: 10, x1: 17, y1: 12 },
        lines: [
          'Townsfolk: The 14th world was a paradise once. Shiny and clean, not a flaw anywhere.',
          'Townsfolk: A kind Wisp saved a student on the mountain road. It dropped a bag of 3 eggs.',
          'Townsfolk: Whelp, Puk, and Mandragora. Pick one, and raise it well.'
        ]
      }
    ],
    road: [
      {
        id: 'mirelle', sheet: 'mirelle', name: 'Warden Mirelle Voss', x: 6, y: 4, dir: 'right',
        roam: { x0: 4, y0: 3, x1: 8, y1: 6 },
        lines: [
          'Warden Mirelle Voss: I am a Warden of the Lumen Wardens. We work from the shadow.',
          'Mirelle Voss: My Echo Wisp found the sealed Hollow pen under Emberdeep. The war is stoked, not natural.',
          'Mirelle Voss: Keep the Saltquay Proof safe. It will matter when you face Maren Saltwright.'
        ]
      },
      {
        id: 'town2', sheet: 'town', name: 'Pilgrim', x: 14, y: 9, dir: 'left',
        roam: { x0: 12, y0: 8, x1: 16, y1: 10 },
        lines: [
          'Pilgrim: I walk this road every season. The tall grass hides Slime, Goblin, Ghoul, Puk, and Mandragora.',
          'Pilgrim: They walk in the open now. No surprises. Walk into one if you want a battle.',
          'Pilgrim: A kind Wisp drifts on this road too. It will not battle. Let it glow and move on.',
          'Pilgrim: Your hatched Wildlife travels in its sling. Too young to fight, but it is learning.'
        ]
      }
    ],
    cragfall: [
      {
        id: 'wren', sheet: 'wren', name: 'Warden Wren Hallowlight', x: 12, y: 5, dir: 'left',
        roam: { x0: 10, y0: 4, x1: 14, y1: 7 },
        lines: [
          'Warden Wren Hallowlight: I am a Warden of the Lumen Wardens. My Echo Ghost Vigil walks with me.',
          'Wren Hallowlight: The meltwater is tainted, and the Thirteen brand hides under the soot at the burned storehouse.',
          'Wren Hallowlight: Polar and Solar fear each other, but the fear was planted. Remember that on the road.'
        ]
      },
      {
        id: 'bram2', sheet: 'bram', name: 'Bram Hollis', x: 5, y: 10, dir: 'up',
        roam: { x0: 3, y0: 9, x1: 7, y1: 11 },
        lines: [
          'Bram Hollis: Cragfall is the last dry roof before Saltquay harbor.',
          'Bram Hollis: Dawnspire stands above us. The Elf Totem Spirit Starwarden wakes there, in time.',
          'Bram Hollis: Elf is bloodline 001. Starwarden guards the Elf bloodline.'
        ]
      }
    ],
    saltquay: [
      // ADVANCE PATCH (G8): Broker Voss works the Saltquay main branch
      // himself (new-game.md: licensed buyer at the Monster Bank, pays in
      // Crests, never buys Common Wildlife or Bondkin, 3 sales a day, a
      // sold Wildlife is gone forever). He stands at the bank, so his
      // roam is a single tile: he never wanders off. He stands on (13,4)
      // in front of the bank south face, facing down toward the square,
      // and leaves the bank door tiles (15,1) and (15,2) open. His old
      // guild board lines are dropped: the guild scene, the Saltquay
      // arrival dialogue and the Grimoire already carry Main Mission 1.
      {
        id: 'broker', sheet: 'voss', name: 'Broker Voss', x: 13, y: 4, dir: 'down',
        roam: { x0: 13, y0: 4, x1: 13, y1: 4 },
        lines: [
          'Broker Voss: Welcome to the Monster Bank. This is my branch, the Saltquay main branch, and I work this desk myself.',
          'Broker Voss: Store your Wildlife here, train them here, pick your team of six here. Daycare and bank in one building.',
          'Broker Voss: I buy Wildlife too, never Common ones and never Bondkin. Three sales a day, and a sold Wildlife is gone forever.'
        ]
      },
      // ADVANCE PATCH (G8): Saltquay townsfolk on the ow_townsfolk_a and
      // ow_townsfolk_b sheets. One wanders the town square, one wanders
      // the market front. Both roam patches are walkable open tiles only.
      {
        id: 'townSquare', sheet: 'townsfolk_a', name: 'Saltquay Townsfolk', x: 10, y: 9, dir: 'down',
        roam: { x0: 9, y0: 8, x1: 11, y1: 10 },
        lines: [
          'Townsfolk: Welcome to Saltquay, harbor town of the Realm Map. Every road on the map ends here.',
          'Townsfolk: The guild hall stands to the north, and the Monster Bank stands beside it.',
          'Townsfolk: Your arc Bondkin waits somewhere in this town. Bondkin ask to join, so listen well.'
        ]
      },
      {
        id: 'townMarket', sheet: 'townsfolk_b', name: 'Saltquay Townsfolk', x: 13, y: 8, dir: 'down',
        roam: { x0: 12, y0: 8, x1: 14, y1: 9 },
        lines: [
          'Townsfolk: The Saltquay market sells food, rope, lanterns, and Snare Orbs for the road.',
          'Townsfolk: Fisherfolk mend nets by the harbor house while traders hawk the morning catch.',
          'Townsfolk: Buy Orbs before you leave town. Wild Wildlife will not wait for you to come back.'
        ]
      },
      {
        id: 'mirelle2', sheet: 'mirelle', name: 'Warden Mirelle Voss', x: 6, y: 8, dir: 'right',
        roam: { x0: 4, y0: 7, x1: 8, y1: 9 },
        lines: [
          'Warden Mirelle Voss: You made it to Saltquay at dawn, Mankind level 5. The prologue ends here.',
          'Mirelle Voss: Your arc Bondkin waits in this town. Elf, Puffkin, Elderkin, Harefolk, or Drakescale.',
          'Mirelle Voss: Bondkin ask to join. You never hunt them. When one asks, say yes.'
        ]
      },
      {
        id: 'town3', sheet: 'town', name: 'Saltquay Townsfolk', x: 16, y: 11, dir: 'up',
        roam: { x0: 14, y0: 10, x1: 18, y1: 12 },
        lines: [
          'Townsfolk: The harbor hall is where Trial Battle 1 will be fought.',
          'Townsfolk: Maren Saltwright holds Pisces of the 12 zodiacs. He serves King Malachar Duskspire.',
          'Townsfolk: The king sits above The Thirteen as the 14th. He is the one the angel could not free.'
        ]
      }
    ],
    dreamrest: [
      {
        id: 'wrenDream', sheet: 'wren', name: 'Warden Wren Hallowlight', x: 12, y: 5, dir: 'left',
        roam: { x0: 10, y0: 4, x1: 14, y1: 7 },
        lines: [
          'Warden Wren Hallowlight: I am a Warden of the Lumen Wardens. My Echo Ghost Vigil walks with me.',
          'Wren Hallowlight: Dreamrest is the Polar home town, high in the cold. The dreamsages read the mountain dreams here.',
          'Wren Hallowlight: Polar and Solar fear each other, but the fear was planted. Remember that on the road.'
        ]
      },
      {
        id: 'townDream1', sheet: 'townsfolk_a', name: 'Dreamrest Townsfolk', x: 6, y: 9, dir: 'down',
        roam: { x0: 4, y0: 8, x1: 8, y1: 10 },
        lines: [
          'Townsfolk: Welcome to Dreamrest, temple town of the cold highlands. The dreamsages keep the temple lit all winter.',
          'Townsfolk: The temple dreams tell which roads are safe. Listen before you walk south.',
          'Townsfolk: Your hatched Wildlife travels in its sling. Too young to fight, but it is learning.'
        ]
      },
      {
        id: 'townDream2', sheet: 'townsfolk_b', name: 'Dreamsage', x: 16, y: 10, dir: 'up',
        roam: { x0: 14, y0: 9, x1: 18, y1: 12 },
        lines: [
          'Dreamsage: I read dreams in the temple. Last night the mountain dreamed of a sealed gate and a long road down.',
          'Dreamsage: The pilgrim road runs south to Cragfall, then to Saltquay harbor. Walk it on foot, step by step.',
          'Dreamsage: Tall grass hides Slime, Whelp, and Goblin here. They walk in the open. No surprises.'
        ]
      }
    ]
  };

  // Wild Wildlife that walk visibly in tall grass. No random encounters.
  // ADV-WILD PATCH: kind marks the encounter type. 'enemy' is a common
  // field enemy (Ghoul, Goblin, Slime), 'rare' is a rare visible
  // Wildlife (Puk, Mandragora), 'wild' is a common battlable Wildlife
  // (Whelp), 'friendly' is a friendly encounter (Wisp) that never
  // battles and can never be caught. Maren never appears here.
  // Ghoul and Goblin hold the road and the wild areas. Puk and
  // Mandragora are rare, one or two spawns each. Wisp is one rare
  // friendly spawn on the road, the same road where the kind Wisp saved
  // a student and dropped the bag of 3 eggs.
  var WILD_DEFS = {
    gatehollow: [
      { id: 'w1', species: 'Slime', sheet: 'slime', kind: 'enemy', level: 2, x: 4, y: 6 },
      { id: 'w2', species: 'Whelp', sheet: 'whelp', kind: 'wild', level: 3, x: 14, y: 6 }
    ],
    road: [
      { id: 'w3', species: 'Slime', sheet: 'slime', kind: 'enemy', level: 3, x: 3, y: 2 },
      { id: 'w4', species: 'Goblin', sheet: 'goblin', kind: 'enemy', level: 4, x: 13, y: 3 },
      { id: 'w5', species: 'Whelp', sheet: 'whelp', kind: 'wild', level: 5, x: 3, y: 8 },
      { id: 'w6', species: 'Goblin', sheet: 'goblin', kind: 'enemy', level: 4, x: 13, y: 8 },
      { id: 'w12', species: 'Ghoul', sheet: 'ghoul', kind: 'enemy', level: 5, x: 13, y: 2 },
      { id: 'w13', species: 'Puk', sheet: 'puk', kind: 'rare', level: 6, x: 3, y: 12 },
      { id: 'w14', species: 'Mandragora', sheet: 'mandragora', kind: 'rare', level: 6, x: 3, y: 7 },
      { id: 'w15', species: 'Wisp', sheet: 'wisp', kind: 'friendly', level: 5, x: 16, y: 12 }
    ],
    cragfall: [
      { id: 'w7', species: 'Goblin', sheet: 'goblin', kind: 'enemy', level: 5, x: 4, y: 6 },
      { id: 'w8', species: 'Whelp', sheet: 'whelp', kind: 'wild', level: 6, x: 14, y: 6 },
      { id: 'w16', species: 'Ghoul', sheet: 'ghoul', kind: 'enemy', level: 6, x: 13, y: 7 },
      { id: 'w17', species: 'Mandragora', sheet: 'mandragora', kind: 'rare', level: 6, x: 3, y: 12 }
    ],
    saltquay: [
      { id: 'w9', species: 'Slime', sheet: 'slime', kind: 'enemy', level: 4, x: 3, y: 10 },
      { id: 'w10', species: 'Goblin', sheet: 'goblin', kind: 'enemy', level: 5, x: 14, y: 10 },
      { id: 'w11', species: 'Whelp', sheet: 'whelp', kind: 'wild', level: 6, x: 14, y: 11 },
      { id: 'w18', species: 'Ghoul', sheet: 'ghoul', kind: 'enemy', level: 6, x: 3, y: 11 },
      { id: 'w19', species: 'Puk', sheet: 'puk', kind: 'rare', level: 7, x: 13, y: 10 }
    ],
    dreamrest: [
      { id: 'w20', species: 'Slime', sheet: 'slime', kind: 'enemy', level: 2, x: 4, y: 6 },
      { id: 'w21', species: 'Whelp', sheet: 'whelp', kind: 'wild', level: 3, x: 14, y: 6 },
      { id: 'w22', species: 'Goblin', sheet: 'goblin', kind: 'enemy', level: 3, x: 5, y: 11 }
    ]
  };

  // Species the 1v1 battle module can fight. battle1v1.js SPECIES has
  // Whelp, Puk, Mandragora, Ghoul, Slime and Goblin, and a b_<species>
  // front sprite for each. Wisp and Maren are NOT in that list on
  // purpose: Wisp is friendly, Maren is a story boss. startWildBattle
  // refuses anything outside this list instead of letting the module
  // silently fall back to a default Ghoul battle.
  var BATTLEABLE_SPECIES = {
    Slime: true, Whelp: true, Goblin: true,
    Ghoul: true, Puk: true, Mandragora: true
  };

  // Building interior scenes. Houses open as dialogue scenes, not new maps.
  var SCENES = {
    home: [
      'Home. Your father left this world for work long ago, and never came home.',
      'Your mother is gone, lost to a wild Wildlife before tame Wildlife were common.',
      'Your bag waits by the door. The road to Saltquay starts outside.'
    ],
    school: [
      'Mountain school. Your egg hatched here, in the grad school arc.',
      'You dropped out, failed the first hunter test, then passed the hunter exam for a permit.',
      'Register with a bazaar or guild, and you are a Wildlife trainer. That is the ladder.'
    ],
    cragfallHouse: [
      'Cragfall House. A trader offers you warm tea and a dry seat by the fire.',
      'Trader: Rest while you can. Saltquay harbor is one road south.',
      'Trader: The 5 core Bondkin are Elf, Puffkin, Elderkin, Harefolk, and Drakescale.'
    ],
    harborHouse: [
      'Harbor House. Fishing nets dry by the window. Salt hangs in the air.',
      'Fisher: The harbor hall is where the guild meets. Maren Saltwright will not wait forever.',
      'Fisher: Your hatched Wildlife and your arc Bondkin fight beside you there.'
    ],
    market: [
      'Market. Stalls of food, rope, lanterns, and Snare Orbs.',
      'Trader: A Snare Orb catches a wild Wildlife after you weaken it in battle.',
      'Trader: No Orb, no catch. The battle still trains your team.'
    ],
    bank: [
      'Monster Bank, Saltquay main branch. Broker Voss works the counter here.',
      'Clerk: The roster holds 24 Wildlife, and the deploy team holds 6. Same roster at every branch and post.',
      'Clerk: Broker Voss buys up to 3 Wildlife a day. A sold Wildlife is gone forever. No buyback.'
    ],
    guild: [
      'Guild Hall. The job board covers the whole north wall.',
      'Guildmaster: Main Mission 1 is posted at the top, in gold ink.',
      'Guildmaster: Take down Maren Saltwright. Reward: 1,000,000 Cr. Trial Battle 1.'
    ],
    temple: [
      'Dreamrest Temple. The dreamsages keep the lamps lit all winter.',
      'Dreamsage: The mountain dreams tell which roads are safe. Tonight it dreams of a sealed gate and a long road down.',
      'Dreamsage: Take the pilgrim road south. Cragfall, then Saltquay harbor. Your arc Bondkin waits in Saltquay.'
    ],
    dreamrestHouse: [
      'Dreamrest House. Thick walls, a small stove, snow piled against the door.',
      'Townsfolk: Polar winters are long, but the temple lamps never go out.',
      'Townsfolk: Pack warm. The pilgrim road south is a long walk to Saltquay.'
    ]
  };

  // Guide forms and guide Grimoires (new-game.md lines 1701 and 1894).
  // Sword gives a fairy, Staff gives a mystical orb, Shield gives the
  // Grimoire itself. Four guide Grimoires: Muse, Grok, the Wisp, the
  // Chronicler. Same answers, only the voice differs. Prefer the engine
  // tables when they are loaded; these are the standalone fallback.
  var GUIDE_FORMS = (typeof FED13 !== 'undefined' && FED13.GUIDE_FORMS) || [
    { name: 'Sword', guide: 'fairy', desc: 'Attack. Your guide is a fairy.' },
    { name: 'Staff', guide: 'mystical orb', desc: 'Magic. Your guide is a mystical orb.' },
    { name: 'Shield', guide: 'Grimoire itself', desc: 'In between. Your guide is the Grimoire itself.' }
  ];
  var GUIDE_GRIMOIRES = (typeof FED13 !== 'undefined' && FED13.GUIDE_GRIMOIRES) || [
    { name: 'Muse', voice: 'Calm, plain, direct.' },
    { name: 'Grok', voice: 'Blunt, quick, dry.' },
    { name: 'Wisp', voice: 'Warm, soft, a guiding light.' },
    { name: 'Chronicler', voice: 'Formal, careful, keeper of records.' }
  ];
  var ARC_BONDKIN_NAMES = (typeof FED13 !== 'undefined' && FED13.ARC_BONDKIN_NAMES) || {
    elf: 'Aelindra', puffkin: 'Pip', elderkin: 'Halden',
    harefolk: 'Marnie', drakescale: 'Cinder'
  };
  var BLOODLINE_META = {
    elf: { num: '001', name: 'Elf', totem: 'Starwarden', trait: 'Balanced, all special jobs.' },
    puffkin: { num: '002', name: 'Puffkin', totem: 'Brightpom Sovereign', trait: 'Magic, fairy.' },
    elderkin: { num: '003', name: 'Elderkin', totem: 'Quiet Flame Sage', trait: 'Magic, strong.' },
    harefolk: { num: '004', name: 'Harefolk', totem: 'Moonhare Matriarch', trait: 'Fighting, fast.' },
    drakescale: { num: '005', name: 'Drakescale', totem: 'Emberwyrm King', trait: 'Dragon, tough.' }
  };
  var STARTER_DEFS = {
    whelp: { name: 'Whelp', codex: '002', type: 'Fire', note: 'A small ember cub. Quick to spark, quick to learn.' },
    puk: { name: 'Puk', codex: '104', type: 'Flying and Dragon', note: 'A bright winged whelp. Fast in the air, proud on the ground.' },
    mandragora: { name: 'Mandragora', codex: '029', type: 'Grass', note: 'A root singer. Slow to move, steady to grow.' }
  };

  // Grimoire entries: starter Wildlife, arc Bondkin, guide, contacts.
  // Reads the engine state when it exists, falls back to safe defaults.
  function buildGrimoireEntries() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var t = st.trainer || {};
    var party = st.party || [];
    var entries = [];
    var w = null, b = null;
    party.forEach(function (p) {
      if (p && p.kind === 'Wildlife' && !w) w = p;
      if (p && p.kind === 'Bondkin' && !b) b = p;
    });
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
        'Wildlife are caught with a Snare Orb. Bondkin are never caught.'
      ]
    });
    var bloodId = String(t.bloodline || (st.player && st.player.bloodline) || 'Elf').toLowerCase();
    var blood = BLOODLINE_META[bloodId] || BLOODLINE_META.elf;
    var arcName = ARC_BONDKIN_NAMES[bloodId] || blood.totem;
    entries.push({
      id: 'bondkin',
      title: 'Arc Bondkin: ' + arcName,
      sub: 'Bloodline #' + blood.num + ' ' + blood.name + '  Totem Spirit ' + blood.totem,
      lines: [
        arcName + ', arc Bondkin of the ' + blood.name + ' bloodline, #' + blood.num + '.',
        'Totem Spirit: ' + blood.totem + '. ' + blood.trait,
        b ? 'Status: Joined your party. Fights beside your Wildlife.' : 'Status: Not yet joined. Meet in Saltquay.',
        'Bondkin ask to join. Trainers never hunt them.',
        'First grid battle: the arc Bondkin lends a hand beside the hatched Wildlife.'
      ]
    });
    var form = null, guide = null;
    var formName = t.guideForm || (st.player && st.player.guideForm) || '';
    var guideName = t.guideGrimoire || (st.player && st.player.guideGrimoire) || '';
    GUIDE_FORMS.forEach(function (g) { if (g.name === formName) form = g; });
    GUIDE_GRIMOIRES.forEach(function (g) { if (g.name === guideName) guide = g; });
    entries.push({
      id: 'guide',
      title: 'Guide: ' + (form ? form.name + ' ' + form.guide : 'No guide picked yet'),
      sub: 'Grimoire: ' + (guide ? guide.name : 'Not picked yet'),
      lines: [
        form ? 'Guide form: ' + form.name + '. Your guide is a ' + form.guide + '.' : 'Guide form: not picked yet. Sword gives a fairy, Staff gives a mystical orb, Shield gives the Grimoire itself.',
        guide ? 'Guide Grimoire: ' + guide.name + '. Voice: ' + guide.voice : 'Guide Grimoire: not picked yet. Muse, Grok, the Wisp, or the Chronicler.',
        'The Grimoire is the in-game wiki and contact book.',
        'It does two jobs only: the wiki and the contacts.',
        'All four Grimoires give the same answers. Only the voice differs.',
        'Switch Grimoires at any Puffkin shop for 500 Crests. Contacts and notes carry over.'
      ]
    });
    var contacts = [];
    if (st.contacts && st.contacts.length) {
      st.contacts.forEach(function (c) { contacts.push(typeof c === 'string' ? c : (c.name || String(c))); });
    }
    if (b) { contacts.push(arcName + ' (' + blood.name + ' Bondkin, joined)'); }
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

  // X menu entries, Diamond and Pearl order.
  var MENU_ITEMS = ['Party', 'Bag', 'Grimoire', 'Monster Bank', 'Save', 'Settings'];

  // Story trigger helper. Safe when FED13.story is not loaded yet.
  /* FIX BATCH B3/B4: the old helper called FED13.story.trigger and
   * returned only true/false, so the returned next was never read
   * and the chain died after one scene. It now resolves the trigger
   * to its scene id without playing lines, applies the trigger data
   * (bloodline lowercased, so routeTo builds a lowercase scene id),
   * and hands the scene to the engine story screen, which is the one
   * chain runner: it plays the lines, follows next, handles choice,
   * battle, cinematic and walk, and returns to the overworld when
   * the chain ends. Returns 'engine' on handoff so callers know to
   * skip their own cinematic or dialogue for the same beat, true on
   * the legacy path, false when nothing could run. */
  function storyTrigger(name, data) {
    try {
      if (FED13.story && typeof FED13.story.triggerSceneId === 'function') {
        if (name === 'grimoireOpened') { return true; }
        var sceneId = FED13.story.triggerSceneId(name);
        if (!sceneId) { return false; }
        if (data && data.bloodline) {
          FED13.state.starterBloodline = String(data.bloodline).toLowerCase();
        }
        if (data && data.level) {
          FED13.state.flags = FED13.state.flags || {};
          FED13.state.flags.prologueLevel = data.level;
        }
        if (typeof FED13.setScreen === 'function') {
          FED13.setScreen('storyScene', { sceneId: sceneId });
          return 'engine';
        }
      }
      if (FED13.story && typeof FED13.story.trigger === 'function') {
        FED13.story.trigger(name, data || {});
        return true;
      }
      if (typeof FED13.storyTrigger === 'function') {
        FED13.storyTrigger(name, data || {});
        return true;
      }
    } catch (e) { /* story module not ready, keep playing */ }
    FED13.state.flags['storyQueued_' + name] = true;
    return false;
  }

  function flushQueuedStoryTriggers() {
    if (!FED13.story || typeof FED13.story.trigger !== 'function') return;
    Object.keys(FED13.state.flags).forEach(function (k) {
      if (k.indexOf('storyQueued_') === 0) {
        FED13.story.trigger(k.slice('storyQueued_'.length), {});
        delete FED13.state.flags[k];
      }
    });
  }

  // ADV-WILD PATCH: friendly and story figures never reach the battle
  // module. Wisp goes to the friendly encounter, Maren or any species
  // outside BATTLEABLE_SPECIES gets a dialogue line instead of a
  // silent default battle. The battle config itself is unchanged from
  // the build contract: module shape, onEnd as second argument, bag
  // with Snare Orb x5 for the catch flow.
  function startFriendlyEncounter(wild) {
    var met = !!FED13.state.flags.metWisp;
    FED13.state.flags.metWisp = true;
    if (met) {
      openDialogue([
        'The Wisp glows warmly and drifts on.',
        'It remembers you. It will not battle.'
      ]);
    } else {
      openDialogue([
        'A wild Wisp drifts close, warm light and no fear.',
        'The kind Wisp saved a student on the mountain road once, and dropped a bag of 3 eggs.',
        'It glows, and your team feels rested. It will not battle, and no Snare Orb can catch it.'
      ]);
    }
  }

  function startWildBattle(wild) {
    if (!wild) return false;
    if (wild.kind === 'friendly' || wild.species === 'Wisp') {
      startFriendlyEncounter(wild);
      return true;
    }
    if (wild.species === 'Maren' || !BATTLEABLE_SPECIES[wild.species]) {
      openDialogue([
        'This meeting is a story moment, not a wild battle.',
        'There is nothing to catch here.'
      ]);
      return false;
    }
    var starter = starterWildlifeName();
    var bloodId = String(starterBloodline() || 'Elf').toLowerCase();
    var arcName = null;
    try { if (FED13.story && FED13.story.namesDraft && FED13.story.namesDraft.arcBondkin) { arcName = FED13.story.namesDraft.arcBondkin[bloodId]; } } catch (e) {}
    var config = {
      environment: 'grass',
      isWild: true,
      player: {
        name: playerName(),
        gender: playerIsGirl() ? 'girl' : 'boy',
        wildlife: { species: starter, level: 5 },
        bondkin: [{ name: arcName || 'Starwarden', bloodline: starterBloodline(), level: 5 }],
        bag: { snareOrb: 5, lurefruit: 2, tonic: 3 }
      },
      foe: { species: wild.species, level: wild.level, isWild: true }
    };
    try {
      if (FED13.battle1v1 && typeof FED13.battle1v1.startBattle === 'function') {
        FED13.battle1v1.startBattle(config, function (result) { onWildBattleEnd(wild, result); });
        state.mode = 'battle';
        return true;
      }
    } catch (e) { /* fall through to the fallback line */ }
    openDialogue([
      'A wild ' + wild.species + ' stands ready, level ' + wild.level + '.',
      'The 1v1 battle module is not loaded yet, so this battle waits.',
      'Walk up again once the battle module is ready.'
    ]);
    return false;
  }

  function onWildBattleEnd(wild, result) {
    state.mode = 'field';
    var outcome = result && result.outcome;
    var caught = outcome === 'caught' || !!(result && result.caught);
    var won = caught || outcome === 'win' || !!(result && result.won);
    if (result && (caught || won)) {
      removeWild(wild.id);
      scheduleWildRespawn(wild);
      if (caught) {
        var banked = null;
        try {
          if (FED13.monsterBank && typeof FED13.monsterBank.addCaught === 'function') {
            banked = FED13.monsterBank.addCaught(wild.species, wild.level);
          }
        } catch (e) { banked = null; }
        if (banked && banked.ok) {
          openDialogue(['You caught the wild ' + wild.species + ' with a Snare Orb.', 'It goes to the Monster Bank roster. Roster: ' + banked.rosterCount + ' / 24.']);
        } else if (banked && !banked.ok) {
          openDialogue(['You caught the wild ' + wild.species + ' with a Snare Orb.', banked.message || 'The Monster Bank roster is full at 24 Wildlife.']);
        } else {
          openDialogue(['You caught the wild ' + wild.species + ' with a Snare Orb.', 'It joins your team at the Monster Bank.']);
        }
      } else {
        openDialogue(['The wild ' + wild.species + ' was beaten. Your team grows stronger.']);
      }
    }
  }

  function removeWild(id) {
    state.wild = state.wild.filter(function (w) { return w.id !== id; });
  }

  function scheduleWildRespawn(wild) {
    setTimeout(function () {
      if (state.mapId && WILD_DEFS[state.mapId]) {
        var def = null;
        WILD_DEFS[state.mapId].forEach(function (d) { if (d.id === wild.id) def = d; });
        if (def && !state.wild.some(function (w) { return w.id === def.id; })) {
          // Never respawn on top of the player. Wait and try again.
          if (def.x === state.player.x && def.y === state.player.y) {
            scheduleWildRespawn(wild);
            return;
          }
          state.wild.push(makeWild(def));
        }
      }
    }, 60000);
  }

  function makeWild(def) {
    return {
      id: def.id, species: def.species, sheet: def.sheet, kind: def.kind || 'wild', level: def.level,
      x: def.x, y: def.y, px: def.x * TILE, py: def.y * TILE,
      dir: 'down', frame: 0, moving: false, moveT: 0, wanderT: 1200 + Math.random() * 2000,
      bob: 0, homeX: def.x, homeY: def.y
    };
  }

  function makeNpc(def) {
    return {
      id: def.id, sheet: def.sheet, name: def.name,
      x: def.x, y: def.y, px: def.x * TILE, py: def.y * TILE,
      dir: def.dir || 'down', frame: 0, moving: false, moveT: 0,
      wanderT: 1500 + Math.random() * 2500, roam: def.roam || null,
      lines: def.lines, linesMale: def.linesMale || null, def: def
    };
  }

  // Runtime state.
  var state = {
    canvas: null, ctx: null, running: false, raf: 0, lastT: 0,
    mapId: 'gatehollow', mode: 'field', // field, dialogue, menu, submenu, battle
    player: {
      x: 10, y: 12, px: 160, py: 192, dir: 'down', frame: 0,
      moving: false, moveT: 0, fromX: 10, fromY: 12, toX: 10, toY: 12,
      stepPhase: 0
    },
    npcs: [], wild: [],
    held: {}, // held direction keys
    pressDir: null, // single-step direction queued by overworld.press, one tile per press
    moveCooldown: 0,
    dialogue: null, // { lines, index, shown }
    menuIndex: 0, submenu: null, // { title, lines }
    grimoireIndex: 0, grimoireDetail: -1, grimoirePage: 0, // Grimoire screen cursor, -1 is the list
    menuNavLatch: false, // D-pad edge latch so held Up/Down steps once
    period: 'day', periodAuto: true,
    gateSealed: false,
    everStarted: false, // set on the first start() in this page session
    gateSealPending: false, // ROUND 2 BUG A: deferred gate seal, fired on the first loop tick, never inside start()
    visitedSaltquay: false,
    cinematic: null, // { kind, step, beats } while a seal or arrival cinematic plays
    roadWalk: null, // { waypointIndex, moveT, paused } while the pilgrim road auto walk runs
    roadWalkPending: false,
    roadWalkDone: false,
    saltquayArrived: false,
    boardSighted: false,
    dpadEl: null,
    keyHandler: null, keyUpHandler: null
  };

  function playerName() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    return (st.player && st.player.name) || (st.trainer && st.trainer.name) || 'Trainer';
  }
  function playerIsGirl() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var p = st.player || {};
    var t = st.trainer || {};
    return p.gender === 'girl' || p.appearance === 'girl' || t.sex === 'girl';
  }
  function starterBloodline() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var p = st.player || {};
    var t = st.trainer || {};
    return p.starterBloodline || p.bloodline || t.bloodline || 'Elf';
  }
  function starterWildlifeName() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var p = st.player || {};
    return p.starterWildlife || p.starter || 'Whelp';
  }
  // Home town map for a fresh entry. Polar starts in Dreamrest, Solar
  // starts in Gatehollow. Reads the same trainer race fields as
  // resolvePlayerSheets. A saved game always wins over this: start()
  // only uses homeMapId when there is no save to load.
  function homeMapId() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var t = st.trainer || {};
    var p = st.player || {};
    var race = String(t.race || p.race || 'Solar').toLowerCase();
    return race === 'polar' ? 'dreamrest' : 'gatehollow';
  }
  function isHomeTown(mapId) {
    return mapId === 'gatehollow' || mapId === 'dreamrest';
  }

  // Race-aware gate seal. Polar trainers start in Dreamrest, Solar
  // trainers start in Gatehollow, so the sealed gate, its art, and
  // its dialogue follow the trainer race, never a hardcoded town.
  // Reads the same trainer race fields as homeMapId and
  // resolvePlayerSheets. ROAD_DOWN.gateSeal below stays the Solar
  // default data; gateSealDef is the accessor startCinematic uses.
  function playerIsPolar() {
    var st = (typeof FED13 !== 'undefined' && FED13.state) || {};
    var t = st.trainer || {};
    var p = st.player || {};
    var race = String(t.race || p.race || 'Solar').toLowerCase();
    return race === 'polar';
  }
  function gateSealInfo() {
    if (playerIsPolar()) {
      return { gateName: 'Dreamrest Gate', homeMap: 'map_dreamrest.png', title: 'The Dreamrest Gate Seals' };
    }
    return { gateName: 'Gatehollow Gate', homeMap: 'map_gatehollow.png', title: 'The Gatehollow Gate Seals' };
  }
  function gateSealDef() {
    var info = gateSealInfo();
    var base = ROAD_DOWN.gateSeal;
    return {
      id: base.id,
      title: info.title,
      beats: [
        { map: info.homeMap, caption: 'You step through the ' + info.gateName + ', the old land gate between the 14th world and the Realm Map.' },
        { map: info.homeMap, caption: 'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.' },
        { map: 'map_road.png', caption: 'The gate seals. It stays sealed until after the Hall of Fame. There is no way back now, only the road down.' },
        { map: 'map_road.png', caption: 'One bag. One permit. One small Wildlife in a sling. The pilgrim road runs south to Cragfall, then to Saltquay.' }
      ]
    };
  }

  // Wallet Cr readout for the pause menu. Same wallet state the Bag
  // screen reads (FED13.state.wallet.cr), grouped with commas so
  // 1000000 reads as 1,000,000, the same grouping the story uses
  // for the 1,000,000 Cr bounty.
  function walletCr() {
    var wallet = (FED13.state && FED13.state.wallet) || {};
    return (typeof wallet.cr === 'number') ? wallet.cr : 0;
  }
  function formatCr(n) {
    var v = Number(n) || 0;
    try { return v.toLocaleString('en-US'); } catch (e) { return String(v); }
  }

  // Dialogue. A advances, B or X closes at the end.
  function openDialogue(lines) {
    state.dialogue = { lines: expandDialogueLines(lines), index: 0, shown: 0 };
    state.mode = 'dialogue';
  }
  /* TEXTBOX-FIT v10: a line that still wraps past 4 lines at 8px is
   * split into 4-line pages here, so no tail is ever silently dropped
   * by the draw cap (the old code showed the first 4 wrapped lines
   * and threw the rest away: the tail of all three Broker Voss lines,
   * "myself." / "building." / "gone forever.", never displayed).
   * The width is the narrow portrait width whenever the line has a
   * speaker portrait file, so the pages hold even once the portrait
   * loads; drawTextBox re-fits every frame, so a page never draws
   * past 4 lines whatever size it picks. */
  function expandDialogueLines(lines) {
    var out = [];
    (lines || []).forEach(function (line) {
      var textW = speakerPortraitFile(line) ? (VIEW_W - 8 - 64) : (VIEW_W - 8 - 16);
      var fit = fitTextBoxLine(line, textW);
      if (fit.lines.length <= TEXT_BOX_MAX_LINES) { out.push(line); return; }
      for (var p = 0; p < fit.lines.length; p += TEXT_BOX_MAX_LINES) {
        out.push(fit.lines.slice(p, p + TEXT_BOX_MAX_LINES).join(' '));
      }
    });
    return out;
  }
  function advanceDialogue() {
    var d = state.dialogue;
    if (!d) { state.mode = 'field'; return; }
    var line = d.lines[d.index];
    if (d.shown < line.length) { d.shown = line.length; return; }
    d.index++;
    d.shown = 0;
    if (d.index >= d.lines.length) {
      var after = d.afterClose;
      state.dialogue = null;
      state.mode = 'field';
      if (typeof after === 'function') after();
    }
  }

  // ADV-ROAD cinematics. A cinematic freezes the field, shows one
  // full screen map image per beat with a text box caption, and
  // advances on A. No input moves the player during a cinematic.
  function startCinematic(kind) {
    var def = (kind === 'gateSeal') ? gateSealDef() : ROAD_DOWN[kind];
    if (!def || !def.beats) return false;
    def.beats.forEach(function (beat) { if (!mapImages[beat.map]) loadMapImage(beat.map); });
    state.cinematic = { kind: kind, step: 0, beats: def.beats, title: def.title };
    state.mode = 'cinematic';
    return true;
  }
  function advanceCinematic() {
    var c = state.cinematic;
    if (!c) { state.mode = 'field'; return; }
    c.step++;
    if (c.step < c.beats.length) return;
    var kind = c.kind;
    state.cinematic = null;
    state.mode = 'field';
    if (kind === 'gateSeal') {
      // The seal is done. Step onto the pilgrim road and walk it.
      state.roadWalkPending = true;
      loadMap('road', { x: 9, y: 1, dir: 'down' });
    } else if (kind === 'saltquayArrival') {
      // Arrival played in morning light. The day and night clock resumes now.
      state.periodAuto = true;
      updatePeriod();
      state.mode = 'field';
    }
  }
  function drawCinematic(ctx) {
    var c = state.cinematic;
    if (!c) return;
    var beat = c.beats[Math.min(c.step, c.beats.length - 1)];
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    var img = mapImages[beat.map];
    if (img) {
      ctx.drawImage(img, 0, 0, VIEW_W, VIEW_H);
    } else {
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText(c.title, 10, 20);
    }
    // Gate seal: two stone bars close over the gate as the beats pass.
    if (c.kind === 'gateSeal' && c.step >= 1) {
      var close = Math.min(1, c.step / (c.beats.length - 1));
      var barW = Math.round(28 * close);
      ctx.fillStyle = '#5d5d6e';
      ctx.fillRect(0, 0, barW, VIEW_H);
      ctx.fillRect(VIEW_W - barW, 0, barW, VIEW_H);
      ctx.fillStyle = '#3a3a4a';
      ctx.fillRect(barW - 4, 0, 4, VIEW_H);
      ctx.fillRect(VIEW_W - barW, 0, 4, VIEW_H);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '10px monospace';
    ctx.fillText(c.title, 6, 12);
    drawTextBox(ctx, [beat.caption], 0, beat.caption.length);
    ctx.restore();
  }

  // ADV-ROAD pilgrim road walk. The trainer sprite walks the road
  // center path south on its own, tile by tile, 3 frame walk, DS
  // style. It pauses at each waypoint for one caption line, then
  // walks on. Manual movement is locked until the walk finishes.
  function startRoadWalk() {
    if (state.mapId !== 'road') return false;
    state.player.x = ROAD_DOWN.roadWalk.pathX;
    state.player.y = ROAD_DOWN.roadWalk.fromY;
    state.player.px = state.player.x * TILE;
    state.player.py = state.player.y * TILE;
    state.player.fromX = state.player.x;
    state.player.fromY = state.player.y;
    state.player.toX = state.player.x;
    state.player.toY = state.player.y;
    state.player.dir = 'down';
    state.player.moving = false;
    state.roadWalk = { waypointIndex: 0, moveT: 0, paused: false };
    state.roadWalkPending = false;
    state.mode = 'roadwalk';
    return true;
  }
  function updateRoadWalk(dt) {
    var w = state.roadWalk;
    if (!w) { state.mode = 'field'; return; }
    var p = state.player;
    if (p.moving) {
      p.moveT += dt;
      var t = Math.min(1, p.moveT / STEP_MS);
      p.px = (p.fromX + (p.toX - p.fromX) * t) * TILE;
      p.py = (p.fromY + (p.toY - p.fromY) * t) * TILE;
      // V9-WALK: the auto walk uses the same leg cycle as a manual
      // walk, so the sprite walks instead of gliding on the idle pose.
      p.frame = walkCycleFrame(p.moveT);
      if (t >= 1) {
        p.moving = false;
        p.px = p.toX * TILE;
        p.py = p.toY * TILE;
        p.frame = 0;
        var wp = ROAD_DOWN.roadWalk.waypoints[w.waypointIndex];
        if (wp && p.y === wp.y && p.x === wp.x) {
          w.waypointIndex++;
          w.paused = true;
          openDialogue([wp.line]);
          state.dialogue.afterClose = function () {
            if (state.roadWalk) state.roadWalk.paused = false;
            state.mode = 'roadwalk';
          };
          return;
        }
        if (p.y >= ROAD_DOWN.roadWalk.toY) {
          finishRoadWalk();
          return;
        }
      }
      return;
    }
    if (w.paused) return;
    w.moveT += dt;
    if (w.moveT < STEP_MS) return;
    w.moveT = 0;
    tryStep('down');
  }
  // V9-ROADWALK: A skips the auto walk. The player is put at the
  // walk's own end tile, then finishRoadWalk runs, so a skip lands
  // in exactly the end state a full walk reaches: road (9,13),
  // field mode, roadWalkDone true, then the normal story handoff.
  // Any open waypoint dialogue is closed without its afterClose,
  // so nothing later flips the mode back to roadwalk.
  function skipRoadWalk() {
    if (!state.roadWalk) return false;
    state.dialogue = null;
    var p = state.player;
    p.x = ROAD_DOWN.roadWalk.pathX;
    p.y = ROAD_DOWN.roadWalk.toY;
    p.fromX = p.x; p.fromY = p.y; p.toX = p.x; p.toY = p.y;
    p.px = p.x * TILE; p.py = p.y * TILE;
    p.moving = false; p.moveT = 0; p.frame = 0; p.dir = 'down';
    finishRoadWalk();
    return true;
  }
  function finishRoadWalk() {
    state.roadWalk = null;
    state.roadWalkDone = true;
    FED13.state.flags.roadWalkDone = true;
    state.mode = 'field';
    var roadHandedOff = storyTrigger('roadWalk', {});
    if (roadHandedOff !== 'engine') {
      openDialogue(['Cragfall lies ahead, then Saltquay harbor. The road walk is done. The training on this road is what prepares you for Main Mission 1.']);
    }
  }

  // X menu.
  function openMenu() {
    if (state.mode !== 'field') return;
    state.mode = 'menu';
    state.menuIndex = 0;
    state.submenu = null;
  }
  function closeMenu() {
    state.mode = 'field';
    state.submenu = null;
  }
  // Grimoire screen: list on the left, detail on open. A opens, B goes
  // back to the list, X or B again closes to the field.
  function grimoireMove(d) {
    var entries = buildGrimoireEntries();
    if (state.grimoireDetail >= 0) return;
    state.grimoireIndex = (state.grimoireIndex + d + entries.length) % entries.length;
  }
  function grimoireConfirm() {
    // TEXTBOX-FIT v10: A on a multi-page detail turns the page; A on
    // the last page goes back to the list, as before.
    if (state.grimoireDetail >= 0) {
      var entries = buildGrimoireEntries();
      var pages = grimoireDetailPages(entries[state.grimoireDetail]);
      if ((state.grimoirePage || 0) < pages.length - 1) {
        state.grimoirePage = (state.grimoirePage || 0) + 1;
        return;
      }
      state.grimoireDetail = -1;
      state.grimoirePage = 0;
      return;
    }
    state.grimoireDetail = state.grimoireIndex;
    state.grimoirePage = 0;
  }
  function grimoireBack() {
    if (state.grimoireDetail >= 0) {
      state.grimoireDetail = -1;
      state.grimoirePage = 0;
      return;
    }
    state.mode = 'field';
  }

  function menuSelect() {
    var item = MENU_ITEMS[state.menuIndex];
    var lines = [];
    if (item === 'Grimoire') {
      state.mode = 'grimoire';
      state.grimoireIndex = 0;
      state.grimoireDetail = -1;
      state.grimoirePage = 0;
      storyTrigger('grimoireOpened', { map: state.mapId });
      return;
    } else if (item === 'Party') {
      /* LIVE PARTY fix: route to the engine party screen, the same
       * pattern the engine menu uses for its Monster Bank item.
       * Back from the party screen returns to the overworld, and the
       * engine clears the stale menu mode to field on the way back.
       * The dialogue roster below is only a fallback if the engine
       * screen is not loaded. */
      if (typeof FED13.setScreen === 'function') {
        FED13.setScreen('party', { returnTo: 'overworld' });
        return;
      }
      var party = (FED13.state && FED13.state.party) || [];
      lines = ['Party. Bondkin and Wildlife at your side.'];
      if (!party.length) { lines.push('No partners yet.'); }
      party.forEach(function (p) {
        lines.push((p.kind || 'Wildlife') + ': ' + p.name + '  Lv ' + (p.level || 1) + '  HP ' + (p.hp || 1) + '/' + (p.maxHp || 1) + '.');
      });
      lines.push('Bondkin ask to join. You never hunt them.');
      lines.push('Hatched Wildlife: ' + starterWildlifeName() + ', your first partner.');
    } else if (item === 'Bag') {
      var bag = (FED13.state && FED13.state.bag) || {};
      var wallet = (FED13.state && FED13.state.wallet) || {};
      lines = ['Bag.'];
      if (typeof bag.snareOrbs === 'number' || typeof bag.potions === 'number') {
        lines.push('Snare Orbs: ' + (bag.snareOrbs || 0) + '. Potions: ' + (bag.potions || 0) + '.');
      } else {
        var oldBag = (FED13.state.player && FED13.state.player.bag) || ['Snare Orb x3', 'Potion x2', 'Lantern'];
        oldBag.forEach(function (b) { lines.push('- ' + b); });
      }
      lines.push('Cr: ' + (wallet.cr || 0) + ' / ' + (wallet.cap || 999999) + '.');
      lines.push('Snare Orbs catch wild Wildlife after battle.');
    } else if (item === 'Save') {
      saveGame();
      lines = [
        'Saving. Do not turn off the power.',
        'Saved in ' + MAPS[state.mapId].name + ' at ' + PERIODS[state.period].label + '.',
        'Your journey is safe.'
      ];
    } else if (item === 'Settings') {
      var opts = (typeof FED13 !== 'undefined' && FED13.options) || {};
      lines = [
        'Settings.',
        'Text speed: ' + (opts.textSpeed || 'normal') + '. Sound: ' + (opts.sound === false ? 'OFF' : 'ON') + '.',
        'Day and night: ' + (state.periodAuto ? 'auto' : 'manual') + '.',
        'Change text speed and sound from the pause menu Settings screen.',
        'Press X to close. Arrow keys or WASD move. A talks. X opens this menu.'
      ];
    } else if (item === 'Monster Bank') {
      /* MENU-BANK fix: the bank screen existed but had no menu entry.
       * Same unlock rule as the engine pause menu: the
       * monsterBankUnlocked flag, set by the monster_bank_stop story
       * scene. Locked line is A9 verbatim. Unlocked opens the engine
       * bank screen through FED13.setScreen, the same screen the
       * engine menu opens, returning to the overworld. */
      var unlocked = !!(FED13.state && FED13.state.flags && FED13.state.flags.monsterBankUnlocked);
      if (!unlocked) {
        openDialogue(['The Monster Bank unlocks on the road to Saltquay. Broker Voss waits at the Saltquay branch.']);
        state.dialogue.afterClose = function () {
          state.mode = 'menu';
          state.menuIndex = MENU_ITEMS.indexOf('Monster Bank');
        };
        return;
      }
      if (typeof FED13.setScreen === 'function') {
        FED13.setScreen('monsterBank', { returnTo: 'overworld' });
        return;
      }
      /* Engine screen not loaded: show the roster through the bank
       * API, the same FED13.monsterBank path used for addCaught. */
      var bankLines = ['Monster Bank.'];
      try {
        if (FED13.monsterBank && typeof FED13.monsterBank.ensure === 'function') {
          var bank = FED13.monsterBank.ensure();
          bankLines.push('Roster ' + bank.roster.length + ' / 24. Deploy ' + bank.deployedIds.length + ' / 6.');
          bankLines.push('The bank screen is not loaded yet. Visit a branch in town to open it.');
        } else {
          bankLines.push('The bank screen is not loaded yet.');
        }
      } catch (e) {
        bankLines.push('The bank screen is not loaded yet.');
      }
      state.submenu = { title: item, lines: bankLines };
      state.mode = 'submenu';
      state.dialogue = { lines: bankLines, index: 0, shown: 0 };
      return;
    }
    state.submenu = { title: item, lines: lines };
    state.mode = 'submenu';
    state.dialogue = { lines: lines, index: 0, shown: 0 };
  }

  function saveGame() {
    var data = {
      mapId: state.mapId,
      x: state.player.x, y: state.player.y, dir: state.player.dir,
      period: state.period, gateSealed: state.gateSealed,
      visitedSaltquay: state.visitedSaltquay,
      roadWalkDone: state.roadWalkDone,
      saltquayArrived: state.saltquayArrived,
      boardSighted: state.boardSighted,
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem('FED13_OVERWORLD_SAVE', JSON.stringify(data)); } catch (e) { /* storage unavailable */ }
    try {
      if (FED13.save && typeof FED13.save.write === 'function') FED13.save.write(data);
      else if (typeof FED13.saveGame === 'function') FED13.saveGame(data);
    } catch (e) { /* engine save not ready */ }
    FED13.state.flags.overworldSaved = true;
  }

  function loadSave() {
    try {
      var raw = localStorage.getItem('FED13_OVERWORLD_SAVE');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  // Map loading.
  function loadMap(mapId, spawn) {
    var map = MAPS[mapId];
    if (!map) return false;
    state.mapId = mapId;
    if (!mapImages[map.file]) loadMapImage(map.file);
    if (OW_MAP_ART[mapId]) ov3Image(OW_MAP_ART[mapId]);
    state.npcs = (NPC_DEFS[mapId] || []).map(makeNpc);
    state.wild = (WILD_DEFS[mapId] || []).map(makeWild);
    var s = spawn || map.start;
    state.player.x = s.x; state.player.y = s.y;
    state.player.px = s.x * TILE; state.player.py = s.y * TILE;
    state.player.fromX = s.x; state.player.fromY = s.y;
    state.player.toX = s.x; state.player.toY = s.y;
    state.player.dir = s.dir || 'down';
    state.player.moving = false; state.player.frame = 0;
    state.pressDir = null;
    state.dialogue = null;
    state.mode = 'field';
    updatePeriod();
    if (mapId === 'road' && state.roadWalkPending && !state.roadWalkDone) {
      startRoadWalk();
      return true;
    }
    if (mapId === 'saltquay' && !state.visitedSaltquay && !(FED13.state.flags && FED13.state.flags.saltquayArrived)) {
      state.visitedSaltquay = true;
      state.saltquayArrived = true;
      FED13.state.flags.saltquayArrived = true;
      // The prologue ends at Saltquay at dawn, so the arrival plays in morning light.
      state.period = ROAD_DOWN.saltquayArrival.period;
      state.periodAuto = false;
      /* FIX BATCH B4: fire the arrival only, and let the engine chain
       * carry it onward. The arc opening is already in that chain
       * (monster bank stop leads to the arc meeting router), so a
       * second immediate trigger overwrote the arrival in the shared
       * text box. The bloodline reaches the router lowercased through
       * storyTrigger. Only the legacy path, where no engine handoff
       * happened, still fires the arc opening and cinematic here. */
      var arrivalHandedOff = storyTrigger('saltquayArrival', { level: 5 });
      if (arrivalHandedOff !== 'engine') {
        storyTrigger('arcOpening', { bloodline: starterBloodline() });
        startCinematic('saltquayArrival');
      }
    }
    return true;
  }

  function updatePeriod() {
    if (!state.periodAuto) return;
    var h = new Date().getHours();
    state.period = periodForHour(h);
  }

  function tryExit(dir) {
    var map = MAPS[state.mapId];
    var p = state.player;
    var exit = null;
    var side = null;
    if (p.y <= 1 && tileAt(map, p.x, p.y) === 'E') { exit = map.exits.north; side = 'north'; }
    if (p.y >= 13 && tileAt(map, p.x, p.y) === 'E') { exit = map.exits.south; side = 'south'; }
    if (!exit) return false;
    // Only a step in the exit direction tries to pass the gate. A
    // step sideways onto an exit tile, or standing on the spawn tile
    // the road loads at (9, 1), is not an attempt to pass, so it
    // must not fire the sealed-gate dialogue. The spawn tile itself
    // never calls tryExit; the blocked-attempt path in updatePlayer
    // covers pressing toward the gate while standing on it.
    var stepDir = dir || p.dir;
    if ((side === 'north' && stepDir !== 'up') || (side === 'south' && stepDir !== 'down')) return false;
    if (exit.sealed && state.gateSealed) {
      var seal = gateSealInfo();
      openDialogue([
        'The ' + seal.gateName + ' is sealed.',
        'It sealed behind you once you left. The 14th world stays locked until after the Hall of Fame.'
      ]);
      // Step the player back off the gate tile.
      p.y = side === 'north' ? p.y + 1 : p.y - 1;
      p.py = p.y * TILE; p.toY = p.y; p.fromY = p.y;
      return true;
    }
    if (isHomeTown(state.mapId) && side === 'south') {
      /* ROUND 2 BUG A, exactly once: the seal chain already ran if
       * the gate is sealed (engine flag set by the story hook, or the
       * local flag set here on the first passage). Walking south again
       * must not replay the chain, it just walks through to the road.
       * The pending deferred seal is cleared too, so it cannot fire
       * a second time after this exit. */
      if (state.gateSealed || (FED13.state.flags && FED13.state.flags.gateSealed)) {
        state.gateSealPending = false;
        loadMap(exit.to, exit);
        return true;
      }
      state.gateSealPending = false;
      state.gateSealed = true;
      FED13.state.flags.gateSealed = true;
      FED13.state.flags.gateSealSeen = true;
      var sealHandedOff = storyTrigger('gateSeals', {});
      // ADV-ROAD: the seal plays as a cinematic on map_gatehollow.png
      // then map_road.png. When it finishes it loads the road and
      // starts the pilgrim road walk. No plain dialogue here.
      /* FIX BATCH B3: when the trigger handed off to the engine story
       * screen, that chain owns the gate seal scene, so do not also
       * start the standalone cinematic on a stopped overworld. */
      if (sealHandedOff !== 'engine') { startCinematic('gateSeal'); }
      return true;
    }
    loadMap(exit.to, exit);
    return true;
  }

  // Interaction: A talks, examines, enters buildings, starts wild battles.
  function interact() {
    if (state.mode !== 'field') return;
    var p = state.player;
    var v = DIR_VEC[p.dir];
    var fx = p.x + v[0], fy = p.y + v[1];
    var map = MAPS[state.mapId];

    // NPC in front.
    for (var i = 0; i < state.npcs.length; i++) {
      var n = state.npcs[i];
      if (n.x === fx && n.y === fy) {
        facePlayer(n);
        var lines = (n.id === 'rival' && !playerIsGirl() && n.linesMale) ? n.linesMale : n.lines;
        if (n.id === 'rival' && playerIsGirl() && n.linesMale) lines = n.linesMale;
        openDialogue(lines);
        return;
      }
    }
    // Wild Wildlife in front or on the same tile. A friendly Wisp
    // never battles, it opens the friendly encounter instead.
    for (var j = 0; j < state.wild.length; j++) {
      var w = state.wild[j];
      if ((w.x === fx && w.y === fy) || (w.x === p.x && w.y === p.y)) {
        if (w.kind === 'friendly' || w.species === 'Wisp') {
          startFriendlyEncounter(w);
          return;
        }
        openDialogue(['A wild ' + w.species + ', level ' + w.level + ', watches you.', 'Press A again to start a 1v1 battle.']);
        state.dialogue.afterClose = (function (wild) {
          return function () { startWildBattle(wild); };
        })(w);
        return;
      }
    }
    // Sign in front.
    var sign = signAt(state.mapId, fx, fy);
    if (sign) { openDialogue(sign.text); return; }
    // Building in front.
    var b = buildingAt(state.mapId, fx, fy);
    if (b) {
      // ADV-ROAD: first time facing the Saltquay guild hall, the player
      // sees the posted board copy first, then the full hall scene.
      if (b.scene === 'guild' && state.mapId === 'saltquay' && !state.boardSighted) {
        state.boardSighted = true;
        FED13.state.flags.guildBoardSeen = true;
        var boardHandedOff = storyTrigger('guildBoardSighting', {});
        if (boardHandedOff !== 'engine') {
          openDialogue(ROAD_DOWN.guildBoardSighting.lines.slice());
        }
        return;
      }
      var scene = SCENES[b.scene] || ['This building is closed for now.'];
      var buildingHandedOff = false;
      if (b.scene === 'guild') { buildingHandedOff = storyTrigger('mainMission1', { reward: 1000000 }) === 'engine'; }
      if (b.scene === 'bank') { buildingHandedOff = storyTrigger('monsterBankVisit', {}) === 'engine'; }
      if (!buildingHandedOff) { openDialogue(scene); }
      return;
    }
    // Tall grass in front: rustle, no random encounter.
    if (tileAt(map, fx, fy) === 'g') {
      openDialogue(['Tall grass rustles. Wild Wildlife walk in the open here.', 'Walk into one to battle. There are no surprise attacks.']);
      return;
    }
    // Water, trees, walls: nothing to examine.
    if (tileAt(map, fx, fy) === '~') {
      openDialogue(['Harbor water laps the stone. A Sky Galleon will cross it one day.']);
      return;
    }
  }

  function facePlayer(npc) {
    var p = state.player;
    if (npc.x < p.x) npc.dir = 'right';
    else if (npc.x > p.x) npc.dir = 'left';
    else if (npc.y < p.y) npc.dir = 'down';
    else npc.dir = 'up';
    npc.frame = 0;
  }

  // Input: arrow keys and WASD move, A/Enter/Space confirms, X menu, B cancels.
  var KEY_DIRS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right'
  };

  function onKeyDown(e) {
    var code = e.code || e.key;
    // ADV-ROAD: A advances a cinematic. No movement during a cinematic
    // or during the pilgrim road auto walk.
    if (state.mode === 'cinematic') {
      if (code === 'Enter' || code === 'Space' || code === 'KeyZ') {
        advanceCinematic();
        e.preventDefault();
      }
      return;
    }
    if (state.mode === 'roadwalk') {
      if (KEY_DIRS[code]) { e.preventDefault(); }
      // V9-ROADWALK: A skips the auto walk. Directions stay locked
      // while the walk runs, but the player is never stuck in it.
      else if (code === 'Enter' || code === 'Space' || code === 'KeyZ') {
        skipRoadWalk();
        e.preventDefault();
      }
      return;
    }
    // FIX: arrows and W/S in the menu used to fall into the held-dir
    // branch below and return, so the menu cursor never moved. Handle
    // menu and Grimoire navigation first.
    if (state.mode === 'menu' || state.mode === 'grimoire') {
      if (code === 'ArrowUp' || code === 'KeyW') {
        if (state.mode === 'menu') state.menuIndex = (state.menuIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        else grimoireMove(-1);
        e.preventDefault();
        return;
      }
      if (code === 'ArrowDown' || code === 'KeyS') {
        if (state.mode === 'menu') state.menuIndex = (state.menuIndex + 1) % MENU_ITEMS.length;
        else grimoireMove(1);
        e.preventDefault();
        return;
      }
    }
    var dir = KEY_DIRS[code];
    if (dir) {
      state.held[dir] = true;
      if (state.mode === 'field') e.preventDefault();
      return;
    }
    if (code === 'KeyX' || code === 'Escape') {
      if (state.mode === 'menu') closeMenu();
      else if (state.mode === 'grimoire') grimoireBack();
      else if (state.mode === 'submenu' || state.mode === 'dialogue') { /* X does not skip dialogue */ }
      else if (state.mode === 'field') openMenu();
      e.preventDefault();
      return;
    }
    if (code === 'Enter' || code === 'Space' || code === 'KeyZ') {
      if (state.mode === 'dialogue' || state.mode === 'submenu') advanceDialogue();
      else if (state.mode === 'menu') menuSelect();
      else if (state.mode === 'grimoire') grimoireConfirm();
      else if (state.mode === 'field') interact();
      e.preventDefault();
      return;
    }
    if (code === 'KeyB') {
      if (state.mode === 'menu') closeMenu();
      else if (state.mode === 'grimoire') grimoireBack();
      else if (state.mode === 'dialogue') advanceDialogue();
      return;
    }
    if (code === 'ArrowUp' || code === 'ArrowDown') {
      if (state.mode === 'menu') {
        state.menuIndex = (state.menuIndex + (code === 'ArrowUp' ? MENU_ITEMS.length - 1 : 1)) % MENU_ITEMS.length;
        e.preventDefault();
      }
    }
  }
  function onKeyUp(e) {
    var dir = KEY_DIRS[e.code || e.key];
    if (dir) state.held[dir] = false;
  }

  // On-screen input entry: FED13.overworld.press(action). The engine
  // FED13.press routes here while the overworld is the delegated
  // screen, the same way it forwards to battle1v1.handlePress while
  // a battle is active. The index.html D-pad and A/B/X/START buttons
  // call FED13.press with up, down, left, right, confirm, cancel,
  // menu and start. Each call is one tap, mirroring onKeyDown above:
  // a direction steps exactly one tile in the field (queued as
  // pressDir and consumed by updatePlayer, never held, so a tap can
  // never walk the player across the map), moves the cursor once in
  // the menu or Grimoire, and does nothing during a cinematic or the
  // road walk. Confirm is A, cancel is B, menu is X, start acts as
  // confirm, the same as Space on the keyboard. The keyboard handlers
  // are untouched and keep working alongside this entry.
  function handlePress(action) {
    if (!state.running || state.mode === 'battle') return false;
    var a = String(action || '').toLowerCase();
    if (a === 'a') a = 'confirm';
    else if (a === 'b') a = 'cancel';
    else if (a === 'x') a = 'menu';
    if (a === 'start') a = 'confirm';
    if (state.mode === 'cinematic') {
      if (a === 'confirm') { advanceCinematic(); return true; }
      return false;
    }
    // V9-ROADWALK: A (on-screen button or key) skips the auto walk.
    // Directions stay locked while the walk runs.
    if (state.mode === 'roadwalk') {
      if (a === 'confirm') { skipRoadWalk(); return true; }
      return false;
    }
    if (a === 'up' || a === 'down' || a === 'left' || a === 'right') {
      if (state.mode === 'menu') {
        if (a === 'up') state.menuIndex = (state.menuIndex + MENU_ITEMS.length - 1) % MENU_ITEMS.length;
        else if (a === 'down') state.menuIndex = (state.menuIndex + 1) % MENU_ITEMS.length;
        else return false;
        return true;
      }
      if (state.mode === 'grimoire') {
        if (a === 'up') grimoireMove(-1);
        else if (a === 'down') grimoireMove(1);
        else return false;
        return true;
      }
      if (state.mode === 'field') {
        state.pressDir = a;
        return true;
      }
      return false;
    }
    if (a === 'menu') {
      if (state.mode === 'menu') { closeMenu(); return true; }
      if (state.mode === 'grimoire') { grimoireBack(); return true; }
      if (state.mode === 'dialogue' || state.mode === 'submenu') return false;
      if (state.mode === 'field') { openMenu(); return true; }
      return false;
    }
    if (a === 'confirm') {
      if (state.mode === 'dialogue' || state.mode === 'submenu') { advanceDialogue(); return true; }
      if (state.mode === 'menu') { menuSelect(); return true; }
      if (state.mode === 'grimoire') { grimoireConfirm(); return true; }
      if (state.mode === 'field') { interact(); return true; }
      return false;
    }
    if (a === 'cancel') {
      if (state.mode === 'menu') { closeMenu(); return true; }
      if (state.mode === 'grimoire') { grimoireBack(); return true; }
      if (state.mode === 'dialogue') { advanceDialogue(); return true; }
      return false;
    }
    return false;
  }

  function heldDirection() {
    var order = ['up', 'down', 'left', 'right'];
    for (var i = 0; i < order.length; i++) {
      if (state.held[order[i]]) return order[i];
    }
    return null;
  }

  // V9-WALK: the walk cycle frame for a step in progress. The two
  // step poses alternate every half step, driven by elapsed step
  // time, so the legs keep moving for the whole step and across
  // chained steps. The old code froze one pose per tile and
  // snapped back to the idle frame at every tile edge, and every
  // fourth step showed the idle pose mid-walk.
  function walkCycleFrame(moveT) {
    return (Math.floor(moveT / (STEP_MS / 2)) % 2 === 0) ? 1 : 2;
  }

  // Movement: tile by tile, smooth pixel interpolation, 3-frame walk.
  function tryStep(dir) {
    var p = state.player;
    var map = MAPS[state.mapId];
    p.dir = dir;
    var v = DIR_VEC[dir];
    var nx = p.x + v[0], ny = p.y + v[1];
    if (!isWalkable(map, nx, ny)) { p.frame = 0; return false; }
    // Blocked by an NPC. Wild Wildlife do NOT block movement: walking
    // into one triggers the encounter on arrival (checkWildTouch in
    // updatePlayer). No random encounters, enemies visible only.
    for (var i = 0; i < state.npcs.length; i++) {
      if (state.npcs[i].x === nx && state.npcs[i].y === ny) { p.frame = 0; return false; }
    }
    p.fromX = p.x; p.fromY = p.y; p.toX = nx; p.toY = ny;
    p.x = nx; p.y = ny;
    p.moving = true; p.moveT = 0;
    // V9-WALK: the first step pose at once, so no idle frame ever
    // shows while a step is in progress. updatePlayer and
    // updateRoadWalk keep cycling frames 1 and 2 from here.
    p.frame = 1;
    return true;
  }

  function updatePlayer(dt) {
    var p = state.player;
    if (p.moving) {
      p.moveT += dt;
      var t = Math.min(1, p.moveT / STEP_MS);
      // V9-WALK: gentle ease in and out of each step, so the sprite
      // slows into each tile instead of stopping dead at the edge.
      var te = t * t * (3 - 2 * t);
      p.px = (p.fromX + (p.toX - p.fromX) * te) * TILE;
      p.py = (p.fromY + (p.toY - p.fromY) * te) * TILE;
      // V9-WALK: legs animate for the whole step, not one frozen pose.
      p.frame = walkCycleFrame(p.moveT);
      if (t >= 1) {
        p.moving = false;
        p.px = p.toX * TILE; p.py = p.toY * TILE;
        // V9-WALK: only settle to the idle frame when no movement
        // input is left. A held key chains into the next step, and
        // the legs must not snap to standing between tiles.
        if (!state.pressDir && !heldDirection()) p.frame = 0;
        var exited = tryExit();
        // Touch trigger: only when the step ends on this map in field
        // mode. A map transition or a gate dialogue skips it.
        if (!exited && state.mode === 'field') checkWildTouch();
      }
      return;
    }
    // A queued on-screen press steps exactly once, then clears, so a
    // tap never holds a direction. Keyboard held keys still step
    // through heldDirection when no press is queued.
    // V9-WALK: standing still always shows the idle frame. A step
    // that ends while a key is held keeps its step pose, and if the
    // key is lifted in the gap before the next step starts, nothing
    // would otherwise reset the pose, so the sprite would stand
    // frozen mid-stride. This line closes that gap.
    if (!state.pressDir && !heldDirection()) p.frame = 0;
    var dir = null;
    if (state.pressDir) { dir = state.pressDir; state.pressDir = null; }
    else dir = heldDirection();
    if (dir) {
      // Standing on an exit tile and pressing toward the exit is a
      // real attempt to pass the gate, even though the wall beyond
      // blocks a step: the north exit tile (9, 1) on the road has a
      // wall at (9, 0), so without this the sealed gate could never
      // be tried from the spawn tile itself. tryExit still applies
      // its direction and sealed checks, so sideways presses do not
      // fire it.
      if (tileAt(MAPS[state.mapId], state.player.x, state.player.y) === 'E' &&
          ((state.player.y <= 1 && dir === 'up') || (state.player.y >= 13 && dir === 'down'))) {
        state.player.dir = dir;
        if (tryExit(dir)) return;
      }
      tryStep(dir);
    }
  }

  // ADV-WILD PATCH: touch encounter. Runs once, on arrival on a wild
  // tile. A battlable Wildlife starts the 1v1 card battle at once.
  // A friendly Wisp opens the friendly encounter instead. Standing
  // still on a wild tile never retriggers it.
  function checkWildTouch() {
    if (state.mode !== 'field') return false;
    var p = state.player;
    for (var i = 0; i < state.wild.length; i++) {
      var w = state.wild[i];
      if (w.x === p.x && w.y === p.y) {
        if (w.kind === 'friendly' || w.species === 'Wisp') {
          startFriendlyEncounter(w);
        } else {
          startWildBattle(w);
        }
        return true;
      }
    }
    return false;
  }

  function wanderNpc(n, dt) {
    if (n.moving) {
      n.moveT += dt;
      var t = Math.min(1, n.moveT / STEP_MS);
      n.px = (n.fromX + (n.toX - n.fromX) * t) * TILE;
      n.py = (n.fromY + (n.toY - n.fromY) * t) * TILE;
      if (t >= 1) { n.moving = false; n.px = n.toX * TILE; n.py = n.toY * TILE; n.frame = 0; }
      return;
    }
    n.wanderT -= dt;
    if (n.wanderT > 0) return;
    n.wanderT = 2000 + Math.random() * 3500;
    var dir = DIR_NAMES[Math.floor(Math.random() * 4)];
    var v = DIR_VEC[dir];
    var nx = n.x + v[0], ny = n.y + v[1];
    var map = MAPS[state.mapId];
    if (n.roam && (nx < n.roam.x0 || nx > n.roam.x1 || ny < n.roam.y0 || ny > n.roam.y1)) return;
    if (!isWalkable(map, nx, ny)) return;
    if (nx === state.player.x && ny === state.player.y) return;
    for (var i = 0; i < state.npcs.length; i++) {
      if (state.npcs[i] !== n && state.npcs[i].x === nx && state.npcs[i].y === ny) return;
    }
    n.dir = dir; n.fromX = n.x; n.fromY = n.y; n.toX = nx; n.toY = ny;
    n.x = nx; n.y = ny; n.moving = true; n.moveT = 0;
    n.stepPhase = (n.stepPhase || 0) + 1;
    n.frame = WALK_FRAMES[n.stepPhase % WALK_FRAMES.length];
  }

  function wanderWild(w, dt) {
    // Wild Wildlife drift inside tall grass, slow bob, always visible.
    w.bob += dt;
    if (w.moving) {
      w.moveT += dt;
      var t = Math.min(1, w.moveT / (STEP_MS * 1.6));
      w.px = (w.fromX + (w.toX - w.fromX) * t) * TILE;
      w.py = (w.fromY + (w.toY - w.fromY) * t) * TILE;
      if (t >= 1) { w.moving = false; w.px = w.toX * TILE; w.py = w.toY * TILE; w.frame = 0; }
      return;
    }
    w.wanderT -= dt;
    if (w.wanderT > 0) return;
    w.wanderT = 2500 + Math.random() * 3000;
    var dir = DIR_NAMES[Math.floor(Math.random() * 4)];
    var v = DIR_VEC[dir];
    var nx = w.x + v[0], ny = w.y + v[1];
    var map = MAPS[state.mapId];
    // Wild Wildlife stay near tall grass, within 2 tiles of home.
    if (tileAt(map, nx, ny) !== 'g' && Math.abs(nx - w.homeX) + Math.abs(ny - w.homeY) > 2) return;
    if (!isWalkable(map, nx, ny)) return;
    if (nx === state.player.x && ny === state.player.y) return;
    w.dir = dir; w.fromX = w.x; w.fromY = w.y; w.toX = nx; w.toY = ny;
    w.x = nx; w.y = ny; w.moving = true; w.moveT = 0;
    w.frame = 1;
  }

  function update(dt) {
    if (state.mode === 'cinematic') return;
    if (state.mode === 'roadwalk') { updateRoadWalk(dt); return; }
    if (state.mode === 'menu' || state.mode === 'grimoire') {
      // D-pad buttons only set held dirs, so step the cursor here once
      // per press, the same fix as the keyboard branch above.
      if (state.held.up || state.held.down) {
        if (!state.menuNavLatch) {
          state.menuNavLatch = true;
          if (state.mode === 'menu') state.menuIndex = (state.menuIndex + (state.held.up ? MENU_ITEMS.length - 1 : 1)) % MENU_ITEMS.length;
          else grimoireMove(state.held.up ? -1 : 1);
        }
      } else { state.menuNavLatch = false; }
    }
    if (state.mode === 'field') updatePlayer(dt);
    for (var i = 0; i < state.npcs.length; i++) wanderNpc(state.npcs[i], dt);
    for (var j = 0; j < state.wild.length; j++) wanderWild(state.wild[j], dt);
  }

  // Rendering.
  function camera() {
    var p = state.player;
    var maxX = MAPS[state.mapId].rows[0].length * TILE - VIEW_W;
    var maxY = MAPS[state.mapId].rows.length * TILE - VIEW_H;
    var cx = Math.max(0, Math.min(maxX, Math.round(p.px + TILE / 2 - VIEW_W / 2)));
    var cy = Math.max(0, Math.min(maxY, Math.round(p.py + TILE / 2 - VIEW_H / 2)));
    return { x: cx, y: cy };
  }

  function drawSprite(ctx, sheet, dir, frame, sx, sy, bob) {
    var img = images[sheet];
    var dx = sx - (FRAME - TILE) / 2;
    var dy = sy - (FRAME - TILE) - 2 + (bob || 0);
    drawShadow(ctx, sx + TILE / 2, sy + TILE + 2);
    if (img) {
      var col = frame % 4;
      var row = DIR[dir] || 0;
      ctx.drawImage(img, col * FRAME, row * FRAME, FRAME, FRAME, dx, dy, FRAME, FRAME);
      return;
    }
    drawFallbackSprite(ctx, sheet, dir, frame, dx, dy);
  }

  function drawShadow(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Fallback chibi drawn from scratch, 14x19 art inside a 32x32 canvas.
  // Top light: lighter shade on top of the hat and head.
  function drawFallbackSprite(ctx, sheet, dir, frame, dx, dy) {
    var c = FALLBACK_COLORS[sheet] || FALLBACK_COLORS.town;
    var bob = frame === 0 ? 0 : 1; // 1px body bob on step frames
    var ox = dx + 9, oy = dy + 6 - bob;
    ctx.save();
    // Legs, alternate on step frames.
    ctx.fillStyle = c.pants;
    if (frame === 1) { ctx.fillRect(ox + 2, oy + 15, 3, 4); ctx.fillRect(ox + 9, oy + 14, 3, 5); }
    else if (frame === 2) { ctx.fillRect(ox + 2, oy + 14, 3, 5); ctx.fillRect(ox + 9, oy + 15, 3, 4); }
    else { ctx.fillRect(ox + 2, oy + 15, 3, 4); ctx.fillRect(ox + 9, oy + 15, 3, 4); }
    // Body.
    ctx.fillStyle = c.shirt;
    ctx.fillRect(ox + 1, oy + 8, 12, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(ox + 1, oy + 14, 12, 2);
    // Arms.
    ctx.fillStyle = c.skin;
    ctx.fillRect(ox - 1, oy + 9, 2, 6);
    ctx.fillRect(ox + 13, oy + 9, 2, 6);
    // Head, 13px tall, eyes toward the bottom for the top-down look.
    ctx.fillStyle = c.skin;
    ctx.fillRect(ox + 1, oy, 12, 9);
    if (dir !== 'up') {
      ctx.fillStyle = '#222222';
      ctx.fillRect(ox + 4, oy + 5, 2, 2);
      ctx.fillRect(ox + 8, oy + 5, 2, 2);
    }
    // Hat, lighter on top where the light hits.
    ctx.fillStyle = c.hatTop;
    ctx.fillRect(ox, oy - 3, 14, 4);
    ctx.fillStyle = c.hat;
    ctx.fillRect(ox, oy + 1, 14, 2);
    ctx.restore();
  }

  // OV6 tileset ground rendering. Every map cell resolves to one
  // 16x16 tile sliced from a tileset sheet, never to a flat scene
  // picture and never to a random crop of scene art. Neighbor
  // auto-tiling: path and water cells pick edge and corner tiles by
  // which orthogonal neighbors are grass, with diagonal grass as a
  // fallback for corners. Grass varies deterministically by position
  // so the meadow is not one flat tile.
  function tileHash(x, y) {
    var h = (x * 7 + y * 13 + x * y * 3) % 10;
    return h < 0 ? h + 10 : h;
  }
  function isGrassChar(ch) { return ch === ',' || ch === 'g'; }
  // drawTileBase is now the tileset slicer: one 16x16 cell from a
  // sheet, drawn at TILE size. Returns false when the sheet has not
  // loaded yet, so the caller can fall back to a flat fill.
  function drawTileBase(ctx, sheet, index, sx, sy) {
    var img = ov3Image(sheet);
    if (!ov3Ready(img)) return false;
    var col = index % 4, row = Math.floor(index / 4);
    ctx.drawImage(img, col * 16, row * 16, 16, 16, sx, sy, TILE, TILE);
    return true;
  }
  function pathTileIndex(map, x, y, snow) {
    var gU = isGrassChar(tileAt(map, x, y - 1));
    var gD = isGrassChar(tileAt(map, x, y + 1));
    var gL = isGrassChar(tileAt(map, x - 1, y));
    var gR = isGrassChar(tileAt(map, x + 1, y));
    if (snow) {
      // The snow sheet carries only a center path and a grass-top
      // edge path, so snow paths use those two tiles.
      return gU ? 3 : 2;
    }
    if (gU && gL) return 9;
    if (gU && gR) return 10;
    if (gD && gL) return 11;
    if (gD && gR) return 12;
    if (gU) return 5;
    if (gD) return 6;
    if (gL) return 7;
    if (gR) return 8;
    if (isGrassChar(tileAt(map, x - 1, y - 1))) return 9;
    if (isGrassChar(tileAt(map, x + 1, y - 1))) return 10;
    if (isGrassChar(tileAt(map, x - 1, y + 1))) return 11;
    if (isGrassChar(tileAt(map, x + 1, y + 1))) return 12;
    return 4;
  }
  function waterTile(mapId, map, x, y) {
    var gU = isGrassChar(tileAt(map, x, y - 1));
    var gD = isGrassChar(tileAt(map, x, y + 1));
    var gL = isGrassChar(tileAt(map, x - 1, y));
    var gR = isGrassChar(tileAt(map, x + 1, y));
    if (mapId === 'dreamrest') {
      // Frozen pond: sparkle in the middle, plain pond at the edge.
      if (!gU && !gD && !gL && !gR) {
        return { sheet: TILE_SHEETS.snow, index: tileHash(x, y) === 0 ? 5 : 4 };
      }
      return { sheet: TILE_SHEETS.snow, index: 4 };
    }
    if (mapId === 'saltquay' && gU) {
      // Harbor water under grass: dock edge, planks meeting water.
      return { sheet: TILE_SHEETS.snow, index: 10 };
    }
    if (gU && gL) return { sheet: TILE_SHEETS.nature, index: 5 };
    if (gU && gR) return { sheet: TILE_SHEETS.nature, index: 6 };
    if (gD && gL) return { sheet: TILE_SHEETS.nature, index: 7 };
    if (gD && gR) return { sheet: TILE_SHEETS.nature, index: 8 };
    if (gU) return { sheet: TILE_SHEETS.nature, index: 1 };
    if (gD) return { sheet: TILE_SHEETS.nature, index: 2 };
    if (gL) return { sheet: TILE_SHEETS.nature, index: 3 };
    if (gR) return { sheet: TILE_SHEETS.nature, index: 4 };
    if (isGrassChar(tileAt(map, x - 1, y - 1))) return { sheet: TILE_SHEETS.nature, index: 5 };
    if (isGrassChar(tileAt(map, x + 1, y - 1))) return { sheet: TILE_SHEETS.nature, index: 6 };
    if (isGrassChar(tileAt(map, x - 1, y + 1))) return { sheet: TILE_SHEETS.nature, index: 7 };
    if (isGrassChar(tileAt(map, x + 1, y + 1))) return { sheet: TILE_SHEETS.nature, index: 8 };
    return tileHash(x, y) === 0
      ? { sheet: TILE_SHEETS.nature, index: 0 }
      : { sheet: TILE_SHEETS.ground, index: 15 };
  }
  function buildingTile(map, ch, x, y) {
    // Each block is 4 wide x 2 tall. Find the block origin by
    // scanning left and up while the same char continues.
    var lx = x;
    while (lx > 0 && tileAt(map, lx - 1, y) === ch) lx--;
    var ty = y;
    while (ty > 0 && tileAt(map, x, ty - 1) === ch) ty--;
    var col = x - lx, row = y - ty;
    if (row === 0) {
      var base = ch === 'B' ? 3 : ch === 'M' ? 6 : 0;
      return { sheet: TILE_SHEETS.buildings, index: base + (col === 0 ? 0 : col === 3 ? 2 : 1) };
    }
    if (col === 1) return { sheet: TILE_SHEETS.buildings, index: 11 };
    if (col === 2) return { sheet: TILE_SHEETS.buildings, index: 10 };
    return { sheet: TILE_SHEETS.buildings, index: 9 };
  }
  function resolveTile(mapId, map, x, y) {
    var ch = tileAt(map, x, y);
    var h = tileHash(x, y);
    if (ch === ',') {
      if (mapId === 'dreamrest') {
        if (h === 0) return { sheet: TILE_SHEETS.snow, index: 1 };
        if (h === 1) return { sheet: TILE_SHEETS.snow, index: 15 };
        return { sheet: TILE_SHEETS.snow, index: 0 };
      }
      if (h === 0) return { sheet: TILE_SHEETS.ground, index: 1 };
      if (h === 1) return { sheet: TILE_SHEETS.ground, index: 2 };
      if (h === 2) return { sheet: TILE_SHEETS.ground, index: 3 };
      return { sheet: TILE_SHEETS.ground, index: 0 };
    }
    if (ch === 'g') {
      return { sheet: TILE_SHEETS.ground, index: ((x + y) % 2 === 0) ? 13 : 14 };
    }
    if (ch === '.' || ch === 'E') {
      if (ch === 'E' && mapId === 'dreamrest') {
        return { sheet: TILE_SHEETS.snow, index: 13 };
      }
      var snowPath = mapId === 'dreamrest';
      return {
        sheet: snowPath ? TILE_SHEETS.snow : TILE_SHEETS.ground,
        index: pathTileIndex(map, x, y, snowPath)
      };
    }
    if (ch === '~') return waterTile(mapId, map, x, y);
    if (ch === 'H' || ch === 'G' || ch === 'B' || ch === 'M') {
      return buildingTile(map, ch, x, y);
    }
    if (ch === '#') {
      if (mapId === 'dreamrest') {
        return { sheet: TILE_SHEETS.snow, index: h % 4 === 0 ? 8 : 6 };
      }
      if (mapId === 'cragfall') {
        return { sheet: TILE_SHEETS.nature, index: h % 3 === 0 ? 11 : 15 };
      }
      if (h % 5 === 0) return { sheet: TILE_SHEETS.nature, index: 11 };
      if (h % 5 === 1) return { sheet: TILE_SHEETS.nature, index: 10 };
      return { sheet: TILE_SHEETS.nature, index: 9 };
    }
    return null;
  }
  function drawTile(ctx, ch, sx, sy, mapId, x, y, map) {
    var m = map || MAPS[mapId];
    var tx = (typeof x === 'number') ? x : 0;
    var ty = (typeof y === 'number') ? y : 0;
    var t = resolveTile(mapId, m, tx, ty);
    if (t && drawTileBase(ctx, t.sheet, t.index, sx, sy)) {
      // Exit gate marker on top of the path or gate arch tile.
      if (ch === 'E') {
        ctx.fillStyle = '#7d6608';
        ctx.fillRect(sx, sy + 7, TILE, 2);
      }
      return;
    }
    // Tileset not loaded yet: flat fill plus a simple mark, so the
    // map stays readable instead of black.
    var flat = { '#': '#1e6b34', '~': '#2e86c1', 'g': '#229954', ',': '#58b368', '.': '#d5c69a', 'E': '#d5c69a', 'H': '#f5e6c8', 'G': '#f5e6c8', 'B': '#f5e6c8', 'M': '#f5e6c8' };
    ctx.fillStyle = flat[ch] || '#58b368';
    ctx.fillRect(sx, sy, TILE, TILE);
    if (ch === '#') {
      ctx.fillStyle = '#2e8b47';
      ctx.beginPath(); ctx.arc(sx + 8, sy + 7, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#5d3a1a';
      ctx.fillRect(sx + 7, sy + 11, 2, 5);
    } else if (ch === '~') {
      ctx.fillStyle = '#85c1e9';
      ctx.fillRect(sx + 2, sy + 4, 12, 1);
      ctx.fillRect(sx + 4, sy + 10, 8, 1);
    } else if (ch === 'g') {
      ctx.fillStyle = '#1e8449';
      ctx.fillRect(sx + 2, sy + 3, 2, 10);
      ctx.fillRect(sx + 7, sy + 2, 2, 11);
      ctx.fillRect(sx + 12, sy + 4, 2, 9);
    } else if (ch === 'H' || ch === 'G' || ch === 'B' || ch === 'M') {
      var roof = ch === 'G' ? '#922b21' : ch === 'B' ? '#1a5276' : ch === 'M' ? '#7d6608' : '#922b21';
      ctx.fillStyle = roof;
      ctx.fillRect(sx, sy, TILE, 6);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(sx + 6, sy + 9, 4, 7);
    } else if (ch === 'E') {
      ctx.fillStyle = '#7d6608';
      ctx.fillRect(sx, sy + 7, TILE, 2);
    } else if (ch === ',') {
      ctx.fillStyle = '#229954';
      ctx.fillRect(sx + 3, sy + 5, 2, 2);
      ctx.fillRect(sx + 11, sy + 10, 2, 2);
    }
  }

  /* TEXTBOX-FIT v10: the same defect class as the engine v9 dialogue
   * fit. The old box wrapped at a fixed 10px and capped the draw at
   * 4 lines, so a line wrapping to 5 lost its tail on screen (all
   * three Broker Voss lines), and a 4-line line at 10px put its 4th
   * line at by+42, ink to by+53.6, 1.6px past the 52px box bottom
   * (every Wren line, every 4-line caption). The fit measures with
   * the font that will be drawn, on an offscreen context, so it never
   * depends on whatever font the last draw left behind (the v8
   * lesson), and shrinks 10 to 9 to 8px until the wrap fits 4 lines.
   * The 4-line geometry is 11px steps from by+5, so 4 lines of 10px
   * ink end at by+49.6, inside the box with room to spare. */
  var TEXT_BOX_FONT_SIZES = [10, 9, 8];
  var TEXT_BOX_MAX_LINES = 4;
  var measureCanvas = null;
  function textMeasureCtx() {
    if (!measureCanvas) { measureCanvas = document.createElement('canvas'); }
    return measureCanvas.getContext('2d');
  }
  function wrapLinesFor(ctx, text, maxW) {
    var words = String(text).split(' ');
    var lines = [];
    var cur = '';
    for (var i = 0; i < words.length; i++) {
      var test = cur ? cur + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = words[i];
      } else { cur = test; }
    }
    if (cur) { lines.push(cur); }
    return lines;
  }
  function fitTextBoxLine(text, textW) {
    var mctx = textMeasureCtx();
    var lines = null;
    var px = 8;
    for (var s = 0; s < TEXT_BOX_FONT_SIZES.length; s++) {
      mctx.font = TEXT_BOX_FONT_SIZES[s] + 'px monospace';
      lines = wrapLinesFor(mctx, text, textW);
      px = TEXT_BOX_FONT_SIZES[s];
      if (lines.length <= TEXT_BOX_MAX_LINES) { break; }
    }
    return { fontPx: px, lines: lines };
  }

  function drawTextBox(ctx, lines, index, shown) {
    var boxH = 52;
    var bx = 4, by = VIEW_H - boxH - 4, bw = VIEW_W - 8;
    var line = lines[index] || '';
    // Speaker portrait, resolved from the "Name: text" prefix.
    // No portrait file means no portrait and no frame, text full width.
    var pFile = speakerPortraitFile(line);
    var pImg = pFile ? portraitImage(pFile) : null;
    var hasPortrait = ov3Ready(pImg);
    var textX = hasPortrait ? bx + 56 : bx + 8;
    var textW = hasPortrait ? bw - 64 : bw - 16;
    ctx.save();
    var boxImg = ov3Image('ov3_dialog_box.png');
    if (ov3Ready(boxImg)) {
      ctx.drawImage(boxImg, bx, by, bw, boxH);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, bw, boxH);
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 1, by + 1, bw - 2, boxH - 2);
    }
    if (hasPortrait) {
      // BUBBLE-FIX: square portrait, square gold frame. No circle
      // clip, no ring art. The portrait is square, so it fills the
      // frame exactly, DS style.
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx + 6, by + 6, 40, 40);
      ctx.clip();
      ctx.drawImage(pImg, bx + 6, by + 6, 40, 40);
      ctx.restore();
      ctx.strokeStyle = '#d9a441';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 5, by + 5, 42, 42);
      ctx.strokeStyle = '#20242a';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 7.5, by + 7.5, 37, 37);
    }
    /* TEXTBOX-FIT v10: fit the FULL line, not the typed prefix, so
     * the wrap never shifts as the text types out (greedy wrap is
     * prefix-stable, so the shown prefix wraps the same way). The
     * fitted size is the largest of 10/9/8 whose wrap fits 4 lines;
     * every current line fits, and openDialogue pages any future
     * line that still runs past 4 at 8px. */
    ctx.fillStyle = '#1a1a2e';
    ctx.textBaseline = 'top';
    var fit = fitTextBoxLine(line, textW);
    var text = line.slice(0, shown);
    wrapText(ctx, text, textX, by + 5, textW, 11, fit.fontPx);
    // Continue prompt blinks on the same 400ms beat as the other
    // dialogue screens. ov3_dialog_arrow.png replaces the 'v'/'A'
    // text when it has loaded; the text is the fallback.
    if (shown >= line.length) {
      var blinkOn = Math.floor(Date.now() / 400) % 2 === 0;
      if (blinkOn) {
        var arrowImg = ov3Image('ov3_dialog_arrow.png');
        if (ov3Ready(arrowImg)) {
          ctx.drawImage(arrowImg, bx + bw - 18, by + boxH - 16, 12, 12);
        } else if (index < lines.length - 1) {
          ctx.fillText('v', bx + bw - 14, by + boxH - 16);
        } else {
          ctx.fillText('A', bx + bw - 14, by + boxH - 16);
        }
      }
    }
    ctx.restore();
  }

  /* TEXTBOX-FIT v10: the font is set here, before measuring, so the
   * wrap always measures with the font that is drawn (the v8 lesson:
   * never trust whatever font the last draw left on the context).
   * Returns the number of lines drawn, so callers advance by the
   * true wrapped count instead of a width estimate. The 4-line cap
   * stays as a safety net only; fitTextBoxLine and openDialogue
   * guarantee no fitted text ever reaches it with a tail. */
  function wrapText(ctx, text, x, y, maxW, lh, fontPx) {
    if (fontPx) { ctx.font = fontPx + 'px monospace'; }
    var lines = wrapLinesFor(ctx, text, maxW);
    var drawn = 0;
    for (var i = 0; i < lines.length && drawn < 4; i++) {
      ctx.fillText(lines[i], x, y + drawn * lh);
      drawn++;
    }
    return drawn;
  }

  /* TEXTBOX-FIT v10: Grimoire detail pages. A detail entry holds up
   * to 6 logical lines, each wrapping to as many as 4 visual lines
   * at 11px, but the panel only fits 8 visual lines above the footer
   * (y58 to VIEW_H-28). The old code drew every line and checked the
   * guard after, so the guide entry smeared its 4th line across the
   * footer and its last two lines never drew at all. Pages are cut
   * on visual lines at 11px, 12px a line plus 2px after each logical
   * line, so a page never crosses the footer. */
  function grimoireDetailPages(entry) {
    var mctx = textMeasureCtx();
    mctx.font = '11px monospace';
    var LIMIT = (VIEW_H - 28) - 58;
    var pages = [[]];
    var height = 0;
    (entry.lines || []).forEach(function (ln) {
      var wl = wrapLinesFor(mctx, ln, VIEW_W - 24);
      for (var i = 0; i < wl.length; i++) {
        var h = 12 + ((i === wl.length - 1) ? 2 : 0);
        if (height > 0 && height + h > LIMIT) { pages.push([]); height = 0; }
        pages[pages.length - 1].push({ text: wl[i], h: h });
        height += h;
      }
    });
    return pages;
  }

  function drawGrimoire(ctx) {
    var entries = buildGrimoireEntries();
    var shown = state.grimoireDetail >= 0 ? entries[state.grimoireDetail] : entries[state.grimoireIndex];
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, VIEW_W - 8, VIEW_H - 8);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, VIEW_W - 10, VIEW_H - 10);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '12px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('GRIMOIRE', 12, 10);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#5d6d7e';
    ctx.fillText('Wiki and contact book', 12, 26);
    if (state.grimoireDetail >= 0) {
      ctx.fillStyle = '#1a1a2e';
      ctx.font = '11px monospace';
      ctx.fillText(shown.title, 12, 42);
      var pages = grimoireDetailPages(shown);
      var pageIdx = Math.min(state.grimoirePage || 0, pages.length - 1);
      var y = 58;
      pages[pageIdx].forEach(function (v) {
        ctx.fillText(v.text, 12, y);
        y += v.h;
      });
      ctx.font = '10px monospace';
      ctx.fillStyle = '#5d6d7e';
      if (pages.length > 1 && pageIdx < pages.length - 1) {
        ctx.fillText('A: next page ' + (pageIdx + 1) + '/' + pages.length + '  B: back  X: close', 12, VIEW_H - 16);
      } else if (pages.length > 1) {
        ctx.fillText('A: back to list  B: back  X: close', 12, VIEW_H - 16);
      } else {
        ctx.fillText('A or B: back to the list  X: close', 12, VIEW_H - 16);
      }
    } else {
      for (var i = 0; i < entries.length; i++) {
        var yy = 44 + i * 18;
        if (i === state.grimoireIndex) ctx.fillText('>', 12, yy);
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '11px monospace';
        ctx.fillText(entries[i].title, 24, yy);
      }
      ctx.font = '10px monospace';
      ctx.fillStyle = '#5d6d7e';
      wrapText(ctx, shown.sub, 12, 44 + entries.length * 18 + 4, VIEW_W - 24, 12, 10);
      ctx.fillText('A: open  B or X: close', 12, VIEW_H - 16);
    }
    ctx.restore();
  }

  function drawMenu(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // Menu art, the same ov3_menu_panel.png the engine menu draws
    // behind its list with drawScreenBg: full view, so the list sits
    // inside the art's blue interior. The art is 512x384 and the
    // view is 256x192, the same 4:3 aspect, so nothing stretches.
    // If the art has not loaded yet, a dark blue panel with a gold
    // border stands in so the items stay readable.
    var panelImg = ov3Image('ov3_menu_panel.png');
    if (ov3Ready(panelImg)) {
      ctx.drawImage(panelImg, 0, 0, VIEW_W, VIEW_H);
    } else {
      ctx.fillStyle = '#1a2a6b';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ctx.strokeStyle = '#e8c838';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 34, VIEW_W - 40, 126);
    }
    // List inset inside the panel's blue interior, the same inset
    // the engine menu uses (x24, first item y38): at this scale the
    // art's blue interior runs about x20 to x236 and y34 to y158,
    // so no item straddles the gold border. Six items, order and
    // selection behavior unchanged; the selected item gets the gold
    // highlight bar the engine menu list uses. The pitch is 16, not
    // 18: at 18 the wallet line below the list landed on the
    // panel's bottom gold border and was half clipped.
    ctx.textBaseline = 'top';
    ctx.font = '12px monospace';
    for (var i = 0; i < MENU_ITEMS.length; i++) {
      var y = 38 + i * 16;
      if (i === state.menuIndex) {
        ctx.fillStyle = '#e8c838';
        ctx.fillRect(20, y - 1, VIEW_W - 40, 15);
        ctx.strokeStyle = '#20242a';
        ctx.lineWidth = 1;
        ctx.strokeRect(20.5, y - 0.5, VIEW_W - 41, 14);
        ctx.fillStyle = '#101030';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('> ' + MENU_ITEMS[i], 24, y);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText('  ' + MENU_ITEMS[i], 24, y);
      }
    }
    // Wallet Cr readout at the bottom of the pause menu, below the
    // six menu items, which keep their order. Reads the same wallet
    // state as the Bag screen, so the 1,000,000 Cr Trial Battle 1
    // bounty is visible here as soon as it lands. It sits at y134
    // on its own dark strip, fully inside the panel interior, clear
    // of the bottom gold border that used to clip it.
    // The map title is NOT drawn here: the header pill in render()
    // already draws it once, and drawing it here doubled it.
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(5,5,15,0.62)';
    ctx.fillRect(20, 132, 120, 14);
    ctx.fillStyle = '#c8c8e8';
    ctx.fillText('Cr: ' + formatCr(walletCr()), 24, 134);
    ctx.restore();
  }

  // V9-ROADWALK: hint pill shown while the pilgrim road auto walk
  // runs and during its waypoint dialogues. The walk locks all
  // movement, so the player is told it is automatic and what A
  // does, instead of the controls looking broken. Mid-walk it sits
  // on the same strip as the field hint (y168); during a waypoint
  // dialogue it sits just above the text box.
  function drawRoadWalkHint(ctx, y, text) {
    ctx.save();
    ctx.font = '9px monospace';
    ctx.textBaseline = 'top';
    var w = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(4, y, w + 10, 13);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, y + 0.5, w + 9, 12);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(text, 9, y + 2);
    ctx.restore();
  }

  function drawDpadHint(ctx) {
    ctx.save();
    /* HINT-FIX: the old draw sat at VIEW_H - 12, on the bottom
     * frame strip, and read half clipped at the screen edge. It now
     * sits at y170 on its own dark pill, clear of the frame strip
     * (y184 to 192) and clear of the map tiles behind it. */
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(4, VIEW_H - 24, 184, 13);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = '9px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('Arrows/WASD move  A talk  X menu', 6, VIEW_H - 22);
    ctx.restore();
  }

  function render() {
    var ctx = state.ctx;
    if (!ctx) return;
    if (state.mode === 'cinematic') { drawCinematic(ctx); return; }
    var map = MAPS[state.mapId];
    var cam = camera();
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // OV6: always draw per tile from the tileset. No flat scene
    // picture is ever drawn as the map layer.
    var x0 = Math.max(0, Math.floor(cam.x / TILE));
    var y0 = Math.max(0, Math.floor(cam.y / TILE));
    var x1 = Math.min(map.rows[0].length - 1, x0 + VIEW_TILES_X);
    var y1 = Math.min(map.rows.length - 1, y0 + VIEW_TILES_Y);
    for (var y = y0; y <= y1; y++) {
      for (var x = x0; x <= x1; x++) {
        drawTile(ctx, tileAt(map, x, y), x * TILE - cam.x, y * TILE - cam.y, state.mapId, x, y, map);
      }
    }

    // Tall grass rustle markers are drawn by the tile layer already.
    // V6 LABEL KEEP-OUT: every wild label is placed once per frame
    // before any actor draws, so no label can ever be unreadable.
    // Header pill occupies y10 to y24, hint strip y168 to y181.
    // A label pill is 10px tall with a 2px gap to any keep-out edge.
    // V8 SPRITE KEEP-OUT: a pill must also clear every actor sprite
    // on screen (wilds, NPCs, player, including its own sprite). A
    // 32x32 sprite frame drawn at screen (sx, sy) occupies x sx-8
    // to sx+24, y sy-18 to sy+14, plus up to 1px of bob, so each
    // keep-out box carries a 1px margin. The old code only kept
    // labels clear of the header, the hint strip and each other, so
    // a label dropped below a top-edge sprite (or staggered down a
    // crowded column) could land on a neighbour sprite: the
    // Saltquay harbor framing put the Whelp Lv6 pill across the
    // Goblin, Puk and NPC sprites. Placement now searches, per wild
    // top to bottom, candidate slots above and below the sprite in
    // 12px steps, then horizontal shifts, and takes the first slot
    // clear of every sprite box and every placed label. A fully
    // packed column falls back to the least-overlapping candidate
    // instead of the old hint clamp.
    var LABEL_H = 10, LABEL_GAP = 2;
    var HEADER_BOTTOM = 24, HINT_TOP = VIEW_H - 24;
    var LABEL_TOP_MIN = HEADER_BOTTOM + LABEL_GAP + 1;
    var LABEL_TOP_MAX = HINT_TOP - LABEL_GAP - LABEL_H;
    var spriteBoxes = [];
    function spriteBox(sx, sy) {
      return { x: sx - 8 - 1, y: sy - 18 - 1, w: 34, h: 34 };
    }
    state.wild.forEach(function (w) { spriteBoxes.push(spriteBox(w.px - cam.x, w.py - cam.y)); });
    state.npcs.forEach(function (n) { spriteBoxes.push(spriteBox(n.px - cam.x, n.py - cam.y)); });
    spriteBoxes.push(spriteBox(state.player.px - cam.x, state.player.py - cam.y));
    function pillHitsSprite(x, top, w) {
      var px0 = x - 2, py0 = top - 1, px1 = x + w + 2, py1 = top - 1 + LABEL_H;
      for (var i = 0; i < spriteBoxes.length; i++) {
        var s = spriteBoxes[i];
        if (px0 < s.x + s.w && s.x < px1 && py0 < s.y + s.h && s.y < py1) { return true; }
      }
      return false;
    }
    function labelHits(r, list) {
      // Pill rects, not text rects: a pill is 4px wider than its
      // text (2px each side) and runs from top-1 to top+9, so two
      // labels whose text boxes sit 2px apart have pills that
      // overlap by 2px and read as one label. Saltquay guildhall
      // proved it: "Puk Lv7" and "Goblin Lv5" ran together above
      // the yellow-roofed house. Require a full LABEL_GAP between
      // the pills themselves.
      for (var pi = 0; pi < list.length; pi++) {
        var p = list[pi];
        var touchV = (r.top - 1 - LABEL_GAP < p.top + LABEL_H - 1) && (p.top - 1 - LABEL_GAP < r.top + LABEL_H - 1);
        var touchH = (r.x - 2 - LABEL_GAP < p.x + p.w + 2) && (p.x - 2 - LABEL_GAP < r.x + r.w + 2);
        if (touchV && touchH) { return true; }
      }
      return false;
    }
    var labelRects = [];
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = '8px monospace';
    state.wild.forEach(function (w) {
      var wildLabel = (w.kind === 'friendly') ? w.species + ' (friendly)' : w.species + ' Lv' + w.level;
      var sy = w.py - cam.y;
      var labelW = ctx.measureText(wildLabel).width;
      // Edge clipping: clamp so the full pill fits inside the screen
      // and the text clears the 8px frame strips painted over the
      // view after the actors (x0 to 8 and x248 to 256). The pill
      // is 2px wider than the text on each side, and a pill edge
      // inside x10 is flagged, so clamp the text to x12 and keep
      // the pill right edge at or inside x246.
      var labelX = w.px - cam.x - 4;
      if (labelX < 12) { labelX = 12; }
      var maxLabelX = VIEW_W - 12 - labelW;
      if (labelX > maxLabelX) { labelX = maxLabelX; }
      if (labelX < 12) { labelX = 12; }
      // Natural spots: above the sprite (11px above the frame top)
      // and below it (pill top sy+17, so the pill starts below the
      // sprite box even with 1px of bob).
      var aboveTop = sy - 20 - 11;
      var belowTop = sy + 17;
      labelRects.push({ text: wildLabel, x: labelX, top: aboveTop, w: labelW, sy: sy, aboveTop: aboveTop, belowTop: belowTop });
    });
    ctx.restore();
    // Place top to bottom so a placed label never moves. Each label
    // tries its natural slots first, then 12px steps up and down,
    // then horizontal shifts, taking the first slot clear of every
    // sprite box and every placed label. Only a fully packed column
    // falls back to the least-overlapping candidate.
    var labelOrder = labelRects.map(function (r, i) { return i; });
    labelOrder.sort(function (a, b) { return (labelRects[a].aboveTop - labelRects[b].aboveTop) || (labelRects[a].x - labelRects[b].x); });
    var placedLabels = [];
    function labelSlotFree(r, top, x) {
      if (top < LABEL_TOP_MIN || top > LABEL_TOP_MAX) { return false; }
      if (x < 12 || x > VIEW_W - 12 - r.w) { return false; }
      if (pillHitsSprite(x, top, r.w)) { return false; }
      var probeRect = { x: x, top: top, w: r.w };
      return !labelHits(probeRect, placedLabels);
    }
    labelOrder.forEach(function (idx) {
      var r = labelRects[idx];
      var cands = [r.aboveTop, r.belowTop];
      var step = LABEL_H + LABEL_GAP;
      for (var k = 1; k <= 12; k++) {
        cands.push(r.aboveTop - step * k);
        cands.push(r.belowTop + step * k);
      }
      var shifts = [0, -12, 12, -24, 24, -36, 36, -48, 48, -60, 60];
      var placed = false;
      for (var ci = 0; ci < cands.length && !placed; ci++) {
        for (var si = 0; si < shifts.length && !placed; si++) {
          var nx = r.x + shifts[si];
          if (nx < 12) { nx = 12; }
          if (nx > VIEW_W - 12 - r.w) { nx = VIEW_W - 12 - r.w; }
          if (labelSlotFree(r, cands[ci], nx)) {
            r.top = cands[ci];
            r.x = nx;
            placed = true;
          }
        }
      }
      if (!placed) {
        // Best-effort fallback: fewest sprite hits, then fewest
        // label hits, then closest to the natural above spot.
        var best = null, bestScore = null;
        for (var fi = 0; fi < cands.length; fi++) {
          var ft = cands[fi];
          if (ft < LABEL_TOP_MIN || ft > LABEL_TOP_MAX) { continue; }
          for (var fj = 0; fj < shifts.length; fj++) {
            var fx = r.x + shifts[fj];
            if (fx < 12) { fx = 12; }
            if (fx > VIEW_W - 12 - r.w) { fx = VIEW_W - 12 - r.w; }
            var sh = pillHitsSprite(fx, ft, r.w) ? 1 : 0;
            var lh = labelHits({ x: fx, top: ft, w: r.w }, placedLabels) ? 1 : 0;
            var score = sh * 100 + lh * 10 + Math.abs(ft - r.aboveTop) / 100 + Math.abs(fx - r.x) / 1000;
            if (bestScore === null || score < bestScore) { bestScore = score; best = { top: ft, x: fx }; }
          }
        }
        if (best) { r.top = best.top; r.x = best.x; }
        else { r.top = Math.max(LABEL_TOP_MIN, Math.min(LABEL_TOP_MAX, r.aboveTop)); }
      }
      placedLabels.push(r);
    });
    // Probe aid: the exact label rects drawn this frame, read by the
    // v8 labels probe instead of a Python replica of this algorithm.
    state._debugLabels = labelRects;

    // Draw wild Wildlife, then NPCs, then the player, sorted by Y.
    var actors = [];
    state.wild.forEach(function (w) {
      actors.push({ kind: 'wild', y: w.py, draw: function () {
        var bob = Math.round(Math.sin(w.bob / 300) * 1);
        drawSprite(ctx, w.sheet, w.dir, w.frame, w.px - cam.x, w.py - cam.y, bob);
      }});
    });
    state.npcs.forEach(function (n) {
      actors.push({ kind: 'npc', y: n.py, draw: function () {
        drawSprite(ctx, n.sheet, n.dir, n.frame, n.px - cam.x, n.py - cam.y, 0);
      }});
    });
    actors.push({ kind: 'player', y: state.player.py, draw: function () {
      var p = state.player;
      var bob = p.frame === 0 ? 0 : -1; // 1px body bob on step frames
      drawSprite(ctx, 'player', p.dir, p.frame, p.px - cam.x, p.py - cam.y, bob);
    }});
    actors.sort(function (a, b) { return a.y - b.y; });
    actors.forEach(function (a) { a.draw(); });

    // V6 LABEL LAYER: wild labels draw after every actor sprite, in
    // one pass, so a later-drawn sprite can never paint over an
    // earlier wild label. The road run proved the need: the Goblin
    // below the Ghoul is Y-sorted after it, so its sprite covered
    // the "Ghoul Lv5" label. Actor order and sprite drawing are
    // unchanged, only the label layer moves to the top. Label
    // positions come from the keep-out pass above: header clear,
    // edge clamped, hint clear, stacked labels staggered. The dark
    // backing pill stays behind every label.
    labelRects.forEach(function (lr) {
      ctx.save();
      ctx.textBaseline = 'top';
      ctx.font = '8px monospace';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(lr.x - 2, lr.top - 1, lr.w + 4, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText(lr.text, lr.x, lr.top);
      ctx.restore();
    });

    // Evening building lights.
    if (PERIODS[state.period].lights) {
      ctx.save();
      ctx.fillStyle = 'rgba(255,214,90,0.85)';
      for (var by = 0; by < map.rows.length; by++) {
        for (var bx = 0; bx < map.rows[0].length; bx++) {
          var ch = tileAt(map, bx, by);
          if (ch === 'H' || ch === 'G' || ch === 'B' || ch === 'M') {
            ctx.fillRect(bx * TILE - cam.x + 6, by * TILE - cam.y + 9, 4, 5);
          }
        }
      }
      ctx.restore();
    }

    // Day and night tint over the whole overworld.
    var tint = PERIODS[state.period].tint;
    if (tint && tint !== 'rgba(255,255,255,0)') {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    }

    // ov3 frame overlay, after the map, actors and tint. The
    // frame art is RGB with no alpha, so only its outer edge
    // strips are drawn as a border; the center of the image is
    // never drawn over the view. Drawn before the location label
    // so the label stays on top.
    var frameImg = ov3Image('ov3_ow_frame.png');
    if (ov3Ready(frameImg)) {
      ctx.drawImage(frameImg, 0, 0, 512, 16, 0, 0, VIEW_W, 8);
      ctx.drawImage(frameImg, 0, 368, 512, 16, 0, VIEW_H - 8, VIEW_W, 8);
      ctx.drawImage(frameImg, 0, 16, 16, 352, 0, 8, 8, VIEW_H - 16);
      ctx.drawImage(frameImg, 496, 16, 16, 352, VIEW_W - 8, 8, 8, VIEW_H - 16);
    }

    // Location label. Inset below the 8px frame strip at the top
    // edge, with a dark pill behind it, so the full town name and
    // time of day are visible. The old draw at y 6 with the default
    // alphabetic baseline put the glyph tops above the canvas edge.
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = '10px monospace';
    var headerText = MAPS[state.mapId].name + ' - ' + PERIODS[state.period].label;
    var headerW = ctx.measureText(headerText).width;
    /* DS HUD pill: deep navy field, gold border, gold label text. */
    ctx.fillStyle = '#0b0b20';
    ctx.fillRect(4, 10, headerW + 8, 14);
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 1;
    ctx.strokeRect(4.5, 10.5, headerW + 7, 13);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillText(headerText, 8, 12);
    ctx.restore();

    if (state.mode === 'menu') drawMenu(ctx);
    if (state.mode === 'grimoire') drawGrimoire(ctx);
    if ((state.mode === 'dialogue' || state.mode === 'submenu') && state.dialogue) {
      var d = state.dialogue;
      if (state.mode === 'dialogue' || state.mode === 'submenu') {
        if (d.shown < d.lines[d.index].length) d.shown = Math.min(d.lines[d.index].length, d.shown + 1);
      }
      drawTextBox(ctx, d.lines, d.index, d.shown);
    }
    if (state.mode === 'field') drawDpadHint(ctx);
    // V9-ROADWALK: the auto walk hint, mid-walk and during its
    // waypoint dialogues. A advances a waypoint dialogue, so the
    // dialogue hint says continue; mid-walk A skips the walk.
    if (state.roadWalk && state.mode === 'roadwalk') {
      drawRoadWalkHint(ctx, VIEW_H - 24, 'Auto walk. Press A to skip.');
    }
    if (state.roadWalk && state.mode === 'dialogue' && state.dialogue) {
      drawRoadWalkHint(ctx, VIEW_H - 52 - 4 - 18, 'Auto walk. Press A to continue.');
    }
  }

  function loop(t) {
    if (!state.running) return;
    var dt = state.lastT ? Math.min(100, t - state.lastT) : 16;
    state.lastT = t;
    /* ROUND 2 BUG A: the gate seal trigger is deferred, never fired
     * synchronously from inside start() during a screen transition.
     * start() only sets gateSealPending. The first loop tick runs
     * after engine setScreen('overworld') has fully returned, so the
     * overworld screen is established and running when the trigger
     * fires and hands off to the story screen. If the hand off stops
     * the overworld, this tick ends here and nothing draws over it.
     * If the loop never ticks, the pending flag stays set and the
     * player can still fire the seal on foot at the south exit. */
    if (state.gateSealPending) {
      state.gateSealPending = false;
      if (isHomeTown(state.mapId) && FED13.state.flags && !FED13.state.flags.gateSealed && !state.gateSealed) {
        storyTrigger('gateSeals', {});
      }
      if (!state.running) return;
    }
    update(dt);
    render();
    // Redraw the overworld bottom view on every frame while the
    // overworld runs, not just on start(), so a grid VICTORY frame
    // repainted after the return is overwritten at once. Skipped
    // while a battle is active, so battles keep their own bottom.
    if (state.mode !== 'battle') { drawBottomView(); }
    state.raf = requestAnimationFrame(loop);
  }

  // On-screen D-pad. Buttons set the same held directions as the keys.
  // OV4 FIX: the pad used to be appended to the canvas parent
  // (#fed13-ds), which puts it after the hint text, below the
  // controls bar and detached from the DS frame. It now lives
  // inside #fed13-controls, first in the row, so it sits with the
  // A/B/X/START buttons. It is scaled to 64px so the whole row
  // (pad plus the eight bar buttons) still fits on one line.
  function buildDpad() {
    if (state.dpadEl || typeof document === 'undefined') return;
    var controls = document.getElementById('fed13-controls');
    var host = controls || (state.canvas && state.canvas.parentNode ? state.canvas.parentNode : document.body);
    var pad = document.createElement('div');
    pad.id = 'fed13-dpad';
    // ov3 D-pad art behind the buttons, scaled 64x64 to the 64x64
    // pad. Dark fallback color shows if the art is missing.
    // Buttons, positions, sizes, data-dir attributes and handlers
    // are unchanged in layout, only scaled from 96px to 64px;
    // only the art changes.
    pad.style.cssText = 'position:relative;display:inline-block;vertical-align:middle;width:64px;height:64px;margin:0 2px 0 0;user-select:none;touch-action:none;background-color:#1e2430;background-image:url(assets/ov4_dpad.png);background-size:64px 64px;background-repeat:no-repeat;background-position:center;';
    var btn = function (label, dir, left, top) {
      var b = document.createElement('button');
      b.textContent = label;
      b.setAttribute('data-dir', dir);
      // Transparent so the ov3 cross shows through; gold arrows
      // read on the dark art. No border, same 20x20 hit area.
      b.style.cssText = 'position:absolute;width:20px;height:20px;left:' + left + 'px;top:' + top + 'px;font-size:12px;color:#e8c838;background:transparent;border:none;border-radius:4px;';
      var on = function (e) { e.preventDefault(); state.held[dir] = true; };
      var off = function (e) { e.preventDefault(); state.held[dir] = false; };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('pointercancel', off);
      pad.appendChild(b);
      return b;
    };
    btn('^', 'up', 22, 0);
    btn('v', 'down', 22, 44);
    btn('<', 'left', 0, 22);
    btn('>', 'right', 44, 22);
    var aBtn = document.createElement('button');
    aBtn.textContent = 'A';
    aBtn.style.cssText = 'position:absolute;width:20px;height:20px;left:22px;top:22px;font-size:12px;background:#2e6fb0;color:#ffffff;border:2px solid #1a1a2e;border-radius:50%;';
    aBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (state.mode === 'dialogue' || state.mode === 'submenu') advanceDialogue();
      else if (state.mode === 'menu') menuSelect();
      else if (state.mode === 'field') interact();
    });
    pad.appendChild(aBtn);
    if (controls && controls.firstChild) { controls.insertBefore(pad, controls.firstChild); }
    else { host.appendChild(pad); }
    state.dpadEl = pad;
  }

  function destroyDpad() {
    if (state.dpadEl && state.dpadEl.parentNode) state.dpadEl.parentNode.removeChild(state.dpadEl);
    state.dpadEl = null;
  }

  // Public API.
  var overworld = {
    maps: MAPS,
    periods: PERIODS,
    menuItems: MENU_ITEMS,
    grimoireEntries: buildGrimoireEntries,
    state: state,

    init: function (canvasOrId, opts) {
      var canvas = typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId;
      if (!canvas) throw new Error('FED13.overworld.init: canvas not found');
      state.canvas = canvas;
      canvas.width = VIEW_W;
      canvas.height = VIEW_H;
      canvas.style.imageRendering = 'pixelated';
      canvas.style.width = '448px';
      canvas.style.height = '336px';
      state.ctx = canvas.getContext('2d');
      resolvePlayerSheets();
      loadImages();
      if (opts && opts.period) { state.period = opts.period; state.periodAuto = false; }
      if (opts && opts.mapId) { state.mapId = opts.mapId; }
      if (opts && typeof opts.autoPeriod === 'boolean') state.periodAuto = opts.autoPeriod;
      if (!state.keyHandler) {
        state.keyHandler = onKeyDown;
        state.keyUpHandler = onKeyUp;
        document.addEventListener('keydown', state.keyHandler);
        document.addEventListener('keyup', state.keyUpHandler);
      }
      buildDpad();
      flushQueuedStoryTriggers();
      return overworld;
    },

    start: function (mapId, spawn) {
      // The overworld takes over the screen here: redraw its own
      // bottom view first, so a VICTORY screen left by a grid battle
      // or the title screen left by the title never stays visible
      // underneath the overworld. loop() then redraws it every frame
      // for as long as the overworld runs, so a late repaint from a
      // still-running grid loop cannot bring the stale frame back.
      drawBottomView();
      resolvePlayerSheets();
      /* ROUND 2 BUG A/C: the engine flags are the shared source of
       * truth for chain progress. Sync the local seal and arrival
       * flags from them on every entry, so a chain that already
       * sealed the gate (story hook sealGate) is never replayed by
       * this module walking south or firing a pending seal. */
      if (FED13.state.flags) {
        if (FED13.state.flags.gateSealed) { state.gateSealed = true; }
        if (FED13.state.flags.roadWalkDone) { state.roadWalkDone = true; }
        if (FED13.state.flags.saltquayArrived) { state.saltquayArrived = true; state.visitedSaltquay = true; }
      }
      /* ROUND 2 BUG B: start() restores input idempotently. stop()
       * removes the keyboard listeners and destroys the D-pad, and
       * the battle return path runs start() without init(), so start()
       * must re-attach whatever is missing, or the loop runs with no
       * input at all. init() already guards the same way. */
      if (!state.keyHandler) {
        state.keyHandler = onKeyDown;
        state.keyUpHandler = onKeyUp;
        document.addEventListener('keydown', state.keyHandler);
        document.addEventListener('keyup', state.keyUpHandler);
      }
      buildDpad();
      if (mapId) {
        loadMap(mapId, spawn);
      } else if (state.everStarted) {
        /* ROUND 2 BUG C: resume in place. A later start() with no
         * map is a return to a live overworld (after a battle, after
         * a story chain, after a menu screen), not a fresh entry.
         * Reloading the save here used to teleport the player back
         * to the last saved map and position, so fleeing a wild
         * battle on the road dropped the player back in Gatehollow
         * at (10,12) with the gate unsealed. Keep the current map,
         * position, and flags. Only a battle left the mode set to
         * 'battle', and that ends with the battle, so back to field. */
        if (state.mode === 'battle') { state.mode = 'field'; state.dialogue = null; }
      } else {
        var save = loadSave();
        if (save && save.mapId && MAPS[save.mapId]) {
          state.gateSealed = !!save.gateSealed;
          state.visitedSaltquay = !!save.visitedSaltquay;
          state.roadWalkDone = !!save.roadWalkDone;
          state.saltquayArrived = !!save.saltquayArrived;
          state.boardSighted = !!save.boardSighted;
          /* V8 FIX: a save written before the arrival fix (or any
           * stale home town save) must not resurrect the home town
           * dump: once the story flags say Saltquay was reached,
           * the home town is sealed and the player belongs in
           * Saltquay, at the map start. */
          if (isHomeTown(save.mapId) && FED13.state.flags && FED13.state.flags.saltquayArrived) {
            loadMap('saltquay');
          } else {
            loadMap(save.mapId, { x: save.x, y: save.y, dir: save.dir || 'down' });
          }
          if (save.period) { state.period = save.period; }
        } else {
          loadMap(homeMapId(), spawn);
        }
      }
      state.everStarted = true;
      if (!state.running) {
        state.running = true;
        state.lastT = 0;
        state.raf = requestAnimationFrame(loop);
      }
      /* ROUND 2 BUG A: the grad arc ends in the overworld with
       * roadDownPending set. The player spawns in the home town, whose
       * south exit fires gateSeals on foot, but if the chain is ever
       * pending here and the gate is not sealed, fire it once now so
       * the road down is reachable even without finding the exit.
       * The flag is cleared before deferring, so it can never loop.
       * DEFERRED, never synchronous: start() only sets
       * gateSealPending, and the first loop tick fires it, after the
       * engine setScreen('overworld') call has fully returned. The
       * old synchronous fire from inside start() re-entered
       * setScreen('storyScene'), which stopped the module overworld,
       * and the outer setScreen then overwrote currentScreen back to
       * 'overworld' and entered the engine fallback overworld with
       * no exit logic. The gate seal chain still fires exactly once. */
      if (isHomeTown(state.mapId) && FED13.state.flags && FED13.state.flags.roadDownPending && !FED13.state.flags.gateSealed && !state.gateSealed) {
        FED13.state.flags.roadDownPending = false;
        state.gateSealPending = true;
      }
      return overworld;
    },

    stop: function () {
      state.running = false;
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
      if (state.keyHandler) {
        document.removeEventListener('keydown', state.keyHandler);
        document.removeEventListener('keyup', state.keyUpHandler);
        state.keyHandler = null; state.keyUpHandler = null;
      }
      destroyDpad();
      return overworld;
    },

    loadMap: loadMap,
    press: handlePress,
    handlePress: handlePress,
    wildDefs: WILD_DEFS,
    checkWildTouch: checkWildTouch,
    startFriendlyEncounter: startFriendlyEncounter,
    interact: interact,
    openMenu: openMenu,
    closeMenu: closeMenu,
    menuSelect: menuSelect,
    openDialogue: openDialogue,
    advanceDialogue: advanceDialogue,
    saveGame: saveGame,
    loadSave: loadSave,

    setPeriod: function (period) {
      if (!PERIODS[period]) return false;
      state.period = period;
      state.periodAuto = false;
      return true;
    },
    setPeriodAuto: function (auto) {
      state.periodAuto = !!auto;
      if (auto) updatePeriod();
      return state.periodAuto;
    },
    getPeriod: function () { return state.period; },
    periodForHour: periodForHour,

    teleport: function (mapId, x, y, dir) {
      return loadMap(mapId, { x: x, y: y, dir: dir || 'down' });
    },
    /* ROUND 2 BUG C: a fresh entry must load the save, a resume must
     * not. everStarted tells start() which it is. New Game and title
     * Continue are fresh entries in the same page session, so they
     * clear the resume flag first; the next start() then loads the
     * save (Continue) or the default spawn (New Game) instead of
     * resuming the old map and position. */
    clearResume: function () {
      state.everStarted = false;
      state.gateSealPending = false;
      return overworld;
    },
    resetForNewGame: function () {
      state.everStarted = false;
      state.gateSealPending = false;
      state.pressDir = null;
      state.gateSealed = false;
      state.visitedSaltquay = false;
      state.roadWalkDone = false;
      state.saltquayArrived = false;
      state.boardSighted = false;
      state.roadWalkPending = false;
      return overworld;
    },
    sealGate: function () {
      state.gateSealed = true;
      FED13.state.flags.gateSealed = true;
      return true;
    },
    isGateSealed: function () { return state.gateSealed; },
    roadDown: ROAD_DOWN,
    gateSealDef: gateSealDef,
    playGateSeal: function () { return startCinematic('gateSeal'); },
    playRoadWalk: function () { return startRoadWalk(); },
    playSaltquayArrival: function () { return startCinematic('saltquayArrival'); },
    advanceCinematic: advanceCinematic,
    isRoadWalkDone: function () { return state.roadWalkDone; },
    hasSeenGuildBoard: function () { return state.boardSighted; },
    hasArrivedSaltquay: function () { return state.saltquayArrived; },
    startWildBattle: startWildBattle,
    storyTrigger: storyTrigger,
    triggerCutscene: function (name, data) { return storyTrigger(name, data); }
  };

  FED13.overworld = overworld;

  // Auto-init if engine.js already created a canvas with this id.
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      var c = document.getElementById('fed13-overworld');
      if (c && !state.canvas) {
        try { overworld.init(c); overworld.start(); } catch (e) { /* host page starts it later */ }
      }
    });
  }
})();
