/* FED-13 story module. Batch 1, code worker C5, story and cutscenes.
 *
 * Source of truth: fed-13-complete-story.md (the whole story in order).
 * Style rule: fed-13-ds-style-guide.md section 9 and section 11D rule 8.
 * Every scene is dialogue with static portraits plus text. No voice acting.
 * The school road Ghoul scene also carries staging beats: background art
 * plus overworld and battle sprites on the top screen, one beat per line.
 * All art is generated from scratch. No ripped Nintendo sprites.
 * Names are Mankind, Bondkin, Wildlife. The bank is the Monster Bank.
 * The king is King Malachar Duskspire. Elf is Bondkin bloodline 001.
 * Totem Spirit of Elf is Starwarden.
 * All asset paths are relative: assets/<filename>.
 * No em dashes in any visible text in this file.
 *
 * DRAFT NAMES (the complete story leaves these open for Git-FED revision):
 * rival girl Sera, male neighbor Theo, Elderkin arc Bondkin Halden
 * (DRAFT FOR GIT-FED REVISION, renamed from Bram to end the collision
 * with Guildmaster Bram Hollis),
 * Elf arc Bondkin Aelindra, Puffkin arc Bondkin Pip,
 * Harefolk arc Bondkin Marnie, Drakescale arc Bondkin Cinder,
 * Broker Voss, Headteacher Odo, Clerk Ivo, Guild Clerk Petra.
 * The father and mother are unnamed in the story file and stay unnamed here.
 * Change any draft name in NAMES_DRAFT and every scene follows it.
 * FIXED NAME, DO NOT RENAME: Guildmaster Bram Hollis, head of the guild
 * hall in the grad arc. The draft Elderkin arc Bondkin used to share
 * his given name Bram; he is Halden now, so the collision is ended.
 * Guild scenes still always use his full name and title, never plain Bram.
 * If Git-FED renames the draft Bondkin, only NAMES_DRAFT.arcBondkin
 * changes; Guildmaster Bram Hollis stays as named.
 * PORTRAIT: PORTRAITS.guildmaster points at p_guildmaster.png, the
 * distinct Guildmaster portrait. The Elderkin arc Bondkin Halden
 * has his own portrait, p_bondkin_elderkin.png. No scene changes.
 *
 * FX fallback: fx_slash, fx_smoke, fx_sparkle and fx_shield now exist
 * as image files in build/assets, and this module loads those files
 * (FX_MISSING_PROCEDURAL below is empty). The procedural drawings stay
 * as a fallback if an image fails to load. It never stops for a missing
 * file and never retries generation.
 * See FED13.story.fx at the end of this file.
 *
 * ADV-ROAD (worker A8, 2026-11-24): the road down presentation. The
 * Gatehollow Gate seal cinematic, the pilgrim road walk with the
 * trainer sprite, and the Saltquay arrival with the first guild board
 * sighting. Data lives in ROAD_DOWN below. The seal plays on
 * map_gatehollow.png then map_road.png. The arrival plays on
 * map_saltquay.png then bg_harbor.png. DS style: static map art plus
 * text boxes, no voice acting. Scratch copy only, build/code untouched.
 *
 * Uses window.FED13 from engine.js. Defines FED13.story.
 * Plain JavaScript, no frameworks. Runnable in a browser and in node
 * (node only exercises the data and the runner logic, not the canvas).
 */
