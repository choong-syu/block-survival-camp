(() => {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const loading = document.getElementById("loading");
  const hotbarEl = document.getElementById("hotbar");
  const dayLabel = document.getElementById("dayLabel");
  const timeLabel = document.getElementById("timeLabel");
  const healthLabel = document.getElementById("healthLabel");
  const statusLabel = document.getElementById("statusLabel");
  const phaseTitle = document.getElementById("phaseTitle");
  const phaseRemaining = document.getElementById("phaseRemaining");
  const phaseFill = document.getElementById("phaseFill");
  const resourceBar = document.getElementById("resourceBar");
  const openCraft = document.getElementById("openCraft");
  const openGear = document.getElementById("openGear");
  const openRecipes = document.getElementById("openRecipes");
  const openCodex = document.getElementById("openCodex");
  const openSave = document.getElementById("openSave");
  const questTracker = document.getElementById("questTracker");
  const eventBanner = document.getElementById("eventBanner");
  const difficultyScreen = document.getElementById("difficultyScreen");
  const playerNameInput = document.getElementById("playerNameInput");
  const saveChoices = document.getElementById("saveChoices");
  const sidePanel = document.getElementById("sidePanel");
  const sidePanelTitle = document.getElementById("sidePanelTitle");
  const sidePanelBody = document.getElementById("sidePanelBody");
  const closePanel = document.getElementById("closePanel");
  const restartButton = document.getElementById("restart");

  const VIEW_W = 1280;
  const VIEW_H = 720;
  const TILE = 32;
  let WORLD_W = 220;
  const WORLD_H = 64;
  const GRAVITY = 1900;
  const MAX_TARGET_DISTANCE = 7 * TILE;
  const PHASE_SECONDS = 300;
  const EXPAND_COLUMNS = 96;
  const SAVE_FORMAT_VERSION = 1;

  const BLOCKS = {
    air: 0,
    grass: 1,
    dirt: 2,
    rockyDirt: 3,
    stone: 4,
    darkStone: 5,
    sand: 6,
    water: 7,
    plank: 8,
    trunk: 9,
    leaves: 10,
    gravel: 11,
    coal: 12,
    copper: 13,
    iron: 14,
    torch: 15,
    fence: 16,
    workbench: 17,
    chest: 18,
    campBed: 19,
    campLantern: 20,
    musicBox: 21,
  };

  const ITEMS = {
    grass: "grass",
    seed: "seed",
    apple: "apple",
    egg: "egg",
    wool: "wool",
    milk: "milk",
    meat: "meat",
    leather: "leather",
    feather: "feather",
    coal: "coal",
    copper: "copper",
    iron: "iron",
    crystal: "crystal",
  };

  const blockInfo = {
    [BLOCKS.grass]: { name: "잔디", solid: true, hardness: 0.45 },
    [BLOCKS.dirt]: { name: "흙", solid: true, hardness: 0.38 },
    [BLOCKS.rockyDirt]: { name: "거친 흙", solid: true, hardness: 0.5 },
    [BLOCKS.stone]: { name: "돌", solid: true, hardness: 0.9 },
    [BLOCKS.darkStone]: { name: "심층석", solid: true, hardness: 1.35 },
    [BLOCKS.sand]: { name: "모래", solid: true, hardness: 0.34 },
    [BLOCKS.water]: { name: "물", solid: false, hardness: 0.2 },
    [BLOCKS.plank]: { name: "판자", solid: true, hardness: 0.48 },
    [BLOCKS.trunk]: { name: "통나무", solid: true, hardness: 0.55 },
    [BLOCKS.leaves]: { name: "잎", solid: false, hardness: 0.28 },
    [BLOCKS.gravel]: { name: "자갈", solid: true, hardness: 0.5 },
    [BLOCKS.coal]: { name: "석탄", solid: true, hardness: 1.0 },
    [BLOCKS.copper]: { name: "구리", solid: true, hardness: 1.05 },
    [BLOCKS.iron]: { name: "철", solid: true, hardness: 1.15 },
    [BLOCKS.torch]: { name: "횃불", solid: false, hardness: 0.2 },
    [BLOCKS.fence]: { name: "울타리", solid: true, hardness: 0.42 },
    [BLOCKS.workbench]: { name: "제작대", solid: true, hardness: 0.5 },
    [BLOCKS.chest]: { name: "보물상자", solid: true, hardness: 0.55 },
    [BLOCKS.campBed]: { name: "회복 침대", solid: true, hardness: 0.35 },
    [BLOCKS.campLantern]: { name: "캠프 랜턴", solid: false, hardness: 0.25 },
    [BLOCKS.musicBox]: { name: "작은 음악 상자", solid: true, hardness: 0.3 },
  };

  const itemInfo = {
    [ITEMS.grass]: { name: "풀", feed: true },
    [ITEMS.seed]: { name: "씨앗", feed: true },
    [ITEMS.apple]: { name: "사과", feed: true },
    [ITEMS.egg]: { name: "알" },
    [ITEMS.wool]: { name: "털" },
    [ITEMS.milk]: { name: "우유" },
    [ITEMS.meat]: { name: "고기" },
    [ITEMS.leather]: { name: "가죽" },
    [ITEMS.feather]: { name: "깃털" },
    [ITEMS.coal]: { name: "석탄" },
    [ITEMS.copper]: { name: "구리광" },
    [ITEMS.iron]: { name: "철광" },
    [ITEMS.crystal]: { name: "수정" },
  };

  const difficulties = {
    easy: { name: "평온", monsterHp: 0.75, monsterDamage: 0.75, spawnRate: 0.7, resourceBonus: 1.25 },
    normal: { name: "개척", monsterHp: 1, monsterDamage: 1, spawnRate: 1, resourceBonus: 1 },
    hard: { name: "악몽", monsterHp: 1.45, monsterDamage: 1.35, spawnRate: 1.6, resourceBonus: 0.85 },
  };

  const gearCatalog = {
    woodenSword: { name: "나무 검", slot: "weapon", damage: 1, desc: "기본 공격력을 조금 올립니다." },
    copperSword: { name: "구리 검", slot: "weapon", damage: 2, desc: "첫 밤 이후 안정적인 무기입니다." },
    ironSpear: { name: "철 창", slot: "weapon", damage: 3, reach: 22, desc: "사거리가 긴 지하 탐험용 무기입니다." },
    shadowBlade: { name: "그림자 칼", slot: "weapon", damage: 5, desc: "밤이 깊을수록 강한 상위 무기입니다." },
    huntingBow: { name: "사냥 활", slot: "weapon", ranged: true, damage: 1, desc: "공격 키 또는 공격 버튼으로 화살을 쏩니다." },
    ironBow: { name: "강화 활", slot: "weapon", ranged: true, damage: 2, desc: "화살 속도와 기본 피해가 증가합니다." },
    clothArmor: { name: "천 갑옷", slot: "armor", defense: 1, desc: "약한 피해를 줄입니다." },
    copperArmor: { name: "구리 갑옷", slot: "armor", defense: 2, desc: "초반 밤 몬스터 대응용입니다." },
    ironArmor: { name: "철 갑옷", slot: "armor", defense: 3, desc: "심층 탐험용 방어구입니다." },
    flippers: { name: "오리발", slot: "boots", swim: 1, desc: "물속 이동과 상승을 쉽게 합니다." },
    shield: { name: "방패", slot: "offhand", defense: 1, desc: "근접 피해를 추가로 줄입니다." },
    lantern: { name: "등불", slot: "offhand", light: 1, desc: "동굴과 밤 시야를 보조합니다." },
  };

  const arrowCatalog = {
    wood: { name: "나무 화살", damage: 1, speed: 680, color: "#d8b365", trail: "#f0d49a", desc: "기본 화살입니다." },
    iron: { name: "철 화살", damage: 2, speed: 760, color: "#d8e2ea", trail: "#b8c4d0", desc: "관통력이 좋아 피해량이 높습니다." },
    fire: { name: "불 화살", damage: 2, speed: 720, color: "#ff7a3d", trail: "#ffd166", burn: true, desc: "명중 지점에 불꽃 폭발을 일으킵니다." },
    crystal: { name: "수정 화살", damage: 4, speed: 820, color: "#80d8ff", trail: "#b794ff", pierce: 1, desc: "한 번 더 관통하고 수정 파편을 남깁니다." },
  };

  const weaponVisuals = {
    woodenSword: { blade: "#d8b365", edge: "#f0d49a", trail: "#d8b365", spark: "#ffd166", length: 33 },
    copperSword: { blade: "#c96b34", edge: "#ffd1a3", trail: "#ff9f5a", spark: "#ffb06b", length: 36 },
    ironSpear: { blade: "#d8e2ea", edge: "#eef5ff", trail: "#b8c4d0", spark: "#eef5ff", length: 54, spear: true },
    shadowBlade: { blade: "#2b2546", edge: "#b794ff", trail: "#8f5bff", spark: "#d7b5ff", length: 41, shadow: true },
    huntingBow: { blade: "#8a5a2c", edge: "#f0d49a", trail: "#d8b365", spark: "#ffd166", length: 32, bow: true },
    ironBow: { blade: "#c7d4df", edge: "#eef5ff", trail: "#80d8ff", spark: "#d9f7ff", length: 36, bow: true },
  };

  const recipes = [
    { id: "woodenSword", req: { plank: 5, leather: 1 } },
    { id: "copperSword", req: { copper: 4, plank: 2 } },
    { id: "ironSpear", req: { iron: 4, plank: 3 } },
    { id: "shadowBlade", req: { iron: 5, coal: 5, leather: 2, crystal: 2 } },
    { id: "huntingBow", req: { plank: 4, leather: 1, feather: 1 } },
    { id: "ironBow", req: { iron: 4, plank: 3, leather: 2 } },
    { id: "ironArrow", type: "arrow", unlockArrow: "iron", req: { iron: 2, feather: 2 } },
    { id: "fireArrow", type: "arrow", unlockArrow: "fire", req: { coal: 3, copper: 2, feather: 2 } },
    { id: "crystalArrow", type: "arrow", unlockArrow: "crystal", req: { crystal: 2, iron: 2, feather: 3 } },
    { id: "clothArmor", req: { wool: 4 } },
    { id: "copperArmor", req: { copper: 7, leather: 1 } },
    { id: "ironArmor", req: { iron: 9 } },
    { id: "flippers", req: { leather: 2, feather: 2 } },
    { id: "shield", req: { plank: 6, iron: 2 } },
    { id: "lantern", req: { iron: 1, coal: 2 } },
  ];

  const relicCatalog = {
    sunCharm: { name: "태양 부적", desc: "낮이 시작될 때 체력을 조금 회복합니다." },
    swiftCharm: { name: "바람 부적", desc: "지상 이동 속도가 증가합니다." },
    tidePearl: { name: "조류 진주", desc: "물속 이동과 상승력이 좋아집니다." },
    minersMark: { name: "채굴 표식", desc: "채굴 속도가 증가하고 광물 보상이 조금 늘어납니다." },
    ironHeart: { name: "강철 심장", desc: "최대 체력이 증가합니다." },
    stormSeal: { name: "폭풍 인장", desc: "밤 전투 피해량이 증가합니다." },
  };

  const questCatalog = [
    {
      id: "bench",
      title: "제작 거점 세우기",
      body: "개인 제작대를 설치하세요.",
      reward: { xp: 12, resources: { copper: 1 } },
      done: () => stats.placedWorkbench > 0,
    },
    {
      id: "ore",
      title: "첫 광맥 확보",
      body: "석탄, 구리, 철 중 5개를 모으세요.",
      reward: { xp: 16, resources: { coal: 2 }, relic: "minersMark" },
      done: () => (resources.coal || 0) + (resources.copper || 0) + (resources.iron || 0) >= 5,
    },
    {
      id: "weapon",
      title: "무장하기",
      body: "무기 하나를 제작하세요.",
      reward: { xp: 18, resources: { leather: 1 } },
      done: () => [...crafted].some((id) => gearCatalog[id]?.slot === "weapon"),
    },
    {
      id: "ranch",
      title: "목장 운영",
      body: "동물을 울타리 안으로 유도하세요.",
      reward: { xp: 16, resources: { wool: 2, seed: 3 }, relic: "sunCharm" },
      done: () => stats.animalsCaptured > 0,
    },
    {
      id: "firstNight",
      title: "첫 밤 생존",
      body: "밤을 넘겨 Day 2에 도달하세요.",
      reward: { xp: 22, resources: { meat: 2 }, relic: "ironHeart" },
      done: () => dayCount >= 2,
    },
    {
      id: "treasure",
      title: "숨겨진 보상",
      body: "보물상자를 찾아 상호작용하세요.",
      reward: { xp: 20, resources: { crystal: 1 }, relic: "swiftCharm" },
      done: () => stats.chestsOpened > 0,
    },
    {
      id: "water",
      title: "수중 탐사",
      body: "물속에 들어가 수영하세요.",
      reward: { xp: 18, resources: { feather: 2 }, relic: "tidePearl" },
      done: () => discovered.has("water"),
    },
    {
      id: "hunter",
      title: "밤의 사냥꾼",
      body: "몬스터 5마리를 처치하세요.",
      reward: { xp: 28, resources: { iron: 2, crystal: 1 }, relic: "stormSeal" },
      done: () => stats.monsterKills >= 5,
    },
    {
      id: "frontier",
      title: "새 지형 개척",
      body: "동쪽 끝으로 이동해 맵을 확장하세요.",
      reward: { xp: 24, resources: { copper: 2, iron: 1 } },
      done: () => discovered.has("expandedWorld"),
    },
  ];

  const miniQuestCatalog = [
    {
      id: "eggs",
      type: "item",
      title: "알 수확",
      body: "알 3개를 모으세요.",
      reward: { xp: 10, resources: { seed: 3, apple: 1 } },
      done: () => gainedItem(ITEMS.egg) >= 3,
      progress: () => `${Math.min(3, gainedItem(ITEMS.egg))}/3 알`,
    },
    {
      id: "dairy",
      type: "item",
      title: "목장 재료",
      body: "털 2개와 우유 2개를 모으세요.",
      reward: { xp: 12, resources: { wool: 1, leather: 1 } },
      done: () => gainedItem(ITEMS.wool) >= 2 && gainedItem(ITEMS.milk) >= 2,
      progress: () => `털 ${Math.min(2, gainedItem(ITEMS.wool))}/2 · 우유 ${Math.min(2, gainedItem(ITEMS.milk))}/2`,
    },
    {
      id: "metalKit",
      type: "item",
      title: "금속 준비",
      body: "석탄 4개, 구리 3개, 철 2개를 확보하세요.",
      reward: { xp: 16, resources: { iron: 1, coal: 2 } },
      done: () => gainedItem(ITEMS.coal) >= 4 && gainedItem(ITEMS.copper) >= 3 && gainedItem(ITEMS.iron) >= 2,
      progress: () => `석탄 ${Math.min(4, gainedItem(ITEMS.coal))}/4 · 구리 ${Math.min(3, gainedItem(ITEMS.copper))}/3 · 철 ${Math.min(2, gainedItem(ITEMS.iron))}/2`,
    },
    {
      id: "hunterSupplies",
      type: "item",
      title: "사냥 부산물",
      body: "고기 4개와 가죽 2개를 모으세요.",
      reward: { xp: 14, hotbar: { torch: 3 }, resources: { feather: 1 } },
      done: () => gainedItem(ITEMS.meat) >= 4 && gainedItem(ITEMS.leather) >= 2,
      progress: () => `고기 ${Math.min(4, gainedItem(ITEMS.meat))}/4 · 가죽 ${Math.min(2, gainedItem(ITEMS.leather))}/2`,
    },
    {
      id: "crystalStudy",
      type: "item",
      title: "수정 연구",
      body: "수정 2개를 획득하세요.",
      reward: { xp: 20, relic: "stormSeal", resources: { coal: 2 } },
      done: () => gainedItem(ITEMS.crystal) >= 2,
      progress: () => `${Math.min(2, gainedItem(ITEMS.crystal))}/2 수정`,
    },
    {
      id: "surfaceHunt",
      type: "monster",
      title: "초원 경계",
      body: "지상 몬스터 3마리를 처치하세요.",
      reward: { xp: 14, resources: { meat: 1, copper: 1 } },
      done: () => stats.monsterKillsByHabitat.surface >= 3,
      progress: () => `${Math.min(3, stats.monsterKillsByHabitat.surface)}/3 지상`,
    },
    {
      id: "caveHunt",
      type: "monster",
      title: "동굴 정리",
      body: "지하 몬스터 3마리를 처치하세요.",
      reward: { xp: 18, resources: { coal: 3, iron: 1 } },
      done: () => stats.monsterKillsByHabitat.underground >= 3,
      progress: () => `${Math.min(3, stats.monsterKillsByHabitat.underground)}/3 지하`,
    },
    {
      id: "waterHunt",
      type: "monster",
      title: "수중 경계",
      body: "수중 몬스터 2마리를 처치하세요.",
      reward: { xp: 18, resources: { feather: 2, crystal: 1 }, relic: "tidePearl" },
      done: () => stats.monsterKillsByHabitat.water >= 2,
      progress: () => `${Math.min(2, stats.monsterKillsByHabitat.water)}/2 수중`,
    },
    {
      id: "brute",
      type: "monster",
      title: "장갑 괴수 토벌",
      body: "장갑 괴수 1마리를 처치하세요.",
      reward: { xp: 24, resources: { crystal: 1, iron: 1 } },
      done: () => monsterKillCount("brute") >= 1,
      progress: () => `${Math.min(1, monsterKillCount("brute"))}/1 괴수`,
    },
    {
      id: "elite",
      type: "monster",
      title: "정예 사냥",
      body: "빛나는 정예 몬스터 2마리를 처치하세요.",
      reward: { xp: 30, relic: "swiftCharm", resources: { crystal: 2 } },
      done: () => stats.eliteKills >= 2,
      progress: () => `${Math.min(2, stats.eliteKills)}/2 정예`,
    },
    {
      id: "arrowHunt",
      type: "monster",
      title: "원거리 사냥",
      body: "화살로 몬스터 3마리를 처치하세요.",
      reward: { xp: 22, resources: { iron: 1, feather: 2 } },
      done: () => stats.arrowKills >= 3,
      progress: () => `${Math.min(3, stats.arrowKills)}/3 화살 처치`,
    },
  ];

  const atlas = {
    tiles: {
      [BLOCKS.grass]: [84, 100, 240, 240],
      [BLOCKS.dirt]: [366, 100, 240, 240],
      [BLOCKS.rockyDirt]: [650, 100, 232, 240],
      [BLOCKS.stone]: [924, 102, 234, 238],
      [BLOCKS.darkStone]: [1198, 100, 240, 240],
      [BLOCKS.sand]: [84, 394, 240, 238],
      [BLOCKS.water]: [366, 394, 240, 238],
      [BLOCKS.plank]: [650, 394, 232, 238],
      [BLOCKS.trunk]: [922, 394, 236, 238],
      [BLOCKS.leaves]: [1198, 394, 240, 240],
      [BLOCKS.gravel]: [320, 686, 200, 232],
      [BLOCKS.coal]: [554, 686, 196, 232],
      [BLOCKS.copper]: [784, 686, 198, 232],
      [BLOCKS.iron]: [1016, 686, 198, 232],
      [BLOCKS.torch]: [1248, 688, 202, 230],
    },
    player: {
      idle: [
        [196, 24, 80, 144],
        [342, 26, 78, 142],
        [486, 26, 76, 142],
        [628, 24, 80, 144],
      ],
      walk: [
        [192, 200, 100, 140],
        [370, 202, 112, 134],
        [574, 200, 112, 140],
        [778, 204, 112, 136],
        [966, 200, 96, 140],
        [1154, 204, 102, 136],
      ],
      jump: [
        [190, 364, 112, 132],
        [370, 364, 116, 128],
      ],
      mine: [
        [194, 530, 128, 138],
        [388, 534, 124, 134],
        [582, 532, 122, 136],
        [768, 520, 110, 148],
        [962, 532, 124, 136],
        [1152, 536, 132, 132],
      ],
      attack: [
        [188, 700, 120, 134],
        [368, 706, 138, 128],
        [570, 706, 166, 128],
        [772, 708, 150, 126],
        [966, 706, 100, 128],
        [1134, 706, 170, 128],
      ],
      hurt: [
        [192, 864, 96, 136],
        [368, 864, 98, 136],
      ],
    },
    animals: [
      {
        type: "boar",
        frames: [
          [292, 44, 200, 126],
          [632, 44, 206, 126],
          [1002, 36, 188, 134],
        ],
        w: 54,
        h: 36,
      },
      {
        type: "sheep",
        frames: [
          [296, 198, 186, 148],
          [630, 198, 202, 152],
          [974, 202, 226, 148],
        ],
        w: 58,
        h: 38,
      },
      {
        type: "chicken",
        frames: [
          [314, 366, 124, 142],
          [656, 366, 144, 144],
          [996, 370, 162, 140],
        ],
        w: 34,
        h: 42,
      },
      {
        type: "cow",
        frames: [
          [284, 534, 202, 150],
          [614, 534, 230, 154],
          [960, 522, 238, 166],
        ],
        w: 64,
        h: 42,
      },
    ],
    monsters: [
      {
        type: "walker",
        frames: [
          [132, 32, 78, 136],
          [330, 30, 108, 136],
          [516, 32, 102, 134],
          [700, 32, 94, 136],
        ],
        w: 42,
        h: 58,
        hp: 3,
        speed: 48,
      },
      {
        type: "archer",
        frames: [
          [136, 216, 88, 132],
          [330, 212, 102, 136],
          [516, 212, 102, 136],
          [706, 214, 120, 134],
        ],
        w: 44,
        h: 58,
        hp: 2,
        speed: 42,
      },
      {
        type: "crawler",
        frames: [
          [126, 408, 98, 76],
          [330, 410, 100, 74],
          [516, 420, 98, 64],
          [708, 416, 98, 68],
        ],
        w: 52,
        h: 34,
        hp: 2,
        speed: 70,
      },
      {
        type: "stalker",
        frames: [
          [136, 668, 56, 142],
          [336, 670, 74, 140],
          [526, 668, 66, 142],
          [730, 670, 60, 140],
        ],
        w: 34,
        h: 70,
        hp: 4,
        speed: 58,
      },
    ],
    expandedMonsters: [
      {
        type: "brute",
        sheet: "expandedMonsters",
        habitat: "surface",
        frames: [
          [150, 34, 224, 156],
          [476, 34, 168, 162],
          [762, 34, 228, 156],
          [1100, 34, 156, 156],
        ],
        w: 62,
        h: 64,
        hp: 7,
        speed: 34,
        damage: 2,
      },
      {
        type: "digger",
        sheet: "expandedMonsters",
        habitat: "underground",
        frames: [
          [150, 234, 154, 112],
          [442, 234, 172, 112],
          [754, 240, 264, 114],
          [1156, 228, 134, 122],
        ],
        w: 58,
        h: 42,
        hp: 4,
        speed: 64,
        damage: 1,
      },
      {
        type: "crystalBat",
        sheet: "expandedMonsters",
        habitat: "underground",
        flying: true,
        frames: [
          [140, 390, 196, 122],
          [438, 394, 170, 122],
          [736, 398, 146, 120],
          [1142, 394, 128, 122],
        ],
        w: 54,
        h: 38,
        hp: 3,
        speed: 82,
        damage: 1,
      },
      {
        type: "eel",
        sheet: "expandedMonsters",
        habitat: "water",
        aquatic: true,
        frames: [
          [132, 546, 170, 108],
          [404, 556, 216, 96],
          [702, 554, 312, 104],
          [1138, 554, 148, 108],
        ],
        w: 72,
        h: 34,
        hp: 4,
        speed: 92,
        damage: 1,
      },
      {
        type: "drowned",
        sheet: "expandedMonsters",
        habitat: "water",
        aquatic: true,
        frames: [
          [132, 694, 166, 112],
          [434, 698, 208, 108],
          [742, 694, 236, 114],
          [1150, 694, 150, 118],
        ],
        w: 58,
        h: 46,
        hp: 5,
        speed: 56,
        damage: 2,
      },
      {
        type: "imp",
        sheet: "expandedMonsters",
        habitat: "underground",
        frames: [
          [150, 846, 134, 142],
          [428, 846, 180, 140],
          [750, 846, 184, 140],
          [1152, 846, 144, 142],
        ],
        w: 46,
        h: 58,
        hp: 5,
        speed: 66,
        damage: 2,
      },
    ],
  };

  const assets = {
    tiles: loadImage("assets/generated/tileset-flat.png"),
    player: loadImage("assets/generated/player-explorer.png"),
    animals: loadImage("assets/generated/friendly-animals.png"),
    monsters: loadImage("assets/generated/hostile-monsters.png"),
    expandedMonsters: loadImage("assets/generated/expanded-monsters.png"),
    equipment: loadImage("assets/generated/equipment-items.png"),
    relics: loadImage("assets/generated/relic-progression.png"),
    ui: loadImage("assets/generated/ui-items.png"),
    day: loadImage("assets/generated/background-day.png"),
    night: loadImage("assets/generated/background-night.png"),
  };

  const keys = new Set();
  const touchControls = new Set();
  const mouse = { x: VIEW_W / 2, y: VIEW_H / 2, worldX: 0, worldY: 0, down: false, right: false };
  const camera = { x: 0, y: 0 };
  let lastTime = performance.now();
  let selected = 0;
  let world;
  let player;
  let entities;
  let particles;
  let floatingTexts;
  let inventoryBursts;
  let resourcePulse;
  let projectiles;
  let gameTime;
  let dayCount;
  let gameOver;
  let miningTarget;
  let swingTimer;
  let weaponAction;
  let weaponActionTimer;
  let hitCooldown;
  let shootCooldown;
  let shotsFired;
  let lastProjectileRemoval;
  let spawnTimer;
  let message = "낮에는 자원을 모으고, 밤에는 버티세요.";
  let frameCount = 0;
  let lastError = null;
  let touchMining = false;
  let resources;
  let activeDifficulty = difficulties.normal;
  let crafted;
  let equipped;
  let discovered;
  let relics;
  let completedQuests;
  let completedMiniQuests;
  let unlockedArrows;
  let stats;
  let experience;
  let playerLevel;
  let eventState;
  let safeCamp;
  let audioCtx = null;
  let playerName = "개척자";
  let gameStarted = false;
  let loopHandle = null;
  let activePanel = null;

  const hotbar = [
    { type: "block", block: BLOCKS.dirt, key: "1", count: 18 },
    { type: "block", block: BLOCKS.stone, key: "2", count: 8 },
    { type: "block", block: BLOCKS.plank, key: "3", count: 10 },
    { type: "block", block: BLOCKS.torch, key: "4", count: 5 },
    { type: "block", block: BLOCKS.fence, key: "5", count: 12 },
    { type: "block", block: BLOCKS.workbench, key: "6", count: 1 },
    { type: "item", item: ITEMS.grass, key: "7", count: 8 },
    { type: "item", item: ITEMS.seed, key: "8", count: 8 },
    { type: "item", item: ITEMS.apple, key: "9", count: 4 },
  ];

  function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  function waitForAssets() {
    const images = Object.values(assets);
    return Promise.all(
      images.map(
        (img) =>
          new Promise((resolve, reject) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve();
            } else {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", () => reject(new Error(`asset failed: ${img.src}`)), { once: true });
            }
          }),
      ),
    );
  }

  function resetGame(difficultyKey = activeDifficulty?.key || "normal", rawName = playerNameInput?.value || playerName) {
    activeDifficulty = { key: difficultyKey, ...difficulties[difficultyKey] };
    playerName = normalizePlayerName(rawName);
    WORLD_W = 220;
    world = createWorld();
    stats = {
      minedBlocks: 0,
      placedBlocks: 0,
      placedWorkbench: 0,
      craftedItems: 0,
      monsterKills: 0,
      monsterKillsByType: {},
      monsterKillsByHabitat: { surface: 0, underground: 0, water: 0 },
      eliteKills: 0,
      arrowKills: 0,
      animalsCaptured: 0,
      chestsOpened: 0,
      daysSurvived: 0,
      itemsGained: {},
    };
    crafted = new Set(["huntingBow"]);
    equipped = { weapon: "huntingBow", armor: null, boots: null, offhand: null, arrow: "wood" };
    discovered = new Set(["start", "surface", difficultyKey]);
    relics = new Set();
    completedQuests = new Set();
    completedMiniQuests = new Set();
    unlockedArrows = new Set(["wood"]);
    experience = 0;
    playerLevel = 1;
    eventState = { type: null, title: "", remaining: 0, cooldown: 28 };
    player = {
      x: 9 * TILE,
      y: 9 * TILE,
      w: 28,
      h: 52,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: false,
      health: maxPlayerHealth(),
      hunger: 10,
      invuln: 0,
      anim: 0,
      mined: 0,
      inWater: false,
    };
    entities = [];
    particles = [];
    floatingTexts = [];
    inventoryBursts = [];
    resourcePulse = {};
    projectiles = [];
    gameTime = 0;
    dayCount = 1;
    gameOver = false;
    miningTarget = null;
    swingTimer = 0;
    weaponAction = null;
    weaponActionTimer = 0;
    hitCooldown = 0;
    shootCooldown = 0;
    shotsFired = 0;
    lastProjectileRemoval = "";
    spawnTimer = 0;
    safeCamp = null;
    message = `${playerName}, 안전 캠프에서 쉬며 천천히 시작하세요.`;
    hotbar[0].count = 18;
    hotbar[1].count = 8;
    hotbar[2].count = 10;
    hotbar[3].count = 5;
    hotbar[4].count = 12;
    hotbar[5].count = 1;
    hotbar[6].count = 8;
    hotbar[7].count = 8;
    hotbar[8].count = 4;
    resources = {
      [ITEMS.egg]: 0,
      [ITEMS.wool]: 0,
      [ITEMS.milk]: 0,
      [ITEMS.meat]: 0,
      [ITEMS.leather]: 0,
      [ITEMS.feather]: 0,
      [ITEMS.coal]: 0,
      [ITEMS.copper]: 0,
      [ITEMS.iron]: 0,
      [ITEMS.crystal]: 0,
    };
    gameStarted = true;
    createSafeCamp();
    placeTreasureChests(14, WORLD_W - 16, 5);
    spawnAnimals();
    updateHotbar();
    updateResourceBar();
    updateQuestTracker();
    updateEventBanner();
    renderOpenPanel();
  }

  function createWorld() {
    const tiles = Array.from({ length: WORLD_H }, () => Array(WORLD_W).fill(BLOCKS.air));
    const heights = [];
    for (let x = 0; x < WORLD_W; x += 1) {
      heights[x] = terrainHeight(x);
    }

    for (let x = 0; x < WORLD_W; x += 1) {
      const h = heights[x];
      for (let y = h; y < WORLD_H; y += 1) {
        if (y === h) {
          tiles[y][x] = x > 32 && x < 43 ? BLOCKS.sand : BLOCKS.grass;
        } else if (y < h + 4) {
          tiles[y][x] = Math.random() > 0.7 ? BLOCKS.rockyDirt : BLOCKS.dirt;
        } else if (y < 35) {
          tiles[y][x] = Math.random() > 0.88 ? BLOCKS.gravel : BLOCKS.stone;
        } else {
          tiles[y][x] = Math.random() > 0.82 ? BLOCKS.darkStone : BLOCKS.stone;
        }
      }
    }

    for (let x = 34; x < 43; x += 1) {
      for (let y = heights[x] + 1; y < Math.min(heights[x] + 4, WORLD_H); y += 1) {
        tiles[y][x] = BLOCKS.water;
      }
    }

    carveCaves(tiles, heights, 0, WORLD_W - 1);
    addOre(tiles, BLOCKS.coal, 26, 3, 29);
    addOre(tiles, BLOCKS.copper, 18, 6, 38);
    addOre(tiles, BLOCKS.iron, 15, 12, 43);
    addTrees(tiles, heights);
    return { tiles, heights };
  }

  function terrainHeight(x) {
    const base = 22 + Math.sin(x * 0.08) * 2.4 + Math.sin(x * 0.027) * 4.2 + Math.sin(x * 0.17) * 0.9;
    return Math.floor(base);
  }

  function ensureWorldExpansion() {
    if (!world || player.x < (WORLD_W - 48) * TILE) return;
    appendWorldColumns(EXPAND_COLUMNS);
    discovered.add("expandedWorld");
    message = `월드가 동쪽으로 ${EXPAND_COLUMNS}칸 확장되었습니다.`;
  }

  function appendWorldColumns(count) {
    const start = WORLD_W;
    WORLD_W += count;
    for (let y = 0; y < WORLD_H; y += 1) {
      while (world.tiles[y].length < WORLD_W) world.tiles[y].push(BLOCKS.air);
    }
    for (let x = start; x < WORLD_W; x += 1) {
      const h = terrainHeight(x);
      world.heights[x] = h;
      for (let y = h; y < WORLD_H; y += 1) {
        if (y === h) world.tiles[y][x] = x % 89 > 40 && x % 89 < 53 ? BLOCKS.sand : BLOCKS.grass;
        else if (y < h + 4) world.tiles[y][x] = Math.random() > 0.7 ? BLOCKS.rockyDirt : BLOCKS.dirt;
        else if (y < 46) world.tiles[y][x] = Math.random() > 0.88 ? BLOCKS.gravel : BLOCKS.stone;
        else world.tiles[y][x] = Math.random() > 0.8 ? BLOCKS.darkStone : BLOCKS.stone;
      }
      if (x % 89 > 42 && x % 89 < 52) {
        for (let y = h + 1; y < Math.min(h + 5, WORLD_H); y += 1) world.tiles[y][x] = BLOCKS.water;
      }
    }
    carveCaves(world.tiles, world.heights, start, WORLD_W - 1);
    addOre(world.tiles, BLOCKS.coal, Math.floor(count / 8), 3, 42, start, WORLD_W - 1);
    addOre(world.tiles, BLOCKS.copper, Math.floor(count / 10), 8, 52, start, WORLD_W - 1);
    addOre(world.tiles, BLOCKS.iron, Math.floor(count / 12), 16, 62, start, WORLD_W - 1);
    addTrees(world.tiles, world.heights, start, WORLD_W - 8);
    placeTreasureChests(start + 8, WORLD_W - 10, 2);
    spawnAnimals(start, WORLD_W - 8);
  }

  function carveCaves(tiles, heights, startX, endX) {
    const caveCount = Math.max(5, Math.floor((endX - startX) / 18));
    for (let i = 0; i < caveCount; i += 1) {
      let cx = randInt(Math.max(6, startX), Math.min(endX - 6, WORLD_W - 6));
      let cy = randInt(heights[cx] + 7, WORLD_H - 10);
      const length = randInt(18, 42);
      for (let step = 0; step < length; step += 1) {
        const radius = randInt(1, 2);
        for (let yy = -radius; yy <= radius; yy += 1) {
          for (let xx = -radius; xx <= radius; xx += 1) {
            if (Math.hypot(xx, yy) <= radius + 0.25 && inBounds(cx + xx, cy + yy)) {
              tiles[cy + yy][cx + xx] = Math.random() < 0.08 && cy > WORLD_H - 16 ? BLOCKS.water : BLOCKS.air;
            }
          }
        }
        cx = clamp(cx + randInt(-1, 2), startX + 3, endX - 3);
        cy = clamp(cy + randInt(-1, 1), heights[cx] + 5, WORLD_H - 6);
      }
    }
  }

  function addOre(tiles, block, clusters, minY, maxY, xMin = 8, xMax = WORLD_W - 8) {
    for (let i = 0; i < clusters; i += 1) {
      const cx = randInt(xMin, xMax);
      const cy = randInt(minY + 18, maxY);
      const radius = randInt(2, 4);
      for (let yy = -radius; yy <= radius; yy += 1) {
        for (let xx = -radius; xx <= radius; xx += 1) {
          const x = cx + xx;
          const y = cy + yy;
          if (inBounds(x, y) && Math.hypot(xx, yy) <= radius && isRock(tiles[y][x]) && Math.random() > 0.35) {
            tiles[y][x] = block;
          }
        }
      }
    }
  }

  function addTrees(tiles, heights, startX = 8, endX = WORLD_W - 8) {
    for (let x = startX; x < endX; x += randInt(8, 16)) {
      if (Math.random() < 0.35 || x > 32 && x < 46) continue;
      const ground = heights[x];
      const trunkHeight = randInt(3, 5);
      for (let y = ground - trunkHeight; y < ground; y += 1) {
        if (inBounds(x, y)) tiles[y][x] = BLOCKS.trunk;
      }
      for (let yy = -2; yy <= 1; yy += 1) {
        for (let xx = -2; xx <= 2; xx += 1) {
          if (Math.abs(xx) + Math.abs(yy) < 4 && inBounds(x + xx, ground - trunkHeight + yy)) {
            tiles[ground - trunkHeight + yy][x + xx] = BLOCKS.leaves;
          }
        }
      }
    }
  }

  function placeTreasureChests(startX, endX, count) {
    if (!world) return;
    let placed = 0;
    for (let attempt = 0; attempt < count * 18 && placed < count; attempt += 1) {
      const x = randInt(Math.max(4, startX), Math.min(endX, WORLD_W - 5));
      const surface = surfaceY(x);
      const y = surface - 1;
      if (y < 2) continue;
      if (getTile(x, y) !== BLOCKS.air || !isSolid(getTile(x, y + 1))) continue;
      if (Math.abs(x - Math.floor(player?.x / TILE || 0)) < 8) continue;
      setTile(x, y, BLOCKS.chest);
      placed += 1;
    }
  }

  function spawnAnimals(startX = 5, endX = WORLD_W - 5) {
    const count = startX === 5 ? 14 : 5;
    for (let i = 0; i < count; i += 1) {
      const spec = atlas.animals[i % atlas.animals.length];
      const spawn = findDrySurfaceAnimalTile(startX, endX, spec);
      if (spawn) createAnimal(spec, spawn.x * TILE, spawn.y * TILE - spec.h, "surface");
    }
    for (let i = 0; i < Math.max(2, Math.floor(count / 3)); i += 1) {
      const water = findWaterTile(startX, endX);
      if (water) createAnimal({ ...atlas.animals[2], type: "fish", aquatic: true }, water.x * TILE, water.y * TILE, "water");
    }
    for (let i = 0; i < Math.max(2, Math.floor(count / 4)); i += 1) {
      const moleSpec = { ...atlas.animals[1], type: "mole", cave: true, w: 42, h: 28 };
      const cave = findDryCaveAnimalTile(startX, endX, moleSpec);
      if (cave) createAnimal(moleSpec, cave.x * TILE, cave.y * TILE, "underground");
    }
  }

  function createAnimal(spec, x, y, habitat) {
    let spawnX = x;
    let spawnY = y;
    if (!spec.aquatic && habitat === "surface") {
      const tileX = Math.floor(x / TILE);
      const groundY = Math.round((y + spec.h) / TILE);
      if (!isDrySurfaceAnimalTile(tileX, groundY, spec)) {
        const fallback = findDrySurfaceAnimalTile(Math.max(5, tileX - 24), Math.min(WORLD_W - 5, tileX + 24), spec);
        if (!fallback) return;
        spawnX = fallback.x * TILE;
        spawnY = fallback.y * TILE - spec.h;
      }
    }
    entities.push({
      kind: "animal",
      spec,
      x: spawnX,
      y: spawnY,
      w: spec.w,
      h: spec.h,
      vx: Math.random() > 0.5 ? 20 : -20,
      vy: 0,
      hp: 2,
      anim: Math.random() * 10,
      grounded: false,
      wander: Math.random() * 4,
      facing: Math.random() > 0.5 ? 1 : -1,
      interactCooldown: 3 + Math.random() * 4,
      productionTimer: 24 + Math.random() * 18,
      captured: false,
      following: 0,
      spawnWaterSafeTimer: 2,
      drownTimer: 0,
      drownTextTimer: 0,
      habitat,
    });
  }

  function findDrySurfaceAnimalTile(startX, endX, spec) {
    const minX = clamp(startX, 3, WORLD_W - 4);
    const maxX = clamp(endX, minX, WORLD_W - 3);
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const x = randInt(minX, maxX);
      const y = surfaceY(x);
      if (isDrySurfaceAnimalTile(x, y, spec)) return { x, y };
    }
    return null;
  }

  function isDrySurfaceAnimalTile(x, y, spec) {
    const widthTiles = Math.max(1, Math.ceil(spec.w / TILE));
    const minX = x;
    const maxX = x + widthTiles - 1;
    if (y < 2 || maxX >= WORLD_W - 1) return false;
    const body = { x: x * TILE, y: y * TILE - spec.h, w: spec.w, h: spec.h };
    if (isBodyInWater(body)) return false;
    if (hasWaterNearAnimalSpawn(x, y, spec)) return false;
    for (let tx = minX; tx <= maxX; tx += 1) {
      if (!isSolid(getTile(tx, y))) return false;
      if (getTile(tx, y - 1) !== BLOCKS.air || getTile(tx, y - 2) === BLOCKS.water) return false;
      if (getTile(tx, y) === BLOCKS.water || getTile(tx, y - 1) === BLOCKS.water) return false;
      if (getTile(tx, y + 1) === BLOCKS.water) return false;
    }
    for (let tx = minX - 1; tx <= maxX + 1; tx += 1) {
      if (getTile(tx, y - 1) === BLOCKS.water || getTile(tx, y) === BLOCKS.water) return false;
    }
    return true;
  }

  function hasWaterNearAnimalSpawn(x, y, spec) {
    const widthTiles = Math.max(1, Math.ceil(spec.w / TILE));
    const topY = Math.floor((y * TILE - spec.h) / TILE);
    for (let tx = x - 2; tx <= x + widthTiles + 1; tx += 1) {
      for (let ty = topY - 1; ty <= y + 3; ty += 1) {
        if (getTile(tx, ty) === BLOCKS.water) return true;
      }
    }
    return false;
  }

  function findDryCaveAnimalTile(startX, endX, spec) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const cave = findCaveTile(startX, endX);
      if (!cave) return null;
      const body = { x: cave.x * TILE, y: cave.y * TILE, w: spec.w, h: spec.h };
      if (!isBodyInWater(body) && !hasWaterNearAnimalBody(body, 2)) return cave;
    }
    return null;
  }

  function hasWaterNearAnimalBody(body, radiusTiles = 1) {
    const minX = Math.floor(body.x / TILE) - radiusTiles;
    const maxX = Math.floor((body.x + body.w) / TILE) + radiusTiles;
    const minY = Math.floor(body.y / TILE) - radiusTiles;
    const maxY = Math.floor((body.y + body.h) / TILE) + radiusTiles;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (getTile(x, y) === BLOCKS.water) return true;
      }
    }
    return false;
  }

  function spawnMonster() {
    const night = nightAmount();
    const eventSpawn = isEventActive("moonSurge") ? 1.45 : 1;
    const cap = Math.floor((8 + dayCount * 1.2) * activeDifficulty.spawnRate * eventSpawn);
    if (night < 0.55 || entities.filter((e) => e.kind === "monster").length > cap) return;
    const side = Math.random() > 0.5 ? -1 : 1;
    const spawnX = clamp(player.x + side * randInt(520, 860), 4 * TILE, (WORLD_W - 4) * TILE);
    let xTile = clamp(Math.floor(spawnX / TILE), 3, WORLD_W - 3);
    const deep = player.y > (surfaceY(Math.floor(player.x / TILE)) + 7) * TILE;
    const inWater = isBodyInWater(player);
    const spec = pickMonsterSpec(deep, inWater);
    const level = 1 + (dayCount - 1) * 0.22;
    const eliteChance = clamp(0.04 + dayCount * 0.018 + (isEventActive("moonSurge") ? 0.08 : 0), 0.04, 0.28);
    const elite = dayCount >= 2 && Math.random() < eliteChance;
    let yTile = surfaceY(xTile);
    if (spec.habitat === "underground") {
      const cave = findCaveTile(Math.max(3, xTile - 18), Math.min(WORLD_W - 3, xTile + 18));
      if (!cave) return;
      xTile = cave.x;
      yTile = cave.y;
    }
    if (spec.habitat === "water") {
      const water = findWaterTile(Math.max(3, xTile - 18), Math.min(WORLD_W - 3, xTile + 18));
      if (!water) return;
      yTile = water.y;
    }
    entities.push({
      kind: "monster",
      spec,
      x: xTile * TILE,
      y: yTile * TILE - spec.h,
      w: spec.w,
      h: spec.h,
      vx: 0,
      vy: 0,
      hp: Math.ceil(spec.hp * level * activeDifficulty.monsterHp * (elite ? 1.65 : 1)),
      maxHp: Math.ceil(spec.hp * level * activeDifficulty.monsterHp * (elite ? 1.65 : 1)),
      damage: Math.max(1, Math.ceil((spec.damage || 1) * level * activeDifficulty.monsterDamage * (elite ? 1.35 : 1))),
      elite,
      anim: 0,
      grounded: false,
      facing: side * -1,
      attackTimer: 0,
    });
    discovered.add(`monster:${spec.type}`);
  }

  function pickMonsterSpec(deep, inWater) {
    const pool = [...atlas.monsters.map((spec) => ({ ...spec, habitat: "surface", damage: 1 })), ...atlas.expandedMonsters];
    const filtered = pool.filter((spec) => {
      if (inWater) return spec.habitat === "water";
      if (deep) return spec.habitat === "underground";
      return spec.habitat === "surface";
    });
    return filtered[randInt(0, filtered.length - 1)] || atlas.monsters[0];
  }

  function clearDayMonsters() {
    if (!entities?.some((e) => e.kind === "monster")) return;
    entities = entities.filter((entity) => {
      if (entity.kind !== "monster") return true;
      burst(entity.x + entity.w / 2, entity.y + entity.h / 2, "#ffd166", 8);
      return false;
    });
  }

  function findWaterTile(startX, endX) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const x = randInt(clamp(startX, 2, WORLD_W - 3), clamp(endX, 3, WORLD_W - 2));
      for (let y = surfaceY(x); y < Math.min(surfaceY(x) + 7, WORLD_H); y += 1) {
        if (getTile(x, y) === BLOCKS.water) return { x, y };
      }
    }
    return null;
  }

  function findCaveTile(startX, endX) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const x = randInt(clamp(startX, 2, WORLD_W - 3), clamp(endX, 3, WORLD_W - 2));
      const y = randInt(surfaceY(x) + 7, WORLD_H - 8);
      if (getTile(x, y) === BLOCKS.air && getTile(x, y + 1) === BLOCKS.air) return { x, y };
    }
    return null;
  }

  function createSafeCamp() {
    const centerX = 10;
    const baseY = surfaceY(centerX);
    const left = centerX - 8;
    const right = centerX + 10;
    for (let x = left; x <= right; x += 1) {
      const ground = baseY;
      for (let y = Math.max(1, ground - 6); y < ground; y += 1) setTile(x, y, BLOCKS.air);
      setTile(x, ground, BLOCKS.grass);
      for (let y = ground + 1; y <= Math.min(WORLD_H - 1, ground + 7); y += 1) setTile(x, y, BLOCKS.dirt);
    }
    for (let x = left - 1; x <= right + 1; x += 1) {
      for (let y = baseY - 1; y <= Math.min(WORLD_H - 1, baseY + 8); y += 1) {
        if (getTile(x, y) === BLOCKS.water) setTile(x, y, y <= baseY ? BLOCKS.air : BLOCKS.dirt);
      }
    }
    setTile(centerX - 3, baseY - 1, BLOCKS.campBed);
    setTile(centerX - 2, baseY - 1, BLOCKS.campBed);
    setTile(centerX + 1, baseY - 1, BLOCKS.campLantern);
    setTile(centerX + 4, baseY - 1, BLOCKS.musicBox);
    setTile(left, baseY - 1, BLOCKS.fence);
    setTile(left + 1, baseY - 1, BLOCKS.fence);
    setTile(right - 1, baseY - 1, BLOCKS.fence);
    setTile(right, baseY - 1, BLOCKS.fence);
    safeCamp = {
      x: centerX,
      y: baseY,
      radius: 8,
      comfortTimer: 0,
      musicTimer: 0,
      healTick: 0,
      sparkleTick: 0,
    };
    player.x = (centerX - 1) * TILE;
    player.y = (baseY - 3) * TILE;
    const chicken = { ...atlas.animals[2], type: "chicken", w: 34, h: 30 };
    const sheep = { ...atlas.animals[1], type: "sheep" };
    createAnimal(chicken, (centerX + 2) * TILE, baseY * TILE - chicken.h, "surface");
    createAnimal(chicken, (centerX + 3) * TILE, baseY * TILE - chicken.h, "surface");
    createAnimal(sheep, (centerX + 6) * TILE, baseY * TILE - sheep.h, "surface");
    discovered.add("safeCamp");
  }

  function updateSafeCamp(dt) {
    if (!safeCamp || !player) return;
    safeCamp.comfortTimer = Math.max(0, safeCamp.comfortTimer - dt);
    safeCamp.musicTimer = Math.max(0, safeCamp.musicTimer - dt);
    safeCamp.healTick = Math.max(0, safeCamp.healTick - dt);
    safeCamp.sparkleTick = Math.max(0, safeCamp.sparkleTick - dt);
    const near = isPlayerInSafeCamp();
    if (!near) return;
    discovered.add("safeCamp");
    if (safeCamp.sparkleTick <= 0) {
      const color = safeCamp.musicTimer > 0 ? "#b794ff" : "#ffd166";
      burst(player.x + player.w / 2 + randInt(-36, 36), player.y + randInt(4, 44), color, 1);
      safeCamp.sparkleTick = safeCamp.musicTimer > 0 ? 0.26 : 0.55;
    }
    const healDelay = safeCamp.comfortTimer > 0 ? 1.15 : 2.6;
    if (safeCamp.healTick <= 0) {
      const maxHealth = maxPlayerHealth();
      if (player.health < maxHealth) {
        player.health = Math.min(maxHealth, player.health + 1);
        floatingTexts.push({
          text: safeCamp.musicTimer > 0 ? "♪ 회복" : "+회복",
          x: player.x + player.w / 2,
          y: player.y - 14,
          life: 0.9,
          color: safeCamp.musicTimer > 0 ? "#d7b5ff" : "#7ee081",
        });
      }
      if (safeCamp.comfortTimer > 0 && player.hunger < 10) player.hunger = Math.min(10, player.hunger + 0.25);
      safeCamp.healTick = healDelay;
    }
  }

  function isPlayerInSafeCamp() {
    if (!safeCamp || !player) return false;
    const px = (player.x + player.w / 2) / TILE;
    const py = (player.y + player.h / 2) / TILE;
    return Math.abs(px - safeCamp.x) <= safeCamp.radius && Math.abs(py - safeCamp.y) <= 4.5;
  }

  function update(dt) {
    if (gameOver) {
      updateCamera(dt);
      updateParticles(dt);
      return;
    }

    gameTime += dt / (PHASE_SECONDS * 2);
    if (gameTime >= 1) {
      gameTime -= 1;
      dayCount += 1;
      stats.daysSurvived += 1;
      player.hunger = Math.max(0, player.hunger - 1);
      if (relics?.has("sunCharm")) player.health = Math.min(maxPlayerHealth(), player.health + 2);
      grantXp(10, "하루 생존");
      spawnTimer = 0;
    }

    if (gameTime < 0.5) clearDayMonsters();

    hitCooldown = Math.max(0, hitCooldown - dt);
    shootCooldown = Math.max(0, shootCooldown - dt);
    swingTimer = Math.max(0, swingTimer - dt);
    weaponActionTimer = Math.max(0, weaponActionTimer - dt);
    if (weaponActionTimer <= 0) weaponAction = null;
    player.invuln = Math.max(0, player.invuln - dt);
    player.anim += dt;
    updateWorldEvents(dt);
    if (gameTime >= 0.5) spawnTimer -= dt;
    if (gameTime >= 0.5 && spawnTimer <= 0) {
      spawnMonster();
      spawnTimer = (1.8 + Math.random() * 1.8) / (activeDifficulty.spawnRate * (isEventActive("moonSurge") ? 1.35 : 1));
    }

    updatePlayer(dt);
    updateSafeCamp(dt);
    updateMining(dt);
    updateEntities(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateInventoryBursts(dt);
    ensureWorldExpansion();
    updateCamera(dt);
    updateQuestProgress();
    updateLabels();
  }

  function updatePlayer(dt) {
    const left = keys.has("a") || keys.has("arrowleft") || touchControls.has("left");
    const right = keys.has("d") || keys.has("arrowright") || touchControls.has("right");
    const jump = keys.has(" ") || keys.has("w") || keys.has("arrowup") || touchControls.has("jump");
    player.inWater = isBodyInWater(player);
    if (player.inWater) discovered.add("water");
    if (player.y > (surfaceY(Math.floor(player.x / TILE)) + 7) * TILE) discovered.add("underground");
    const flipperBonus = (equipped?.boots === "flippers" ? 1.35 : 1) + (relics?.has("tidePearl") ? 0.25 : 0);
    const speedBonus = relics?.has("swiftCharm") && !player.inWater ? 1.12 : 1;
    const speed = (player.hunger <= 0 ? 130 : 190) * speedBonus * (player.inWater ? 0.72 * flipperBonus : 1);
    const accel = player.inWater ? 1350 * flipperBonus : player.grounded ? 2200 * speedBonus : 1200;
    const friction = player.inWater ? 0.9 : player.grounded ? 0.82 : 0.94;

    if (left) {
      player.vx -= accel * dt;
      player.facing = -1;
    }
    if (right) {
      player.vx += accel * dt;
      player.facing = 1;
    }
    if (!left && !right) {
      player.vx *= friction;
    }
    player.vx = clamp(player.vx, -speed, speed);
    if (jump && player.inWater) {
      player.vy -= 760 * flipperBonus * dt;
      player.vy = Math.max(player.vy, -260 * flipperBonus);
      if (Math.random() < 0.08) burst(player.x + player.w / 2, player.y + player.h * 0.6, "#70c8ff", 1);
    } else if (jump && player.grounded) {
      player.vy = -640;
      player.grounded = false;
      burst(player.x + player.w / 2, player.y + player.h, "#d2c39b", 9);
    }
    player.vy += (player.inWater ? GRAVITY * 0.22 : GRAVITY) * dt;
    if (player.inWater) player.vy *= 0.94;
    moveBody(player, dt);
    player.x = clamp(player.x, 2 * TILE, (WORLD_W - 3) * TILE);
    if (player.y > WORLD_H * TILE + 300) hurtPlayer(10);
  }

  function updateMining(dt) {
    if (touchMining) aimAtTile(actionTarget("mine"));
    const tx = Math.floor(mouse.worldX / TILE);
    const ty = Math.floor(mouse.worldY / TILE);
    const dist = Math.hypot(mouse.worldX - (player.x + player.w / 2), mouse.worldY - (player.y + player.h / 2));
    const sameTarget = miningTarget && miningTarget.x === tx && miningTarget.y === ty;

    if ((!mouse.down && !touchMining) || dist > MAX_TARGET_DISTANCE || !inBounds(tx, ty) || getTile(tx, ty) === BLOCKS.air) {
      miningTarget = null;
      return;
    }

    const block = getTile(tx, ty);
    if (!sameTarget) {
      miningTarget = { x: tx, y: ty, progress: 0, block };
    }

    miningTarget.progress += dt * miningSpeedMultiplier();
    swingTimer = 0.22;
    weaponAction = "mine";
    weaponActionTimer = 0.22;
    if (miningTarget.progress >= (blockInfo[block]?.hardness || 0.5)) {
      mineBlock(tx, ty, block);
      miningTarget = null;
    }
  }

  function mineBlock(tx, ty, block) {
    setTile(tx, ty, BLOCKS.air);
    const oreDrop = oreResource(block);
    if (oreDrop) {
      addResource(oreDrop, scaledDrop(1, oreDrop), `${itemInfo[oreDrop].name} 획득`);
      if (block === BLOCKS.copper || block === BLOCKS.iron) discovered.add("oreCrafting");
      if (block === BLOCKS.coal) discovered.add("coal");
    }
    const slot = hotbar.find((item) => item.type === "block" && item.block === normalizeDrop(block));
    if (slot && !oreDrop) {
      slot.count += 1;
      recordItemGain(blockRewardKey(slot.block), 1);
    }
    player.mined += 1;
    stats.minedBlocks += 1;
    if (!oreDrop) message = `${blockInfo[block]?.name || "블록"} 획득`;
    burst(tx * TILE + TILE / 2, ty * TILE + TILE / 2, blockColor(block), 14);
    floatingTexts.push({ text: "+1", x: tx * TILE + TILE / 2, y: ty * TILE, life: 0.9, color: "#ffd166" });
    updateHotbar();
    updateQuestProgress();
  }

  function normalizeDrop(block) {
    if (block === BLOCKS.grass || block === BLOCKS.rockyDirt) return BLOCKS.dirt;
    if ([BLOCKS.coal, BLOCKS.copper, BLOCKS.iron, BLOCKS.darkStone, BLOCKS.gravel].includes(block)) return BLOCKS.stone;
    return block;
  }

  function oreResource(block) {
    if (block === BLOCKS.coal) return ITEMS.coal;
    if (block === BLOCKS.copper) return ITEMS.copper;
    if (block === BLOCKS.iron) return ITEMS.iron;
    return null;
  }

  function placeBlock(tx, ty) {
    if (!inBounds(tx, ty) || getTile(tx, ty) !== BLOCKS.air) return;
    const dist = Math.hypot(mouse.worldX - (player.x + player.w / 2), mouse.worldY - (player.y + player.h / 2));
    if (dist > MAX_TARGET_DISTANCE) return;
    const item = hotbar[selected];
    if (!item || item.type !== "block" || item.count <= 0) {
      message = "블록 슬롯을 선택해야 설치할 수 있습니다.";
      return;
    }
    const rect = { x: tx * TILE, y: ty * TILE, w: TILE, h: TILE };
    if (aabb(rect, player)) return;
    setTile(tx, ty, item.block);
    item.count -= 1;
    stats.placedBlocks += 1;
    if (item.block === BLOCKS.workbench) {
      stats.placedWorkbench += 1;
      discovered.add("workbench");
      grantXp(4, "제작대 설치");
    }
    message = `${blockInfo[item.block].name} 설치`;
    burst(tx * TILE + TILE / 2, ty * TILE + TILE / 2, "#ffffff", 5);
    updateHotbar();
    updateQuestProgress();
  }

  function actionTarget(mode) {
    const px = Math.floor((player.x + player.w / 2) / TILE);
    const py = Math.floor((player.y + player.h * 0.62) / TILE);
    const dir = player.facing >= 0 ? 1 : -1;
    const mineCandidates = [
      [px + dir, py],
      [px + dir, py + 1],
      [px + dir, py - 1],
      [px + dir * 2, py],
      [px, py + 1],
    ];
    const placeCandidates = [
      [px + dir, py],
      [px + dir, py - 1],
      [px + dir, py + 1],
      [px + dir * 2, py],
    ];
    const candidates = mode === "mine" ? mineCandidates : placeCandidates;
    for (const [x, y] of candidates) {
      if (!inBounds(x, y)) continue;
      const block = getTile(x, y);
      if (mode === "mine" && block !== BLOCKS.air) return { x, y };
      if (mode === "place" && block === BLOCKS.air) return { x, y };
    }
    const [x, y] = candidates[0];
    return { x: clamp(x, 0, WORLD_W - 1), y: clamp(y, 0, WORLD_H - 1) };
  }

  function aimAtTile(tile) {
    mouse.worldX = tile.x * TILE + TILE / 2;
    mouse.worldY = tile.y * TILE + TILE / 2;
    mouse.x = mouse.worldX - camera.x;
    mouse.y = mouse.worldY - camera.y;
  }

  function updateEntities(dt) {
    for (const entity of entities) {
      entity.anim += dt;
      entity.attackTimer = Math.max(0, (entity.attackTimer || 0) - dt);
      if (entity.kind === "animal") {
        updateAnimal(entity, dt);
      } else {
        updateMonster(entity, dt);
      }
      if (entity.dead) continue;
      const swimmingEntity = entity.spec?.aquatic && isBodyInWater(entity);
      if (entity.spec?.flying || swimmingEntity) {
        entity.vy *= 0.96;
      } else {
        entity.vy += GRAVITY * dt;
      }
      moveBody(entity, dt);
    }
    entities = entities.filter((entity) => entity.hp > 0 && entity.y < WORLD_H * TILE + 300);
  }

  function updateAnimal(entity, dt) {
    entity.interactCooldown = Math.max(0, entity.interactCooldown - dt);
    entity.following = Math.max(0, entity.following - dt);
    entity.spawnWaterSafeTimer = Math.max(0, (entity.spawnWaterSafeTimer || 0) - dt);
    if (!entity.spec?.aquatic && isBodyInWater(entity)) {
      if (entity.spawnWaterSafeTimer > 0 && relocateAnimalToDrySpawn(entity)) return;
      updateDrowningAnimal(entity, dt);
      return;
    }
    entity.drownTimer = 0;
    entity.drownTextTimer = 0;
    const wasCaptured = entity.captured;
    entity.captured = isInPen(entity);
    if (!wasCaptured && entity.captured) {
      stats.animalsCaptured += 1;
      discovered.add("ranch");
      grantXp(6, "동물 포획");
      updateQuestProgress();
    }
    if (entity.captured) {
      entity.productionTimer -= dt;
      if (entity.productionTimer <= 0) {
        const product = passiveProduct(entity.spec.type);
        if (product) {
          addResource(product, 1, `${animalName(entity.spec.type)} 목장에서 ${itemInfo[product].name} 생산`);
          floatingTexts.push({
            text: `+${itemInfo[product].name}`,
            x: entity.x + entity.w / 2,
            y: entity.y - 10,
            life: 1.1,
            color: "#7ee081",
          });
        }
        entity.productionTimer = 38 + Math.random() * 32;
      }
    }

    const feed = selectedFeed();
    const dxToPlayer = player.x + player.w / 2 - (entity.x + entity.w / 2);
    const dyToPlayer = player.y + player.h / 2 - (entity.y + entity.h / 2);
    const attracted = feed && Math.hypot(dxToPlayer, dyToPlayer) < 230;
    if ((attracted || entity.following > 0) && Math.abs(dxToPlayer) > 38) {
      entity.vx += Math.sign(dxToPlayer) * 170 * dt;
      entity.vx = clamp(entity.vx, -52, 52);
      entity.facing = entity.vx >= 0 ? 1 : -1;
    }

    entity.wander -= dt;
    if (!attracted && entity.following <= 0 && entity.wander <= 0) {
      entity.wander = 1.2 + Math.random() * 3.5;
      entity.vx = (Math.random() * 2 - 1) * 26;
      entity.facing = entity.vx >= 0 ? 1 : -1;
    }
    if (Math.random() < 0.01 && entity.grounded) entity.vy = -320;
    if (waterAhead(entity)) {
      entity.vx *= -0.35;
      entity.facing *= -1;
    } else if (blockedAhead(entity)) {
      entity.vx *= -1;
      entity.facing *= -1;
    }
  }

  function relocateAnimalToDrySpawn(entity) {
    const tileX = Math.floor((entity.x + entity.w / 2) / TILE);
    const startX = Math.max(5, tileX - 36);
    const endX = Math.min(WORLD_W - 5, tileX + 36);
    const spawn =
      entity.habitat === "underground"
        ? findDryCaveAnimalTile(startX, endX, entity.spec)
        : findDrySurfaceAnimalTile(startX, endX, entity.spec);
    if (!spawn) return false;
    entity.x = spawn.x * TILE;
    entity.y = entity.habitat === "underground" ? spawn.y * TILE : spawn.y * TILE - entity.h;
    entity.vx = Math.random() > 0.5 ? 16 : -16;
    entity.vy = 0;
    entity.grounded = false;
    entity.drownTimer = 0;
    entity.drownTextTimer = 0;
    return true;
  }

  function updateDrowningAnimal(entity, dt) {
    entity.drownTimer = (entity.drownTimer || 0) + dt;
    entity.drownTextTimer = Math.max(0, (entity.drownTextTimer || 0) - dt);
    entity.following = 0;
    entity.captured = false;
    entity.vx *= 0.82;
    entity.vy -= 90 * dt;
    entity.vy = clamp(entity.vy, -120, 150);
    if (entity.drownTimer > 1 && entity.drownTextTimer <= 0) {
      popAnimalText(entity, "허우적", "#79c8ff");
      entity.drownTextTimer = 0.75;
    }
    if (entity.drownTimer >= 4.2) {
      entity.hp = 0;
      popAnimalText(entity, "익사", "#79c8ff");
      handleEntityDefeat(entity, "drown");
    }
  }

  function interact() {
    if (gameOver) return;
    const chest = nearestChest(3);
    if (chest) {
      openChest(chest.x, chest.y);
      return;
    }
    const campObject = nearestCampObject(3);
    if (campObject) {
      handleCampInteraction(campObject);
      return;
    }
    const animal = nearestAnimal(82);
    if (!animal) {
      message = "가까운 동물이나 상자가 없습니다.";
      return;
    }
    if (animal.interactCooldown > 0 && animal.spec.type !== "boar") {
      message = `${animalName(animal.spec.type)}이 아직 준비되지 않았습니다.`;
      return;
    }

    if (animal.spec.type === "chicken") {
      addResource(ITEMS.egg, 1, "닭에게서 알 획득");
      animal.interactCooldown = 28;
      popAnimalText(animal, "+알", "#ffd166");
    } else if (animal.spec.type === "sheep") {
      addResource(ITEMS.wool, 1, "양에게서 털 획득");
      animal.interactCooldown = 42;
      popAnimalText(animal, "+털", "#eef5ff");
    } else if (animal.spec.type === "cow") {
      addResource(ITEMS.milk, 1, "소에게서 우유 획득");
      animal.interactCooldown = 36;
      popAnimalText(animal, "+우유", "#d8e2ea");
    } else if (animal.spec.type === "boar") {
      const feed = selectedFeed();
      if (!feed) {
        message = "돼지는 풀, 씨앗, 사과를 들고 상호작용하면 따라옵니다.";
        return;
      }
      if (consumeSelected(1)) {
        animal.following = 95;
        animal.interactCooldown = 4;
        message = `돼지에게 ${itemInfo[feed].name}을 줬습니다.`;
        popAnimalText(animal, "따라옴", "#7ee081");
      }
    }
  }

  function nearestCampObject(rangeTiles) {
    if (!safeCamp) return null;
    const px = Math.floor((player.x + player.w / 2) / TILE);
    const py = Math.floor((player.y + player.h / 2) / TILE);
    let best = null;
    let bestDistance = rangeTiles + 1;
    for (let y = py - rangeTiles; y <= py + rangeTiles; y += 1) {
      for (let x = px - rangeTiles; x <= px + rangeTiles; x += 1) {
        const block = getTile(x, y);
        if (![BLOCKS.campBed, BLOCKS.campLantern, BLOCKS.musicBox].includes(block)) continue;
        const distance = Math.hypot(x - px, y - py);
        if (distance < bestDistance) {
          best = { x, y, block };
          bestDistance = distance;
        }
      }
    }
    return best;
  }

  function handleCampInteraction(object) {
    discovered.add("safeCamp");
    if (object.block === BLOCKS.campBed) {
      safeCamp.comfortTimer = 18;
      safeCamp.healTick = 0;
      player.health = Math.min(maxPlayerHealth(), player.health + 3);
      player.hunger = Math.min(10, player.hunger + 1);
      message = `${playerName}, 안전 캠프에서 잠시 숨을 고릅니다.`;
      floatingTexts.push({ text: "따뜻한 휴식", x: player.x + player.w / 2, y: player.y - 18, life: 1.2, color: "#ffd166" });
      burst(object.x * TILE + TILE / 2, object.y * TILE + TILE / 2, "#ffd166", 16);
      return;
    }
    if (object.block === BLOCKS.musicBox) {
      safeCamp.musicTimer = 50;
      safeCamp.comfortTimer = Math.max(safeCamp.comfortTimer, 14);
      message = "작은 음악이 캠프를 편안하게 감쌉니다.";
      playCampMelody();
      for (let i = 0; i < 8; i += 1) {
        floatingTexts.push({
          text: i % 2 ? "♪" : "♬",
          x: object.x * TILE + TILE / 2 + randInt(-28, 28),
          y: object.y * TILE - randInt(4, 34),
          life: 1.1 + Math.random() * 0.5,
          color: i % 2 ? "#d7b5ff" : "#80d8ff",
        });
      }
      burst(object.x * TILE + TILE / 2, object.y * TILE + TILE / 2, "#b794ff", 12);
      return;
    }
    safeCamp.comfortTimer = Math.max(safeCamp.comfortTimer, 10);
    message = "캠프 랜턴이 주변을 부드럽게 밝혀줍니다.";
    burst(object.x * TILE + TILE / 2, object.y * TILE + TILE / 2, "#ffd166", 10);
  }

  function playCampMelody() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx ||= new AudioContextClass();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + index * 0.18;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.055, start + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    } catch {
      // Audio is optional; visual music notes still provide feedback when audio is blocked.
    }
  }

  function nearestChest(rangeTiles) {
    const px = Math.floor((player.x + player.w / 2) / TILE);
    const py = Math.floor((player.y + player.h / 2) / TILE);
    let best = null;
    let bestDistance = rangeTiles + 1;
    for (let y = py - rangeTiles; y <= py + rangeTiles; y += 1) {
      for (let x = px - rangeTiles; x <= px + rangeTiles; x += 1) {
        if (!inBounds(x, y) || getTile(x, y) !== BLOCKS.chest) continue;
        const distance = Math.hypot(x - px, y - py);
        if (distance < bestDistance) {
          best = { x, y };
          bestDistance = distance;
        }
      }
    }
    return best;
  }

  function openChest(x, y) {
    setTile(x, y, BLOCKS.air);
    stats.chestsOpened += 1;
    discovered.add("treasure");
    grantXp(14, "보물상자 발견");
    const reward = randomChestReward();
    grantReward(reward, "보물상자");
    burst(x * TILE + TILE / 2, y * TILE + TILE / 2, "#ffd166", 22);
    updateHotbar();
    updateResourceBar();
    updateQuestProgress();
  }

  function randomChestReward() {
    const rolls = [
      { resources: { copper: randInt(1, 3), coal: randInt(1, 3) } },
      { resources: { iron: randInt(1, 2), meat: 1 } },
      { hotbar: { plank: randInt(3, 7), torch: randInt(2, 4) } },
      { resources: { crystal: 1 }, relic: Math.random() < 0.35 ? randomLockedRelic() : null },
    ];
    return rolls[randInt(0, rolls.length - 1)];
  }

  function nearestAnimal(range) {
    let best = null;
    let bestDistance = range;
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    for (const entity of entities) {
      if (entity.kind !== "animal") continue;
      const distance = Math.hypot(entity.x + entity.w / 2 - px, entity.y + entity.h / 2 - py);
      if (distance < bestDistance) {
        best = entity;
        bestDistance = distance;
      }
    }
    return best;
  }

  function selectedFeed() {
    const item = hotbar[selected];
    if (item?.type === "item" && itemInfo[item.item]?.feed && item.count > 0) return item.item;
    return null;
  }

  function consumeSelected(amount) {
    const item = hotbar[selected];
    if (!item || item.count < amount) return false;
    item.count -= amount;
    updateHotbar();
    return true;
  }

  function addResource(item, amount, text) {
    resources[item] = (resources[item] || 0) + amount;
    recordItemGain(item, amount);
    showInventoryGain(item, amount);
    message = text || `${itemInfo[item].name} +${amount}`;
    updateResourceBar();
    updateQuestProgress();
  }

  function passiveProduct(type) {
    if (type === "chicken") return ITEMS.egg;
    if (type === "sheep") return ITEMS.wool;
    if (type === "cow") return ITEMS.milk;
    return null;
  }

  function huntingDrops(type) {
    if (type === "chicken") return [[ITEMS.meat, 1], [ITEMS.feather, randInt(1, 2)]];
    if (type === "sheep") return [[ITEMS.meat, 1], [ITEMS.wool, 1]];
    if (type === "cow") return [[ITEMS.meat, 2], [ITEMS.leather, 1]];
    if (type === "boar") return [[ITEMS.meat, 2], [ITEMS.leather, Math.random() > 0.45 ? 1 : 0]];
    return [[ITEMS.meat, 1]];
  }

  function dropMonsterLoot(entity) {
    const type = entity.spec.type;
    if (type === "walker") addResource(ITEMS.coal, 1, "몬스터 처치: 석탄 획득");
    if (type === "archer") addResource(ITEMS.feather, 1, "몬스터 처치: 깃털 획득");
    if (type === "crawler") addResource(ITEMS.leather, 1, "몬스터 처치: 가죽 획득");
    if (type === "stalker") addResource(Math.random() < 0.5 ? ITEMS.copper : ITEMS.coal, 1, "몬스터 처치: 재료 획득");
    if (["crystalBat", "brute"].includes(type)) addResource(ITEMS.crystal, 1, "몬스터 처치: 수정 획득");
    if (["digger", "drowned"].includes(type)) addResource(ITEMS.coal, 1, "몬스터 처치: 석탄 획득");
    if (type === "imp") addResource(ITEMS.copper, 1, "몬스터 처치: 구리광 획득");
  }

  function totalDefense() {
    let value = 0;
    if (equipped?.armor) value += gearCatalog[equipped.armor]?.defense || 0;
    if (equipped?.offhand) value += gearCatalog[equipped.offhand]?.defense || 0;
    return value;
  }

  function animalName(type) {
    if (type === "chicken") return "닭";
    if (type === "sheep") return "양";
    if (type === "cow") return "소";
    if (type === "boar") return "돼지";
    return "동물";
  }

  function popAnimalText(entity, text, color) {
    floatingTexts.push({ text, x: entity.x + entity.w / 2, y: entity.y - 10, life: 1.0, color });
  }

  function isInPen(entity) {
    const centerX = Math.floor((entity.x + entity.w / 2) / TILE);
    const feetY = Math.floor((entity.y + entity.h + 2) / TILE);
    const leftFence = findFence(centerX, feetY, -1);
    const rightFence = findFence(centerX, feetY, 1);
    return leftFence && rightFence && rightFence - leftFence <= 9;
  }

  function findFence(startX, startY, direction) {
    for (let step = 1; step <= 6; step += 1) {
      const x = startX + step * direction;
      if (!inBounds(x, startY)) continue;
      if (getTile(x, startY) === BLOCKS.fence || getTile(x, startY - 1) === BLOCKS.fence) return x;
    }
    return null;
  }

  function updateMonster(entity, dt) {
    const dx = player.x - entity.x;
    const dy = player.y - entity.y;
    entity.facing = dx >= 0 ? 1 : -1;
    if (entity.spec.flying || entity.spec.aquatic) {
      entity.vx += Math.sign(dx) * entity.spec.speed * 3.2 * dt;
      entity.vy += Math.sign(dy) * entity.spec.speed * 2.2 * dt;
      entity.vy = clamp(entity.vy, -entity.spec.speed, entity.spec.speed);
    } else {
      entity.vx += Math.sign(dx) * entity.spec.speed * 4 * dt;
    }
    entity.vx = clamp(entity.vx, -entity.spec.speed, entity.spec.speed);
    if (!entity.spec.flying && !entity.spec.aquatic && blockedAhead(entity) && entity.grounded) entity.vy = -460;
    if (Math.abs(dx) < 46 && Math.abs(player.y - entity.y) < 64 && entity.attackTimer <= 0) {
      hurtPlayer(entity.damage || (entity.spec.type === "crawler" ? 2 : 1));
      entity.attackTimer = 0.85;
      entity.vx *= -1;
    }
  }

  function updateProjectiles(dt) {
    for (const projectile of projectiles) {
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      projectile.vy += (projectile.owner === "player" ? 90 : 0) * dt;
      projectile.terrainGrace = Math.max(0, (projectile.terrainGrace || 0) - dt);
      projectile.life -= dt;
      if (projectile.owner === "player") {
        updatePlayerArrow(projectile);
      } else if (aabb(projectile, player)) {
        hurtPlayer(projectile.damage || 1);
        projectile.removalReason = "player";
        projectile.life = 0;
      }
      const tx = Math.floor((projectile.x + projectile.w / 2) / TILE);
      const ty = Math.floor((projectile.y + projectile.h / 2) / TILE);
      if (projectile.terrainGrace <= 0 && inBounds(tx, ty) && isSolid(getTile(tx, ty))) {
        if (projectile.owner === "player" && projectile.type === "fire") fireArrowBurst(projectile.x, projectile.y);
        projectile.removalReason = "terrain";
        projectile.life = 0;
      }
    }
    for (const projectile of projectiles) {
      if (projectile.life <= 0 && projectile.removalReason) lastProjectileRemoval = projectile.removalReason;
    }
    projectiles = projectiles.filter((p) => p.life > 0);
  }

  function updatePlayerArrow(projectile) {
    for (const entity of entities) {
      if (!["monster", "animal"].includes(entity.kind) || entity.dead || projectile.hitIds.has(entity)) continue;
      if (!aabb(projectile, entity)) continue;
      projectile.hitIds.add(entity);
      entity.hp -= projectile.damage;
      entity.vx += projectile.facing * 160;
      entity.vy = Math.min(entity.vy, -120);
      burst(entity.x + entity.w / 2, entity.y + entity.h / 2, projectile.trail || projectile.color, projectile.type === "crystal" ? 14 : 8);
      if (projectile.type === "fire") fireArrowBurst(entity.x + entity.w / 2, entity.y + entity.h / 2);
      if (projectile.type === "crystal") crystalArrowShards(entity.x + entity.w / 2, entity.y + entity.h / 2);
      handleEntityDefeat(entity, "arrow");
      if (projectile.pierce > 0) {
        projectile.pierce -= 1;
      } else {
        projectile.removalReason = `hit:${entity.kind}`;
        projectile.life = 0;
      }
      return;
    }
  }

  function fireArrowBurst(x, y) {
    burst(x, y, "#ff7a3d", 18);
    for (const entity of entities) {
      if (!["monster", "animal"].includes(entity.kind) || entity.dead) continue;
      const distance = Math.hypot(entity.x + entity.w / 2 - x, entity.y + entity.h / 2 - y);
      if (distance > 74) continue;
      entity.hp -= 1;
      entity.vx += Math.sign(entity.x + entity.w / 2 - x) * 120;
      handleEntityDefeat(entity, "arrow");
    }
  }

  function crystalArrowShards(x, y) {
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * 160,
        vy: Math.sin(angle) * 120 - 40,
        size: 3,
        life: 0.5,
        maxLife: 0.5,
        color: i % 2 ? "#80d8ff" : "#b794ff",
      });
    }
  }

  function weaponHitColor(id) {
    return weaponVisuals[id]?.spark || "#ffd166";
  }

  function weaponUseBurst(id, x, y, strong = false) {
    const visual = weaponVisuals[id] || weaponVisuals.woodenSword;
    const count = strong ? 8 + Math.min(8, gearCatalog[id]?.damage || 0) : 5;
    for (let i = 0; i < count; i += 1) {
      const spread = (Math.random() - 0.5) * 120;
      particles.push({
        x,
        y,
        vx: player.facing * (80 + Math.random() * 150) + spread,
        vy: -40 - Math.random() * 90,
        size: visual.shadow ? 4 : 3,
        life: visual.shadow ? 0.65 : 0.42,
        maxLife: visual.shadow ? 0.65 : 0.42,
        color: i % 3 === 0 ? visual.edge : visual.trail,
      });
    }
  }

  function bowReleaseBurst(id, x, y, arrow) {
    const visual = weaponVisuals[id] || weaponVisuals.huntingBow;
    for (let i = 0; i < (id === "ironBow" ? 10 : 6); i += 1) {
      particles.push({
        x,
        y,
        vx: player.facing * (120 + Math.random() * 190),
        vy: (Math.random() - 0.5) * 80,
        size: id === "ironBow" ? 3 : 2,
        life: 0.35,
        maxLife: 0.35,
        color: i % 2 ? arrow.trail : visual.spark,
      });
    }
  }

  function hurtPlayer(amount) {
    if (player.invuln > 0) return;
    const reduced = Math.max(1, amount - totalDefense());
    player.health -= reduced;
    player.invuln = 0.9;
    player.vx += player.facing * -180;
    player.vy = -220;
    burst(player.x + player.w / 2, player.y + player.h / 2, "#ff6b6b", 16);
    message = "공격받았습니다!";
    if (player.health <= 0) {
      player.health = 0;
      gameOver = true;
      message = "쓰러졌습니다. 다시 시작으로 재도전하세요.";
    }
  }

  function attack() {
    if (hitCooldown > 0 || gameOver) return;
    hitCooldown = 0.28;
    swingTimer = 0.28;
    weaponAction = "melee";
    weaponActionTimer = 0.28;
    const weapon = equipped?.weapon ? gearCatalog[equipped.weapon] : null;
    const meleeBonus = weapon && !weapon.ranged ? weapon.damage || 0 : 0;
    const reachBonus = weapon && !weapon.ranged ? weapon.reach || 0 : 0;
    const damage = 1 + meleeBonus + (relics?.has("stormSeal") && gameTime >= 0.5 ? 1 : 0);
    weaponUseBurst(equipped.weapon, player.x + player.w / 2 + player.facing * (38 + reachBonus * 0.45), player.y + 31, Boolean(meleeBonus));
    const reach = {
      x: player.facing > 0 ? player.x + player.w - 4 : player.x - 58 - reachBonus,
      y: player.y + 8,
      w: 64 + reachBonus,
      h: 48,
    };
    let hit = false;
    let hitAnimal = false;
    let hitMonster = false;
    for (const entity of entities) {
      if ((entity.kind === "monster" || entity.kind === "animal") && aabb(reach, entity)) {
        entity.hp -= damage;
        entity.vx += player.facing * 220;
        entity.vy = -170;
        hit = true;
        hitAnimal = hitAnimal || entity.kind === "animal";
        hitMonster = hitMonster || entity.kind === "monster";
        burst(entity.x + entity.w / 2, entity.y + entity.h / 2, weaponHitColor(equipped.weapon), 10 + meleeBonus * 2);
        if (entity.kind === "animal" && entity.hp <= 0) {
          handleEntityDefeat(entity, "melee");
        }
        if (entity.kind === "monster" && entity.hp <= 0) {
          handleEntityDefeat(entity, "melee");
        }
      }
    }
    if (hitMonster) message = "몬스터를 밀쳐냈습니다.";
    else if (hitAnimal) message = "동물을 사냥했습니다.";
  }

  function handleEntityDefeat(entity, source) {
    if (entity.hp > 0 || entity.dead) return;
    entity.dead = true;
    if (entity.kind === "animal") {
      if (source === "drown") {
        burst(entity.x + entity.w / 2, entity.y + entity.h / 2, "#79c8ff", 12);
        message = `${animalName(entity.spec.type)}이 물에 빠졌습니다.`;
        return;
      }
      for (const [item, amount] of huntingDrops(entity.spec.type)) {
        if (amount > 0) addResource(item, amount, `${animalName(entity.spec.type)} 사냥: ${itemInfo[item].name} 획득`);
      }
      if (source === "arrow") grantXp(4, "화살 사냥");
      return;
    }
    if (entity.kind === "monster") {
      recordMonsterKill(entity);
      if (source === "arrow") stats.arrowKills += 1;
      dropMonsterLoot(entity);
      if (entity.elite) {
        addResource(Math.random() < 0.5 ? ITEMS.crystal : ITEMS.iron, 1, "정예 몬스터 처치 보상 획득");
      }
      discovered.add(`defeated:${entity.spec.type}`);
      grantXp((source === "arrow" ? 10 : 8) + Math.min(10, dayCount), source === "arrow" ? "화살 처치" : "몬스터 처치");
      updateQuestProgress();
    }
  }

  function shootArrow() {
    if (gameOver || shootCooldown > 0) return;
    const weapon = equipped?.weapon ? gearCatalog[equipped.weapon] : null;
    if (!weapon?.ranged) {
      message = "활을 장착해야 화살을 쏠 수 있습니다.";
      return;
    }
    const arrowType = equipped?.arrow || "wood";
    const arrow = arrowCatalog[arrowType] || arrowCatalog.wood;
    const bowSpeedBonus = equipped.weapon === "ironBow" ? 80 : 0;
    const dir = player.facing >= 0 ? 1 : -1;
    const damage = arrow.damage + (weapon.damage || 0) + (relics?.has("stormSeal") && gameTime >= 0.5 ? 1 : 0);
    shootCooldown = equipped.weapon === "ironBow" ? 0.42 : 0.52;
    weaponAction = "ranged";
    weaponActionTimer = 0.2;
    const bowX = player.x + (dir > 0 ? player.w + 4 : -4);
    const bowY = player.y + 27;
    const projectileW = arrowType === "crystal" ? 26 : 24;
    const projectileH = 5;
    const projectileCenterX = bowX + dir * 26;
    shotsFired += 1;
    bowReleaseBurst(equipped.weapon, bowX + dir * 8, bowY - 1, arrow);
    projectiles.push({
      owner: "player",
      type: arrowType,
      x: projectileCenterX - projectileW / 2,
      y: bowY - projectileH / 2,
      w: projectileW,
      h: projectileH,
      vx: dir * (arrow.speed + bowSpeedBonus),
      vy: player.inWater ? -18 : -28,
      damage,
      pierce: arrow.pierce || 0,
      life: 1.35,
      facing: dir,
      color: arrow.color,
      trail: arrow.trail,
      burn: arrow.burn,
      terrainGrace: 0.09,
      hitIds: new Set(),
    });
    message = `${arrow.name} 발사`;
    burst(bowX + dir * 8, bowY - 1, arrow.trail, 4);
  }

  function useEquippedWeapon() {
    const weapon = equipped?.weapon ? gearCatalog[equipped.weapon] : null;
    if (weapon?.ranged) {
      shootArrow();
    } else {
      attack();
    }
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 900 * dt;
      p.life -= dt;
    }
    for (const text of floatingTexts) {
      text.y -= 34 * dt;
      text.life -= dt;
    }
    particles = particles.filter((p) => p.life > 0);
    floatingTexts = floatingTexts.filter((t) => t.life > 0);
  }

  function showInventoryGain(key, amount) {
    if (!gameStarted || !player || !inventoryBursts || !amount) return;
    const label = inventoryLabel(key);
    const color = inventoryColor(key);
    resourcePulse[key] = 1;
    const startX = player.x + player.w / 2 - camera.x;
    const startY = player.y + 8 - camera.y;
    inventoryBursts.push({
      key,
      text: `+${amount} ${label}`,
      x: clamp(startX, 60, VIEW_W - 120),
      y: clamp(startY, 90, VIEW_H - 120),
      sx: clamp(startX, 60, VIEW_W - 120),
      sy: clamp(startY, 90, VIEW_H - 120),
      tx: VIEW_W / 2 - 260 + Math.min(520, Object.keys(resources || {}).length * 34),
      ty: VIEW_H - 104,
      life: 0.92,
      maxLife: 0.92,
      color,
    });
  }

  function updateInventoryBursts(dt) {
    if (!inventoryBursts) return;
    let pulseChanged = false;
    Object.keys(resourcePulse || {}).forEach((key) => {
      resourcePulse[key] = Math.max(0, resourcePulse[key] - dt * 2.4);
      if (resourcePulse[key] <= 0) delete resourcePulse[key];
      pulseChanged = true;
    });
    for (const burstItem of inventoryBursts) {
      burstItem.life -= dt;
      const t = 1 - Math.max(0, burstItem.life / burstItem.maxLife);
      const eased = 1 - Math.pow(1 - t, 3);
      burstItem.x = burstItem.sx + (burstItem.tx - burstItem.sx) * eased;
      burstItem.y = burstItem.sy + (burstItem.ty - burstItem.sy) * eased - Math.sin(t * Math.PI) * 28;
    }
    inventoryBursts = inventoryBursts.filter((item) => item.life > 0);
    if (pulseChanged) updateResourceBar();
  }

  function drawInventoryBursts() {
    if (!inventoryBursts?.length) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "900 15px Segoe UI, sans-serif";
    for (const item of inventoryBursts) {
      const alpha = clamp(item.life / 0.28, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(6, 10, 18, 0.78)";
      roundRect(ctx, item.x - 48, item.y - 15, 96, 30, 8);
      ctx.fill();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, item.x, item.y + 5);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function updateCamera(dt) {
    const targetX = player.x + player.w / 2 - VIEW_W / 2;
    const targetY = player.y + player.h / 2 - VIEW_H * 0.52;
    camera.x += (clamp(targetX, 0, WORLD_W * TILE - VIEW_W) - camera.x) * Math.min(1, dt * 8);
    camera.y += (clamp(targetY, 0, WORLD_H * TILE - VIEW_H) - camera.y) * Math.min(1, dt * 8);
    mouse.worldX = mouse.x + camera.x;
    mouse.worldY = mouse.y + camera.y;
  }

  function moveBody(body, dt) {
    body.grounded = false;
    body.x += body.vx * dt;
    resolveAxis(body, "x");
    body.y += body.vy * dt;
    resolveAxis(body, "y");
  }

  function resolveAxis(body, axis) {
    const minX = Math.floor(body.x / TILE) - 1;
    const maxX = Math.floor((body.x + body.w) / TILE) + 1;
    const minY = Math.floor(body.y / TILE) - 1;
    const maxY = Math.floor((body.y + body.h) / TILE) + 1;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const tile = getTile(x, y);
        if (!isSolid(tile)) continue;
        const tileRect = { x: x * TILE, y: y * TILE, w: TILE, h: TILE };
        if (!aabb(body, tileRect)) continue;
        if (axis === "x") {
          if (body.vx > 0) body.x = tileRect.x - body.w - 0.01;
          if (body.vx < 0) body.x = tileRect.x + TILE + 0.01;
          body.vx = 0;
        } else {
          if (body.vy > 0) {
            body.y = tileRect.y - body.h - 0.01;
            body.grounded = true;
          }
          if (body.vy < 0) body.y = tileRect.y + TILE + 0.01;
          body.vy = 0;
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    drawBackground();
    ctx.save();
    ctx.translate(-Math.floor(camera.x), -Math.floor(camera.y));
    drawWorld();
    drawSafeCampAura();
    drawEntities();
    drawPlayer();
    drawProjectiles();
    drawParticles();
    drawTarget();
    ctx.restore();
    drawVignette();
    drawInventoryBursts();
    drawMessage();
    if (gameOver) drawGameOver();
  }

  function drawBackground() {
    const n = nightAmount();
    drawCover(assets.day, 0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = n;
    drawCover(assets.night, 0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.globalAlpha = 0.28 + n * 0.22;
    ctx.fillStyle = n > 0.5 ? "#0a1020" : "#8ee4ff";
    for (let i = 0; i < 7; i += 1) {
      const x = ((i * 260 - camera.x * (0.08 + i * 0.01)) % 1700) - 180;
      const y = 92 + Math.sin(i * 1.8) * 38 + n * 20;
      drawCloud(x, y, 90 + i * 8, n);
    }
    ctx.restore();
  }

  function drawWorld() {
    const startX = clamp(Math.floor(camera.x / TILE) - 2, 0, WORLD_W - 1);
    const endX = clamp(Math.ceil((camera.x + VIEW_W) / TILE) + 2, 0, WORLD_W - 1);
    const startY = clamp(Math.floor(camera.y / TILE) - 2, 0, WORLD_H - 1);
    const endY = clamp(Math.ceil((camera.y + VIEW_H) / TILE) + 2, 0, WORLD_H - 1);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        const block = getTile(x, y);
        if (block === BLOCKS.air) continue;
        if (block === BLOCKS.water) {
          drawTile(block, x * TILE, y * TILE);
          ctx.fillStyle = "rgba(52, 164, 255, 0.34)";
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
          continue;
        }
        drawTile(block, x * TILE, y * TILE);
        if (block === BLOCKS.torch) {
          const glow = ctx.createRadialGradient(x * TILE + 16, y * TILE + 16, 4, x * TILE + 16, y * TILE + 16, 96);
          glow.addColorStop(0, "rgba(255, 196, 79, 0.32)");
          glow.addColorStop(1, "rgba(255, 196, 79, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(x * TILE - 84, y * TILE - 84, 192, 192);
        }
      }
    }
  }

  function drawSafeCampAura() {
    if (!safeCamp) return;
    const cx = safeCamp.x * TILE + TILE / 2;
    const cy = (safeCamp.y - 1) * TILE + TILE / 2;
    const active = isPlayerInSafeCamp();
    const music = safeCamp.musicTimer > 0;
    const radius = music ? 230 : 170;
    const glow = ctx.createRadialGradient(cx, cy, 18, cx, cy, radius);
    glow.addColorStop(0, music ? "rgba(183,148,255,0.2)" : "rgba(255,209,102,0.16)");
    glow.addColorStop(0.42, active ? "rgba(126,224,129,0.09)" : "rgba(255,209,102,0.06)");
    glow.addColorStop(1, "rgba(255,209,102,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }

  function drawTile(block, x, y) {
    if (block === BLOCKS.fence) {
      drawFence(x, y);
      return;
    }
    if (block === BLOCKS.workbench) {
      drawWorkbench(x, y);
      return;
    }
    if (block === BLOCKS.chest) {
      drawChest(x, y);
      return;
    }
    if (block === BLOCKS.campBed) {
      drawCampBed(x, y);
      return;
    }
    if (block === BLOCKS.campLantern) {
      drawCampLantern(x, y);
      return;
    }
    if (block === BLOCKS.musicBox) {
      drawMusicBox(x, y);
      return;
    }
    const src = atlas.tiles[block] || atlas.tiles[BLOCKS.dirt];
    ctx.drawImage(assets.tiles, src[0], src[1], src[2], src[3], x, y, TILE, TILE);
  }

  function drawCampBed(x, y) {
    ctx.fillStyle = "#6f421d";
    ctx.fillRect(x + 3, y + 20, 26, 8);
    ctx.fillRect(x + 5, y + 27, 4, 5);
    ctx.fillRect(x + 23, y + 27, 4, 5);
    ctx.fillStyle = "#d7b5ff";
    ctx.fillRect(x + 6, y + 12, 21, 10);
    ctx.fillStyle = "#eef5ff";
    ctx.fillRect(x + 5, y + 10, 8, 9);
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.fillRect(x + 15, y + 14, 10, 2);
  }

  function drawCampLantern(x, y) {
    const pulse = safeCamp?.comfortTimer > 0 ? 0.36 : 0.22;
    const glow = ctx.createRadialGradient(x + 16, y + 18, 3, x + 16, y + 18, 72);
    glow.addColorStop(0, `rgba(255, 209, 102, ${pulse})`);
    glow.addColorStop(1, "rgba(255, 209, 102, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 56, y - 50, 144, 144);
    ctx.fillStyle = "#5a3218";
    ctx.fillRect(x + 13, y + 8, 6, 6);
    ctx.strokeStyle = "#d8e2ea";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 10, y + 14, 12, 15);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(x + 13, y + 18, 6, 8);
  }

  function drawMusicBox(x, y) {
    const active = safeCamp?.musicTimer > 0;
    ctx.fillStyle = active ? "#6d4bbf" : "#8b5a2b";
    ctx.fillRect(x + 6, y + 13, 20, 16);
    ctx.fillStyle = "#d8b365";
    ctx.fillRect(x + 9, y + 16, 14, 3);
    ctx.fillRect(x + 13, y + 21, 6, 5);
    ctx.fillStyle = active ? "#d7b5ff" : "#eef5ff";
    ctx.fillRect(x + 24, y + 8, 3, 9);
    ctx.fillRect(x + 27, y + 8, 5, 3);
    if (active) {
      ctx.fillStyle = "rgba(183,148,255,0.7)";
      ctx.fillRect(x + 30, y + 2, 3, 3);
      ctx.fillRect(x + 3, y + 6, 3, 3);
    }
  }

  function drawFence(x, y) {
    const src = atlas.tiles[BLOCKS.plank];
    ctx.drawImage(assets.tiles, src[0], src[1], src[2], src[3], x + 2, y + 6, TILE - 4, TILE - 8);
    ctx.fillStyle = "rgba(58, 33, 13, 0.5)";
    ctx.fillRect(x + 5, y + 8, 6, 22);
    ctx.fillRect(x + 21, y + 8, 6, 22);
    ctx.fillRect(x + 2, y + 12, 28, 5);
    ctx.fillRect(x + 2, y + 22, 28, 5);
  }

  function drawWorkbench(x, y) {
    const src = atlas.tiles[BLOCKS.plank];
    ctx.drawImage(assets.tiles, src[0], src[1], src[2], src[3], x, y, TILE, TILE);
    ctx.fillStyle = "rgba(57, 31, 15, 0.65)";
    ctx.fillRect(x + 4, y + 7, 24, 4);
    ctx.fillRect(x + 6, y + 17, 20, 3);
    ctx.fillStyle = "#d8e2ea";
    ctx.fillRect(x + 19, y + 6, 6, 6);
    ctx.fillStyle = "#5a3218";
    ctx.fillRect(x + 5, y + 23, 6, 7);
    ctx.fillRect(x + 21, y + 23, 6, 7);
  }

  function drawChest(x, y) {
    const src = atlas.tiles[BLOCKS.plank];
    ctx.drawImage(assets.tiles, src[0], src[1], src[2], src[3], x + 2, y + 7, TILE - 4, TILE - 9);
    ctx.fillStyle = "rgba(42, 24, 12, 0.72)";
    ctx.fillRect(x + 3, y + 15, 26, 3);
    ctx.fillRect(x + 6, y + 6, 4, 22);
    ctx.fillRect(x + 22, y + 6, 4, 22);
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(x + 13, y + 13, 6, 7);
    ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
    ctx.fillRect(x + 6, y + 8, 16, 2);
  }

  function drawEntities() {
    for (const entity of entities) {
      if (entity.x + entity.w < camera.x - 80 || entity.x > camera.x + VIEW_W + 80) continue;
      const frame = pickFrame(entity.spec.frames, entity.anim * (entity.kind === "monster" ? 7 : 4));
      const img = entity.spec.sheet === "expandedMonsters" ? assets.expandedMonsters : entity.kind === "monster" ? assets.monsters : assets.animals;
      if (entity.elite) {
        const pulse = 0.25 + Math.sin(entity.anim * 8) * 0.08;
        ctx.fillStyle = `rgba(255, 209, 102, ${pulse})`;
        ctx.fillRect(entity.x - 3, entity.y + entity.h - 5, entity.w + 6, 6);
        ctx.strokeStyle = "rgba(255, 209, 102, 0.72)";
        ctx.lineWidth = 2;
        ctx.strokeRect(entity.x - 3, entity.y - 3, entity.w + 6, entity.h + 6);
      }
      drawSprite(img, frame, entity.x, entity.y, entity.w, entity.h, entity.facing);
      if (entity.captured) {
        ctx.fillStyle = "rgba(126, 224, 129, 0.8)";
        ctx.fillRect(entity.x + entity.w / 2 - 4, entity.y - 14, 8, 8);
      }
      if (entity.kind === "monster") {
        ctx.fillStyle = entity.elite ? "rgba(255, 209, 102, 0.9)" : "rgba(255, 74, 74, 0.75)";
        ctx.fillRect(entity.x, entity.y - 8, entity.w * (entity.hp / (entity.maxHp || entity.spec.hp)), 3);
      }
    }
  }

  function drawPlayer() {
    let frames = atlas.player.idle;
    let pose = "idle";
    if (player.invuln > 0 && Math.floor(player.invuln * 16) % 2 === 0) frames = atlas.player.hurt;
    else if (weaponAction === "melee" && weaponActionTimer > 0) {
      frames = atlas.player.attack;
      pose = "wide";
    } else if (weaponAction === "ranged" && weaponActionTimer > 0) {
      frames = atlas.player.attack;
      pose = "ranged";
    } else if (weaponAction === "mine" && weaponActionTimer > 0) {
      frames = atlas.player.mine;
      pose = "wide";
    } else if (!player.grounded) {
      frames = atlas.player.jump;
      pose = "jump";
    } else if (Math.abs(player.vx) > 12) {
      frames = atlas.player.walk;
      pose = "walk";
    }

    const frame = pickFrame(frames, player.anim * 8);
    const scale = 0.53;
    const drawW = frame[2] * scale;
    const drawH = frame[3] * scale;
    const bodyCenterX = player.x + player.w / 2;
    const footY = player.y + player.h + 2;
    const pivot =
      pose === "wide" ? (player.facing > 0 ? 0.33 : 0.67) : pose === "ranged" ? (player.facing > 0 ? 0.4 : 0.6) : 0.5;
    drawSprite(assets.player, frame, bodyCenterX - drawW * pivot, footY - drawH, drawW, drawH, player.facing);
    drawPlayerGearOverlay();
  }

  function drawPlayerGearOverlay() {
    if (!equipped) return;
    const x = player.x;
    const y = player.y;
    if (equipped.armor) {
      drawEquippedArmor(x, y);
    }
    if (equipped.boots === "flippers") {
      ctx.fillStyle = "rgba(70, 196, 255, 0.72)";
      ctx.fillRect(x - 2, y + player.h - 4, 12, 5);
      ctx.fillRect(x + player.w - 10, y + player.h - 4, 12, 5);
    }
    if (equipped.offhand === "shield") {
      ctx.fillStyle = "rgba(216, 226, 234, 0.62)";
      ctx.fillRect(x + (player.facing > 0 ? -8 : player.w + 2), y + 21, 8, 20);
    }
    if (equipped.offhand === "lantern") {
      const glow = ctx.createRadialGradient(x + player.w / 2, y + 30, 4, x + player.w / 2, y + 30, 92);
      glow.addColorStop(0, "rgba(255, 196, 79, 0.28)");
      glow.addColorStop(1, "rgba(255, 196, 79, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(x - 80, y - 60, 180, 180);
    }
    const weapon = equipped.weapon ? gearCatalog[equipped.weapon] : null;
    if (weapon?.ranged) drawEquippedBow(x, y);
    else if (weapon) drawEquippedMeleeWeapon(x, y);
    if (weaponAction === "melee" && weaponActionTimer > 0) drawWeaponTrail();
  }

  function drawEquippedArmor(x, y) {
    const colors = {
      clothArmor: ["rgba(112, 167, 217, 0.42)", "rgba(238,245,255,0.35)"],
      copperArmor: ["rgba(216, 121, 51, 0.48)", "rgba(255,209,163,0.42)"],
      ironArmor: ["rgba(210, 226, 235, 0.56)", "rgba(238,245,255,0.55)"],
    };
    const [base, shine] = colors[equipped.armor] || colors.clothArmor;
    ctx.fillStyle = base;
    ctx.fillRect(x + 4, y + 17, player.w - 8, 23);
    ctx.fillRect(x + 1, y + 20, 5, 13);
    ctx.fillRect(x + player.w - 6, y + 20, 5, 13);
    ctx.fillStyle = shine;
    ctx.fillRect(x + player.w / 2 - 3, y + 18, 6, 20);
    if (equipped.armor === "ironArmor") {
      ctx.strokeStyle = "rgba(128,216,255,0.45)";
      ctx.strokeRect(x + 3.5, y + 16.5, player.w - 7, 24);
    }
  }

  function drawEquippedBow(x, y) {
    const visual = weaponVisuals[equipped.weapon] || weaponVisuals.huntingBow;
    const dir = player.facing >= 0 ? 1 : -1;
    const handX = x + (dir > 0 ? player.w + 4 : -4);
    const handY = y + 27;
    const drawing = weaponAction === "ranged" && weaponActionTimer > 0;
    const arrow = arrowCatalog[equipped.arrow || "wood"] || arrowCatalog.wood;
    ctx.save();
    ctx.translate(handX, handY);
    ctx.scale(dir, 1);
    ctx.strokeStyle = visual.blade;
    ctx.lineWidth = equipped.weapon === "ironBow" ? 4 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, 13, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(238,245,255,0.78)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1, -12);
    ctx.lineTo(drawing ? -13 : 0, 0);
    ctx.lineTo(-1, 12);
    ctx.stroke();
    if (drawing) {
      ctx.fillStyle = arrow.color;
      ctx.fillRect(-15, -2, 31, 4);
      ctx.fillStyle = arrow.trail;
      ctx.fillRect(-17, -3, 7, 2);
      ctx.fillRect(-17, 1, 7, 2);
      ctx.beginPath();
      ctx.moveTo(21, 0);
      ctx.lineTo(14, -5);
      ctx.lineTo(14, 5);
      ctx.closePath();
      ctx.fill();
    }
    if (equipped.weapon === "ironBow") {
      ctx.fillStyle = "rgba(128,216,255,0.55)";
      ctx.fillRect(-2, -3, 4, 6);
    }
    ctx.restore();
  }

  function drawEquippedMeleeWeapon(x, y) {
    const id = equipped.weapon;
    const visual = weaponVisuals[id] || weaponVisuals.woodenSword;
    const dir = player.facing;
    const handX = x + (dir > 0 ? player.w + 1 : -1);
    const handY = y + 27;
    const active = weaponAction === "melee" && weaponActionTimer > 0;
    ctx.save();
    ctx.translate(handX, handY);
    ctx.scale(dir, 1);
    ctx.rotate(active ? -0.95 + weaponActionTimer * 4.2 : -0.55);
    if (visual.spear) {
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(0, -2, visual.length, 4);
      ctx.fillStyle = visual.blade;
      ctx.beginPath();
      ctx.moveTo(visual.length + 10, 0);
      ctx.lineTo(visual.length - 1, -8);
      ctx.lineTo(visual.length - 1, 8);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = "#6f421d";
      ctx.fillRect(-3, -4, 9, 8);
      ctx.fillStyle = visual.blade;
      ctx.fillRect(5, -3, visual.length, 6);
      ctx.fillStyle = visual.edge;
      ctx.fillRect(8, -2, visual.length - 8, 2);
      if (visual.shadow) {
        ctx.fillStyle = "rgba(183,148,255,0.55)";
        ctx.fillRect(visual.length - 6, -6, 8, 12);
      }
    }
    ctx.restore();
  }

  function drawWeaponTrail() {
    const id = equipped.weapon;
    const visual = weaponVisuals[id];
    if (!visual || visual.bow) return;
    const progress = clamp(weaponActionTimer / 0.28, 0, 1);
    const cx = player.x + player.w / 2 + player.facing * 28;
    const cy = player.y + 30;
    ctx.save();
    ctx.globalAlpha = 0.18 + progress * 0.36;
    ctx.strokeStyle = visual.trail;
    ctx.lineWidth = visual.spear ? 5 : 8;
    ctx.beginPath();
    if (player.facing > 0) ctx.arc(cx, cy, visual.spear ? 48 : 34, -0.85, 0.65);
    else ctx.arc(cx, cy, visual.spear ? 48 : 34, Math.PI - 0.65, Math.PI + 0.85);
    ctx.stroke();
    ctx.restore();
  }

  function pickFrame(frames, tick) {
    if (!Array.isArray(frames) || frames.length === 0) return atlas.player.idle[0];
    const safeTick = Number.isFinite(tick) ? tick : 0;
    return frames[Math.abs(Math.floor(safeTick)) % frames.length] || frames[0];
  }

  function drawSprite(img, frame, x, y, w, h, facing) {
    ctx.save();
    if (facing < 0) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, frame[0], frame[1], frame[2], frame[3], 0, 0, w, h);
    } else {
      ctx.drawImage(img, frame[0], frame[1], frame[2], frame[3], x, y, w, h);
    }
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of projectiles) {
      if (p.owner === "player") drawArrowProjectile(p);
      else {
        ctx.fillStyle = "#d8e2ea";
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }
    }
  }

  function drawArrowProjectile(p) {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const len = p.type === "crystal" ? 32 : p.type === "iron" ? 28 : 24;
    const dir = p.facing || Math.sign(p.vx) || 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir, 1);
    ctx.fillStyle = p.trail || p.color;
    ctx.globalAlpha = 0.38;
    ctx.fillRect(-len - 14, -1, 18, 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = p.color || "#d8b365";
    ctx.fillRect(-len / 2, -2, len, 4);
    ctx.fillStyle = p.type === "fire" ? "#ffd166" : p.type === "crystal" ? "#eef5ff" : "#6f421d";
    ctx.fillRect(-len / 2 - 5, -5, 6, 10);
    ctx.beginPath();
    ctx.moveTo(len / 2 + 8, 0);
    ctx.lineTo(len / 2 - 3, -6);
    ctx.lineTo(len / 2 - 3, 6);
    ctx.closePath();
    ctx.fillStyle = p.type === "fire" ? "#ff4d2e" : p.type === "crystal" ? "#80d8ff" : "#d8e2ea";
    ctx.fill();
    if (p.type === "fire") {
      ctx.fillStyle = "rgba(255, 122, 61, 0.7)";
      ctx.fillRect(-len - 4, -4, 8, 8);
    }
    if (p.type === "crystal") {
      ctx.strokeStyle = "rgba(183, 148, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-len / 2 + 4, -5, 9, 10);
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    ctx.font = "900 18px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    for (const t of floatingTexts) {
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawTarget() {
    const tx = Math.floor(mouse.worldX / TILE);
    const ty = Math.floor(mouse.worldY / TILE);
    if (!inBounds(tx, ty)) return;
    const dist = Math.hypot(mouse.worldX - (player.x + player.w / 2), mouse.worldY - (player.y + player.h / 2));
    if (dist > MAX_TARGET_DISTANCE) return;
    ctx.strokeStyle = mouse.down ? "#ffd166" : "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.strokeRect(tx * TILE + 1, ty * TILE + 1, TILE - 2, TILE - 2);
    if (miningTarget) {
      const block = getTile(miningTarget.x, miningTarget.y);
      const ratio = clamp(miningTarget.progress / (blockInfo[block]?.hardness || 0.5), 0, 1);
      ctx.fillStyle = "rgba(255, 209, 102, 0.55)";
      ctx.fillRect(miningTarget.x * TILE + 4, miningTarget.y * TILE + TILE - 7, (TILE - 8) * ratio, 4);
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeRect(miningTarget.x * TILE + 4, miningTarget.y * TILE + TILE - 7, TILE - 8, 4);
    }
  }

  function drawVignette() {
    const n = nightAmount();
    if (n <= 0.02) return;
    ctx.save();
    ctx.fillStyle = `rgba(5, 8, 22, ${0.28 * n})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    const glow = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 40, VIEW_W / 2, VIEW_H / 2, 620);
    glow.addColorStop(0, `rgba(0,0,0,0)`);
    glow.addColorStop(1, `rgba(0,0,0,${0.42 * n})`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.restore();
  }

  function drawMessage() {
    ctx.save();
    ctx.fillStyle = "rgba(6, 10, 18, 0.58)";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    roundRect(ctx, VIEW_W / 2 - 230, 72, 460, 42, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#eef5ff";
    ctx.font = "800 16px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message, VIEW_W / 2, 99);
    ctx.restore();
  }

  function drawGameOver() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = "#ff6b6b";
    ctx.font = "900 54px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("생존 실패", VIEW_W / 2, VIEW_H / 2 - 24);
    ctx.fillStyle = "#eef5ff";
    ctx.font = "700 22px Segoe UI, sans-serif";
    ctx.fillText(`${playerName}, 오른쪽 아래의 다시 시작 버튼으로 재도전하세요.`, VIEW_W / 2, VIEW_H / 2 + 24);
    ctx.restore();
  }

  function drawCover(img, x, y, w, h) {
    const ratio = Math.max(w / img.width, h / img.height);
    const sw = w / ratio;
    const sh = h / ratio;
    const sx = (img.width - sw) / 2 + camera.x * 0.025;
    const sy = (img.height - sh) / 2 + camera.y * 0.02;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function drawCloud(x, y, width, night) {
    ctx.fillStyle = night > 0.5 ? "rgba(78, 98, 132, 0.54)" : "rgba(255,255,255,0.72)";
    ctx.fillRect(x, y + 18, width, 18);
    ctx.fillRect(x + 20, y, width * 0.42, 20);
    ctx.fillRect(x + width * 0.55, y + 8, width * 0.32, 16);
  }

  function updateLabels() {
    const n = nightAmount();
    const phase = phaseInfo();
    dayLabel.textContent = `${playerName} · Day ${dayCount}`;
    timeLabel.textContent = phase.name;
    phaseTitle.textContent = `${phase.name} 진행 중`;
    phaseRemaining.textContent = `${formatTime(phase.remaining)} 남음`;
    phaseFill.style.width = `${Math.round(phase.progress * 100)}%`;
    phaseFill.style.background =
      phase.name === "밤" ? "linear-gradient(90deg, #7695ff, #d8e2ea)" : "linear-gradient(90deg, #ffd166, #7ee081)";
    const maxHearts = Math.ceil(maxPlayerHealth() / 2);
    const fullHearts = clamp(Math.ceil(player.health / 2), 0, maxHearts);
    healthLabel.textContent = "♥".repeat(fullHearts) + "♡".repeat(maxHearts - fullHearts);
    const monsters = entities.filter((e) => e.kind === "monster").length;
    const inCamp = isPlayerInSafeCamp();
    statusLabel.textContent = gameOver
      ? `${playerName} 쓰러짐`
      : inCamp
        ? `${playerName} 회복 캠프`
        : monsters
          ? `${playerName} 위험 ${monsters}`
          : player.hunger <= 2
            ? `${playerName} 허기`
            : `${playerName} 안전`;
    statusLabel.style.color = monsters || gameOver ? "var(--danger)" : inCamp ? "var(--accent)" : "var(--good)";
  }

  function updateHotbar() {
    hotbarEl.innerHTML = "";
    hotbar.forEach((item, index) => {
      const slot = document.createElement("button");
      slot.className = `slot${selected === index ? " active" : ""}`;
      slot.type = "button";
      const label = item.type === "block" ? blockInfo[item.block].name : itemInfo[item.item].name;
      slot.title = `${item.key}: ${label}`;
      const key = document.createElement("small");
      key.textContent = item.key;
      const count = document.createElement("b");
      count.textContent = item.count;
      const icon = document.createElement("canvas");
      icon.width = 40;
      icon.height = 40;
      const iconCtx = icon.getContext("2d");
      iconCtx.imageSmoothingEnabled = false;
      if (item.type === "block") {
        if (item.block === BLOCKS.fence) {
          drawFenceIcon(iconCtx);
        } else if (item.block === BLOCKS.workbench) {
          drawWorkbenchIcon(iconCtx);
        } else {
          const src = atlas.tiles[item.block];
          iconCtx.drawImage(assets.tiles, src[0], src[1], src[2], src[3], 4, 4, 32, 32);
        }
      } else {
        drawItemIcon(iconCtx, item.item, 20, 20, 15);
      }
      slot.append(key, icon, count);
      slot.addEventListener("click", () => {
        selected = index;
        updateHotbar();
      });
      hotbarEl.appendChild(slot);
    });
  }

  function updateResourceBar() {
    resourceBar.innerHTML = "";
    Object.entries(resources || {})
      .filter(([, count]) => count > 0)
      .forEach(([item, count]) => {
        const pill = document.createElement("span");
        pill.className = `resource-pill${resourcePulse?.[item] ? " gain" : ""}`;
        pill.title = `${itemInfo[item].name} ${count}`;
        const icon = document.createElement("canvas");
        icon.width = 28;
        icon.height = 28;
        const iconCtx = icon.getContext("2d");
        iconCtx.imageSmoothingEnabled = false;
        drawItemIcon(iconCtx, item, 14, 14, 10);
        const name = document.createElement("span");
        name.textContent = itemInfo[item].name;
        const amount = document.createElement("b");
        amount.textContent = count;
        pill.append(icon, name, amount);
        resourceBar.appendChild(pill);
      });
  }

  function openPanel(panel, title, renderer) {
    sidePanelTitle.textContent = title;
    activePanel = panel;
    sidePanel.classList.remove("hidden");
    renderer();
  }

  function closeSidePanel() {
    sidePanel.classList.add("hidden");
    activePanel = null;
  }

  function renderOpenPanel() {
    if (sidePanel?.classList.contains("hidden")) return;
    if (activePanel === "craft") renderCraftPanel();
    if (activePanel === "gear") renderGearPanel();
    if (activePanel === "recipes") renderRecipeGuidePanel();
    if (activePanel === "codex") renderCodexPanel();
    if (activePanel === "save") renderSavePanel();
  }

  function renderCraftPanel() {
    sidePanelBody.innerHTML = "";
    const nearWorkbench = isNearWorkbench();
    const intro = document.createElement("div");
    intro.className = "codex-card";
    intro.innerHTML = `<h3>개인 제작대</h3><p>${nearWorkbench ? "제작대 근처입니다. 제작 가능 항목을 선택하세요." : "제작대를 설치하고 가까이 서야 장비를 만들 수 있습니다."}</p><img class="asset-preview" src="assets/generated/equipment-items.png" alt="장비 아이템 에셋 미리보기">`;
    sidePanelBody.appendChild(intro);
    recipes.forEach((recipe) => {
      const item = recipe.type === "arrow" ? arrowCatalog[recipe.unlockArrow] : gearCatalog[recipe.id];
      const row = document.createElement("article");
      row.className = "recipe";
      const already = crafted.has(recipe.id);
      const status = craftStatus(recipe);
      const title = document.createElement("h3");
      title.textContent = item.name;
      const desc = document.createElement("p");
      desc.textContent = item.desc;
      const state = document.createElement("div");
      state.className = `recipe-state${status.can ? " ready" : ""}`;
      state.textContent = already
        ? recipe.type === "arrow" ? "업그레이드 완료" : "제작 완료"
        : status.can
          ? "바로 제작 가능"
          : "추가 재료 필요";
      const needs = document.createElement("div");
      needs.className = "recipe-needs";
      status.items.forEach((entry) => {
        const need = document.createElement("div");
        need.className = `recipe-need${entry.missing > 0 ? " missing" : " ready"}`;
        const label = document.createElement("strong");
        label.textContent = entry.name;
        const detail = document.createElement("span");
        detail.textContent = entry.missing > 0
          ? `보유 ${entry.have} / 필요 ${entry.need} · ${entry.missing}개 더 필요`
          : `보유 ${entry.have} / 필요 ${entry.need} · 충분`;
        need.append(label, detail);
        needs.appendChild(need);
      });
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = already ? (recipe.type === "arrow" ? "업그레이드 완료" : "제작 완료") : (recipe.type === "arrow" ? "화살 업그레이드" : "제작");
      button.disabled = already || !nearWorkbench || !canCraft(recipe);
      button.addEventListener("click", () => craftRecipe(recipe));
      row.append(title, desc, state, needs);
      row.appendChild(button);
      sidePanelBody.appendChild(row);
    });
  }

  function renderGearPanel() {
    sidePanelBody.innerHTML = "";
    const slots = ["weapon", "arrow", "armor", "boots", "offhand"];
    slots.forEach((slot) => {
      const row = document.createElement("article");
      row.className = "gear-row";
      const equippedId = equipped[slot];
      const header = document.createElement("div");
      header.className = "gear-row-header";
      header.appendChild(createGearIcon(equippedId, slot, 48));
      const copy = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = gearSlotName(slot);
      const current = document.createElement("p");
      current.textContent = `현재 장착: ${equippedLabel(slot, equippedId)}`;
      copy.append(title, current);
      header.appendChild(copy);
      row.appendChild(header);
      sidePanelBody.appendChild(row);
      if (slot === "arrow") {
        [...unlockedArrows].forEach((id) => {
          const arrow = arrowCatalog[id];
          const button = document.createElement("button");
          button.type = "button";
          button.className = "icon-button";
          button.append(createGearIcon(id, "arrow", 28), document.createTextNode(equipped.arrow === id ? `${arrow.name} 장착 중` : `${arrow.name} 장착`));
          button.disabled = equipped.arrow === id;
          button.addEventListener("click", () => {
            equipped.arrow = id;
            discovered.add(`arrow:${id}`);
            message = `${arrow.name} 장착`;
            renderGearPanel();
          });
          row.appendChild(button);
        });
        return;
      }
      Object.entries(gearCatalog)
        .filter(([, gear]) => gear.slot === slot)
        .forEach(([id, gear]) => {
          const owned = crafted.has(id);
          const button = document.createElement("button");
          button.type = "button";
          button.className = "icon-button";
          button.title = owned ? gear.desc : `${gear.name} 제작 필요: ${recipeReqText(recipeForGear(id))}`;
          button.append(createGearIcon(id, slot, 28), document.createTextNode(!owned ? `${gear.name} 제작 필요` : equippedId === id ? `${gear.name} 장착 중` : `${gear.name} 장착`));
          button.disabled = !owned || equippedId === id;
          button.addEventListener("click", () => {
            if (!owned) return;
            equipped[slot] = id;
            discovered.add(`gear:${id}`);
            message = `${gear.name} 장착`;
            renderGearPanel();
          });
          row.appendChild(button);
        });
    });
  }

  function renderRecipeGuidePanel() {
    sidePanelBody.innerHTML = "";
    const guide = document.createElement("article");
    guide.className = "codex-card recipe-guide";
    guide.innerHTML = `<h3>전체 조합 도감</h3><p>결과물, 분류, 필요한 재료, 현재 제작 가능 여부를 한 번에 확인합니다.</p>`;
    guide.appendChild(buildRecipeGuideList());
    sidePanelBody.appendChild(guide);
  }

  function buildRecipeGuideList() {
    const list = document.createElement("div");
    list.className = "recipe-guide-list";
    recipes.forEach((recipe) => {
      const row = document.createElement("div");
      row.className = `recipe-guide-row${canCraft(recipe) ? " craftable" : ""}${crafted.has(recipe.id) ? " complete" : ""}`;
      const result = recipeResultInfo(recipe);
      const resultId = recipe.type === "arrow" ? recipe.unlockArrow : recipe.id;
      row.appendChild(createGearIcon(resultId, recipe.type === "arrow" ? "arrow" : result.slot, 36));
      const name = document.createElement("strong");
      name.textContent = result.name;
      const category = document.createElement("span");
      category.textContent = recipeCategory(recipe);
      const req = document.createElement("p");
      req.textContent = recipeReqText(recipe);
      const state = document.createElement("em");
      state.textContent = crafted.has(recipe.id) ? "완료" : canCraft(recipe) ? "재료 보유" : "재료 필요";
      row.append(name, category, req, state);
      list.appendChild(row);
    });
    return list;
  }

  function renderCodexPanel() {
    sidePanelBody.innerHTML = "";
    const summary = document.createElement("article");
    summary.className = "codex-card";
    summary.innerHTML = `<h3>${playerName}의 개척 기록</h3><p>완료 목표 ${completedQuests.size}/${questCatalog.length} · 미니 퀘스트 ${completedMiniQuests.size}/${miniQuestCatalog.length} · 레벨 ${playerLevel} · 보유 유물 ${relics.size}/${Object.keys(relicCatalog).length}</p><img class="asset-preview" src="assets/generated/relic-progression.png" alt="유물과 진행 보상 에셋">`;
    sidePanelBody.appendChild(summary);

    const campGuide = document.createElement("article");
    campGuide.className = "codex-card";
    campGuide.innerHTML = "<h3>안전 캠프</h3><p>시작 지점의 침대에서 쉬면 체력과 허기가 회복됩니다. 작은 음악 상자를 켜면 캠프 주변에 더 편안한 회복 분위기가 생깁니다.</p>";
    sidePanelBody.appendChild(campGuide);

    const recipeGuide = document.createElement("article");
    recipeGuide.className = "codex-card recipe-guide";
    recipeGuide.innerHTML = `<h3>조합 지식</h3><p>제작대 근처가 아니어도 전체 조합법을 확인할 수 있습니다.</p>`;
    recipeGuide.appendChild(buildRecipeGuideList());
    sidePanelBody.appendChild(recipeGuide);

    const gearBook = document.createElement("article");
    gearBook.className = "codex-card gear-book";
    gearBook.innerHTML = "<h3>장비 도감</h3><p>장비별 외형, 장착 부위, 효과, 제작 여부를 확인합니다.</p>";
    const gearGrid = document.createElement("div");
    gearGrid.className = "gear-book-grid";
    Object.entries(gearCatalog).forEach(([id, gear]) => {
      const card = document.createElement("div");
      card.className = `gear-book-card${crafted.has(id) ? " owned" : ""}`;
      card.appendChild(createGearIcon(id, gear.slot, 46));
      const copy = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = gear.name;
      const meta = document.createElement("span");
      meta.textContent = `${gearSlotName(gear.slot)} · ${crafted.has(id) ? "보유" : "미제작"}`;
      const desc = document.createElement("p");
      desc.textContent = gear.desc;
      copy.append(name, meta, desc);
      card.appendChild(copy);
      gearGrid.appendChild(card);
    });
    Object.entries(arrowCatalog).forEach(([id, arrow]) => {
      const card = document.createElement("div");
      card.className = `gear-book-card${unlockedArrows.has(id) ? " owned" : ""}`;
      card.appendChild(createGearIcon(id, "arrow", 46));
      const copy = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = arrow.name;
      const meta = document.createElement("span");
      meta.textContent = `화살 · 피해 ${arrow.damage} · ${unlockedArrows.has(id) ? "해금" : "미해금"}`;
      const desc = document.createElement("p");
      desc.textContent = arrow.desc;
      copy.append(name, meta, desc);
      card.appendChild(copy);
      gearGrid.appendChild(card);
    });
    gearBook.appendChild(gearGrid);
    sidePanelBody.appendChild(gearBook);

    const miniTitle = document.createElement("article");
    miniTitle.className = "codex-card";
    miniTitle.innerHTML = "<h3>아이템 / 몬스터 미니 퀘스트</h3><p>진행 중인 작은 목표를 완료하면 경험치, 재료, 유물을 얻습니다.</p>";
    sidePanelBody.appendChild(miniTitle);
    miniQuestCatalog.forEach((quest) => {
      const card = document.createElement("article");
      card.className = `codex-card mini-card ${quest.type}`;
      const done = completedMiniQuests.has(quest.id);
      card.innerHTML = `<h3>${done ? "완료" : "진행"} · ${quest.title}</h3><p>${quest.body}<br>${questProgressText(quest)}</p>`;
      sidePanelBody.appendChild(card);
    });

    if (relics.size > 0) {
      [...relics].forEach((id) => {
        const relic = relicCatalog[id];
        const card = document.createElement("article");
        card.className = "codex-card";
        card.innerHTML = `<h3>${relic.name}</h3><p>${relic.desc}</p>`;
        sidePanelBody.appendChild(card);
      });
    }

    const entries = [
      ["start", "개척 시작", "낮에는 자원을 모으고 밤에는 생존합니다."],
      ["safeCamp", "안전 캠프", "침대, 랜턴, 음악 상자와 동물 친구들이 있는 회복 공간입니다."],
      ["expandedWorld", "확장 월드", "동쪽 끝으로 이동하면 새 지형이 절차적으로 이어집니다."],
      ["underground", "지하 생태", "동굴에는 중립 생물과 전용 몬스터가 별도로 등장합니다."],
      ["water", "수중 탐험", "물속에서는 수영할 수 있고, 오리발을 만들면 이동이 쉬워집니다."],
      ["ranch", "목장 생산", "울타리 안의 동물은 일정 시간마다 자원을 생산합니다."],
      ["treasure", "보물상자", "맵 곳곳과 이벤트로 발견되며 자원, 경험치, 유물을 제공합니다."],
      ["oreCrafting", "광물 제작", "구리와 철은 장비 제작의 핵심 재료입니다."],
      ["gear:huntingBow", "사냥 활", "공격 키 또는 공격 버튼으로 원거리 공격을 할 수 있습니다."],
      ["arrow:iron", "철 화살", "화살 피해량과 속도가 증가합니다."],
      ["arrow:fire", "불 화살", "명중 지점에 작은 폭발 피해를 줍니다."],
      ["arrow:crystal", "수정 화살", "강한 피해와 관통 효과를 가집니다."],
      ["coal", "석탄", "석탄은 등불과 상위 제작 재료로 쓰입니다."],
      ["monster:brute", "장갑 괴수", "날짜가 지날수록 밤 몬스터가 강해집니다."],
      ["monster:digger", "동굴 굴착자", "지하에서는 별도 몬스터가 출현합니다."],
      ["monster:eel", "수중 괴물", "물속에도 위협이 존재합니다."],
      ["defeated:brute", "괴수 처치", "강한 몬스터는 수정 같은 상위 재료를 남깁니다."],
    ];
    entries.forEach(([id, title, body]) => {
      const card = document.createElement("article");
      card.className = "codex-card";
      card.innerHTML = id === "safeCamp" || discovered.has(id)
        ? `<h3>${title}</h3><p>${body}</p>`
        : `<h3>???</h3><p>아직 발견하지 못했습니다.</p>`;
      sidePanelBody.appendChild(card);
    });
  }

  function renderSavePanel() {
    sidePanelBody.innerHTML = "";
    const panel = document.createElement("article");
    panel.className = "codex-card save-panel";
    panel.innerHTML = "<h3>게임 저장</h3><p>저장 이름은 선택입니다. 실제 저장명은 년월일시분초와 입력 이름을 함께 사용합니다.</p>";
    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 24;
    input.placeholder = "저장 이름 선택";
    const actions = document.createElement("div");
    actions.className = "save-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "현재 진행 저장";
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "저장 중...";
      try {
        const record = await saveCurrentGame(input.value);
        message = `${record.displayName} 저장 완료`;
        renderSavePanel();
      } catch (error) {
        message = "저장에 실패했습니다.";
        button.disabled = false;
        button.textContent = "현재 진행 저장";
      }
    });
    actions.appendChild(button);
    panel.append(input, actions);
    sidePanelBody.appendChild(panel);

    const list = document.createElement("article");
    list.className = "codex-card save-panel";
    list.innerHTML = "<h3>최근 저장</h3><p>현재 이름으로 저장된 최신 5개 목록입니다.</p>";
    sidePanelBody.appendChild(list);
    loadSaveList(playerName)
      .then((records) => {
        const latest = records.slice(0, 5);
        if (!latest.length) {
          const empty = document.createElement("p");
          empty.textContent = "아직 저장 정보가 없습니다.";
          list.appendChild(empty);
          return;
        }
        latest.forEach((record) => list.appendChild(createSaveCard(record, "load")));
      })
      .catch(() => {
        const error = document.createElement("p");
        error.textContent = "저장 목록을 불러오지 못했습니다.";
        list.appendChild(error);
      });
  }

  function createSaveCard(record, mode, difficultyKey = activeDifficulty?.key || "normal") {
    const card = document.createElement("div");
    card.className = "save-card";
    const title = document.createElement("strong");
    title.textContent = record.displayName || record.saveName || "저장 정보";
    const meta = document.createElement("span");
    meta.textContent = `${formatSaveDate(record.savedAt)} · Day ${record.dayCount || 1} · ${record.difficultyName || difficulties[record.difficultyKey]?.name || "개척"}`;
    const actions = document.createElement("div");
    actions.className = "save-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = mode === "start" ? "이 저장으로 계속" : "불러오기";
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "불러오는 중...";
      const fullRecord = await loadSaveRecord(record.id);
      startLoadedGame(fullRecord);
    });
    actions.appendChild(button);
    if (mode === "start") {
      const fresh = document.createElement("button");
      fresh.type = "button";
      fresh.textContent = "새로 시작";
      fresh.addEventListener("click", () => startNewGame(difficultyKey, playerNameInput?.value));
      actions.appendChild(fresh);
    }
    card.append(title, meta, actions);
    return card;
  }

  async function saveCurrentGame(rawName = "") {
    const savedAt = new Date().toISOString();
    const displayName = `${compactTimestamp(savedAt)}${normalizeSaveName(rawName) ? ` ${normalizeSaveName(rawName)}` : ""}`;
    const data = createSaveData(displayName, savedAt);
    const payload = { playerName, saveName: normalizeSaveName(rawName), displayName, savedAt, data };
    const apiRecord = await saveViaApi(payload);
    if (apiRecord) return apiRecord;
    return saveViaLocalStorage(payload);
  }

  function createSaveData(displayName, savedAt) {
    return {
      formatVersion: SAVE_FORMAT_VERSION,
      savedAt,
      displayName,
      playerName,
      difficultyKey: activeDifficulty?.key || "normal",
      WORLD_W,
      world: clonePlain(world),
      player: clonePlain(player),
      hotbar: clonePlain(hotbar),
      resources: clonePlain(resources),
      crafted: [...crafted],
      equipped: clonePlain(equipped),
      discovered: [...discovered],
      relics: [...relics],
      completedQuests: [...completedQuests],
      completedMiniQuests: [...completedMiniQuests],
      unlockedArrows: [...unlockedArrows],
      stats: clonePlain(stats),
      experience,
      playerLevel,
      eventState: clonePlain(eventState),
      safeCamp: clonePlain(safeCamp),
      gameTime,
      dayCount,
      selected,
      entities: entities.filter((entity) => !entity.dead).map(serializeEntity),
    };
  }

  function serializeEntity(entity) {
    return {
      kind: entity.kind,
      type: entity.spec?.type,
      habitat: entity.habitat || entity.spec?.habitat || "surface",
      x: entity.x,
      y: entity.y,
      w: entity.w,
      h: entity.h,
      vx: entity.vx,
      vy: entity.vy,
      hp: entity.hp,
      maxHp: entity.maxHp,
      damage: entity.damage,
      elite: Boolean(entity.elite),
      anim: entity.anim,
      grounded: Boolean(entity.grounded),
      facing: entity.facing,
      attackTimer: entity.attackTimer || 0,
      interactCooldown: entity.interactCooldown || 0,
      productionTimer: entity.productionTimer || 0,
      captured: Boolean(entity.captured),
      following: entity.following || 0,
      drownTimer: entity.drownTimer || 0,
      drownTextTimer: entity.drownTextTimer || 0,
    };
  }

  function startLoadedGame(record) {
    const data = migrateSaveData(record?.data || record);
    activeDifficulty = { key: data.difficultyKey, ...difficulties[data.difficultyKey] };
    playerName = normalizePlayerName(data.playerName);
    WORLD_W = data.WORLD_W || data.world?.tiles?.[0]?.length || 220;
    world = data.world || createWorld();
    player = data.player || { x: 9 * TILE, y: 9 * TILE, w: 28, h: 52, vx: 0, vy: 0, facing: 1, grounded: false, health: maxPlayerHealth(), hunger: 10, invuln: 0, anim: 0, mined: 0, inWater: false };
    resources = { ...emptyResources(), ...(data.resources || {}) };
    applySavedHotbar(data.hotbar);
    crafted = new Set(data.crafted || ["huntingBow"]);
    equipped = { weapon: "huntingBow", armor: null, boots: null, offhand: null, arrow: "wood", ...(data.equipped || {}) };
    discovered = new Set(data.discovered || ["start", "surface", "safeCamp"]);
    relics = new Set(data.relics || []);
    completedQuests = new Set(data.completedQuests || []);
    completedMiniQuests = new Set(data.completedMiniQuests || []);
    unlockedArrows = new Set(data.unlockedArrows || ["wood"]);
    stats = { ...defaultStats(), ...(data.stats || {}) };
    experience = data.experience || 0;
    playerLevel = data.playerLevel || 1;
    eventState = { type: null, title: "", remaining: 0, cooldown: 28, ...(data.eventState || {}) };
    safeCamp = data.safeCamp || null;
    gameTime = data.gameTime || 0;
    dayCount = data.dayCount || 1;
    selected = data.selected || 0;
    entities = (data.entities || []).map(deserializeEntity).filter(Boolean);
    particles = [];
    floatingTexts = [];
    inventoryBursts = [];
    resourcePulse = {};
    projectiles = [];
    gameOver = false;
    miningTarget = null;
    swingTimer = 0;
    weaponAction = null;
    weaponActionTimer = 0;
    hitCooldown = 0;
    shootCooldown = 0;
    shotsFired = 0;
    lastProjectileRemoval = "";
    spawnTimer = 0;
    if (!safeCamp) ensureSafeCampForLoadedWorld();
    gameStarted = true;
    difficultyScreen.classList.add("hidden");
    saveChoices?.classList.add("hidden");
    closeSidePanel();
    updateHotbar();
    updateResourceBar();
    updateQuestTracker();
    updateEventBanner();
    message = `${playerName}, 저장된 여정을 이어갑니다.`;
    lastTime = performance.now();
    if (!loopHandle) loopHandle = window.setInterval(() => loop(performance.now()), 1000 / 60);
    loop(lastTime);
  }

  function deserializeEntity(saved) {
    const spec = entitySpecForSave(saved);
    if (!spec) return null;
    return {
      kind: saved.kind,
      spec,
      x: saved.x,
      y: saved.y,
      w: saved.w || spec.w,
      h: saved.h || spec.h,
      vx: saved.vx || 0,
      vy: saved.vy || 0,
      hp: saved.hp ?? spec.hp ?? 2,
      maxHp: saved.maxHp,
      damage: saved.damage,
      elite: Boolean(saved.elite),
      anim: saved.anim || 0,
      grounded: Boolean(saved.grounded),
      facing: saved.facing || 1,
      attackTimer: saved.attackTimer || 0,
      interactCooldown: saved.interactCooldown || 0,
      productionTimer: saved.productionTimer || 30,
      captured: Boolean(saved.captured),
      following: saved.following || 0,
      drownTimer: saved.drownTimer || 0,
      drownTextTimer: saved.drownTextTimer || 0,
      habitat: saved.habitat || spec.habitat || "surface",
    };
  }

  function entitySpecForSave(saved) {
    if (saved.kind === "animal") {
      if (saved.type === "fish") return { ...atlas.animals[2], type: "fish", aquatic: true };
      if (saved.type === "mole") return { ...atlas.animals[1], type: "mole", cave: true, w: 42, h: 28 };
      return atlas.animals.find((spec) => spec.type === saved.type) || atlas.animals[0];
    }
    return [...atlas.monsters.map((spec) => ({ ...spec, habitat: "surface", damage: 1 })), ...atlas.expandedMonsters].find((spec) => spec.type === saved.type) || atlas.monsters[0];
  }

  function migrateSaveData(data) {
    const migrated = { ...(data || {}) };
    migrated.formatVersion = SAVE_FORMAT_VERSION;
    migrated.playerName = normalizePlayerName(migrated.playerName || playerNameInput?.value || playerName);
    migrated.difficultyKey = difficulties[migrated.difficultyKey] ? migrated.difficultyKey : "normal";
    migrated.resources = { ...emptyResources(), ...(migrated.resources || {}) };
    migrated.crafted ||= ["huntingBow"];
    migrated.unlockedArrows ||= ["wood"];
    migrated.discovered = [...new Set([...(migrated.discovered || []), "start", "safeCamp"])];
    migrated.stats = { ...defaultStats(), ...(migrated.stats || {}) };
    migrated.entities ||= [];
    return migrated;
  }

  function applySavedHotbar(savedHotbar) {
    if (!Array.isArray(savedHotbar)) return;
    savedHotbar.forEach((saved, index) => {
      if (!hotbar[index]) return;
      hotbar[index] = { ...hotbar[index], ...saved };
    });
  }

  function ensureSafeCampForLoadedWorld() {
    safeCamp = null;
    for (let y = 0; y < WORLD_H; y += 1) {
      for (let x = 0; x < WORLD_W; x += 1) {
        if (getTile(x, y) === BLOCKS.campBed) {
          safeCamp = { x: x + 3, y: y + 1, radius: 6, comfortTimer: 0, musicTimer: 0, healTick: 0, sparkleTick: 0 };
          return;
        }
      }
    }
    createSafeCamp();
  }

  function defaultStats() {
    return {
      minedBlocks: 0,
      placedBlocks: 0,
      placedWorkbench: 0,
      craftedItems: 0,
      monsterKills: 0,
      monsterKillsByType: {},
      monsterKillsByHabitat: { surface: 0, underground: 0, water: 0 },
      eliteKills: 0,
      arrowKills: 0,
      animalsCaptured: 0,
      chestsOpened: 0,
      daysSurvived: 0,
      itemsGained: {},
    };
  }

  function emptyResources() {
    return {
      [ITEMS.egg]: 0,
      [ITEMS.wool]: 0,
      [ITEMS.milk]: 0,
      [ITEMS.meat]: 0,
      [ITEMS.leather]: 0,
      [ITEMS.feather]: 0,
      [ITEMS.coal]: 0,
      [ITEMS.copper]: 0,
      [ITEMS.iron]: 0,
      [ITEMS.crystal]: 0,
    };
  }

  async function loadSaveList(name) {
    const player = normalizePlayerName(name);
    const apiRecords = await fetchSaveApi(`/api/saves?playerName=${encodeURIComponent(player)}`);
    if (apiRecords?.records) return apiRecords.records;
    return localSaveRecords().filter((record) => record.playerName === player).sort(compareSaveRecord).slice(0, 5);
  }

  async function loadSaveRecord(id) {
    const apiRecord = await fetchSaveApi(`/api/saves?id=${encodeURIComponent(id)}`);
    if (apiRecord?.record) return apiRecord.record;
    return localSaveRecords().find((record) => record.id === id);
  }

  async function saveViaApi(payload) {
    if (useLocalSaveFallbackOnly()) return null;
    try {
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) return null;
      const json = await response.json();
      return json.record || null;
    } catch {
      return null;
    }
  }

  async function fetchSaveApi(path) {
    if (useLocalSaveFallbackOnly()) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  function localSaveRecords() {
    try {
      return JSON.parse(localStorage.getItem("blockSurvivalSaves") || "[]");
    } catch {
      return [];
    }
  }

  function useLocalSaveFallbackOnly() {
    return location.hostname === "127.0.0.1" && location.port === "8765";
  }

  function saveViaLocalStorage(payload) {
    const records = localSaveRecords();
    const record = {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      playerName: payload.playerName,
      saveName: payload.saveName,
      displayName: payload.displayName,
      savedAt: payload.savedAt,
      difficultyKey: payload.data.difficultyKey,
      difficultyName: difficulties[payload.data.difficultyKey]?.name || "개척",
      dayCount: payload.data.dayCount,
      data: payload.data,
    };
    records.unshift(record);
    localStorage.setItem("blockSurvivalSaves", JSON.stringify(records.slice(0, 50)));
    return record;
  }

  function compareSaveRecord(a, b) {
    return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime();
  }

  function compactTimestamp(value) {
    const date = new Date(value);
    const pad = (num) => String(num).padStart(2, "0");
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  function formatSaveDate(value) {
    if (!value) return "저장 시간 없음";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "저장 시간 없음" : date.toLocaleString("ko-KR");
  }

  function normalizeSaveName(value) {
    return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  }

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  async function handleDifficultyStart(difficultyKey) {
    const name = normalizePlayerName(playerNameInput?.value || playerName);
    if (saveChoices) {
      saveChoices.classList.remove("hidden");
      saveChoices.innerHTML = "<p>저장 정보를 확인하는 중입니다...</p>";
    }
    try {
      const saves = await loadSaveList(name);
      if (saves.length > 0) {
        showStartSaveChoices(name, difficultyKey, saves.slice(0, 5));
      } else {
        startNewGame(difficultyKey, name);
      }
    } catch {
      startNewGame(difficultyKey, name);
    }
  }

  function showStartSaveChoices(name, difficultyKey, saves) {
    if (!saveChoices) {
      startNewGame(difficultyKey, name);
      return;
    }
    saveChoices.innerHTML = "";
    const title = document.createElement("strong");
    title.textContent = `${name} 이름의 저장 정보`;
    const help = document.createElement("span");
    help.textContent = "기존 저장을 이어가거나 새로 시작할 수 있습니다.";
    saveChoices.append(title, help);
    saves.forEach((record) => saveChoices.appendChild(createSaveCard(record, "start", difficultyKey)));
    const fresh = document.createElement("button");
    fresh.type = "button";
    fresh.textContent = "저장 사용 안 함 · 새로 시작";
    fresh.addEventListener("click", () => startNewGame(difficultyKey, name));
    saveChoices.appendChild(fresh);
  }

  function startNewGame(difficultyKey, name) {
    difficultyScreen.classList.add("hidden");
    saveChoices?.classList.add("hidden");
    closeSidePanel();
    resetGame(difficultyKey, name);
    lastTime = performance.now();
    if (!loopHandle) loopHandle = window.setInterval(() => loop(performance.now()), 1000 / 60);
    loop(lastTime);
  }

  function updateQuestProgress() {
    if (!gameStarted || !stats || !completedQuests || !completedMiniQuests) return;
    let changed = false;
    for (const quest of questCatalog) {
      if (completedQuests.has(quest.id)) continue;
      if (!quest.done()) continue;
      completedQuests.add(quest.id);
      discovered.add(`quest:${quest.id}`);
      grantReward(quest.reward, quest.title);
      floatingTexts.push({
        text: `목표 완료: ${quest.title}`,
        x: player.x + player.w / 2,
        y: player.y - 24,
        life: 1.4,
        color: "#ffd166",
      });
      changed = true;
    }
    for (const quest of miniQuestCatalog) {
      if (completedMiniQuests.has(quest.id)) continue;
      if (!quest.done()) continue;
      completedMiniQuests.add(quest.id);
      discovered.add(`mini:${quest.id}`);
      grantReward(quest.reward, quest.title);
      floatingTexts.push({
        text: `미니 퀘스트 완료: ${quest.title}`,
        x: player.x + player.w / 2,
        y: player.y - 42,
        life: 1.35,
        color: quest.type === "monster" ? "#ff9f6e" : "#7ee081",
      });
      changed = true;
    }
    if (changed) {
      updateQuestTracker();
      renderOpenPanel();
    }
  }

  function updateQuestTracker() {
    if (!questTracker) return;
    questTracker.innerHTML = "";
    if (!gameStarted || !player) return;

    const progress = document.createElement("div");
    progress.className = "progress-row";
    progress.innerHTML = `<strong>${playerName} · Lv ${playerLevel}</strong><span>목표 ${completedQuests.size}/${questCatalog.length}</span><span>미니 ${completedMiniQuests.size}/${miniQuestCatalog.length}</span>`;
    questTracker.appendChild(progress);

    const active = [
      ...questCatalog.filter((quest) => !completedQuests.has(quest.id)).slice(0, 2),
      ...miniQuestCatalog.filter((quest) => quest.type === "item" && !completedMiniQuests.has(quest.id)).slice(0, 1),
      ...miniQuestCatalog.filter((quest) => quest.type === "monster" && !completedMiniQuests.has(quest.id)).slice(0, 1),
    ];
    active.forEach((quest) => {
      const row = document.createElement("article");
      row.className = `quest-row detail ${quest.type ? `mini ${quest.type}` : ""}`;
      row.innerHTML = `<strong>${quest.type === "item" ? "아이템 · " : quest.type === "monster" ? "몬스터 · " : ""}${quest.title}</strong><span>${questProgressText(quest)}</span>`;
      questTracker.appendChild(row);
    });

    if (active.length === 0) {
      const row = document.createElement("article");
      row.className = "quest-row detail";
      row.innerHTML = `<strong>${playerName}의 개척 목표 완료</strong><span>상자, 제작, 밤 전투로 계속 성장하세요.</span>`;
      questTracker.appendChild(row);
    } else {
      const current = active[0];
      const row = document.createElement("article");
      row.className = `quest-row compact ${current.type ? `mini ${current.type}` : ""}`;
      row.innerHTML = `<strong>${current.type === "item" ? "아이템 · " : current.type === "monster" ? "몬스터 · " : ""}${current.title}</strong><span>${questProgressText(current)}</span>`;
      questTracker.insertBefore(row, questTracker.children[1] || null);
    }
  }

  function questProgressText(quest) {
    if (typeof quest.progress === "function") return quest.progress();
    if (quest.id === "bench") return `${stats.placedWorkbench > 0 ? 1 : 0}/1 제작대`;
    if (quest.id === "ore") return `${Math.min(5, (resources.coal || 0) + (resources.copper || 0) + (resources.iron || 0))}/5 광물`;
    if (quest.id === "weapon") return `${[...crafted].some((id) => gearCatalog[id]?.slot === "weapon") ? 1 : 0}/1 무기`;
    if (quest.id === "ranch") return `${Math.min(1, stats.animalsCaptured)}/1 포획`;
    if (quest.id === "firstNight") return `${Math.min(1, Math.max(0, dayCount - 1))}/1 밤`;
    if (quest.id === "treasure") return `${Math.min(1, stats.chestsOpened)}/1 상자`;
    if (quest.id === "water") return `${discovered.has("water") ? 1 : 0}/1 수영`;
    if (quest.id === "hunter") return `${Math.min(5, stats.monsterKills)}/5 처치`;
    if (quest.id === "frontier") return `${discovered.has("expandedWorld") ? 1 : 0}/1 확장`;
    return quest.body;
  }

  function grantReward(reward, source) {
    if (!reward) return;
    if (reward.resources) {
      Object.entries(reward.resources).forEach(([key, amount]) => addInventoryReward(key, amount));
    }
    if (reward.hotbar) {
      Object.entries(reward.hotbar).forEach(([key, amount]) => addInventoryReward(key, amount));
    }
    if (reward.relic) unlockRelic(reward.relic);
    if (reward.xp) grantXp(reward.xp, source);
    message = `${playerName}, ${source} 보상 획득`;
    updateHotbar();
    updateResourceBar();
    updateQuestTracker();
  }

  function recordItemGain(key, amount) {
    if (!stats?.itemsGained || !key || !Number.isFinite(amount)) return;
    stats.itemsGained[key] = (stats.itemsGained[key] || 0) + amount;
  }

  function gainedItem(key) {
    return stats?.itemsGained?.[key] || 0;
  }

  function blockRewardKey(block) {
    if (block === BLOCKS.dirt) return "dirt";
    if (block === BLOCKS.stone) return "stone";
    if (block === BLOCKS.plank) return "plank";
    if (block === BLOCKS.torch) return "torch";
    if (block === BLOCKS.fence) return "fence";
    if (block === BLOCKS.workbench) return "workbench";
    return `block:${block}`;
  }

  function inventoryLabel(key) {
    const blockNames = {
      dirt: "흙",
      stone: "돌",
      plank: "판자",
      torch: "횃불",
      fence: "울타리",
      workbench: "제작대",
    };
    return itemInfo[key]?.name || blockNames[key] || key;
  }

  function inventoryColor(key) {
    const colors = {
      [ITEMS.coal]: "#d8e2ea",
      [ITEMS.copper]: "#ffad66",
      [ITEMS.iron]: "#d8e2ea",
      [ITEMS.crystal]: "#80d8ff",
      [ITEMS.meat]: "#ff9f6e",
      [ITEMS.leather]: "#d8b365",
      [ITEMS.feather]: "#eef5ff",
      [ITEMS.egg]: "#ffd166",
      [ITEMS.wool]: "#eef5ff",
      [ITEMS.milk]: "#d8e2ea",
      [ITEMS.seed]: "#7ee081",
      [ITEMS.apple]: "#ff6b6b",
      [ITEMS.grass]: "#7ee081",
      plank: "#d8b365",
      stone: "#d8e2ea",
      torch: "#ffd166",
    };
    return colors[key] || "#ffd166";
  }

  function recordMonsterKill(entity) {
    const type = entity.spec.type;
    const habitat = entity.spec.habitat || "surface";
    stats.monsterKills += 1;
    stats.monsterKillsByType[type] = (stats.monsterKillsByType[type] || 0) + 1;
    stats.monsterKillsByHabitat[habitat] = (stats.monsterKillsByHabitat[habitat] || 0) + 1;
    if (entity.elite) stats.eliteKills += 1;
  }

  function monsterKillCount(type) {
    return stats?.monsterKillsByType?.[type] || 0;
  }

  function addInventoryReward(key, amount) {
    if (!amount || amount <= 0) return;
    const blockMap = {
      plank: BLOCKS.plank,
      stone: BLOCKS.stone,
      torch: BLOCKS.torch,
      fence: BLOCKS.fence,
      workbench: BLOCKS.workbench,
    };
    const block = blockMap[key];
    if (block) {
      const slot = hotbar.find((item) => item.type === "block" && item.block === block);
      if (slot) slot.count += amount;
      recordItemGain(blockRewardKey(block), amount);
      showInventoryGain(blockRewardKey(block), amount);
      return;
    }
    const feedSlot = hotbar.find((item) => item.type === "item" && item.item === key);
    if (feedSlot) {
      feedSlot.count += amount;
      recordItemGain(key, amount);
      showInventoryGain(key, amount);
      return;
    }
    resources[key] = (resources[key] || 0) + amount;
    recordItemGain(key, amount);
    showInventoryGain(key, amount);
  }

  function grantXp(amount, reason) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    experience += Math.floor(amount);
    let leveled = false;
    while (experience >= levelThreshold(playerLevel)) {
      experience -= levelThreshold(playerLevel);
      playerLevel += 1;
      leveled = true;
    }
    if (leveled && player) {
      player.health = Math.min(maxPlayerHealth(), player.health + 3);
      message = `${playerName}, 레벨 ${playerLevel} 달성`;
      burst(player.x + player.w / 2, player.y + player.h / 2, "#7ee081", 20);
    } else if (reason && Math.random() < 0.2) {
      message = `${playerName} · ${reason}: XP +${amount}`;
    }
    updateQuestTracker();
  }

  function levelThreshold(level) {
    return 36 + level * 18;
  }

  function unlockRelic(id) {
    if (!id || !relicCatalog[id] || relics.has(id)) return false;
    relics.add(id);
    discovered.add(`relic:${id}`);
    if (id === "ironHeart" && player) player.health = maxPlayerHealth();
    message = `${playerName}, ${relicCatalog[id].name} 획득`;
    return true;
  }

  function randomLockedRelic() {
    const locked = Object.keys(relicCatalog).filter((id) => !relics.has(id));
    return locked.length ? locked[randInt(0, locked.length - 1)] : null;
  }

  function maxPlayerHealth() {
    return 10 + Math.floor((playerLevel || 1) / 3) * 2 + (relics?.has("ironHeart") ? 4 : 0);
  }

  function miningSpeedMultiplier() {
    return relics?.has("minersMark") ? 1.22 : 1;
  }

  function scaledDrop(amount, item) {
    let value = amount * (activeDifficulty?.resourceBonus || 1);
    if (item && relics?.has("minersMark") && [ITEMS.coal, ITEMS.copper, ITEMS.iron].includes(item)) value += 0.25;
    const whole = Math.floor(value);
    return Math.max(1, whole + (Math.random() < value - whole ? 1 : 0));
  }

  function updateWorldEvents(dt) {
    if (!eventState) return;
    if (eventState.remaining > 0) {
      eventState.remaining = Math.max(0, eventState.remaining - dt);
      if (eventState.remaining <= 0) {
        eventState.type = null;
        eventState.title = "";
        eventState.cooldown = 42 + Math.random() * 48;
      }
      updateEventBanner();
      return;
    }

    eventState.cooldown -= dt;
    if (eventState.cooldown <= 0) startRandomEvent();
    updateEventBanner();
  }

  function startRandomEvent() {
    const night = gameTime >= 0.5;
    const options = night
      ? [
          { type: "moonSurge", title: "월식: 몬스터 활동 증가", duration: 36 },
          { type: "meteor", title: "유성 낙하: 근처 지하 광물 증가", duration: 18 },
        ]
      : [
          { type: "supply", title: "보급 상자 발견", duration: 16 },
          { type: "bloom", title: "초원 회복: 먹이 보급", duration: 16 },
        ];
    const event = options[randInt(0, options.length - 1)];
    eventState.type = event.type;
    eventState.title = event.title;
    eventState.remaining = event.duration;
    if (event.type === "supply") {
      if (!placeChestNearPlayer()) grantReward({ resources: { copper: 1, coal: 2 } }, "보급");
    } else if (event.type === "meteor") {
      seedMeteorOre();
    } else if (event.type === "bloom") {
      grantReward({ resources: { grass: 4, seed: 3, apple: 1 } }, "초원 회복");
    }
    message = event.title;
    updateEventBanner();
  }

  function isEventActive(type) {
    return eventState?.type === type && eventState.remaining > 0;
  }

  function updateEventBanner() {
    if (!eventBanner) return;
    if (!gameStarted || !eventState?.type || eventState.remaining <= 0) {
      eventBanner.classList.add("hidden");
      eventBanner.textContent = "";
      return;
    }
    eventBanner.classList.remove("hidden");
    eventBanner.textContent = `${eventState.title} · ${Math.ceil(eventState.remaining)}초`;
  }

  function placeChestNearPlayer() {
    const center = Math.floor((player.x + player.w / 2) / TILE);
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const x = clamp(center + randInt(-24, 24), 6, WORLD_W - 6);
      const y = surfaceY(x) - 1;
      if (getTile(x, y) !== BLOCKS.air || !isSolid(getTile(x, y + 1))) continue;
      setTile(x, y, BLOCKS.chest);
      burst(x * TILE + TILE / 2, y * TILE + TILE / 2, "#ffd166", 14);
      return true;
    }
    return false;
  }

  function seedMeteorOre() {
    const center = Math.floor((player.x + player.w / 2) / TILE);
    const cx = clamp(center + randInt(-18, 18), 8, WORLD_W - 8);
    const cy = clamp(surfaceY(cx) + randInt(8, 24), 14, WORLD_H - 6);
    const block = Math.random() < 0.58 ? BLOCKS.copper : BLOCKS.iron;
    for (let yy = -3; yy <= 3; yy += 1) {
      for (let xx = -3; xx <= 3; xx += 1) {
        const x = cx + xx;
        const y = cy + yy;
        if (Math.hypot(xx, yy) <= 3 && inBounds(x, y) && isRock(getTile(x, y))) {
          setTile(x, y, Math.random() < 0.22 ? BLOCKS.coal : block);
        }
      }
    }
    burst(cx * TILE + TILE / 2, cy * TILE + TILE / 2, "#80d8ff", 26);
  }

  function canCraft(recipe) {
    return Object.entries(recipe.req).every(([key, amount]) => availableResource(key) >= amount);
  }

  function craftStatus(recipe) {
    const items = Object.entries(recipe.req).map(([key, need]) => {
      const have = availableResource(key);
      return {
        key,
        name: resourceName(key),
        have,
        need,
        missing: Math.max(0, need - have),
      };
    });
    return {
      can: items.every((item) => item.missing <= 0),
      items,
    };
  }

  function craftRecipe(recipe) {
    if (!isNearWorkbench() || !canCraft(recipe)) return;
    Object.entries(recipe.req).forEach(([key, amount]) => spendResource(key, amount));
    crafted.add(recipe.id);
    stats.craftedItems += 1;
    if (recipe.type === "arrow") {
      unlockedArrows.add(recipe.unlockArrow);
      equipped.arrow = recipe.unlockArrow;
      discovered.add(`arrow:${recipe.unlockArrow}`);
      grantXp(8, `${arrowCatalog[recipe.unlockArrow].name} 업그레이드`);
      message = `${arrowCatalog[recipe.unlockArrow].name} 업그레이드 완료`;
    } else {
      discovered.add(`gear:${recipe.id}`);
      grantXp(8, `${gearCatalog[recipe.id].name} 제작`);
      message = `${gearCatalog[recipe.id].name} 제작 완료`;
    }
    updateHotbar();
    updateResourceBar();
    renderCraftPanel();
    updateQuestProgress();
  }

  function availableResource(key) {
    if (key === "plank") return hotbar.find((item) => item.type === "block" && item.block === BLOCKS.plank)?.count || 0;
    if (key === "stone") return hotbar.find((item) => item.type === "block" && item.block === BLOCKS.stone)?.count || 0;
    return resources?.[key] || 0;
  }

  function spendResource(key, amount) {
    const slot = key === "plank"
      ? hotbar.find((item) => item.type === "block" && item.block === BLOCKS.plank)
      : key === "stone"
        ? hotbar.find((item) => item.type === "block" && item.block === BLOCKS.stone)
        : null;
    if (slot) slot.count -= amount;
    else resources[key] = Math.max(0, (resources[key] || 0) - amount);
  }

  function resourceName(key) {
    if (key === "plank") return "판자";
    if (key === "stone") return "돌";
    return itemInfo[key]?.name || key;
  }

  function recipeResultInfo(recipe) {
    if (recipe.type === "arrow") return arrowCatalog[recipe.unlockArrow];
    return gearCatalog[recipe.id] || { name: recipe.id, desc: "" };
  }

  function recipeForGear(id) {
    return recipes.find((recipe) => recipe.id === id) || { req: {} };
  }

  function recipeCategory(recipe) {
    if (recipe.type === "arrow") return "화살 업그레이드";
    const slot = gearCatalog[recipe.id]?.slot;
    if (slot === "weapon") return "무기";
    if (slot === "armor") return "방어구";
    if (slot === "boots") return "신발";
    if (slot === "offhand") return "보조 장비";
    return "제작";
  }

  function recipeReqText(recipe) {
    return Object.entries(recipe.req)
      .map(([key, amount]) => `${resourceName(key)} ${amount}`)
      .join(" + ");
  }

  function gearSlotName(slot) {
    if (slot === "weapon") return "무기";
    if (slot === "arrow") return "화살";
    if (slot === "armor") return "방어구";
    if (slot === "boots") return "신발";
    if (slot === "offhand") return "보조 장비";
    return slot;
  }

  function equippedLabel(slot, id) {
    if (!id) return "없음";
    if (slot === "arrow") return arrowCatalog[id]?.name || "나무 화살";
    return gearCatalog[id]?.name || "없음";
  }

  function isNearWorkbench() {
    if (!player || !world) return false;
    const px = Math.floor((player.x + player.w / 2) / TILE);
    const py = Math.floor((player.y + player.h / 2) / TILE);
    for (let y = py - 3; y <= py + 3; y += 1) {
      for (let x = px - 3; x <= px + 3; x += 1) {
        if (getTile(x, y) === BLOCKS.workbench) return true;
      }
    }
    return false;
  }

  function drawFenceIcon(iconCtx) {
    iconCtx.fillStyle = "#b47b31";
    iconCtx.fillRect(8, 12, 24, 5);
    iconCtx.fillRect(8, 24, 24, 5);
    iconCtx.fillStyle = "#6f421d";
    iconCtx.fillRect(11, 8, 6, 26);
    iconCtx.fillRect(24, 8, 6, 26);
  }

  function drawWorkbenchIcon(iconCtx) {
    iconCtx.fillStyle = "#b47b31";
    iconCtx.fillRect(6, 8, 28, 26);
    iconCtx.fillStyle = "#5a3218";
    iconCtx.fillRect(9, 13, 22, 4);
    iconCtx.fillRect(10, 24, 6, 8);
    iconCtx.fillRect(24, 24, 6, 8);
    iconCtx.fillStyle = "#d8e2ea";
    iconCtx.fillRect(24, 10, 5, 5);
  }

  function createGearIcon(id, slot, size = 40) {
    const icon = document.createElement("canvas");
    icon.width = size;
    icon.height = size;
    icon.className = "gear-icon";
    icon.title = equippedLabel(slot, id);
    const iconCtx = icon.getContext("2d");
    iconCtx.imageSmoothingEnabled = false;
    drawGearIcon(iconCtx, id, slot, size);
    return icon;
  }

  function drawGearIcon(iconCtx, id, slot, size) {
    const s = size / 40;
    iconCtx.clearRect(0, 0, size, size);
    iconCtx.save();
    iconCtx.scale(s, s);
    iconCtx.fillStyle = "rgba(255,255,255,0.08)";
    iconCtx.fillRect(2, 2, 36, 36);
    iconCtx.strokeStyle = "rgba(185,213,255,0.28)";
    iconCtx.strokeRect(2.5, 2.5, 35, 35);
    if (!id) {
      iconCtx.fillStyle = "rgba(216,226,234,0.38)";
      iconCtx.fillRect(12, 18, 16, 4);
      iconCtx.restore();
      return;
    }
    if (slot === "arrow") {
      drawArrowIcon(iconCtx, id);
      iconCtx.restore();
      return;
    }
    if (id.includes("Sword") || id === "shadowBlade") drawSwordIcon(iconCtx, id);
    else if (id === "ironSpear") drawSpearIcon(iconCtx);
    else if (id.includes("Bow")) drawBowIcon(iconCtx, id);
    else if (id.includes("Armor")) drawArmorIcon(iconCtx, id);
    else if (id === "flippers") drawFlippersIcon(iconCtx);
    else if (id === "shield") drawShieldIcon(iconCtx);
    else if (id === "lantern") drawLanternIcon(iconCtx);
    iconCtx.restore();
  }

  function drawArrowIcon(iconCtx, id) {
    const arrow = arrowCatalog[id] || arrowCatalog.wood;
    iconCtx.save();
    iconCtx.translate(20, 20);
    iconCtx.rotate(-0.42);
    iconCtx.fillStyle = arrow.trail;
    iconCtx.globalAlpha = 0.28;
    iconCtx.fillRect(-17, -1, 12, 2);
    iconCtx.globalAlpha = 1;
    iconCtx.fillStyle = arrow.color;
    iconCtx.fillRect(-13, -2, 24, 4);
    iconCtx.fillStyle = id === "fire" ? "#ff4d2e" : id === "crystal" ? "#80d8ff" : "#eef5ff";
    iconCtx.beginPath();
    iconCtx.moveTo(18, 0);
    iconCtx.lineTo(9, -6);
    iconCtx.lineTo(9, 6);
    iconCtx.closePath();
    iconCtx.fill();
    iconCtx.fillStyle = id === "fire" ? "#ffd166" : id === "crystal" ? "#b794ff" : "#6f421d";
    iconCtx.fillRect(-18, -5, 7, 10);
    iconCtx.restore();
  }

  function drawSwordIcon(iconCtx, id) {
    const blade = id === "woodenSword" ? "#d8b365" : id === "copperSword" ? "#d48852" : id === "shadowBlade" ? "#2b2546" : "#d8e2ea";
    const edge = id === "shadowBlade" ? "#b794ff" : "#eef5ff";
    iconCtx.save();
    iconCtx.translate(20, 20);
    iconCtx.rotate(-0.72);
    iconCtx.fillStyle = blade;
    iconCtx.fillRect(-2, -15, 4, 24);
    iconCtx.fillStyle = edge;
    iconCtx.fillRect(1, -14, 2, 21);
    iconCtx.fillStyle = "#6f421d";
    iconCtx.fillRect(-9, 8, 18, 4);
    iconCtx.fillStyle = "#3b2312";
    iconCtx.fillRect(-2, 11, 4, 9);
    iconCtx.restore();
  }

  function drawSpearIcon(iconCtx) {
    iconCtx.save();
    iconCtx.translate(20, 20);
    iconCtx.rotate(-0.66);
    iconCtx.fillStyle = "#8b5a2b";
    iconCtx.fillRect(-1, -14, 3, 27);
    iconCtx.fillStyle = "#d8e2ea";
    iconCtx.beginPath();
    iconCtx.moveTo(0, -21);
    iconCtx.lineTo(7, -10);
    iconCtx.lineTo(-6, -10);
    iconCtx.closePath();
    iconCtx.fill();
    iconCtx.restore();
  }

  function drawBowIcon(iconCtx, id) {
    iconCtx.strokeStyle = id === "ironBow" ? "#c7d4df" : "#b47b31";
    iconCtx.lineWidth = 4;
    iconCtx.beginPath();
    iconCtx.arc(18, 20, 14, -1.25, 1.25);
    iconCtx.stroke();
    iconCtx.strokeStyle = "#eef5ff";
    iconCtx.lineWidth = 1.5;
    iconCtx.beginPath();
    iconCtx.moveTo(22, 7);
    iconCtx.lineTo(22, 33);
    iconCtx.stroke();
    drawArrowIcon(iconCtx, equipped?.arrow || "wood");
  }

  function drawArmorIcon(iconCtx, id) {
    const colors = {
      clothArmor: ["#7aa7d9", "#eef5ff"],
      copperArmor: ["#b96a3b", "#ffd1a3"],
      ironArmor: ["#96a6b8", "#eef5ff"],
    };
    const [base, shine] = colors[id] || colors.clothArmor;
    iconCtx.fillStyle = base;
    iconCtx.fillRect(12, 11, 16, 22);
    iconCtx.fillRect(8, 15, 6, 9);
    iconCtx.fillRect(26, 15, 6, 9);
    iconCtx.fillStyle = shine;
    iconCtx.fillRect(17, 13, 6, 15);
    iconCtx.fillStyle = "rgba(0,0,0,0.24)";
    iconCtx.fillRect(12, 29, 16, 4);
  }

  function drawFlippersIcon(iconCtx) {
    iconCtx.fillStyle = "#47b4d7";
    iconCtx.beginPath();
    iconCtx.ellipse(15, 23, 6, 13, 0.35, 0, Math.PI * 2);
    iconCtx.ellipse(25, 23, 6, 13, -0.35, 0, Math.PI * 2);
    iconCtx.fill();
    iconCtx.fillStyle = "#d9f7ff";
    iconCtx.fillRect(13, 11, 5, 6);
    iconCtx.fillRect(22, 11, 5, 6);
  }

  function drawShieldIcon(iconCtx) {
    iconCtx.fillStyle = "#8d5a2d";
    iconCtx.beginPath();
    iconCtx.moveTo(20, 8);
    iconCtx.lineTo(31, 13);
    iconCtx.lineTo(28, 28);
    iconCtx.lineTo(20, 34);
    iconCtx.lineTo(12, 28);
    iconCtx.lineTo(9, 13);
    iconCtx.closePath();
    iconCtx.fill();
    iconCtx.fillStyle = "#d8e2ea";
    iconCtx.fillRect(18, 11, 4, 20);
  }

  function drawLanternIcon(iconCtx) {
    iconCtx.fillStyle = "#5a3218";
    iconCtx.fillRect(15, 10, 10, 5);
    iconCtx.strokeStyle = "#d8e2ea";
    iconCtx.lineWidth = 2;
    iconCtx.strokeRect(13, 14, 14, 18);
    iconCtx.fillStyle = "#ffd166";
    iconCtx.fillRect(16, 18, 8, 10);
    iconCtx.fillStyle = "rgba(255,209,102,0.35)";
    iconCtx.fillRect(10, 16, 20, 17);
  }

  function drawItemIcon(iconCtx, item, cx, cy, r) {
    iconCtx.clearRect(0, 0, 40, 40);
    if (item === ITEMS.grass) {
      iconCtx.fillStyle = "#7ee081";
      for (let i = 0; i < 5; i += 1) {
        iconCtx.fillRect(10 + i * 4, 13 + (i % 2) * 4, 3, 18);
      }
    } else if (item === ITEMS.seed) {
      iconCtx.fillStyle = "#d8b365";
      iconCtx.beginPath();
      iconCtx.ellipse(cx, cy, r * 0.42, r * 0.68, -0.7, 0, Math.PI * 2);
      iconCtx.fill();
      iconCtx.fillStyle = "#7ee081";
      iconCtx.fillRect(cx + 4, cy - 9, 8, 3);
    } else if (item === ITEMS.apple) {
      iconCtx.fillStyle = "#ff5a57";
      iconCtx.beginPath();
      iconCtx.arc(cx, cy + 2, r * 0.75, 0, Math.PI * 2);
      iconCtx.fill();
      iconCtx.fillStyle = "#5a3218";
      iconCtx.fillRect(cx - 1, cy - 14, 3, 8);
      iconCtx.fillStyle = "#7ee081";
      iconCtx.fillRect(cx + 3, cy - 12, 8, 4);
    } else if (item === ITEMS.egg) {
      iconCtx.fillStyle = "#f7ead0";
      iconCtx.beginPath();
      iconCtx.ellipse(cx, cy + 2, r * 0.72, r * 0.9, 0, 0, Math.PI * 2);
      iconCtx.fill();
      iconCtx.fillStyle = "rgba(255,255,255,0.55)";
      iconCtx.fillRect(cx - 4, cy - 5, 5, 4);
    } else if (item === ITEMS.wool) {
      iconCtx.fillStyle = "#eef5ff";
      for (const [ox, oy, rr] of [[-6, 1, 5], [0, -3, 6], [6, 1, 5], [-1, 5, 6]]) {
        iconCtx.beginPath();
        iconCtx.arc(cx + ox, cy + oy, rr, 0, Math.PI * 2);
        iconCtx.fill();
      }
      iconCtx.fillStyle = "#c7d4df";
      iconCtx.fillRect(cx - 8, cy + 8, 16, 3);
    } else if (item === ITEMS.milk) {
      iconCtx.fillStyle = "#d8e2ea";
      iconCtx.fillRect(cx - 7, cy - 8, 14, 20);
      iconCtx.fillStyle = "#eef5ff";
      iconCtx.fillRect(cx - 5, cy - 5, 10, 14);
      iconCtx.fillStyle = "#79c8ff";
      iconCtx.fillRect(cx - 4, cy + 2, 8, 4);
    } else if (item === ITEMS.meat) {
      iconCtx.fillStyle = "#d94d4d";
      iconCtx.beginPath();
      iconCtx.ellipse(cx - 2, cy + 1, r * 0.8, r * 0.58, -0.35, 0, Math.PI * 2);
      iconCtx.fill();
      iconCtx.fillStyle = "#f5d7b2";
      iconCtx.fillRect(cx + 5, cy + 3, 9, 4);
      iconCtx.fillRect(cx + 12, cy + 1, 3, 8);
    } else if (item === ITEMS.leather) {
      iconCtx.fillStyle = "#9a6538";
      iconCtx.beginPath();
      iconCtx.moveTo(cx - 9, cy - 7);
      iconCtx.lineTo(cx + 7, cy - 9);
      iconCtx.lineTo(cx + 10, cy + 7);
      iconCtx.lineTo(cx - 7, cy + 10);
      iconCtx.closePath();
      iconCtx.fill();
      iconCtx.fillStyle = "rgba(255,255,255,0.18)";
      iconCtx.fillRect(cx - 4, cy - 3, 8, 2);
    } else if (item === ITEMS.feather) {
      iconCtx.fillStyle = "#eef5ff";
      iconCtx.beginPath();
      iconCtx.ellipse(cx, cy, r * 0.42, r * 1.05, 0.7, 0, Math.PI * 2);
      iconCtx.fill();
      iconCtx.strokeStyle = "#9fb0c7";
      iconCtx.lineWidth = 2;
      iconCtx.beginPath();
      iconCtx.moveTo(cx - 6, cy + 8);
      iconCtx.lineTo(cx + 7, cy - 8);
      iconCtx.stroke();
    } else if (item === ITEMS.coal || item === ITEMS.copper || item === ITEMS.iron || item === ITEMS.crystal) {
      const colors = {
        [ITEMS.coal]: ["#20242a", "#6e7681"],
        [ITEMS.copper]: ["#c96b34", "#ffd1a3"],
        [ITEMS.iron]: ["#b9c2ca", "#eef5ff"],
        [ITEMS.crystal]: ["#54c7ff", "#d9f7ff"],
      };
      const [base, shine] = colors[item];
      iconCtx.fillStyle = base;
      iconCtx.beginPath();
      iconCtx.moveTo(cx - 9, cy - 2);
      iconCtx.lineTo(cx - 2, cy - 10);
      iconCtx.lineTo(cx + 9, cy - 5);
      iconCtx.lineTo(cx + 7, cy + 8);
      iconCtx.lineTo(cx - 6, cy + 10);
      iconCtx.closePath();
      iconCtx.fill();
      iconCtx.fillStyle = shine;
      iconCtx.fillRect(cx - 2, cy - 5, 5, 3);
      if (item === ITEMS.crystal) {
        iconCtx.fillStyle = "rgba(183, 148, 255, 0.75)";
        iconCtx.fillRect(cx + 5, cy + 2, 3, 6);
      }
    } else {
      iconCtx.fillStyle = "#eef5ff";
      iconCtx.beginPath();
      iconCtx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
      iconCtx.fill();
    }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIEW_W * dpr;
    canvas.height = VIEW_H * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function loop(now = performance.now()) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    if (!gameStarted || !player) return;
    try {
      update(dt);
      render();
      frameCount += 1;
      writeDebugDataset();
    } catch (error) {
      lastError = error?.message || String(error);
      console.error(error);
      writeDebugDataset();
    }
  }

  function writeDebugDataset() {
    if (!player) return;
    canvas.dataset.frameCount = String(frameCount);
    canvas.dataset.lastError = lastError || "";
    canvas.dataset.playerX = String(Math.round(player.x));
    canvas.dataset.playerY = String(Math.round(player.y));
    canvas.dataset.entities = String(entities?.length || 0);
    canvas.dataset.animals = String(entities?.filter((e) => e.kind === "animal").length || 0);
    canvas.dataset.animalsInWater = String(entities?.filter((e) => e.kind === "animal" && !e.spec?.aquatic && isBodyInWater(e)).length || 0);
    canvas.dataset.projectiles = String(projectiles?.length || 0);
    canvas.dataset.weaponAction = weaponAction || "";
    canvas.dataset.weaponActionTimer = String(Number(weaponActionTimer?.toFixed?.(3) || 0));
    canvas.dataset.equippedWeapon = equipped?.weapon || "";
    canvas.dataset.shotsFired = String(shotsFired || 0);
    canvas.dataset.lastProjectileRemoval = lastProjectileRemoval || "";
  }

  function inBounds(x, y) {
    return x >= 0 && y >= 0 && x < WORLD_W && y < WORLD_H;
  }

  function getTile(x, y) {
    if (!inBounds(x, y)) return BLOCKS.stone;
    return world.tiles[y][x];
  }

  function setTile(x, y, block) {
    if (inBounds(x, y)) world.tiles[y][x] = block;
  }

  function isSolid(block) {
    return Boolean(blockInfo[block]?.solid);
  }

  function isBodyInWater(body) {
    if (!world || !body) return false;
    const minX = Math.floor(body.x / TILE);
    const maxX = Math.floor((body.x + body.w) / TILE);
    const minY = Math.floor((body.y + body.h * 0.35) / TILE);
    const maxY = Math.floor((body.y + body.h) / TILE);
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (getTile(x, y) === BLOCKS.water) return true;
      }
    }
    return false;
  }

  function isRock(block) {
    return [BLOCKS.stone, BLOCKS.darkStone, BLOCKS.gravel].includes(block);
  }

  function surfaceY(x) {
    for (let y = 0; y < WORLD_H; y += 1) {
      if (isSolid(getTile(x, y))) return y;
    }
    return WORLD_H - 1;
  }

  function blockedAhead(entity) {
    const checkX = Math.floor((entity.x + (entity.facing > 0 ? entity.w + 5 : -5)) / TILE);
    const footY = Math.floor((entity.y + entity.h - 3) / TILE);
    return isSolid(getTile(checkX, footY)) || !isSolid(getTile(checkX, footY + 1));
  }

  function waterAhead(entity) {
    if (entity.spec?.aquatic) return false;
    const checkX = Math.floor((entity.x + (entity.facing > 0 ? entity.w + 8 : -8)) / TILE);
    const footY = Math.floor((entity.y + entity.h - 2) / TILE);
    return (
      getTile(checkX, footY) === BLOCKS.water ||
      getTile(checkX, footY + 1) === BLOCKS.water ||
      getTile(checkX + entity.facing, footY + 1) === BLOCKS.water ||
      getTile(checkX, footY + 2) === BLOCKS.water
    );
  }

  function nightAmount() {
    const transition = 0.035;
    if (gameTime < 0.5 - transition) return 0;
    if (gameTime < 0.5 + transition) return smoothstep((gameTime - (0.5 - transition)) / (transition * 2));
    if (gameTime < 1 - transition) return 1;
    return 1 - smoothstep((gameTime - (1 - transition)) / transition);
  }

  function phaseInfo() {
    const isNight = gameTime >= 0.5;
    const phaseStart = isNight ? 0.5 : 0;
    const progress = (gameTime - phaseStart) / 0.5;
    const remaining = Math.max(0, PHASE_SECONDS * (1 - progress));
    return {
      name: isNight ? "밤" : "낮",
      progress: clamp(progress, 0, 1),
      remaining,
    };
  }

  function formatTime(seconds) {
    const total = Math.ceil(seconds);
    const minutes = Math.floor(total / 60);
    const secs = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function normalizePlayerName(rawName) {
    const cleaned = String(rawName || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return (cleaned || "개척자").slice(0, 12);
  }

  function blockColor(block) {
    const colors = {
      [BLOCKS.grass]: "#67b63f",
      [BLOCKS.dirt]: "#9a6538",
      [BLOCKS.stone]: "#8c9294",
      [BLOCKS.darkStone]: "#4f555a",
      [BLOCKS.sand]: "#dbc97c",
      [BLOCKS.water]: "#1b94e8",
      [BLOCKS.plank]: "#b47b31",
      [BLOCKS.trunk]: "#7a4d24",
      [BLOCKS.leaves]: "#3d9f24",
      [BLOCKS.coal]: "#252525",
      [BLOCKS.copper]: "#d87933",
      [BLOCKS.iron]: "#d2b18f",
      [BLOCKS.chest]: "#b47b31",
      [BLOCKS.campBed]: "#d7b5ff",
      [BLOCKS.campLantern]: "#ffd166",
      [BLOCKS.musicBox]: "#b794ff",
    };
    return colors[block] || "#ffffff";
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 210;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 3 + Math.random() * 4,
        life: 0.45 + Math.random() * 0.45,
        maxLife: 0.9,
        color,
      });
    }
  }

  function roundRect(context, x, y, w, h, r) {
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  window.addEventListener("keydown", (event) => {
    if (!gameStarted) return;
    const key = event.key.toLowerCase();
    keys.add(key);
    if (/^[1-9]$/.test(key)) {
      selected = Number(key) - 1;
      updateHotbar();
    }
    if (key === "f" || key === "r") useEquippedWeapon();
    if (key === "e") interact();
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  document.querySelectorAll("[data-touch-control]").forEach((button) => {
    const control = button.dataset.touchControl;
    const release = (event) => {
      event.preventDefault();
      touchControls.delete(control);
      button.classList.remove("active");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!gameStarted) return;
      button.setPointerCapture(event.pointerId);
      touchControls.add(control);
      button.classList.add("active");
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  document.querySelectorAll("[data-touch-action]").forEach((button) => {
    const action = button.dataset.touchAction;
    const release = (event) => {
      event.preventDefault();
      if (action === "mine") {
        touchMining = false;
        miningTarget = null;
      }
      button.classList.remove("active");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!gameStarted) return;
      button.setPointerCapture(event.pointerId);
      button.classList.add("active");
      if (action === "mine") {
        aimAtTile(actionTarget("mine"));
        touchMining = true;
      } else if (action === "place") {
        const target = actionTarget("place");
        aimAtTile(target);
        placeBlock(target.x, target.y);
      } else if (action === "interact") {
        interact();
      } else if (action === "attack" || action === "shoot") {
        useEquippedWeapon();
      }
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    mouse.y = ((event.clientY - rect.top) / rect.height) * VIEW_H;
    mouse.worldX = mouse.x + camera.x;
    mouse.worldY = mouse.y + camera.y;
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (!gameStarted) return;
    canvas.setPointerCapture(event.pointerId);
    if (event.button === 2) {
      mouse.right = true;
      placeBlock(Math.floor(mouse.worldX / TILE), Math.floor(mouse.worldY / TILE));
    } else if (event.shiftKey) {
      useEquippedWeapon();
    } else {
      mouse.down = true;
    }
  });

  canvas.addEventListener("pointerup", (event) => {
    if (event.button === 2) mouse.right = false;
    else mouse.down = false;
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  restartButton.addEventListener("click", () => {
    gameStarted = false;
    closeSidePanel();
    saveChoices?.classList.add("hidden");
    if (saveChoices) saveChoices.innerHTML = "";
    if (questTracker) questTracker.innerHTML = "";
    if (eventBanner) {
      eventBanner.classList.add("hidden");
      eventBanner.textContent = "";
    }
    difficultyScreen.classList.remove("hidden");
  });
  openCraft.addEventListener("click", () => {
    if (gameStarted) openPanel("craft", "제작대", renderCraftPanel);
  });
  openGear.addEventListener("click", () => {
    if (gameStarted) openPanel("gear", "장비", renderGearPanel);
  });
  openRecipes.addEventListener("click", () => {
    if (gameStarted) openPanel("recipes", "조합 도감", renderRecipeGuidePanel);
  });
  openCodex.addEventListener("click", () => {
    if (gameStarted) openPanel("codex", "도감", renderCodexPanel);
  });
  openSave.addEventListener("click", () => {
    if (gameStarted) openPanel("save", "저장", renderSavePanel);
  });
  closePanel.addEventListener("click", closeSidePanel);
  document.querySelectorAll("[data-difficulty]").forEach((button) => {
    button.addEventListener("click", () => handleDifficultyStart(button.dataset.difficulty));
  });
  playerNameInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const normalButton = document.querySelector('[data-difficulty="normal"]');
    normalButton?.click();
  });
  window.addEventListener("resize", resizeCanvas);

  window.__blockSurvivalDebug = () => {
    const samplePoints = [
      [VIEW_W / 2, VIEW_H / 2],
      [VIEW_W / 2, VIEW_H - 96],
      [96, 96],
    ];
    const samples = samplePoints.map(([x, y]) => Array.from(ctx.getImageData(x, y, 1, 1).data));
    return {
      frameCount,
      lastError,
      player: player ? { x: Math.round(player.x), y: Math.round(player.y), health: player.health } : null,
      camera: { x: Math.round(camera.x), y: Math.round(camera.y) },
      playerName,
      safeCamp: safeCamp
        ? {
            x: safeCamp.x,
            y: safeCamp.y,
            near: isPlayerInSafeCamp(),
            comfortTimer: Number(safeCamp.comfortTimer.toFixed(1)),
            musicTimer: Number(safeCamp.musicTimer.toFixed(1)),
          }
        : null,
      dayCount,
      gameTime: Number(gameTime?.toFixed?.(3) || 0),
      entityCount: entities?.length || 0,
      monsterCount: entities?.filter((e) => e.kind === "monster").length || 0,
      animalsInWater: entities?.filter((e) => e.kind === "animal" && !e.spec?.aquatic && isBodyInWater(e)).length || 0,
      animalCount: entities?.filter((e) => e.kind === "animal").length || 0,
      projectileCount: projectiles?.length || 0,
      weaponAction,
      weaponActionTimer: Number(weaponActionTimer?.toFixed?.(3) || 0),
      shotsFired,
      lastProjectileRemoval,
      inventoryBurstCount: inventoryBursts?.length || 0,
      resourcePulseCount: resourcePulse ? Object.keys(resourcePulse).length : 0,
      questCount: completedQuests?.size || 0,
      miniQuestCount: completedMiniQuests?.size || 0,
      relicCount: relics?.size || 0,
      stats,
      equipped,
      unlockedArrows: unlockedArrows ? [...unlockedArrows] : [],
      hotbar: hotbar.map((item) => ({ type: item.type, block: item.block, item: item.item, count: item.count })),
      samples,
    };
  };
  window.__blockSurvivalDebugGrant = (item = ITEMS.coal, amount = 1) => {
    if (!gameStarted || !player) return false;
    addResource(item, amount, "디버그 지급");
    return true;
  };
  window.__blockSurvivalDebugTile = (x, y) => getTile(Number(x), Number(y));
  window.__blockSurvivalDebugDrownAnimal = () => {
    if (!gameStarted || !entities?.length) return false;
    const animal = entities.find((entity) => entity.kind === "animal" && !entity.spec?.aquatic);
    const water = findWaterTile(3, WORLD_W - 3);
    if (!animal || !water) return false;
    animal.x = water.x * TILE;
    animal.y = water.y * TILE;
    animal.vx = 0;
    animal.vy = 0;
    animal.drownTimer = 0;
    animal.drownTextTimer = 0;
    return true;
  };

  waitForAssets()
    .then(() => {
      resizeCanvas();
      loading.classList.add("hidden");
      difficultyScreen.classList.remove("hidden");
    })
    .catch((error) => {
      loading.textContent = error.message;
    });
})();
