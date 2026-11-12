module.exports = async function handler(req, res) {
	const { handleApi } = await import("../server/shared.mjs");
	const request = new Request(new URL(req.url, `https://${req.headers.host || "localhost"}`), { method: req.method, headers: { Origin: req.headers.origin || "" } });
	const response = await handleApi(request, process.env);
	response.headers.forEach((value, key) => res.setHeader(key, value));
	res.statusCode = response.status;
	res.end(await response.text());
};
