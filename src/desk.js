// A small desk with real objects. Deep links are ordinary browser history.
(() => {
  const dialog = document.querySelector('#desk-view');
  const body = document.querySelector('#desk-view-body');
  const home = document.querySelector('.desk-home');
  const toastRoot = document.querySelector('#toast-root');
  const sections = [...document.querySelectorAll('body > section.sec')];
  const archive = document.createElement('div');
  archive.id = 'desk-archive';
  archive.hidden = true;
  document.body.append(archive);
  document.querySelector('#intro')?.remove();
  document.querySelectorAll('body > .tear').forEach(el => el.remove());
  sections.forEach(el => archive.append(el));
  const panels = new Map();
  function panel(key, title, items) {
    const node = document.createElement('div');
    node.className = 'desk-panel';
    node.dataset.view = key;
    items.forEach(el => node.append(el));
    archive.append(node);
    panels.set(key, { node, title });
    return node;
  }
  panel('projects', 'the project folder', [sections[7]]);
  panel('music', 'the soundtrack', [sections[8]]);
  panel('mark', 'you were here', [sections[9]]);
  panel('internet', 'find me', [sections[5]]);
  const about = panel('about', 'the person behind the tabs', [sections[0], sections[6], sections[4], sections[10]]);
  const rapid = document.createElement('section');
  rapid.className = 'sec sec-wide';
  rapid.append(sections[7].querySelector('.rapid-label'), sections[7].querySelector('.strip-wrap'));
  about.insertBefore(rapid, sections[10]);
  sections[7].querySelector('.escu-ad')?.remove();
  const photos = panel('photos', 'evidence of a life', []);
  const tabs = document.createElement('div');
  tabs.className = 'album-tabs';
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Choose a photo album');
  photos.append(tabs);
  const albums = [];
  [['Kathmandu', sections[1]], ['the family', sections[2]], ['dad, confirmed', sections[3]]].forEach(([label, section], index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.textContent = label;
    button.setAttribute('aria-pressed', String(index === 0));
    tabs.append(button);
    const group = document.createElement('div');
    group.className = 'album-group'; group.hidden = index !== 0;
    group.append(section); photos.append(group);
    const figures = [...section.querySelectorAll('.pol')];
    let current = 0;
    if (figures.length) {
      const controls = document.createElement('div');
      controls.className = 'album-controls';
      const prev = document.createElement('button');
      prev.type = 'button'; prev.textContent = '← previous';
      const count = document.createElement('span');
      count.className = 'album-count'; count.setAttribute('aria-live', 'polite');
      const next = document.createElement('button');
      next.type = 'button'; next.textContent = 'next →';
      controls.append(prev, count, next); group.append(controls);
      function paint() {
        figures.forEach((figure, n) => {
          figure.hidden = n !== current;
          figure.classList.toggle('album-selected', n === current);
          if (n === current && figure.querySelector('img')) figure.querySelector('img').loading = 'eager';
        });
        count.textContent = `${current + 1} / ${figures.length}`;
        window.dispatchEvent(new Event('resize'));
      }
      prev.addEventListener('click', () => { current = (current - 1 + figures.length) % figures.length; paint(); });
      next.addEventListener('click', () => { current = (current + 1) % figures.length; paint(); });
      paint();
      section.querySelector('#shuffle-btn')?.remove();
    }
    albums.push({ button, group });
    button.addEventListener('click', () => {
      albums.forEach(album => { const active = album.button === button; album.group.hidden = !active; album.button.setAttribute('aria-pressed', String(active)); });
      group.querySelectorAll('img').forEach(img => { if (!img.closest('[hidden]')) img.loading = 'eager'; });
      window.dispatchEvent(new Event('resize'));
    });
  });
  // Keep the photo viewer in the same top layer as its parent file.
  dialog.append(document.querySelector('#lightbox'));
  let returnFocus = null;
  let opened = null;
  function restore() {
    if (opened) archive.append(opened);
    opened = null;
    document.body.style.overflow = '';
    document.body.append(toastRoot);
    document.querySelector('#lightbox').classList.add('hidden');
    returnFocus?.focus({ preventScroll: true });
  }
  function route() {
    const key = location.hash.slice(1);
    const entry = panels.get(key);
    if (!entry) { if (dialog.open) dialog.close(); return; }
    if (opened) archive.append(opened);
    opened = entry.node;
    body.replaceChildren(opened);
    opened.querySelectorAll('img').forEach(img => { if (!img.closest('[hidden]')) img.loading = 'eager'; });
    document.querySelector('#desk-view-title').textContent = entry.title;
    opened.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    if (!dialog.open) {
      returnFocus = document.activeElement;
      dialog.showModal();
      dialog.append(toastRoot);
      document.body.style.overflow = 'hidden';
    }
    dialog.scrollTop = 0;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }
  function close() { history.pushState(null, '', location.pathname + location.search + '#top'); dialog.close(); }
  dialog.querySelector('.desk-back').addEventListener('click', close);
  dialog.querySelector('.desk-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('close', restore);
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const hash = anchor.getAttribute('href');
    if (panels.has(hash.slice(1))) {
      event.preventDefault();
      if (location.hash !== hash) history.pushState(null, '', hash);
      route();
    } else if (hash === '#top' && dialog.open) { event.preventDefault(); close(); }
  });
  const cat = home.querySelector('.desk-cat');
  const pet = document.querySelector('#haru-pet');
  const folder = home.querySelector('.desk-folder');
  if (cat && pet && folder) {
    // The original page cat has a permanent job now. No viewport roaming.
    cat.querySelector('img')?.remove();
    cat.prepend(pet);
    pet.removeAttribute('aria-hidden');
    pet.className = 'sitting';
    const petSvg = pet.querySelector('svg');
    petSvg.setAttribute('aria-hidden', 'true');
    petSvg.removeAttribute('role');
    petSvg.removeAttribute('aria-label');
    pet.querySelector('#pet-bubble')?.remove();
    cat.setAttribute('aria-label', 'Pet HARU, the project folder supervisor');
    const message = cat.querySelector('.cat-message');
    message.textContent = 'HARU · quality control';
    const replies = [
      'two shipped. one sat on.',
      'this folder is now a warm laptop.',
      'approved. needs more treats.',
      'he ships the work. I keep it warm.',
      'no bugs. only a cat.'
    ];
    let asks = 0, idleTimer, settleTimer, replyTimer;
    let onScreen = false;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const intro = document.querySelector('#signature-intro');
    function placeCat() {
      // Anchor the paws to the folder's rotated top edge, not the viewport.
      const angle = (parseFloat(getComputedStyle(folder).rotate) || 0) * Math.PI / 180;
      const w = folder.offsetWidth, h = folder.offsetHeight;
      const along = w * .22;
      const pawX = folder.offsetLeft + w / 2 + along * Math.cos(angle) + h / 2 * Math.sin(angle);
      const pawY = folder.offsetTop + h / 2 + along * Math.sin(angle) - h / 2 * Math.cos(angle);
      cat.style.left = `${pawX - cat.offsetWidth * .57}px`;
      cat.style.top = `${pawY - pet.offsetHeight * .94}px`;
      cat.style.setProperty('--perch-angle', `${angle * 180 / Math.PI}deg`);
    }
    function groom() {
      pet.classList.add('grooming');
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => pet.classList.remove('grooming'), 2300);
    }
    function scheduleIdle() {
      idleTimer = setTimeout(() => {
        groom();
        scheduleIdle();
      }, 12000 + Math.random() * 8000);
    }
    function syncLife() {
      const active = onScreen && !document.hidden && !dialog.open && (!intro || intro.hidden);
      cat.classList.toggle('cat-paused', !active || motion.matches);
      clearTimeout(idleTimer);
      clearTimeout(settleTimer);
      pet.classList.remove('grooming');
      if (active && !motion.matches) scheduleIdle();
      if (!active) {
        clearTimeout(replyTimer);
        cat.classList.remove('cat-speaking');
      }
    }
    cat.addEventListener('click', () => {
      message.textContent = replies[asks++ % replies.length];
      cat.classList.add('cat-speaking');
      clearTimeout(replyTimer);
      if (!motion.matches && !cat.classList.contains('cat-paused')) groom();
      replyTimer = setTimeout(() => {
        cat.classList.remove('cat-speaking');
        message.textContent = 'HARU · quality control';
      }, 4200);
    });
    new ResizeObserver(placeCat).observe(home.querySelector('.desk-scene'));
    new ResizeObserver(placeCat).observe(folder);
    window.addEventListener('resize', placeCat, { passive: true });
    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      syncLife();
    }).observe(cat);
    const lifeObserver = new MutationObserver(syncLife);
    lifeObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    if (intro) lifeObserver.observe(intro, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', syncLife);
    motion.addEventListener('change', syncLife);
    placeCat();
    syncLife();
  }
  document.querySelector('#me').addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); }
  });
  // Wait until the existing features have registered their listeners.
  window.addEventListener('DOMContentLoaded', route);
})();
