try {
	const response = await fetch(`/api/catalog${window.BYTTEH_I18N?.locale === "ro" ? "?lang=ro" : ""}`, { cache: "no-store" });
	if (!response.ok) throw new Error("Catalog unavailable");
	const payload = await response.json();
	if (!Array.isArray(payload.products)) throw new Error("Invalid catalog response");
	document.dispatchEvent(new CustomEvent("catalog-loaded", { detail: payload.products }));
} catch {
	document.dispatchEvent(new CustomEvent("catalog-load-error"));
}
