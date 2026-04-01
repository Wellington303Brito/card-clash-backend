const CARD_DB = {
 P001: {
    id: "P001",
    name: "Morcego Vampiro",
    emoji: "🦇",
    cardClass: "unit",
    type: "Pusher",
    rarity: "Básico",
    cost: 3,
    attackCost: 1,
    attack: 200,
    defense: 200,
    text: "",
    effects: []
  },

  P002: {
    id: "P002",
    name: "Gordonops",
    emoji: "🦖",
    cardClass: "unit",
    type: "Pusher",
    rarity: "Básico",
    cost: 3,
    attackCost: 3,
    attack: 500,
    defense: 300,
    text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",
    effects: [
      { trigger: "onSummon", id: "blitz" }
    ]
  },

  P003: {
    id: "P003",
    name: "O Virulento",
    emoji: "☣️",
    cardClass: "unit",
    type: "Pusher",
    rarity: "Especial",
    cost: 3,
    attackCost: 2,
    attack: 400,
    defense: 100,
    text: "No começo do turno causa 150 de dano à unidade ativa inimiga.",
    effects: [
      { trigger: "turnStart", id: "damageActiveEnemy", args: { amount: 150 } }
    ]
  },

  P004: {
    id: "P004",
    name: "Hastur, o Rei sem Nome",
    emoji: "👁️",
    cardClass: "unit",
    type: "Pusher",
    rarity: "Elite",
    cost: 6,
    attackCost: 2,
    attack: 800,
    defense: 400,
    text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. Quando for derrotado, causa 200 de dano a todas as suas unidades em campo.",

    effects: [
      { trigger: "onSummon", id: "smokescreen" },
      { trigger: "onDefeat", id: "damageAllAllies", args: { amount: 200 } }
    ]
  },

  P005: {
  id: "P005",
  name: "Olho de Hórus",
  emoji: "👁️",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Comum",
  cost: 3,
  attackCost: 4,
  attack: 500,
  defense: 200,
  text: "Distante - Pode atacar do banco. Não pode atacar diretamente o banco inimigo a partir do seu banco, nem atacar diretamente o PV inimigo a partir dele. Mobilize - Enquanto estiver em campo, concede -2 de custo de mobilização para cartas na sua mão. Ao entrar em campo, revela uma carta aleatória da mão do oponente.",
  effects: [
    { trigger: "onSummon", id: "ranged" },
    { trigger: "onSummon", id: "mobilize", args: { amount: 2 } },
    { trigger: "onSummon", id: "revealEnemyHandCard" }
  ]
},

P006: {
  id: "P006",
  name: "Casper",
  emoji: "👻",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 4,
  attackCost: 2,
  attack: 600,
  defense: 300,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Quando for derrotado, causa 300 de dano ao atacante.",

  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onDefeat", id: "deathDamage300" }
  ]
},
 P007: {
  id: "P007",
  name: "Jäger",
  emoji: "🎯",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Comum",
  cost: 4,
  attackCost: 5,
  attack: 600,
  defense: 600,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Pin - As unidades atingidas por esta carta ficam Pinned por 1 turno.",

  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onSummon", id: "pinStrike", args: { turns: 1 } }
  ]
},
P008: {
  id: "P008",
  name: "Poljergeist",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 1,
  attackCost: 0,
  attack: 100,
  defense: 100,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",
  effects: [
    { trigger: "onSummon", id: "blitz" }
  ]
},

P009: {
  id: "P009",
  name: "Leopold, O Conquistador",
  emoji: "👑",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Elite",
  cost: 10,
  attackCost: 4,
  attack: 500,
  defense: 700,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",
  effects: [
    { trigger: "onSummon", id: "mobilize", args: { amount: 2 } },
    { trigger: "onSummon", id: "returnAllEnemyUnitsToHand" }
  ]
},
P010: {
  id: "P010",
  name: "Rato Mutante",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 1,
  attackCost: 0,
  attack: 200,
  defense: 100,
  text: "",
  effects: [
     ]
},
P011: {
  id: "P011",
  name: "Apóstolo do Vazio",
  emoji: "🌌",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Extraordinário",
  cost: 6,
  attackCost: 3,
  attack: 800,
  defense: 1200,
  tags: ["void"],
  text: "Enquanto esta carta estiver em campo, seus Servos do Vazio ganham Blitz.",
  effects: [
    { trigger: "turnStart", id: "voidServantsBlitz" }
  ]
},
P012: {
  id: "P012",
  name: "Servo do Vazio",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 3,
  attackCost: 4,
  attack: 500,
  defense: 400,
  text: "",
  effects: [
     ]
},
P013: {
  id: "P013",
  name: "Alma Penada",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 1,
  attackCost: 1,
  attack: 200,
  defense: 200,
  text: "",
  effects: [
     ]
},

