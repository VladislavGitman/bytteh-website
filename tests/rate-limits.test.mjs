import test from "node:test";
import assert from "node:assert/strict";
import { allowedByLimits, LIMITS } from "../workers/rate-limiter/src/index.js";

test("chat and order rate policies match the published setup", () => {
	assert.deepEqual(LIMITS.chat, [{ seconds: 600, count: 10 }, { seconds: 86400, count: 40 }]);
	assert.deepEqual(LIMITS.orders, [{ seconds: 600, count: 3 }, { seconds: 86400, count: 10 }]);
});

test("rolling limiter denies the threshold request and releases after the window", () => {
	const now = 1_800_000_000;
	const rules = LIMITS.chat;
	const ten = Array(10).fill(now - 30);
	const denied = allowedByLimits(ten, now, rules);
	assert.equal(denied.allowed, false);
	assert.equal(denied.retryAfter, 570);
	assert.equal(allowedByLimits(ten, now + 601, rules).allowed, true);
	assert.equal(allowedByLimits(Array(40).fill(now - 100), now, rules).allowed, false);
});
