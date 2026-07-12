// HUD, panels, map, achievements, confetti — shared by 3D world & used pieces in fallback
import { toggleSound, blip } from './audio.js';
import { openTerminal } from './terminal.js';

export const ZONES = [
  { id: 'about',    label: 'START — About Me' },
  { id: 'skills',   label: 'SKILL TREE' },
  { id: 'quests',   label: 'QUEST LOG' },
  { id: 'projects', label: 'CONSTRUCTION SITE' },
  { id: 'contact',  label: 'LAUNCH PAD' },
];

export function initUI({ content, loadMs, onTeleport = () => {} }) {
  const hud = document.getElementById('hud');
  hud.classList.remove('hidden');

  const state = {
    discovered: new Set(),
    coffee: 0,
    achievements: new Set(),
    fps: 0,
    loadMs,
  };

  /* ---------------- toasts + confetti ---------------- */
  function toast(title, msg, kind = 'achieve') {
    blip(kind);
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div class="t-title">${title}</div><div>${msg}</div>`;
    document.getElementById('toast-root').appendChild(t);
    setTimeout(() => { t.classList.add('bye'); setTimeout(() => t.remove(), 450); }, 4200);
  }

  function confetti(n = 90) {
    const colors = ['#C6FF00', '#F5F2EA', '#7fd4ff', '#FF5470', '#8fb800'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      c.style.animationDelay = Math.random() * .5 + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  function achieve(id, title, msg) {
    if (state.achievements.has(id)) return;
    state.achievements.add(id);
    toast('🏆 ACHIEVEMENT UNLOCKED', `<b>${title}</b> — ${msg}`);
  }

  /* ---------------- XP / discovery ---------------- */
  function refreshHud() {
    document.getElementById('xp-fill').style.width = (state.discovered.size / ZONES.length) * 100 + '%';
    document.getElementById('zone-count').textContent = state.discovered.size;
    document.getElementById('coffee-count').textContent = state.coffee;
  }

  function discover(zoneId) {
    if (state.discovered.has(zoneId)) return;
    state.discovered.add(zoneId);
    blip('xp');
    refreshHud();
    if (state.discovered.size === ZONES.length) {
      setTimeout(() => {
        achieve('all-zones', 'Read an entire CV', 'rarer than you think');
        confetti();
      }, 600);
    }
  }

  function collectCoffee() {
    state.coffee++;
    refreshHud();
    blip('collect');
    if (state.coffee >= 3) achieve('coffee', 'FUELED UP', 'found all 3 coffee cups ☕');
  }

  /* ---------------- panel content builders ---------------- */
  const C = content;

  const idCardHTML = `
    <div class="id-card">
      <div class="id-photo"><img src="${C.photo}" alt="${C.name}" loading="lazy"></div>
      <div class="id-meta">
        ${C.about.idCard.map(([k, v], i) => `
          <div class="row"><span class="lbl">${k}</span><span class="val${i < 3 ? ' acc' : ''}">${v}</span></div>`).join('')}
      </div>
    </div>`;

  const builders = {
    about: () => `
      <h2>▶ ${C.about.title}</h2>
      <div class="kicker">PLAYER 1 — ID VERIFIED</div>
      ${idCardHTML}
      ${C.about.bio.map(p => `<p>${p}</p>`).join('')}`,

    skills: () => `
      <h2>🌳 ${C.skills.title}</h2>
      <div class="kicker">HONEST LEVELS ONLY — CHARM &gt; INFLATION</div>
      ${C.skills.branches.map(b => `
        <div class="skill-branch"><h3>${b.name}</h3>
          ${b.items.map(s => `
            <div class="skill${s.learning ? ' learning' : ''}">
              <span class="name">${s.name}</span>
              <span class="bar"><i data-w="${s.level}"></i></span>
              <span class="lv">LV ${s.level}</span>
            </div>`).join('')}
        </div>`).join('')}`,

    quests: () => `
      <h2>📜 ${C.quests.title}</h2>
      <div class="kicker">EDUCATION &amp; JOURNEY</div>
      ${C.quests.items.map(q => `
        <div class="quest${q.main ? ' main' : ''}">
          <div class="q-tag">${q.tag}</div>
          <div class="q-name">${q.name}</div>
          <div class="q-desc">${q.desc}</div>
          <span class="q-status ${q.status === 'IN PROGRESS' ? 'active' : 'done'}">${q.status === 'IN PROGRESS' ? '◉ ' : '✓ '}${q.status}</span>
        </div>`).join('')}`,

    projects: () => `
      <h2>🏗 ${C.projects.title}</h2>
      <div class="kicker">FIRST PROJECT: YOU'RE STANDING IN IT</div>
      <p><b class="acc">${C.projects.flagship.name}</b></p>
      <p>${C.projects.flagship.desc}</p>
      <div class="stat-line"><span>ENGINE</span><b>Three.js + vanilla JS</b></div>
      <div class="stat-line"><span>TEXTURE FILES</span><b>0</b></div>
      <div class="stat-line"><span>BOOT → PLAYABLE</span><b>${(state.loadMs / 1000).toFixed(2)}s (your device, live)</b></div>
      <div class="stat-line"><span>FPS RIGHT NOW</span><b><span id="fps-live">—</span></b></div>
      ${C.projects.dlc.map(d => `
        <div class="dlc"><span><b>${d.name}</b><br>${d.hint}</span><span class="tag">COMING SOON</span></div>`).join('')}`,

    contact: () => `
      <h2>🚀 ${C.contact.title}</h2>
      <div class="kicker">TRANSMISSION CHANNEL OPEN</div>
      <p>${C.contact.blurb}</p>
      <div class="contact-links">
        <a href="mailto:${C.email}">✉ ${C.email}</a>
        <a href="${C.socials.github}" target="_blank" rel="noopener">⌥ GitHub</a>
        <a href="${C.socials.linkedin}" target="_blank" rel="noopener">in LinkedIn</a>
      </div>
      <button class="btn-big" id="btn-transmit">🚀 TRANSMIT MESSAGE</button>`,
  };

  /* ---------------- panel open/close ---------------- */
  const panelRoot = document.getElementById('panel-root');
  let openVeil = null;

  function closePanel() {
    if (!openVeil) return;
    blip('close');
    openVeil.remove();
    openVeil = null;
  }

  function openPanel(id) {
    if (!builders[id]) return;
    closePanel();
    blip('open');
    discover(id);

    const veil = document.createElement('div');
    veil.className = 'panel-veil';
    veil.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true" aria-label="${ZONES.find(z => z.id === id)?.label || id}" tabindex="-1">
        <button class="panel-close" aria-label="Close">✕</button>
        ${builders[id]()}
      </div>`;
    panelRoot.appendChild(veil);
    openVeil = veil;

    veil.addEventListener('pointerdown', e => { if (e.target === veil) closePanel(); });
    veil.querySelector('.panel-close').addEventListener('click', closePanel);
    veil.querySelector('.panel').focus({ preventScroll: true });

    if (id === 'skills') {
      requestAnimationFrame(() => requestAnimationFrame(() =>
        veil.querySelectorAll('.bar i').forEach(b => b.style.width = b.dataset.w + '%')));
    }
    if (id === 'projects') {
      const el = veil.querySelector('#fps-live');
      const iv = setInterval(() => {
        if (!document.body.contains(el)) return clearInterval(iv);
        el.textContent = state.fps ? state.fps + ' fps' : 'n/a (text mode)';
      }, 500);
      el.textContent = state.fps ? state.fps + ' fps' : 'n/a (text mode)';
    }
    if (id === 'contact') {
      veil.querySelector('#btn-transmit').addEventListener('click', () => {
        blip('launch');
        api.onLaunch();
        setTimeout(() => { location.href = `mailto:${C.email}?subject=Quest invite for Martin`; }, 650);
      });
    }
  }

  /* ---------------- map overlay ---------------- */
  const mapOv = document.getElementById('map-overlay');
  function renderMap() {
    mapOv.innerHTML = `
      <div class="map-box">
        <h2>🗺 ISLAND MAP</h2>
        ${ZONES.map(z => `
          <button class="map-zone" data-zone="${z.id}">
            <span>${z.label}</span>
            <span class="st ${state.discovered.has(z.id) ? 'done' : ''}">${state.discovered.has(z.id) ? '✓ FOUND' : '? UNKNOWN'}</span>
          </button>`).join('')}
      </div>`;
    mapOv.querySelectorAll('.map-zone').forEach(b =>
      b.addEventListener('click', () => {
        mapOv.classList.add('hidden');
        onTeleport(b.dataset.zone);
        openPanel(b.dataset.zone);
      }));
  }
  document.getElementById('btn-map').addEventListener('click', () => {
    blip('ui'); renderMap(); mapOv.classList.remove('hidden');
  });
  mapOv.addEventListener('pointerdown', e => { if (e.target === mapOv) mapOv.classList.add('hidden'); });

  /* ---------------- HUD buttons ---------------- */
  document.getElementById('btn-sound').addEventListener('click', e => {
    e.target.textContent = toggleSound() ? '🔊' : '🔇';
  });
  document.getElementById('btn-lowspec').addEventListener('click', () => {
    localStorage.setItem('mode', 'txt'); location.reload();
  });
  document.getElementById('btn-term').addEventListener('click', () =>
    openTerminal({ content: C, openPanel, achieve }));

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closePanel(); mapOv.classList.add('hidden'); }
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      openTerminal({ content: C, openPanel, achieve });
    }
  });

  /* ---------------- hint ---------------- */
  const hintEl = document.getElementById('hint');
  function hint(text) {
    if (!text) return hintEl.classList.remove('show');
    hintEl.textContent = text;
    hintEl.classList.add('show');
  }

  const api = {
    state, openPanel, closePanel, discover, collectCoffee,
    toast, achieve, confetti, hint,
    setFPS: v => { state.fps = v; },
    isPanelOpen: () => !!openVeil || !mapOv.classList.contains('hidden'),
    onLaunch: () => {}, // scene overrides to fire the rocket
  };
  refreshHud();
  return api;
}