P014: {
  id: "P014",
  name: "Eternum",
  emoji: "⛓️",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Comum",
  cost: 3,
  attackCost: 3,
  attack: 500,
  defense: 500,
  text: "Pin - As unidades atingidas por esta carta ficam Pinned por 1 turno. Enquanto esta carta estiver em campo, nenhum jogador pode invocar unidades.",

  effects: [
    { trigger: "onSummon", id: "eternumLockField" },
    { trigger: "onDefeat", id: "eternumUnlockField" },
    { trigger: "onSummon", id: "pinStrike", args:{turns:1} }
  ]
},
P015: {
  id: "P015",
  name: "XF-Artemis",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 4,
  attackCost: 5,
  attack: 800,
  defense: 500,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",
  effects: [
    { trigger: "onSummon", id: "blitz" }
  ]
},
P016: {
  id: "P016",
  name: "Batedor de Draedon",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 2,
  attackCost: 2,
  attack: 100,
  defense: 500,
  text: " ",
  effects: [
    
  ]
},
P017: {
  id: "P017",
  name: "Pequeno Ladrão",
  emoji: "🗡️",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 2,
  attackCost: 0,
  attack: 200,
  defense: 100,
  text:"Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Enquanto estiver em campo, o oponente perde 1 PE no início do turno."
,
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "turnStart", id: "thiefDrainEnergy" }
  ]
},
P018: {
  id: "P018",
  name: "Meganeura",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 1,
  attackCost: 1,
  attack: 100,
  defense: 200,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",

  effects: [
    { trigger: "onSummon", id: "blitz" },
    
  ]
},
P019: {
  id: "P019",
  name: "Megalodonte",
  emoji: "🦈",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Comum",
  cost: 5,
  attackCost: 1,
  attack: 600,
  defense: 600,
  text: "Se o oponente tiver alguma carta danificada em jogo, esta carta ganha Blitz.",

  effects: [
    { trigger: "onSummon", id: "gainBlitzIfEnemyDamaged" }
  ]
},
P020: {
  id: "P020",
  name: "Enviado do Caos",
  emoji: "🌪️",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Comum",
  cost: 0,
  attackCost: 1,
  attack: 100,
  defense: 100,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Esta carta é imune a dano causado por unidades Pusher ou Equalizer.",

  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onSummon", id: "chaosEnvoyImmunity" }
  ]
},
P021: {
  id: "P021",
  name: "Raposa",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 1,
  attackCost: 1,
  attack: 200,
  defense: 200,
  text: "",
  effects: [
    
  ]
},
P022: {
  id: "P022",
  name: "Pequeno Cogohomem",
  emoji: "",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 0,
  attackCost: 1,
  attack: 100,
  defense: 100,
  text: "",
  effects: [
    
  ]
},
P023: {
  id: "P023",
  name: "Peixe-Diabo Gigante",
  emoji: "🐟",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Básico",
  cost: 3,
  attackCost: 2,
  attack: 500,
  defense: 500,
  text: "Ambush - Quando atacada, causa o dano da carta antes do atacante. Se o atacante for destruído, esta carta não sofre dano. Ambush é perdido após o primeiro ataque sofrido ou se esta unidade atacar primeiro.",
  effects: [
    { trigger: "onSummon", id: "grantAmbush" }
  ]
},
P024: {
  id: "P024",
  name: "Máquina de Guerra",
  emoji: "🤖",
  cardClass: "unit",
  type: "Pusher",
  rarity: "Elite",
  cost: 7,
  attackCost: 5,
  attack: 1200,
  defense: 800,
  text: "Ambush - Quando atacada, causa o dano da carta antes do atacante. Se o atacante for destruído, esta carta não sofre dano. Ambush é perdido após o primeiro ataque sofrido ou se esta unidade atacar primeiro. Pin - As unidades atingidas por esta carta ficam Pinned por 1 turno. Quando atacar, causa 500 de dano em tropas adjacentes.",
  effects: [
    { trigger: "onSummon", id: "grantAmbush" },
    { trigger: "onSummon", id: "pinStrike", args: { turns: 1 } },
    { trigger: "onAttack", id: "warMachineSplash", args: { damage: 500 } }
  ]
},

// =============================
// JUGGERNAUT ⬟
// =============================
J001: {
  id: "J001",
  name: "Bahamut",
  emoji: "🐲",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Extraordinário",
  cost: 6,
  attackCost: 4,
  attack: 300,
  defense: 1000,
  text: "Armadura Pesada (3) - Reduz 70% do dano sofrido. Esta unidade não sofre vantagem nem desvantagem de classe.",
  effects: [
    { trigger: "onSummon", id: "heavyArmor", args: { amount: 3 } },
    { trigger: "onSummon", id: "ignoreClassAdvantage" }
  ]
},

J002: {
  id: "J002",
  name: "Otto Kramer",
  emoji: "🛡️",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 5,
  attackCost: 3,
  attack: 0,
  defense: 0,
  text: "Ao entrar em campo, ganha 1000 de DEF para cada 2 pontos de vida seus.",
  effects: [
    { trigger: "onSummon", id: "scaleDefenseFromPlayerLife" }
  ]
},

J003: {
  id: "J003",
  name: "Colosso",
  emoji: "🗿",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 3,
  attackCost: 2,
  attack: 300,
  defense: 1500,
  text: "",
  effects: []
},

J004: {
  id: "J004",
  name: "Campeão do Norte",
  emoji: "⚔️",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Extraordinário",
  cost: 5,
  attackCost: 5,
  attack: 600,
  defense: 2000,
  text: "Armadura Pesada (1) - Reduz 30% do dano sofrido. Ao entrar em campo, a unidade ativa do oponente não pode recuar.",
  effects: [
    { trigger: "onSummon", id: "heavyArmor", args: { amount: 1 } },
    { trigger: "onSummon", id: "lockEnemyActiveNoRetreat" }
  ]
},

J005: {
  id: "J005",
  name: "Minotauro",
  emoji: "🐂",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Especial",
  cost: 8,
  attackCost: 5,
  attack: 1000,
  defense: 1900,
  text: "",
  effects: []
},

J006: {
  id: "J006",
  name: "Odyseei",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 3,
  attackCost: 1,
  attack: 300,
  defense: 1000,
  text: "",
  effects: [
    
  ]
},
J007: {
  id: "J007",
  name: "Goliath",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 5,
  attackCost: 3,
  attack: 300,
  defense: 800,
  text: "",
  effects: []
},
J008: {
  id: "J008",
  name: "Terrorcroc",
  emoji: "🐊",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 6,
  attackCost: 5,
  attack: 800,
  defense: 800,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Sempre que atacar, recupera 200 de DEF.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onAttack", id: "terrorcrocHeal", args: { amount: 200 } }
  ]
},
J009: {
  id: "J009",
  name: "Grande Slime",
  emoji: "🟢",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 1,
  attackCost: 3,
  attack: 100,
  defense: 800,
  text: "Armadura Pesada (1) - Reduz 30% do dano sofrido.",

  effects: [
    { trigger: "onSummon", id: "heavyArmor", args: { amount: 1 } }
  ]
},
J010: {
  id: "J010",
  name: "Caçador do Vazio",
  emoji: "🕳️",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Especial",
  cost: 8,
  attackCost: 4,
  attack: 1000,
  defense: 1200,
  tags: ["void"],
  text: "Armadura Pesada (2) - Reduz 50% do dano sofrido.",
  effects: [
    { trigger: "onSummon", id: "heavyArmor", args: { amount: 2 } }
  ]
},
J011: {
  id: "J011",
  name: "Morning Wood",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Comum",
  cost: 4,
  attackCost: 6,
  attack: 4000,
  defense: 2000,
  tags: [""],
  text: "",
  effects: [
    
  ]
},

