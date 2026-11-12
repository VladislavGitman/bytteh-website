import test from "node:test";
import assert from "node:assert/strict";
import { handleApi, matchesProduct, validProduct, validateCriteria } from "../server/shared.mjs";

const base = {
	brand: "Miele", model: "G 7100 SC", category: "Посудомоечные машины", description: "Тихая модель",
	publicationStatus: "published", availabilityStatus: "in_stock", price: 25000, stock: 1,
	dimensionsMm: { width: 600, height: 845, depth: 570 }, features: ["тихая", "автоматическая программа"]
};

test("only explicitly published products with consistent availability are public", () => {
	assert.equal(validProduct("a", base).id, "a");
	assert.equal(validProduct("b", { ...base, publicationStatus: "draft" }), null);
	assert.equal(validProduct("c", { ...base, availabilityStatus: "unknown" }), null);
	assert.equal(validProduct("d", { ...base, stock: 0 }), null);
	assert.equal(validProduct("e", { ...base, availabilityStatus: "confirm", stock: 0 }).availabilityStatus, "confirm");
	assert.equal(validProduct("f", { ...base, price: undefined }), null);
});

test("server match filters enforce category, brand, budget, dimensions, and features", () => {
	const product = validProduct("a", base);
	assert.equal(matchesProduct(product, { category: "посудомоечная", brand: "Miele", maxPrice: 26000 }), true);
	assert.equal(matchesProduct(product, { maxPrice: 24000 }), false);
	assert.equal(matchesProduct(product, { dimensionsMm: { width: 590 } }), false);
	assert.equal(matchesProduct(product, { features: ["тихая", "wifi"] }), false);
	assert.equal(matchesProduct(validProduct("b", { ...base, dimensionsMm: undefined }), { dimensionsMm: { width: 600 } }), false);
});

test("criteria are bounded and reject invalid dimensions", () => {
	assert.deepEqual(validateCriteria({ maxPrice: 30000, dimensionsMm: { width: 600 }, features: ["NoFrost"] }), {
		maxPrice: 30000, dimensionsMm: { width: 600 }, features: ["NoFrost"]
	});
	assert.throws(() => validateCriteria({ dimensionsMm: { width: -1 } }));
	assert.throws(() => validateCriteria({ features: Array(9).fill("x") }));
});

test("catalog API fails closed without Firestore server credentials", async () => {
	const response = await handleApi(new Request("https://site.example/api/catalog"), {});
	assert.equal(response.status, 503);
	assert.match((await response.json()).error, /недоступен/i);
});

test("CORS rejects an unlisted origin and allows same-origin public config", async () => {
	const denied = await handleApi(new Request("https://site.example/api/config", { headers: { Origin: "https://untrusted.example" } }), {});
	assert.equal(denied.status, 403);
	const allowed = await handleApi(new Request("https://site.example/api/config", { headers: { Origin: "https://site.example" } }), {});
	assert.equal(allowed.status, 200);
	assert.equal((await allowed.json()).turnstileSiteKey, "");
});

test("chat POST fails closed when the rate limiter is not configured", async () => {
	const response = await handleApi(new Request("https://site.example/api/chat", {
		method: "POST", headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ messages: [{ role: "user", content: "Найди холодильник" }], turnstileToken: "fake" })
	}), {}, { ip: "203.0.113.1" });
	assert.equal(response.status, 503);
	assert.match((await response.json()).error, /не настроен/i);
});
