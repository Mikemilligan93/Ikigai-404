// Leaderboard API (called from worker/index.js).
// Needs a KV namespace bound as LEADERBOARD (see wrangler.jsonc).
//   GET  /api/scores  → { scores: [...] }
//   POST /api/scores  { name, score, outcome, seconds } → { scores: [...] }
// Basic checks only (internal event): name sanitised, score range-limited.
// No per-IP rate limit: at the office everyone shares one IP, so it would block real players.

const KEY = 'top';
const KEEP = 100;
const MAX_SCORE = 100000;
const NAME_MAX = 16;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function load(env) {
  return (await env.LEADERBOARD.get(KEY, 'json')) || [];
}

export async function onRequestGet({ env }) {
  if (!env.LEADERBOARD) return json({ error: 'KV binding LEADERBOARD missing' }, 500);
  return json({ scores: await load(env) });
}

export async function onRequestPost({ request, env }) {
  if (!env.LEADERBOARD) return json({ error: 'KV binding LEADERBOARD missing' }, 500);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }

  const name = String(body.name || '').replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, NAME_MAX);
  const score = Number(body.score);
  const seconds = Number(body.seconds);
  const outcome = body.outcome === 'win' ? 'win' : 'burnout';
  if (!name) return json({ error: 'name required' }, 400);
  if (!Number.isFinite(score) || score < 0 || score > MAX_SCORE) return json({ error: 'bad score' }, 400);
  if (!Number.isFinite(seconds) || seconds < 0) return json({ error: 'bad time' }, 400);

  const scores = await load(env);
  scores.push({ name, score: Math.round(score), outcome, seconds: Math.round(seconds), at: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, KEEP);
  await env.LEADERBOARD.put(KEY, JSON.stringify(top));
  return json({ scores: top });
}