J012: {
  id: "J012",
  name: "Aurum",
  emoji: "🌟",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Comum",
  cost: 3,
  attackCost: 3,
  attack: 600,
  defense: 600,
  tags: [""],
  text: "Mobilize - Enquanto estiver em campo, concede -2 de custo de mobilização para cartas na sua mão. No início do seu turno, embaralhe sua mão no deck e compre a mesma quantidade de cartas.",
  effects: [
    { trigger: "onSummon", id: "mobilize", args: { amount: 2 } },
    { trigger: "turnStart", id: "aurumShuffleHand" }
  ]
},
J013: {
  id: "J013",
  name: "Abutre Cósmico",
  emoji: "🦅",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 3,
  attackCost: 0,
  attack: 200,
  defense: 200,
  tags: ["cosmic"],
 text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Ganha +400 de ATK e +400 de DEF para cada unidade destruída por Infecção Sideral.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "turnStart", id: "vultureCheckInfectionKills" }
  ]
},
J014: {
  id: "J014",
  name: "Grande Castor",
  emoji: "🦫",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 4,
  attackCost: 1,
  attack: 300,
  defense: 700,
  tags: ["beast"],
  text: "O primeiro ataque contra esta carta causa 0 de dano.",
  effects: [
    { trigger: "onSummon", id: "firstHitShield" }
  ]
},
J015: {
  id: "J015",
  name: "Herói Sem Nome",
  emoji: "🛡️",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Especial",
  cost: 6,
  attackCost: 1,
  attack: 500,
  defense: 1000,
  tags: ["hero"],
  text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. Esta carta não pode ser alvo de Insígnia do Conquistador.",
  effects: [
    { trigger: "onSummon", id: "smokescreen" },
    { trigger: "onSummon", id: "immuneToConquerorInsignia" }
  ]
},

J016: {
  id: "J016",
  name: "O dragão da Floresta",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Especial",
  cost: 9,
  attackCost: 2,
  attack: 1400,
  defense: 1500,
  tags: [""],
  text: "",
  effects: [
    
  ]
},
J017: {
  id: "J017",
  name: "Ravager",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 8,
  attackCost: 4,
  attack: 300,
  defense: 1800,
  tags: [""],
  text: "",
  effects: [
    
  ]
},
J018: {
  id: "J018",
  name: "Cérbero",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 4,
  attackCost: 4,
  attack: 1000,
  defense: 800,
  tags: [""],
   text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen.",
  effects: [
    { trigger: "onSummon", id: "smokescreen" },
    
  ]
},

J019: {
  id: "J019",
  name: "Necromante",
  emoji: "💀",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Elite",
  cost: 8,
  attackCost: 5,
  attack: 1000,
  defense: 500,
  tags: [],
  text: "Ao entrar em campo, escolha uma carta do seu cemitério e traga-a para o seu banco.",
  effects: [
    { trigger: "onSummon", id: "necromancerRevive" }
  ]
},
J020: {
  id: "J020",
  name: "Guarda Adimensional",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Extraordinário",
  cost: 8,
  attackCost: 8,
  attack: 2000,
  defense: 2000,
  tags: [],
  text: "",
  effects: [
    
  ]
},
J021: {
  id: "J021",
  name: "Tiranossauro",
  emoji: "🦖",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Extraordinário",
  cost: 6,
  attackCost: 4,
  attack: 1200,
  defense: 600,
  tags: [],
  text: "Ao entrar em campo, todas as cartas ativas do oponente voltam para o banco.",
  effects: [
    { trigger: "onSummon", id: "tyrannosaurusMobilize" }
  ]
},
J022: {
  id: "J022",
  name: "Banshee",
  emoji: "",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 3,
  attackCost: 1,
  attack: 100,
  defense: 500,
  tags: [],
  text: "",
  effects: [
    
  ]
},
J023: {
  id: "J023",
  name: "Colosso Guardião",
  emoji: "🗿",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Comum",
  cost: 5,
  attackCost: 6,
  attack: 1000,
  defense: 1500,
  tags: [],
  text: "Armadura Pesada (2) - Reduz 50% do dano sofrido. Quando invocada, esta carta só pode agir depois de 2 turnos.",
  effects: [
    { trigger: "onSummon", id: "heavyArmor", args: { amount: 2 } },
    { trigger: "onSummon", id: "delaySelfAction", args: { turns: 2 } }
  ]
},
J024: {
  id: "J024",
  name: "Caos",
  emoji: "🌌",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Elite",
  cost: 0,
  attackCost: 5,
  attack: 1000,
  defense: 1000,
  tags: [],
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Pin - As unidades atingidas por esta carta ficam Pinned por 1 turno. Esta carta é imune a qualquer dano de unidade.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onSummon", id: "pinStrike", args: { turns: 1 } },
    { trigger: "onSummon", id: "unitDamageImmunity" }
  ]
},
J025: {
  id: "J025",
  name: "Fortaleza Móvel",
  emoji: "🏰",
  cardClass: "unit",
  type: "Juggernaut",
  rarity: "Básico",
  cost: 5,
  attackCost: 3,
  attack: 100,
  defense: 1200,
  tags: [],
   text: "Unidades adjacentes a esta carta não podem ser alvo de ataques de unidades.",
  effects: [
    { trigger: "onSummon", id: "mobileFortressAura" }
  ]
},


  // =============================
  // EQUALIZER ▲
  // =============================
  E001: {
    id: "E001",
    name: "Morgan",
    emoji: "⚖️",
    cardClass: "unit",
    type: "Equalizer",
    rarity: "Extraordinário",
    cost: 3,
    attackCost: 4,
    attack: 1300,
    defense: 200,
    text: "Berserk - Tem vantagem de classe contra todas as classes e sofre desvantagem de classe contra todas as classes.",
    effects: [
      { trigger: "onSummon", id: "berserk" }
    ]
  },

  E002: {
    id: "E002",
    name: "Helene",
    emoji: "👸",
    cardClass: "unit",
    type: "Equalizer",
    rarity: "Especial",
    cost: 4,
    attackCost: 8,
    attack: 800,
    defense: 1700,
    text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo.",

    effects: [
      { trigger: "onSummon", id: "blitz" }
    ]
  },

  E003: {
  id: "E003",
  name: "Terrorizador",
  emoji: "👹",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 8,
  attackCost: 1,
  attack: 1000,
  defense: 1000,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Sempre que derrotar uma unidade, ganha +1000 de ATK.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onKill", id: "gainAttackOnKill", args: { amount: 1000 } }
  ]
},

 E004: {
  id: "E004",
  name: "Gamedron",
  emoji: "🔷",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Elite",
  cost: 2,
  attackCost: 3,
  attack: 0,
  defense: 0,
  text: "Distante - Pode atacar do banco. Não pode atacar diretamente o banco inimigo a partir do seu banco, nem atacar diretamente o PV inimigo a partir dele. Esta carta possui vantagem contra Pushers. Ao entrar em campo, copia o ATK e a DEF da última carta jogada em campo.",
  effects: [
    { trigger: "onSummon", id: "copyLastPlayedStats" },
    { trigger: "onSummon", id: "ranged" },
    { trigger: "onSummon", id: "bonusVsPusher" }
  ]
},

