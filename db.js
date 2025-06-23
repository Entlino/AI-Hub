const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/chat.db");

db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  message TEXT,
  response TEXT
)`);

module.exports = {
  createUser: (username, hash) =>
    new Promise((res) => {
      db.run(
        `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
        [username, hash],
        (err) => res(!err)
      );
    }),
  getUser: (username) =>
    new Promise((res) => {
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) =>
        res(row)
      );
    }),
  saveChat: (userId, msg, resText) =>
    new Promise((res) => {
      db.run(
        `INSERT INTO chats (user_id, message, response) VALUES (?, ?, ?)`,
        [userId, msg, resText],
        (err) => res(!err)
      );
    }),
  getChats: (userId) =>
    new Promise((res) => {
      db.all(
        `SELECT * FROM chats WHERE user_id = ? ORDER BY timestamp DESC`,
        [userId],
        (err, rows) => res(rows)
      );
    }),
};
