// The clearance is imaginary. The boundaries are not.
(() => {
  const file = document.querySelector('#classified-file');
  if (!file) return;
  const request = file.querySelector('.clearance-request');
  const desk = file.querySelector('.clearance-desk');
  const reply = file.querySelector('#clearance-reply');
  const replies = [
    'Denied. Management is asleep. This is not an appeal process.',
    'Still denied. An extra click is not a qualification.',
    'Bring chiya. Clearance remains imaginary.'
  ];
  let attempts = 0;
  request.addEventListener('click', () => {
    desk.dataset.result = 'denied';
    reply.textContent = replies[attempts++ % replies.length];
  });
  const badge = file.querySelector('#badge');
  file.querySelector('.badge-reset').addEventListener('click', () => {
    if (window.anime) window.anime.remove(badge);
    badge.getAnimations().forEach(animation => animation.cancel());
    badge.style.removeProperty('transform');
    badge.classList.remove('held', 'phys', 'tugged');
    reply.textContent = 'ID straightened. Authority level unchanged.';
  });
  const intro = document.querySelector('.desk-panel[data-view="about"] > .hello-sec');
  if (intro) {
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'classified-open hand';
    jump.textContent = 'open the file marked “probably not” →';
    jump.setAttribute('aria-controls', 'classified-file');
    jump.addEventListener('click', () => {
      file.scrollIntoView({ behavior: 'instant', block: 'start' });
      request.focus({ preventScroll: true });
    });
    intro.append(jump);
  }
})();
