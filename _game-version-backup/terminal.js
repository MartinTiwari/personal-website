// Fake terminal overlay — keyboard-power-user path through the CV
import { blip } from './audio.js';

let open = false;

export function openTerminal({ content, openPanel, achieve }) {
  if (open) return;
  open = true;
  blip('open');

  const root = document.getElementById('terminal');
  root.classList.remove('hidden');
  root.innerHTML = `
    <div class="term-box">
      <div class="term-head"><span>martin@island:~$</span><span>[ESC] CLOSE</span></div>
      <div class="term-out" id="term-out"></div>
      <div class="term-in"><span>&gt;</span><input id="term-input" autocomplete="off" spellcheck="false" aria-label="Terminal command"></div>
    </div>`;

  const out = root.querySelector('#term-out');
  const input = root.querySelector('#term-input');
  const C = content;

  function print(html, cls = '') {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }

  const skillsFlat = C.skills.branches
    .map(b => `<span class="dim">${b.name}:</span> ` + b.items.map(s => `${s.name} [LV${s.level}${s.learning ? '↗' : ''}]`).join(', '))
    .join('\n');

  const cmds = {
    help: () => print(
`<span class="acc">available commands:</span>
  whoami      — who is this guy
  skills      — dump skill tree
  projects    — what has he built
  quests      — education & journey
  contact     — how to reach him
  open &lt;zone&gt; — open a panel (about|skills|quests|projects|contact)
  sudo hire martin — try it
  clear · exit`),
    whoami: () => print(`${C.name} — CLASS: DEVELOPER · ALIGNMENT: CHAOTIC CURIOUS\n${C.about.bio[0]}`),
    skills: () => print(skillsFlat),
    projects: () => print(`<span class="acc">${C.projects.flagship.name}</span>\n${C.projects.flagship.desc}\n<span class="dim">+ ${C.projects.dlc.length} unannounced DLC slots</span>`),
    quests: () => print(C.quests.items.map(q => `[${q.status === 'IN PROGRESS' ? '◉' : '✓'}] ${q.tag}: ${q.name}`).join('\n')),
    contact: () => print(`email: <span class="acc">${C.email}</span>\ngithub: ${C.socials.github}\nlinkedin: ${C.socials.linkedin}`),
    clear: () => { out.innerHTML = ''; },
    exit: close,
    ls: () => print('about/  skills/  quests/  projects/  contact/  secrets/'),
    'cat secrets': () => print('<span class="err">permission denied.</span> nice try though. +5 curiosity.'),
  };

  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    print(`&gt; ${raw}`, 'dim');
    blip('ui');

    if (cmd === 'sudo hire martin') {
      print('<span class="acc">permission granted.</span> opening mail client…');
      achieve('sudo', 'ROOT ACCESS', 'used the fast lane to hire Martin');
      setTimeout(() => { location.href = `mailto:${C.email}?subject=sudo hire martin&body=permission granted.`; }, 900);
      return;
    }
    if (cmd.startsWith('open ')) {
      const zone = cmd.slice(5).trim();
      if (['about', 'skills', 'quests', 'projects', 'contact'].includes(zone)) {
        close(); openPanel(zone);
      } else print(`<span class="err">unknown zone:</span> ${zone}`);
      return;
    }
    if (cmd.startsWith('sudo')) return print('<span class="err">this incident will be reported</span> (to martin, who will be flattered)');
    if (cmds[cmd]) return cmds[cmd]();
    print(`<span class="err">command not found:</span> ${cmd} — try <span class="acc">help</span>`);
  }

  function close() {
    open = false;
    blip('close');
    root.classList.add('hidden');
    root.innerHTML = '';
    window.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
  }
  window.addEventListener('keydown', onKey);

  input.addEventListener('keydown', e => {
    e.stopPropagation(); // don't move the character while typing
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    if (e.key === 'Escape') close();
  });
  root.addEventListener('pointerdown', e => { if (e.target === root) close(); });

  print(`<span class="acc">MARTIN.EXE terminal v1.0</span> — type <span class="acc">help</span> to begin`);
  input.focus();
}
