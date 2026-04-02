const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const CARD_DB = require("./cards-db");
const cors = require("cors");
require("dotenv").config();

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

// cadastro
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

// login
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
    origin: "*"
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
  return {
    ...card,
    defense: card.defense ?? card.health ?? 0,
    rarity: card.rarity || card.raridade || "Básico",
    emoji: card.emoji || "🃏"
  };
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
    turn: match.turn,
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
    enemyHandCount: (match.hands[opponent.socketId] || []).length
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
        turn: p1.socketId,
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
        }
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
    if (match.turn !== socket.id) return;

    const playerState = match.players.find(p => p.socketId === socket.id);
    if (!playerState) return;

    const hand = match.hands[socket.id] || [];
    const card = hand[handIndex];
    if (!card) return;

    const map = getBoardMapForSocket(match, socket.id);
    const benchZone = map.ownBench;

    if (match.board[benchZone].length >= 6) return;

    const cost = Number(card.cost || 0);
    if ((playerState.pe || 0) < cost) return;

    playerState.pe -= cost;
    hand.splice(handIndex, 1);

    match.board[benchZone].push({
      owner: socket.id,
      card: sanitizeCard({
        ...card,
        summonedTurn: match.turnNumber
      })
    });

    emitMatchUpdate(match);
  });
  

  socket.on("end_turn", ({ matchId, playerId }) => {
    const match = matches[matchId];
    if (!match) return;

    const p1 = match.players[0];
    const p2 = match.players[1];
    const currentTurnSocket = match.turn;

    const currentPlayer =
      p1.player.id === playerId ? p1 : p2.player.id === playerId ? p2 : null;

    if (!currentPlayer) return;
    if (currentPlayer.socketId !== currentTurnSocket) return;

    const nextPlayer = currentTurnSocket === p1.socketId ? p2 : p1;

    match.turn = nextPlayer.socketId;
    match.turnNumber = (match.turnNumber || 1) + 1;

    nextPlayer.maxPE = Math.min(10, (nextPlayer.maxPE || 1) + 1);
    nextPlayer.pe = nextPlayer.maxPE;

    const nextDeck = match.decks[nextPlayer.socketId] || [];
    const nextHand = match.hands[nextPlayer.socketId] || [];

    if (nextDeck.length > 0 && nextHand.length < 10) {
      nextHand.push(nextDeck.pop());
    }

    emitMatchUpdate(match);
  });

  socket.on("move_card", ({ matchId, fromZone, fromIndex, toZone, playerId }) => {
  const match = matches[matchId];
  if (!match) return;

  if (match.turn !== socket.id) return;

  const playerState = match.players.find(p => p.player.id === playerId);
  if (!playerState) return;
  if (playerState.socketId !== socket.id) return;

  const zones = getPlayerZonesForSocket(match, socket.id);

  const allowedFrom = [zones.ownBench, zones.ownField];
  const allowedTo = [zones.ownBench, zones.ownField];

  if (!allowedFrom.includes(fromZone)) return;
  if (!allowedTo.includes(toZone)) return;
  if (!areAdjacent(fromZone, toZone)) return;

  const fromList = match.board[fromZone];
  const toList = match.board[toZone];

  if (!Array.isArray(fromList) || !Array.isArray(toList)) return;

  const unit = fromList[fromIndex];
  if (!unit) return;
  if (unit.owner !== socket.id) return;

  const zoneLimits = {
    bancoPlayer: 6,
    campo1: 4,
    campo2: 4,
    bancoEnemy: 6
  };

  if (toList.length >= zoneLimits[toZone]) return;

  fromList.splice(fromIndex, 1);
  toList.push(unit);

  emitMatchUpdate(match);
});

socket.on("attack_card", ({ matchId, fromZone, fromIndex, targetZone, targetIndex, playerId }) => {
  const match = matches[matchId];
  if (!match) return;

  if (match.turn !== socket.id) return;

  const playerState = match.players.find(p => p.player.id === playerId);
  if (!playerState) return;
  if (playerState.socketId !== socket.id) return;

  const zones = getPlayerZonesForSocket(match, socket.id);

  const allowedFrom = [zones.ownBench, zones.ownField];
  const allowedTargets = [zones.enemyField, zones.enemyBench];

  if (!allowedFrom.includes(fromZone)) return;
  if (!allowedTargets.includes(targetZone)) return;
  if (!areAdjacent(fromZone, targetZone)) return;

  const attacker = match.board[fromZone]?.[fromIndex];
  const defender = match.board[targetZone]?.[targetIndex];

  if (!attacker || !defender) return;
  if (attacker.owner !== socket.id) return;
  if (defender.owner === socket.id) return;

  const atk = Number(attacker.card?.attack || 0);
  const def = Number(defender.card?.defense || 0);

  defender.card.defense = def - atk;

  if (defender.card.defense <= 0) {
    match.board[targetZone].splice(targetIndex, 1);
  }

  emitMatchUpdate(match);
});

socket.on("direct_attack", ({ matchId, fromZone, fromIndex, playerId }) => {
  const match = matches[matchId];
  if (!match) return;

  if (match.turn !== socket.id) return;

  const playerState = match.players.find(p => p.player.id === playerId);
  if (!playerState) return;
  if (playerState.socketId !== socket.id) return;

  const zones = getPlayerZonesForSocket(match, socket.id);

  if (fromZone !== zones.ownField) return;

  const attacker = match.board[fromZone]?.[fromIndex];
  if (!attacker) return;
  if (attacker.owner !== socket.id) return;

  const enemyBench = match.board[zones.enemyBench];
  if (!Array.isArray(enemyBench)) return;
  if (enemyBench.length > 0) return;

  const enemyPlayer = match.players.find(p => p.socketId !== socket.id);
  if (!enemyPlayer) return;

  enemyPlayer.life = Math.max(0, (enemyPlayer.life || 0) - 1);

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