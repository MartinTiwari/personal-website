// HARU owns the desk, not the viewport. Every landing is measured from a real object.
(() => {
  const scene = document.querySelector('.desk-scene');
  const cat = scene?.querySelector('.desk-cat');
  const pet = document.querySelector('#haru-pet');
  if (!scene || !cat || !pet) return;
  const dialog = document.querySelector('#desk-view');
  const intro = document.querySelector('#signature-intro');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const message = cat.querySelector('.cat-message');
  const perches = [
    { key: 'projects', node: scene.querySelector('.desk-folder'), along: .72, reply: 'two shipped. this one is mine.' },
    { key: 'mark', node: scene.querySelector('.desk-book'), along: .70, reply: 'left a pawprint. legally a signature.' },
    { key: 'music', node: scene.querySelector('.desk-player'), along: .78, reply: 'put on something with a good purr.' },
    { key: 'martin', node: scene.querySelector('.desk-portrait'), along: .76, reply: 'human summoned. lap acquired.' }
  ].filter(item => item.node);
  cat.querySelector('img')?.remove();
  cat.prepend(pet);
  pet.className = 'sitting';
  pet.removeAttribute('aria-hidden');
  pet.querySelector('#pet-bubble')?.remove();
  const svg = pet.querySelector('svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.removeAttribute('role');
  svg.removeAttribute('aria-label');
  cat.setAttribute('aria-label', 'HARU the desk cat. Click to choose another perch.');
  message.setAttribute('aria-live', 'polite');
  let current = perches[0], flight = null, idleTimer, replyTimer, scrollFrame;
  let onScreen = false;
  const blocked = () => document.hidden || dialog?.open || (intro && !intro.hidden);
  function anchor(item) {
    const node = item.key === 'martin' ? item.node.querySelector('img') : item.node;
    const bounds = node.getBoundingClientRect();
    const origin = scene.getBoundingClientRect();
    const angle = (parseFloat(getComputedStyle(item.node).rotate) || 0);
    const r = angle * Math.PI / 180;
    // The lap is deliberately below the face; other objects use their rotated top edge.
    const localX = node.offsetWidth * (item.along - .5);
    const localY = node.offsetHeight * (item.key === 'martin' ? .23 : -.5);
    const pawX = bounds.left + bounds.width / 2 + localX * Math.cos(r) - localY * Math.sin(r);
    const pawY = bounds.top + bounds.height / 2 + localX * Math.sin(r) + localY * Math.cos(r);
    const width = cat.offsetWidth, height = pet.offsetHeight;
    const pawOffsetX = width * .07, pawOffsetY = height * .44;
    return {
      x: pawX - origin.left - width / 2 - pawOffsetX * Math.cos(r) + pawOffsetY * Math.sin(r),
      y: pawY - origin.top - height / 2 - pawOffsetX * Math.sin(r) - pawOffsetY * Math.cos(r),
      angle,
      visible: pawX > width / 2 && pawX < innerWidth - width / 2 && pawY > height + 14 && pawY < innerHeight - 14
    };
  }
  function place(item = current) {
    const point = anchor(item);
    // Current-perch CSS mirrors an object's hover lift; do not count it twice.
    const lift = item.node.classList.contains('desk-object')
      ? getComputedStyle(item.node).translate.split(' ').map(value => parseFloat(value) || 0) : [0, 0];
    cat.style.left = `${point.x - lift[0]}px`;
    cat.style.top = `${point.y - (lift[1] || 0)}px`;
    cat.style.setProperty('--perch-angle', `${point.angle}deg`);
    cat.dataset.perch = item.key;
    cat.style.rotate = '';
    cat.style.transform = '';
  }
  function speak(text) {
    clearTimeout(replyTimer);
    message.textContent = text;
    cat.classList.add('cat-speaking');
    replyTimer = setTimeout(() => {
      cat.classList.remove('cat-speaking');
      message.textContent = 'HARU · click for a change of scenery';
    }, 4200);
  }
  function cancelFlight() {
    if (flight) {
      const oldFlight = flight;
      flight = null;
      oldFlight.cancel();
    }
    cat.classList.remove('cat-jumping');
    pet.classList.add('sitting');
    place();
  }
  function schedule() {
    clearTimeout(idleTimer);
    if (blocked() || motion.matches || !onScreen || !anchor(current).visible || flight) return;
    idleTimer = setTimeout(() => {
      const candidates = perches.filter(item => item !== current && item.key !== 'martin' && anchor(item).visible);
      if (candidates.length) hop(candidates[Math.floor(Math.random() * candidates.length)], false);
      else schedule();
    }, 16000 + Math.random() * 6000);
  }
  function hop(destination, userTriggered = true) {
    if (blocked() || flight) return;
    if (motion.matches) {
      if (userTriggered) speak('taking the scenic route. from right here.');
      return;
    }
    const from = anchor(current), to = anchor(destination);
    if (!from.visible || !to.visible) {
      if (userTriggered) speak('that landing is off-screen. safety inspector says no.');
      return;
    }
    if (destination === current) { speak('already supervising this department.'); return; }
    clearTimeout(idleTimer);
    cat.classList.remove('cat-speaking');
    const dx = to.x - from.x, dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const arc = Math.min(125, Math.max(46, distance * .18));
    const duration = Math.min(1100, 720 + distance * .28);
    const frames = [{ offset: 0, transform: 'translate(0, 0) scale(1, 1)', rotate: `${from.angle}deg` },
      { offset: .16, transform: 'translate(0, 4px) scale(1.07, .85)', rotate: `${from.angle}deg`, easing: 'ease-out' }];
    for (let step = 1; step <= 10; step++) {
      const p = step / 10;
      frames.push({ offset: .16 + p * .67,
        transform: `translate(${dx * p}px, ${dy * p - 4 * arc * p * (1 - p)}px) scale(${1 + .05 * Math.sin(Math.PI * p)}, ${1 - .06 * Math.sin(Math.PI * p)})`,
        rotate: `${from.angle + (to.angle - from.angle) * p}deg` });
    }
    frames.push({ offset: .90, transform: `translate(${dx}px, ${dy + 3}px) scale(1.06, .9)`, rotate: `${to.angle}deg`, easing: 'ease-out' },
      { offset: 1, transform: `translate(${dx}px, ${dy}px) scale(1, 1)`, rotate: `${to.angle}deg` });
    pet.classList.remove('sitting');
    cat.style.left = `${from.x}px`;
    cat.style.top = `${from.y}px`;
    cat.classList.add('cat-jumping');
    cat.style.rotate = `${from.angle}deg`;
    flight = cat.animate(frames, { duration, fill: 'forwards', easing: 'linear' });
    const thisFlight = flight;
    thisFlight.finished.then(() => {
      if (flight !== thisFlight) return;
      current = destination;
      flight = null;
      thisFlight.cancel();
      cat.classList.remove('cat-jumping');
      pet.classList.add('sitting');
      place();
      document.dispatchEvent(new CustomEvent('haru:landed', { detail: { perch: current.key } }));
      if (userTriggered) speak(destination.reply);
      schedule();
    }).catch(() => {});
  }
  function sync() {
    const active = onScreen && !blocked() && anchor(current).visible;
    cat.classList.toggle('cat-paused', !active || motion.matches);
    if (!active || motion.matches) {
      cancelFlight();
      clearTimeout(idleTimer);
      clearTimeout(replyTimer);
      cat.classList.remove('cat-speaking');
    } else schedule();
  }
  cat.addEventListener('click', () => {
    const candidates = perches.filter(item => item.key !== 'martin' && anchor(item).visible);
    const index = candidates.indexOf(current);
    const destination = candidates[(index + 1) % candidates.length];
    if (destination) hop(destination);
    else speak('my next appointment is a nap.');
  });
  document.addEventListener('haru:call', () => {
    // Let the human's reply bubble settle before measuring the shared desk.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const lap = perches.find(item => item.key === 'martin');
      let reason;
      if (motion.matches) reason = 'HARU is keeping still. Management respects reduced motion.';
      else if (blocked()) reason = 'HARU will be back when the desk is open.';
      else if (flight) reason = 'HARU is already mid-air. One landing at a time.';
      else if (!lap || !anchor(current).visible || !anchor(lap).visible) reason = 'HARU needs both landing spots in view. No off-screen acrobatics.';
      if (reason) document.dispatchEvent(new CustomEvent('haru:unavailable', { detail: { reason } }));
      else if (lap === current) {
        speak('already supervising this department.');
        document.dispatchEvent(new CustomEvent('haru:landed', { detail: { perch: current.key } }));
      } else hop(lap);
    }));
  });
  const resize = () => { cancelFlight(); schedule(); };
  const observer = new ResizeObserver(resize);
  observer.observe(scene);
  perches.forEach(item => observer.observe(item.key === 'martin' ? item.node.querySelector('img') : item.node));
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { scrollFrame = null; sync(); });
  }, { passive: true });
  new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; sync(); }).observe(scene);
  const life = new MutationObserver(sync);
  if (dialog) life.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  if (intro) life.observe(intro, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  message.textContent = 'HARU · click for a change of scenery';
  place();
  sync();
})();
