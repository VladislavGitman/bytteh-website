import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { doc, getDoc, getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const status = document.querySelector('#product-status');
const detail = document.querySelector('#product-detail');
const productId = new URLSearchParams(window.location.search).get('id')?.trim();

const showError = (message) => {
	status.replaceChildren(document.createTextNode(message + ' '));
	const catalogLink = document.createElement('a');
	catalogLink.href = './index.html#catalog';
	catalogLink.textContent = 'Вернуться в каталог';
	status.append(catalogLink);
	status.hidden = false;
	detail.hidden = true;
};

const readNumber = (value) => {
	const number = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	return Number.isFinite(number) && number >= 0 ? number : null;
};

const stockText = (stock) => {
	if (stock === 0) return 'Нет в наличии · 0 ед.';
	if (stock === 1) return 'В наличии: 1 единица';
	if (stock >= 2 && stock <= 4) return `В наличии: ${stock} единицы`;
	return `В наличии: ${stock} единиц`;
};

try {
	if (!productId) throw new Error('Не указан товар.');
	const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	const snapshot = await getDoc(doc(getFirestore(app), 'products', productId));
	if (!snapshot.exists()) throw new Error('Этот товар не найден в каталоге.');

	const data = snapshot.data();
	const brand = typeof data.brand === 'string' ? data.brand.trim() : '';
	const category = typeof data.category === 'string' ? data.category.trim() : '';
	const model = typeof data.model === 'string' && data.model.trim() ? data.model.trim() : brand;
	const description = typeof data.description === 'string' && data.description.trim()
		? data.description.trim()
		: 'Уточните модель и характеристики у консультанта.';
	const price = readNumber(data.price);
	const stock = readNumber(data.stock);
	if (!brand || !category || !model || price === null || stock === null || !Number.isInteger(stock)) {
		throw new Error('В карточке товара не хватает данных.');
	}

	const title = model === brand ? brand : `${brand} ${model}`;
	document.title = `${title} | BYTTEHMD`;
	document.querySelector('#breadcrumb-product').textContent = title;
	document.querySelector('#product-category').textContent = category;
	document.querySelector('#product-title').textContent = title;
	document.querySelector('#product-description').textContent = description;
	document.querySelector('#product-brand').textContent = brand;
	document.querySelector('#product-stock').textContent = stockText(stock);
	document.querySelector('#product-stock').classList.toggle('product-stock-unavailable', stock === 0);
	document.querySelector('#product-price').textContent = `${new Intl.NumberFormat('ru-RU').format(price)} MDL`;

	const image = document.querySelector('#product-image');
	const placeholder = document.querySelector('#product-image-placeholder');
	const imagePath = typeof data.image === 'string' ? data.image.trim() : '';
	if (imagePath) {
		image.src = imagePath;
		image.alt = title;
		image.hidden = false;
		image.addEventListener('error', () => {
			image.hidden = true;
			placeholder.hidden = false;
		}, {once: true});
	} else {
		placeholder.hidden = false;
	}

	const request = stock > 0 ? title : `Уточнить наличие: ${title}`;
	const orderUrl = new URL('./index.html', window.location.href);
	orderUrl.searchParams.set('request', request);
	orderUrl.hash = 'contacts';
	const orderLink = document.querySelector('#product-order');
	orderLink.href = orderUrl.href;
	orderLink.textContent = stock > 0 ? 'Заказать' : 'Уточнить наличие';

	status.hidden = true;
	detail.hidden = false;
} catch (error) {
	console.error('Could not load product details:', error);
	const expectedErrors = ['Не указан товар.', 'Этот товар не найден в каталоге.', 'В карточке товара не хватает данных.'];
	const message = error instanceof Error && expectedErrors.includes(error.message)
		? error.message
		: 'Не удалось загрузить товар. Попробуйте открыть каталог позже.';
	showError(message);
}
