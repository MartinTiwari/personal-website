// Martin gives the tour; the actual folders still do the work.
(() => {
  const portrait = document.querySelector('.desk-portrait');
  const me = document.querySelector('#me');
  if (!portrait || !me) return;
  const bubble = portrait.querySelector('.portrait-dialogue');
  const text = bubble.querySelector('p');
  const route = bubble.querySelector('a');
  const reset = portrait.querySelector('.portrait-reset');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const tour = [
    { text: 'Two projects shipped. The third is still negotiating its release date.', href: '#projects', link: 'open the work folder →', focus: '.desk-folder' },
    { text: 'These are my people. They did not approve every photo choice.', href: '#photos', link: 'meet the people →', focus: '.desk-photos' },
    { text: 'The playlist is public. My singing remains a private matter.', href: '#music', link: 'put something on →', focus: '.desk-player' },
    { text: 'Leave a note or a drawing. Artistic ability is not a visa requirement.', href: '#mark', link: 'leave evidence →', focus: '.desk-book' },
    { text: 'That little ad? The family business. My conflict of interest comes with a logo.', href: 'https://www.everestsuperchemical.com.np/', link: 'visit Everest Super Chemical ↗', focus: '.desk-business' }
  ];
  let index = 0, reaction = null;
  function clearSpotlight() { document.querySelectorAll('.desk-spotlight').forEach(el => el.classList.remove('desk-spotlight')); }
  function react() {
    reaction?.cancel();
    if (!motion.matches) reaction = me.animate([
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-2deg) translateY(-4px)', offset: .35 }, { transform: 'rotate(0deg)' }
    ], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function say(message, href = null, label = '') {
    text.textContent = message;
    route.hidden = !href;
    if (href) {
      route.href = href; route.textContent = label;
      if (href.startsWith('https:')) { route.target = '_blank'; route.rel = 'noopener'; }
      else { route.removeAttribute('target'); route.removeAttribute('rel'); }
    }
    react();
  }
  me.addEventListener('click', () => {
    const stop = tour[index++ % tour.length];
    clearSpotlight();
    document.querySelector(stop.focus)?.classList.add('desk-spotlight');
    say(stop.text, stop.href, stop.link);
    reset.hidden = false;
  });
  portrait.querySelector('.portrait-call').addEventListener('click', () => {
    clearSpotlight();
    say('HARU, come here. We have guests. Pretend we are normal.');
    document.dispatchEvent(new CustomEvent('haru:call'));
  });
  reset.addEventListener('click', () => {
    index = 0; clearSpotlight(); reset.hidden = true;
    say('I brought the projects. HARU brought the supervision.');
  });
  document.addEventListener('haru:landed', event => {
    if (event.detail?.perch === 'martin') say('She came for the hoodie. Please do not mistake this for affection.');
  });
  document.addEventListener('haru:unavailable', event => {
    say(event.detail?.reason || 'She is supervising another corner. Bring her perch into view and try again.');
  });
  const advert = document.querySelector('.desk-business');
  advert?.addEventListener('pointerenter', () => advert.classList.add('ad-noticed'), { once: true });
  document.querySelector('#desk-view')?.addEventListener('close', clearSpotlight);
  motion.addEventListener('change', () => reaction?.cancel());
})();
