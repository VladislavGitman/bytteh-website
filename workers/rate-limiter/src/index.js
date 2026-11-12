export const LIMITS = {
	chat: [{ seconds: 600, count: 10 }, { seconds: 86400, count: 40 }],
	orders: [{ seconds: 600, count: 3 }, { seconds: 86400, count: 10 }]
};

export function allowedByLimits(events, now, rules) {
	let retryAfter = 0;
	for (const limit of rules) {
		const active = events.filter((createdAt) => createdAt > now - limit.seconds).sort((a, b) => a - b);
		if (active.length >= limit.count) retryAfter = Math.max(retryAfter, Math.max(1, active[active.length - limit.count] + limit.seconds - now));
	}
	return { allowed: retryAfter === 0, retryAfter };
}

export class RateLimiter {
	constructor(state, env) {
		this.state = state;
		this.env = env;
		this.state.blockConcurrencyWhile(async () => {
			this.state.storage.sql.exec("CREATE TABLE IF NOT EXISTS events (subject TEXT NOT NULL, kind TEXT NOT NULL, created_at INTEGER NOT NULL)");
			this.state.storage.sql.exec("CREATE INDEX IF NOT EXISTS events_lookup ON events(subject, kind, created_at)");
		});
	}

	async fetch(request) {
		if (request.method !== "POST") return Response.json({ error: "POST required" }, { status: 405 });
		if (this.env.RATE_LIMITER_TOKEN && request.headers.get("Authorization") !== `Bearer ${this.env.RATE_LIMITER_TOKEN}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
		let body;
		try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
		if (!/^[a-f0-9]{64}$/.test(body.subject || "") || !LIMITS[body.kind]) return Response.json({ error: "Invalid request" }, { status: 400 });
		const now = Math.floor(Date.now() / 1000);
		const rules = LIMITS[body.kind];
		this.state.storage.sql.exec("DELETE FROM events WHERE created_at < ?", now - 86400);
		const rows = this.state.storage.sql.exec("SELECT created_at FROM events WHERE subject = ? AND kind = ? AND created_at > ? ORDER BY created_at", body.subject, body.kind, now - 86400).toArray();
		const decision = allowedByLimits(rows.map((row) => Number(row.created_at)), now, rules);
		if (!decision.allowed) return Response.json(decision);
		this.state.storage.sql.exec("INSERT INTO events (subject, kind, created_at) VALUES (?, ?, ?)", body.subject, body.kind, now);
		return Response.json({ allowed: true });
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname !== "/consume") return new Response("Not found", { status: 404 });
		const id = env.RATE_LIMITER.idFromName("global-rate-limiter");
		return env.RATE_LIMITER.get(id).fetch(request);
	}
};
