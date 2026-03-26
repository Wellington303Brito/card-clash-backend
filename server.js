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

  if (cards.length === 0) return null;

  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
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
    console.log("Entrou em /register");
    console.log("Body recebido:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    console.log("Verificando usuário existente...");

    const [existingUsers] = await db.query(
      "SELECT * FROM players WHERE email = ? OR username = ?",
      [email, username]
    );

    console.log("Resultado verificação:", existingUsers);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Usuário ou email já existe." });
    }

    console.log("Criptografando senha...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Inserindo no banco...");
    const [result] = await db.query(
      "INSERT INTO players (username, email, password, coins, rolls) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, 0, 40]
    );

    console.log("Usuário criado com sucesso:", result);

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      token,
      player: {
        id: result.insertId,
        username,
        email,
        coins: 0,
        rolls: 40
      }
    });
  } catch (error) {
    console.error("Erro real no /register:", error);
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
    window.location.href = "index.html";

    const token = generateToken(playerData);

    res.json({
      message: "Login realizado com sucesso!",
      player: playerData,
      token
    });
  } catch (error) {
    console.error("Erro no /login:", error);
    res.status(500).json({
      error: "Erro no login.",
      details: error.message
    });
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
    console.error("Erro no /me:", error);
    res.status(500).json({
      error: "Erro ao buscar jogador.",
      details: error.message
    });
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

app.post("/roll", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const getPlayerSql = "SELECT rolls FROM players WHERE id = ?";
    const [playerResults] = await db.query(getPlayerSql, [playerId]);

    if (playerResults.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    const currentRolls = playerResults[0].rolls;

    if (currentRolls <= 0) {
      return res.status(400).json({ error: "Você não tem mais rolls." });
    }

    const rolledRarity = rollRarity();
    const card = getRandomCardByRarity(rolledRarity);

    if (!card) {
      return res.status(500).json({ error: "Nenhuma carta encontrada para essa raridade." });
    }

    const insertCardSql = `
      INSERT INTO player_cards (player_id, card_id, quantity)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
    `;

    await db.query(insertCardSql, [playerId, card.id]);

    const updateRollsSql = "UPDATE players SET rolls = rolls - 1 WHERE id = ?";
    await db.query(updateRollsSql, [playerId]);

    res.json({
      message: "Roll realizado com sucesso!",
      card,
      remainingRolls: currentRolls - 1
    });
  } catch (error) {
    console.error("Erro em /roll:", error);
    res.status(500).json({ error: "Erro ao realizar roll." });
  }
});

app.post("/roll/10", authenticateToken, async (req, res) => {
  try {
    const playerId = req.player.id;

    const getPlayerSql = "SELECT rolls FROM players WHERE id = ?";
    const [playerResults] = await db.query(getPlayerSql, [playerId]);

    if (playerResults.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    const currentRolls = playerResults[0].rolls;

    if (currentRolls <= 0) {
      return res.status(400).json({ error: "Você não tem mais rolls." });
    }

    const amountToRoll = Math.min(10, currentRolls);
    const rolledCards = [];

    for (let i = 0; i < amountToRoll; i++) {
      const rolledRarity = rollRarity();
      const card = getRandomCardByRarity(rolledRarity);

      if (!card) {
        return res.status(500).json({ error: "Nenhuma carta encontrada para essa raridade." });
      }

      rolledCards.push(card);
    }

    const groupedCards = {};

    rolledCards.forEach(card => {
      if (!groupedCards[card.id]) {
        groupedCards[card.id] = 0;
      }
      groupedCards[card.id] += 1;
    });

    for (const [cardId, quantity] of Object.entries(groupedCards)) {
      const insertSql = `
        INSERT INTO player_cards (player_id, card_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `;
      await db.query(insertSql, [playerId, cardId, quantity]);
    }

    const updateRollsSql = "UPDATE players SET rolls = rolls - ? WHERE id = ?";
    await db.query(updateRollsSql, [amountToRoll, playerId]);

    res.json({
      message: `${amountToRoll} rolls realizados com sucesso!`,
      cards: rolledCards,
      usedRolls: amountToRoll,
      remainingRolls: currentRolls - amountToRoll
    });
  } catch (error) {
    console.error("Erro em /roll/10:", error);
    res.status(500).json({ error: "Erro ao realizar 10 rolls." });
  }
});

app.get("/cards", (req, res) => {
  res.json({
    cards: Object.values(CARD_DB)
  });
});

app.post("/decks", authenticateToken, async (req, res) => {
  try {
    const player_id = req.player.id;
    const { name, cards } = req.body;

    if (!player_id || !name || !Array.isArray(cards)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const sqlDeck = "INSERT INTO decks (player_id, name) VALUES (?, ?)";
    const [result] = await db.query(sqlDeck, [player_id, name]);

    const deckId = result.insertId;

    if (cards.length === 0) {
      return res.json({ message: "Deck vazio salvo com sucesso!", deckId });
    }

    const values = cards.map((card) => [deckId, card.card_name, card.quantity]);

    const sqlCards = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

    await db.query(sqlCards, [values]);

    res.json({ message: "Deck salvo com sucesso!", deckId });
  } catch (error) {
    console.error("Erro em /decks:", error);
    res.status(500).json({ error: "Erro ao criar deck." });
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

    const values = cards.map((card) => [deckId, card.card_name, card.quantity]);
    const insertCardsSql = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

    await db.query(insertCardsSql, [values]);

    res.json({ message: "Deck atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro em PUT /decks/:deckId:", error);
    res.status(500).json({ error: "Erro ao atualizar deck." });
  }
});

app.put("/decks/:deckId", (req, res) => {
  const { deckId } = req.params;
  const { name, cards } = req.body;

  if (!name || !Array.isArray(cards)) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const updateDeckSql = "UPDATE decks SET name = ? WHERE id = ?";

  db.query(updateDeckSql, [name, deckId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao atualizar deck." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    const deleteCardsSql = "DELETE FROM deck_cards WHERE deck_id = ?";

    db.query(deleteCardsSql, [deckId], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Erro ao limpar cartas antigas." });
      }

      if (cards.length === 0) {
        return res.json({ message: "Deck atualizado com sucesso!" });
      }

      const values = cards.map((card) => [deckId, card.card_name, card.quantity]);

      const insertCardsSql = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

      db.query(insertCardsSql, [values], (err3) => {
        if (err3) {
          console.error(err3);
          return res.status(500).json({ error: "Erro ao salvar novas cartas." });
        }

        res.json({ message: "Deck atualizado com sucesso!" });
      });
    });
  });
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});