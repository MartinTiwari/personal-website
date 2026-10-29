// A file comes forward before its contents open. Ordinary links remain ordinary links.
(() => {
  const home = document.querySelector('.interrupted-desk .desk-home');
  if (!home) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = home.querySelector('.relatives-toggle');
  const slip = home.querySelector('.relatives-slip');
  let pending = null;
  let selected = null;
  function setRelatives(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.relatives-action').textContent = open ? 'tuck away ↑' : 'pull ↓';
    slip.hidden = !open;
    if (open && !reduced.matches) slip.animate([
      {opacity:0, transform:'perspective(700px) rotateX(-12deg) translateY(-8px)'},
      {opacity:1, transform:'none'}
    ], {duration:300, easing:'cubic-bezier(.16,1,.3,1)'});
  }
  if (toggle && slip) {
    toggle.hidden = false;
    setRelatives(false);
    toggle.addEventListener('click', () => setRelatives(toggle.getAttribute('aria-expanded') !== 'true'));
  }
  const resetPull = () => {
    clearTimeout(pending);
    pending = null;
    selected?.classList.remove('is-pulling');
    selected = null;
  };
  home.querySelectorAll('.desk-scene > a.desk-object').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reduced.matches) return;
      event.preventDefault();
      event.stopPropagation();
      resetPull();
      selected = link;
      link.classList.add('is-pulling');
      pending = setTimeout(() => {
        const hash = link.getAttribute('href');
        resetPull();
        location.hash = hash;
      }, 170);
    });
  });
  document.querySelector('#desk-view')?.addEventListener('close', resetPull);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetPull(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') resetPull(); });
  // The tour can point to the disclosure without exposing a hidden or unreachable link.
  home.querySelector('#me')?.addEventListener('click', () => {
    if (home.querySelector('.desk-business.desk-spotlight') && slip.hidden) setRelatives(true);
  });
})();
