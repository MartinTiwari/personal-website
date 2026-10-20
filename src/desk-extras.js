// A local clock and a helpful decision from management. No background fetching.
(() => {
  const header = document.querySelector('.top');
  const dialog = document.querySelector('#desk-view');
  const bottom = document.querySelector('.desk-bottom');
  if (!header || !dialog || !bottom) return;

  const clock = document.createElement('span');
  clock.className = 'desk-local-time';
  clock.title = 'Local time in Kathmandu';
  header.querySelector('.top-link').before(clock);
  const format = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false
  });
  let clockTimer;
  function updateClock() {
    clearTimeout(clockTimer);
    clock.textContent = `Kathmandu ${format.format(new Date())}`;
    if (!document.hidden) clockTimer = setTimeout(updateClock, 60000 - Date.now() % 60000);
  }
  document.addEventListener('visibilitychange', updateClock);
  updateClock();

  const files = ['projects', 'photos', 'music', 'mark', 'about', 'internet'];
  let visited = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem('desk-visited-files') || '[]');
    if (Array.isArray(saved)) visited = saved.filter(key => files.includes(key));
  } catch { /* Browsing still works without storage. */ }
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.className = 'desk-surprise';
  choose.textContent = 'let HARU choose ↗';
  choose.setAttribute('aria-label', 'Let HARU choose a folder for me');
  const placeholder = bottom.querySelector(':scope > span');
  if (placeholder) placeholder.replaceWith(choose);
  else bottom.append(choose);
  const note = document.createElement('p');
  note.className = 'desk-route-note hand';
  note.setAttribute('role', 'status');
  note.hidden = true;
  dialog.querySelector('.desk-file-nav').after(note);
  let chosenByHaru = null;
  choose.addEventListener('click', () => {
    const unopened = files.filter(key => !visited.includes(key));
    const candidates = unopened.length ? unopened : files.filter(key => `#${key}` !== location.hash);
    chosenByHaru = candidates[Math.floor(Math.random() * candidates.length)];
    location.hash = chosenByHaru;
  });
  dialog.querySelector('.desk-file-nav').addEventListener('click', event => {
    if (event.target.closest('a')) note.hidden = true;
  });
  document.addEventListener('desk:opened', event => {
    const { key } = event.detail;
    note.hidden = chosenByHaru !== key;
    if (!note.hidden) note.textContent = 'HARU picked this one. Blame management.';
    chosenByHaru = null;
    if (!visited.includes(key)) visited.push(key);
    try { sessionStorage.setItem('desk-visited-files', JSON.stringify(visited)); } catch {}
  });
})();
