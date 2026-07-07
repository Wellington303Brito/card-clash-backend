const EFFECTS = {

  // =============================
  // HELPERS
  // =============================
  getAllUnits(state) {
    return Object.values(state.board).flat();
  },

  getEnemyUnits(state, owner) {
    return this.getAllUnits(state).filter(u => u.owner !== owner);
  },

  getAlliedUnits(state, owner) {
    return this.getAllUnits(state).filter(u => u.owner === owner);
  },

  getState(unit) {
    if (!unit.state) unit.state = {};
    return unit.state;
  },

  getArg(effect, name, fallback = 0) {
    return effect?.args?.[name] ?? fallback;
  },

  getActiveEnemy(state, owner) {
    const isP1 = state.players[0]?.socketId === owner;
    const zone = isP1 ? "campo2" : "campo1";
    return state.board?.[zone]?.[0] || null;
  },

  getActiveAlly(state, owner) {
    const isP1 = state.players[0]?.socketId === owner;
    const zone = isP1 ? "campo1" : "campo2";
    return state.board?.[zone]?.[0] || null;
  },

  getBenchZone(state, owner) {
    return state.players[0]?.socketId === owner ? "bancoPlayer" : "bancoEnemy";
  },

  getEnemyBenchZone(state, owner) {
    return state.players[0]?.socketId === owner ? "bancoEnemy" : "bancoPlayer";
  },

  damage(unit, amount) {
    if (!unit?.card) return;

    let dmg = Number(amount) || 0;

    if (unit.card.heavyArmor) {
      const lvl = unit.card.heavyArmor;
      const red = lvl === 1 ? 0.3 : lvl === 2 ? 0.5 : 0.7;
      dmg = Math.ceil(dmg * (1 - red));
    }

    unit.card.defense -= dmg;

    if (unit.card.defense <= 0) {
      unit.dead = true;
  }
},

  heal(unit, amount) {
    if (!unit?.card) return;
    unit.card.defense += Number(amount) || 0;
  },

  // =============================
  // BÁSICOS
  // =============================
 blitz(ctx) {
    // Tenta pegar o card usando o 'this' se ele existir, ou direto do 'ctx'
    const card = (this && typeof this._getCard === "function") 
      ? this._getCard(ctx) 
      : (ctx?.card || ctx?.unit?.card || ctx);
      
    if (!card) return;
    card.blitz = true;
    
    // Evita o erro do state/getState
    if (ctx && typeof ctx.getState === "function") {
      const s = ctx.getState(ctx);
      if (s) s.canAttack = true;
    } else if (ctx?.state) {
      ctx.state.canAttack = true;
      ctx.state.summonTurn = false;
    }
  },

  mobilize(ctx, effect) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.mobilize = this.getArg(effect, "amount", 2);
    return true;
  },

  heavyArmor(ctx, effect) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.heavyArmor = this.getArg(effect, "amount", 1);
    return true;
  },

  smokescreen(ctx) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.smokescreen = true;
    return true;
  },

  ranged(ctx) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.ranged = true;
    return true;
  },

  pinStrike(ctx, effect) {
    if (ctx.sourceUnit?.card) {
      ctx.sourceUnit.card.pinTurns = this.getArg(effect, "turns", 1);
      return true;
    }

    const target = ctx.targetUnit;
    if (!target?.card) return;

    target.card.pinnedUntilTurn = ctx.state.turnNumber + this.getArg(effect, "turns", 1);
    return true;
  },

  berserk(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.berserk = true;
    return true;
  },

  ignoreClassAdvantage(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.ignoreClassAdvantage = true;
    return true;
  },

  effectImmunity(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.effectImmune = true;
    return true;
  },

  firstHitShield(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.firstHitShield = true;
    return true;
  },

  bonusVsPusher(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.bonusVsPusher = true;
    return true;
  },

  chaosEnvoyImmunity(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.immuneFromTypes = ["Pusher", "Equalizer"];
    return true;
  },

  immuneToConquerorInsignia(ctx) {
    if (!ctx.sourceUnit?.card) return;
    ctx.sourceUnit.card.immuneToConquerorInsignia = true;
    return true;
  },

  lockEnemyActiveNoRetreat(ctx) {
    const enemy = this.getActiveEnemy(ctx.state, ctx.owner);
    if (!enemy?.card) return false;
    enemy.card.noRetreat = true;
    return true;
  },

  scaleDefenseFromPlayerLife(ctx) {
    const unit = ctx.sourceUnit;
    const player = ctx.state.players.find(p => p.socketId === ctx.owner);
    if (!unit?.card || !player) return false;

    const bonus = Math.floor(Number(player.life || 0) / 2) * 1000;
    unit.card.defense = Number(unit.card.defense || 0) + bonus;
    return true;
  },

  // =============================
  // DANO
  // =============================
  warMachineSplash(ctx, effect) {
    const enemies = this.getEnemyUnits(ctx.state, ctx.owner);

    enemies.forEach(e => {
      this.damage(e, this.getArg(effect, "damage", 300));
    });

    return true;
  },

  deathDamage300(ctx) {
    const attacker = ctx.meta?.attackerUnit;
    if (!attacker) return;

    this.damage(attacker, 300);
    return true;
  },

  damageActiveEnemy(ctx, effect) {
    const enemy = ctx.targetUnit || this.getActiveEnemy(ctx.state, ctx.owner);
    if (!enemy?.card) return false;
    this.damage(enemy, this.getArg(effect, "amount", 200));
    return true;
  },

  dealDamageToEnemy(ctx, effect) {
    const enemy = ctx.targetUnit;
    if (!enemy?.card) return false;
    this.damage(enemy, this.getArg(effect, "amount", 400));
    return true;
  },

  damageAllAllies(ctx, effect) {
    const allies = this.getAlliedUnits(ctx.state, ctx.owner).filter(u => u !== ctx.sourceUnit);
    const amount = this.getArg(effect, "amount", 200);
    allies.forEach(unit => this.damage(unit, amount));
    return true;
  },

  // =============================
  // CONTROLE
  // =============================
  returnAllEnemyUnitsToHand(ctx) {
    const enemies = this.getEnemyUnits(ctx.state, ctx.owner);

    enemies.forEach(e => {
      for (let z in ctx.state.board) {
        ctx.state.board[z] = ctx.state.board[z].filter(u => u !== e);
      }
    });

    return true;
  },

  eternumLockField(ctx) {
    ctx.state.flags.noSummon = true;
    return true;
  },

  eternumUnlockField(ctx) {
    ctx.state.flags.noSummon = false;
    return true;
  },

  healActiveAlly(ctx, effect) {
    const ally = ctx.targetUnit || this.getActiveAlly(ctx.state, ctx.owner);
    if (!ally?.card) return false;
    this.heal(ally, this.getArg(effect, "amount", 200));
    return true;
  },

  buffAttackActiveAlly(ctx, effect) {
    const ally = ctx.targetUnit || this.getActiveAlly(ctx.state, ctx.owner);
    if (!ally?.card) return false;
    ally.card.attack = Number(ally.card.attack || 0) + this.getArg(effect, "amount", 300);
    return true;
  },

  buffDefense400(ctx) {
    const target = ctx.targetUnit;
    if (!target?.card) return false;
    target.card.defense = Number(target.card.defense || 0) + 400;
    return true;
  },

  equalizeUnitStats(ctx) {
    const target = ctx.targetUnit;
    if (!target?.card) return false;
    const value = Math.max(Number(target.card.attack || 0), Number(target.card.defense || 0));
    target.card.attack = value;
    target.card.defense = value;
    return true;
  },

  grantAmbush(ctx) {
    ctx.sourceUnit.card.ambush = true;
    return true;
  },

  unitDamageImmunity(ctx) {
    ctx.sourceUnit.card.ignoreDamage = true;
    return true;
  },

  panicCounter(ctx) {
  console.log("Counter ativado");
  return true;
},

