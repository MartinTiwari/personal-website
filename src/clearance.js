// This small section is playful. Private contact details are never in the page.
(() => {
  const file = document.querySelector('#classified-file');
  if (!file) return;
  const reply = file.querySelector('#clearance-reply');
  const replies = {
    phone: ['nice try. my phone also deserves a private life.', 'still private. enthusiasm is not a password.'],
    addr: ['the momos are nearby. that is all the navigation you get.', 'not a delivery address. not even for free pizza.']
  };
  const counts = { phone: 0, addr: 0 };
  file.querySelectorAll('.private-probe').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      reply.textContent = replies[key][counts[key]++ % replies[key].length];
      button.dataset.tried = 'true';
    });
  });
  const photo = file.querySelector('#badge');
  file.querySelector('.badge-reset').addEventListener('click', () => {
    if (window.anime) window.anime.remove(photo);
    photo.getAnimations().forEach(animation => animation.cancel());
    photo.style.removeProperty('transform');
    photo.style.rotate = '0deg';
    photo.classList.remove('held', 'phys', 'tugged');
    reply.textContent = 'photo straightened. life remains a work in progress.';
  });
  const intro = document.querySelector('.desk-panel[data-view="about"] > .hello-sec');
  if (intro) {
    const jump = document.createElement('button');
    jump.type = 'button';
    jump.className = 'classified-open hand';
    jump.textContent = 'a few things you are allowed to know →';
    jump.setAttribute('aria-controls', 'classified-file');
    jump.addEventListener('click', () => {
      file.scrollIntoView({ behavior: 'instant', block: 'start' });
      file.querySelector('.private-probe').focus({ preventScroll: true });
    });
    intro.append(jump);
  }
})();