(function (root) {
  'use strict';

  var FED13 = root.FED13 || (root.FED13 = {});

  /* ------------------------------------------------------------------ */
  /* Constants                                                           */
  /* ------------------------------------------------------------------ */

  var ASSETS = 'assets/';
  var WALLET_CAP = 999999;
  var MISSION_1_REWARD = 1000000;
  var COLD_OPEN_SCRIPTED_LOSS_TURN = 3;
  var PROLOGUE_ARRIVAL_LEVEL = 5;

  /* ------------------------------------------------------------------ */
  /* ADV-ROAD: the road down presentation data.                          */
  /* Gate seal cinematic, pilgrim road walk, Saltquay arrival.           */
  /* Maps are the shipped files: map_gatehollow.png, map_road.png,      */
  /* map_saltquay.png, bg_harbor.png. The walk uses the trainer sprite  */
  /* the overworld already resolves from creation: ow_trainer_<sex>_<race>.png. */
  /* The arrival plays at dawn, so the overworld sets period morning.   */
  /* No em dashes in any visible text here. No banned words.            */
  /* ------------------------------------------------------------------ */

  var ROAD_DOWN = {
    gateSeal: {
      id: 'gate_seal',
      title: 'The Gatehollow Gate Seals',
      maps: [asset('map_gatehollow.png'), asset('map_road.png')],
      background: asset('map_gatehollow.png'),
      fx: 'shield',
      beats: [
        { map: asset('map_gatehollow.png'), caption: 'You step through the Gatehollow Gate, the old land gate between the 14th world and the Realm Map.' },
        { map: asset('map_gatehollow.png'), caption: 'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.' },
        { map: asset('map_road.png'), caption: 'The gate seals. It stays sealed until after the Hall of Fame. There is no way back now, only the road down.' },
        { map: asset('map_road.png'), caption: 'One bag. One permit. One small Wildlife in a sling. The pilgrim road runs south to Cragfall, then to Saltquay.' }
      ]
    },
    gateSealPolar: {
      id: 'gate_seal',
      title: 'The Dreamrest Gate Seals',
      maps: [asset('map_dreamrest.png'), asset('map_road.png')],
      background: asset('map_dreamrest.png'),
      fx: 'shield',
      beats: [
        { map: asset('map_dreamrest.png'), caption: 'You step through the Dreamrest Gate, the old land gate between the 14th world and the Realm Map.' },
        { map: asset('map_dreamrest.png'), caption: 'Behind you, stone grinds on stone. The light narrows to a line, then to nothing.' },
        { map: asset('map_road.png'), caption: 'The gate seals. It stays sealed until after the Hall of Fame. There is no way back now, only the road down.' },
        { map: asset('map_road.png'), caption: 'One bag. One permit. One small Wildlife in a sling. The pilgrim road runs south to Cragfall, then to Saltquay.' }
      ]
    },
    roadWalk: {
      id: 'road_walk',
      title: 'The Pilgrim Road Walk',
      map: asset('map_road.png'),
      mapId: 'road',
      spriteNote: 'The trainer sprite walks the center path south, tile by tile, 3 frame walk, DS style. The sprite file comes from creation: ow_trainer_boy_solar.png, ow_trainer_girl_solar.png, ow_trainer_boy_polar.png, or ow_trainer_girl_polar.png.',
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
      maps: [asset('map_saltquay.png'), asset('bg_harbor.png')],
      background: asset('bg_harbor.png'),
      period: 'morning',
      beats: [
        { map: asset('map_saltquay.png'), caption: 'Saltquay harbor gate, at dawn. Mankind level 5.' },
        { map: asset('bg_harbor.png'), caption: 'Gulls, salt air, and the harbor spread out below the gate. You made it.' },
        { map: asset('bg_harbor.png'), caption: 'Your arc Bondkin waits in this town. First, the guild hall. The board is already posted.' }
      ]
    },
    guildBoardSighting: {
      id: 'guild_board_sighting',
      title: 'First Guild Board Sighting',
      board: 'Saltquay guild job board',
      background: asset('bg_harbor.png'),
      topCard: 'Main Mission 1: Takedown of Maren Saltwright. Reward: 1,000,000 Cr.'
    }
  };
  /* COLD OPEN POLISH (adv-coldopen): one place for the cold open
   * presentation. The engine intro stages the entrance from this
   * data, the 1v1 battle stages the turn 3 loss from it, and the
   * grid stages Maren stepping onto the field from it. The Realm Map
   * banner, her overworld sprite, her battle art, her grid sheet,
   * and her portrait are all real files in assets. */
  var COLD_OPEN = {
    scriptedLossTurn: COLD_OPEN_SCRIPTED_LOSS_TURN,
    member: 'Maren Saltwright',
    sign: 'Pisces',
    banner: asset('map_realm.png'),
    entranceSprite: asset('ow_maren.png'),
    battleSprite: asset('b_maren_front.png'),
    gridSprite: asset('g_maren.png'),
    portrait: asset('p_maren.png'),
    defenseScene: 'cold_open_defense',
    farewellScene: 'cold_open_farewell'
  };

  function asset(name) {
    return ASSETS + name;
  }

  /* ------------------------------------------------------------------ */
  /* Draft names. One place to change them.                              */
  /* ------------------------------------------------------------------ */

  var NAMES_DRAFT = {
    rivalGirl: 'Sera',
    maleNeighbor: 'Theo',
    brokerVoss: 'Broker Voss',
    headteacher: 'Headteacher Odo',
    hunterClerk: 'Clerk Ivo',
    guildClerk: 'Guild Clerk Petra',
    guildmaster: 'Guildmaster Bram Hollis',
    arcBondkin: {
      elf: 'Aelindra',
      puffkin: 'Pip',
      elderkin: 'Halden', /* DRAFT FOR GIT-FED REVISION: renamed from Bram, which collided with Guildmaster Bram Hollis. */
      harefolk: 'Marnie',
      drakescale: 'Cinder'
    }
  };

  /* ------------------------------------------------------------------ */
  /* The 5 core Bondkin bloodlines, in creation order.                   */
  /* Elf is bloodline 001. Its Totem Spirit is Starwarden.              */
  /* ------------------------------------------------------------------ */

  var BLOODLINES = [
    {
      id: 'elf',
      name: 'Elf',
      number: '001',
      totem: 'Starwarden',
      totemTitle: 'guardian of the Elf bloodline',
      totemItem: 'Starwarden Oath',
      arcPlace: 'Dawnspire, the Sun Altar on the highland road above Cragfall',
      cutscene: 'The Starwarden Ascends',
      portrait: asset('p_bondkin_elf.png'),
      gridSprite: asset('g_elf.png'),
      greeting: 'The stars have been watching this road a long time, trainer.'
    },
    {
      id: 'puffkin',
      name: 'Puffkin',
      number: '002',
      totem: 'Brightpom Sovereign',
      totemTitle: 'master tinkerer of the Puffkin bloodline',
      totemItem: 'Brightpom Gear',
      arcPlace: 'Gearford, at the Tinkerwright Guild',
      cutscene: 'The Brightpom Sovereign',
      portrait: asset('p_bondkin_puffkin.png'),
      gridSprite: asset('g_puffkin.png'),
      greeting: 'Oh good, a trainer! I have six ideas and no hands free!'
    },
    {
      id: 'elderkin',
      name: 'Elderkin',
      number: '003',
      totem: 'Quiet Flame Sage',
      totemTitle: 'keeper of the Elderkin bloodline',
      totemItem: 'Quiet Flame Tome',
      arcPlace: 'Runestead',
      cutscene: 'The Quiet Flame Sage',
      portrait: asset('p_bondkin_elderkin.png'),
      gridSprite: asset('g_elderkin.png'),
      greeting: 'Quiet now. The harbor listens, and so do I.'
    },
    {
      id: 'harefolk',
      name: 'Harefolk',
      number: '004',
      totem: 'Moonhare Matriarch',
      totemTitle: 'swiftest of the Harefolk bloodline',
      totemItem: 'Moonhare Flute',
      arcPlace: 'Forestgate',
      cutscene: 'The Moonhare Matriarch',
      portrait: asset('p_bondkin_harefolk.png'),
      gridSprite: asset('g_harefolk.png'),
      greeting: 'You walk like prey that never learned to run. I can fix that.'
    },
    {
      id: 'drakescale',
      name: 'Drakescale',
      number: '005',
      totem: 'Emberwyrm King',
      totemTitle: 'strongest of the Drakescale bloodline',
      totemItem: 'Emberwyrm Horn',
      arcPlace: 'Goldmane',
      cutscene: 'The Emberwyrm King',
      portrait: asset('p_bondkin_drakescale.png'),
      gridSprite: asset('g_drakescale.png'),
      greeting: 'Hmph. Small trainer, loud harbor. Let us see your fire.'
    }
  ];

  function bloodlineById(id) {
    for (var i = 0; i < BLOODLINES.length; i++) {
      if (BLOODLINES[i].id === id) {
        return BLOODLINES[i];
      }
    }
    return BLOODLINES[0];
  }

  /* ------------------------------------------------------------------ */
  /* The 3 eggs. The kind Wisp drops the bag on the mountain road.       */
  /* ------------------------------------------------------------------ */

  var EGGS = [
    {
      id: 'whelp',
      name: 'Whelp',
      codex: '002',
      types: 'Fire',
      eggSprite: asset('egg_whelp.png'),
      crackedSprite: asset('egg_cracked_whelp.png'),
      frontSprite: asset('b_whelp_front.png'),
      backSprite: asset('b_whelp_back.png'),
      blurb: 'A warm egg. It hums like a banked fire when you hold it.'
    },
    {
      id: 'puk',
      name: 'Puk',
      codex: '104',
      types: 'Flying and Dragon',
      eggSprite: asset('egg_puk.png'),
      crackedSprite: asset('egg_cracked_puk.png'),
      frontSprite: asset('b_puk_front.png'),
      backSprite: asset('b_puk_back.png'),
      blurb: 'A light egg. It shivers, and for a moment you feel wind on your face.'
    },
    {
      id: 'mandragora',
      name: 'Mandragora',
      codex: '029',
      types: 'Grass',
      eggSprite: asset('egg_mandragora.png'),
      crackedSprite: asset('egg_cracked_mandragora.png'),
      frontSprite: asset('b_mandragora_front.png'),
      backSprite: asset('b_mandragora_back.png'),
      blurb: 'A green egg. It smells of rain, and something inside is singing.'
    }
  ];

  function eggById(id) {
    for (var i = 0; i < EGGS.length; i++) {
      if (EGGS[i].id === id) {
        return EGGS[i];
      }
    }
    return EGGS[0];
  }

  /* ------------------------------------------------------------------ */
  /* Ghoul encounter staging, school arc, scene school_road_ghoul.      */
  /* One beat per step of the encounter. Each dialogue line in the      */
  /* scene carries beat: <index> and the engine draws that beat on the  */
  /* top screen: background art, overworld and battle sprites, the      */
  /* bag the Wisp drops, and the 3 eggs the bag opens to reveal.        */
  /* Sprite slots are top screen pixels, 256 wide by 192 tall.          */
  /* A sprite is { img, x, y, w, h } or { draw: 'bag', x, y, w, h }.    */
  /* The bag has no image file, so the engine draws it procedurally.    */
  /* fx names are story FX names, drawn at fxAt or at the frame center. */
  /* ------------------------------------------------------------------ */

  var GHOUL_ENCOUNTER_STAGING = {
    sceneId: 'school_road_ghoul',
    beats: [
      {
        id: 'road_quiet',
        title: 'The Mountain Road',
        background: asset('bg_mountain.png'),
        sprites: [],
        fx: [],
        note: 'The road to school. The trees are too still, the birds quiet.'
      },
      {
        id: 'ghoul_appears',
        title: 'The Ghoul Appears',
        background: asset('bg_mountain.png'),
        sprites: [
          { img: asset('ow_ghoul.png'), x: 104, y: 100, w: 48, h: 48, label: 'Ghoul' }
        ],
        fx: ['smoke'],
        fxAt: { x: 128, y: 124 },
        note: 'A Ghoul steps onto the road. Codex 013. A dangerous wild Wildlife.'
      },
      {
        id: 'ghoul_looms',
        title: 'The Ghoul Looms',
        background: asset('bg_mountain.png'),
        sprites: [
          { img: asset('b_ghoul_front.png'), x: 88, y: 36, w: 80, h: 80, label: 'Ghoul' }
        ],
        fx: ['smoke'],
        fxAt: { x: 128, y: 76 },
        note: 'The Ghoul lowers its head and steps closer. It is hungry.'
      },
      {
        id: 'wisp_arrives',
        title: 'The Kind Wisp Arrives',
        background: asset('bg_mountain.png'),
        sprites: [
          { img: asset('ow_wisp.png'), x: 40, y: 60, w: 48, h: 48, label: 'Wisp' },
          { img: asset('b_ghoul_front.png'), x: 168, y: 80, w: 48, h: 48, label: 'Ghoul' }
        ],
        fx: ['sparkle'],
        fxAt: { x: 64, y: 84 },
        note: 'A light rises out of the trees. A kind Wisp, Codex 043, Ghost and Magic.'
      },
      {
        id: 'wisp_drives_off',
        title: 'The Wisp Drives the Ghoul Off',
        background: asset('bg_mountain.png'),
        sprites: [
          { img: asset('b_wisp_front.png'), x: 88, y: 36, w: 80, h: 80, label: 'Wisp' },
          { img: asset('ow_ghoul.png'), x: 216, y: 112, w: 32, h: 32, label: 'Ghoul' }
        ],
        fx: ['sparkle', 'smoke'],
        fxAt: { x: 128, y: 76 },
        note: 'The Wisp burns bright and drives the Ghoul off the road, back into the trees.'
      },
      {
        id: 'bag_drops',
        title: 'The Bag Drops',
        background: asset('bg_grass.png'),
        sprites: [
          { img: asset('ow_wisp.png'), x: 196, y: 24, w: 40, h: 40, label: 'Wisp' },
          { draw: 'bag', x: 108, y: 128, w: 40, h: 32, label: 'Bag' }
        ],
        fx: ['sparkle'],
        fxAt: { x: 128, y: 144 },
        note: 'The Wisp floats into the trees, and a bag falls from the branches.'
      },
      {
        id: 'eggs_revealed',
        title: 'The Bag Opens: 3 Eggs',
        background: asset('bg_grass.png'),
        sprites: [
          { img: asset('egg_whelp.png'), x: 36, y: 96, w: 56, h: 56, label: 'Whelp egg' },
          { img: asset('egg_puk.png'), x: 100, y: 96, w: 56, h: 56, label: 'Puk egg' },
          { img: asset('egg_mandragora.png'), x: 164, y: 96, w: 56, h: 56, label: 'Mandragora egg' }
        ],
        fx: ['sparkle'],
        fxAt: { x: 128, y: 124 },
        note: 'The bag falls open. Inside are 3 eggs: Whelp, Puk, and Mandragora.'
      }
    ]
  };

  function stagingBeat(sceneId, index) {
    if (sceneId === GHOUL_ENCOUNTER_STAGING.sceneId) {
      var beats = GHOUL_ENCOUNTER_STAGING.beats;
      if (typeof index === 'number' && index >= 0 && index < beats.length) {
        return beats[index];
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* Static portraits. Style guide 11D rule 8: static portrait plus     */
  /* text, no voice acting, no animated talking head.                    */
  /* Portraits that already exist in assets are marked EXISTS. The rest  */
  /* are art targets for the sprite batch, same p_*.png naming.          */
  /* ------------------------------------------------------------------ */

  var PORTRAITS = {
    playerBoySolar: asset('p_trainer_boy.png'),
    playerGirlSolar: asset('p_trainer_girl.png'),
    playerBoyPolar: asset('p_trainer_boy.png'),
    playerGirlPolar: asset('p_trainer_girl.png'),
    maren: asset('p_maren.png'),
    father: asset('p_father.png'),
    rivalGirl: asset('p_rival_girl.png'),
    neighborBoy: asset('p_neighbor_boy.png'),
    wisp: asset('p_wisp.png'),
    ghoul: asset('p_ghoul.png'),
    headteacher: asset('p_headteacher.png'),
    hunterClerk: asset('p_hunter_clerk.png'),
    guildClerk: asset('p_guild_clerk.png'),
    /* Guildmaster portrait: p_guildmaster.png, the distinct
     * Guildmaster portrait. The Elderkin arc Bondkin Halden has his
     * own portrait, p_bondkin_elderkin.png. */
    guildmaster: asset('p_guildmaster.png'),
    brokerVoss: asset('p_voss.png'),
    wardenMirelle: asset('p_mirelle.png'),
    wardenWren: asset('p_wren.png'),
    kessa: asset('p_kessa.png'),
    dara: asset('p_dara.png'),
    bondkinElf: asset('p_bondkin_elf.png'),
    bondkinPuffkin: asset('p_bondkin_puffkin.png'),
    bondkinElderkin: asset('p_bondkin_elderkin.png'),
    bondkinHarefolk: asset('p_bondkin_harefolk.png'),
    bondkinDrakescale: asset('p_bondkin_drakescale.png'),
    whelp: asset('p_whelp.png'),
    puk: asset('p_puk.png'),
    mandragora: asset('p_mandragora.png'),
    narrator: null
  };

  /* Speaker key to portrait key, for dialogue lines. */
  var SPEAKER_PORTRAIT = {
    player: 'playerBoySolar',
    maren: 'maren',
    father: 'father',
    rival: 'rivalGirl',
    neighbor: 'neighborBoy',
    wisp: 'wisp',
    ghoul: 'ghoul',
    headteacher: 'headteacher',
    hunterClerk: 'hunterClerk',
    guildClerk: 'guildClerk',
    guildmaster: 'guildmaster',
    brokerVoss: 'brokerVoss',
    mirelle: 'wardenMirelle',
    wren: 'wardenWren',
    kessa: 'kessa',
    dara: 'dara',
    bondkin: 'bondkinElf',
    whelp: 'whelp',
    puk: 'puk',
    mandragora: 'mandragora',
    narrator: 'narrator'
  };

  /* ------------------------------------------------------------------ */
  /* Game state for a new playthrough.                                   */
  /* ------------------------------------------------------------------ */

  function newGameState() {
    return {
      appearance: null,
      race: null,
      path: null,
      pronouns: null,
      mankindClass: null,
      starterBloodline: null,
      grimoire: null,
      rival: null,
      homeTown: null,
      prologueStart: null,
      warden: null,
      starterWildlife: null,
      starterWildlifeName: null,
      arcBondkin: null,
      party: [],
      hunterPermit: false,
      trainerRegistered: false,
      walletCr: 0,
      walletCap: WALLET_CAP,
      flags: {},
      sceneHistory: []
    };
  }

  /* ------------------------------------------------------------------ */
  /* Creation. Runs after the cold open cut to one year later.           */
  /* Order from the story: girl or boy, race Solar or Polar, path,       */
  /* pronouns, Mankind class, starter bloodline, Grimoire.               */
  /* ------------------------------------------------------------------ */

  var CREATION = {
    id: 'creation',
    title: 'Creation',
    steps: [
      {
        id: 'appearance',
        prompt: 'Are you a girl or a boy?',
        options: [
          { id: 'girl', label: 'Girl' },
          { id: 'boy', label: 'Boy' }
        ]
      },
      {
        id: 'race',
        prompt: 'Choose your Mankind race.',
        options: [
          { id: 'solar', label: 'Solar', note: 'Start at Gatehollow, at the foot of the mountain, low and warm.' },
          { id: 'polar', label: 'Polar', note: 'Start at Dreamrest, higher up the mountain, cold.' }
        ]
      },
      {
        id: 'path',
        prompt: 'Choose your path.',
        optionsByRace: {
          solar: [
            { id: 'rebel', label: 'Rebel' },
            { id: 'peacekeeper', label: 'Peacekeeper' }
          ],
          polar: [
            { id: 'hunter', label: 'Hunter' },
            { id: 'peacemaker', label: 'Peacemaker' }
          ]
        }
      },
      {
        id: 'pronouns',
        prompt: 'How should others address you?',
        options: [
          { id: 'him', label: 'Him' },
          { id: 'her', label: 'Her' },
          { id: 'they', label: 'They' }
        ]
      },
      {
        id: 'mankindClass',
        prompt: 'Choose your Mankind class.',
        options: [
          { id: 'fighter', label: 'Fighter' },
          { id: 'mage', label: 'Mage' },
          { id: 'archer', label: 'Archer' },
          { id: 'healer', label: 'Healer' }
        ]
      },
      {
        id: 'starterBloodline',
        prompt: 'Choose your starter bloodline. This Bondkin meets you in Saltquay and its arc plays through the game.',
        options: [
          { id: 'elf', label: 'Elf, bloodline 001, Totem Spirit Starwarden' },
          { id: 'puffkin', label: 'Puffkin, Totem Spirit Brightpom Sovereign' },
          { id: 'elderkin', label: 'Elderkin, Totem Spirit Quiet Flame Sage' },
          { id: 'harefolk', label: 'Harefolk, Totem Spirit Moonhare Matriarch' },
          { id: 'drakescale', label: 'Drakescale, Totem Spirit Emberwyrm King' }
        ]
      },
      {
        id: 'grimoire',
        prompt: 'Choose your Grimoire.',
        options: [
          { id: 'ember', label: 'Ember Grimoire' },
          { id: 'tide', label: 'Tide Grimoire' },
          { id: 'gale', label: 'Gale Grimoire' },
          { id: 'stone', label: 'Stone Grimoire' }
        ]
      }
    ],
    apply: function (state, picks) {
      state.appearance = picks.appearance || 'boy';
      state.race = picks.race || 'solar';
      state.path = picks.path || (state.race === 'polar' ? 'hunter' : 'rebel');
      state.pronouns = picks.pronouns || 'they';
      state.mankindClass = picks.mankindClass || 'fighter';
      state.starterBloodline = picks.starterBloodline || 'elf';
      state.grimoire = picks.grimoire || 'ember';
      state.homeTown = state.race === 'polar' ? 'Dreamrest' : 'Gatehollow';
      state.prologueStart = state.race === 'polar' ? 'Frostvein Hold' : 'Emberdeep';
      state.warden = state.race === 'polar' ? 'wren' : 'mirelle';
      state.rival = state.appearance === 'girl' ? 'neighbor' : 'rival';
      state.arcBondkin = NAMES_DRAFT.arcBondkin[state.starterBloodline];
      return state;
    }
  };

  /* ------------------------------------------------------------------ */
  /* Dialogue helpers. A line is one text box: one static portrait,     */
  /* one speaker name, one block of text. No voice acting.               */
  /* ------------------------------------------------------------------ */

  function line(speaker, speakerName, text, extra) {
    var out = {
      speaker: speaker,
      speakerName: speakerName,
      portrait: PORTRAITS[SPEAKER_PORTRAIT[speaker] || 'narrator'] || null,
      text: text
    };
    if (extra) {
      for (var key in extra) {
        if (extra.hasOwnProperty(key)) {
          out[key] = extra[key];
        }
      }
    }
    return out;
  }

  function narrate(text, extra) {
    return line('narrator', '', text, extra);
  }

  function choice(prompt, options) {
    return { type: 'choice', prompt: prompt, options: options };
  }

  /* Player display name used in dialogue. The story never names the
   * player, so scenes address the player as Trainer. */
  function playerName() {
    return 'Trainer';
  }

  function rivalName(state) {
    if (state && state.appearance === 'girl') {
      return NAMES_DRAFT.maleNeighbor;
    }
    return NAMES_DRAFT.rivalGirl;
  }

  function rivalSpeaker(state) {
    if (state && state.appearance === 'girl') {
      return 'neighbor';
    }
    return 'rival';
  }

  function wardenName(state) {
    if (state && state.race === 'polar') {
      return 'Warden Wren Hallowlight';
    }
    return 'Warden Mirelle Voss';
  }

  function wardenSpeaker(state) {
    if (state && state.race === 'polar') {
      return 'wren';
    }
    return 'mirelle';
  }

  function starterName(state) {
    if (state && state.starterWildlife) {
      return eggById(state.starterWildlife).name;
    }
    return 'your Wildlife';
  }

  /* ------------------------------------------------------------------ */
  /* SCENES. Each scene: id, chapter, title, location, background,      */
  /* lines (dialogue), and hooks the engine reads: battle, choice,      */
  /* onEnter, next. Scenes play in STORY_ORDER.                          */
  /* ------------------------------------------------------------------ */

  var SCENES = {};

  function defineScene(scene) {
    SCENES[scene.id] = scene;
    return scene;
  }

  /* ------------------------- */
  /* (1) Cold open, first.     */
  /* ------------------------- */

  defineScene({
    id: 'cold_open_defense',
    chapter: 1,
    title: 'The Cold Open: The Day Darkness Found Earth',
    location: 'The Realm Map, the defense line',
    background: asset('bg_hall.png'),
    music: 'defense',
    /* COLD OPEN POLISH: entrance staging. The Realm Map banner hangs
     * behind the defense line, Maren walks in on her overworld
     * sprite, then the close up shows her battle art, then the grid
     * sheet when the fight goes to the grid. */
    mapBanner: asset('map_realm.png'),
    entranceSprite: asset('ow_maren.png'),
    battleSprite: asset('b_maren_front.png'),
    gridSprite: asset('g_maren.png'),
    staging: {
      banner: asset('map_realm.png'),
      entranceSprite: asset('ow_maren.png'),
      entranceFrom: 'right',
      closeUpSprite: asset('b_maren_front.png'),
      gridSprite: asset('g_maren.png'),
      portrait: asset('p_maren.png')
    },
    lines: [
      narrate('One of the 13 had appeared on the planet. Mankind, Bondkin, and Wildlife combined for the first time ever to defend their land.'),
      line('maren', 'Maren Saltwright', 'So this is Earth. Small skies. Loud little defenders. I had heard so much more.'),
      narrate('Maren Saltwright stands alone against the whole defense line. Pisces of the 12 zodiacs. The Realm Map member.'),
      line('player', 'Defender', 'Hold the line! Mankind in front! Bondkin, guard the flanks! Wildlife, watch the sky!'),
      line('maren', 'Maren Saltwright', 'Oh, good. You give orders. That makes this fun. Come at me, all of you.'),
      narrate('This mission is unbeatable. It is a mission you cannot beat, a mission you are supposed to lose. It must be clear how powerful he is.')
    ],
    battle: {
      id: 'cold_open_maren',
      kind: 'scripted_loss',
      opponent: 'Maren Saltwright',
      opponentSprite: asset('b_maren_front.png'),
      opponentPortrait: asset('p_maren.png'),
      unbeatable: true,
      scriptedLossTurn: COLD_OPEN_SCRIPTED_LOSS_TURN,
      note: 'The player loses no matter what. On turn 3 the scripted loss plays.'
    },
    next: 'cold_open_farewell'
  });

  defineScene({
    id: 'cold_open_farewell',
    chapter: 1,
    title: 'The Cold Open: I Will Return in One Year',
    location: 'The Realm Map, the defense line',
    background: asset('bg_hall.png'),
    music: 'defense',
    /* COLD OPEN POLISH: the turn 3 loss cinematic, then the farewell
     * transition into creation. White flash, slow fade to black, her
     * lines with her portrait, then the ONE YEAR LATER card. The
     * 1v1 battle plays the same cinematic from this spec when the
     * scripted loss lands. */
    lossCinematic: {
      flash: 'white slow',
      fade: 'black slow 1600ms',
      portrait: asset('p_maren.png'),
      battleSprite: asset('b_maren_front.png')
    },
    transition: { title: 'ONE YEAR LATER', next: 'creation_intro' },
    lines: [
      narrate('Turn 3. Maren Saltwright does not even look tired. The defense line is broken. You are the last one standing, and you cannot stand much longer.'),
      line('maren', 'Maren Saltwright', 'Down. All of you, down. I did not even have to try.'),
      line('maren', 'Maren Saltwright', 'I had fun, little defenders. Real fun. I will return again in one year.'),
      line('maren', 'Maren Saltwright', 'But this time I will not give you a second chance at defeating me. Train. Pray. It will not matter.'),
      narrate('Maren Saltwright is gone. The sky closes behind him like a door.'),
      narrate('One year later.'),
      line('narrator', '', 'One year of waiting. One year of training. One year of remembering his laugh. Now your story begins.')
    ],
    next: 'creation_intro'
  });

  /* ------------------------- */
  /* (2) Creation hook, then   */
  /* school arc, 14th world.   */
  /* ------------------------- */

  defineScene({
    id: 'creation_intro',
    chapter: 2,
    title: 'Creation: One Year Later',
    location: 'The 14th world',
    background: asset('bg_mountain.png'),
    lines: [
      narrate('The 14th world. Before the darkness came to Earth, this world was an oasis. A paradise that looked way too nice and way too perfect, shiny and clean and amazing, not a single flaw anywhere ever.'),
      narrate('Before the cold open, before the school arc, you were only a defender. Now you choose who you are.'),
      line('narrator', '', 'Choose well. Girl or boy, Solar or Polar, path, pronouns, Mankind class, starter bloodline, Grimoire. The year of waiting is the reason the first guild mission matters.')
    ],
    creation: true,
    next: 'family_rival'
  });

  defineScene({
    id: 'family_rival',
    chapter: 2,
    title: 'Family and Rival',
    location: 'Home, the 14th world',
    background: asset('bg_mountain.png'),
    lines: [
      narrate('Home. A small house, too quiet, at the foot of the mountain. Your father is never home. He left this world, the 14th world, for work a long time ago.'),
      line('player', 'You', 'Father sent a letter again. Three lines. Work is fine. The mountain is fine. He never says when he is coming back.'),
      narrate('Your mother passed away, attacked by a wild Wildlife, before tame Wildlife were more common, in the era when wild Wildlife were more dangerous and few were tamed. You have no sibling.'),
      line('player', 'You', 'Mother would have liked the mountain school. She always said I ask too many questions. She was right.'),
      line('rival', 'Sera', 'There you are! I walked all the way up the road and you did not even wave!'),
      narrate('Your rival. Sera. She is madly in love with you, and the whole mountain school knows it except, somehow, you. If you picked a girl at creation, this scene plays with Theo, the male neighbor, madly in love with her instead.'),
      line('rival', 'Sera', 'I am going to be the best trainer on this mountain. Better than you. And one day you will notice. You will!'),
      line('player', 'You', 'Sera, it is barely morning. Can the rivalry wait until after breakfast?'),
      line('rival', 'Sera', 'No! Rivals do not wait! Walk with me to school, slowpoke, or I will tell everyone you are scared of the mountain road.'),
      narrate('You walk with her anyway. That is what rivals are for.')
    ],
    rivalVariant: {
      girl: {
        speaker: 'neighbor',
        speakerName: 'Theo',
        lines: [
          line('neighbor', 'Theo', 'There you are! I walked all the way up the road and you did not even wave!'),
          narrate('Your rival. Theo, the male neighbor. He is madly in love with you, and the whole mountain school knows it except, somehow, you.'),
          line('neighbor', 'Theo', 'I am going to be the best trainer on this mountain. Better than you. And one day you will notice. You will!'),
          line('player', 'You', 'Theo, it is barely morning. Can the rivalry wait until after breakfast?'),
          line('neighbor', 'Theo', 'No! Rivals do not wait! Walk with me to school, slowpoke, or I will tell everyone you are scared of the mountain road.')
        ]
      }
    },
    next: 'school_road_ghoul'
  });

  defineScene({
    id: 'school_road_ghoul',
    chapter: 2,
    title: 'The Mountain Road: The Ghoul and the Kind Wisp',
    location: 'The mountain road, the 14th world',
    background: asset('bg_mountain.png'),
    staging: GHOUL_ENCOUNTER_STAGING,
    onEnter: 'markGhoulEncounter',
    lines: [
      narrate('The mountain road to school. The trees are too still. The birds have gone quiet.', { beat: 0 }),
      line('rival', 'Sera', 'Did you hear that? Something is moving in the trees. Something big.', { beat: 0 }),
      narrate('A Ghoul steps onto the road. Codex 013. A dangerous wild Wildlife.', { beat: 1 }),
      line('ghoul', 'Ghoul', 'Grrrraaah!', { beat: 2 }),
      line('player', 'You', 'Back! Sera, back! It is a Ghoul! Run!', { beat: 2 }),
      line('rival', 'Sera', 'I am not leaving you! Do something!', { beat: 2 }),
      narrate('A light rises out of the trees. Small, soft, gold and white. A kind Wisp, Codex 043, Ghost and Magic, a floating light from the forests and swamps.', { beat: 3 }),
      line('wisp', 'Wisp', 'Little lights, hold still. Brave little trainer, hold still.', { beat: 3 }),
      narrate('The Wisp burns bright and drives the Ghoul off the road, back into the trees. The Ghoul is gone. The road is quiet again.', { beat: 4 }),
      line('wisp', 'Wisp', 'There. Safe now. The mountain keeps its own, little trainer.', { beat: 4 }),
      narrate('The Wisp floats into the trees, and something falls from the branches as it goes. A bag. It lands at your feet.', { beat: 5 }),
      line('rival', 'Sera', 'A bag? The Wisp dropped a bag! Open it! Open it!', { beat: 5 }),
      narrate('The bag falls open. Inside are 3 eggs. A Whelp egg, Codex 002, Fire. A Puk egg, Codex 104, Flying and Dragon. A Mandragora egg, Codex 029, Grass.', { beat: 6 })
    ],
    next: 'egg_choice'
  });

  defineScene({
    id: 'egg_choice',
    chapter: 2,
    title: 'The Bag With 3 Eggs',
    location: 'The mountain road, the 14th world',
    background: asset('bg_mountain.png'),
    lines: [
      narrate('In the bag are 3 eggs. Wildlife starters. A Whelp egg, Codex 002, Fire. A Puk egg, Codex 104, Flying and Dragon. A Mandragora egg, Codex 029, Grass.'),
      line('rival', 'Sera', 'Three eggs! The Wisp left them for you! Pick one, quick, before they get cold!'),
      narrate('Pick one egg. The hatched Wildlife is your starter Wildlife, raised and trained as your first partner.')
    ],
    choice: choice('Pick one egg.', [
      { id: 'whelp', label: 'Whelp egg, Fire', sprite: asset('egg_whelp.png') },
      { id: 'puk', label: 'Puk egg, Flying and Dragon', sprite: asset('egg_puk.png') },
      { id: 'mandragora', label: 'Mandragora egg, Grass', sprite: asset('egg_mandragora.png') }
    ]),
    onChoose: 'setStarterWildlife',
    next: 'grad_hatch'
  });

  /* ------------------------- */
  /* (3) Grad arc.             */
  /* ------------------------- */

  defineScene({
    id: 'grad_hatch',
    chapter: 3,
    title: 'Grad Arc: The Egg Hatches',
    location: 'The mountain school, the 14th world',
    background: asset('bg_mountain.png'),
    lines: [
      narrate('Graduation week. Your egg is warm in your hands. It shakes. Once. Twice. Three times.'),
      line('player', 'You', 'It is moving! Something inside is moving!'),
      narrate('A crack runs across the shell. Then another crack. Light spills out through the cracks.'),
      narrate('A flash of white light fills the room. When it fades, a small Wildlife blinks up at you.'),
      narrate('Your starter Wildlife. Your first partner. It fits in a carry sling, too young to fight yet, and it is already yours.'),
      line('headteacher', 'Headteacher Odo', 'Trainer! That Wildlife does not belong in my classroom! And you do not belong in my school anymore!'),
      line('player', 'You', 'What? But I am graduating!'),
      line('headteacher', 'Headteacher Odo', 'You are dropping out. A trainer with a live Wildlife cannot sit in my school. Out. Now. Take your partner and go.'),
      narrate('So the player drops out of school. The egg hatches, and the school door closes behind you.')
    ],
    /* Hatch beats, in order: shake, crack, flash, reveal. The engine
     * plays them on the hatch screen. The cracked art is per picked
     * egg: egg_cracked_whelp.png, egg_cracked_puk.png, or
     * egg_cracked_mandragora.png. If the cracked art file is missing,
     * the engine draws a procedural crack overlay on the whole egg
     * instead. The reveal shows the hatched Wildlife back sprite
     * (b_whelp_back.png, b_puk_back.png, or b_mandragora_back.png)
     * with its name, Codex number, and type, DS style. The name,
     * Codex number, and type for the picked egg come from
     * hatchReveal(state). After the reveal, the story order goes on
     * to grad_hunter_fail and the hunter exam. */
    hatch: {
      steps: ['shake', 'crack', 'flash', 'reveal'],
      shakeBeats: 3,
      crackArt: 'egg_cracked_<id>.png per picked egg, procedural crack overlay if missing',
      revealArt: 'back sprite per picked egg, name and Codex number and type shown DS style'
    },
    onEnter: 'markEggHatched',
    next: 'grad_hunter_fail'
  });

  defineScene({
    id: 'grad_hunter_fail',
    chapter: 3,
    title: 'Grad Arc: Register as a Monster Hunter, Fail the Test',
    location: 'The hunter registry, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      narrate('No school, no plan, one small Wildlife in a sling. The registry office smells of old paper and older coffee.'),
      line('hunterClerk', 'Clerk Ivo', 'Name? Age? Business? We register monster hunters here, not lost students.'),
      line('player', 'You', 'I want to register as a monster hunter. I have a Wildlife. I can do the work.'),
      line('hunterClerk', 'Clerk Ivo', 'Then take the test. Question one: what do you do when a wild Wildlife charges?'),
      line('player', 'You', 'Uh. Pet it?'),
      line('hunterClerk', 'Clerk Ivo', 'Fail. Next!'),
      narrate('You register as a monster hunter, and you fail the test. The clerk stamps the paper anyway, just to get rid of you.'),
      line('hunterClerk', 'Clerk Ivo', 'Take the hunter exam if you want the permit. Study first. The exam does not forgive guessing.')
    ],
    next: 'hunter_exam'
  });

  /* The hunter exam, staged. One scene per question, so the exam
   * plays as three turns with Clerk Ivo, not one flat block of text.
   * Each question scene asks its question in dialogue, then offers
   * its 3 options as a choice. The engine presents the choice, calls
   * FED13.story.choose to record the answer, shows Ivo's feedback,
   * and moves to the next question. After question 3 the verdict
   * router grades the recorded answers: all 3 true earns the permit,
   * anything less sends the player back to study and retake.
   * The exam data still lives on hunter_exam, so gradeExam is
   * unchanged and the old single-scene exam still grades the same. */

  defineScene({
    id: 'hunter_exam',
    chapter: 3,
    title: 'Grad Arc: The Hunter Exam',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      narrate('The hunter exam hall. Long desks, hard chairs, and Clerk Ivo at the front with a stack of papers and a stamp that has ended many dreams.'),
      line('hunterClerk', 'Clerk Ivo', 'Sit. Hands where I can see them. No shouting answers at your Wildlife.'),
      line('hunterClerk', 'Clerk Ivo', 'Three questions, trainer. Answer true, or go back to school. Three true answers and the permit is yours. One wrong answer and you study again and take it over.'),
      line('player', 'You', 'Three questions. I studied. I know this. I know this.'),
      line('hunterClerk', 'Clerk Ivo', 'Then prove it. First question.')
    ],
    exam: {
      id: 'hunter_exam',
      passScore: 3,
      questions: [
        {
          id: 'q1_bank',
          prompt: 'What is the bank called, where Wildlife are kept and trained?',
          options: [
            { id: 'monster_bank', label: 'The Monster Bank' },
            { id: 'wild_bank', label: 'The Wild Bank' },
            { id: 'pet_bank', label: 'The Pet Bank' }
          ],
          answer: 'monster_bank',
          explain: 'The bank is the Monster Bank, never Wild Bank.'
        },
        {
          id: 'q2_king',
          prompt: 'Who sits above The Thirteen as the 14th?',
          options: [
            { id: 'malachar', label: 'King Malachar Duskspire' },
            { id: 'maren', label: 'Maren Saltwright' },
            { id: 'warden', label: 'A Lumen Warden' }
          ],
          answer: 'malachar',
          explain: 'King Malachar Duskspire sits above The Thirteen as the 14th.'
        },
        {
          id: 'q3_bondkin',
          prompt: 'A Bondkin has sense: speech, memory, and the power to choose. How does a Bondkin join a trainer?',
          options: [
            { id: 'asks', label: 'The Bondkin asks to join. The trainer never hunts them.' },
            { id: 'hunts', label: 'The trainer hunts the Bondkin down.' },
            { id: 'buys', label: 'The trainer buys the Bondkin at market.' }
          ],
          answer: 'asks',
          explain: 'Bondkin ask to join. The trainer never hunts them.'
        }
      ]
    },
    next: 'hunter_exam_q1'
  });

  defineScene({
    id: 'hunter_exam_q1',
    chapter: 3,
    title: 'Grad Arc: Exam Question 1 of 3',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('hunterClerk', 'Clerk Ivo', 'Question one. What is the bank called, where Wildlife are kept and trained?'),
      line('player', 'You', 'The bank... the bank where Wildlife are kept and trained. I know this one.')
    ],
    examQuestion: 'q1_bank',
    choice: choice('What is the bank called?', [
      { id: 'monster_bank', label: 'The Monster Bank' },
      { id: 'wild_bank', label: 'The Wild Bank' },
      { id: 'pet_bank', label: 'The Pet Bank' }
    ]),
    onChoose: 'answerExamQuestion',
    next: 'hunter_exam_q2'
  });

  defineScene({
    id: 'hunter_exam_q2',
    chapter: 3,
    title: 'Grad Arc: Exam Question 2 of 3',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('hunterClerk', 'Clerk Ivo', 'Question two. Who sits above The Thirteen as the 14th?'),
      line('player', 'You', 'Above The Thirteen... the 14th. Think. The whole mountain knows this name.')
    ],
    examQuestion: 'q2_king',
    choice: choice('Who sits above The Thirteen as the 14th?', [
      { id: 'malachar', label: 'King Malachar Duskspire' },
      { id: 'maren', label: 'Maren Saltwright' },
      { id: 'warden', label: 'A Lumen Warden' }
    ]),
    onChoose: 'answerExamQuestion',
    next: 'hunter_exam_q3'
  });

  defineScene({
    id: 'hunter_exam_q3',
    chapter: 3,
    title: 'Grad Arc: Exam Question 3 of 3',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('hunterClerk', 'Clerk Ivo', 'Last question. A Bondkin has sense: speech, memory, and the power to choose. How does a Bondkin join a trainer?'),
      line('player', 'You', 'Last one. Speech, memory, and the power to choose. How do they join?')
    ],
    examQuestion: 'q3_bondkin',
    choice: choice('How does a Bondkin join a trainer?', [
      { id: 'asks', label: 'The Bondkin asks to join. The trainer never hunts them.' },
      { id: 'hunts', label: 'The trainer hunts the Bondkin down.' },
      { id: 'buys', label: 'The trainer buys the Bondkin at market.' }
    ]),
    onChoose: 'answerExamQuestion',
    next: 'hunter_exam_verdict'
  });

  defineScene({
    id: 'hunter_exam_verdict',
    chapter: 3,
    title: 'Grad Arc: The Verdict',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    router: true,
    routeTo: function (state) {
      var result = examVerdict(state);
      return result && result.passed ? 'hunter_permit' : 'hunter_exam_retry';
    },
    lines: [
      narrate('Clerk Ivo counts the marks on your paper, twice, like he hopes he misread them.')
    ],
    next: 'hunter_permit'
  });

  defineScene({
    id: 'hunter_exam_retry',
    chapter: 3,
    title: 'Grad Arc: Fail the Exam, Study Again',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('hunterClerk', 'Clerk Ivo', 'Wrong. One wrong answer is one too many. The permit is not for guessers.'),
      line('player', 'You', 'I... I will study. I will be back.'),
      line('hunterClerk', 'Clerk Ivo', 'Study first. The exam does not forgive guessing. The bank is the Monster Bank, the king above The Thirteen is King Malachar Duskspire, and Bondkin ask to join. Learn it cold, then come back.'),
      narrate('You failed the hunter exam. Study, then take it again.')
    ],
    next: 'hunter_exam'
  });

  /* The permit award, its own moment. The old build folded the permit
   * and the guild into one scene; they are two beats now. The stamp
   * lands here, in the exam hall, before the player ever reaches
   * the guild hall. */

  defineScene({
    id: 'hunter_permit',
    chapter: 3,
    title: 'Grad Arc: The Permit',
    location: 'The hunter exam hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      narrate('Three answers, all true. The clerk blinks at the paper like it has insulted him.'),
      line('hunterClerk', 'Clerk Ivo', 'Huh. Three out of three. Fine.'),
      narrate('Clerk Ivo takes a brass stamp from his drawer, inks it slow, and brings it down on your paper with a thud that echoes off the hall walls.'),
      line('hunterClerk', 'Clerk Ivo', 'Hunter permit. Stamped, signed, and sealed. Do not make me regret it.'),
      narrate('The permit is yours. Your name, your Wildlife, and the stamp of the hunter registry, all on one paper.'),
      line('player', 'You', 'A permit. My permit. I am a licensed hunter now.'),
      line('hunterClerk', 'Clerk Ivo', 'Licensed to hunt wild Wildlife, not to pet them. Now go. The guild hall is down the road, and Guild Clerk Petra is waiting on your signature.')
    ],
    fx: ['sparkle'],
    onEnter: 'grantHunterPermit',
    next: 'guild_register'
  });

  /* Guild registration, its own scene. Guild Clerk Petra checks the
   * permit, Guildmaster Bram Hollis welcomes the trainer, and the
   * player picks the road: register with the guild, or register with
   * the hiring bazaar across the square. Both roads make the player
   * a monster trainer. The choice hook records which road was picked,
   * and the done router plays the matching closing scene. */

  defineScene({
    id: 'guild_register',
    chapter: 3,
    title: 'Grad Arc: Register With a Bazaar or Guild',
    location: 'The guild hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      narrate('The guild hall. Banners, job boards, and the smell of fresh ink. Guild Clerk Petra waits at the long desk with two ledgers open.'),
      line('guildClerk', 'Guild Clerk Petra', 'Permit, please. Good. Stamped by Ivo himself. That almost never happens on the first pass.'),
      line('player', 'You', 'I want to register to become a monster trainer.'),
      line('guildClerk', 'Guild Clerk Petra', 'Then you register here, with the guild, or with the hiring bazaar across the square. Same permit, different road. The guild posts missions. The bazaar posts hire work. Pick one.'),
      narrate('A tall man in a blue coat with gold trim steps out of the back office. Every clerk in the hall stands a little straighter.'),
      line('guildmaster', 'Guildmaster Bram Hollis', 'Trainer. Petra tells me you passed Ivo on the first pass. Ivo fails everyone on the first pass. So either you studied, or you are lucky. Which is it?'),
      line('player', 'You', 'I studied, Guildmaster.'),
      line('guildmaster', 'Guildmaster Bram Hollis', 'Good answer. Luck runs out. Study does not. Petra, sign the trainer up.')
    ],
    choice: choice('Register with the guild, or with the hiring bazaar?', [
      { id: 'guild', label: 'Register with the guild' },
      { id: 'bazaar', label: 'Register with the hiring bazaar' }
    ]),
    onChoose: 'registerTrainer',
    next: 'guild_register_done'
  });

  defineScene({
    id: 'guild_register_done',
    chapter: 3,
    title: 'Grad Arc: Registered',
    location: 'The guild hall, the 14th world',
    background: asset('bg_hall.png'),
    router: true,
    routeTo: function (state) {
      if (state && state.flags && state.flags.bazaarRegistered) {
        return 'guild_register_bazaar';
      }
      return 'guild_register_guild';
    },
    lines: [
      narrate('Guild Clerk Petra opens the right ledger and turns it toward you.')
    ],
    next: 'guild_register_guild'
  });

  defineScene({
    id: 'guild_register_guild',
    chapter: 3,
    title: 'Grad Arc: Monster Trainer, Guild Road',
    location: 'The guild hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('guildClerk', 'Guild Clerk Petra', 'Sign here, and here. Welcome to the guild, monster trainer.'),
      line('player', 'You', 'Monster trainer. That sounds right. Better than monster breeder, better than monster bank clerk. That is not a lucrative position at all.'),
      line('guildmaster', 'Guildmaster Bram Hollis', 'Trainer it is. Your Wildlife rides in a sling until it can fight. Keep it fed, keep it close, and keep your eyes on the road down.'),
      line('guildClerk', 'Guild Clerk Petra', 'Your name is on the guild board now. Missions, pay, and the road to Saltquay. That is the guild road.'),
      narrate('The career ladder is climbed: egg, hatch, drop out, register, fail, exam, permit, guild, monster trainer. You are a monster trainer now.')
    ],
    gradArcEnd: true,
    next: 'road_down_gate'
  });

  defineScene({
    id: 'guild_register_bazaar',
    chapter: 3,
    title: 'Grad Arc: Monster Trainer, Bazaar Road',
    location: 'The guild hall, the 14th world',
    background: asset('bg_hall.png'),
    lines: [
      line('guildClerk', 'Guild Clerk Petra', 'The bazaar road it is. Same permit, different ledger. Sign here, and here.'),
      line('guildClerk', 'Guild Clerk Petra', 'The broker across the square will stamp your hire papers. Hire work, day pay, and no guild board. You are a monster trainer either way.'),
      line('player', 'You', 'Monster trainer. That sounds right. Better than monster breeder, better than monster bank clerk. That is not a lucrative position at all.'),
      line('guildmaster', 'Guildmaster Bram Hollis', 'A trainer is a trainer, guild or bazaar. Your Wildlife rides in a sling until it can fight. Keep it fed, keep it close, and keep your eyes on the road down.'),
      narrate('The career ladder is climbed: egg, hatch, drop out, register, fail, exam, permit, bazaar, monster trainer. You are a monster trainer now.')
    ],
    gradArcEnd: true,
    next: 'road_down_gate'
  });

  /* ------------------------- */
  /* (4) The road down.        */
  /* ------------------------- */

  /* Polar variant: getScene returns a Dreamrest copy of this scene
   * (roadDownGateScene) for a Polar player, so this Solar definition
   * below stays exactly as it is. */
  defineScene({
    id: 'road_down_gate',
    chapter: 4,
    title: 'The Road Down: The Gatehollow Gate Seals',
    location: 'The Gatehollow Gate, the 14th world',
    background: asset('map_gatehollow.png'),
    cinematic: 'gateSeal',
    cinematicData: ROAD_DOWN.gateSeal,
    onEnter: 'sealGate',
    lines: [
      narrate('You leave the 14th world on foot, down the pilgrim road from the Gatehollow Gate at the foot of the mountain to the Realm Map road to Cragfall.'),
      line('player', 'You', 'One bag. One permit. One small Wildlife in a sling. And one year of waiting behind me.'),
      narrate('The Gatehollow Gate is the old land gate between the 14th world and the Realm Map. You step through it, and it seals behind you.'),
      narrate('Behind you, stone grinds on stone. The light narrows to a line, then to nothing. The gate seals.'),
      line('player', 'You', 'It sealed. The gate sealed behind me.'),
      narrate('That sealing is why the 14th world stays locked for the rest of the game until after the Hall of Fame, and why the return after the Hall of Fame is a return, not a first visit.'),
      line('player', 'You', 'Maren Saltwright. One million Cr. I set off from the 14th world to train and work at taking the 1 million quest. The training starts now.')
    ],
    fx: ['shield'],
    next: 'road_down_walk'
  });

  defineScene({
    id: 'road_down_walk',
    chapter: 4,
    title: 'The Road Down: The Pilgrim Road Walk',
    location: 'The pilgrim road, Gatehollow Gate to Cragfall',
    background: asset('map_road.png'),
    walk: 'roadWalk',
    walkData: ROAD_DOWN.roadWalk,
    onEnter: 'markRoadWalkDone',
    lines: [
      narrate('The pilgrim road runs straight and steep. You walk it on foot, step by step, south toward Cragfall. Your trainer sprite walks the center path, tall grass on both sides.'),
      narrate('Tall grass on both sides. Wild Wildlife walk in the open here. There are no surprise attacks.'),
      line('player', 'You', 'Cragfall first, then Saltquay harbor. One road, one direction, no way back.'),
      narrate('Cragfall lies ahead, then Saltquay harbor. The training on this road is what prepares you for Main Mission 1.'),
      line('player', 'You', 'Last slope. Salt wind on the air now. The harbor gate at dawn is close.')
    ],
    next: 'prologue_solar'
  });

  /* ------------------------- */
  /* (5) Prologue, Realm Map.  */
  /* Mankind only combat.      */
  /* ------------------------- */

  defineScene({
    id: 'prologue_solar',
    chapter: 5,
    title: 'Prologue: Emberdeep',
    location: 'Emberdeep, the Realm Map',
    background: asset('bg_hall.png'),
    race: 'solar',
    lines: [
      narrate('The prologue plays on the Realm Map, after the school arc. Solar players start in Emberdeep, a dark robed hood underground, hiding from the polar faction.'),
      narrate('The prologue is Mankind only combat, using Crafts. No Bondkin fights in the prologue. No Wildlife catching in the prologue.'),
      line('player', 'You', 'Emberdeep. Hood up, head down. The polar faction hunts Solar down here, and I am Solar.'),
      narrate('Your starter Wildlife sleeps in its carry sling, too young to fight. It travels with you, and it does not fight. Its first battles come later, on the road to Saltquay.'),
      line('player', 'You', 'Sleep, little one. I will fight this part alone. Mankind only. That is the rule down here.')
    ],
    prologue: { race: 'solar', start: 'Emberdeep', combat: 'mankind_only_crafts' },
    next: 'prologue_proofs_solar'
  });

  defineScene({
    id: 'prologue_polar',
    chapter: 5,
    title: 'Prologue: Frostvein Hold',
    location: 'Frostvein Hold, the Realm Map',
    background: asset('bg_mountain.png'),
    race: 'polar',
    lines: [
      narrate('The prologue plays on the Realm Map, after the school arc. Polar players start in Frostvein Hold, as part of a glacial tribe that fears their homes will melt, sending warriors to appease the sun god.'),
      narrate('The prologue is Mankind only combat, using Crafts. No Bondkin fights in the prologue. No Wildlife catching in the prologue.'),
      line('player', 'You', 'Frostvein Hold. The ice is thin this year. The tribe says the sun god is angry. I am not sure the sun god is the problem.'),
      narrate('Your starter Wildlife sleeps in its carry sling, too young to fight. It travels with you, and it does not fight. Its first battles come later, on the road to Saltquay.'),
      line('player', 'You', 'Sleep, little one. I will fight this part alone. Mankind only. That is the rule up here.')
    ],
    prologue: { race: 'polar', start: 'Frostvein Hold', combat: 'mankind_only_crafts' },
    next: 'prologue_proofs_polar'
  });

  defineScene({
    id: 'prologue_proofs_solar',
    chapter: 5,
    title: 'Prologue: First Proofs, Solar Road',
    location: 'The Solar road, the Realm Map',
    background: asset('bg_grass.png'),
    race: 'solar',
    lines: [
      narrate('In the prologue you meet the Lumen Wardens for the first time: Warden Mirelle Voss with her Echo Wisp on the Solar side.'),
      line('mirelle', 'Warden Mirelle Voss', 'Trainer. Stop. You walk into a war that was built, not born. Look, and I will show you the proof.'),
      line('mirelle', 'Warden Mirelle Voss', 'First proof: a sealed Hollow pen under Emberdeep. Forced Hollow Wildlife, locked away where no one looks.'),
      line('mirelle', 'Warden Mirelle Voss', 'Second proof: the Saltquay Proof. Third: the taint in the meltwater. Fourth: the Thirteen brand under the soot at the burned storehouse.'),
      line('player', 'You', 'The Solar and Polar war is stoked, not natural. Someone wants us fighting each other.'),
      line('mirelle', 'Warden Mirelle Voss', 'Yes. Remember that when someone tells you the other side started it.'),
      narrate('You meet the other side for the first time on the Solar road: Kessa Frostmark. She survives the prologue, and she returns later.'),
      line('kessa', 'Kessa Frostmark', 'Solar. I should fight you. But my blade is tired of orders that make no sense. Go. We will meet again.'),
      narrate('The prologue ends at Saltquay, at the harbor gate at dawn. You are Mankind level 5 on arrival.')
    ],
    onEnter: 'setPrologueLevel5',
    next: 'road_to_saltquay'
  });

  defineScene({
    id: 'prologue_proofs_polar',
    chapter: 5,
    title: 'Prologue: First Proofs, Polar Pass',
    location: 'The Polar pass, the Realm Map',
    background: asset('bg_mountain.png'),
    race: 'polar',
    lines: [
      narrate('In the prologue you meet the Lumen Wardens for the first time: Warden Wren Hallowlight with her Echo Ghost Vigil on the Polar side.'),
      line('wren', 'Warden Wren Hallowlight', 'Trainer. Stop. You walk into a war that was built, not born. Look, and I will show you the proof.'),
      line('wren', 'Warden Wren Hallowlight', 'First proof: a sealed Hollow pen under Emberdeep. Forced Hollow Wildlife, locked away where no one looks.'),
      line('wren', 'Warden Wren Hallowlight', 'Second proof: the Saltquay Proof. Third: the taint in the meltwater. Fourth: the Thirteen brand under the soot at the burned storehouse.'),
      line('player', 'You', 'The Solar and Polar war is stoked, not natural. Someone wants us fighting each other.'),
      line('wren', 'Warden Wren Hallowlight', 'Yes. Remember that when someone tells you the other side started it.'),
      narrate('You meet the other side for the first time on the Polar pass: Dara Sunbrand. She survives the prologue, and she returns later.'),
      line('dara', 'Dara Sunbrand', 'Polar. I should fight you. But my blade is tired of orders that make no sense. Go. We will meet again.'),
      narrate('The prologue ends at Saltquay, at the harbor gate at dawn. You are Mankind level 5 on arrival.')
    ],
    onEnter: 'setPrologueLevel5',
    next: 'road_to_saltquay'
  });

  /* ------------------------- */
  /* (6) Road to Saltquay:     */
  /* first 1v1 battles.        */
  /* ------------------------- */

  defineScene({
    id: 'road_to_saltquay',
    chapter: 6,
    title: 'The Road to Saltquay: First Battles',
    location: 'The road to Saltquay, the Realm Map',
    background: asset('bg_grass.png'),
    lines: [
      narrate('The road to Saltquay. Tall grass, open sky, and wild Wildlife on the field, visible, no random encounters.'),
      narrate('Your starter Wildlife is out of the sling now. Old enough to fight. This is its first battle.'),
      line('player', 'You', 'Ready, little one? First battle. Just us. One on one.'),
      narrate('On the road to Saltquay, after the prologue, you battle with the hatched egg Wildlife in 1v1 battles. Trial Battle 1 is still ahead. These battles are how you get there.'),
      line('player', 'You', 'Good. You are learning fast. One more patch of grass, then the harbor gate at dawn.')
    ],
    battles: [
      {
        id: 'road_1v1_first',
        kind: 'wildlife_1v1',
        note: 'First 1v1 battle with the hatched Wildlife. The starter fights alone here.'
      },
      {
        id: 'road_1v1_second',
        kind: 'wildlife_1v1',
        note: 'Second 1v1 battle on the road to Saltquay.'
      },
      {
        id: 'road_1v1_third',
        kind: 'wildlife_1v1',
        note: 'Third 1v1 battle on the road to Saltquay.'
      }
    ],
    next: 'saltquay_arrival'
  });

  /* ------------------------- */
  /* (6b) Saltquay arrival.    */
  /* ADV-ROAD: harbor gate at  */
  /* dawn, then the first guild */
  /* board sighting.           */
  /* ------------------------- */

  defineScene({
    id: 'saltquay_arrival',
    chapter: 6,
    title: 'Saltquay Arrival: The Harbor Gate at Dawn',
    location: 'Saltquay, the harbor gate at dawn',
    background: asset('bg_harbor.png'),
    cinematic: 'saltquayArrival',
    cinematicData: ROAD_DOWN.saltquayArrival,
    onEnter: 'markSaltquayArrival',
    lines: [
      narrate('Saltquay harbor gate, at dawn. Mankind level 5. Gulls, salt air, and the harbor spread out below the gate. You made it.'),
      line('player', 'You', 'Saltquay. After the mountain, after the road, after the prologue. I am here.'),
      narrate('Your starter Wildlife rides out of its sling now, old enough to fight, and your arc Bondkin waits somewhere in this town.'),
      line('player', 'You', 'First, the guild hall. The board is already posted. Let me see what Saltquay is hiring for.')
    ],
    next: 'saltquay_guild_board_sighting'
  });

  defineScene({
    id: 'saltquay_guild_board_sighting',
    chapter: 6,
    title: 'First Guild Board Sighting',
    location: 'Saltquay guild hall steps',
    background: asset('bg_harbor.png'),
    guildBoardSighting: ROAD_DOWN.guildBoardSighting,
    onEnter: 'markGuildBoardSeen',
    lines: [
      narrate('The guild hall steps. A posted copy of the job board hangs by the door, where every trainer walking in can read it.'),
      line('guildClerk', 'Guild Clerk Petra', 'That posted copy is real, trainer. Read the top card. It sits there in gold ink.'),
      line('player', 'You', 'Main Mission 1. Takedown of Maren Saltwright. Reward: 1,000,000 Cr.'),
      line('guildClerk', 'Guild Clerk Petra', 'Same man that beat you in the cold open. The full board is inside when you are ready to take it.'),
      line('player', 'You', 'I am ready. After the Monster Bank, I am taking that card.'),
      narrate('The first guild board sighting. The 1,000,000 Cr card is seen here, before the Monster Bank stop, and it is taken later on the full job board.')
    ],
    next: 'monster_bank_stop'
  });

  /* ------------------------- */
  /* (7) Monster Bank stop.    */
  /* ------------------------- */

  defineScene({
    id: 'monster_bank_stop',
    chapter: 7,
    title: 'Monster Bank Stop: Broker Voss Explains the Bank',
    location: 'The Monster Bank, Saltquay branch',
    background: asset('bg_hall.png'),
    lines: [
      narrate('Saltquay is close now. First, the Monster Bank branch on the road. A broad Mankind in a broad apron waves you in.'),
      line('brokerVoss', 'Broker Voss', 'Trainer! First time at the Monster Bank? Come in, come in. I am Broker Voss, and this is my branch.'),
      line('player', 'You', 'What does the bank do, exactly?'),
      line('brokerVoss', 'Broker Voss', 'The Monster Bank keeps your Wildlife safe. You store Wildlife here, you train them here, you pick your team of six here.'),
      line('brokerVoss', 'Broker Voss', 'Think of it like a daycare and a bank in one building. Your Wildlife rest, grow, and wait for you, and you take them out when you need them.'),
      line('brokerVoss', 'Broker Voss', 'There is a branch in every town and a post in every village. Same rules everywhere. The bank is the Monster Bank, never Wild Bank. Remember that and we will get along.'),
      line('brokerVoss', 'Broker Voss', 'The roster holds 24 Wildlife, and the deploy team holds 6. Pick your six here, and the rest wait in the pens, safe and warm.'),
      line('brokerVoss', 'Broker Voss', 'I buy Wildlife too. Three sales a day, no more. I pay in Crests at once, and a sold Wildlife is gone forever. No buyback, no reclaim.'),
      line('player', 'You', 'Gone forever? Even the rare ones?'),
      line('brokerVoss', 'Broker Voss', 'Even the rare ones. Starters and story Wildlife are never for sale, and I do not buy Common Wildlife at all. A Wildlife on your deploy team must come off the team before I can buy it.'),
      line('brokerVoss', 'Broker Voss', 'Every sale needs two confirms, and the price is set by rarity, Stage, level, variant, and fusion. The wallet holds 999,999 Cr at most, so spend first if your purse is full.'),
      line('player', 'You', 'And the team? How many can I carry?'),
      line('brokerVoss', 'Broker Voss', 'Six on your team, trainer. The rest wait here, safe and warm. Now go on. Saltquay is waiting, and so is your future.'),
      narrate('The Monster Bank is explained. Your Wildlife has a home on the road now, in every town you reach.')
    ],
    onEnter: 'unlockMonsterBank',
    next: 'saltquay_arc_meeting'
  });

  /* ------------------------- */
  /* (8) Saltquay arc opening. */
  /* One scene per bloodline,   */
  /* built from BLOODLINES.    */
  /* ------------------------- */

  function arcBondkinSpeakerKey(bloodlineId) {
    return 'bondkin';
  }

  /* Article from first sound: an before a vowel sound, a otherwise.
   * Elf and Elderkin take an; Puffkin, Harefolk and Drakescale take a. */
  function articleFor(word) {
    if (!word) {
      return 'a';
    }
    var first = word.charAt(0).toLowerCase();
    return 'aeiou'.indexOf(first) !== -1 ? 'an' : 'a';
  }

  function buildArcMeetingScene(bloodline) {
    var name = NAMES_DRAFT.arcBondkin[bloodline.id];
    var portraitKey = 'bondkin' + bloodline.name;
    return {
      id: 'saltquay_arc_meeting_' + bloodline.id,
      chapter: 8,
      title: 'Saltquay Arc Opening: ' + name + ' of the ' + bloodline.name,
      location: 'Saltquay, the harbor',
      background: asset('bg_harbor.png'),
      bloodline: bloodline.id,
      lines: [
        narrate('Saltquay. The harbor gate at dawn. Gulls, salt air, and a Bondkin waiting by the harbor wall like it has been waiting all year.'),
        line('bondkin', name + ' of the ' + bloodline.name, bloodline.greeting),
        line('player', 'You', 'You are ' + articleFor(bloodline.name) + ' ' + bloodline.name + ' Bondkin. My starter bloodline. I picked it at creation, a year ago, before I even knew your name.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'And I have been waiting for the trainer who picked us. The ' + bloodline.name + ' arc starts here, with you. I am ' + name + '.'),
        narrate('In Saltquay you meet the arc Bondkin, the Bondkin of the starter bloodline picked at creation. The arc opening plays in Saltquay, and the arc Bondkin joins as the arc partner.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'Your Wildlife is brave, but it is young, and the road ahead is not. Walk with me. Fight beside me. Let me lend a hand.'),
        line('player', 'You', 'Then walk with me, ' + name + '. The harbor, the road, all of it. Together.')
      ],
      portraitOverride: { bondkin: PORTRAITS[portraitKey] || bloodline.portrait },
      next: 'saltquay_first_grid_' + bloodline.id
    };
  }

  function buildFirstGridScene(bloodline) {
    var name = NAMES_DRAFT.arcBondkin[bloodline.id];
    var portraitKey = 'bondkin' + bloodline.name;
    return {
      id: 'saltquay_first_grid_' + bloodline.id,
      chapter: 8,
      title: 'First Grid Battle: The Arc Bondkin Lends a Hand',
      location: 'Saltquay, the harbor yard',
      background: asset('bg_harbor.png'),
      bloodline: bloodline.id,
      lines: [
        narrate('The first group battle comes, and the arc Bondkin lends a hand, fighting beside your Wildlife. That group battle is your first grid battle.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'Beside me, little one. I will hold the line. You strike when I say.'),
        line('player', 'You', 'Grid battle. First one. ' + name + ', left flank. Little one, right. On my mark.'),
        narrate('You fight the group battle on the grid, your hatched Wildlife and the arc Bondkin side by side. This is the trainer\'s first grid battle.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'We did it. Together. You fight well, trainer. Your Wildlife fights well too.'),
        narrate('The battle is won. The arc Bondkin looks at you, and you can see the question coming before it is asked.')
      ],
      battle: {
        id: 'saltquay_first_grid',
        kind: 'grid',
        note: 'First grid battle. The arc Bondkin lends a hand beside the hatched Wildlife.',
        deploy: ['starterWildlife', 'arcBondkin']
      },
      portraitOverride: { bondkin: PORTRAITS[portraitKey] || bloodline.portrait },
      next: 'saltquay_asking_' + bloodline.id
    };
  }

  function buildAskingScene(bloodline) {
    var name = NAMES_DRAFT.arcBondkin[bloodline.id];
    var portraitKey = 'bondkin' + bloodline.name;
    return {
      id: 'saltquay_asking_' + bloodline.id,
      chapter: 8,
      title: 'The Asking: ' + name + ' Asks to Join',
      location: 'Saltquay, the harbor yard',
      background: asset('bg_harbor.png'),
      bloodline: bloodline.id,
      lines: [
        line('bondkin', name + ' of the ' + bloodline.name, 'Trainer. I have fought beside you now. I know how you fight, and I know how you treat your Wildlife.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'So I am asking, the way Bondkin ask. Will you let me join your party?'),
        narrate('After the battle the arc Bondkin asks to join the trainer\'s party, by the asking rule: Bondkin ask to join, the trainer never hunts them.'),
        line('player', 'You', 'Yes. Yes, ' + name + '. Join us. One Wildlife and one Bondkin. That is our party now.'),
        line('bondkin', name + ' of the ' + bloodline.name, 'Then it is settled. I travel with you from here. The ' + bloodline.name + ' arc is ours now.'),
        narrate('Early in the game the trainer has one Wildlife and one Bondkin, and the two travel together from here.')
      ],
      portraitOverride: { bondkin: PORTRAITS[portraitKey] || bloodline.portrait },
      onEnter: 'addArcBondkinToParty',
      next: 'party_screen'
    };
  }

  BLOODLINES.forEach(function (bloodline) {
    defineScene(buildArcMeetingScene(bloodline));
    defineScene(buildFirstGridScene(bloodline));
    defineScene(buildAskingScene(bloodline));
  });

  /* Saltquay arc opening, router scene. The engine jumps from here to
   * the meeting scene for the starter bloodline picked at creation. */
  defineScene({
    id: 'saltquay_arc_meeting',
    chapter: 8,
    title: 'Saltquay Arc Opening',
    location: 'Saltquay, the harbor gate at dawn',
    background: asset('bg_harbor.png'),
    router: true,
    routeTo: function (state) {
      return 'saltquay_arc_meeting_' + String(state.starterBloodline || 'elf').toLowerCase();
    },
    lines: [
      narrate('Saltquay, at the harbor gate at dawn. You are Mankind level 5 on arrival. Your arc Bondkin is waiting.')
    ],
    next: 'party_screen'
  });

  defineScene({
    id: 'party_screen',
    chapter: 8,
    title: 'Party Screen: One Wildlife and One Bondkin',
    location: 'Saltquay',
    background: asset('bg_harbor.png'),
    lines: [
      narrate('Party screen. One Wildlife and one Bondkin. The hatched egg Wildlife you raised from the mountain road, and the arc Bondkin who asked to join in Saltquay.'),
      line('player', 'You', 'Two partners. That is the whole party, and it is enough. For now.'),
      narrate('From here the hatched egg Wildlife and the arc Bondkin travel together. The road, the guild, and the job board are next.')
    ],
    partyScreen: true,
    next: 'job_board_mm1'
  });

  /* ------------------------- */
  /* (9) Main Mission 1.       */
  /* ------------------------- */

  var MAIN_MISSION_1 = {
    id: 'main_mission_1',
    title: 'Main Mission 1: Takedown of Maren Saltwright',
    board: 'Saltquay guild job board',
    target: 'Maren Saltwright',
    targetRole: 'Pisces of the 12 zodiacs, the Realm Map member',
    targetPortrait: asset('p_maren.png'),
    targetSprite: asset('b_maren_front.png'),
    rewardCr: MISSION_1_REWARD,
    walletCapCr: WALLET_CAP,
    rewardNote: 'The 1,000,000 Cr bounty is the one reward allowed to land the wallet at 1,000,000 Cr, one Cr above the 999,999 Cr cap. After it lands, the wallet holds 1,000,000 Cr until the player spends, and no further Cr gain lands until the wallet is below 999,999 Cr.',
    trialBattle: 1,
    location: 'Saltquay harbor hall',
    card: {
      rank: 'Main Mission 1',
      heading: 'TAKEDOWN: MAREN SALTWRIGHT',
      body: 'One of the 13. Pisces. The Realm Map member. He defeated our defense a year ago and promised to return. He is here. End him.',
      reward: '1,000,000 Cr',
      postedBy: 'Saltquay Guild',
      /* DS card presentation. The engine draws this card on the guild
       * board: portrait top left, bounty in large gold type, mission
       * text below, fine print on the bottom screen. */
      seal: 'ONE OF THE 13',
      zodiac: 'Pisces',
      targetRoleShort: 'Pisces of the 12 zodiacs',
      placeShort: 'Realm Map member',
      danger: 'He beat the whole defense a year ago and promised to return.',
      lines: [
        'One of the 13. Pisces. The Realm Map member.',
        'He defeated our defense a year ago and promised to return. He is here.',
        'End him. Take back the harbor.'
      ],
      stakes: 'Beat Maren to break the harbor Hollow pen under Saltquay, free its forced Hollow Wildlife from collar control, and open the first sky lane.',
      location: 'Saltquay harbor hall',
      trial: 'Trial Battle 1',
      finePrint: 'The 1,000,000 Cr bounty is the one reward allowed to land the wallet at 1,000,000 Cr, one Cr above the 999,999 Cr cap. No Cr is lost. After it lands, no further Cr gain lands until the wallet is below 999,999 Cr.',
      acceptLabel: 'Accept the mission',
      finePrintLabel: 'Read the fine print',
      declineLabel: 'Walk away for now'
    }
  };

  defineScene({
    id: 'job_board_mm1',
    chapter: 9,
    title: 'Main Mission 1: The Guild Job Board',
    location: 'Saltquay guild job board',
    background: asset('bg_hall.png'),
    lines: [
      narrate('You set off from the 14th world to train and work at taking the 1 million quest, and the training and work on the road down is what prepares you to take it here. This is when you train and do missions and travel.'),
      narrate('Then you hear it. People are going on a mission to take down a 13 member. And it is the same man that defeated you.'),
      line('player', 'You', 'The job board. First card. Let me see it.'),
      narrate('The game starts out insane because the first mission quest on the guild job board is to take down a 13 member, and the gold is 1,000,000 Cr.'),
      line('guildClerk', 'Guild Clerk Petra', 'Read it out loud, trainer. So the whole hall hears it.'),
      line('player', 'You', 'Main Mission 1. Takedown of Maren Saltwright. Reward: 1,000,000 Cr.'),
      narrate('Silence in the hall. Then every head turns toward you. They all remember the defense line. They all remember the year of waiting.'),
      line('player', 'You', 'It is him. The same man that defeated me in the cold open. I am taking this mission.')
    ],
    jobBoardCard: MAIN_MISSION_1,
    onEnter: 'viewMainMission1Card',
    choice: choice('Take Main Mission 1?', [
      { id: 'accept', label: 'Accept the mission' },
      { id: 'decline', label: 'Walk away for now' }
    ]),
    onChoose: 'chooseMainMission1',
    next: 'mm1_accept'
  });

  defineScene({
    id: 'mm1_accept',
    chapter: 9,
    title: 'Main Mission 1: Accept the Mission',
    location: 'Saltquay guild hall',
    background: asset('bg_hall.png'),
    lines: [
      line('guildClerk', 'Guild Clerk Petra', 'Done. Your name is on the card now. Main Mission 1 is yours.'),
      line('player', 'You', 'I am sure. He beat me once. He said he would return in one year and give us no second chance. This is my second chance anyway.'),
      line('guildClerk', 'Guild Clerk Petra', 'Then take it. Main Mission 1. The Saltquay harbor hall. Take your Wildlife and your Bondkin, and finish it.'),
      narrate('Main Mission 1 is Trial Battle 1. You fight Maren Saltwright in the Saltquay harbor hall, with the hatched Wildlife and the arc Bondkin beside you.'),
      line('player', 'You', 'Maren Saltwright. One year later. This time I am not the last one standing alone.'),
      narrate('Beating Maren breaks the harbor Hollow pen under Saltquay, frees its forced Hollow Wildlife from collar control, and opens the first sky lane. The story continues from Trial Battle 1.')
    ],
    battle: {
      id: 'trial_battle_1',
      kind: 'trial',
      trialNumber: 1,
      opponent: 'Maren Saltwright',
      opponentSprite: asset('b_maren_front.png'),
      opponentPortrait: asset('p_maren.png'),
      location: 'Saltquay harbor hall',
      rewardCr: MISSION_1_REWARD
    },
    next: null
  });

  /* ------------------------------------------------------------------ */
  /* Story order. Cold open first, then creation, school, grad, road,   */
  /* prologue, Saltquay road, Monster Bank, Saltquay arc, Main Mission 1. */
  /* Prologue and arc scenes branch by race and bloodline; the order    */
  /* below lists the router scenes, and the runner follows the branch.  */
  /* ------------------------------------------------------------------ */

  var STORY_ORDER = [
    'cold_open_defense',
    'cold_open_farewell',
    'creation_intro',
    'family_rival',
    'school_road_ghoul',
    'egg_choice',
    'grad_hatch',
    'grad_hunter_fail',
    'hunter_exam',
    'hunter_exam_q1',
    'hunter_exam_q2',
    'hunter_exam_q3',
    'hunter_exam_verdict',
    'hunter_exam_retry',
    'hunter_permit',
    'guild_register',
    'guild_register_done',
    'guild_register_guild',
    'guild_register_bazaar',
    'road_down_gate',
    'road_down_walk',
    'prologue_solar',
    'prologue_polar',
    'prologue_proofs_solar',
    'prologue_proofs_polar',
    'road_to_saltquay',
    'saltquay_arrival',
    'saltquay_guild_board_sighting',
    'monster_bank_stop',
    'saltquay_arc_meeting',
    'party_screen',
    'job_board_mm1',
    'mm1_accept'
  ];

  /* ------------------------------------------------------------------ */
  /* State hooks. onEnter and onChoose names used by scenes above.      */
  /* ------------------------------------------------------------------ */

  var HOOKS = {
    markGhoulEncounter: function (state) {
      state.flags.ghoulEncounterSeen = true;
      state.flags.wispMet = true;
      return state;
    },
    setStarterWildlife: function (state, choiceId) {
      var egg = eggById(choiceId);
      state.starterWildlife = egg.id;
      state.starterWildlifeName = egg.name;
      state.flags.eggPicked = true;
      return state;
    },
    /* Permit only. The old build granted the trainer registration here
     * too, because the permit and the guild shared one scene. They are
     * split now: the permit grants the permit, and registerTrainer
     * grants the trainer registration at the guild or the bazaar. */
    grantHunterPermit: function (state) {
      state.hunterPermit = true;
      state.flags.hunterExamPassed = true;
      return state;
    },
    markEggHatched: function (state) {
      state.flags.eggHatched = true;
      state.flags.hatchedWildlife = state.starterWildlife || null;
      if (state.party) {
        for (var i = 0; i < state.party.length; i++) {
          if (state.party[i].egg) {
            state.party[i].egg = false;
            state.party[i].hatched = true;
          }
        }
      }
      return state;
    },
    answerExamQuestion: function (state, choiceId, scene) {
      state.flags = state.flags || {};
      state.flags.examAnswers = state.flags.examAnswers || {};
      var qid = (scene && scene.examQuestion) || null;
      if (qid) {
        state.flags.examAnswers[qid] = choiceId;
      }
      state.flags.examAnswered = true;
      return state;
    },
    registerTrainer: function (state, choiceId) {
      state.flags = state.flags || {};
      state.trainerRegistered = true;
      if (choiceId === 'bazaar') {
        state.flags.bazaarRegistered = true;
        state.flags.guildRegistered = false;
        state.flags.trainerRoad = 'bazaar';
      } else {
        state.flags.guildRegistered = true;
        state.flags.bazaarRegistered = false;
        state.flags.trainerRoad = 'guild';
      }
      return state;
    },
    setPrologueLevel5: function (state) {
      state.flags.prologueLevel = PROLOGUE_ARRIVAL_LEVEL;
      return state;
    },
    unlockMonsterBank: function (state) {
      state.flags.monsterBankUnlocked = true;
      return state;
    },
    addArcBondkinToParty: function (state) {
      /* FIX BATCH B5: idempotent and non destructive. The old hook
       * rebuilt state.party wholesale on every enter, so a second
       * play double added and wiped anything else in the party. It
       * now returns at once when a Bondkin is already in the party,
       * and when the grid asking scene already ran and the player
       * said Not yet, it respects that answer and adds nothing. The
       * asking scene then plays as dialogue only. When it does add,
       * it appends the Bondkin to the existing party and never
       * replaces the Wildlife entry. Note on timing: playScene runs
       * onEnter before the lines display, so the grid asked/joined
       * flags are the guard that stops an add before the player
       * answers; the grid battle sets them before this hook runs. */
      state.flags = state.flags || {};
      state.party = state.party || [];
      if (state.flags.arcBondkinAsked && !state.flags.arcBondkinJoined) {
        return state;
      }
      for (var i = 0; i < state.party.length; i++) {
        if (state.party[i] && String(state.party[i].kind || '').toLowerCase() === 'bondkin') {
          return state;
        }
      }
      var bloodId = String(state.starterBloodline || 'elf').toLowerCase();
      var egg = eggById(state.starterWildlife);
      var wildlife = state.starterWildlife
        ? { kind: 'wildlife', id: state.starterWildlife, name: egg ? egg.name : 'Wildlife' }
        : { kind: 'wildlife', id: null, name: 'Wildlife' };
      var bondkin = {
        kind: 'bondkin',
        id: bloodId,
        name: NAMES_DRAFT.arcBondkin[bloodId],
        bloodline: bloodlineById(bloodId).name,
        totem: bloodlineById(bloodId).totem
      };
      if (state.party.length === 0) {
        state.party = [wildlife, bondkin];
      } else {
        state.party.push(bondkin);
      }
      state.flags.arcBondkinAsked = true;
      state.flags.arcBondkinJoined = true;
      state.flags.partyFormed = true;
      return state;
    },
    acceptMainMission1: function (state) {
      state.flags.mainMission1Accepted = true;
      state.flags.mainMission1Declined = false;
      return state;
    },
    viewMainMission1Card: function (state) {
      /* Reading the card is not accepting it. Accepting happens only
       * through the card choice, chooseMainMission1 with id accept. */
      state.flags.mainMission1Viewed = true;
      return state;
    },
    chooseMainMission1: function (state, choiceId) {
      if (choiceId === 'accept') {
        return HOOKS.acceptMainMission1(state);
      }
      state.flags.mainMission1Accepted = false;
      state.flags.mainMission1Declined = true;
      return state;
    },
    sealGate: function (state) {
      state.flags.gateSealed = true;
      state.flags.gateSealSeen = true;
      return state;
    },
    markRoadWalkDone: function (state) {
      state.flags.roadWalkDone = true;
      return state;
    },
    markSaltquayArrival: function (state) {
      state.flags.saltquayArrived = true;
      state.flags.prologueLevel = PROLOGUE_ARRIVAL_LEVEL;
      /* V8 FIX: the story chain never walks the overworld maps, so
       * the overworld module is still sitting on the home town map
       * when this scene plays. Move it to Saltquay now, at the
       * moment the story says the player arrives, so a chain end
       * (Trial Battle 1 win or loss) resumes in Saltquay instead
       * of dropping the player back in the sealed home town. The
       * flags are set first, so loadMap's own arrival trigger
       * cannot re-fire, and the load is skipped outright when the
       * player walked in on foot and is already on the Saltquay
       * map. The save is persisted too, so a reload and Continue
       * lands in Saltquay as well. */
      try {
        var ow = (typeof FED13 !== 'undefined' && FED13.overworld) || null;
        if (ow && ow.state && ow.state.mapId !== 'saltquay') {
          ow.state.visitedSaltquay = true;
          ow.state.saltquayArrived = true;
          if (typeof ow.loadMap === 'function') { ow.loadMap('saltquay'); }
          if (typeof ow.saveGame === 'function') { ow.saveGame(); }
        }
      } catch (e) { /* overworld not ready; the start() guard covers it */ }
      return state;
    },
    markGuildBoardSeen: function (state) {
      state.flags.guildBoardSeen = true;
      return state;
    }
  };

  /* Hatch reveal data for the picked egg. The engine hatch screen
   * reads this to pick the cracked art and the back sprite. */
  function hatchReveal(state) {
    var egg = eggById(state && state.starterWildlife);
    return {
      id: egg.id,
      name: egg.name,
      codex: egg.codex,
      types: egg.types,
      eggSprite: egg.eggSprite,
      crackedSprite: egg.crackedSprite,
      backSprite: egg.backSprite,
      frontSprite: egg.frontSprite,
      steps: ['shake', 'crack', 'flash', 'reveal'],
      hatched: !!(state && state.flags && state.flags.eggHatched)
    };
  }

  function gradeExam(answers) {
    var scene = SCENES.hunter_exam;
    var questions = scene.exam.questions;
    var score = 0;
    var detail = [];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i];
      var given = answers ? answers[q.id] : null;
      var correct = given === q.answer;
      if (correct) {
        score++;
      }
      detail.push({ id: q.id, given: given, correct: correct, explain: q.explain });
    }
    return {
      score: score,
      total: questions.length,
      passed: score >= scene.exam.passScore,
      detail: detail
    };
  }

  /* Grade the answers recorded on state by answerExamQuestion. Used by
   * the hunter_exam_verdict router. No answers recorded yet grades 0. */
  function examVerdict(state) {
    var answers = (state && state.flags && state.flags.examAnswers) || null;
    return gradeExam(answers);
  }

  /* Feedback for one staged exam answer, for Clerk Ivo to speak after
   * the player picks. Returns null for an unknown question id. */
  function examQuestionFeedback(questionId, givenId) {
    var questions = SCENES.hunter_exam.exam.questions;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === questionId) {
        var q = questions[i];
        var correct = givenId === q.answer;
        var givenLabel = null;
        for (var j = 0; j < q.options.length; j++) {
          if (q.options[j].id === givenId) {
            givenLabel = q.options[j].label;
          }
        }
        return {
          questionId: q.id,
          given: givenId,
          givenLabel: givenLabel,
          correct: correct,
          answer: q.answer,
          explain: q.explain
        };
      }
    }
    return null;
  }

  /* Answer a scene choice. Runs the scene onChoose hook with the picked
   * option id and the scene, then returns the next scene id from
   * resolveNext. The engine calls this when the player confirms a
   * choice. Unknown scene, missing choice, or unknown option returns
   * ok false and never throws, so play continues. */
  function choose(sceneId, choiceId, state) {
    var scene = SCENES[sceneId];
    if (!scene) {
      return { ok: false, error: 'unknown scene: ' + sceneId, next: null };
    }
    if (!scene.choice) {
      return { ok: false, error: 'scene has no choice: ' + sceneId, next: resolveNext(scene, state) };
    }
    var options = scene.choice.options || [];
    var found = false;
    for (var i = 0; i < options.length; i++) {
      if (options[i].id === choiceId) {
        found = true;
      }
    }
    if (!found) {
      return { ok: false, error: 'unknown choice: ' + choiceId, next: null };
    }
    if (scene.onChoose && HOOKS[scene.onChoose]) {
      HOOKS[scene.onChoose](state, choiceId, scene);
    }
    return { ok: true, next: resolveNext(scene, state) };
  }

  /* ------------------------------------------------------------------ */
  /* Scene resolution: branching, rival variant, portraits.              */
  /* ------------------------------------------------------------------ */

  function resolveNext(scene, state) {
    if (!scene) {
      return null;
    }
    if (scene.id === 'road_down_gate') {
      return 'road_down_walk';
    }
    if (scene.id === 'road_down_walk') {
      return state && state.race === 'polar' ? 'prologue_polar' : 'prologue_solar';
    }
    if (scene.id === 'job_board_mm1') {
      /* Declining the card ends the board visit. Only an accepted
       * mission moves on to mm1_accept and Trial Battle 1. */
      if (state && state.flags && state.flags.mainMission1Accepted) {
        return 'mm1_accept';
      }
      return null;
    }
    if (scene.router && typeof scene.routeTo === 'function') {
      return scene.routeTo(state);
    }
    return scene.next || null;
  }

  function resolvePortrait(lineObj, scene, state) {
    if (lineObj.speaker === 'player' && state) {
      if (state.appearance === 'girl') {
        return PORTRAITS.playerGirlSolar;
      }
      return PORTRAITS.playerBoySolar;
    }
    if (lineObj.speaker === 'bondkin' && scene && scene.portraitOverride) {
      return scene.portraitOverride.bondkin;
    }
    if (lineObj.speaker === 'neighbor') {
      return PORTRAITS.neighborBoy;
    }
    return lineObj.portrait || null;
  }

  function copyLine(ln) {
    var copy = {};
    for (var k in ln) {
      if (ln.hasOwnProperty(k)) {
        copy[k] = ln[k];
      }
    }
    return copy;
  }

  function getSceneLines(scene, state) {
    var lines = scene.lines ? scene.lines.slice() : [];
    if (!state) {
      return lines;
    }
    /* Girl appearance: the rival is Theo, the male neighbor. */
    if (state.appearance === 'girl') {
      if (scene.id === 'family_rival' && scene.rivalVariant && scene.rivalVariant.girl) {
        lines = lines.slice(0, 4)
          .concat(scene.rivalVariant.girl.lines)
          .concat(lines.slice(9));
      }
      lines = lines.map(function (ln) {
        var copy = null;
        /* Rewrite rival names inside line text, not just speaker fields.
         * Boy-path text says Sera and her; the girl path must say Theo
         * and him. Sera names only the rival, and the only rival-referring
         * her in line text is "with her anyway", so these two replacements
         * cannot touch other characters, and the boy path is untouched. */
        if (typeof ln.text === 'string') {
          var fixedText = ln.text
            .replace(/Sera/g, NAMES_DRAFT.maleNeighbor)
            .replace(/with her anyway/g, 'with him anyway');
          if (fixedText !== ln.text) {
            copy = copyLine(ln);
            copy.text = fixedText;
          }
        }
        if (ln.speaker === 'rival') {
          if (!copy) {
            copy = copyLine(ln);
          }
          copy.speaker = 'neighbor';
          copy.speakerName = NAMES_DRAFT.maleNeighbor;
          copy.portrait = PORTRAITS.neighborBoy;
        }
        return copy || ln;
      });
    }
    /* Polar gate seal: only the road_down_gate lines name the
     * Gatehollow Gate, so only those lines are rewritten, to the
     * Dreamrest Gate. Solar lines are untouched. */
    if (scene.id === 'road_down_gate' && isPolarState(state)) {
      lines = lines.map(function (ln) {
        if (typeof ln.text === 'string' && ln.text.indexOf('Gatehollow Gate') >= 0) {
          var copy = copyLine(ln);
          copy.text = ln.text.replace(/Gatehollow Gate/g, 'Dreamrest Gate');
          return copy;
        }
        return ln;
      });
    }
    return lines;
  }

  /* Gate seal race variant. The story route (overworld storyTrigger
   * to engine storyScene) plays road_down_gate, not the engine
   * playRoadDownCinematic, so this is the live route. Solar keeps
   * ROAD_DOWN.gateSeal exactly; Polar gets gateSealPolar. isPolarState
   * accepts the story state (race 'polar'), the engine state
   * (trainer.race 'Polar', location 'Dreamrest'), or falls back to
   * FED13.state when no state is passed. */
  function isPolarState(state) {
    var s = state || null;
    if (!s && typeof FED13 !== 'undefined' && FED13.state) { s = FED13.state; }
    if (!s) { return false; }
    if (s.race === 'polar' || s.race === 'Polar') { return true; }
    if (s.trainer && (s.trainer.race === 'Polar' || s.trainer.race === 'polar')) { return true; }
    if (s.location === 'Dreamrest') { return true; }
    return false;
  }
  function gateSealFor(state) {
    return isPolarState(state) ? ROAD_DOWN.gateSealPolar : ROAD_DOWN.gateSeal;
  }
  function roadDownGateScene(state) {
    var scene = SCENES.road_down_gate;
    if (!scene) { return null; }
    if (!isPolarState(state)) { return scene; }
    var copy = {};
    for (var k in scene) { if (scene.hasOwnProperty(k)) { copy[k] = scene[k]; } }
    copy.title = 'The Road Down: The Dreamrest Gate Seals';
    copy.location = 'The Dreamrest Gate, the 14th world';
    copy.background = asset('map_dreamrest.png');
    copy.cinematicData = ROAD_DOWN.gateSealPolar;
    return copy;
  }

  function getScene(id, state) {
    if (id === 'road_down_gate') { return roadDownGateScene(state); }
    return SCENES[id] || null;
  }

  /* ------------------------------------------------------------------ */
  /* FX fallback. fx_slash, fx_smoke and fx_sparkle now exist as image
   * files in build/assets, so this module loads the real files. Shield
   * stays procedural (FX_MISSING_PROCEDURAL below lists it) because the
   * shield image file cannot be pushed to the repo as a binary. The
   * procedural drawings stay as a fallback if an image fails to load.
   * Never stop the module for a missing file. Never retry generation.  */
  /* ------------------------------------------------------------------ */

  /* 'shield' stays procedural: the shield image file cannot be pushed
   * to the repo as a binary, so the procedural hexagon is the shield
   * on every copy. No circle, no bubble. */
  var FX_MISSING_PROCEDURAL = ['shield'];
  var FX_WITH_IMAGE = ['fire', 'fira', 'firaga', 'blizzard', 'thunder', 'cure', 'holy', 'snare_burst'];
  var FX_FALLBACK_COLORS = {
    fire: '#ff7a1a',
    fira: '#ff5a00',
    firaga: '#ff2a00',
    blizzard: '#bfe8ff',
    thunder: '#ffe94d',
    cure: '#7dff8a',
    holy: '#ffd94d',
    snare_burst: '#c98cff'
  };

  var fxImageCache = {};

  function prand(i) {
    var v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  }

  function isProceduralFx(name) {
    return FX_MISSING_PROCEDURAL.indexOf(name) !== -1;
  }

  function loadFxImage(name) {
    if (isProceduralFx(name)) {
      return null;
    }
    if (fxImageCache.hasOwnProperty(name)) {
      return fxImageCache[name];
    }
    if (typeof Image === 'undefined') {
      fxImageCache[name] = null;
      return null;
    }
    var img = new Image();
    img.src = asset('fx_' + name + '.png');
    img.onerror = function () {
      fxImageCache[name] = null;
    };
    fxImageCache[name] = img;
    return img;
  }

  function fxImageReady(name) {
    var img = fxImageCache[name];
    return !!img && img.complete && img.naturalWidth > 0;
  }

  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.closePath();
    ctx.fill();
  }

  /* fx_slash: white sword slash arc with impact sparks. */
  function drawFxSlash(ctx, x, y, size, t) {
    var r = size * 0.5;
    var sweep = t * Math.PI * 0.9;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 1 - t * 0.6;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r, -Math.PI * 0.75, -Math.PI * 0.75 + sweep + 0.5);
    ctx.stroke();
    ctx.strokeStyle = '#cfe8ff';
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.82, -Math.PI * 0.75, -Math.PI * 0.75 + sweep);
    ctx.stroke();
    var tipX = Math.cos(-Math.PI * 0.75 + sweep + 0.5) * r;
    var tipY = Math.sin(-Math.PI * 0.75 + sweep + 0.5) * r;
    ctx.fillStyle = '#ffffff';
    for (var i = 0; i < 6; i++) {
      var a = prand(i * 3 + 1) * Math.PI * 2;
      var d = r * (0.25 + prand(i * 7 + 2) * 0.45);
      drawStar(ctx, tipX + Math.cos(a) * d, tipY + Math.sin(a) * d, Math.max(2, size * 0.05));
    }
    ctx.restore();
  }

  /* fx_smoke: grey and purple dispersing smoke puff. */
  function drawFxSmoke(ctx, x, y, size, t) {
    ctx.save();
    ctx.translate(x, y);
    for (var i = 0; i < 9; i++) {
      var a = prand(i * 5 + 1) * Math.PI * 2;
      var dist = size * 0.28 * t + prand(i * 11 + 2) * size * 0.12;
      var px = Math.cos(a) * dist;
      var py = Math.sin(a) * dist - size * 0.18 * t;
      var rad = size * (0.14 + prand(i * 13 + 3) * 0.16) * (1 + t * 0.9);
      ctx.globalAlpha = (1 - t) * (0.45 + prand(i * 17 + 4) * 0.25);
      ctx.fillStyle = i % 3 === 0 ? '#8f7fb8' : '#9a9a9a';
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* fx_sparkle: gold star sparkles. */
  function drawFxSparkle(ctx, x, y, size, t) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#ffd94d';
    for (var i = 0; i < 10; i++) {
      var px = (prand(i * 3 + 1) - 0.5) * size;
      var py = (prand(i * 7 + 2) - 0.5) * size;
      var tw = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 + i * 1.7);
      var r = size * (0.04 + 0.06 * tw);
      ctx.globalAlpha = 0.35 + 0.65 * tw;
      drawStar(ctx, px, py, r);
    }
    ctx.fillStyle = '#fff6c8';
    ctx.globalAlpha = 1 - t * 0.5;
    drawStar(ctx, 0, 0, size * 0.12);
    ctx.restore();
  }

  /* fx_shield: angular DS barrier. A translucent blue hexagon with
   * bright edge lines and diagonal shimmer, no circle, no bubble. */
  function drawFxShield(ctx, x, y, size, t) {
    var r = size * 0.5 * (1 + 0.06 * Math.sin(t * Math.PI * 2));
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 3;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    ctx.save();
    ctx.translate(x, y);
    /* Translucent blue fill inside the hexagon. */
    ctx.globalAlpha = 0.22 + 0.10 * Math.sin(t * Math.PI);
    ctx.fillStyle = '#3f8cff';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var j = 1; j < 6; j++) { ctx.lineTo(pts[j][0], pts[j][1]); }
    ctx.closePath();
    ctx.fill();
    /* Diagonal shimmer lines, clipped to the hexagon. */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < 6; k++) { ctx.lineTo(pts[k][0], pts[k][1]); }
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = 0.8 * (1 - t * 0.5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, size * 0.03);
    var off = (t * r * 0.8) - r * 0.4;
    for (var m = -1; m <= 1; m++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7 + off + m * r * 0.35, r * 0.9);
      ctx.lineTo(r * 0.2 + off + m * r * 0.35, -r * 0.9);
      ctx.stroke();
    }
    ctx.restore();
    /* Bright outer edge. */
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = '#bfe0ff';
    ctx.lineWidth = Math.max(2, size * 0.05);
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var n = 1; n < 6; n++) { ctx.lineTo(pts[n][0], pts[n][1]); }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /* Generic procedural burst, used only if an image-backed effect file
   * fails to load. The four missing effects never reach this path. */
  function drawFxBurst(ctx, x, y, size, t, color) {
    ctx.save();
    ctx.translate(x, y);
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var d = size * 0.3 * t;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * d, Math.sin(a) * d, size * 0.09 * (1 - t * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFxProcedural(ctx, name, x, y, size, t) {
    if (!ctx) {
      return false;
    }
    var tt = Math.max(0, Math.min(1, typeof t === 'number' ? t : 0));
    var s = size || 64;
    if (name === 'slash') {
      drawFxSlash(ctx, x, y, s, tt);
    } else if (name === 'smoke') {
      drawFxSmoke(ctx, x, y, s, tt);
    } else if (name === 'sparkle') {
      drawFxSparkle(ctx, x, y, s, tt);
    } else if (name === 'shield') {
      drawFxShield(ctx, x, y, s, tt);
    } else {
      drawFxBurst(ctx, x, y, s, tt, FX_FALLBACK_COLORS[name] || '#ffffff');
    }
    return true;
  }

  /* Draw an effect by name. Uses the image when present and loaded,
   * procedural drawing when the image failed to load. Never throws. */
  function drawEffect(ctx, name, x, y, size, t) {
    if (!ctx || !name) {
      return false;
    }
    if (isProceduralFx(name)) {
      return drawFxProcedural(ctx, name, x, y, size, t);
    }
    loadFxImage(name);
    if (fxImageReady(name)) {
      var s = size || 64;
      ctx.drawImage(fxImageCache[name], x - s / 2, y - s / 2, s, s);
      return true;
    }
    if (fxImageCache[name] === null) {
      return drawFxProcedural(ctx, name, x, y, size, t);
    }
    return drawFxProcedural(ctx, name, x, y, size, t);
  }

  var FX = {
    missingProcedural: FX_MISSING_PROCEDURAL.slice(),
    withImage: FX_WITH_IMAGE.slice(),
    isProcedural: isProceduralFx,
    loadImage: loadFxImage,
    imageReady: fxImageReady,
    draw: drawEffect,
    drawProcedural: drawFxProcedural,
    drawSlash: drawFxSlash,
    drawSmoke: drawFxSmoke,
    drawSparkle: drawFxSparkle,
    drawShield: drawFxShield
  };

  /* ------------------------------------------------------------------ */
  /* Runner. Pure logic, no DOM. The engine can pass a display function */
  /* that renders one line (static portrait plus text) and calls back.  */
  /* If no display is passed and FED13.engine.showDialogue exists, the  */
  /* runner uses it. Otherwise playScene returns the lines for the      */
  /* caller to render. A scene never fails because art is missing.      */
  /* Choices are presented by the engine, never by this runner: after   */
  /* the lines, the engine shows scene.choice, then calls choose() with */
  /* the picked option id. choose() runs the onChoose hook and returns  */
  /* the next scene. Exam staging works the same way, one question      */
  /* scene per question, graded at the verdict router by examVerdict.   */
  /* Battles are launched by the engine story runner, never by this     */
  /* runner: the playScene return carries both scene.battle and         */
  /* scene.battles, so a consumer reading the return can launch the     */
  /* road battles too, not just a single battle block.                   */
  /* ------------------------------------------------------------------ */

  function runSceneHooks(scene, state) {
    if (scene && scene.onEnter && HOOKS[scene.onEnter]) {
      HOOKS[scene.onEnter](state);
    }
    return state;
  }

  function playScene(id, state, display) {
    var scene = getScene(id, state);
    if (!scene) {
      return { ok: false, error: 'unknown scene: ' + id, lines: [] };
    }
    runSceneHooks(scene, state);
    var lines = getSceneLines(scene, state).map(function (ln) {
      var copy = {};
      for (var k in ln) {
        if (ln.hasOwnProperty(k)) {
          copy[k] = ln[k];
        }
      }
      copy.portrait = resolvePortrait(ln, scene, state);
      return copy;
    });
    var show = display;
    if (!show && FED13.engine && typeof FED13.engine.showDialogue === 'function') {
      show = FED13.engine.showDialogue;
    }
    if (show) {
      var i = 0;
      var step = function () {
        if (i < lines.length) {
          var ln = lines[i];
          i++;
          show(ln, step, scene);
        }
      };
      step();
    }
    return {
      ok: true,
      scene: scene,
      lines: lines,
      next: resolveNext(scene, state),
      choice: scene.choice || null,
      exam: scene.exam || null,
      hatch: scene.hatch || null,
      battle: scene.battle || null,
      battles: scene.battles || null,
      jobBoardCard: scene.jobBoardCard || null,
      cinematic: scene.cinematic || null,
      cinematicData: scene.cinematicData || null,
      walk: scene.walk || null,
      walkData: scene.walkData || null,
      guildBoardSighting: scene.guildBoardSighting || null
    };
  }

  function start(state, display) {
    var s = state || newGameState();
    return playScene('cold_open_defense', s, display);
  }

  /* ------------------------------------------------------------------ */
  /* Validation. Run before shipping: every scene must have lines,      */
  /* every portrait must be a relative assets path, no banned words,    */
  /* no em dash anywhere in visible text, every branch target exists.   */
  /* ------------------------------------------------------------------ */

  function collectStrings(value, out) {
    if (typeof value === 'string') {
      out.push(value);
    } else if (value && typeof value === 'object') {
      for (var k in value) {
        if (value.hasOwnProperty(k)) {
          collectStrings(value[k], out);
        }
      }
    }
    return out;
  }

  function validate() {
    var issues = [];
    var ids = Object.keys(SCENES);
    for (var i = 0; i < ids.length; i++) {
      var scene = SCENES[ids[i]];
      if (!scene.lines || scene.lines.length === 0) {
        issues.push(scene.id + ': no dialogue lines');
      }
      if (scene.next && !SCENES[scene.next]) {
        issues.push(scene.id + ': next scene missing: ' + scene.next);
      }
    }
    for (var j = 0; j < STORY_ORDER.length; j++) {
      if (!SCENES[STORY_ORDER[j]]) {
        issues.push('STORY_ORDER: missing scene: ' + STORY_ORDER[j]);
      }
    }
    BLOODLINES.forEach(function (b) {
      if (!SCENES['saltquay_arc_meeting_' + b.id]) {
        issues.push('missing arc meeting scene for bloodline: ' + b.id);
      }
      if (!SCENES['saltquay_first_grid_' + b.id]) {
        issues.push('missing first grid scene for bloodline: ' + b.id);
      }
      if (!SCENES['saltquay_asking_' + b.id]) {
        issues.push('missing asking scene for bloodline: ' + b.id);
      }
    });
    /* Staging: every beat index on a line must exist, every staging
     * sprite must be a relative assets path or the procedural bag. */
    for (var v = 0; v < ids.length; v++) {
      var vscene = SCENES[ids[v]];
      if (!vscene.staging || !vscene.staging.beats) {
        continue;
      }
      var beats = vscene.staging.beats;
      if (beats.length === 0) {
        issues.push(vscene.id + ': staging has no beats');
        continue;
      }
      for (var li = 0; li < vscene.lines.length; li++) {
        var beat = vscene.lines[li].beat;
        if (typeof beat !== 'number' || beat < 0 || beat >= beats.length) {
          issues.push(vscene.id + ': line ' + li + ' has no valid staging beat');
        }
      }
      for (var bi = 0; bi < beats.length; bi++) {
        var beatDef = beats[bi];
        if (beatDef.background && beatDef.background.indexOf(ASSETS) !== 0) {
          issues.push(vscene.id + ': beat ' + bi + ' background is not a relative assets path');
        }
        for (var si = 0; si < (beatDef.sprites || []).length; si++) {
          var spr = beatDef.sprites[si];
          if (spr.draw === 'bag') {
            continue;
          }
          if (!spr.img || spr.img.indexOf(ASSETS) !== 0) {
            issues.push(vscene.id + ': beat ' + bi + ' sprite ' + si + ' is not a relative assets path');
          }
        }
      }
    }
    /* Staged exam and choice checks. Every examQuestion stage must name
     * a question on hunter_exam, and its choice options must match that
     * question exactly, so the staged answer and gradeExam agree.
     * Every choice scene needs a real onChoose hook, and every onEnter
     * hook and router routeTo must exist. */
    var examIds = {};
    SCENES.hunter_exam.exam.questions.forEach(function (q) {
      examIds[q.id] = true;
    });
    for (var k = 0; k < ids.length; k++) {
      var sc = SCENES[ids[k]];
      if (sc.examQuestion && !examIds[sc.examQuestion]) {
        issues.push(sc.id + ': examQuestion missing from hunter_exam: ' + sc.examQuestion);
      }
      if (sc.choice && sc.choice.options) {
        if (!sc.onChoose) {
          issues.push(sc.id + ': choice scene has no onChoose hook');
        } else if (!HOOKS[sc.onChoose]) {
          issues.push(sc.id + ': onChoose hook missing: ' + sc.onChoose);
        }
        var seenOpts = {};
        for (var o = 0; o < sc.choice.options.length; o++) {
          if (seenOpts[sc.choice.options[o].id]) {
            issues.push(sc.id + ': duplicate choice option: ' + sc.choice.options[o].id);
          }
          seenOpts[sc.choice.options[o].id] = true;
        }
        if (sc.examQuestion) {
          var qMatch = null;
          for (var qi = 0; qi < SCENES.hunter_exam.exam.questions.length; qi++) {
            if (SCENES.hunter_exam.exam.questions[qi].id === sc.examQuestion) {
              qMatch = SCENES.hunter_exam.exam.questions[qi];
            }
          }
          if (qMatch) {
            var qOptIds = qMatch.options.map(function (op) { return op.id; }).sort().join(',');
            var cOptIds = sc.choice.options.map(function (op) { return op.id; }).sort().join(',');
            if (qOptIds !== cOptIds) {
              issues.push(sc.id + ': choice options do not match exam question options');
            }
          }
        }
      }
      if (sc.onEnter && !HOOKS[sc.onEnter]) {
        issues.push(sc.id + ': onEnter hook missing: ' + sc.onEnter);
      }
      if (sc.router && typeof sc.routeTo !== 'function') {
        issues.push(sc.id + ': router scene has no routeTo function');
      }
    }
    var strings = collectStrings(SCENES, []);
    strings = strings.concat(collectStrings(MAIN_MISSION_1, []));
    /* Main Mission 1 card presentation: the board card must carry the
     * portrait, the large bounty, the mission text, the stakes, the
     * fine print, and both accept and decline labels, or the engine
     * has nothing dramatic to draw. */
    var card = MAIN_MISSION_1.card || {};
    var cardFields = ['seal', 'zodiac', 'danger', 'stakes', 'finePrint', 'acceptLabel', 'declineLabel', 'finePrintLabel'];
    for (var c = 0; c < cardFields.length; c++) {
      if (!card[cardFields[c]]) {
        issues.push('MAIN_MISSION_1 card missing field: ' + cardFields[c]);
      }
    }
    if (!card.lines || card.lines.length < 2) {
      issues.push('MAIN_MISSION_1 card needs at least 2 mission text lines');
    }
    if (MAIN_MISSION_1.rewardCr !== 1000000 || card.reward !== '1,000,000 Cr') {
      issues.push('MAIN_MISSION_1 reward must be 1,000,000 Cr');
    }
    if (!MAIN_MISSION_1.targetPortrait || MAIN_MISSION_1.targetPortrait.indexOf(ASSETS) !== 0) {
      issues.push('MAIN_MISSION_1 target portrait must be a relative assets path');
    }
    var boardScene = SCENES.job_board_mm1;
    if (!boardScene || !boardScene.choice || !boardScene.onChoose) {
      issues.push('job_board_mm1 needs a choice and an onChoose hook so the mission is accepted, never auto accepted');
    }
    if (SCENES.mm1_accept && SCENES.mm1_accept.onEnter === 'acceptMainMission1') {
      issues.push('mm1_accept must not auto accept on enter; acceptance happens on the card choice');
    }
    strings = strings.concat(collectStrings(BLOODLINES, []));
    strings = strings.concat(collectStrings(EGGS, []));
    /* Hatch data: every egg needs a cracked sprite and a back sprite,
     * both relative assets paths, and grad_hatch must carry the four
     * hatch steps in order: shake, crack, flash, reveal. */
    for (var e = 0; e < EGGS.length; e++) {
      if (!EGGS[e].crackedSprite || EGGS[e].crackedSprite.indexOf(ASSETS) !== 0) {
        issues.push('egg missing cracked sprite path: ' + EGGS[e].id);
      }
      if (!EGGS[e].backSprite || EGGS[e].backSprite.indexOf(ASSETS) !== 0) {
        issues.push('egg missing back sprite path: ' + EGGS[e].id);
      }
    }
    var hatchScene = SCENES.grad_hatch;
    if (!hatchScene || !hatchScene.hatch || !hatchScene.hatch.steps) {
      issues.push('grad_hatch: no hatch steps');
    } else {
      var want = ['shake', 'crack', 'flash', 'reveal'];
      for (var h = 0; h < want.length; h++) {
        if (hatchScene.hatch.steps[h] !== want[h]) {
          issues.push('grad_hatch: hatch step ' + h + ' should be ' + want[h]);
        }
      }
      if (hatchScene.next !== 'grad_hunter_fail') {
        issues.push('grad_hatch: next should be grad_hunter_fail, the hunter exam hook');
      }
    }
    var bannedWords = ['prof' + 'essor', 'crea' + 'ture', 'char' + 'acter'];
    for (var s = 0; s < strings.length; s++) {
      var text = strings[s];
      if (text.indexOf('\u2014') !== -1 || text.indexOf('\u2013') !== -1) {
        issues.push('dash found in text: ' + text.slice(0, 60));
      }
      var lower = text.toLowerCase();
      for (var b = 0; b < bannedWords.length; b++) {
        if (lower.indexOf(bannedWords[b]) !== -1) {
          issues.push('banned word in text: ' + text.slice(0, 60));
        }
      }
    }
    var portraits = Object.keys(PORTRAITS);
    for (var p = 0; p < portraits.length; p++) {
      var pv = PORTRAITS[portraits[p]];
      if (pv !== null && pv.indexOf(ASSETS) !== 0) {
        issues.push('portrait not a relative assets path: ' + portraits[p]);
      }
    }
    return { ok: issues.length === 0, issues: issues, sceneCount: ids.length };
  }

  /* ------------------------------------------------------------------ */
  /* Trigger entry point for the overworld. overworld.js calls          */
  /* FED13.story.trigger(name, data) on map events. Unknown triggers    */
  /* return ok false and never throw, so play continues.                */
  /* ------------------------------------------------------------------ */

  var TRIGGER_SCENES = {
    schoolRoadGhoul: 'school_road_ghoul',
    gateSeals: 'road_down_gate',
    roadWalk: 'road_down_walk',
    saltquayArrival: 'saltquay_arrival',
    guildBoardSighting: 'saltquay_guild_board_sighting',
    arcOpening: 'saltquay_arc_meeting',
    monsterBankVisit: 'monster_bank_stop',
    mainMission1: 'job_board_mm1'
  };

  /* FIX BATCH B3/B4: triggerSceneId resolves a trigger name to its
   * scene id without playing any lines. The overworld chain follower
   * uses it to hand the scene to the engine story screen, which is
   * the one chain runner, instead of firing playScene here and
   * overwriting the shared text box with a second trigger. */
  function triggerSceneId(name) {
    return TRIGGER_SCENES[name] || null;
  }

  function trigger(name, data, state, display) {
    var s = state || (FED13.state || newGameState());
    if (data) {
      if (data.bloodline) {
        /* FIX BATCH B4: the overworld passes the bloodline raw
         * ('Elf'), which built saltquay_arc_meeting_Elf, a scene
         * that does not exist. Lowercase it here, so routeTo
         * resolves to the lowercase scene id. */
        var bl = String(data.bloodline).toLowerCase();
        s.starterBloodline = bl;
        s.arcBondkin = NAMES_DRAFT.arcBondkin[bl];
      }
      if (data.level) {
        s.flags.prologueLevel = data.level;
      }
    }
    if (name === 'grimoireOpened') {
      return { ok: true, scene: null, note: 'Grimoire was picked at creation. No cutscene.' };
    }
    var sceneId = TRIGGER_SCENES[name];
    if (!sceneId) {
      return { ok: false, error: 'unknown story trigger: ' + name };
    }
    return playScene(sceneId, s, display);
  }

  /* ------------------------------------------------------------------ */
  /* Public API.                                                         */
  /* ------------------------------------------------------------------ */

  FED13.story = {
    version: 'batch1-fixbatch-merged',
    roadDown: ROAD_DOWN,
    gateSealFor: gateSealFor,
    source: 'fed-13-complete-story.md',
    styleGuide: 'fed-13-ds-style-guide.md section 9 and 11D rule 8',
    walletCap: WALLET_CAP,
    mission1Reward: MISSION_1_REWARD,
    coldOpenScriptedLossTurn: COLD_OPEN_SCRIPTED_LOSS_TURN,
    coldOpen: COLD_OPEN,
    prologueArrivalLevel: PROLOGUE_ARRIVAL_LEVEL,
    namesDraft: NAMES_DRAFT,
    bloodlines: BLOODLINES,
    bloodlineById: bloodlineById,
    eggs: EGGS,
    eggById: eggById,
    hatchReveal: hatchReveal,
    ghoulEncounterStaging: GHOUL_ENCOUNTER_STAGING,
    stagingBeat: stagingBeat,
    portraits: PORTRAITS,
    creation: CREATION,
    scenes: SCENES,
    storyOrder: STORY_ORDER,
    mainMission1: MAIN_MISSION_1,
    fx: FX,
    newGameState: newGameState,
    getScene: getScene,
    getSceneLines: getSceneLines,
    resolveNext: resolveNext,
    playScene: playScene,
    start: start,
    trigger: trigger,
    triggerSceneId: triggerSceneId,
    gradeExam: gradeExam,
    examVerdict: examVerdict,
    examQuestionFeedback: examQuestionFeedback,
    choose: choose,
    hooks: HOOKS,
    validate: validate
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FED13.story;
  }

  /* Overworld fallback name: overworld.js also tries FED13.storyTrigger. */
  FED13.storyTrigger = trigger;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
