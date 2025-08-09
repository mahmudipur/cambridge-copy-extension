function getVisibleText(el: HTMLElement): string {
	const clone = el.cloneNode(true) as HTMLElement;

	clone
		.querySelectorAll(
			'button, input, .copy-button, .pronunciation-button, input.synonym-checkbox'
		)
		.forEach((n) => n.remove());

	const txt =
		clone.textContent
			?.replace(/📋|✅|🔊/g, '')
			.replace(/\s+/g, ' ')
			.trim() || '';
	return txt;
}

function isThesaurusPage(): boolean {
	return window.location.pathname.startsWith('/thesaurus/');
}

function createPronunciationButton(word: string): HTMLButtonElement {
	const button = document.createElement('button');
	button.textContent = '🔊';
	button.className = 'pronunciation-button';
	button.style.marginLeft = '6px';
	button.style.cursor = 'pointer';
	button.style.border = 'none';
	button.style.background = 'none';
	button.style.fontSize = '1em';

	button.addEventListener('click', async (e) => {
		e.preventDefault();

		const cleanWord = word.toLowerCase().replace(/[^a-z']/g, '');
		if (!cleanWord) return;

		const first = cleanWord[0];
		const s2 = cleanWord.slice(0, 2);
		const s3 = cleanWord.slice(0, 3);
		const s4 = cleanWord.slice(0, 4);

		const base = 'https://dictionary.cambridge.org/media/english/us_pron';
		const candidates = [
			`${base}/${first}/${s3}/${s4}/${cleanWord}.mp3`,
			`${base}/${first}/${s3}/${cleanWord}/${cleanWord}.mp3`,
			`${base}/${first}/${s2}/${cleanWord}/${cleanWord}.mp3`,
			`${base}/${first}/${cleanWord}/${cleanWord}.mp3`,
			`${base}/${cleanWord}/${cleanWord}.mp3`,
		];

		for (const url of candidates) {
			try {
				const audio = new Audio(url);
				audio.preload = 'auto';
				await audio.play();
				return;
			} catch (err) {
				console.error(err);
			}
		}

		if ('speechSynthesis' in window) {
			try {
				const utter = new SpeechSynthesisUtterance(cleanWord);
				speechSynthesis.speak(utter);
			} catch (err) {
				console.error('speechSynthesis failed', err);
			}
		}
	});

	return button;
}

function addThesaurusCopyFeatures(): void {
	const groups = document.querySelectorAll('.pr.sense.dsense');

	groups.forEach((group) => {
		const synonyms = group.querySelectorAll(
			'.dx-h.dthesButton.synonym, .dx-h.dthesButton.opposite'
		);

		synonyms.forEach((syn) => {
			const synEl = syn as HTMLElement;
			if (synEl.getAttribute('data-enhanced') === 'true') return;

			// Create checkbox
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.className = 'synonym-checkbox';
			checkbox.style.marginRight = '6px';

			// Create single copy button
			const copyBtn = document.createElement('button');
			copyBtn.textContent = '📋';
			copyBtn.className = 'copy-button';
			copyBtn.style.marginLeft = '6px';
			copyBtn.style.cursor = 'pointer';
			copyBtn.style.border = 'none';
			copyBtn.style.background = 'none';
			copyBtn.style.fontSize = '1em';

			copyBtn.addEventListener('click', (e) => {
				e.preventDefault();
				navigator.clipboard.writeText(
					synEl.textContent?.replace(/📋|✅/g, '').trim() || ''
				);
				copyBtn.textContent = '✅';
				setTimeout(() => (copyBtn.textContent = '📋'), 1500);
			});

			// Insert checkbox before and button after
			synEl.insertBefore(checkbox, synEl.firstChild);
			synEl.appendChild(copyBtn);

			// Add pronunciation button for single-word synonyms
			const visible = getVisibleText(synEl);
			const words = visible.match(/\S+/g) || [];
			if (words.length === 1 && !synEl.querySelector('.pronunciation-button')) {
				synEl.appendChild(createPronunciationButton(words[0]));
			}

			synEl.setAttribute('data-enhanced', 'true');
		});

		// Add “Copy All” and “Deselect All” at the bottom of the group (same as yours)
		if (!group.querySelector('.copy-all-button')) {
			const wrapper = document.createElement('div');
			wrapper.style.marginTop = '8px';
			wrapper.style.display = 'flex';
			wrapper.style.gap = '10px';

			const copyAllBtn = document.createElement('button');
			copyAllBtn.textContent = '📋 Copy All';
			copyAllBtn.className = 'copy-all-button';
			copyAllBtn.style.cursor = 'pointer';
			copyAllBtn.style.border = '1px solid #ccc';
			copyAllBtn.style.padding = '4px 8px';
			copyAllBtn.style.borderRadius = '4px';
			copyAllBtn.style.fontSize = '0.9em';

			copyAllBtn.addEventListener('click', () => {
				const checkedSynonyms = group.querySelectorAll(
					'.dx-h.dthesButton.synonym input.synonym-checkbox:checked, .dx-h.dthesButton.opposite input.synonym-checkbox:checked'
				);

				const items = Array.from(checkedSynonyms).map((checkbox) => {
					const synItem = checkbox.parentElement;
					return synItem?.textContent?.replace(/📋|✅/g, '').trim() || '';
				});

				if (items.length > 0) {
					navigator.clipboard.writeText(items.join(', '));
					copyAllBtn.textContent = '✅ Copied!';
					setTimeout(() => (copyAllBtn.textContent = '📋 Copy All'), 1500);
				}
			});

			const deselectAllBtn = document.createElement('button');
			deselectAllBtn.textContent = '❌ Deselect All';
			deselectAllBtn.className = 'deselect-all-button';
			deselectAllBtn.style.cursor = 'pointer';
			deselectAllBtn.style.border = '1px solid #ccc';
			deselectAllBtn.style.padding = '4px 8px';
			deselectAllBtn.style.borderRadius = '4px';
			deselectAllBtn.style.fontSize = '0.9em';

			deselectAllBtn.addEventListener('click', () => {
				const checkboxes = group.querySelectorAll('input.synonym-checkbox');
				checkboxes.forEach((cb) => ((cb as HTMLInputElement).checked = false));
			});

			wrapper.appendChild(copyAllBtn);
			wrapper.appendChild(deselectAllBtn);
			group.appendChild(wrapper);
		}
	});
}

function addCopyButtons(): void {
	if (isThesaurusPage()) {
		addThesaurusCopyFeatures();
	} else {
		const entries = document.querySelectorAll(
			'.def.ddef_d, .trans.dtrans, .dx-h.dthesButton, .synonym'
		);

		entries.forEach((entry) => {
			const el = entry as HTMLElement;

			if (el.getAttribute('data-copy-button-injected') === 'true') return;

			// Copy button
			const button = document.createElement('button');
			button.textContent = '📋';
			button.className = 'copy-button';
			button.style.marginLeft = '8px';
			button.style.cursor = 'pointer';
			button.style.border = 'none';
			button.style.background = 'none';
			button.style.fontSize = '1em';

			button.addEventListener('click', (e) => {
				e.preventDefault();

				// Clone the node, remove the button(s), then copy the cleaned text
				const clone = el.cloneNode(true) as HTMLElement;
				clone
					.querySelectorAll('.copy-button, .pronunciation-button')
					.forEach((n) => n.remove());
				const cleanText = clone.textContent?.trim() || '';
				navigator.clipboard.writeText(cleanText);

				button.textContent = '✅';
				setTimeout(() => (button.textContent = '📋'), 1500);
			});

			const visible = getVisibleText(el);
			const words = visible.match(/\S+/g) || [];

			if (words.length === 1 && !el.querySelector('.pronunciation-button')) {
				el.appendChild(createPronunciationButton(words[0]));
			}

			el.appendChild(button);
			el.setAttribute('data-copy-button-injected', 'true');
		});
	}
}

// Initial run
addCopyButtons();

// Watch for changes
const observer = new MutationObserver(() => {
	addCopyButtons();
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
});
