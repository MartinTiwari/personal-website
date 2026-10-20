// A small pack of personal details. Nothing glides away before it can be read.
(() => {
  const strip = document.querySelector('#strip[data-pocket]');
  if (!strip) return;
  const section = strip.closest('section');
  section.classList.add('about-pockets');
  const cards = [...strip.querySelectorAll('.card')];
  if (!cards.length) return;
  strip.classList.add('pocket-ready');
  strip.setAttribute('role', 'group');
  strip.setAttribute('aria-label', 'Personal details. Use the arrow keys to browse.');
  const controls = document.createElement('div');
  controls.className = 'pocket-controls';
  controls.innerHTML = '<button type="button" class="pocket-prev" aria-label="Previous personal detail">←</button><output class="pocket-count" aria-live="polite"></output><button type="button" class="pocket-next" aria-label="Next personal detail">→</button><button type="button" class="pocket-flip">turn it over ↻</button>';
  strip.after(controls);
  const count = controls.querySelector('.pocket-count');
  const flipButton = controls.querySelector('.pocket-flip');
  let current = 0;
  const sync = () => {
    cards.forEach((card, index) => {
      const flipped = card.classList.contains('flipped');
      card.hidden = index !== current;
      card.tabIndex = index === current ? 0 : -1;
      card.setAttribute('aria-pressed', String(flipped));
      card.querySelector('.card-front').setAttribute('aria-hidden', String(flipped));
      card.querySelector('.card-back').setAttribute('aria-hidden', String(!flipped));
      const text = card.querySelector(flipped ? '.card-b' : '.card-front').textContent.replace(/↻/g, '').trim().replace(/\s+/g, ' ');
      card.setAttribute('aria-label', `${text}. Activate to turn ${flipped ? 'to the front' : 'over'}.`);
    });
    count.textContent = `${current + 1} of ${cards.length}`;
    flipButton.textContent = cards[current].classList.contains('flipped') ? 'back to the front ↻' : 'turn it over ↻';
  };
  const move = direction => {
    const focusCard = document.activeElement === cards[current];
    current = (current + direction + cards.length) % cards.length;
    sync();
    if (focusCard) cards[current].focus({ preventScroll: true });
  };
  const flip = () => { cards[current].classList.toggle('flipped'); sync(); };
  cards.forEach(card => {
    card.addEventListener('click', flip);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); }
    });
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  controls.querySelector('.pocket-prev').addEventListener('click', () => move(-1));
  controls.querySelector('.pocket-next').addEventListener('click', () => move(1));
  flipButton.addEventListener('click', flip);
  sync();
})();