E005: {
  id: "E005",
  name: "Gyokuyo",
  emoji: "🔷",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Elite",
  cost: 9,
  attackCost: 0,
  attack: 0,
  defense: 100,
  text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. Enquanto esta carta estiver em campo, você ganha 2 PE por turno.",
  effects: [
    { trigger: "onSummon", id: "smokescreen" },
    { trigger: "turnStart", id: "gainEnergyAura", args: { amount: 2 } }
  ]
},

E006: {
  id: "E006",
  name: "Porcopine",
  emoji: "🦔",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 2,
  attackCost: 1,
  attack: 100,
  defense: 800,
  text: "Quando esta carta for atacada, a carta atacante fica Pinned por 1 turno.",
  effects: [
    { trigger: "onAttacked", id: "paralyzeAttacker" }
  ]
},

E007: {
  id: "E007",
  name: "Pioneer",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 5,
  attackCost: 4,
  attack: 700,
  defense: 800,
  text: "Mobilize - Enquanto estiver em campo, concede -2 de custo de mobilização para cartas na sua mão.",

  effects: [ { trigger: "onSummon", id: "mobilize" } 
  ]  
},
E008: {
  id: "E008",
  name: "Raptor",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 2,
  attackCost: 0,
  attack: 200,
  defense: 400,
  text: "",
  effects: [  ] 
},

E009: {
  id: "E009",
  name: "Chesire",
  emoji: "🐱",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Especial",
  cost: 4,
  attackCost: 3,
  attack: 500,
  defense: 1200,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. Esta carta não pode ser alvo de cartas de efeito.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onSummon", id: "smokescreen" },
    { trigger: "onSummon", id: "effectImmunity" }
  ]
},

E010: {
  id: "E010",
  name: "Bastião",
  emoji: "🛡️",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Extraordinário",
  cost: 3,
  attackCost: 6,
  attack: 700,
  defense: 700,
  text: "No início de cada turno, ganha +200 de ATK e +200 de DEF.",
  effects: [
    { trigger: "turnStart", id: "bastionGrowth", args: { amount: 200 } }
  ]
},

E011: {
  id: "E011",
  name: "Peixe Gigante",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 4,
  attackCost: 2,
  attack: 300,
  defense: 400,
  text: "",
  effects: [
    
  ]
},
E012: {
  id: "E012",
  name: "Esqueleto",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 2,
  attackCost: 1,
  attack: 200,
  defense: 100,
  text: "",
  effects: [  ] 
},
E013: {
  id: "E013",
  name: "Devorador",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 6,
  attackCost: 5,
  attack: 1000,
  defense: 800,
  text: "",
  effects: [  ] 
},

E014: {
  id: "E014",
  name: "Astrum",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 3,
  attackCost: 3,
  attack: 300,
  defense: 300,
  text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. Enquanto esta carta estiver em campo, cartas de efeito, contramedidas e efeitos de unidades não funcionam.",
  effects: [
    { trigger: "onSummon", id: "astrumFieldLock" },
    { trigger: "onDefeat", id: "astrumFieldUnlock" },
    { trigger: "onSummon", id: "smokescreen" }
  ]
},
E015: {
  id: "E015",
  name: "XM-Ares",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Especial",
  cost: 6,
  attackCost: 5,
  attack: 700,
  defense: 600,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. Se for invocada por Buraco de Minhoca, custa 0 para atacar neste turno.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "onSummon", id: "xmAresWormholeBuff" }
  ]
},
E016: {
  id: "E016",
  name: "O Rastejante",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 2,
  attackCost: 3,
  attack: 400,
  defense: 400,
  text: ".",
  effects: [
   
  ]
},
E017: {
  id: "E017",
  name: "O Príncipe de Eudória",
  emoji: "👑",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 3,
  attackCost: 1,
  attack: 2000,
  defense: 400,
  text: "Esta carta perde 500 de ATK para cada unidade inimiga em campo.",
  effects: [
    { trigger: "onSummon", id: "eudoriaPrinceInit" }
  ]
},
E018: {
  id: "E018",
  name: "Behemoth MK.1",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 5,
  attackCost: 7,
  attack: 600,
  defense: 1800,
  text: "",
  effects: [
     
  ]
},
E019: {
  id: "E019",
  name: "O Tirano",
  emoji: "👑",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 5,
  attackCost: 5,
  attack: 800,
  defense: 800,
  text: "Pin - As unidades atingidas por esta carta ficam Pinned por 1 turno.",

  effects: [
    { trigger: "onSummon", id: "pinStrike", args: { turns: 1 } }
  ]
},
E020: {
  id: "E020",
  name: "Estrategista",
  emoji: "🧠",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 5,
  attackCost: 3,
  attack: 500,
  defense: 600,
  text: "Smokescreen - Não pode ser alvo de ataques de unidades. Cartas de efeito ainda funcionam. Após realizar alguma ação, perde Smokescreen. No fim de cada turno, veja a carta do topo do seu baralho.",
  effects: [
    { trigger: "onSummon", id: "smokescreen" },
    { trigger: "turnEnd", id: "strategistPeekTopDeck" }
  ]
},
E021: {
  id: "E021",
  name: "Mímico",
  emoji: "🎭",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Especial",
  cost: 3,
  attackCost: 4,
  attack: 300,
  defense: 400,
  text: "No final de cada turno, esta carta ganha Smokescreen.",
  effects: [
    { trigger: "turnEnd", id: "mimicGainSmokescreen" }
  ]
},
E022: {
  id: "E022",
  name: "Dr. Paradoxo",
  emoji: "🧪",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 1,
  attackCost: 3,
  attack: 400,
  defense: 600,
  text: "Blitz - Pode realizar 2 ações por turno e pode se mover ou atacar no mesmo turno em que entra em campo. No final de cada turno, esta carta retorna ao estado original.",
  effects: [
    { trigger: "onSummon", id: "blitz" },
    { trigger: "turnEnd", id: "resetSelfToBase" }
  ]
},
E023: {
  id: "E023",
  name: "Lobo Terrível",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 2,
  attackCost: 3,
  attack: 300,
  defense: 400,
  text: "",
  effects: [
    
  ]
},

