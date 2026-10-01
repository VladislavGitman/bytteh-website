import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { collection, getDocs, getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const database = getFirestore(app);
const requiredTextFields = ['brand', 'model', 'category', 'description'];

const readNonNegativeNumber = (value, field, documentId) => {
	const number = typeof value === 'number'
		? value
		: typeof value === 'string' && value.trim()
			? Number(value)
			: NaN;
	if (!Number.isFinite(number) || number < 0) {
		throw new Error(`Product ${documentId} has an invalid ${field} field.`);
	}
	return number;
};

const readProduct = (documentSnapshot) => {
	const data = documentSnapshot.data();
	for (const field of requiredTextFields) {
		if (typeof data[field] !== 'string' || !data[field].trim()) {
			throw new Error(`Product ${documentSnapshot.id} has an invalid ${field} field.`);
		}
	}
	const price = readNonNegativeNumber(data.price, 'price', documentSnapshot.id);
	const stock = readNonNegativeNumber(data.stock, 'stock', documentSnapshot.id);
	if (!Number.isInteger(stock)) {
		throw new Error(`Product ${documentSnapshot.id} has an invalid stock field.`);
	}
	if (data.image !== undefined && typeof data.image !== 'string') {
		throw new Error(`Product ${documentSnapshot.id} has an invalid image field.`);
	}

	return {
		brand: data.brand.trim(),
		model: data.model.trim(),
		category: data.category.trim(),
		description: data.description.trim(),
		price,
		stock,
		image: data.image?.trim() || ''
	};
};

try {
	const snapshot = await getDocs(collection(database, 'products'));
	const products = snapshot.docs.map(readProduct);
	document.dispatchEvent(new CustomEvent('catalog-loaded', {detail: products}));
} catch (error) {
	console.error('Could not load product catalog from Firestore:', error);
	document.dispatchEvent(new CustomEvent('catalog-load-error'));
}
