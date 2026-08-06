// the public guestbook. GET returns the wall, POST pins one to it.
// service key stays server-side; the browser never sees it.
const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "guestbook";
const MAX_LEN = 280;
const WALL_SIZE = 60;

const sb = (path, init = {}) =>
  fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

export default async function handler(req, res) {
  if (!URL_BASE || !KEY) return res.status(503).json({ error: "not configured" });

  if (req.method === "GET") {
    const r = await sb(
      `${TABLE}?select=id,text,created_at&hidden=eq.false&order=created_at.desc&limit=${WALL_SIZE}`
    );
    if (!r.ok) {
      // surface what postgrest actually said: 401 = wrong key (anon instead of
      // service_role), 403 = missing grant, 404 = wrong url or table
      const detail = await r.text().catch(() => "");
      return res.status(502).json({
        error: "read failed",
        upstream: r.status,
        detail: detail.slice(0, 300),
      });
    }
    const rows = await r.json();
    // newest last, so the wall reads in the order people actually wrote
    res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=120");
    return res.status(200).json({ notes: rows.reverse() });
  }

  if (req.method === "POST") {
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    const text = String((body && body.text) || "").trim().slice(0, MAX_LEN);
    if (!text) return res.status(400).json({ error: "empty" });
    if (body && body.trap) return res.status(200).json({ ok: true }); // bots pin nothing

    // one coarse knob against floods: a per-IP-per-minute bucket, hashed so
    // nothing identifying is stored alongside an anonymous note
    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "0.0.0.0";
    const bucket = await sha(ip + "|" + new Date().toISOString().slice(0, 16));

    const recent = await sb(
      `${TABLE}?select=id&bucket=eq.${bucket}&limit=4`
    );
    if (recent.ok && (await recent.json()).length >= 4) {
      return res.status(429).json({ error: "slow down a little" });
    }

    const w = await sb(TABLE, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ text, bucket }),
    });
    if (!w.ok) return res.status(502).json({ error: "write failed" });
    const [row] = await w.json();
    return res.status(200).json({ ok: true, note: row });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method not allowed" });
}

async function sha(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}