E024: {
  id: "E024",
  name: "Plesiosaurus",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 4,
  attackCost: 2,
  attack: 800,
  defense: 700,
  text: "",
  effects: [
    
  ]
},
E025: {
  id: "E025",
  name: "Dragão Milenar",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Extraordinário",
  cost: 10,
  attackCost: 3,
  attack: 900,
  defense: 3000,
  text: "",
  effects: [
    
  ]
},
E026: {
  id: "E026",
  name: "Golemita",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 3,
  attackCost: 1,
  attack: 200,
  defense: 500,
  text: "",
  effects: [
    
  ]
},
E027: {
  id: "E027",
  name: "Artilharia Móvel",
  emoji: " cannon",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 4,
  attackCost: 2,
  attack: 300,
  defense: 600,
  text: "Distante - Pode atacar do banco. Não pode atacar diretamente o banco inimigo a partir do seu banco, nem atacar diretamente o PV inimigo a partir dele.",
  effects: [
    { trigger: "onSummon", id: "ranged" }
  ]
},
E028: {
  id: "E028",
  name: "Soldado Imperial",
  emoji: "🛡️",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Comum",
  cost: 5,
  attackCost: 3,
  attack: 600,
  defense: 500,
  text: "Ambush - Quando atacada, causa o dano da carta antes do atacante. Se o atacante for destruído, esta carta não sofre dano. Ambush é perdido após o primeiro ataque sofrido ou se esta unidade atacar primeiro.",
  effects: [
    { trigger: "onSummon", id: "grantAmbush" }
  ]
},
E029: {
  id: "E029",
  name: "Assassino Silencioso",
  emoji: "",
  cardClass: "unit",
  type: "Equalizer",
  rarity: "Básico",
  cost: 3,
  attackCost: 4,
  attack: 400,
  defense: 300,
  text: "Ambush - Quando atacada, causa o dano da carta antes do atacante. Se o atacante for destruído, esta carta não sofre dano. Ambush é perdido após o primeiro ataque sofrido ou se esta unidade atacar primeiro.",
  effects: [
    { trigger: "onSummon", id: "grantAmbush" }
  ]
},

  // =============================
  // EFFECT ▣!
  // =============================
  X001: {
    id: "X001",
    name: "Black Luna",
    emoji: "🌑",
    cardClass: "effect",
    type: "Effect",
    rarity: "Elite",
    cost: 9,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Zera a defesa de uma unidade inimiga.",
    effects: [
      { trigger: "onPlay", id: "blackLuna" }
    ]
  },

  X002: {
    id: "X002",
    name: "Aclamar",
    emoji: "📣",
    cardClass: "effect",
    type: "Effect",
    rarity: "Comum",
    cost: 2,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Aumenta o ATK da sua unidade ativa em 300 por 3 turnos.",
    effects: [
      { trigger: "onPlay", id: "buffAttackActiveAlly", args: { amount: 300, duration: 3 } }
    ]
  },

  X003: {
    id: "X003",
    name: "Vantagem",
    emoji: "⚡",
    cardClass: "effect",
    type: "Effect",
    rarity: "Comum",
    cost: 5,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Causa 200 de dano à unidade ativa inimiga.",
    effects: [
      { trigger: "onPlay", id: "damageActiveEnemy", args: { amount: 200 } }
    ]
  },

  X004: {
    id: "X004",
    name: "Golpear",
    emoji: "💥",
    cardClass: "effect",
    type: "Effect",
    rarity: "Comum",
    cost: 6,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Causa 400 de dano a uma unidade inimiga.",
    effects: [
      { trigger: "onPlay", id: "dealDamageToEnemy", args: { amount: 400 } }
    ]
  },

  X005: {
  id: "X005",
  name: "Atrasar",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: a próxima unidade inimiga com Blitz volta para a mão.",
  effects: [
    { trigger: "onPlay", id: "delayCounter" }
  ]
},

  X006: {
    id: "X006",
    name: "Ataque Massivo",
    emoji: "☄️",
    cardClass: "effect",
    type: "Effect",
    rarity: "Básico",
    cost: 4,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Neste turno, todas as suas unidades ganham Blitz e +100 de ATK.",
    effects: [
      { trigger: "onPlay", id: "massAttackBuff", args: { amount: 100 } }
    ]
  },

  X007: {
    id: "X007",
    name: "SuperCarga",
    emoji: "⚡",
    cardClass: "effect",
    type: "Effect",
    rarity: "Especial",
    cost: 9,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "No seu próximo turno você terá +4 PE.",
    effects: [
      { trigger: "onPlay", id: "superCharge", args: { amount: 4 } }
    ]
  },

  X008: {
    id: "X008",
    name: "Singularidade",
    emoji: "🌀",
    cardClass: "effect",
    type: "Effect",
    rarity: "Especial",
    cost: 10,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Retorna até 10 cartas dos cemitérios para os baralhos.",
    effects: [
      { trigger: "onPlay", id: "singularityShuffleGraves", args: { amount: 10 } }
    ]
  },

 X009: {
  id: "X009",
  name: "Interceptar",
  emoji: "🛡️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: cancela o próximo efeito inimigo.",
  effects: [
    { trigger: "onPlay", id: "interceptCounter" }
  ]
},

  X010: {
    id: "X010",
    name: "Revitalizar",
    emoji: "✨",
    cardClass: "effect",
    type: "Effect",
    rarity: "Comum",
    cost: 3,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Recupere 200 de DEF da sua unidade ativa.",
    effects: [
      { trigger: "onPlay", id: "healActiveAlly", args: { amount: 200 } }
    ]
  },

  X011: {
    id: "X011",
    name: "Ressurgir",
    emoji: "🪦",
    cardClass: "effect",
    type: "Effect",
    rarity: "Básico",
    cost: 8,
    attackCost: 0,
    attack: 0,
    defense: 0,
    text: "Traz de volta ao campo uma carta do seu cemitério.",
    effects: [
      { trigger: "onPlay", id: "reviveFromGrave" }
    ]
  },

  X012: {
  id: "X012",
  name: "Pânico",
  emoji: "😱",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: quando o oponente entrar no campo ativo, retorne para o banco.",
  effects: [
    { trigger: "onPlay", id: "panicCounter" }
  ]
},


  X013: {
  id: "X013",
  name: "Devorador de Deuses",
  emoji: "☠️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 9,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: todos os jogadores descartam todas as cartas em campo; quem usou perde 1 PV.",
  effects: [
    { trigger: "onPlay", id: "devourAllUnits" }
  ]
},

  X014: {
  id: "X014",
  name: "A Justiça",
  emoji: "⚖️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 7,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Iguala os atributos de uma unidade em campo ao maior valor entre ATK e DEF dela.",
  effects: [
    { trigger: "onPlay", id: "equalizeUnitStats" }
  ]
},

