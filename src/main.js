// martin tiwari. handmade, zero frameworks (anime.js guest-stars for flourishes)
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  /* ---------- the envelope: opens itself, once per session ---------- */
  {
    const intro = $('#intro');
    if (intro) {
      document.body.classList.add('intro-hold'); // hero entrances wait their turn
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem('intro-done', '1'); } catch {}
        document.body.classList.remove('intro-hold');
        intro.remove();
      };
      intro.addEventListener('click', done);
      setTimeout(done, 2600); // CSS timeline ends ~2.45s; this is cleanup
    }
  }

  /* ---------- toast + confetti ---------- */
  function toast(html) {
    const root = $('#toast-root');
    // one toast at a time, full stop: old one is gone before the new one exists
    root.replaceChildren();
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    root.appendChild(t);
    setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 450); }, 4500);
  }
  function confetti(n = 90) {
    if (reduced) return;
    const colors = ['#E8532F', '#2B5BE2', '#FFE15A', '#B9E8C9', '#221E19'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.7 + Math.random() * 1.7 + 's';
      c.style.animationDelay = Math.random() * .4 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }
  }

  /* ---------- the secrets get a stamp card, so "three secrets" has a scoreboard ---------- */
  const secrets = (() => {
    const card = $('#secrets'), foot = $('#secrets-foot');
    const slots = $$('#secrets-row .slot');
    let found = new Set();
    try { found = new Set(JSON.parse(localStorage.getItem('secrets') || '[]')); } catch {}

    const notes = {
      0: "none stamped yet. they're all still up there.",
      1: 'one down. two still hiding, and they are not subtle.',
      2: 'two of three. the last one is the pettiest, obviously.',
      3: 'all three. you went looking. genuinely, respect.',
    };
    function paint(animateN) {
      for (const s of slots) {
        const n = +s.dataset.n;
        const got = found.has(n);
        s.classList.toggle('got', got);
        s.style.setProperty('--sr', `${(n % 2 ? -1 : 1) * (5 + n * 2)}deg`);
        s.setAttribute('aria-label', `Secret ${n}: ${got ? 'found' : 'not found yet'}`);
        if (got && n === animateN && !reduced) {
          s.classList.remove('landed'); void s.offsetWidth; s.classList.add('landed');
        }
      }
      if (foot) foot.textContent = notes[found.size] || notes[3];
      if (card) card.classList.toggle('all-found', found.size === 3);
    }
    paint();
    return n => {                       // called the moment a secret fires
      if (found.has(n)) return false;
      found.add(n);
      try { localStorage.setItem('secrets', JSON.stringify([...found])); } catch {}
      paint(n);
      return true;
    };
  })();

  /* ---------- nepal time ---------- */
  const nptNow = () => new Date(Date.now() + (345 + new Date().getTimezoneOffset()) * 60000);

  /* ---------- kathmandu, live: local time ---------- */
  {
    const el = $('#disp-time');
    if (el) {
      const tick = () => {
        const t = nptNow();
        el.textContent = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ' NPT';
      };
      tick();
      setInterval(tick, 30000);
    }
  }

  /* ---------- kathmandu, live: what I'm probably doing right now ---------- */
  {
    const el = $('#disp-status');
    if (el) {
      const statusFor = h =>
        h < 5 ? "should be asleep. is not." :
        h < 7 ? "asleep. correctly, for once." :
        h < 10 ? "pretending to be a morning person." :
        h < 14 ? "productive-ish. don't push it." :
        h < 17 ? "post-lunch fog. send chiya." :
        h === 17 ? "gym. (theoretical.)" :
        h < 21 ? "prime coding hours. or doom-scrolling. 50/50." :
        '"two more minutes" - narrator: it was not two minutes.';
      const tick = () => { el.textContent = statusFor(nptNow().getHours()); };
      tick();
      setInterval(tick, 60000);
    }
  }

  /* ---------- kathmandu, live: actual weather (open-meteo, no key) ---------- */
  (async () => {
    const el = $('#disp-sky');
    if (!el) return;
    try {
      let wx = null;
      try {
        const cached = JSON.parse(sessionStorage.getItem('ktm-wx') || 'null');
        if (cached && Date.now() - cached.t < 30 * 60000) wx = cached;
      } catch {}
      if (!wx) {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.72&longitude=85.32&current=temperature_2m,weather_code&timezone=Asia%2FKathmandu');
        if (!res.ok) throw new Error();
        const j = await res.json();
        wx = { t: Date.now(), temp: Math.round(j.current.temperature_2m), code: j.current.weather_code };
        sessionStorage.setItem('ktm-wx', JSON.stringify(wx));
      }
      const c = wx.code, deg = wx.temp + '°C';
      el.textContent =
        c >= 95 ? `thunderstorm over kathmandu, ${deg}. the sky is doing drama again.` :
        c >= 71 && c <= 86 && c !== 80 && c !== 81 && c !== 82 ? `snow near kathmandu, ${deg}. the yeti sends regards.` :
        c >= 80 || (c >= 51 && c <= 67) ? `raining in kathmandu, ${deg}. chappals are a mistake today.` :
        c >= 45 ? `fog over kathmandu, ${deg}. the hills went on privacy mode.` :
        c >= 1 ? `${deg} and cloudy-ish in kathmandu. certified chiya weather.` :
        `clear skies over kathmandu, ${deg}. suspicious. it never lasts.`;
    } catch { /* the "no comment" line stays */ }
  })();

  /* ---------- clash royale: live arena card ---------- */
  (async () => {
    const card = $('#cr-card');
    if (!card) return;
    try {
      let cr = null;
      try {
        const cached = JSON.parse(sessionStorage.getItem('cr-stats') || 'null');
        if (cached && Date.now() - cached.t < 15 * 60000) cr = cached;
      } catch {}
      if (!cr) {
        const res = await fetch('/api/clash');
        if (!res.ok) throw new Error();
        const j = await res.json();
        if (!j.trophies) throw new Error();
        cr = { t: Date.now(), ...j };
        sessionStorage.setItem('cr-stats', JSON.stringify(cr));
      }
      $('#cr-num').textContent = cr.trophies.toLocaleString();

      // trophy road: how close to the personal-best peak, right now
      const pct = cr.best ? Math.max(4, Math.min(100, Math.round(cr.trophies / cr.best * 100))) : 100;
      $('#cr-bar-fill').style.width = pct + '%';

      const rows = $('#cr-rows');
      rows.replaceChildren();
      const addRow = (k, v) => {
        if (!v && v !== 0) return;
        const r = document.createElement('span');
        r.className = 'cr-row';
        const kk = document.createElement('span'); kk.textContent = k;
        const vv = document.createElement('b'); vv.textContent = v;
        r.append(kk, vv);
        rows.appendChild(r);
      };
      addRow('personal best', cr.best && cr.best.toLocaleString());
      addRow('arena', cr.arena);
      addRow('king tower lvl', cr.level);
      if (cr.wins && cr.losses) addRow('battle record', `${cr.wins.toLocaleString()}W · ${cr.losses.toLocaleString()}L`);
      addRow('crutch card', cr.card);
      card.classList.remove('hidden');

      const comebacks = [
        'yes, live from the arena. no, I can’t "just win more."',
        cr.card ? `the ${cr.card} carries. I merely supervise.` : 'the deck carries. I merely supervise.',
        cr.threeCrown ? `${cr.threeCrown.toLocaleString()} three-crown wins. humility not included.` : 'ladder anxiety is a real condition and I have it.',
        cr.battles ? `${cr.battles.toLocaleString()} battles played. the homework can wait.` : 'somewhere in kathmandu, a deck is being blamed right now.',
        pct < 100 ? `${pct}% of the way back to my peak. the climb is spiritual now.` : 'this IS the peak. please clap.',
        'this number may drop while you watch. respect the volatility.',
      ];
      let crTaps = 0;
      card.addEventListener('click', () => toast('🏆 ' + comebacks[Math.min(crTaps++, comebacks.length - 1)]));
    } catch { /* stays hidden; the card never shows */ }
  })();

  /* ---------- dispatch: HARU, same clock as the roaming cat widget ---------- */
  {
    const el = $('#disp-haru');
    if (el) {
      const haruFor = h =>
        h >= 23 || h < 6 ? "asleep. as any reasonable creature would be." :
        h === 17 ? "zoomies. it's 5pm somewhere in her mind." :
        "awake, silently judging.";
      const tick = () => { el.textContent = haruFor(nptNow().getHours()); };
      tick();
      setInterval(tick, 60000);
    }
  }

  /* ---------- hero chip parallax ---------- */
  const chips = $$('.chip');
  if (!reduced && chips.length) {
    let raf = false;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        if (y < innerHeight * 1.4) {
          for (const c of chips) c.style.transform = `translateY(${y * +c.dataset.speed}px)`;
        }
        raf = false;
      });
    }, { passive: true });
  }

  /* ---------- secret #1: poke the cutout ---------- */
  const me = $('#me');
  let pokes = 0, pokeDone = false;
  me.addEventListener('click', () => {
    me.classList.remove('boing');
    void me.offsetWidth;
    me.classList.add('boing');
    if (++pokes === 5 && !pokeDone) {
      pokeDone = true;
      confetti(50);
      secrets(1);
      toast("<b>secret #1.</b> okay okay, you found me. please stop poking, I'm shy. (two more secrets hide on this page, and there's a stamp card for them at the bottom.)");
    }
  });

  /* ---------- scroll reveals ---------- */
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    }
  }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
  $$('.sec > *:not(.label), .social, .pol, .card, .track').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 6) * 40 + 'ms';
    obs.observe(el);
  });

  /* ---------- the pile: photos arrive stacked on the table, then get
     dealt out across the wall as you scroll past. --pile 1 = stacked,
     0 = laid out where the layout actually put them. ---------- */
  const walls = $$('.wall');
  if (walls.length && !reduced) {
    // a vertical column of prints collapsing into one point reads as a glitch,
    // not a pile, so the effect only runs where the wall is genuinely multi-column
    const wide = () => innerWidth > 760;

    function measurePile() {
      for (const w of walls) {
        const kids = [...w.children];
        if (!kids.length) continue;
        // offsetLeft/Top are layout positions, untouched by the transform we're
        // about to set. getBoundingClientRect would include the current pile
        // offset and every re-measure would shrink the effect toward nothing.
        const mid = k => ({
          x: k.offsetLeft + k.offsetWidth / 2,
          y: k.offsetTop + k.offsetHeight / 2,
        });
        const pts = kids.map(mid);
        const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
        const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
        kids.forEach((k, i) => {
          k.style.setProperty('--dx', (cx - pts[i].x).toFixed(1) + 'px');
          k.style.setProperty('--dy', (cy - pts[i].y).toFixed(1) + 'px');
        });
      }
    }

    function updatePile() {
      const on = wide();
      for (const w of walls) {
        if (!on) { w.style.setProperty('--pile', '0'); w.classList.remove('piled'); continue; }
        const r = w.getBoundingClientRect();
        // stacked while the wall is still low on the screen, fully dealt by the time it's read
        const from = innerHeight * .92, to = innerHeight * .34;
        const p = Math.max(0, Math.min(1, (r.top - to) / (from - to)));
        w.style.setProperty('--pile', p.toFixed(3));
        w.classList.toggle('piled', p > .5);
      }
    }

    measurePile();
    updatePile();
    let pileTick = 0;
    addEventListener('scroll', () => {
      if (pileTick) return;
      pileTick = requestAnimationFrame(() => { pileTick = 0; updatePile(); });
    }, { passive: true });
    let pileRt;
    addEventListener('resize', () => {
      clearTimeout(pileRt);
      pileRt = setTimeout(() => { measurePile(); updatePile(); }, 200);
    });
    // late-loading photos change the layout under us
    addEventListener('load', () => { measurePile(); updatePile(); });
    window.__remeasurePile = () => { measurePile(); updatePile(); };
  }

  /* ---------- rapid-fire strip: drag to scroll, then let it coast ---------- */
  const strip = $('#strip');
  if (strip) {
    let down = false, startX = 0, startL = 0, vel = 0, lastX = 0, lastT = 0, glide = 0, moved = 0;
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      cancelAnimationFrame(glide);
      down = true; startX = lastX = e.clientX; startL = strip.scrollLeft;
      lastT = performance.now(); vel = 0; moved = 0;
      strip.classList.add('dragging');
    });
    addEventListener('pointermove', e => {
      if (!down) return;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      strip.scrollLeft = startL - (e.clientX - startX);
      const now = performance.now(), dt = now - lastT;
      if (dt > 8) { vel = (e.clientX - lastX) / dt; lastX = e.clientX; lastT = now; }
    });
    // a drag that ends on a card must not also flip it
    strip.addEventListener('click', e => {
      if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; }
    }, true);
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      strip.classList.remove('dragging');
      if (reduced || Math.abs(vel) < .25) return;
      // flick physics: the cards keep sliding, then friction eats it
      let v = vel * 16;
      const coast = () => {
        strip.scrollLeft -= v;
        v *= .94;
        if (Math.abs(v) > .4) glide = requestAnimationFrame(coast);
      };
      strip.classList.add('dragging'); // scroll-snap off while it's still moving
      glide = requestAnimationFrame(coast);
      setTimeout(() => strip.classList.remove('dragging'), 900);
    });

    /* ---------- turn a card over for the bit that didn't fit on the front ---------- */
    {
      const flips = [
        '🃏 there is a back to every one of these.',
        '🃏 yes, all fourteen. I had a lot to get off my chest.',
        '🃏 you are reading the footnotes of a stranger. good.',
      ];
      let turned = 0;
      for (const card of $$('#strip .card')) {
        const flip = () => {
          card.classList.toggle('flipped');
          card.setAttribute('aria-pressed', card.classList.contains('flipped'));
          if (card.classList.contains('flipped') && ++turned % 5 === 1) {
            toast(flips[Math.min((turned - 1) / 5 | 0, flips.length - 1)]);
          }
        };
        card.addEventListener('click', flip);
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
        });
      }
    }
  }

  /* ---------- lightbox: opens one print, then walks the whole wall ---------- */
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  const lbCount = $('#lb-count'), lbFrame = lb.querySelector('.lb-frame');
  // every hangable print, in the order they sit on the page
  const gallery = $$('.pol:not(.pol-empty):not(.pol-gf)');
  let lbIndex = -1;
  const lbOpen = () => !lb.classList.contains('hidden');

  function showAt(i, dir = 0) {
    if (!gallery.length) return;
    lbIndex = (i + gallery.length) % gallery.length;   // wraps both ways
    const p = gallery[lbIndex];
    const img = p.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = p.dataset.cap || '';
    lbCount.textContent = `${lbIndex + 1} of ${gallery.length}`;
    if (dir && window.anime && !reduced) {
      anime.remove(lbFrame);
      anime({
        targets: lbFrame,
        translateX: [dir * 42, 0],
        opacity: [0, 1],
        duration: 340,
        easing: 'cubicBezier(.2,1,.3,1)',
      });
    }
  }
  function openLightbox(i) {
    showAt(i);
    lb.classList.remove('hidden');
    lb.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
    $('#lb-close').focus();
    if (window.anime && !reduced) {
      anime.remove(lbFrame);
      anime({
        targets: lbFrame,
        scale: [.6, 1],
        rotate: [-6, Math.random() * 4 - 2],
        opacity: [0, 1],
        duration: 550,
        easing: 'spring(1, 80, 11, 0)',
      });
    }
  }
  function closeLightbox() {
    if (!lbOpen()) return;
    lb.classList.add('hidden');
    lb.removeAttribute('aria-modal');
    lbImg.src = '';
    document.body.style.overflow = '';
    // hand focus back to whichever print you ended up on
    const back = gallery[lbIndex];
    if (back && back.focus) back.focus();
  }
  const step = d => showAt(lbIndex + d, d);

  // the frames are <figure>s, so they need the button treatment by hand:
  // without this the whole photo wall is mouse-only
  gallery.forEach((p, i) => {
    p.tabIndex = 0;
    p.setAttribute('role', 'button');
    p.setAttribute('aria-label', `Open photo: ${p.dataset.cap || p.querySelector('img').alt || 'photo'}`);
    p.addEventListener('click', () => openLightbox(i));
    p.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  $('#lb-close').addEventListener('click', closeLightbox);
  $('#lb-prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
  $('#lb-next').addEventListener('click', e => { e.stopPropagation(); step(1); });
  // three controls in there now, so keep Tab cycling between them
  lb.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const stops = [$('#lb-prev'), $('#lb-next'), $('#lb-close')];
    const at = stops.indexOf(document.activeElement);
    e.preventDefault();
    stops[(at + (e.shiftKey ? -1 : 1) + stops.length) % stops.length].focus();
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') return closeLightbox();
    if (!lbOpen()) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });
  // swipe on the print itself
  {
    let sx = 0, sy = 0, tracking = false;
    lbFrame.addEventListener('pointerdown', e => { tracking = true; sx = e.clientX; sy = e.clientY; });
    lbFrame.addEventListener('pointerup', e => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - sy)) step(dx < 0 ? 1 : -1);
    });
    lbFrame.addEventListener('pointercancel', () => { tracking = false; });
  }

  /* ---------- the girlfriend file: schrödinger edition.
     never unblurs. confirms nothing. denies nothing. ---------- */
  const gf = $('#gf-card');
  if (gf) {
    const gfLines = [
      '🔒 no comment.',
      '🕵️ the file is sealed. by management.',
      '🧪 schrödinger’s girlfriend: opening the box ruins everything.',
      '🔒 hoina bro. sealed means sealed.',
      '📁 happiness status: classified. next question.',
    ];
    let gfTaps = 0;
    const gfDeny = () => {
      gf.classList.remove('deny');
      void gf.offsetWidth;
      gf.classList.add('deny');
      if (gfTaps === 1) $('#gf-veil').textContent = 'nice try 🔒';
      toast(gfLines[Math.min(gfTaps++, gfLines.length - 1)]);
    };
    gf.addEventListener('click', gfDeny);
    gf.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gfDeny(); }
    });
  }

  /* ---------- classified file: escalating taps ---------- */
  const escalations = {
    phone: [
      '🕵️ nice try.',
      '🕵️ nahh. you pressed it again.',
      '🕵️ still no. impressive commitment though.',
      '🕵️ third… fourth? this is a relationship now.',
      '🚨 security has been notified. she ignored that too.',
      '🕵️ fine, a hint: it starts with 9. like most numbers here.',
      '🔒 the number remains classified. forever. email me instead.',
    ],
    addr: [
      '🕵️ bold of you.',
      '🕵️ again? the pizza guy gave up faster.',
      '🕵️ it’s on a street. that narrows it down to most streets.',
      '🔒 final answer: no. but I respect the hustle.',
    ],
  };
  const tapCount = {};
  $$('.redacted').forEach(b => {
    b.addEventListener('click', () => {
      const key = b.dataset.key;
      const list = escalations[key] || ['no.'];
      const i = tapCount[key] = (tapCount[key] ?? -1) + 1;
      toast(list[Math.min(i, list.length - 1)]);
      if (i === list.length - 1) confetti(24);
    });
  });

  /* ---------- id badge: grab it, drag it, let it swing back ---------- */
  const badge = $('#badge');
  {
    let held = false, startX = 0, startRot = 0, rot = 0;
    const MAX_ROT = 38;
    badge.addEventListener('pointerdown', e => {
      held = true;
      startX = e.clientX;
      startRot = rot;
      // the idle sway owns transform while animating; physics mode hands it to us
      badge.classList.add('phys', 'held');
      if (window.anime) anime.remove(badge);
      try { badge.setPointerCapture(e.pointerId); } catch {}
      e.preventDefault();
    });
    badge.addEventListener('pointermove', e => {
      if (!held) return;
      // badge hangs from the top, so a rightward drag must swing the bottom right,
      // which is a *negative* CSS rotation around a top pivot — hence the minus sign
      rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, startRot - (e.clientX - startX) * .28));
      badge.style.transform = `rotate(${rot}deg)`;
    });
    const release = () => {
      if (!held) return;
      held = false;
      badge.classList.remove('held');
      if (window.anime && !reduced) {
        anime({
          targets: badge,
          rotate: 0,
          duration: 1400,
          easing: 'easeOutElastic(1, .25)',
          complete: () => {
            rot = 0;
            badge.style.transform = '';
            badge.classList.remove('phys'); // idle sway resumes
          },
        });
      } else {
        rot = 0;
        badge.style.transform = '';
        badge.classList.remove('phys');
      }
    };
    badge.addEventListener('pointerup', release);
    badge.addEventListener('pointercancel', release);
  }

  /* ---------- whiteboard ---------- */
  const board = $('#board');
  if (board) {
    const ctx = board.getContext('2d');
    let color = '#221E19', drawing = false, last = null, dirty = false;

    function sizeBoard() {
      const snap = dirty ? ctx.getImageData(0, 0, board.width, board.height) : null;
      const r = board.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      board.width = Math.round(r.width * dpr);
      board.height = Math.round(r.height * dpr);
      ctx.scale(dpr, dpr);
      ctx.lineCap = ctx.lineJoin = 'round';
      if (snap) ctx.putImageData(snap, 0, 0);
      else drawHint();
    }

    /* an empty white rectangle tells nobody it's a whiteboard.
       this sits on the canvas until the first stroke wipes it. */
    function drawHint() {
      if (dirty) return;
      const r = board.getBoundingClientRect();
      const cx = r.width / 2, cy = r.height / 2;
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.save();
      ctx.globalAlpha = .32;
      ctx.fillStyle = '#221E19';
      ctx.textAlign = 'center';
      ctx.font = '600 27px Caveat, cursive';
      ctx.fillText('go on. draw something here.', cx, cy - 4);
      ctx.strokeStyle = '#221E19';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();               // a little squiggle, drawn by nobody
      ctx.moveTo(cx - 48, cy + 26);
      ctx.bezierCurveTo(cx - 16, cy + 10, cx + 16, cy + 42, cx + 48, cy + 24);
      ctx.stroke();
      ctx.restore();
    }
    function clearHint() {
      if (dirty) return;
      const r = board.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
    }

    sizeBoard();
    // Caveat may still be loading when the board first paints
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawHint).catch(() => {});
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeBoard, 200); });

    const pos = e => {
      const r = board.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    board.addEventListener('pointerdown', e => {
      clearHint();                 // the prompt goes before the first mark lands
      drawing = true; dirty = true; last = pos(e);
      board.setPointerCapture(e.pointerId);
    });
    board.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = pos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    });
    const stop = () => { drawing = false; };
    board.addEventListener('pointerup', stop);
    board.addEventListener('pointercancel', stop);

    $$('.dot').forEach((d, i) => {
      if (i === 0) d.classList.add('on');
      d.addEventListener('click', () => {
        color = d.dataset.color;
        $$('.dot').forEach(x => x.classList.remove('on'));
        d.classList.add('on');
      });
    });
    $('#board-clear').addEventListener('click', () => {
      ctx.clearRect(0, 0, board.width, board.height);
      dirty = false;
      drawHint();
      toast('🧽 wiped. like it never happened.');
    });
    $('#board-save').addEventListener('click', () => {
      if (!dirty) { toast('🖍️ draw something first. I can\'t frame an empty board.'); return; }
      const a = document.createElement('a');
      a.download = 'my-masterpiece-for-martin.png';
      a.href = board.toDataURL('image/png');
      a.click();
      toast('🖼️ saved. hang it on your fridge.');
    });
  }

  /* ---------- anonymous notes: land in a google sheet via an Apps Script web app ---------- */
  const NOTES_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzsK7O2ZS_4MmtbSleY76mx92a8r9nogJTZfAYVDRkT_EBJMomyVpp743VGG_JMm_IsRw/exec';
  const wall = $('#notes-wall');

  /* ---------- the book: entries live in a store, pages render from it ---------- */
  const PER_PAGE = 4;
  const entries = ['be nice. or at least be funny. , management']; // the house rule, page one
  let bookPage = 0;

  const pageCount = () => Math.max(1, Math.ceil(entries.length / PER_PAGE));

  function renderPage(turning) {
    if (!wall) return;
    bookPage = Math.max(0, Math.min(bookPage, pageCount() - 1));
    const slice = entries.slice(bookPage * PER_PAGE, bookPage * PER_PAGE + PER_PAGE);
    const paint = () => {
      wall.replaceChildren();
      if (!slice.length) {
        const e = document.createElement('p');
        e.className = 'note-empty';
        e.textContent = 'nothing on this page yet.';
        wall.appendChild(e);
      }
      for (const t of slice) {
        const n = document.createElement('div');
        n.className = 'note';
        n.style.setProperty('--r', (Math.random() * 1.6 - .8).toFixed(2) + 'deg');
        n.textContent = t;
        wall.appendChild(n);
      }
      const no = $('#page-no');
      if (no) no.textContent = String(bookPage * 2 + 1);
      const label = $('#page-label');
      if (label) label.textContent = `page ${bookPage + 1} of ${pageCount()}`;
      const prev = $('#page-prev'), next = $('#page-next');
      if (prev) prev.disabled = bookPage === 0;
      if (next) next.disabled = bookPage >= pageCount() - 1;
    };
    const left = $('#book-left');
    if (turning && left && !reduced) {
      left.classList.remove('turning');
      void left.offsetWidth;
      left.classList.add('turning');
      setTimeout(paint, 230);              // repaint while the page is edge-on
      setTimeout(() => left.classList.remove('turning'), 460);
    } else paint();
  }

  function updateCover() {
    const c = $('#book-count');
    if (!c) return;
    const n = entries.length - 1;          // the house rule isn't a signature
    c.textContent = n <= 0 ? "nobody's signed it yet"
      : n === 1 ? '1 signature inside'
      : `${n} signatures inside`;
  }

  function pinNote(text) {
    entries.push(text);
    updateCover();
  }

  {
    const cover = $('#book-open'), inner = $('#book-inner');
    if (cover && inner) {
      const setOpen = open => {
        inner.classList.toggle('hidden', !open);
        cover.classList.toggle('hidden', open);
        cover.setAttribute('aria-expanded', String(open));
      };
      cover.addEventListener('click', () => {
        bookPage = pageCount() - 1;        // opens to the most recent page
        renderPage(false);
        setOpen(true);
        const t = $('#note-text');
        if (t) t.focus({ preventScroll: true });
      });
      $('#book-close').addEventListener('click', () => { setOpen(false); cover.focus(); });
      $('#page-prev').addEventListener('click', () => { bookPage--; renderPage(true); });
      $('#page-next').addEventListener('click', () => { bookPage++; renderPage(true); });
    }
  }
  /* the wall is public when /api/notes is configured, and falls back to
     this browser's own notes when it isn't (local dev, or before setup) */
  let wallIsPublic = false;
  (async () => {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('notes ' + res.status);
      const { notes } = await res.json();
      wallIsPublic = true;
      // only now is it true that other people will read this
      const privacy = $('#notes-privacy');
      if (privacy) privacy.textContent =
        "no name, no login, no consequences. it goes up on this wall for everyone to read, " +
        "and lands in my spreadsheet too. still anonymous, I can't see who you are either.";
      if (Array.isArray(notes) && notes.length) {
        for (const n of notes) pinNote(n.text);
      }
    } catch {
      // no shared book yet: show what this visitor wrote before
      try {
        JSON.parse(localStorage.getItem('notes') || '[]').slice(-24).forEach(pinNote);
      } catch {}
    }
    updateCover();
    renderPage(false);
  })();

  $('#note-form').addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#note-trap').value) return; // bots pin nothing
    const box = $('#note-text');
    const msg = box.value.trim();
    if (!msg) return;
    const btn = e.target.querySelector('.pin-btn');
    btn.disabled = true; btn.textContent = 'signing…';

    pinNote(msg);
    bookPage = pageCount() - 1;      // land on the page their signature just went to
    renderPage(true);
    try {
      const stored = JSON.parse(localStorage.getItem('notes') || '[]');
      stored.push(msg);
      localStorage.setItem('notes', JSON.stringify(stored.slice(-24)));
    } catch {}

    // the shared wall first, then martin's own copy in the sheet
    let onWall = false, tooFast = false;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg }),
      });
      if (res.status === 429) tooFast = true;
      else if (res.ok) onWall = true;
    } catch {}

    let filed = false;
    try {
      const res = await fetch(NOTES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ message: msg, when: new Date().toISOString() }),
      });
      filed = res.ok;
    } catch {}

    if (tooFast) {
      toast('✋ easy. the book needs a second to breathe.');
    } else if (onWall) {
      toast('✍️ signed. it’s in the book now, where everyone can read it. no name attached.');
      confetti(36);
    } else if (filed) {
      toast('📬 pugyo! filed in the secret spreadsheet. martin reads it with morning chiya.');
      confetti(36);
    } else {
      toast('✍️ signed the book. delivery gremlins are on strike though, so if it’s important: DM me.');
    }
    box.value = '';
    btn.disabled = false; btn.textContent = 'sign it';
  });

  /* ---------- yt music playlist sync: pulls from the public playlist below ---------- */
  const MUSIC = {
    playlistId: 'PLd24CpR0JfXc',
    max: 6, // the anthem lives outside this list, as track 00
    // pins render first, in order. a pin with `match` uses the playlist's own copy when present.
    pins: [
      { match: /com[eë]\s*(&|n|and)?\s*go/i, id: '7ccyYIfoRPg', title: 'COMË N GO', artist: 'Yeat', cap: 'the anthem (unofficial division)' },
    ],
  };
  const CAPTIONS = [
    'the 2am compile companion',
    'windows-down certified',
    'on loop since tuesday',
    'gym opener. non-negotiable.',
    'skips: zero. discipline: questionable.',
    'main character walk certified',
    'diet-era anthem',
    'keyboard percussion backing track',
    'plays itself at this point',
    'the reply-to-emails one',
  ];
  async function syncMusic() {
    const box = $('#tracks');
    if (!box) return;

    let items = null;
    try {
      const cached = JSON.parse(localStorage.getItem('yt-rotation-v4') || 'null');
      if (cached && Date.now() - cached.t < 6 * 3600e3) items = cached.items;
    } catch {}

    if (!items) {
      try {
        const res = await fetch("/api/youtube");
        if (!res.ok) throw new Error('yt ' + res.status);
        const data = await res.json();
        items = (data.items || [])
          .map(i => i.snippet)
          .filter(s => s && s.resourceId && s.title !== 'Private video' && s.title !== 'Deleted video')
          .map(s => ({
            id: s.resourceId.videoId,
            title: s.title,
            artist: (s.videoOwnerChannelTitle || '').replace(/ - Topic$/, ''),
          }));
        for (const pin of [...MUSIC.pins].reverse()) {
          const i = pin.match ? items.findIndex(s => pin.match.test(s.title)) : -1;
          const found = i >= 0 ? items.splice(i, 1)[0] : null;
          items.unshift(found
            ? { ...found, cap: pin.cap }
            : { id: pin.id, title: pin.title, artist: pin.artist, cap: pin.cap });
        }
        items = items.slice(0, MUSIC.max);
        localStorage.setItem('yt-rotation-v4', JSON.stringify({ t: Date.now(), items }));
      } catch (err) {
        console.warn('playlist sync skipped:', err);
        return; // fallback list stays
      }
    }
    if (!items || !items.length) return;

    // each song keeps "its" caption (hashed from video id) until the playlist changes
    const used = new Set();
    const capFor = id => {
      let h = 0;
      for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      let i = h % CAPTIONS.length;
      while (used.has(i)) i = (i + 1) % CAPTIONS.length;
      used.add(i);
      return CAPTIONS[i];
    };

    box.innerHTML = '';
    items.slice(0, MUSIC.max).forEach((s, n) => {
      const a = document.createElement('a');
      a.className = 'track';
      a.href = `https://music.youtube.com/watch?v=${encodeURIComponent(s.id)}`;
      a.target = '_blank'; a.rel = 'noopener';
      const num = document.createElement('span');
      num.className = 't-num'; num.textContent = String(n + 1).padStart(2, '0'); // 00 is the anthem, outside this list
      const body = document.createElement('span');
      body.className = 't-body';
      const b = document.createElement('b'); b.textContent = s.title;
      const artist = document.createElement('span'); artist.textContent = s.artist || 'unknown, like my sleep schedule';
      const cap = document.createElement('span'); cap.className = 't-cap hand'; cap.textContent = s.cap || capFor(s.id);
      body.append(b, artist, cap);
      const go = document.createElement('span'); go.className = 't-go'; go.textContent = '▶';
      a.append(num, body, go);
      box.appendChild(a);
    });
  }
  syncMusic();

  /* ---------- track 00: the anthem, played on-site ---------- */
  const anthemBtn = $('#anthem-btn');
  if (anthemBtn) {
    const embed = $('#anthem-embed');
    let playing = false;
    anthemBtn.addEventListener('click', () => {
      playing = !playing;
      if (playing) {
        embed.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/F0GYEj_jhWY?autoplay=1&rel=0" title="Sayaun Thunga Phulka, the national anthem of Nepal" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        embed.classList.remove('hidden');
        anthemBtn.textContent = '■';
        anthemBtn.setAttribute('aria-label', 'Stop the anthem');
      } else {
        embed.innerHTML = '';
        embed.classList.add('hidden');
        anthemBtn.textContent = '▶';
        anthemBtn.setAttribute('aria-label', 'Play the national anthem of Nepal');
      }
    });
  }

  /* ---------- HARU corrects the record ---------- */
  const catLine = $('#cat-line');
  if (catLine && !reduced) {
    let done = false;
    new IntersectionObserver((es, io) => {
      if (done || !es.some(e => e.isIntersecting)) return;
      done = true;
      io.disconnect();
      setTimeout(() => {
        const runner = $('#pet-svg').cloneNode(true);
        runner.removeAttribute('id');
        // drop the cloned <defs> so the gradients/clips resolve to the original's ids
        // instead of duplicating every one of them into the document
        runner.querySelector('defs')?.remove();
        runner.classList.remove('pet-flip');
        runner.classList.add('scratch-cat');
        catLine.appendChild(runner);

        const w = catLine.getBoundingClientRect().width;
        const runDuration = 2200; // slow, readable trot, not a blur
        runner.animate([
          { transform: 'translateX(-90px)', offset: 0 },
          { transform: `translateX(${w * .38}px)`, offset: .45 },
          { transform: `translateX(${w * .42}px)`, offset: .55 },
          { transform: `translateX(${w + 20}px)`, offset: 1 },
        ], { duration: runDuration, easing: 'linear', fill: 'forwards' });

        setTimeout(() => {
          $('#scratch-target').classList.add('scratched');
        }, runDuration * .5);
        setTimeout(() => {
          const editEl = $('#cat-edit');
          editEl.classList.remove('hidden');
          requestAnimationFrame(() => editEl.classList.add('show'));
          runner.remove();
        }, runDuration + 300);
      }, 1600);
    }, { threshold: .35 }).observe(catLine);
  } else if (catLine && reduced) {
    $('#scratch-target').classList.add('scratched');
    $('#cat-edit').classList.remove('hidden');
  }

  /* ---------- secret #2: konami code ---------- */
  const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let ki = 0, konamiDone = false;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    ki = k === CODE[ki] ? ki + 1 : (k === CODE[0] ? 1 : 0);
    if (ki === CODE.length) {
      ki = 0;
      confetti(140);
      if (!konamiDone) {
        konamiDone = true;
        secrets(2);
        toast('<b>secret #2.</b> the old codes still work. you absolute legend.');
      }
    }
  });

  /* ---------- secret #3: make the star dizzy ---------- */
  const star = $('#dizzy-star');
  let stars = 0, starDone = false;
  star.addEventListener('click', () => {
    star.style.animationDuration = Math.max(.4, 14 - stars * 3) + 's';
    if (++stars >= 5 && !starDone) {
      starDone = true;
      confetti(60);
      secrets(3);
      toast('<b>secret #3.</b> you made the star dizzy. that’s all three. we should talk.');
    }
  });

  /* ---------- the sighting: dad photo cinematic reveal (scroll-scrubbed) ---------- */
  const sightingStage = $('#sighting-stage');
  const sightingPhoto = $('#sighting-photo');
  const sightingHeadline = $('#sighting-headline');
  if (sightingStage && sightingPhoto && sightingHeadline) {
    if (reduced) {
      sightingStage.style.setProperty('--p', 1);
    } else {
      let shift = 0;
      const computeShift = () => {
        if (window.innerWidth <= 900) { shift = 0; return; }
        const centerX = sightingPhoto.offsetLeft + sightingPhoto.offsetWidth / 2;
        shift = (sightingStage.clientWidth / 2) - centerX;
      };
      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = sightingStage.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.88;
        const end = vh * 0.22;
        const p = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        sightingStage.style.setProperty('--p', p);
        sightingStage.style.setProperty('--shift', shift + 'px');
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };
      computeShift();
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { computeShift(); update(); }, 150);
      });
    }
  }

  /* ---------- footer peek ---------- */
  const peek = $('#peek');
  new IntersectionObserver(entries => {
    for (const e of entries) peek.classList.toggle('up', e.isIntersecting);
  }, { threshold: .4 }).observe($('.foot'));
  peek.addEventListener('click', () => {
    confetti(30);
    toast('👀 you scrolled all the way down. respect.');
  });

  /* ---------- HARU.exe: roams the page on nepal time ---------- */
  const pet = $('#haru-pet');
  if (pet && !reduced) {
    const petSvg = $('#pet-svg'), petBubble = $('#pet-bubble');
    const roam = () => Math.max(10, innerWidth - 96);
    const petMode = () => {
      const h = nptNow().getHours();
      if (h >= 23 || h < 6) return 'sleep';   // cat hours are sacred
      if (h === 17) return 'zoomies';          // 5pm. she doesn't make the rules either
      return 'day';
    };
    const chiya = $('#chiya');
    let px = -90, ptarget = 140, pspeed = 42, presting = false, plast = performance.now();
    let wasWalking = false, wasFlipped = false;
    let chiyaX = 0, chiyaAlive = false, onArrive = null;

    // leg/body trot cadence scales with speed, so a fast dash actually looks fast instead of gliding
    function setSpeed(v) {
      pspeed = v;
      pet.style.setProperty('--pet-step', `${(.32 * (42 / v)).toFixed(3)}s`);
    }
    setSpeed(pspeed);

    function speak(text, ms = 1700) {
      petBubble.textContent = text;
      petBubble.style.setProperty('--bubble-shift', '0px');
      petBubble.classList.remove('hidden');
      // long messages near a screen edge get nudged back on-screen instead of running off it
      requestAnimationFrame(() => {
        const r = petBubble.getBoundingClientRect();
        const margin = 10;
        let shift = 0;
        if (r.left < margin) shift = margin - r.left;
        else if (r.right > innerWidth - margin) shift = (innerWidth - margin) - r.right;
        if (shift) petBubble.style.setProperty('--bubble-shift', shift + 'px');
      });
      setTimeout(() => petBubble.classList.add('hidden'), ms);
    }
    const clearIdle = () => pet.classList.remove('sitting', 'grooming');

    function petRest() {
      presting = true;
      pet.classList.remove('walking');
      wasWalking = false;
      const mode = petMode();
      pet.classList.toggle('sleeping', mode === 'sleep');

      // a resting cat is never just standing there. she sits, or she grooms.
      if (mode === 'day') {
        const r = Math.random();
        pet.classList.toggle('grooming', r < .35);
        pet.classList.toggle('sitting', r >= .35 && r < .8);
      } else clearIdle();

      const wait = mode === 'sleep' ? 45000
        : mode === 'zoomies' ? 500 + Math.random() * 1200
        : pet.classList.contains('grooming') ? 4200 + Math.random() * 3400
        : 2600 + Math.random() * 5200;
      setTimeout(() => {
        const m = petMode();
        pet.classList.toggle('sleeping', m === 'sleep');
        if (m === 'sleep') return petRest(); // keep napping, recheck later
        clearIdle();
        setSpeed(m === 'zoomies' ? 200 : 42);
        presting = false;
        // if there's a glass of chiya on the ledge, it becomes the destination
        if (chiyaAlive && m === 'day' && Math.random() < .55) {
          onArrive = swatChiya;
          ptarget = Math.max(6, chiyaX - 44);
        } else {
          onArrive = null;
          ptarget = 10 + Math.random() * roam();
        }
      }, wait);
    }

    /* ---------- the chiya glass: placed by a human, removed by a cat ---------- */
    function spawnChiya() {
      if (!chiya || chiyaAlive || petMode() === 'sleep') return;
      chiyaX = 70 + Math.random() * Math.max(60, roam() - 150);
      chiya.style.setProperty('--cx', chiyaX + 'px');
      chiya.classList.remove('falling');
      chiya.classList.add('here');
      chiyaAlive = true;
    }
    function swatChiya() {
      if (!chiyaAlive) return petRest();
      presting = true;
      pet.classList.remove('walking');
      wasWalking = false;
      pet.classList.add('sitting');       // sit. assess. commit.
      setTimeout(() => speak('this glass is in my way.', 1500), 500);
      setTimeout(() => {
        chiya.classList.add('falling');
        clearIdle();
      }, 2100);
      setTimeout(() => {
        chiya.classList.remove('here', 'falling');
        chiyaAlive = false;
        speak(['gravity works. tested it.', 'the floor needed it more.', 'I regret nothing.', 'that was an experiment.'][Math.floor(Math.random() * 4)], 2200);
        setTimeout(spawnChiya, 55000 + Math.random() * 50000);
      }, 3100);
      setTimeout(() => { onArrive = null; petRest(); }, 3400);
    }
    setTimeout(spawnChiya, 22000 + Math.random() * 15000);
    function petTick(now) {
      const dt = Math.min((now - plast) / 1000, .1);
      plast = now;
      if (!presting) {
        const d = ptarget - px;
        px += Math.sign(d) * Math.min(Math.abs(d), pspeed * dt);
        const flipped = d < 0;
        if (flipped !== wasFlipped) { petSvg.classList.toggle('pet-flip', flipped); wasFlipped = flipped; }
        if (!wasWalking) { pet.classList.add('walking'); clearIdle(); wasWalking = true; }
        if (Math.abs(d) < 2) { const done = onArrive; onArrive = null; (done || petRest)(); }
        pet.style.transform = `translateX(${px}px)`;
      }
      requestAnimationFrame(petTick);
    }
    // zzz while asleep
    setInterval(() => {
      if (pet.classList.contains('sleeping') && petBubble.classList.contains('hidden')) speak('z z z', 1500);
    }, 9000);

    const meows = [
      'mrrp.', 'khoi?', 'feed me, kta.', 'busy. clearly.', 'ma HARU. yes, THE haru.',
      'ok one pat. ONE.', 'I was mid-bath. rude.', 'you scroll loud.',
      'he writes the code. I approve it.', 'this is my website. he just pays for it.',
      'stop reading. start feeding.',
    ];
    petSvg.addEventListener('click', () => {
      clearIdle();
      if (petMode() === 'sleep') {
        const t = nptNow();
        speak(`it is ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')} in kathmandu. why are YOU awake?`, 2600);
        return; // no zoomies. she is off the clock.
      }
      speak(petMode() === 'zoomies' ? "it's 5pm. I don't make the rules." : meows[Math.floor(Math.random() * meows.length)]);
      presting = false;
      setSpeed(280);
      ptarget = 10 + Math.random() * roam();
    });

    /* scroll like you mean it and she bolts. cats do not negotiate with sudden movement. */
    {
      // she gets a grace period on arrival, then startles at most once every 22s
      let lastY = scrollY, lastT = performance.now(), lastSpook = performance.now();
      addEventListener('scroll', () => {
        const now = performance.now(), dt = now - lastT;
        if (dt < 90) return;
        const v = Math.abs(scrollY - lastY) / dt; // px per ms
        lastY = scrollY; lastT = now;
        if (v < 3.2 || petMode() === 'sleep' || now - lastSpook < 22000) return;
        lastSpook = now;
        clearIdle();
        pet.classList.add('spooked');
        speak('!!', 900);
        onArrive = null;
        presting = false;
        setSpeed(340);
        // straight for the nearest wall, obviously
        ptarget = px < innerWidth / 2 ? 6 : roam();
        setTimeout(() => pet.classList.remove('spooked'), 700);
        setTimeout(() => speak('I meant to do that.', 1800), 1500);
      }, { passive: true });
    }

    // spawn: asleep cats start on-screen, awake ones stroll in
    if (petMode() === 'sleep') {
      px = 36;
      pet.style.transform = 'translateX(36px)';
      pet.classList.add('sleeping');
      presting = true;
      petRest();
    } else {
      setTimeout(() => { presting = false; }, 1500);
    }
    requestAnimationFrame(petTick);
  }

  /* ---------- paper grain drifts under the ink ---------- */
  if (!reduced && !matchMedia('(pointer:coarse)').matches) {
    let graining = false;
    addEventListener('scroll', () => {
      if (graining) return;
      graining = true;
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--grain-y', (scrollY * .06 % 13).toFixed(2) + 'px');
        graining = false;
      });
    }, { passive: true });
  }

  /* ---------- section labels: wet ink settling ---------- */
  {
    const inkObs = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); inkObs.unobserve(e.target); }
    }, { threshold: .6 });
    $$('.label').forEach(l => { l.classList.add('ink'); inkObs.observe(l); });
  }

  /* ---------- torn edges rip open on arrival ---------- */
  {
    const tearObs = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); tearObs.unobserve(e.target); }
    }, { threshold: .5 });
    $$('.tear').forEach(t => tearObs.observe(t));
  }

  /* ---------- stamps land, they don't fade ---------- */
  if (!reduced) {
    const stampObs = new IntersectionObserver(es => {
      for (const e of es) {
        if (!e.isIntersecting) continue;
        stampObs.unobserve(e.target);
        setTimeout(() => e.target.classList.add('thud'), 260);
      }
    }, { threshold: .9 });
    $$('.dossier-wrap .stamp, .gf-stamp').forEach(s => stampObs.observe(s));
  }

  /* ---------- polaroids: picked up off the table ---------- */
  if (!reduced && !matchMedia('(pointer:coarse)').matches) {
    for (const p of $$('.pol')) {
      p.addEventListener('pointermove', e => {
        const r = p.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        p.classList.add('tilting');
        p.style.setProperty('--ry', ((nx - .5) * 14).toFixed(2) + 'deg');
        p.style.setProperty('--rx', ((.5 - ny) * 11).toFixed(2) + 'deg');
        p.style.setProperty('--mx', (nx * 100).toFixed(1) + '%');
        p.style.setProperty('--my', (ny * 100).toFixed(1) + '%');
      });
      p.addEventListener('pointerleave', () => {
        p.classList.remove('tilting');
        p.style.removeProperty('--rx');
        p.style.removeProperty('--ry');
      });
    }
  }

  /* ---------- shuffle the evidence: deal the photos again (FLIP) ---------- */
  {
    const shuffleBtn = $('#shuffle-btn'), wall = $('#evidence-wall');
    const lines = [
      '🃏 same life, new order. still no plot.',
      '🃏 reshuffled. the story does not improve.',
      '🃏 dealt again. HARU still outranks me.',
      '🃏 you are now looking at my life out of order. as intended.',
    ];
    let shuffles = 0, busy = false;
    if (shuffleBtn && wall) shuffleBtn.addEventListener('click', () => {
      if (busy) return;
      busy = true;
      shuffleBtn.classList.add('spun');
      setTimeout(() => shuffleBtn.classList.remove('spun'), 560);

      const kids = [...wall.children];
      const before = new Map(kids.map(k => [k, k.getBoundingClientRect()]));
      for (const k of kids.slice().sort(() => Math.random() - .5)) wall.appendChild(k);

      if (!reduced) for (const k of kids) {
        const a = before.get(k), b = k.getBoundingClientRect();
        const dx = a.left - b.left, dy = a.top - b.top;
        if (!dx && !dy) continue;
        const lift = -14 - Math.random() * 16;
        k.animate([
          { transform: `translate(${dx}px,${dy}px) rotate(${(Math.random() * 10 - 5).toFixed(1)}deg)` },
          { transform: `translate(${dx * .4}px,${dy * .4 + lift}px) rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`, offset: .5 },
          { transform: 'none' },
        ], { duration: 620, easing: 'cubic-bezier(.2,1,.3,1)' });
      }
      if (++shuffles === 1 || shuffles % 3 === 0) toast(lines[Math.min(shuffles - 1, lines.length - 1)]);
      // the deal changed where every print lives, so the pile offsets are stale
      if (window.__remeasurePile) setTimeout(window.__remeasurePile, 660);
      setTimeout(() => { busy = false; }, 640);
    });
  }

  /* ---------- socials lean toward the cursor ---------- */
  if (!reduced && !matchMedia('(pointer:coarse)').matches) {
    for (const s of $$('.social')) {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--sx', (((e.clientX - r.left) / r.width - .5) * 11).toFixed(1) + 'px');
        s.style.setProperty('--sy', ((((e.clientY - r.top) / r.height - .5) * 8) - 5).toFixed(1) + 'px');
      });
      s.addEventListener('pointerleave', () => {
        s.style.removeProperty('--sx');
        s.style.removeProperty('--sy');
      });
    }
  }

  /* ---------- the letter folds itself back up (scroll-scrubbed, reversible) ---------- */
  {
    const psStage = $('#ps-stage'), psNote = $('#ps-note');
    if (psStage && psNote && !reduced) {
      let psTick = false;
      const psUpdate = () => {
        psTick = false;
        const vh = innerHeight, bottom = psNote.getBoundingClientRect().bottom;
        // the fold must be able to finish before the page runs out of scroll,
        // so the range stays well inside the runway + footer below the note
        const f = Math.min(1, Math.max(0, (vh * .86 - bottom) / (vh * .36)));
        psStage.style.setProperty('--f', f.toFixed(3));
      };
      psUpdate();
      addEventListener('scroll', () => {
        if (psTick) return;
        psTick = true;
        requestAnimationFrame(psUpdate);
      }, { passive: true });
      addEventListener('resize', psUpdate);
    }
  }

  /* ---------- keep photos from being right-click/drag-saved ---------- */
  document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

  /* ---------- tiny delights ---------- */
  $$('a[href^="mailto"]').forEach(a => a.addEventListener('click', () => confetti(40)));
  $('#year').textContent = new Date().getFullYear();
})();
