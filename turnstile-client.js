let siteKeyPromise;
let scriptPromise;
let widgetId;
const tr = (message) => window.BYTTEH_I18N?.t(message) || message;

async function siteKey() {
	if (!siteKeyPromise) siteKeyPromise = fetch("/api/config", { cache: "no-store" }).then(async (response) => {
		if (!response.ok) throw new Error(tr("Проверка запросов пока не настроена."));
		const config = await response.json();
		if (!config.turnstileSiteKey) throw new Error(tr("Проверка запросов пока не настроена."));
		return config.turnstileSiteKey;
	});
	return siteKeyPromise;
}

async function turnstile() {
	if (window.turnstile) return window.turnstile;
	if (!scriptPromise) scriptPromise = new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
		script.async = true;
		script.onload = () => resolve(window.turnstile);
		script.onerror = () => reject(new Error(tr("Не удалось открыть проверку запроса.")));
		document.head.append(script);
	});
	return scriptPromise;
}

export async function getTurnstileToken(action) {
	const [key, api] = await Promise.all([siteKey(), turnstile()]);
	const host = document.getElementById("turnstile-container");
	if (!host) throw new Error(tr("Проверка запроса недоступна."));
	if (widgetId !== undefined) api.remove(widgetId);
	host.replaceChildren();
	return new Promise((resolve, reject) => {
		widgetId = api.render(host, { sitekey: key, action, size: "invisible", callback: resolve, "error-callback": () => reject(new Error(tr("Проверка запроса не прошла. Повторите отправку."))), "expired-callback": () => reject(new Error(tr("Проверка истекла. Повторите отправку."))) });
		api.execute(widgetId);
	});
}
