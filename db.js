const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./bot.db");

db.run(`CREATE TABLE IF NOT EXISTS keywords (word TEXT, reply TEXT)`);
db.run(`CREATE TABLE IF NOT EXISTS logs (
  sender TEXT,
  message TEXT,
  timestamp TEXT,
  type TEXT,
  group_name TEXT
)`);
module.exports = {
  getReply: (text) => {
    return new Promise((resolve) => {
      db.get(
        `SELECT reply FROM keywords WHERE ? LIKE word`,
        [text],
        (err, row) => {
          resolve(row?.reply || null);
        }
      );
    });
  },
  // Log messages with type and optional group name
  logMessage: (sender, message, type = "عادي", groupName = null) => {
    const timestamp = new Date().toISOString();
    db.run(
      `INSERT INTO logs(sender, message, timestamp, type, group_name) VALUES (?, ?, ?, ?, ?)`,
      [sender, message, timestamp, type, groupName]
    );
  },

  getWhatsLinks: (days = null) => {
    return new Promise((resolve, reject) => {
      let query = `SELECT message, group_name, timestamp FROM logs WHERE message LIKE '%https://wa.me/%' OR message LIKE '%https://chat.whatsapp.com/%'`;

      if (days) {
        const since = new Date(
          Date.now() - days * 24 * 60 * 60 * 1000
        ).toISOString();
        query += ` AND timestamp >= '${since}'`;
      }

      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};
