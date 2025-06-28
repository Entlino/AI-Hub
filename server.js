require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const axios = require("axios");
const db = require("./db");

// Validate environment variables
if (!process.env.ANTHROPIC_API_KEY || !process.env.CLAUDE_MODEL) {
  console.error(
    "Error: Missing required environment variables. Make sure ANTHROPIC_API_KEY and CLAUDE_MODEL are set in your .env file."
  );
  process.exit(1);
}

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("Registrierung fehlgeschlagen: leere Felder");
    return res.sendStatus(400);
  }
  const hash = await bcrypt.hash(password, 10);
  const success = await db.createUser(username, hash);
  success ? res.sendStatus(201) : res.sendStatus(409);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.getUser(username);
  if (user && (await bcrypt.compare(password, user.password_hash))) {
    req.session.userId = user.id;
    res.sendStatus(200);
  } else res.sendStatus(401);
});

// Chat
app.post("/chat", async (req, res) => {
  if (!req.session.userId) return res.sendStatus(401);
  const { message } = req.body;
  if (!message || message.length > 500) return res.sendStatus(400);

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: process.env.CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    const reply = response.data.content[0].text;
    await db.saveChat(req.session.userId, message, reply);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/chats", async (req, res) => {
  if (!req.session.userId) return res.sendStatus(401);
  const chats = await db.getChats(req.session.userId);
  res.json(chats);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.listen(3000, () => console.log("AI Hub läuft auf http://localhost:6666"));
