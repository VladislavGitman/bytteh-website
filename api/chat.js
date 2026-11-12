module.exports = async function handler(req, res) {
	const { handleApi } = await import("../server/shared.mjs");
	const request = new Request(new URL(req.url, `https://${req.headers.host || "localhost"}`), { method: req.method, headers: { "Content-Type": "application/json", Origin: req.headers.origin || "" }, body: ["GET", "HEAD", "OPTIONS"].includes(req.method) ? undefined : JSON.stringify(req.body || {}) });
	const response = await handleApi(request, process.env, { ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown" });
	response.headers.forEach((value, key) => res.setHeader(key, value));
	res.statusCode = response.status;
	res.end(await response.text());
};
