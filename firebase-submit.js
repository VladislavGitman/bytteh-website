import { getTurnstileToken } from "./turnstile-client.js";

const form = document.querySelector("#request-form");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	const formData = new FormData(form);
	submitButton.disabled = true;
	status.textContent = "Отправляем заявку…";
	try {
		const turnstileToken = await getTurnstileToken("order");
		const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(formData.get("name") || "").trim(), phone: String(formData.get("phone") || "").trim(), request: String(formData.get("request") || "").trim(), turnstileToken }) });
		const payload = await response.json().catch(() => ({}));
		if (!response.ok) throw new Error(payload.error || "Не удалось отправить заявку.");
		form.reset();
		status.textContent = "Заявка отправлена. Мы свяжемся с вами.";
	} catch (error) {
		status.textContent = error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.";
	} finally { submitButton.disabled = false; }
});
