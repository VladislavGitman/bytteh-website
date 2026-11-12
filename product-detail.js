const status = document.querySelector("#product-status");
const detail = document.querySelector("#product-detail");
const locale = window.BYTTEH_I18N.locale;
const tr = window.BYTTEH_I18N.t;
const productId = new URLSearchParams(window.location.search).get("id")?.trim();

const showError = (message) => {
	status.replaceChildren(document.createTextNode(message + " "));
	const link = document.createElement("a");
	link.href = "./index.html#catalog";
	link.textContent = tr("Вернуться в каталог");
	status.append(link);
	status.hidden = false;
	detail.hidden = true;
};

const availabilityText = (product) => {
	if (product.availabilityStatus === "in_stock") return locale === "ro" ? `În stoc: ${product.stock} ${product.stock === 1 ? "bucată" : "bucăți"}` : `В наличии: ${product.stock} ${product.stock === 1 ? "единица" : "единиц"}`;
	if (product.availabilityStatus === "on_order") return tr("Под заказ · срок уточните у консультанта");
	return tr("Наличие уточняется");
};

try {
	if (!productId || productId.length > 150) throw new Error("Этот товар не найден в каталоге.");
	const response = await fetch(`/api/catalog?id=${encodeURIComponent(productId)}${locale === "ro" ? "&lang=ro" : ""}`, { cache: "no-store" });
	const payload = await response.json().catch(() => ({}));
	if (!response.ok || !payload.product) throw new Error(response.status === 404 ? "Этот товар не найден в каталоге." : "Не удалось загрузить товар.");
	const data = payload.product;
	const title = data.model === data.brand ? data.brand : `${data.brand} ${data.model}`;
	document.title = `${title} | BYTTEHMD`;
	document.querySelector("#breadcrumb-product").textContent = title;
	document.querySelector("#product-category").textContent = locale === "ro" ? data.categoryRo || data.category : data.category;
	document.querySelector("#product-title").textContent = title;
	document.querySelector("#product-description").textContent = (locale === "ro" ? data.descriptionRo || data.description : data.description) || tr("Уточните характеристики у консультанта.");
	document.querySelector("#product-brand").textContent = data.brand;
	document.querySelector("#product-stock").textContent = availabilityText(data);
	document.querySelector("#product-stock").classList.toggle("product-stock-unavailable", data.availabilityStatus !== "in_stock");
	document.querySelector("#product-price").textContent = `${window.BYTTEH_I18N.number(data.price)} MDL`;
	const image = document.querySelector("#product-image");
	const placeholder = document.querySelector("#product-image-placeholder");
	if (data.image) { image.src = data.image; image.alt = title; image.hidden = false; image.addEventListener("error", () => { image.hidden = true; placeholder.hidden = false; }, { once: true }); }
	else placeholder.hidden = false;
	const request = data.availabilityStatus === "in_stock" ? title : locale === "ro" ? `Verificați disponibilitatea: ${title}` : `Уточнить наличие: ${title}`;
	const orderUrl = new URL(locale === "ro" ? "/ro" : "/ru", window.location.origin);
	orderUrl.searchParams.set("request", request);
	orderUrl.hash = "contacts";
	const orderLink = document.querySelector("#product-order");
	orderLink.href = orderUrl.href;
	orderLink.textContent = data.availabilityStatus === "in_stock" ? tr("Заказать") : tr("Уточнить условия");
	document.querySelectorAll(".nav-links a").forEach((link) => { link.href = `${locale === "ro" ? "/ro" : "/ru"}${link.hash}`; });
	status.hidden = true;
	detail.hidden = false;
} catch (error) {
	showError(tr(error instanceof Error && error.message === "Этот товар не найден в каталоге." ? error.message : "Не удалось загрузить товар. Попробуйте открыть каталог позже."));
}
