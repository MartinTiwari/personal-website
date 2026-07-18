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

  /* ---------- anonymous notes: land in a google sheet via an Apps Script web app ---------- */
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
      const res = await fetch(NOTES_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ message: msg, when: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('sheet ' + res.status);
      toast('📬 pugyo! filed in the secret spreadsheet. martin reads it with morning chiya.');
      confetti(36);
    } catch {
      toast('📌 pinned on the wall. delivery gremlins are on strike though, so if it’s important: DM me.');
    }
    box.value = '';
    btn.disabled = false; btn.textContent = '📌 pin it anonymously';
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
    let px = -90, ptarget = 140, pspeed = 42, presting = false, plast = performance.now();
    let wasWalking = false, wasFlipped = false;

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
    function petRest() {
      presting = true;
      pet.classList.remove('walking');
      wasWalking = false;
      const mode = petMode();
      pet.classList.toggle('sleeping', mode === 'sleep');
      const wait = mode === 'sleep' ? 45000
        : mode === 'zoomies' ? 500 + Math.random() * 1200
        : 2600 + Math.random() * 5200;
      setTimeout(() => {
        const m = petMode();
        pet.classList.toggle('sleeping', m === 'sleep');
        if (m === 'sleep') return petRest(); // keep napping, recheck later
        setSpeed(m === 'zoomies' ? 200 : 42);
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
        const flipped = d < 0;
        if (flipped !== wasFlipped) { petSvg.classList.toggle('pet-flip', flipped); wasFlipped = flipped; }
        if (!wasWalking) { pet.classList.add('walking'); wasWalking = true; }
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
      setSpeed(280);
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

  /* ---------- keep photos from being right-click/drag-saved ---------- */
  document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('dragstart', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

  /* ---------- tiny delights ---------- */
  $$('a[href^="mailto"]').forEach(a => a.addEventListener('click', () => confetti(40)));
  $('#year').textContent = new Date().getFullYear();
})();