X015: {
  id: "X015",
  name: "Fortalecer",
  emoji: "🛡️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 2,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Escolha uma unidade sua. Ela recebe +400 de Defesa.",
  effects: [
    { trigger: "onPlay", id: "buffDefense400" }
  ]
},

X016: {
  id: "X016",
  name: "Espelho",
  emoji: "🪞",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: a próxima carta de efeito inimiga é refletida.",
  effects: [
    { trigger: "onPlay", id: "mirrorCounter" }
  ]
},


X017: {
  id: "X017",
  name: "Recursos Emergentes",
  emoji: "⚡",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se no último turno o oponente guardou PE, você recebe esse PE.",
  effects: [
    { trigger: "onPlay", id: "stealSavedEnergy" }
  ]
},


X018: {
  id: "X018",
  name: "Cópia Barata",
  emoji: "🧬",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 0,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Copia o efeito da última carta jogada pelo oponente.",
  effects: [
    { trigger: "onPlay", id: "copyLastEnemyEffect" }
  ]
},

X019: {
  id: "X019",
  name: "Troca Forçada",
  emoji: "🔄",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Troque uma unidade no campo ativo do oponente com uma unidade do banco dele.",
  effects: [
    { trigger: "onPlay", id: "forcedSwapEnemyUnits" }
  ]
},
X020: {
  id: "X020",
  name: "O Julgamento",
  emoji: "⚖️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 7,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Escolha uma unidade sua e uma unidade inimiga de mesma raridade. Jogue uma moeda: Cara: sua unidade é destruída. Coroa: a unidade inimiga é destruída.",
  effects: [
    { trigger: "onPlay", id: "judgmentCoinFlipSameRarity" }
  ]
},
X021: {
  id: "X021",
  name: "Incentivo de Guerra",
  emoji: "⚔️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 1,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Durante este turno, suas unidades custam -2 PE para atacar.",
  effects: [
    { trigger: "onPlay", id: "warIncentive" }
  ]
},

X022: {
  id: "X022",
  name: "Portal Oneiros",
  emoji: "🌀",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Olhe a carta do topo do seu baralho. Se for uma unidade, coloque-a na mão. Caso contrário, descarte-a.",
  effects: [
    { trigger: "onPlay", id: "oneirosPortal" }
  ]
},

X023: {
  id: "X023",
  name: "Necronomicon",
  emoji: "📕",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: a próxima unidade invocada pelo oponente entra no seu campo.",
  effects: [
    { trigger: "onPlay", id: "necronomiconCounter" }
  ]
},


X024: {
  id: "X024",
  name: "Vazio Imensurável",
  emoji: "🕳️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 8,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Todas as unidades inimigas em campo não podem atacar ou se mover por 2 turnos.",
  effects: [
    { trigger: "onPlay", id: "infiniteVoid", args: { turns: 2 } }
  ]
},

X025: {
  id: "X025",
  name: "Santuário Malevolente",
  emoji: "🩸",
  cardClass: "effect",
  type: "Effect",
  rarity: "Elite",
  cost: 10,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Durante 6 turnos, todas as unidades em campo recebem 300 de dano no início de cada turno.",
  effects: [
    { trigger: "onPlay", id: "malevolentShrine", args: { turns: 6, damage: 300 } }
  ]
},

X026: {
  id: "X026",
  name: "Ceifar",
  emoji: "🪓",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 8,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Cause 1000 de dano em uma unidade inimiga que custe no máximo 7 PE.",
  effects: [
    { trigger: "onPlay", id: "reapStrike", args: { damage: 1000, maxCost: 7 } }
  ]
},
X027: {
  id: "X027",
  name: "Corta Logística",
  emoji: "✂️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 2,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se a próxima carta do oponente custar mais que 5 PE, descarte-a.",
  effects: [
    { trigger: "onPlay", id: "logisticsCutCounter", args: { maxCost: 5 } }
  ]
},

