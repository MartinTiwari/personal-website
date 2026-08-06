#!/usr/bin/env node
/**
 * Creates the guestbook table in Supabase, end to end. Run it once:
 *
 *   node scripts/setup-guestbook.mjs
 *
 * It reads .env.local from the project root (already gitignored), so your
 * keys stay on your machine and never land in the repo or in a chat log.
 * Put this in .env.local first:
 *
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 *   SUPABASE_DB_PASSWORD=your-db-password
 *
 * URL + service role key: Supabase dashboard > Project Settings > API.
 * DB password: Project Settings > Database.
 * Environment variables already set in your shell win over the file.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
const run = promisify(execFile);

// .env.local -> process.env, without pulling in a dependency
for (const file of [".env.local", ".env"]) {
  try {
    for (const raw of readFileSync(new URL(`../${file}`, import.meta.url), "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch { /* no such file, that's fine */ }
}

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_PASS = process.env.SUPABASE_DB_PASSWORD;

const SQL = `
create table if not exists public.guestbook (
  id         bigint generated always as identity primary key,
  text       text not null check (char_length(text) between 1 and 280),
  bucket     text,
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists guestbook_visible_idx
  on public.guestbook (created_at desc) where hidden = false;
create index if not exists guestbook_bucket_idx on public.guestbook (bucket);

-- the browser never talks to Supabase directly; /api/notes holds the
-- service key. RLS on with no policies = anon and authenticated get nothing.
alter table public.guestbook enable row level security;
revoke all on public.guestbook from anon, authenticated;
`.trim();

function die(msg) {
  console.error(`\n  ${msg}\n`);
  process.exit(1);
}

if (!URL_BASE || !KEY) {
  die(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n\n" +
    "  Create a file called .env.local next to index.html containing:\n\n" +
    "    SUPABASE_URL=https://xxxx.supabase.co\n" +
    "    SUPABASE_SERVICE_ROLE_KEY=eyJ...\n" +
    "    SUPABASE_DB_PASSWORD=your-db-password\n\n" +
    "  Both keys: Supabase dashboard > Project Settings > API.\n" +
    "  DB password: Project Settings > Database.\n" +
    "  .env.local is already gitignored, so it stays on your machine."
  );
}

const ref = new URL(URL_BASE).hostname.split(".")[0];
console.log(`\n  project: ${ref}`);

// 1. Is the table already there? A HEAD against PostgREST answers without psql.
const probe = await fetch(`${URL_BASE}/rest/v1/guestbook?select=id&limit=1`, {
  method: "HEAD",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

if (probe.ok) {
  console.log("  guestbook table: already exists, nothing to create.");
} else {
  console.log("  guestbook table: missing, creating it now.");
  if (!DB_PASS) {
    console.log("\n  No SUPABASE_DB_PASSWORD set, so I can't run the SQL for you.");
    console.log("  Paste this into the Supabase SQL editor instead:\n");
    console.log(SQL.split("\n").map(l => "    " + l).join("\n"));
    console.log("");
    process.exit(2);
  }
  const conn = `postgresql://postgres.${ref}:${encodeURIComponent(DB_PASS)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
  try {
    await run("psql", [conn, "-v", "ON_ERROR_STOP=1", "-c", SQL]);
    console.log("  guestbook table: created.");
  } catch (e) {
    console.log("\n  psql failed (is it installed and is the pooler region right?).");
    console.log("  Paste this into the Supabase SQL editor instead:\n");
    console.log(SQL.split("\n").map(l => "    " + l).join("\n"));
    console.log(`\n  psql said: ${String(e.stderr || e.message).trim().split("\n")[0]}\n`);
    process.exit(2);
  }
}

// 2. Prove the round trip works before declaring victory.
const marker = `setup check ${Date.now()}`;
const w = await fetch(`${URL_BASE}/rest/v1/guestbook`, {
  method: "POST",
  headers: {
    apikey: KEY, Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json", Prefer: "return=representation",
  },
  body: JSON.stringify({ text: marker, hidden: true }),
});
if (!w.ok) die(`Write test failed (${w.status}). Check the service role key.`);
const [row] = await w.json();

await fetch(`${URL_BASE}/rest/v1/guestbook?id=eq.${row.id}`, {
  method: "DELETE",
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

console.log("  read/write test: passed.");
console.log(`
  Done. Last step, set these two in Vercel (Project > Settings > Environment Variables):

    SUPABASE_URL=${URL_BASE}
    SUPABASE_SERVICE_ROLE_KEY=<the same service role key you just used>

  Then redeploy. The wall reads from /api/notes on load and writes on submit.
  To hide a note later:  update public.guestbook set hidden = true where id = <id>;
`);
