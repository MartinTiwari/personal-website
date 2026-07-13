// martin tiwari. handmade, zero frameworks (anime.js guest-stars for flourishes)
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

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

  /* ---------- nepal time ---------- */
  const nptNow = () => new Date(Date.now() + (345 + new Date().getTimezoneOffset()) * 60000);

  /* ---------- kathmandu, live ---------- */
  {
    const clock = $('#npt-clock');
    const tick = () => {
      const t = nptNow();
      clock.textContent = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0');
    };
    tick();
    setInterval(tick, 30000);
    $('#npt-live').classList.remove('hidden');
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
      toast("<b>secret #1.</b> okay okay, you found me. please stop poking, I'm shy. (two more secrets hide on this page.)");
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

  /* ---------- rapid-fire strip: drag to scroll on desktop ---------- */
  const strip = $('#strip');
  if (strip) {
    let down = false, startX = 0, startL = 0;
    strip.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;
      down = true; startX = e.clientX; startL = strip.scrollLeft;
      strip.classList.add('dragging');
    });
    addEventListener('pointermove', e => {
      if (down) strip.scrollLeft = startL - (e.clientX - startX);
    });
    addEventListener('pointerup', () => { down = false; strip.classList.remove('dragging'); });
  }

  /* ---------- lightbox for polaroids ---------- */
  const lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap');
  function openLightbox(src, alt, cap) {
    lbImg.src = src; lbImg.alt = alt || '';
    lbCap.textContent = cap || '';
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const frame = lb.querySelector('.lb-frame');
    if (window.anime && !reduced) {
      anime.remove(frame);
      anime({
        targets: frame,
        scale: [.6, 1],
        rotate: [-6, Math.random() * 4 - 2],
        opacity: [0, 1],
        duration: 550,
        easing: 'spring(1, 80, 11, 0)',
      });
    }
  }
  function closeLightbox() {
    lb.classList.add('hidden');
    lbImg.src = '';
    document.body.style.overflow = '';
  }
  $$('.pol:not(.pol-empty):not(.pol-gf)').forEach(p => {
    p.addEventListener('click', () => {
      const img = p.querySelector('img');
      openLightbox(img.currentSrc || img.src, img.alt, p.dataset.cap);
    });
  });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  $('#lb-close').addEventListener('click', closeLightbox);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

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

  /* ---------- id badge: tug it (pure CSS, runs on the compositor) ---------- */
  const badge = $('#badge');
  badge.addEventListener('pointerdown', () => {
    badge.classList.remove('tugged');
    void badge.offsetWidth;
    badge.classList.add('tugged');
  });
  badge.addEventListener('animationend', e => {
    if (e.animationName === 'tug') badge.classList.remove('tugged');
  });

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
    }
    sizeBoard();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(sizeBoard, 200); });

    const pos = e => {
      const r = board.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    board.addEventListener('pointerdown', e => {
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
      toast('🧽 wiped. like it never happened.');
    });
    $('#board-save').addEventListener('click', () => {
      const a = document.createElement('a');
      a.download = 'my-masterpiece-for-martin.png';
      a.href = board.toDataURL('image/png');
      a.click();
      toast('🖼️ saved. hang it on your fridge.');
    });
  }

  /* ---------- anonymous notes ----------
     notes land in a google sheet via an Apps Script web app.
     until the URL below is pasted, they fall back to email delivery. */
  const NOTES_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzsK7O2ZS_4MmtbSleY76mx92a8r9nogJTZfAYVDRkT_EBJMomyVpp743VGG_JMm_IsRw/exec';
  const NOTE_COLORS = ['var(--marker)', 'var(--mint)', '#fff', '#ffd3c6'];
  const wall = $('#notes-wall');
  function pinNote(text) {
    const n = document.createElement('div');
    n.className = 'note';
    n.style.setProperty('--r', (Math.random() * 6 - 3).toFixed(1) + 'deg');
    n.style.background = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    n.textContent = text;
    wall.appendChild(n);
    while (wall.children.length > 13) wall.removeChild(wall.children[1]);
  }
  try {
    JSON.parse(localStorage.getItem('notes') || '[]').slice(-12).forEach(pinNote);
  } catch {}

  $('#note-form').addEventListener('submit', async e => {
    e.preventDefault();
    if ($('#note-trap').value) return; // bots pin nothing
    const box = $('#note-text');
    const msg = box.value.trim();
    if (!msg) return;
    const btn = e.target.querySelector('.pin-btn');
    btn.disabled = true; btn.textContent = '📌 pinning…';

    pinNote(msg);
    try {
      const stored = JSON.parse(localStorage.getItem('notes') || '[]');
      stored.push(msg);
      localStorage.setItem('notes', JSON.stringify(stored.slice(-12)));
    } catch {}

    try {
      if (!NOTES_ENDPOINT.startsWith('PASTE')) {
        const res = await fetch(NOTES_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ message: msg, when: new Date().toISOString() }),
        });
        if (!res.ok) throw new Error('sheet ' + res.status);
      } else {
        const res = await fetch('https://formsubmit.co/ajax/martintiwari0@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ message: msg, _subject: 'anonymous note from the wall 📌' }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === 'false') throw new Error();
      }
      toast('📬 pugyo! filed in the secret spreadsheet. martin reads it with morning chiya.');
      confetti(36);
    } catch {
      toast('📌 pinned on the wall. delivery gremlins are on strike though, so if it’s important: DM me.');
    }
    box.value = '';
    btn.disabled = false; btn.textContent = '📌 pin it anonymously';
  });

  /* ---------- yt music playlist sync ----------
     1) make the playlist public or unlisted
     2) paste the playlist ID (the part after list= in its URL)
     3) paste a YouTube Data API v3 key (restrict it to your domain)
     leave as-is and the fallback list in the HTML stays. */
  const MUSIC = {
    apiKey: 'AIzaSyCP80UqF_iCwWoMj38fSV7i9zDcEMtjm7c',
    playlistId: 'PL0-3OpEXDMjJbge2zORqKaKcgsqQq2wZM',
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
    if (MUSIC.apiKey.startsWith('PASTE') || MUSIC.playlistId.startsWith('PASTE')) return;
    const box = $('#tracks');
    if (!box) return;

    let items = null;
    try {
      const cached = JSON.parse(localStorage.getItem('yt-rotation-v3') || 'null');
      if (cached && Date.now() - cached.t < 6 * 3600e3) items = cached.items;
    } catch {}

    if (!items) {
      try {
        const url = 'https://www.googleapis.com/youtube/v3/playlistItems' +
          `?part=snippet&maxResults=25&playlistId=${MUSIC.playlistId}&key=${MUSIC.apiKey}`;
        const res = await fetch(url);
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
        localStorage.setItem('yt-rotation-v3', JSON.stringify({ t: Date.now(), items }));
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
        runner.classList.remove('pet-flip');
        runner.classList.add('scratch-cat');
        catLine.appendChild(runner);
        requestAnimationFrame(() => runner.classList.add('dash'));
        setTimeout(() => {
          $('#scratch-target').classList.add('scratched');
        }, 750);
        setTimeout(() => {
          $('#cat-edit').classList.remove('hidden');
          runner.remove();
        }, 1600);
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
      toast('<b>secret #3.</b> you made the star dizzy. that’s all three. we should talk.');
    }
  });

  /* ---------- the sighting: dad photo cinematic reveal (scroll-scrubbed) ---------- */
  const sightingStage = $('#sighting-stage');
  const sightingPhoto = $('#sighting-photo');
  const sightingHeadline = $('#sighting-headline');
  if (sightingStage && sightingPhoto && sightingHeadline) {
    const line = 'one (1) confirmed sighting.';
    const highlighted = 'one <span class="hl">(1)</span> confirmed sighting.';
    let typed = false;
    const type = () => {
      if (typed) return;
      typed = true;
      sightingHeadline.classList.add('typing');
      let i = 0;
      const step = () => {
        sightingHeadline.textContent = line.slice(0, i);
        i++;
        if (i <= line.length) setTimeout(step, 32);
        else {
          sightingHeadline.classList.remove('typing');
          sightingHeadline.innerHTML = highlighted;
        }
      };
      step();
    };
    if (reduced) {
      sightingStage.style.setProperty('--p', 1);
      sightingHeadline.innerHTML = highlighted;
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
        if (p > 0.82) type();
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
    let px = -90, ptarget = 140, pspeed = 42, presting = false, plast = performance.now();

    function speak(text, ms = 1700) {
      petBubble.textContent = text;
      petBubble.classList.remove('hidden');
      setTimeout(() => petBubble.classList.add('hidden'), ms);
    }
    function petRest() {
      presting = true;
      pet.classList.remove('walking');
      const mode = petMode();
      pet.classList.toggle('sleeping', mode === 'sleep');
      const wait = mode === 'sleep' ? 45000
        : mode === 'zoomies' ? 500 + Math.random() * 1200
        : 2600 + Math.random() * 5200;
      setTimeout(() => {
        const m = petMode();
        pet.classList.toggle('sleeping', m === 'sleep');
        if (m === 'sleep') return petRest(); // keep napping, recheck later
        pspeed = m === 'zoomies' ? 200 : 42;
        presting = false;
        ptarget = 10 + Math.random() * roam();
      }, wait);
    }
    function petTick(now) {
      const dt = Math.min((now - plast) / 1000, .1);
      plast = now;
      if (!presting) {
        const d = ptarget - px;
        px += Math.sign(d) * Math.min(Math.abs(d), pspeed * dt);
        petSvg.classList.toggle('pet-flip', d < 0);
        pet.classList.add('walking');
        if (Math.abs(d) < 2) petRest();
        pet.style.transform = `translateX(${px}px)`;
      }
      requestAnimationFrame(petTick);
    }
    // zzz while asleep
    setInterval(() => {
      if (pet.classList.contains('sleeping') && petBubble.classList.contains('hidden')) speak('z z z', 1500);
    }, 9000);

    const meows = ['mrrp.', 'khoi?', 'feed me, kta.', 'busy. clearly.', 'ma HARU. yes, THE haru.', 'ok one pat. ONE.'];
    petSvg.addEventListener('click', () => {
      if (petMode() === 'sleep') {
        const t = nptNow();
        speak(`it is ${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')} in kathmandu. why are YOU awake?`, 2600);
        return; // no zoomies. she is off the clock.
      }
      speak(petMode() === 'zoomies' ? "it's 5pm. I don't make the rules." : meows[Math.floor(Math.random() * meows.length)]);
      presting = false;
      pspeed = 280;
      ptarget = 10 + Math.random() * roam();
    });

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

  /* ---------- tiny delights ---------- */
  $$('a[href^="mailto"]').forEach(a => a.addEventListener('click', () => confetti(40)));
  $('#year').textContent = new Date().getFullYear();
})();
