const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const CARD_DB = require("./cards-db");
const cors = require("cors");
require("dotenv").config();
const { runEffects } = require("./effects");

const app = express();

app.use(cors());
app.use(express.json());

const ROLL_RATES = [
  { rarity: "Básico", chance: 60 },
  { rarity: "Comum", chance: 25 },
  { rarity: "Especial", chance: 10 },
  { rarity: "Extraordinário", chance: 4 },
  { rarity: "Elite", chance: 1 }
];

function normalizeRarity(rarity) {
  if (!rarity) return "Básico";

  const value = String(rarity).trim().toLowerCase();

  if (value === "basico" || value === "básica" || value === "basica" || value === "básico") return "Básico";
  if (value === "comum") return "Comum";
  if (value === "especial") return "Especial";
  if (value === "extraordinario" || value === "extraordinário" || value === "estraordinário") return "Extraordinário";
  if (value === "elite") return "Elite";

  return "Básico";
}

async function unlockAllCards(playerId) {
  const cardIds = Object.keys(CARD_DB);

  for (const cardId of cardIds) {
    await db.query(`
      INSERT INTO player_cards (player_id, card_id, quantity)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
    `, [playerId, cardId]);
  }
}

app.post("/debug/unlock-all", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    await unlockAllCards(playerId);

    res.json({
      success: true,
      message: "Todas as cartas foram liberadas."
    });
  } catch (err) {
    console.error("Erro ao liberar cartas:", err);
    res.status(500).json({
      error: "Erro ao liberar cartas.",
      details: err.message
    });
  }
});

function rollRarity() {
  const random = Math.random() * 100;
  let accumulated = 0;

  for (const item of ROLL_RATES) {
    accumulated += item.chance;
    if (random < accumulated) {
      return item.rarity;
    }
  }

  return "Básico";
}

function getRandomCardByRarity(rarity) {
  const cards = Object.values(CARD_DB).filter(card => {
    return normalizeRarity(card.rarity || card.raridade) === rarity;
  });

  if (!cards.length) return null;

  const picked = cards[Math.floor(Math.random() * cards.length)];

  return {
    ...picked,
    id: picked.id || picked.card_id || picked.name
  };
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username).trim();
}

function generateToken(player) {
  return jwt.sign(
    {
      id: player.id,
      username: player.username,
      email: player.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não enviado." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, player) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido." });
    }

    req.player = player;
    next();
  });
}

app.get("/", (req, res) => {
  res.send("VERSAO NOVA");
});

app.post("/register", async (req, res) => {
  try {
    const username = normalizeUsername(req.body.username);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "").trim();

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido." });
    }

    const [existingUsers] = await db.query(
      "SELECT * FROM players WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Usuário ou email já existe." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO players (username, email, password, coins, rolls) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 0, 40]
    );

    const playerData = {
      id: result.insertId,
      username,
      email,
      coins: 0,
      rolls: 40
    };

    const token = generateToken(playerData);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      token,
      player: playerData
    });
  } catch (error) {
    console.error("Erro em /register:", error);
    res.status(500).json({
      error: "Erro ao cadastrar usuário.",
      details: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = normalizeEmail(email);
    password = String(password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Preencha email e senha." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido." });
    }

    const sql = "SELECT * FROM players WHERE email = ?";
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const player = results[0];
    const senhaCorreta = await bcrypt.compare(password, player.password);

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    const playerData = {
      id: player.id,
      username: player.username,
      email: player.email,
      coins: player.coins,
      rolls: player.rolls
    };

    const token = generateToken(playerData);

    res.json({
      message: "Login realizado com sucesso!",
      player: playerData,
      token
    });
  } catch (error) {
    console.error("Erro em /login:", error);
    res.status(500).json({ error: "Erro no login." });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const sql = "SELECT id, username, email, coins, rolls FROM players WHERE id = ?";
    const [results] = await db.query(sql, [req.player.id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    res.json({
      message: "Usuário autenticado",
      player: results[0]
    });
  } catch (error) {
    console.error("Erro em /me:", error);
    res.status(500).json({ error: "Erro ao buscar jogador." });
  }
});

app.get("/collection", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const sql = `
      SELECT card_id, quantity
      FROM player_cards
      WHERE player_id = ?
      ORDER BY card_id ASC
    `;

    const [results] = await db.query(sql, [playerId]);

    res.json({
      playerId,
      cards: results
    });
  } catch (error) {
    console.error("Erro em /collection:", error);
    res.status(500).json({ error: "Erro ao buscar coleção." });
  }
});

