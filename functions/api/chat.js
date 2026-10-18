const SYSTEM_PROMPT = [
  "Ты — ИИ-консультант BYTTEHMD, магазина обслуженной бытовой техники в Молдове.",
  "Отвечай по-русски, кратко и доброжелательно. Помогай выбрать технику и объясняй общие характеристики.",
  "Не придумывай текущие цены, наличие, состояние конкретного товара, сроки доставки или условия гарантии: у тебя нет доступа к актуальному каталогу.",
  "Для проверки товара предложи открыть каталог или позвонить по номеру +373 (79) 503-566.",
  "Если вопрос не связан с техникой, вежливо верни разговор к помощи с бытовой техникой."
].join(" ");

const MAX_BODY_BYTES = 48_000;

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function allowedOrigin(origin, requestUrl, configuredOrigins) {
  if (!origin) return true;
  if (origin === new URL(requestUrl).origin) return true;
  const allowed = (configuredOrigins || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin) || origin === "https://vladislavgitman.github.io"
    || origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000";
}

export async function onRequest({ request, env }) {
  const origin = request.headers.get("Origin");
  const corsHeaders = { Vary: "Origin" };

  if (!allowedOrigin(origin, request.url, env.CHAT_ALLOWED_ORIGINS)) {
    return json({ error: "Этот источник не разрешён." }, 403, corsHeaders);
  }
  if (origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    corsHeaders["Access-Control-Allow-Headers"] = "Content-Type";
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return json({ error: "Используйте POST." }, 405, {
      ...corsHeaders,
      Allow: "POST, OPTIONS"
    });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return json({ error: "Сообщение слишком большое." }, 413, corsHeaders);
  }

  let body;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Некорректный запрос." }, 400, corsHeaders);
    const chunks = [];
    let bodyBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bodyBytes += value.byteLength;
      if (bodyBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return json({ error: "Сообщение слишком большое." }, 413, corsHeaders);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(bodyBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const raw = new TextDecoder().decode(bytes);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Не удалось прочитать запрос." }, 400, corsHeaders);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return json({ error: "Некорректный запрос." }, 400, corsHeaders);
  }
  const incoming = body.messages;
  if (!Array.isArray(incoming) || incoming.length < 1 || incoming.length > 12) {
    return json({ error: "Некорректная история диалога." }, 400, corsHeaders);
  }

  const messages = [];
  for (const message of incoming) {
    if (!message || !["user", "assistant"].includes(message.role)
      || typeof message.content !== "string"
      || message.content.trim().length === 0
      || message.content.length > 3500) {
      return json({ error: "Проверьте текст сообщения." }, 400, corsHeaders);
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }
  if (messages[messages.length - 1].role !== "user") {
    return json({ error: "Добавьте вопрос перед отправкой." }, 400, corsHeaders);
  }

  const keys = (env.OPENROUTER_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  if (keys.length === 0) {
    return json({ error: "ИИ-помощник пока не настроен." }, 503, corsHeaders);
  }

  const startIndex = Math.floor(Math.random() * keys.length);
  let lastStatus = 502;
  for (let attempt = 0; attempt < keys.length; attempt += 1) {
    const key = keys[(startIndex + attempt) % keys.length];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Title": "BYTTEHMD AI assistant"
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL || "openrouter/auto",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          max_tokens: 700,
          temperature: 0.4
        }),
        signal: controller.signal
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;
        if (![401, 403, 429].includes(upstream.status) && upstream.status < 500) break;
        continue;
      }

      const payload = await upstream.json();
      const reply = payload?.choices?.[0]?.message?.content;
      if (typeof reply === "string" && reply.trim()) {
        return json({ reply: reply.trim() }, 200, corsHeaders);
      }
      lastStatus = 502;
    } catch {
      lastStatus = 502;
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error("OpenRouter request failed after trying configured keys; status:", lastStatus);
  return json({
    error: "ИИ-помощник временно недоступен. Попробуйте ещё раз позже."
  }, 502, corsHeaders);
}

