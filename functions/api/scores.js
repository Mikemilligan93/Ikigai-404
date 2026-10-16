// Cloudflare Pages Function — leaderboard API.
// Needs a KV namespace bound as LEADERBOARD (Pages project → Settings → Functions → KV bindings).
//   GET  /api/scores  → { scores: [...] }
//   POST /api/scores  { name, score, outcome, seconds } → { scores: [...] }
// Basic checks only (internal event): name sanitised, score range-limited, simple per-IP rate limit.

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
  if (!Number.isFinite(seconds) || seconds < 5) return json({ error: 'bad time' }, 400);

  // naive rate limit: one submission per IP per 60 s (KV's minimum TTL)
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rlKey = 'rl:' + ip;
  if (await env.LEADERBOARD.get(rlKey)) return json({ error: 'slow down' }, 429);
  await env.LEADERBOARD.put(rlKey, '1', { expirationTtl: 60 });

  const scores = await load(env);
  scores.push({ name, score: Math.round(score), outcome, seconds: Math.round(seconds), at: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, KEEP);
  await env.LEADERBOARD.put(KEY, JSON.stringify(top));
  return json({ scores: top });
}
