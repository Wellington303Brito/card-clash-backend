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
    const u = ctx.sourceUnit;
    if (!u) return;

    const s = this.getState(u);
    s.canActImmediately = true;
    s.extraActions = 1;

    // INTEGRAÇÃO COM BACKEND
    u.card.blitz = true;

    return true;
  },

  mobilize(ctx) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.mobilize = ctx.amount || 2;
    return true;
  },

  heavyArmor(ctx) {
    const u = ctx.sourceUnit;
    if (!u) return;

    u.card.heavyArmor = ctx.amount || 1;
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

  pinStrike(ctx) {
    const target = ctx.targetUnit;
    if (!target) return;

    target.card.pinnedUntilTurn = ctx.state.turnNumber + (ctx.turns || 1);
    return true;
  },

  // =============================
  // DANO
  // =============================
  warMachineSplash(ctx) {
    const enemies = this.getEnemyUnits(ctx.state, ctx.owner);

    enemies.forEach(e => {
      this.damage(e, ctx.damage || 300);
    });

    return true;
  },

  deathDamage300(ctx) {
    const attacker = ctx.meta?.attackerUnit;
    if (!attacker) return;

    this.damage(attacker, 300);
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

};


// =============================
// EXECUTOR BACKEND
// =============================
function runEffects(card, trigger, ctx) {
  if (!card?.effects) return;

  for (const effect of card.effects) {
    if (effect.trigger !== trigger) continue;

    const fn = EFFECTS[effect.id];

    if (!fn) {
      console.log("Efeito não encontrado:", effect.id);
      continue;
    }

    fn.call(EFFECTS, {
      ...ctx,
      ...(effect.args || {})
    });
  }
}

module.exports = {
  runEffects
};