X028: {
  id: "X028",
  name: "Inverno Duradouro",
  emoji: "❄️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Durante 2 turnos, nenhuma unidade nas linhas ativas pode atacar.",
  effects: [
    { trigger: "onPlay", id: "endlessWinter", args: { turns: 2 } }
  ]
},

X029: {
  id: "X029",
  name: "Dividir e Conquistar",
  emoji: "⚔️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: ao sofrer um ataque, cause 300 de dano à carta atacante e, se você tiver uma unidade no banco, coloque-a no campo ativo.",
  effects: [
    { trigger: "onPlay", id: "divideAndConquerCounter" }
  ]
},


X030: {
  id: "X030",
  name: "Enfraquecer",
  emoji: "💀",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: As unidades ativas do oponente perdem 300 de ataque.",
  effects: [
    { trigger: "onPlay", id: "reduceEnemyActiveAttack", args: { amount: 300 } }
  ]
},

X031: {
  id: "X031",
  name: "Terra Arrasada",
  emoji: "🔥",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: todas as unidades inimigas em campo têm seus atributos reduzidos pela metade.",
  effects: [
    { trigger: "onPlay", id: "halveEnemyStats" }
  ]
},
X032: {
  id: "X032",
  name: "Terrorcroc",
  emoji: "",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: todas as unidades inimigas em campo têm seus atributos reduzidos pela metade.",
  effects: [
    { trigger: "onPlay", id: "halveEnemyStats" }
  ]
},
X033: {
  id: "X033",
  name: "Selo do Vazio",
  emoji: "🜏",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Procure 2 servos do vazio no seu deck e coloque-os no seu banco.",
  effects: [
    { trigger: "onPlay", id: "summonVoidServants", args: { amount: 2 } }
  ]
},
X034: {
  id: "X034",
  name: "Banimento da Luz",
  emoji: "☀️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Até o fim deste turno, suas unidades aplicam Pin por 1 turno ao atacar.",
  effects: [
    { trigger: "onPlay", id: "banimentoDaLuz" }
  ]
},
X035: {
  id: "X035",
  name: "Reaver",
  emoji: "☠️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 7,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Traga 1 unidade do seu cemitério de volta para o seu banco.",
  effects: [
    { trigger: "onPlay", id: "reaverRevive" }
  ]
},
X036: {
  id: "X036",
  name: "Incinerar",
  emoji: "🔥",
  cardClass: "effect",
  type: "Effect",
  rarity: "Elite",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se o oponente atacar no próximo turno dele, cause 900 de dano a uma unidade inimiga aleatória.",
  effects: [
    { trigger: "onPlay", id: "incinerarTrap" }
  ]
},


X037: {
  id: "X037",
  name: "Cluster Antimatéria",
  emoji: "💠",
  cardClass: "effect",
  type: "Effect",
  rarity: "Elite",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: cancele o efeito de uma carta. Se ela for Horizonte de Eventos ou Buraco de Minhoca, ganhe PE igual ao custo.",
  effects: [
    { trigger: "onPlay", id: "clusterAntimateria" }
  ]
},

X038: {
  id: "X038",
  name: "Infecção Sideral",
  emoji: "🦠",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 7,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Infecte uma unidade inimiga. Ela sofre 500 de dano no início de cada turno. Após 1 turno, a infecção se espalha para unidades adjacentes.",
  effects: [
    { trigger: "onPlay", id: "sideralInfection", args: { damage: 500 } }
  ]
},
X039: {
  id: "X039",
  name: "Horizonte de Eventos",
  emoji: "🕳️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 9,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Campo 1 e Campo 2 trocam de posição.",
  effects: [
    { trigger: "onPlay", id: "swapFields" }
  ]
},

X040: {
  id: "X040",
  name: "Buraco de Minhoca",
  emoji: "🌀",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Coloque uma unidade da sua mão no banco sem pagar o custo de mobilização.",
  effects: [
    { trigger: "onPlay", id: "wormholeSummon" }
  ]
},
X041: {
  id: "X041",
  name: "Insígnia do Conquistador",
  emoji: "🏅",
  cardClass: "effect",
  type: "Effect",
  rarity: "Elite",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma unidade. Ela recebe +800 ATK até ser destruída.",
  effects: [
    { trigger: "onPlay", id: "conquerorInsignia" }
  ]
},
X042: {
  id: "X042",
  name: "O Aperto de Lóki",
  emoji: "🐍",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 8,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: quando uma unidade sua for destruída em combate, a unidade atacante também é destruída.",
  effects: [
    { trigger: "onPlay", id: "lokiGripCounter" }
  ]
},

X043: {
  id: "X043",
  name: "Terminus",
  emoji: "☠️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se a próxima carta jogada pelo oponente tiver alguma propriedade, ela é descartada.",
  effects: [
    { trigger: "onPlay", id: "terminusCounter" }
  ]
},

X044: {
  id: "X044",
  name: "Estimulantes",
  emoji: "💉",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 2,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma unidade. Ela recebe +200 ATK e +200 DEF por 2 turnos.",
  effects: [
    { trigger: "onPlay", id: "stimulantsBuff", args: { attack: 200, defense: 200, turns: 2 } }
  ]
},
X045: {
  id: "X045",
  name: "Terra-Blade",
  emoji: "🗡️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Só pode ser equipada no Herói Sem Nome. Ele recebe +2000 ATK.",
  effects: [
    { trigger: "onPlay", id: "terraBladeEquip" }
  ]
},
X046: {
  id: "X046",
  name: "Vento Revigorante",
  emoji: "🌬️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Cure 1000 DEF de uma unidade alvo.",
  effects: [
    { trigger: "onPlay", id: "revigoratingWind", args: { amount: 1000 } }
  ]
},
X047: {
  id: "X047",
  name: "Envenenar",
  emoji: "☠️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 5,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Cause 300 de dano em unidades inimigas em campo, até a quantidade de cartas na mão do oponente.",
  effects: [
    { trigger: "onPlay", id: "poisonByEnemyHand", args: { damage: 300 } }
  ]
},
X048: {
  id: "X048",
  name: "Golpe Baixo",
  emoji: "🩸",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Sacrifique uma unidade sua em campo. Ganhe PE igual ao custo dela.",
  effects: [
    { trigger: "onPlay", id: "dirtyStrikeSacrifice" }
  ]
},
X049: {
  id: "X049",
  name: "Desvio Ilegal",
  emoji: "🕵️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 8,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: a próxima carta que o oponente comprar vai para sua mão.",
  effects: [
    { trigger: "onPlay", id: "illegalDiversionCounter" }
  ]
},

