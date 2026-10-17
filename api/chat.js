const SYSTEM_PROMPT = [
  "Ты — ИИ-консультант BYTTEHMD, магазина обслуженной бытовой техники в Молдове.",
  "Отвечай по-русски, кратко и доброжелательно. Помогай выбрать технику и объясняй общие характеристики.",
  "Не придумывай текущие цены, наличие, состояние конкретного товара, сроки доставки или условия гарантии: у тебя нет доступа к актуальному каталогу.",
  "Для проверки товара предложи открыть каталог или позвонить по номеру +373 (79) 503-566.",
  "Если вопрос не связан с техникой, вежливо верни разговор к помощи с бытовой техникой."
].join(" ");

let rotationCursor = 0;

function corsAllowed(origin, host) {
  if (!origin) return true;
  const configured = (process.env.CHAT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const known = [
    "https://vladislavgitman.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...configured
  ];
  try {
    const parsed = new URL(origin);
    if (parsed.host.toLowerCase() === String(host || "").toLowerCase()) return true;
  } catch {}
  return known.includes(origin);
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Origin");

  const origin = req.headers.origin;
  if (!corsAllowed(origin, req.headers.host)) {
    return res.status(403).json({ error: "Этот источник не разрешён." });
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Используйте POST." });
  }

  const keys = (process.env.OPENROUTER_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  if (keys.length === 0) {
    return res.status(503).json({ error: "ИИ-помощник пока не настроен." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Не удалось прочитать запрос." });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "Некорректный запрос." });
  }
  if (Buffer.byteLength(JSON.stringify(body), "utf8") > 48000) {
    return res.status(413).json({ error: "Сообщение слишком большое." });
  }

  const incoming = body.messages;
  if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 12) {
    return res.status(400).json({ error: "Некорректная история диалога." });
  }
  const messages = [];
  for (const message of incoming) {
    if (!message || !["user", "assistant"].includes(message.role)
      || typeof message.content !== "string"
      || message.content.trim().length === 0
      || message.content.length > 3500) {
      return res.status(400).json({ error: "Проверьте текст сообщения." });
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }
  if (messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Добавьте вопрос перед отправкой." });
  }

  const startIndex = rotationCursor % keys.length;
  rotationCursor = (rotationCursor + 1) % keys.length;
  let lastStatus = 502;

  for (let attempt = 0; attempt < keys.length; attempt += 1) {
    const key = keys[(startIndex + attempt) % keys.length];
    try {
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          "X-Title": "BYTTEHMD AI assistant"
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || "openrouter/auto",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
          ],
          max_tokens: 700,
          temperature: 0.4
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;
        continue;
      }

      const payload = await upstream.json();
      const reply = payload?.choices?.[0]?.message?.content;
      if (typeof reply === "string" && reply.trim()) {
        return res.status(200).json({ reply: reply.trim() });
      }
      lastStatus = 502;
    } catch {
      lastStatus = 502;
    }
  }

  console.error("OpenRouter request failed after trying configured keys; last status:", lastStatus);
  return res.status(502).json({
    error: "ИИ-помощник временно недоступен. Попробуйте ещё раз позже."
  });
};
