// effects.js

function applyFlag(card, key, value = true) {
  if (!card) return;
  card[key] = value;
}

function ensureState(state) {
  if (!state) state = {};

  if (!state.hands) state.hands = {};
  if (!state.decks) state.decks = {};
  if (!state.graveyards) state.graveyards = {};
  if (!state.counters) state.counters = {};
  if (!state.turnEffects) state.turnEffects = {};
  if (!state.globalEffects) state.globalEffects = [];
  if (!state.flags) state.flags = {};
  if (!state.board) {
    state.board = {
      bancoPlayer: [],
      campo1: [],
      campo2: [],
      bancoEnemy: []
    };
  }

  return state;
}

const EFFECTS = {
  // =========================
  // HELPERS
  // =========================
  _getState(ctx) {
    return ensureState(ctx.state || ctx.game || {});
  },

  _getOwner(ctx) {
    return ctx.owner || ctx.ownerId || ctx.sourceUnit?.owner || null;
  },

  _getEnemy(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const enemy = (state.players || []).find((p) => p.socketId !== owner);
    return enemy ? enemy.socketId : null;
  },

  _ensureBuckets(state, socketId) {
    if (!socketId) return;
    if (!state.hands[socketId]) state.hands[socketId] = [];
    if (!state.decks[socketId]) state.decks[socketId] = [];
    if (!state.graveyards[socketId]) state.graveyards[socketId] = [];
    if (!state.counters[socketId]) state.counters[socketId] = {};
    if (!state.turnEffects[socketId]) state.turnEffects[socketId] = {};
  },

  _getTargetUnit(ctx) {
    return ctx.targetUnit || ctx.target || null;
  },

  _getAllyTarget(ctx) {
    return ctx.allyTarget || null;
  },

  _getEnemyTarget(ctx) {
    return ctx.enemyTarget || null;
  },

  _allUnits(state) {
    const zones = ["bancoPlayer", "campo1", "campo2", "bancoEnemy"];
    const result = [];

    for (const zone of zones) {
      const list = state.board?.[zone] || [];
      for (let i = 0; i < list.length; i++) {
        const unit = list[i];
        if (!unit) continue;
        unit.zone = zone;
        unit.index = i;
        result.push(unit);
      }
    }

    return result;
  },

  _unitsOf(state, ownerSocketId) {
    return this._allUnits(state).filter((u) => u.owner === ownerSocketId);
  },

  _activeUnit(state, ownerSocketId) {
    const units = this._unitsOf(state, ownerSocketId);

    return (
      units.find((u) => u.zone === "campo1") ||
      units.find((u) => u.zone === "campo2") ||
      null
    );
  },

  _enemyActiveUnit(state, ownerSocketId) {
    const enemySocketId =
      (state.players || []).find((p) => p.socketId !== ownerSocketId)?.socketId || null;

    if (!enemySocketId) return null;
    return this._activeUnit(state, enemySocketId);
  },

  _bankZone(state, ownerSocketId) {
    if (!state.players || state.players.length < 2) return "bancoPlayer";
    return state.players[0].socketId === ownerSocketId ? "bancoPlayer" : "bancoEnemy";
  },

  _fieldZones(state, ownerSocketId) {
    if (!state.players || state.players.length < 2) return ["campo1", "campo2"];
    return state.players[0].socketId === ownerSocketId
      ? ["campo1", "campo2"]
      : ["campo2", "campo1"];
  },

  _setAttack(unit, value) {
    if (!unit?.card) return;
    unit.card.attack = Math.max(0, value);
  },

  _setDefense(unit, value) {
    if (!unit?.card) return;
    unit.card.defense = Math.max(0, value);
  },

  _getAttack(unit) {
    return unit?.card?.attack ?? 0;
  },

  _getDefense(unit) {
    return unit?.card?.defense ?? 0;
  },

  _baseAttack(unit) {
    return unit?.card?.baseAttack ?? unit?.card?.originalAttack ?? unit?.card?.attack ?? 0;
  },

  _baseDefense(unit) {
    return unit?.card?.baseDefense ?? unit?.card?.originalDefense ?? unit?.card?.defense ?? 0;
  },

  _heal(unit, amount) {
    if (!unit) return;
    this._setDefense(unit, this._getDefense(unit) + amount);
  },

  _getPlayerState(state, socketId) {
    return (state.players || []).find((p) => p.socketId === socketId) || null;
  },

  _gainEnergy(state, socketId, amount) {
    const player = this._getPlayerState(state, socketId);
    if (!player) return;
    player.pe = Math.min(player.maxPE || 10, (player.pe || 0) + amount);
  },

  _loseEnergy(state, socketId, amount) {
    const player = this._getPlayerState(state, socketId);
    if (!player) return;
    player.pe = Math.max(0, (player.pe || 0) - amount);
  },

  _loseLife(state, socketId, amount) {
    const player = this._getPlayerState(state, socketId);
    if (!player) return;
    player.life = Math.max(0, (player.life || 0) - amount);
  },

  _damageUnit(ctx, unit, amount) {
    if (!unit || amount <= 0) return;

    const nextDef = this._getDefense(unit) - amount;
    this._setDefense(unit, nextDef);

    if (this._getDefense(unit) <= 0) {
      this._defeatUnit(ctx, unit);
    }
  },

  _defeatUnit(ctx, unit) {
    if (!unit) return;

    const state = this._getState(ctx);
    const owner = unit.owner;
    this._ensureBuckets(state, owner);

    if (unit.card) {
      state.graveyards[owner].push(JSON.parse(JSON.stringify(unit.card)));
    }

    const zone = unit.zone;
    const arr = state.board?.[zone] || [];
    const idx = arr.indexOf(unit);

    if (idx >= 0) arr.splice(idx, 1);
  },

  _moveToHand(ctx, unit) {
    if (!unit) return;

    const state = this._getState(ctx);
    const owner = unit.owner;
    this._ensureBuckets(state, owner);

    if (unit.card) {
      state.hands[owner].push(JSON.parse(JSON.stringify(unit.card)));
    }

    const arr = state.board?.[unit.zone] || [];
    const idx = arr.indexOf(unit);
    if (idx >= 0) arr.splice(idx, 1);
  },

  _moveToBank(ctx, unit) {
    if (!unit) return;

    const state = this._getState(ctx);
    const owner = unit.owner;
    const bankZone = this._bankZone(state, owner);

    const fromArr = state.board?.[unit.zone] || [];
    const idx = fromArr.indexOf(unit);
    if (idx >= 0) fromArr.splice(idx, 1);

    if (!state.board[bankZone]) state.board[bankZone] = [];
    state.board[bankZone].push(unit);
    unit.zone = bankZone;
  },

  _summonToBank(ctx, card, ownerSocketId) {
    const state = this._getState(ctx);
    const bankZone = this._bankZone(state, ownerSocketId);

    if (!state.board[bankZone]) state.board[bankZone] = [];

    state.board[bankZone].push({
      owner: ownerSocketId,
      card: JSON.parse(
        JSON.stringify({
          ...card,
          attack: card.attack ?? 0,
          defense: card.defense ?? 0
        })
      )
    });
  },

  _shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  // =========================
  // STATUS BASE
  // =========================
  blitz(ctx) {
    applyFlag(ctx.sourceUnit?.card, "blitz", true);
    applyFlag(ctx.sourceUnit?.card, "canActOnSummon", true);
    applyFlag(ctx.sourceUnit?.card, "maxActionsPerTurn", 2);
  },

  berserk(ctx) {
    applyFlag(ctx.sourceUnit?.card, "berserk", true);
  },

  ranged(ctx) {
    applyFlag(ctx.sourceUnit?.card, "ranged", true);
  },

  smokescreen(ctx) {
    applyFlag(ctx.sourceUnit?.card, "smokescreen", true);
  },

  ignoreClassAdvantage(ctx) {
    applyFlag(ctx.sourceUnit?.card, "ignoreClassAdvantage", true);
  },

  heavyArmor(ctx, effect) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.heavyArmor = effect?.args?.amount ?? 1;
  },

  mobilize(ctx, effect) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.mobilize = effect?.args?.amount ?? 2;
  },

  pinStrike(ctx, effect) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.pinTurns = effect?.args?.turns ?? 1;
  },

  riposte(ctx) {
    applyFlag(ctx.sourceUnit?.card, "riposte", true);
  },

  grantAmbush(ctx) {
    applyFlag(ctx.sourceUnit?.card, "ambush", true);
  },

  ambush(ctx) {
    applyFlag(ctx.sourceUnit?.card, "ambush", true);
  },

  effectImmunity(ctx) {
    applyFlag(ctx.sourceUnit?.card, "effectImmunity", true);
  },

  unitDamageImmunity(ctx) {
    applyFlag(ctx.sourceUnit?.card, "unitDamageImmunity", true);
  },

  bonusVsPusher(ctx) {
    applyFlag(ctx.sourceUnit?.card, "bonusVsPusher", true);
  },

  firstHitShield(ctx) {
    applyFlag(ctx.sourceUnit?.card, "firstHitShield", true);
  },

  immuneToConquerorInsignia(ctx) {
    applyFlag(ctx.sourceUnit?.card, "immuneToConquerorInsignia", true);
  },

  // =========================
  // DANO / CURA / BUFF
  // =========================
  damageActiveEnemy(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const target = this._enemyActiveUnit(state, owner);
    if (!target) return;

    this._damageUnit(ctx, target, effect?.args?.amount ?? 0);
  },

  dealDamageToEnemy(ctx, effect) {
    const target = this._getTargetUnit(ctx);
    if (!target) return;

    this._damageUnit(ctx, target, effect?.args?.amount ?? 0);
  },

  healActiveAlly(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const ally = this._activeUnit(state, owner);
    if (!ally) return;

    this._heal(ally, effect?.args?.amount ?? 0);
  },

  buffAttackActiveAlly(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const ally = this._activeUnit(state, owner);
    if (!ally) return;

    const amount = effect?.args?.amount ?? 0;
    this._setAttack(ally, this._getAttack(ally) + amount);
  },

  buffDefense400(ctx) {
    const target = this._getTargetUnit(ctx);
    if (!target) return;

    this._setDefense(target, this._getDefense(target) + 400);
  },

  gainAttackOnKill(ctx, effect) {
    if (!ctx.sourceUnit) return;
    const amount = effect?.args?.amount ?? 0;
    this._setAttack(ctx.sourceUnit, this._getAttack(ctx.sourceUnit) + amount);
  },

  bastionGrowth(ctx, effect) {
    if (!ctx.sourceUnit) return;

    const amount = effect?.args?.amount ?? 200;
    this._setAttack(ctx.sourceUnit, this._getAttack(ctx.sourceUnit) + amount);
    this._setDefense(ctx.sourceUnit, this._getDefense(ctx.sourceUnit) + amount);
  },

  terrorcrocHeal(ctx, effect) {
    if (!ctx.sourceUnit) return;
    this._heal(ctx.sourceUnit, effect?.args?.amount ?? 200);
  },

  deathDamage300(ctx) {
    const attacker = ctx.meta?.attackerUnit;
    if (!attacker) return;

    this._damageUnit(ctx, attacker, 300);
  },

  damageAllAllies(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const allies = this._unitsOf(state, owner);

    for (const unit of allies) {
      if (unit === ctx.sourceUnit) continue;
      this._damageUnit(ctx, unit, effect?.args?.amount ?? 0);
    }
  },

  warMachineSplash(ctx, effect) {
    const target = this._getTargetUnit(ctx);
    const state = this._getState(ctx);
    if (!target) return;

    const enemyUnits = this._unitsOf(state, target.owner);
    for (const unit of enemyUnits) {
      if (unit === target) continue;
      this._damageUnit(ctx, unit, effect?.args?.damage ?? 500);
    }
  },

  // =========================
  // COMPRA / MÃO / DECK / CEMITÉRIO
  // =========================
  revealEnemyHandCard(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    this._ensureBuckets(state, enemy);
    const hand = state.hands[enemy] || [];
    if (!hand.length) return;

    const index = Math.floor(Math.random() * hand.length);
    state.revealedCard = {
      owner: this._getOwner(ctx),
      card: hand[index]
    };
  },

  aurumShuffleHand(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    const hand = state.hands[owner] || [];
    const deck = state.decks[owner] || [];
    const amount = hand.length;

    while (hand.length) {
      deck.push(hand.pop());
    }

    this._shuffle(deck);

    for (let i = 0; i < amount; i++) {
      const c = deck.shift();
      if (!c) break;
      hand.push(c);
    }
  },

  strategistPeekTopDeck(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    const deck = state.decks[owner] || [];
    if (!deck.length) return;

    state.peekTopDeck = {
      owner,
      card: deck[0]
    };
  },

  oneirosPortal(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    const deck = state.decks[owner] || [];
    const hand = state.hands[owner] || [];
    const grave = state.graveyards[owner] || [];

    const top = deck.shift();
    if (!top) return;

    if (top.cardClass === "unit") hand.push(top);
    else grave.push(top);
  },

  singularityShuffleGraves(ctx, effect) {
    const state = this._getState(ctx);
    const amount = effect?.args?.amount ?? 10;
    const playerIds = (state.players || []).map((p) => p.socketId);

    for (const socketId of playerIds) {
      this._ensureBuckets(state, socketId);
    }

    for (let i = 0; i < amount; i++) {
      for (const socketId of playerIds) {
        if (state.graveyards[socketId]?.length) {
          state.decks[socketId].push(state.graveyards[socketId].pop());
        }
      }
    }

    for (const socketId of playerIds) {
      this._shuffle(state.decks[socketId]);
    }
  },

  reviveFromGrave(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    const grave = state.graveyards[owner] || [];
    const card = grave.pop();
    if (!card) return;

    this._summonToBank(ctx, card, owner);
  },

  necromancerRevive(ctx) {
    return this.reviveFromGrave(ctx);
  },

  returnAllEnemyUnitsToHand(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const units = this._unitsOf(state, enemy);
    for (const unit of [...units]) {
      this._moveToHand(ctx, unit);
    }
  },

  copyLastPlayedStats(ctx) {
    if (!ctx.sourceUnit?.card || !ctx.state?.lastPlayedUnit) return;

    const last = ctx.state.lastPlayedUnit;
    const atk = last.card?.attack ?? last.attack ?? 0;
    const def = last.card?.defense ?? last.defense ?? 0;

    ctx.sourceUnit.card.originalAttack ??= ctx.sourceUnit.card.attack ?? 0;
    ctx.sourceUnit.card.originalDefense ??= ctx.sourceUnit.card.defense ?? 0;

    this._setAttack(ctx.sourceUnit, atk);
    this._setDefense(ctx.sourceUnit, def);
  },

  copyLastEnemyEffect(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    state.flags.copyLastEnemyEffectPending = owner;
  },

  resetSelfToBase(ctx) {
    if (!ctx.sourceUnit?.card) return;

    const card = ctx.sourceUnit.card;
    card.attack = card.originalAttack ?? card.baseAttack ?? card.attack ?? 0;
    card.defense = card.originalDefense ?? card.baseDefense ?? card.defense ?? 0;
  },

  // =========================
  // ENERGIA / VIDA
  // =========================
  thiefDrainEnergy(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    this._loseEnergy(state, enemy, 1);
  },

  gainEnergyAura(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._gainEnergy(state, owner, effect?.args?.amount ?? 2);
  },

  superCharge(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.turnEffects[owner].nextTurnEnergyBonus =
      (state.turnEffects[owner].nextTurnEnergyBonus || 0) + (effect?.args?.amount ?? 4);
  },

  warIncentive(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.turnEffects[owner].attackCostReduction = 2;
  },

  stealSavedEnergy(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const saved = state.lastTurnSavedEnergy?.[enemy] || 0;
    this._gainEnergy(state, owner, saved);
  },

  devourAllUnits(ctx) {
    const state = this._getState(ctx);
    const all = this._allUnits(state);

    for (const unit of [...all]) {
      this._defeatUnit(ctx, unit);
    }

    this._loseLife(state, this._getOwner(ctx), 1);
  },

  // =========================
  // LOCK / CONTROLE
  // =========================
  paralyzeAttacker(ctx) {
    const attacker = ctx.meta?.attackerUnit;
    if (!attacker?.card) return;

    attacker.card.pinnedUntilTurn = (ctx.state?.turnNumber || 0) + 1;
  },

  infiniteVoid(ctx, effect) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const units = this._unitsOf(state, enemy);
    for (const unit of units) {
      unit.card.cannotMoveTurns = effect?.args?.turns ?? 2;
      unit.card.cannotAttackTurns = effect?.args?.turns ?? 2;
    }
  },

  endlessWinter(ctx, effect) {
    const state = this._getState(ctx);
    state.flags.endlessWinter = {
      turns: effect?.args?.turns ?? 2
    };
  },

  astrumFieldLock(ctx) {
    const state = this._getState(ctx);
    state.flags.astrumFieldLock = true;
  },

  astrumFieldUnlock(ctx) {
    const state = this._getState(ctx);
    state.flags.astrumFieldLock = false;
  },

  eternumLockField(ctx) {
    const state = this._getState(ctx);
    state.flags.noSummon = true;
  },

  eternumUnlockField(ctx) {
    const state = this._getState(ctx);
    state.flags.noSummon = false;
  },

  mobileFortressAura(ctx) {
    applyFlag(ctx.sourceUnit?.card, "mobileFortressAura", true);
  },

  lockEnemyActiveNoRetreat(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const active = this._activeUnit(state, enemy);
    if (!active?.card) return;

    active.card.noRetreat = true;
  },

  delaySelfAction(ctx, effect) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.cannotActTurns = effect?.args?.turns ?? 2;
  },

  mimicGainSmokescreen(ctx) {
    applyFlag(ctx.sourceUnit?.card, "smokescreen", true);
  },

  gainBlitzIfEnemyDamaged(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const units = this._unitsOf(state, enemy);
    const damaged = units.some((u) => {
      const baseDef =
        u.card?.originalDefense ?? u.card?.baseDefense ?? u.card?.defense ?? 0;
      return (u.card?.defense ?? 0) < baseDef;
    });

    if (damaged) {
      this.blitz(ctx);
    }
  },

  chaosEnvoyImmunity(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.immuneFromClasses = ["Pusher", "Equalizer"];
  },

  voidServantsBlitz(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const units = this._unitsOf(state, owner);

    for (const unit of units) {
      if (unit.card?.name === "Servo do Vazio") {
        unit.card.blitz = true;
      }
    }
  },

  vultureCheckInfectionKills(ctx) {
    if (!ctx.sourceUnit?.card) return;

    const kills = ctx.state?.infectionKillsThisMatch || 0;
    const baseAtk = ctx.sourceUnit.card.originalAttack ?? ctx.sourceUnit.card.attack ?? 0;
    const baseDef = ctx.sourceUnit.card.originalDefense ?? ctx.sourceUnit.card.defense ?? 0;

    ctx.sourceUnit.card.attack = baseAtk + kills * 400;
    ctx.sourceUnit.card.defense = baseDef + kills * 400;
  },

  eudoriaPrinceInit(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy || !ctx.sourceUnit) return;

    const count = this._unitsOf(state, enemy).length;
    this._setAttack(ctx.sourceUnit, Math.max(0, this._getAttack(ctx.sourceUnit) - count * 500));
  },

  xmAresWormholeBuff(ctx) {
    if (!ctx.sourceUnit?.card) return;
    if (ctx.meta?.summonedBy === "wormhole") {
      ctx.sourceUnit.card.freeAttackThisTurn = true;
    }
  },

  scaleDefenseFromPlayerLife(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const player = this._getPlayerState(state, owner);

    if (!player || !ctx.sourceUnit) return;

    const bonus = Math.floor((player.life || 0) / 2) * 1000;
    this._setDefense(ctx.sourceUnit, this._getDefense(ctx.sourceUnit) + bonus);
  },

  tyrannosaurusMobilize(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const zones = this._fieldZones(state, enemy);
    for (const zone of zones) {
      const list = state.board?.[zone] || [];
      for (const unit of [...list]) {
        if (unit.owner === enemy) {
          this._moveToBank(ctx, unit);
        }
      }
    }
  },

  // =========================
  // EFEITOS DE CARTAS EFFECT
  // =========================
  blackLuna(ctx) {
    const target = this._getTargetUnit(ctx);
    if (!target) return;

    this._setDefense(target, 0);
    this._defeatUnit(ctx, target);
  },

  massAttackBuff(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    const units = this._unitsOf(state, owner);

    for (const unit of units) {
      unit.card.blitz = true;
      this._setAttack(unit, this._getAttack(unit) + (effect?.args?.amount ?? 100));
    }
  },

  interceptCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].cancelNextEnemyEffect = true;
  },

  delayCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].returnNextBlitzUnitToHand = true;
  },

  panicCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].panicCounter = true;
  },

  mirrorCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].reflectNextEnemyEffect = true;
  },

  necronomiconCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].stealNextEnemySummon = true;
  },

  logisticsCutCounter(ctx, effect) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].logisticsCut = true;
    state.counters[owner].logisticsCutMaxCost = effect?.args?.maxCost ?? 5;
  },

  quickCounterAttack(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].quickCounterAttack = true;
  },

  quickResponseTrap(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].quickResponse = true;
  },

  armedNetCounter(ctx) {
    const state = this._getState(ctx);
    const owner = this._getOwner(ctx);
    this._ensureBuckets(state, owner);

    state.counters[owner].armedNet = true;
  },

  equalizeUnitStats(ctx) {
    const target = this._getTargetUnit(ctx);
    if (!target) return;

    const maxValue = Math.max(this._getAttack(target), this._getDefense(target));
    this._setAttack(target, maxValue);
    this._setDefense(target, maxValue);
  },

  forcedSwapEnemyUnits(ctx) {
    const state = this._getState(ctx);
    const enemy = this._getEnemy(ctx);
    if (!enemy) return;

    const active = this._activeUnit(state, enemy);
    const bankZone = this._bankZone(state, enemy);
    const bankUnit = (state.board?.[bankZone] || []).find((u) => u && u.owner === enemy);

    if (!active || !bankUnit) return;

    const activeZone = active.zone;
    const activeArr = state.board[activeZone];
    const bankArr = state.board[bankZone];

    const activeIndex = activeArr.indexOf(active);
    const bankIndex = bankArr.indexOf(bankUnit);

    activeArr[activeIndex] = bankUnit;
    bankArr[bankIndex] = active;

    bankUnit.zone = activeZone;
    active.zone = bankZone;
  },

  judgmentCoinFlipSameRarity(ctx) {
    const ally = this._getAllyTarget(ctx);
    const enemy = this._getEnemyTarget(ctx);
    if (!ally || !enemy) return;
    if (ally.card?.rarity !== enemy.card?.rarity) return;

    const heads = Math.random() < 0.5;
    if (heads) this._defeatUnit(ctx, ally);
    else this._defeatUnit(ctx, enemy);
  },

  reapStrike(ctx, effect) {
    const target = this._getTargetUnit(ctx);
    if (!target) return;

    const maxCost = effect?.args?.maxCost ?? 7;
    const damage = effect?.args?.damage ?? 1000;

    if ((target.card?.cost ?? 999) > maxCost) return;
    this._damageUnit(ctx, target, damage);
  },

  malevolentShrine(ctx, effect) {
    const state = this._getState(ctx);
    state.globalEffects.push({
      id: "malevolentShrine",
      turns: effect?.args?.turns ?? 6,
      damage: effect?.args?.damage ?? 300,
      owner: this._getOwner(ctx)
    });
  },

  superNova(ctx, effect) {
    const state = this._getState(ctx);
    const all = this._allUnits(state);

    for (const unit of all) {
      this._damageUnit(ctx, unit, effect?.args?.damage ?? 1000);
    }
  },

  dandelionEffect(ctx) {
    const owner = this._getOwner(ctx);

    for (let i = 0; i < 2; i++) {
      this._summonToBank(
        ctx,
        {
          id: `TOKEN_DANDELION_${i}`,
          name: "Dente-de-Leão",
          cardClass: "unit",
          type: "Pusher",
          rarity: "Básico",
          cost: 0,
          attackCost: 0,
          attack: 100,
          defense: 100,
          text: "",
          effects: []
        },
        owner
      );
    }
  }
};

function runEffects(card, trigger, ctx = {}) {
  if (!card || !Array.isArray(card.effects)) return;

  card.effects.forEach((effect) => {
    if (!effect) return;
    if (effect.trigger !== trigger) return;

    const fn = EFFECTS[effect.id];
    if (typeof fn !== "function") {
      console.warn("Efeito não encontrado:", effect.id);
      return;
    }

    fn.call(EFFECTS, ctx, effect);
  });
}

module.exports = {
  EFFECTS,
  runEffects
};