X050: {
  id: "X050",
  name: "Blefar",
  emoji: "🎭",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: quando você jogar uma carta de efeito e o oponente ativar uma contramedida, descarte a contramedida e mantenha seu efeito.",
  effects: [
    { trigger: "onPlay", id: "blefarCounter" }
  ]
},

X051: {
  id: "X051",
  name: "Contrabando",
  emoji: "📦",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Compre 2 cartas.",
  effects: [
    { trigger: "onPlay", id: "contrabandoDraw" }
  ]
},
X052: {
  id: "X052",
  name: "Cortina de Fumaça",
  emoji: "🌫️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Todas as suas cartas em campo ganham Smokescreen.",
  effects: [
    { trigger: "onPlay", id: "smokeScreenAllies" }
  ]
},
X053: {
  id: "X053",
  name: "Trânsito Temporal",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Elite",
  cost: 2,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma carta sua em campo. Ela retorna ao estado original e ganha Smokescreen.",
  effects: [
    { trigger: "onPlay", id: "temporalReset" }
  ]
},
X054: {
  id: "X054",
  name: "Rebobinar",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Retorne uma carta sua em campo para sua mão.",
  effects: [
    { trigger: "onPlay", id: "rewindCard" }
  ]
},
X055: {
  id: "X055",
  name: "Pulso Temporal",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Traga uma unidade que morreu no seu último turno de volta para o banco.",
  effects: [
    { trigger: "onPlay", id: "temporalPulse" }
  ]
},
X056: {
  id: "X056",
  name: "Salto Temporal",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 8,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Não ganhe PE neste turno. Ganhe o dobro no próximo turno.",
  effects: [
    { trigger: "onPlay", id: "timeJump" }
  ]
},
X057: {
  id: "X057",
  name: "Congelar",
  emoji: "⏳",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 6,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma unidade sua. Ela não pode atacar nem receber dano ou buffs por 2 turnos.",
  effects: [
    { trigger: "onPlay", id: "freezeUnit", args: { turns: 2 } }
  ]
},
X058: {
  id: "X058",
  name: "Comboio do Norte",
  emoji: "🚂",
  cardClass: "effect",
  type: "Effect",
  rarity: "Básico",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Compre 3 cartas, escolha 1 e coloque as outras no cemitério.",
  effects: [
    { trigger: "onPlay", id: "northernConvoy" }
  ]
},
X059: {
  id: "X059",
  name: "Mata-cráquens",
  emoji: "🗡️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 2,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma carta. Ela ignora 1 nível de Armadura Pesada.",
  effects: [
    { trigger: "onPlay", id: "armorPierceBuff", args: { amount: 1 } }
  ]
},
X060: {
  id: "X060",
  name: "Gungnir",
  emoji: "🗡️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 10,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha um alvo. Esse alvo ignora completamente Armadura Pesada.",
  effects: [
    { trigger: "onPlay", id: "gungnirBuff" }
  ]
},
X061: {
  id: "X061",
  name: "Apodrecer",
  emoji: "☠️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: escolha uma carta danificada. Ela fica com 0 de defesa até o fim do turno.",
  effects: [
    { trigger: "onPlay", id: "rotTarget" }
  ]
},

X062: {
  id: "X062",
  name: "Chuva de Meteoros",
  emoji: "☄️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Cause 100 de dano a todas as cartas inimigas em campo.",
  effects: [
    { trigger: "onPlay", id: "meteorRain", args: { damage: 100 } }
  ]
},
X063: {
  id: "X063",
  name: "Rede Armada",
  emoji: "🕸️",
  cardClass: "effect",
  type: "Effect",
  rarity: "Comum",
  cost: 4,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se o oponente mover uma carta do banco para o campo, aplique Pin nela.",
  effects: [
    { trigger: "onPlay", id: "armedNetCounter" }
  ]
},

X064: {
  id: "X064",
  name: "Contra-ataque Rápido",
  emoji: "⚡",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: se no último turno o oponente atacou você, todas suas unidades ganham Blitz.",
  effects: [
    { trigger: "onPlay", id: "quickCounterAttack" }
  ]
},

X065: {
  id: "X065",
  name: "Resposta Rápida",
  emoji: "⚡",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 3,
  attackCost: 0,
  attack: 0,
  defense: 0,
  isCounter: true,
  text: "Contramedida: durante o próximo turno do oponente, a primeira carta inimiga que atacar fica pinada permanentemente.",
  effects: [
    { trigger: "onPlay", id: "quickResponseTrap" }
  ]
},

X066: {
  id: "X066",
  name: "SuperNova",
  emoji: "💥",
  cardClass: "effect",
  type: "Effect",
  rarity: "Especial",
  cost: 10,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Cause 100 de dano a todas as cartas em campo.",
  effects: [
    { trigger: "onPlay", id: "superNova", args: { damage: 100 } }
  ]
},
X067: {
  id: "X067",
  name: "dandelion",
  emoji: "",
  cardClass: "effect",
  type: "Effect",
  rarity: "Extraordinário",
  cost: 1,
  attackCost: 0,
  attack: 0,
  defense: 0,
  text: "Efeito: Escolha uma carta aliada essa carta agora está livre de quaisque efeitos causados por EF ou CM.",
  effects: [
    { trigger: "onPlay", id: "dandelionEffect" }
  ]
},

};

module.exports = CARD_DB;