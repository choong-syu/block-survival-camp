const { randomUUID } = require("crypto");
const { sql } = require("@vercel/postgres");

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS game_saves (
      id TEXT PRIMARY KEY,
      player_name TEXT NOT NULL,
      save_name TEXT,
      display_name TEXT NOT NULL,
      saved_at TIMESTAMPTZ NOT NULL,
      difficulty_key TEXT,
      difficulty_name TEXT,
      day_count INTEGER DEFAULT 1,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS game_saves_player_saved_idx ON game_saves (player_name, saved_at DESC)`;
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function toPublicRecord(row, includeData = false) {
  const record = {
    id: row.id,
    playerName: row.player_name,
    saveName: row.save_name || "",
    displayName: row.display_name,
    savedAt: row.saved_at,
    difficultyKey: row.difficulty_key || "normal",
    difficultyName: row.difficulty_name || "개척",
    dayCount: row.day_count || 1,
  };
  if (includeData) record.data = row.data;
  return record;
}

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    await ensureTable();
    if (req.method === "GET") {
      const { id, playerName } = req.query || {};
      if (id) {
        const result = await sql`SELECT * FROM game_saves WHERE id = ${id} LIMIT 1`;
        if (!result.rows.length) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "save not found" }));
          return;
        }
        res.end(JSON.stringify({ record: toPublicRecord(result.rows[0], true) }));
        return;
      }
      const safeName = String(playerName || "").trim();
      if (!safeName) {
        res.end(JSON.stringify({ records: [] }));
        return;
      }
      const result = await sql`
        SELECT id, player_name, save_name, display_name, saved_at, difficulty_key, difficulty_name, day_count
        FROM game_saves
        WHERE player_name = ${safeName}
        ORDER BY saved_at DESC
        LIMIT 5
      `;
      res.end(JSON.stringify({ records: result.rows.map((row) => toPublicRecord(row)) }));
      return;
    }

    if (req.method === "POST") {
      const body = readBody(req);
      const data = body.data || {};
      const id = randomUUID();
      const playerName = String(body.playerName || data.playerName || "개척자").slice(0, 40);
      const saveName = String(body.saveName || "").slice(0, 80);
      const displayName = String(body.displayName || body.saveName || "저장 정보").slice(0, 120);
      const savedAt = body.savedAt || new Date().toISOString();
      const difficultyKey = data.difficultyKey || "normal";
      const difficultyName = difficultyKey === "easy" ? "평온" : difficultyKey === "hard" ? "악몽" : "개척";
      const dayCount = Number(data.dayCount || 1);
      await sql`
        INSERT INTO game_saves (
          id, player_name, save_name, display_name, saved_at, difficulty_key, difficulty_name, day_count, data
        )
        VALUES (
          ${id}, ${playerName}, ${saveName}, ${displayName}, ${savedAt}, ${difficultyKey}, ${difficultyName}, ${dayCount}, ${JSON.stringify(data)}::jsonb
        )
      `;
      res.statusCode = 201;
      res.end(JSON.stringify({
        record: {
          id,
          playerName,
          saveName,
          displayName,
          savedAt,
          difficultyKey,
          difficultyName,
          dayCount,
          data,
        },
      }));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: "method not allowed" }));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || "save api error" }));
  }
};
