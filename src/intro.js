// A brief first-visit hello, drawn from Martin's actual signature.
(() => {
  const intro = document.querySelector('#signature-intro');
  if (!intro) return;
  const skip = intro.querySelector('.intro-skip');
  const enter = intro.querySelector('.intro-enter');
  const paths = [...intro.querySelectorAll('.intro-stroke')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'signature-intro-seen-v1';
  let active = false;
  let closing = false;
  let returnFocus = null;
  let overflowBefore = '';
  let closeTimer = null;
  let hideTimer = null;
  let animations = [];
  const inertBefore = new Map();

  function rememberVisit() {
    try { sessionStorage.setItem(storageKey, '1'); } catch { /* Private storage can be unavailable. */ }
  }
  function wasSeen() {
    try { return sessionStorage.getItem(storageKey) === '1'; } catch { return false; }
  }
  function finish() {
    if (!active || closing) return;
    closing = true;
    clearTimeout(closeTimer);
    intro.classList.add('is-closing');
    const hide = () => {
      intro.hidden = true;
      intro.classList.remove('is-closing', 'is-drawing');
      animations.forEach(animation => animation.cancel());
      animations = [];
      inertBefore.forEach((value, node) => { node.inert = value; });
      inertBefore.clear();
      document.body.style.overflow = overflowBefore;
      active = false;
      closing = false;
      const fallback = document.querySelector('#top .desk-object') || document.querySelector('.desk-object') || document.querySelector('.brand');
      const target = returnFocus?.isConnected && returnFocus !== document.body ? returnFocus : fallback;
      if (target && !target.closest('[inert]')) target.focus({ preventScroll: true });
    };
    hideTimer = setTimeout(hide, reducedMotion.matches ? 0 : 460);
  }
  function draw() {
    const lengths = paths.map(path => {
      try { return Math.max(path.getTotalLength(), 1); } catch { return 1; }
    });
    const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
    let delay = 230;
    paths.forEach((path, index) => {
      // pathLength=1 normalizes the CSS dash values independently of SVG size.
      path.setAttribute('pathLength', '1');
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = '1';
      const duration = 1700 * lengths[index] / total;
      animations.push(path.animate(
        [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }],
        { duration, delay, easing: 'linear', fill: 'forwards' }
      ));
      delay += duration;
    });
  }
  function open(replay = false) {
    if (active) return;
    clearTimeout(hideTimer);
    active = true;
    closing = false;
    returnFocus = document.activeElement;
    overflowBefore = document.body.style.overflow;
    [...document.body.children].forEach(node => {
      if (node === intro || node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'LINK') return;
      inertBefore.set(node, node.inert);
      node.inert = true;
    });
    intro.setAttribute('role', 'dialog');
    intro.setAttribute('aria-modal', 'true');
    intro.hidden = false;
    intro.classList.remove('is-closing');
    document.body.style.overflow = 'hidden';
    paths.forEach(path => { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; });
    if (!reducedMotion.matches) {
      intro.classList.add('is-drawing');
      draw();
      closeTimer = setTimeout(finish, 2700);
    } else if (!replay) {
      finish();
    }
    rememberVisit();
    skip?.focus({ preventScroll: true });
  }
  skip?.addEventListener('click', finish);
  enter?.addEventListener('click', finish);
  intro.addEventListener('keydown', event => {
    if (!active || closing) return;
    if (event.key === 'Escape') { event.preventDefault(); finish(); return; }
    if (event.key !== 'Tab') return;
    const controls = [skip, enter].filter(Boolean);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !intro.contains(document.activeElement))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !intro.contains(document.activeElement))) {
      event.preventDefault(); first?.focus();
    }
  });
  document.querySelectorAll('.intro-replay').forEach(button => button.addEventListener('click', () => open(true)));
  reducedMotion.addEventListener('change', () => { if (active && reducedMotion.matches) finish(); });
  if (!wasSeen() && (!location.hash || location.hash === '#top') && !reducedMotion.matches) open();
})();
