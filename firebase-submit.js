import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { addDoc, collection, getFirestore, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const form = document.querySelector('#request-form');
const status = document.querySelector('#form-status');
const submitButton = form.querySelector('button[type="submit"]');
const database = getFirestore(initializeApp(firebaseConfig));

form.addEventListener('submit', async (event) => {
	event.preventDefault();
	const formData = new FormData(form);
	submitButton.disabled = true;
	status.textContent = 'Отправляем заявку...';

	try {
		await addDoc(collection(database, 'orders'), {
			name: formData.get('name').trim(),
			phone: formData.get('phone').trim(),
			request: formData.get('request').trim(),
			createdAt: serverTimestamp()
		});
		form.reset();
		status.textContent = 'Заявка отправлена. Мы свяжемся с вами.';
	} catch (error) {
		console.error('Could not submit order to Firestore:', error);
		status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз позже.';
	} finally {
		submitButton.disabled = false;
	}
});