reviveFromGrave(ctx) {
  const grave = ctx.state.graveyards?.[ctx.owner] || [];
  if (!grave.length) return false;

  const revivedCard = grave.pop();

  
  const isP1 = ctx.state.players[0]?.socketId === ctx.owner;
  const benchZone = isP1 ? "bancoPlayer" : "bancoEnemy";

  ctx.state.board[benchZone].push({
    owner: ctx.owner,
    zone: benchZone,
    card: {
      ...revivedCard,
      summonedTurn: ctx.state.turnNumber,
      actionsUsedThisTurn: 0,
      attacksUsedThisTurn: 0,
      movedThisTurn: false,
      attackedThisTurn: false
    }
  });

  return true;
},

necromancerRevive(ctx) {
  return this.reviveFromGrave(ctx);
},

reaverRevive(ctx) {
  return this.reviveFromGrave(ctx);
},

temporalPulse(ctx) {
  console.log("Pulso temporal");
  return true;
},

timeJump(ctx) {
  ctx.state.flags.skipEnergy = true;
  ctx.state.flags.doubleNextTurn = true;
  return true;
},
thiefDrainEnergy(ctx) {
  const enemyPlayer = ctx.state.players.find(p => p.socketId !== ctx.owner);
  if (!enemyPlayer) return false;

  enemyPlayer.pe = Math.max(0, Number(enemyPlayer.pe || 0) - 1);
  return true;
},

gainAttackOnKill(ctx, effect) {
  if (!ctx.sourceUnit?.card) return false;
  ctx.sourceUnit.card.attack = Number(ctx.sourceUnit.card.attack || 0) + this.getArg(effect, "amount", 1000);
  return true;
},

terrorcrocHeal(ctx, effect) {
  if (!ctx.sourceUnit?.card) return false;
  this.heal(ctx.sourceUnit, this.getArg(effect, "amount", 200));
  return true;
},

revealEnemyHandCard() {
  return true;
},

};


// =============================
// EXECUTOR BACKEND
// =============================
// ... (suas funções de efeitos existentes)

function runEffects(card, trigger, ctx = {}) {
  if (!card || !card.effects) return true;

  for (const effect of card.effects) {
    if (effect.trigger !== trigger) continue;

    // Procura a função dentro do objeto EFFECTS
    const fn = EFFECTS[effect.id];
    if (typeof fn === "function") {
      console.log(`Executando efeito: ${effect.id} para ${card.name}`);
      fn(ctx, effect);
    } else {
      console.warn(`Efeito nao implementado no backend: ${effect.id} (${card.name})`);
    }
  }
  return true;
}

// ESSENCIAL: Exportar para o Node.js (server.js) conseguir usar
if (typeof module !== "undefined" && module.exports) {
  module.exports = { EFFECTS, runEffects };
}
  

