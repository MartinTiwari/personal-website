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
  // The discontinued label gets its own divider, not another long scroll.
  const workbench = sections[7].querySelector('.project-desk');
  const clothing = sections[7].querySelector('.clothing-archive');
  if (workbench && clothing) {
    const dividers = document.createElement('div');
    dividers.className = 'project-file-tabs';
    dividers.setAttribute('role', 'group');
    dividers.setAttribute('aria-label', 'Choose a project file');
    const files = [[workbench, 'the workbench'], [clothing, 'Poshak archive']];
    const buttons = files.map(([file, label], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      file.id ||= `project-file-${index}`;
      button.setAttribute('aria-controls', file.id);
      button.setAttribute('aria-pressed', String(index === 0));
      file.hidden = index !== 0;
      button.addEventListener('click', () => {
        files.forEach(([content], i) => {
          content.hidden = content !== file;
          buttons[i].setAttribute('aria-pressed', String(content === file));
        });
        file.querySelectorAll('img').forEach(img => { if (!img.closest('[hidden]')) img.loading = 'eager'; });
        window.dispatchEvent(new Event('resize'));
      });
      dividers.append(button);
      return button;
    });
    sections[7].querySelector('.project-headline').after(dividers);
  }
  const photos = panel('photos', 'evidence of a life', []);
  const tabs = document.createElement('div');
  tabs.className = 'album-tabs';
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Choose a photo album');
  photos.append(tabs);
  const albums = [];
  const haruTemplate = document.querySelector('#haru-album-template');
  const haruAlbum = haruTemplate.content.firstElementChild.cloneNode(true);
  haruTemplate.remove();
  [['Kathmandu', sections[1]], ['the family', sections[2]], ['dad, confirmed', sections[3]], ['HARU, the actual owner', haruAlbum]].forEach(([label, section], index) => {
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
          if (n === current && !figure.closest('[hidden]') && figure.querySelector('img')) figure.querySelector('img').loading = 'eager';
        });
        count.textContent = `${current + 1} / ${figures.length}`;
        if (section === haruAlbum) {
          prev.textContent = current === 0 ? '← inspect the camera' : '← back to management';
          next.textContent = current === 0 ? 'inspect the camera →' : 'back to management →';
        }
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
  const fileNav = document.createElement('nav');
  fileNav.className = 'desk-file-nav';
  fileNav.setAttribute('aria-label', 'Switch files');
  for (const [key, label] of [['projects', 'work'], ['photos', 'photos'], ['music', 'music'], ['mark', 'guestbook'], ['about', 'about me'], ['internet', 'elsewhere']]) {
    const link = document.createElement('a');
    link.href = `#${key}`;
    link.textContent = label;
    fileNav.append(link);
  }
  dialog.querySelector('.desk-view-bar').after(fileNav);
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
    // A hash navigation can emit both popstate and hashchange.
    if (opened === entry.node && dialog.open) return;
    if (opened) archive.append(opened);
    opened = entry.node;
    body.replaceChildren(opened);
    opened.querySelectorAll('img').forEach(img => { if (!img.closest('[hidden]')) img.loading = 'eager'; });
    document.querySelector('#desk-view-title').textContent = entry.title;
    fileNav.querySelectorAll('a').forEach(link => {
      if (link.hash === `#${key}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    opened.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    if (!dialog.open) {
      returnFocus = document.activeElement;
      dialog.showModal();
      dialog.append(toastRoot);
      document.body.style.overflow = 'hidden';
    }
    dialog.scrollTop = 0;
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    document.dispatchEvent(new CustomEvent('desk:opened', { detail: { key, title: entry.title } }));
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
  document.querySelector('#me').addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); }
  });
  // Wait until the existing features have registered their listeners.
  window.addEventListener('DOMContentLoaded', route);
})();
