// LOW-SPEC MODE — a genuinely polished text adventure. Zero WebGL, same content.
import { initUI, ZONES } from './ui.js';

export function start({ content, loadMs }) {
  const C = content;
  const root = document.getElementById('fallback');
  root.classList.remove('hidden');

  const ui = initUI({ content, loadMs });

  root.innerHTML = `
    <div class="fb-wrap">
      <div class="fb-head">MARTIN.EXE — TEXT MODE</div>
      <div class="fb-sub">LOW-SPEC EDITION · SAME WORLD, MORE IMAGINATION</div>
      <div class="fb-log" id="fb-log"></div>
      <div class="fb-choices" id="fb-choices"></div>
    </div>`;
  const log = root.querySelector('#fb-log');
  const choicesEl = root.querySelector('#fb-choices');

  const visited = new Set();
  let coffeeFound = 0;

  function print(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    log.appendChild(d);
    d.scrollIntoView({ block: 'end' });
  }

  const sections = {
    about: () => `
      <h2>▶ ${C.about.title}</h2>
      <p class="sys">You approach the signpost. A laminated ID card is stapled to it. It's… surprisingly professional.</p>
      <div class="id-card">
        <div class="id-photo"><img src="${C.photo}" alt="${C.name}" loading="lazy"></div>
        <div class="id-meta">
          ${C.about.idCard.map(([k, v]) => `<div class="row"><span class="lbl">${k}</span><span class="val">${v}</span></div>`).join('')}
        </div>
      </div>
      ${C.about.bio.map(p => `<p>${p}</p>`).join('')}`,

    skills: () => `
      <h2>🌳 SKILL TREE</h2>
      <p class="sys">A tree hums with a faint green glow. Its branches are labeled. Of course they are.</p>
      ${C.skills.branches.map(b => `<p><span class="acc">${b.name}</span><br>${
        b.items.map(s => {
          const filled = Math.round(s.level / 10);
          return `&nbsp;&nbsp;${s.name.padEnd(14, ' ')} [${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] LV ${s.level}${s.learning ? ' <span class="acc">UNLOCKING…</span>' : ''}`;
        }).join('<br>')
      }</p>`).join('')}`,

    quests: () => `
      <h2>📜 QUEST LOG</h2>
      <p class="sys">A book floats above a campfire, immune to both gravity and fire. You read it.</p>
      ${C.quests.items.map(q => `<p><span class="acc">[${q.status === 'IN PROGRESS' ? '◉' : '✓'}] ${q.tag}: ${q.name}</span><br><span class="sys">${q.desc}</span></p>`).join('')}`,

    projects: () => `
      <h2>🏗 CONSTRUCTION SITE</h2>
      <p class="sys">Cranes. Scaffolding. A hologram flickers: <span class="acc">FIRST PROJECT — YOU'RE STANDING IN IT.</span></p>
      <p><span class="acc">${C.projects.flagship.name}</span><br>${C.projects.flagship.desc}</p>
      <p class="sys">Boot → playable on your device: <span class="acc">${(loadMs / 1000).toFixed(2)}s</span> · texture files shipped: <span class="acc">0</span></p>
      ${C.projects.dlc.map(d => `<p class="sys">🔒 ${d.name} — ${d.hint} <span class="acc">[COMING SOON]</span></p>`).join('')}`,

    contact: () => `
      <h2>🚀 LAUNCH PAD</h2>
      <p class="sys">A small rocket waits on the pad. The fuel gauge just says "ambition".</p>
      <p>${C.contact.blurb}</p>
      <p>✉ <a class="acc" href="mailto:${C.email}">${C.email}</a><br>
      ⌥ <a class="acc" href="${C.socials.github}" target="_blank" rel="noopener">GitHub</a> ·
      in <a class="acc" href="${C.socials.linkedin}" target="_blank" rel="noopener">LinkedIn</a></p>`,
  };

  const flavor = {
    about: 'You walk north toward a wooden signpost.',
    skills: 'You head west. The glow gets brighter.',
    quests: 'You follow the smell of campfire smoke east.',
    projects: 'You walk toward the sound of construction.',
    contact: 'You approach the launch pad. Something smells like rocket fuel and opportunity.',
  };

  function renderChoices() {
    choicesEl.innerHTML = '';
    for (const z of ZONES) {
      const b = document.createElement('button');
      b.className = 'fb-choice';
      b.innerHTML = `${visited.has(z.id) ? '✓ ' : '→ '}${z.label}`;
      b.addEventListener('click', () => go(z.id));
      choicesEl.appendChild(b);
    }
    const extras = [
      ['🔍 SEARCH THE BUSHES', searchBushes],
      ['>_ TERMINAL', () => document.getElementById('btn-term').click()],
      ['🎮 TRY 3D MODE', () => { localStorage.removeItem('mode'); location.href = location.pathname; }],
    ];
    for (const [label, fn] of extras) {
      const b = document.createElement('button');
      b.className = 'fb-choice';
      b.textContent = label;
      b.addEventListener('click', fn);
      choicesEl.appendChild(b);
    }
    choicesEl.scrollIntoView({ block: 'end' });
  }

  function go(id) {
    print(`<p class="you">&gt; go ${id}</p><p class="sys">${flavor[id]}</p>`);
    print(sections[id]());
    visited.add(id);
    ui.discover(id);
    renderChoices();
  }

  function searchBushes() {
    print(`<p class="you">&gt; search bushes</p>`);
    if (coffeeFound < 3) {
      coffeeFound++;
      print(`<p class="sys">You find a suspiciously warm cup of coffee. ☕ (${coffeeFound}/3)</p>`);
      ui.collectCoffee();
    } else {
      print(`<p class="sys">Just leaves. And one confused bug. It scurries into the backlog.</p>`);
    }
    renderChoices();
  }

  // intro
  print(`<p class="sys">You wake up on a floating island. There is no tutorial. There never is.</p>
    <p class="sys">A voice announces: <span class="acc">"WELCOME, PLAYER 2. THIS CV IS PLAYABLE."</span></p>
    <p class="sys">Paths lead in five directions. Pick one:</p>`);
  renderChoices();
}
