const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const CARD_DB = require("./cards-db");
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
  res.send("Servidor funcionando!");
});

// cadastro
app.post("/register", async (req, res) => {
  let { username, email, password } = req.body;

  username = normalizeUsername(username);
  email = normalizeEmail(email);
  password = String(password || "").trim();

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Email inválido." });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: "O usuário deve ter pelo menos 3 caracteres." });
  }

  if (username.length > 20) {
    return res.status(400).json({ error: "O usuário pode ter no máximo 20 caracteres." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }

  const checkSql = "SELECT id, username, email FROM players WHERE email = ? OR username = ?";

  db.query(checkSql, [email, username], async (checkErr, checkResults) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).json({ error: "Erro ao verificar usuário." });
    }

    if (checkResults.length > 0) {
      const existing = checkResults[0];

      if (existing.email === email) {
        return res.status(400).json({ error: "Esse email já está em uso." });
      }

      if (existing.username === username) {
        return res.status(400).json({ error: "Esse nome de usuário já está em uso." });
      }
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = "INSERT INTO players (username, email, password) VALUES (?, ?, ?)";

      db.query(insertSql, [username, email, hashedPassword], (insertErr, result) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({ error: "Erro ao cadastrar." });
        }

        const newPlayer = {
          id: result.insertId,
          username,
          email,
          coins: 0,
          rolls: 40
        };

        const token = generateToken(newPlayer);

        res.json({
          message: "Cadastro feito com sucesso!",
          player: newPlayer,
          token
        });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno." });
    }
  });
});

// login
app.post("/login", (req, res) => {
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

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro no servidor." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const player = results[0];

    try {
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
      console.error(error);
      res.status(500).json({ error: "Erro interno." });
    }
  });
});

app.get("/me", authenticateToken, (req, res) => {
  const sql = "SELECT id, username, email, coins, rolls FROM players WHERE id = ?";

  db.query(sql, [req.player.id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar jogador." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Jogador não encontrado." });
    }

    res.json({
      message: "Usuário autenticado",
      player: results[0]
    });
  });
});

app.get("/collection", authenticateToken, (req, res) => {
  const playerId = req.player.id;

  const sql = `
    SELECT card_id, quantity
    FROM player_cards
    WHERE player_id = ?
    ORDER BY card_id ASC
  `;

  db.query(sql, [playerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar coleção." });
    }

    res.json({
      playerId,
      cards: results
    });
  });
});

app.get("/collection/full", authenticateToken, (req, res) => {
  const playerId = req.player.id;

  const sql = `
    SELECT card_id, quantity
    FROM player_cards
    WHERE player_id = ?
  `;

  db.query(sql, [playerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar coleção." });
    }

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
  });
});

app.post("/collection/add", authenticateToken, (req, res) => {
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

  db.query(sql, [playerId, card_id, qty], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao adicionar carta." });
    }

    res.json({
      message: "Carta adicionada com sucesso!",
      card_id,
      quantity: qty
    });
  });
});

app.post("/roll", authenticateToken, (req, res) => {
  const playerId = req.player.id;

  const getPlayerSql = "SELECT rolls FROM players WHERE id = ?";

  db.query(getPlayerSql, [playerId], (playerErr, playerResults) => {
    if (playerErr) {
      console.error(playerErr);
      return res.status(500).json({ error: "Erro ao buscar rolls do jogador." });
    }

    console.log("RESULTADO PLAYER:", playerResults);

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

    db.query(insertCardSql, [playerId, card.id], (cardErr) => {
      if (cardErr) {
        console.error(cardErr);
        return res.status(500).json({ error: "Erro ao salvar carta sorteada." });
      }

      const updateRollsSql = "UPDATE players SET rolls = rolls - 1 WHERE id = ?";

      db.query(updateRollsSql, [playerId], (rollErr) => {
        if (rollErr) {
          console.error(rollErr);
          return res.status(500).json({ error: "Erro ao atualizar rolls." });
        }

        res.json({
          message: "Roll realizado com sucesso!",
          card,
          remainingRolls: currentRolls - 1
        });
      });
    });
  });
});

app.post("/roll/10", authenticateToken, (req, res) => {
  console.log("=== ENTROU NA /roll/10 ===");
  console.log("PLAYER ID:", req.player.id);
  const playerId = req.player.id;


  const getPlayerSql = "SELECT rolls FROM players WHERE id = ?";

  db.query(getPlayerSql, [playerId], (playerErr, playerResults) => {
    if (playerErr) {
      console.error(playerErr);
      return res.status(500).json({ error: "Erro ao buscar rolls do jogador." });
    }

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

    const values = Object.entries(groupedCards).map(([cardId, quantity]) => [
      playerId,
      cardId,
      quantity
    ]);

    const insertSql = `
      INSERT INTO player_cards (player_id, card_id, quantity)
      VALUES ?
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    console.log("ROLLED CARDS:", rolledCards);
    console.log("GROUPED VALUES:", values);

    db.query(insertSql, [values], (insertErr) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: "Erro ao salvar cartas sorteadas." });
      }

      const updateRollsSql = "UPDATE players SET rolls = rolls - ? WHERE id = ?";

      db.query(updateRollsSql, [amountToRoll, playerId], (rollErr) => {
        if (rollErr) {
          console.error(rollErr);
          return res.status(500).json({ error: "Erro ao atualizar rolls." });
        }

        res.json({
          message: `${amountToRoll} rolls realizados com sucesso!`,
          cards: rolledCards,
          usedRolls: amountToRoll,
          remainingRolls: currentRolls - amountToRoll
        });
      });
    });
  });
});

app.get("/cards", (req, res) => {
  res.json({
    cards: Object.values(CARD_DB)
  });
});

app.post("/decks", (req, res) => {
  const { player_id, name, cards } = req.body;

  if (!player_id || !name || !Array.isArray(cards)) {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const sqlDeck = "INSERT INTO decks (player_id, name) VALUES (?, ?)";

  db.query(sqlDeck, [player_id, name], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar deck." });
    }

    const deckId = result.insertId;

    if (cards.length === 0) {
      return res.json({ message: "Deck vazio salvo com sucesso!", deckId });
    }

    const values = cards.map((card) => [deckId, card.card_name, card.quantity]);

    const sqlCards = "INSERT INTO deck_cards (deck_id, card_name, quantity) VALUES ?";

    db.query(sqlCards, [values], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Erro ao salvar cartas." });
      }

      res.json({ message: "Deck salvo com sucesso!", deckId });
    });
  });
});

app.delete("/decks/:deckId", (req, res) => {
  const { deckId } = req.params;

  const sql = "DELETE FROM decks WHERE id = ?";

  db.query(sql, [deckId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao deletar deck." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Deck não encontrado." });
    }

    res.json({ message: "Deck deletado com sucesso!" });
  });
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