app.get("/collection/full", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const sql = `
      SELECT card_id, quantity
      FROM player_cards
      WHERE player_id = ?
    `;

    const [results] = await db.query(sql, [playerId]);

    const collection = results
      .map(row => {
        const cardData = CARD_DB[row.card_id];
        if (!cardData) return null;

        return {
          ...cardData,
          quantity: row.quantity
        };
      })
      .filter(Boolean);

    res.json({
      cards: collection
    });
  } catch (error) {
    console.error("Erro em /collection/full:", error);
    res.status(500).json({ error: "Erro ao buscar coleção completa." });
  }
});

app.post("/collection/add", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;
    const { card_id, quantity } = req.body;

    const qty = Number(quantity) || 1;

    if (!card_id) {
      return res.status(400).json({ error: "card_id é obrigatório." });
    }

    if (qty <= 0) {
      return res.status(400).json({ error: "quantity deve ser maior que 0." });
    }

    const sql = `
      INSERT INTO player_cards (player_id, card_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    await db.query(sql, [playerId, card_id, qty]);

    res.json({
      message: "Carta adicionada com sucesso!",
      card_id,
      quantity: qty
    });
  } catch (error) {
    console.error("Erro em /collection/add:", error);
    res.status(500).json({ error: "Erro ao adicionar carta." });
  }
});

app.post("/roll", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const [playerResults] = await db.query(
      "SELECT rolls FROM players WHERE id = ?",
      [playerId]
    );

    if (playerResults.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    const currentRolls = Number(playerResults[0].rolls || 0);

    if (currentRolls <= 0) {
      return res.status(400).json({ error: "Você não tem mais rolls." });
    }

    const rolledRarity = rollRarity();
    const card = getRandomCardByRarity(rolledRarity);

    if (!card || !card.id) {
      throw new Error("Carta inválida sorteada no /roll.");
    }

    await db.query(
      `
      INSERT INTO player_cards (player_id, card_id, quantity)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
      `,
      [playerId, card.id]
    );

    await db.query(
      "UPDATE players SET rolls = rolls - 1 WHERE id = ?",
      [playerId]
    );

    res.json({
      message: "Roll realizado com sucesso!",
      card,
      remainingRolls: currentRolls - 1
    });
  } catch (error) {
    console.error("Erro real em /roll:", error);
    res.status(500).json({
      error: "Erro ao realizar roll.",
      details: error.message
    });
  }
});

app.post("/roll/10", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const [playerResults] = await db.query(
      "SELECT rolls FROM players WHERE id = ?",
      [playerId]
    );

    if (playerResults.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    const currentRolls = Number(playerResults[0].rolls || 0);

    if (currentRolls <= 0) {
      return res.status(400).json({ error: "Você não tem mais rolls." });
    }

    const amountToRoll = Math.min(10, currentRolls);
    const rolledCards = [];

    for (let i = 0; i < amountToRoll; i++) {
      const rolledRarity = rollRarity();
      const card = getRandomCardByRarity(rolledRarity);

      if (!card || !card.id) {
        throw new Error("Carta inválida sorteada no /roll/10.");
      }

      rolledCards.push(card);
    }

    for (const card of rolledCards) {
      await db.query(
        `
        INSERT INTO player_cards (player_id, card_id, quantity)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE quantity = quantity + 1
        `,
        [playerId, card.id]
      );
    }

    await db.query(
      "UPDATE players SET rolls = rolls - ? WHERE id = ?",
      [amountToRoll, playerId]
    );

    res.json({
      message: `${amountToRoll} rolls realizados com sucesso!`,
      cards: rolledCards,
      usedRolls: amountToRoll,
      remainingRolls: currentRolls - amountToRoll
    });
  } catch (error) {
    console.error("Erro real em /roll/10:", error);
    res.status(500).json({
      error: "Erro ao realizar 10 rolls.",
      details: error.message
    });
  }
});

app.post("/decks", authenticateToken, async (req, res) => {
  try {
    const player_id = req.player.id;
    const { name, cards } = req.body;

    if (!name || !Array.isArray(cards)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const sqlDeck = "INSERT INTO decks (player_id, name) VALUES (?, ?)";
    const [result] = await db.query(sqlDeck, [player_id, name]);

    const deckId = result.insertId;

    if (cards.length === 0) {
      return res.json({ message: "Deck vazio salvo com sucesso!", deckId });
    }

    const values = cards.map(card => [deckId, card.card_name, card.quantity]);
    const sqlCards = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

    await db.query(sqlCards, [values]);

    res.json({ message: "Deck salvo com sucesso!", deckId });
  } catch (error) {
    console.error("Erro em /decks:", error);
    res.status(500).json({ error: "Erro ao criar deck." });
  }
});

app.delete("/decks/:deckId", authenticateToken, async (req, res) => {
  try {
    const { deckId } = req.params;

    const sql = "DELETE FROM decks WHERE id = ? AND player_id = ?";
    const [result] = await db.query(sql, [deckId, req.player.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    res.json({ message: "Deck deletado com sucesso!" });
  } catch (error) {
    console.error("Erro em DELETE /decks/:deckId:", error);
    res.status(500).json({ error: "Erro ao deletar deck." });
  }
});

app.put("/decks/:deckId", authenticateToken, async (req, res) => {
  try {
    const { deckId } = req.params;
    const { name, cards } = req.body;

    if (!name || !Array.isArray(cards)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const updateDeckSql = "UPDATE decks SET name = ? WHERE id = ? AND player_id = ?";
    const [result] = await db.query(updateDeckSql, [name, deckId, req.player.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    const deleteCardsSql = "DELETE FROM deck_cards WHERE deck_id = ?";
    await db.query(deleteCardsSql, [deckId]);

    if (cards.length === 0) {
      return res.json({ message: "Deck atualizado com sucesso!" });
    }

    const values = cards.map(card => [deckId, card.card_name, card.quantity]);
    const insertCardsSql = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

    await db.query(insertCardsSql, [values]);

    res.json({ message: "Deck atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro em PUT /decks/:deckId:", error);
    res.status(500).json({ error: "Erro ao atualizar deck." });
  }
});

const PORT = process.env.PORT || 3000;
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"]
  }
});

let matchmakingQueue = [];
let matches = {};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sanitizeCard(card) {
  if (!card) return null;

  const attack = Number(card.attack ?? 0);
  const defense = Number(card.defense ?? card.health ?? 0);

  return {
    ...card,
    attack,
    defense,
    originalAttack: attack,
    originalDefense: defense,
    rarity: card.rarity || card.raridade || "Básico",
    emoji: card.emoji || "🃏"
  };
}

function ensureMatchStructures(match) {
  if (!match.graveyards) match.graveyards = {};
  if (!match.counters) match.counters = {};
  if (!match.turnEffects) match.turnEffects = {};
  if (!match.globalEffects) match.globalEffects = [];
  if (!match.flags) match.flags = {};

  match.players.forEach((p) => {
    if (!match.graveyards[p.socketId]) match.graveyards[p.socketId] = [];
    if (!match.counters[p.socketId]) match.counters[p.socketId] = {};
    if (!match.turnEffects[p.socketId]) match.turnEffects[p.socketId] = {};
    if (!match.hands[p.socketId]) match.hands[p.socketId] = [];
    if (!match.decks[p.socketId]) match.decks[p.socketId] = [];
  });
}

function defeatUnit(match, zone, unit) {
  if (!match || !zone || !unit) return;

  ensureMatchStructures(match);

  const arr = match.board?.[zone] || [];
  const index = arr.indexOf(unit);

  if (index >= 0) {
    if (unit.card) {
      match.graveyards[unit.owner].push(JSON.parse(JSON.stringify(unit.card)));
    }
    arr.splice(index, 1);
  }
}

function getPlayerSide(match, socketId) {
  const p1 = match.players[0];
  return p1.socketId === socketId ? "player" : "enemy";
}

function getBoardMapForSocket(match, socketId) {
  const side = getPlayerSide(match, socketId);

  if (side === "player") {
    return {
      ownBench: "bancoPlayer",
      ownField: "campo1",
      enemyField: "campo2",
      enemyBench: "bancoEnemy"
    };
  }

  return {
    ownBench: "bancoEnemy",
    ownField: "campo2",
    enemyField: "campo1",
    enemyBench: "bancoPlayer"
  };
}

function serializeMatchForPlayer(match, socketId) {
  const me = match.players.find(p => p.socketId === socketId);
  const opponent = match.players.find(p => p.socketId !== socketId);
  const map = getBoardMapForSocket(match, socketId);

  return {
    id: match.id,
    turnPlayerId: match.turnPlayerId,
    turnNumber: match.turnNumber,
    players: [
      {
        socketId: me.socketId,
        player: me.player,
        life: me.life,
        pe: me.pe,
        maxPE: me.maxPE
      },
      {
        socketId: opponent.socketId,
        player: opponent.player,
        life: opponent.life,
        pe: opponent.pe,
        maxPE: opponent.maxPE
      }
    ],
    board: {
      bancoPlayer: match.board[map.ownBench],
      campo1: match.board[map.ownField],
      campo2: match.board[map.enemyField],
      bancoEnemy: match.board[map.enemyBench]
    },
    playerHand: match.hands[socketId] || [],
    enemyHandCount: (match.hands[opponent.socketId] || []).length,
    graveyards: {
      player: match.graveyards?.[socketId] || [],
      enemy: match.graveyards?.[opponent.socketId] || []
    }
  };
}

function emitMatchUpdate(match) {
  match.players.forEach(playerState => {
    io.to(playerState.socketId).emit(
      "match_update",
      serializeMatchForPlayer(match, playerState.socketId)
    );
  });
}

function areAdjacent(zoneA, zoneB) {
  const ADJ = {
    bancoPlayer: ["campo1"],
    campo1: ["bancoPlayer", "campo2"],
    campo2: ["campo1", "bancoEnemy"],
    bancoEnemy: ["campo2"]
  };

  return ADJ[zoneA]?.includes(zoneB);
}

function getPlayerZonesForSocket(match, socketId) {
  const isP1 = match.players[0].socketId === socketId;

  if (isP1) {
    return {
      ownBench: "bancoPlayer",
      ownField: "campo1",
      enemyField: "campo2",
      enemyBench: "bancoEnemy"
    };
  }

  return {
    ownBench: "bancoEnemy",
    ownField: "campo2",
    enemyField: "campo1",
    enemyBench: "bancoPlayer"
  };
}

function mapClientZoneToServerZone(match, socketId, clientZone) {
  const zones = getPlayerZonesForSocket(match, socketId);

  const reverseMap = {
    bancoPlayer: zones.ownBench,
    campo1: zones.ownField,
    campo2: zones.enemyField,
    bancoEnemy: zones.enemyBench
  };

  return reverseMap[clientZone] || clientZone;
}

function getCardClassType(card) {
  return card?.type || card?.cardType || null;
}

function getClassAdvantageMultiplier(attacker, defender) {
  const atkType = getCardClassType(attacker);
  const defType = getCardClassType(defender);

  if (!atkType || !defType) return 1;

  if (attacker?.berserk) return 1.25;
  if (defender?.berserk) return 0.75;

  const winsAgainst = {
    Equalizer: "Juggernaut",
    Juggernaut: "Pusher",
    Pusher: "Equalizer"
  };

  if (attacker?.ignoreClassAdvantage) return 1;

  if (winsAgainst[atkType] === defType) return 1.25;
  if (winsAgainst[defType] === atkType) return 0.75;

  return 1;
}

function getHeavyArmorReduction(card, armorPierce = 0) {
  const level = Math.max(0, Number(card?.heavyArmor || 0) - Number(armorPierce || 0));

  if (level <= 0) return 0;
  if (level === 1) return 0.30;
  if (level === 2) return 0.50;
  return 0.70;
}

function applyDamage(attackerCard, defenderCard, baseDamage) {
  let damage = Number(baseDamage || 0);

  const classMult = getClassAdvantageMultiplier(attackerCard, defenderCard);
  damage = Math.floor(damage * classMult);

  if (!attackerCard?.ignoreHeavyArmor) {
    const reduction = getHeavyArmorReduction(defenderCard, attackerCard?.armorPierce || 0);
    damage = Math.floor(damage * (1 - reduction));
  }

  if (damage < 0) damage = 0;

  defenderCard.defense = Number(defenderCard.defense || 0) - damage;
  return damage;
}

function hasBlitz(card) {
  return !!card?.blitz;
}

function hasRiposte(card) {
  return !!card?.riposte;
}

function hasSmokescreen(card) {
  return !!card?.smokescreen;
}

function removeSmokescreenAfterAction(card) {
  if (card?.smokescreen) {
    card.smokescreen = false;
  }
}

function canUseAction(card, match, actionType = "generic") {
  if (!card) return false;

  if (card.pinnedUntilTurn && card.pinnedUntilTurn >= match.turnNumber) {
    return false;
  }

  if (!hasBlitz(card) && card.summonedTurn === match.turnNumber) {
    return false;
  }

  const actionsUsed = Number(card.actionsUsedThisTurn || 0);

  if (hasBlitz(card)) {
    if (actionsUsed >= 2) return false;
  } else {
    if (actionsUsed >= 1) return false;
  }

  if (actionType === "attack" && hasRiposte(card)) {
    if (card.movedThisTurn) return false;
    if (Number(card.attacksUsedThisTurn || 0) >= 2) return false;
    return true;
  }

  return true;
}

function registerAction(card, actionType) {
  card.actionsUsedThisTurn = Number(card.actionsUsedThisTurn || 0) + 1;

  if (actionType === "move") {
    card.movedThisTurn = true;
  }

  if (actionType === "attack") {
    card.attacksUsedThisTurn = Number(card.attacksUsedThisTurn || 0) + 1;
    card.attackedThisTurn = true;
  }

  removeSmokescreenAfterAction(card);
}

function getMobilizeDiscount(match, socketId) {
  let discount = 0;

  Object.keys(match.board).forEach((zone) => {
    (match.board[zone] || []).forEach((unit) => {
      if (unit.owner === socketId && unit.card?.mobilize) {
        discount += Number(unit.card.mobilize || 0);
      }
    });
  });

  return discount;
}

function canAttackAtRange(match, socketId, fromZone, targetZone, attackerCard) {
  const zones = getPlayerZonesForSocket(match, socketId);

  if (!attackerCard?.ranged) {
    return areAdjacent(fromZone, targetZone);
  }

  if (fromZone === zones.ownBench) {
    if (targetZone === zones.enemyBench) return false;
    if (targetZone === zones.enemyField) return true;
  }

  return areAdjacent(fromZone, targetZone);
}

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id);

  socket.on("find_match", (playerData) => {
    const alreadyInQueue = matchmakingQueue.some(p => p.socketId === socket.id);
    if (alreadyInQueue) return;

    matchmakingQueue.push({
      socketId: socket.id,
      player: playerData
    });

    if (matchmakingQueue.length >= 2) {
      const p1 = matchmakingQueue.shift();
      const p2 = matchmakingQueue.shift();

      const matchId = "match_" + Date.now();

      matches[matchId] = {
        id: matchId,
        players: [
          {
            socketId: p1.socketId,
            player: p1.player,
            life: 4,
            pe: 1,
            maxPE: 1
          },
          {
            socketId: p2.socketId,
            player: p2.player,
            life: 4,
            pe: 1,
            maxPE: 1
          }
        ],
        turnPlayerId: p1.player.id,
        turnNumber: 1,
        board: {
          bancoPlayer: [],
          campo1: [],
          campo2: [],
          bancoEnemy: []
        },
        hands: {
          [p1.socketId]: [],
          [p2.socketId]: []
        },
        decks: {
          [p1.socketId]: [],
          [p2.socketId]: []
        },
        graveyards: {
          [p1.socketId]: [],
          [p2.socketId]: []
        },
        counters: {
          [p1.socketId]: {},
          [p2.socketId]: {}
        },
        turnEffects: {
          [p1.socketId]: {},
          [p2.socketId]: {}
        },
        globalEffects: [],
        flags: {},
        lastPlayedUnit: null,
        lastPlayedEffect: null,
        lastTurnSavedEnergy: {},
        lastTurnAttackedBy: {}
      };

      io.to(p1.socketId).emit("match_found", matches[matchId]);
      io.to(p2.socketId).emit("match_found", matches[matchId]);

      console.log("PARTIDA CRIADA:", matchId);
    }
  });

  socket.on("set_match_deck", ({ matchId, deck }) => {
    const match = matches[matchId];
    if (!match) return;
    if (!Array.isArray(deck)) return;

    ensureMatchStructures(match);

    const normalizedDeck = deck
      .map(id => CARD_DB[id])
      .filter(Boolean)
      .map(card => sanitizeCard({ ...card }));

    match.decks[socket.id] = shuffle(normalizedDeck);
    match.hands[socket.id] = [];

    while (match.hands[socket.id].length < 3 && match.decks[socket.id].length > 0) {
      match.hands[socket.id].push(match.decks[socket.id].pop());
    }

    emitMatchUpdate(match);
  });

  socket.on("play_card_to_bench", ({ matchId, handIndex }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const playerState = match.players.find(p => p.socketId === socket.id);
    if (!playerState) return;

    if (match.turnPlayerId !== playerState.player.id) return;

    const hand = match.hands[socket.id] || [];
    const card = hand[handIndex];
    if (!card) return;

    if (card.cardClass === "effect") {
      return;
    }

    const map = getBoardMapForSocket(match, socket.id);
    const benchZone = map.ownBench;

    if (match.board[benchZone].length >= 6) return;
    if (match.flags?.noSummon) return;

    const mobilizeDiscount = getMobilizeDiscount(match, socket.id);
    const cost = Math.max(0, Number(card.cost || 0) - mobilizeDiscount);
    if ((playerState.pe || 0) < cost) return;

    playerState.pe -= cost;
    hand.splice(handIndex, 1);

    const summonedUnit = {
      owner: socket.id,
      zone: benchZone,
      card: sanitizeCard({
        ...card,
        summonedTurn: match.turnNumber,
        actionsUsedThisTurn: 0,
        attacksUsedThisTurn: 0,
        movedThisTurn: false,
        attackedThisTurn: false
      })
    };

    match.board[benchZone].push(summonedUnit);

    match.lastPlayedUnit = JSON.parse(JSON.stringify(summonedUnit));

    const enemyPlayer = match.players.find(p => p.socketId !== socket.id);

    runEffects(summonedUnit.card, "onSummon", {
      state: match,
      owner: socket.id,
      sourceUnit: summonedUnit,
      sourceCard: summonedUnit.card,
      meta: {
        enemyId: enemyPlayer?.socketId || null
      }
    });

    emitMatchUpdate(match);
  });

  socket.on("play_effect_card", ({ matchId, handIndex, targetZone, targetIndex, playerId }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const playerState = match.players.find(p => p.player.id === playerId);
    if (!playerState) return;
    if (playerState.socketId !== socket.id) return;
    if (match.turnPlayerId !== playerState.player.id) return;

    const hand = match.hands[socket.id] || [];
    const card = hand[handIndex];
    if (!card) return;
    if (card.cardClass !== "effect") return;

    const cost = Number(card.cost || 0);
    if ((playerState.pe || 0) < cost) return;

    let targetUnit = null;
    let allyTarget = null;
    let enemyTarget = null;

    if (
      targetZone !== null &&
      targetZone !== undefined &&
      targetIndex !== null &&
      targetIndex !== undefined
    ) {
      const serverTargetZone = mapClientZoneToServerZone(match, socket.id, targetZone);
      targetUnit = match.board[serverTargetZone]?.[targetIndex] || null;

      if (targetUnit) {
        targetUnit.zone = serverTargetZone;

        if (targetUnit.owner === socket.id) {
          allyTarget = targetUnit;
        } else {
          enemyTarget = targetUnit;
        }
      }
    }

    playerState.pe -= cost;
    hand.splice(handIndex, 1);

    match.lastPlayedEffect = JSON.parse(JSON.stringify(card));

    runEffects(card, "onPlay", {
      state: match,
      owner: socket.id,
      sourceCard: card,
      targetUnit,
      allyTarget,
      enemyTarget,
      meta: {}
    });

    match.graveyards[socket.id].push(JSON.parse(JSON.stringify(card)));
    if (!match.lastTurnAttackedBy) match.lastTurnAttackedBy = {};
    match.lastTurnAttackedBy[socket.id] = true;

    emitMatchUpdate(match);
  });

  socket.on("end_turn", ({ matchId, playerId }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const p1 = match.players[0];
    const p2 = match.players[1];

    const currentPlayer =
      p1.player.id === playerId ? p1 : p2.player.id === playerId ? p2 : null;

    if (!currentPlayer) return;
    if (currentPlayer.socketId !== socket.id) return;
    if (match.turnPlayerId !== currentPlayer.player.id) return;

    if (!match.lastTurnSavedEnergy) match.lastTurnSavedEnergy = {};
    match.lastTurnSavedEnergy[socket.id] = currentPlayer.pe || 0;

    const nextPlayer = currentPlayer.player.id === p1.player.id ? p2 : p1;

    Object.keys(match.board).forEach(zone => {
      (match.board[zone] || []).forEach(unit => {
        if (unit.owner === socket.id && unit.card) {
          runEffects(unit.card, "turnEnd", {
            state: match,
            owner: unit.owner,
            sourceUnit: unit,
            sourceCard: unit.card,
            meta: {}
          });
        }
      });
    });

    if (!match.lastTurnSavedEnergy) match.lastTurnSavedEnergy = {};
    match.lastTurnSavedEnergy[socket.id] = currentPlayer.pe || 0;

    match.turnPlayerId = nextPlayer.player.id;
    match.turnNumber = (match.turnNumber || 1) + 1;

    nextPlayer.maxPE = Math.min(10, (nextPlayer.maxPE || 1) + 1);
    nextPlayer.pe = nextPlayer.maxPE;

    const energyBonus = Number(match.turnEffects[nextPlayer.socketId]?.nextTurnEnergyBonus || 0);
    if (energyBonus > 0) {
      nextPlayer.pe = Math.min(nextPlayer.maxPE, nextPlayer.pe + energyBonus);
      match.turnEffects[nextPlayer.socketId].nextTurnEnergyBonus = 0;
    }

    Object.keys(match.board).forEach(zone => {
      (match.board[zone] || []).forEach(unit => {
        if (unit.owner === nextPlayer.socketId && unit.card) {
          runEffects(unit.card, "turnStart", {
            state: match,
            owner: unit.owner,
            sourceUnit: unit,
            sourceCard: unit.card,
            meta: {}
          });
        }
      });
    });

    const nextDeck = match.decks[nextPlayer.socketId] || [];
    const nextHand = match.hands[nextPlayer.socketId] || [];

    if (nextDeck.length > 0 && nextHand.length < 10) {
      nextHand.push(nextDeck.pop());
    }

    Object.keys(match.board).forEach(zone => {
      (match.board[zone] || []).forEach(unit => {
        if (unit.owner === nextPlayer.socketId && unit.card) {
          unit.card.actionsUsedThisTurn = 0;
          unit.card.attacksUsedThisTurn = 0;
          unit.card.movedThisTurn = false;
          unit.card.attackedThisTurn = false;

          if (unit.card.cannotActTurns > 0) unit.card.cannotActTurns -= 1;
          if (unit.card.cannotMoveTurns > 0) unit.card.cannotMoveTurns -= 1;
          if (unit.card.cannotAttackTurns > 0) unit.card.cannotAttackTurns -= 1;
        }
      });
    });

    emitMatchUpdate(match);
  });

  socket.on("move_card", ({ matchId, fromZone, fromIndex, toZone, playerId }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const playerState = match.players.find(p => p.player.id === playerId);
    if (!playerState) return;
    if (playerState.socketId !== socket.id) return;
    if (match.turnPlayerId !== playerState.player.id) return;

    const serverFromZone = mapClientZoneToServerZone(match, socket.id, fromZone);
    const serverToZone = mapClientZoneToServerZone(match, socket.id, toZone);

    const zoneLimits = {
      bancoPlayer: 6,
      campo1: 4,
      campo2: 4,
      bancoEnemy: 6
    };

    const fromList = match.board[serverFromZone];
    const toList = match.board[serverToZone];

    if (!Array.isArray(fromList) || !Array.isArray(toList)) return;

    const unit = fromList[fromIndex];
    if (!unit) return;
    if (unit.owner !== socket.id) return;
    if (!canUseAction(unit.card, match, "move")) return;
    if (unit.card.cannotMoveTurns > 0) return;
    if (unit.card.cannotActTurns > 0) return;
    if (unit.card.noRetreat && serverToZone.includes("banco")) return;

    const moveCost = Number(unit.card?.moveCost ?? unit.card?.cost ?? 1);
    if ((playerState.pe || 0) < moveCost) return;

    if (serverFromZone === serverToZone) return;
    if (!areAdjacent(serverFromZone, serverToZone)) return;
    if (toList.length >= zoneLimits[serverToZone]) return;

    fromList.splice(fromIndex, 1);

    playerState.pe -= moveCost;
    registerAction(unit.card, "move");

    unit.zone = serverToZone;
    toList.push(unit);

    emitMatchUpdate(match);
  });

  socket.on("attack_card", ({ matchId, fromZone, fromIndex, targetZone, targetIndex, playerId }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const playerState = match.players.find(p => p.player.id === playerId);
    if (!playerState) return;
    if (playerState.socketId !== socket.id) return;
    if (match.turnPlayerId !== playerState.player.id) return;

    const serverFromZone = mapClientZoneToServerZone(match, socket.id, fromZone);
    const serverTargetZone = mapClientZoneToServerZone(match, socket.id, targetZone);

    const attacker = match.board[serverFromZone]?.[fromIndex];
    const defender = match.board[serverTargetZone]?.[targetIndex];

    if (!attacker || !defender) return;

    attacker.zone = serverFromZone;
    defender.zone = serverTargetZone;

    if (attacker.owner !== socket.id) return;
    if (defender.owner === socket.id) return;
    if (hasSmokescreen(defender.card)) return;
    if (!canUseAction(attacker.card, match, "attack")) return;
    if (attacker.card.cannotAttackTurns > 0) return;
    if (attacker.card.cannotActTurns > 0) return;

    const attackReduction = Number(match.turnEffects[socket.id]?.attackCostReduction || 0);
    const attackCost = Math.max(0, Number(attacker.card?.attackCost ?? 0) - attackReduction);

    if ((playerState.pe || 0) < attackCost) return;
    if (!canAttackAtRange(match, socket.id, serverFromZone, serverTargetZone, attacker.card)) return;

    runEffects(attacker.card, "onAttack", {
      state: match,
      owner: attacker.owner,
      sourceUnit: attacker,
      sourceCard: attacker.card,
      targetUnit: defender,
      meta: {
        attackerUnit: attacker,
        defenderUnit: defender
      }
    });

    runEffects(defender.card, "onAttacked", {
      state: match,
      owner: defender.owner,
      sourceUnit: defender,
      sourceCard: defender.card,
      targetUnit: attacker,
      meta: {
        attackerUnit: attacker,
        defenderUnit: defender
      }
    });

    if (defender.card?.ambush) {
      applyDamage(defender.card, attacker.card, defender.card.attack || 0);
      defender.card.ambush = false;

      if (Number(attacker.card.defense || 0) <= 0) {
        runEffects(attacker.card, "onDefeat", {
          state: match,
          owner: attacker.owner,
          sourceUnit: attacker,
          sourceCard: attacker.card,
          meta: {
            attackerUnit: defender,
            defenderUnit: attacker
          }
        });

        defeatUnit(match, serverFromZone, attacker);
        playerState.pe -= attackCost;
        registerAction(attacker.card, "attack");

        if (!match.lastTurnAttackedBy) match.lastTurnAttackedBy = {};
        match.lastTurnAttackedBy[socket.id] = true;

        emitMatchUpdate(match);
        return;
      }
    }

    if (attacker.card?.ambush) {
      attacker.card.ambush = false;
    }

    applyDamage(attacker.card, defender.card, attacker.card.attack || 0);

    if (attacker.card?.pinTurns) {
      defender.card.pinnedUntilTurn = match.turnNumber + Number(attacker.card.pinTurns || 1);
    }

    if (Number(defender.card.defense || 0) <= 0) {
      runEffects(defender.card, "onDefeat", {
        state: match,
        owner: defender.owner,
        sourceUnit: defender,
        sourceCard: defender.card,
        meta: {
          attackerUnit: attacker,
          defenderUnit: defender
        }
      });

      runEffects(attacker.card, "onKill", {
        state: match,
        owner: attacker.owner,
        sourceUnit: attacker,
        sourceCard: attacker.card,
        targetUnit: defender,
        meta: {
          attackerUnit: attacker,
          defeatedUnit: defender
        }
      });

      defeatUnit(match, serverTargetZone, defender);
    }

    playerState.pe -= attackCost;
    registerAction(attacker.card, "attack");

    emitMatchUpdate(match);
  });

  socket.on("direct_attack", ({ matchId, fromZone, fromIndex, playerId }) => {
    const match = matches[matchId];
    if (!match) return;
    ensureMatchStructures(match);

    const playerState = match.players.find(p => p.player.id === playerId);
    if (!playerState) return;
    if (playerState.socketId !== socket.id) return;
    if (match.turnPlayerId !== playerState.player.id) return;

    const serverFromZone = mapClientZoneToServerZone(match, socket.id, fromZone);
    const zones = getPlayerZonesForSocket(match, socket.id);

    if (serverFromZone !== zones.ownField) return;

    const attacker = match.board[serverFromZone]?.[fromIndex];
    if (!attacker) return;
    if (attacker.owner !== socket.id) return;
    if (!canUseAction(attacker.card, match, "attack")) return;
    if (attacker.card.cannotAttackTurns > 0) return;
    if (attacker.card.cannotActTurns > 0) return;

    const attackReduction = Number(match.turnEffects[socket.id]?.attackCostReduction || 0);
    const attackCost = Math.max(0, Number(attacker.card?.attackCost ?? 0) - attackReduction);

    if ((playerState.pe || 0) < attackCost) return;

    const enemyBench = match.board[zones.enemyBench];
    if (!Array.isArray(enemyBench)) return;
    if (enemyBench.length > 0) return;

    const enemyPlayer = match.players.find(p => p.socketId !== socket.id);
    if (!enemyPlayer) return;

    enemyPlayer.life = Math.max(0, (enemyPlayer.life || 0) - 1);

    playerState.pe -= attackCost;
    registerAction(attacker.card, "attack");

    emitMatchUpdate(match);
  });

  socket.on("disconnect", () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);

    Object.keys(matches).forEach(matchId => {
      const match = matches[matchId];
      if (!match) return;

      const playerInMatch = match.players.find(p => p.socketId === socket.id);
      if (!playerInMatch) return;

      const opponent = match.players.find(p => p.socketId !== socket.id);

      if (opponent) {
        io.to(opponent.socketId).emit("opponent_left", {
          matchId,
          message: "O adversário desconectou."
        });
      }

      delete matches[matchId];
    });
  });
});

server.listen(PORT, () => {
  console.log("Servidor com SOCKET rodando na porta " + PORT);
});