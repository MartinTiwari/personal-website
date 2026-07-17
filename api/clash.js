export default async function handler(req, res) {
  const tag = (process.env.CLASH_PLAYER_TAG || "CY9P2GV0").replace("#", "");
  const token = process.env.CLASH_API_TOKEN;
  if (!tag || !token) return res.status(503).json({ error: "not configured" });

  const r = await fetch(`https://proxy.royaleapi.dev/v1/players/%23${tag}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return res.status(502).json({ error: r.status });
  const p = await r.json();

  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
  res.status(200).json({
    trophies: p.trophies,
    best: p.bestTrophies,
    arena: p.arena && p.arena.name,
    wins: p.wins,
    losses: p.losses,
    card: p.currentFavouriteCard && p.currentFavouriteCard.name,
    level: p.expLevel,
    threeCrown: p.threeCrownWins,
    battles: p.battleCount,
  });
}
