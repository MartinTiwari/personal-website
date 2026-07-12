// MARTIN.EXE — hub world: floating low-poly island, all geometry built in code.
// Zero texture files, zero model downloads. Vertex colors only (labels use runtime canvas).
import * as THREE from 'three';
import { initUI, ZONES } from './ui.js';

const ACCENT = 0xC6FF00, BG = 0x0B0E1A;

export function start({ content, loadMs }) {
  /* ================= renderer / scene / camera ================= */
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.domElement.className = 'world';
  document.getElementById('app').appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 26, 60);

  const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, .1, 200);
  const CAM_OFF = new THREE.Vector3(0, 17.5, 19);

  /* ================= lights ================= */
  const hemi = new THREE.HemisphereLight(0x8fb3ff, 0x1a2138, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, 2.2);
  sun.position.set(8, 18, 6);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(ACCENT, .5);
  rim.position.set(-10, 6, -12);
  scene.add(rim);

  /* ================= sky: gradient dome + stars ================= */
  {
    const g = new THREE.SphereGeometry(90, 16, 12);
    const colTop = new THREE.Color(0x1b1440), colBot = new THREE.Color(BG);
    const cols = [];
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 90 * .5 + .5, 0, 1);
      const c = colBot.clone().lerp(colTop, t);
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })));

    const starGeo = new THREE.BufferGeometry();
    const sp = [];
    for (let i = 0; i < 500; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(70 + Math.random() * 15);
      if (v.y > -18) sp.push(v.x, v.y, v.z);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf5f2ea, size: .22, fog: false, transparent: true, opacity: .85 })));
  }

  /* ================= helpers ================= */
  const lambert = (color, opts = {}) => new THREE.MeshLambertMaterial({ color, ...opts });

  function paintVerts(geo, fn) { // per-vertex colors
    const pos = geo.attributes.position, cols = [];
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      fn(c, pos.getX(i), pos.getY(i), pos.getZ(i), i);
      cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return geo;
  }

  function makeLabel(text, color = '#C6FF00') {
    const cv = document.createElement('canvas');
    const s = 3; cv.width = 320 * s; cv.height = 64 * s;
    const ctx = cv.getContext('2d');
    ctx.scale(s, s);
    ctx.font = '700 26px Consolas, monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.fillText(text, 160, 32);
    const tex = new THREE.CanvasTexture(cv);
    tex.anisotropy = 2;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sp.scale.set(6.4, 1.28, 1);
    return sp;
  }

  const animated = []; // {obj, fn(t, dt)}
  const anim = (obj, fn) => animated.push({ obj, fn });

  /* ================= the island ================= */
  const island = new THREE.Group();
  scene.add(island);

  const R = 13; // island top radius

  function facetColors(geo, pick) { // per-face colors for the low-poly look
    const g = geo.toNonIndexed();
    const pos = g.attributes.position, cols = [];
    for (let f = 0; f < pos.count; f += 3) {
      const y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
      const c = pick(y);
      for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return g;
  }
  const facetMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

  {
    const grasses = [0x49b06c, 0x3d9e5e, 0x55bd75].map(h => new THREE.Color(h));
    const dirts = [0x6b4a36, 0x5a3c2a, 0x4d3324].map(h => new THREE.Color(h));
    const top = facetColors(new THREE.CylinderGeometry(R, R * .9, 2.2, 26, 1), y => {
      if (y > 1.05) return grasses[(Math.random() * 3) | 0];
      if (y < -1.05) return dirts[2];
      return dirts[(Math.random() * 2) | 0];
    });
    const topMesh = new THREE.Mesh(top, facetMat);
    topMesh.position.y = -1.1;
    island.add(topMesh);

    // rocky underside
    const under = new THREE.ConeGeometry(R * .9, 9, 11, 3);
    const upos = under.attributes.position;
    for (let i = 0; i < upos.count; i++) {
      upos.setX(i, upos.getX(i) * (1 + (Math.random() - .5) * .2));
      upos.setZ(i, upos.getZ(i) * (1 + (Math.random() - .5) * .2));
    }
    const rocks = [0x2a3352, 0x222b47, 0x323d63].map(h => new THREE.Color(h));
    const um = new THREE.Mesh(facetColors(under, () => rocks[(Math.random() * 3) | 0]), facetMat);
    um.rotation.x = Math.PI; um.position.y = -6.7;
    island.add(um);
  }

  // island idle float
  anim(island, (t) => { island.position.y = Math.sin(t * .5) * .18; });

  // floating rock islets + satellite
  for (let i = 0; i < 5; i++) {
    const g = new THREE.IcosahedronGeometry(.5 + Math.random() * .9, 0);
    paintVerts(g, c => c.setHex(0x2a3352).offsetHSL(0, 0, (Math.random() - .5) * .1));
    const m = new THREE.Mesh(g, lambert(0xffffff, { vertexColors: true }));
    const a = Math.random() * Math.PI * 2, r = R + 3.5 + Math.random() * 5;
    m.position.set(Math.cos(a) * r, -2 + Math.random() * 7, Math.sin(a) * r);
    const ph = Math.random() * 9, sp = .4 + Math.random() * .5;
    anim(m, t => { m.position.y += Math.sin(t * sp + ph) * .004; m.rotation.y = t * .1 + ph; });
    scene.add(m);
  }
  {
    const sat = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .8), lambert(0xd8dce8));
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.4, .04, .7), lambert(0x2244aa, { emissive: 0x112266 }));
    sat.add(body, panel);
    scene.add(sat);
    anim(sat, t => {
      sat.position.set(Math.cos(t * .25) * 20, 8 + Math.sin(t * .5) * 2, Math.sin(t * .25) * 20);
      sat.rotation.y = t * .5;
    });
  }

  /* ================= zone builders ================= */
  const zoneMeta = {};   // id -> {pos, group}

  function placeZone(id, x, z, group, labelText) {
    group.position.set(x, 0, z);
    const label = makeLabel(labelText);
    label.position.set(0, 3.6, 0);
    group.add(label);
    island.add(group);
    zoneMeta[id] = { pos: new THREE.Vector3(x, 0, z), group };
  }

  // --- START signpost ---
  {
    const g = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, 2.2, 6), lambert(0x8a5a3a));
    post.position.y = 1.1;
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, .8, .12), lambert(0xa9713f));
    board.position.set(0, 1.9, 0); board.rotation.y = .12;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(2.0, .12, .14), lambert(ACCENT, { emissive: 0x5a7a00 }));
    trim.position.set(0, 2.34, 0); trim.rotation.y = .12;
    g.add(post, board, trim);
    placeZone('about', 0, 6.2, g, '▶ START');
  }

  // --- SKILL TREE (glowing) ---
  {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.25, .45, 2.6, 7), lambert(0x5a4030));
    trunk.position.y = 1.3;
    const canopyMat = lambert(0x9adf1f, { emissive: 0x86c400, emissiveIntensity: .6 });
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), canopyMat);
    canopy.position.y = 3.4;
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 0), canopyMat);
    c2.position.set(1.1, 2.6, .3);
    const glow = new THREE.PointLight(ACCENT, 14, 9, 2);
    glow.position.y = 3.2;
    g.add(trunk, canopy, c2, glow);
    anim(g, t => {
      canopyMat.emissiveIntensity = .45 + Math.sin(t * 2.2) * .25;
      canopy.rotation.y = t * .18;
    });
    placeZone('skills', -8.2, -2.4, g, '🌳 SKILL TREE');
  }

  // --- QUEST LOG: campfire + floating book ---
  {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) { // log ring
      const log = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .9, 5), lambert(0x6b4a36));
      log.rotation.z = Math.PI / 2; log.rotation.y = i * 1.25;
      log.position.y = .12;
      g.add(log);
    }
    const flameMat = lambert(0xff9a2a, { emissive: 0xff6a00, emissiveIntensity: 1 });
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.4, 1.1, 6), flameMat);
    flame.position.y = .75;
    const fire = new THREE.PointLight(0xff8c3a, 16, 10, 2);
    fire.position.y = 1.2;
    const book = new THREE.Group();
    const cover = new THREE.Mesh(new THREE.BoxGeometry(.9, .1, .65), lambert(0x8833aa, { emissive: 0x441166 }));
    const pages = new THREE.Mesh(new THREE.BoxGeometry(.8, .12, .55), lambert(0xf5f2ea));
    pages.position.y = .06;
    book.add(cover, pages);
    book.position.y = 2.4;
    g.add(flame, fire, book);
    anim(g, (t, dt) => {
      flame.scale.setScalar(1 + Math.sin(t * 9) * .12 + Math.sin(t * 23) * .05);
      fire.intensity = 14 + Math.sin(t * 11) * 4;
      book.position.y = 2.4 + Math.sin(t * 1.6) * .18;
      book.rotation.y += dt * .8;
    });
    placeZone('quests', 8.2, -2.4, g, '📜 QUEST LOG');
  }

  // --- CONSTRUCTION SITE: crane + hologram ---
  {
    const g = new THREE.Group();
    const yellow = lambert(0xffc21c);
    const mast = new THREE.Mesh(new THREE.BoxGeometry(.28, 3.6, .28), yellow);
    mast.position.set(-1.2, 1.8, 0);
    const jib = new THREE.Mesh(new THREE.BoxGeometry(3.2, .22, .22), yellow);
    jib.position.set(0, 3.5, 0);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.2, 4), lambert(0x888888));
    cable.position.set(1.2, 2.85, 0);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), lambert(0x2a3352));
    hook.position.set(1.2, 2.1, 0);
    // scaffolding
    for (const [sx, sz] of [[.8, .9], [1.7, .9], [.8, -.2]]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(.7, 1.1, .7), lambert(0x8a93b2, { wireframe: true }));
      s.position.set(sx, .55, sz);
      g.add(s);
    }
    // hologram
    const holoMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: .3, side: THREE.DoubleSide });
    const holo = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 1.7, 16, 1, true), holoMat);
    holo.position.set(.3, 1.3, .6);
    const holoCore = new THREE.Mesh(new THREE.OctahedronGeometry(.45), new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true }));
    holoCore.position.copy(holo.position);
    const holoLight = new THREE.PointLight(ACCENT, 8, 7, 2);
    holoLight.position.set(.3, 1.8, .6);
    g.add(mast, jib, cable, hook, holo, holoCore, holoLight);
    anim(g, (t, dt) => {
      holo.rotation.y += dt * .7;
      holoCore.rotation.y -= dt * 1.2;
      holoCore.position.y = 1.3 + Math.sin(t * 2) * .12;
      holoMat.opacity = .22 + Math.sin(t * 3) * .1;
    });
    placeZone('projects', -5.4, -8.6, g, '🏗 PROJECTS');
  }

  // --- CONTACT: rocket on a pad ---
  const rocket = new THREE.Group();
  {
    const g = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, .3, 8), lambert(0x39415e));
    pad.position.y = .15;
    const bodyMat = lambert(0xe8e4da);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.42, .48, 1.7, 10), bodyMat);
    body.position.y = 1.35;
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.42, .8, 10), lambert(0xff5470));
    nose.position.y = 2.6;
    const win = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 8), lambert(0x7fd4ff, { emissive: 0x2288cc }));
    win.position.set(0, 1.6, .4);
    for (let i = 0; i < 3; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(.1, .7, .5), lambert(0xff5470));
      const a = i * Math.PI * 2 / 3;
      fin.position.set(Math.cos(a) * .5, .75, Math.sin(a) * .5);
      fin.rotation.y = -a;
      rocket.add(fin);
    }
    rocket.add(body, nose, win);
    g.add(pad, rocket);
    placeZone('contact', 5.4, -8.6, g, '🚀 CONTACT');
  }

  // --- coffee cup collectibles ---
  const cups = [];
  for (const [cx, cz] of [[11, 2.5], [-9.5, 5.5], [.5, -11.2]]) {
    const cup = new THREE.Group();
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .34, 10), lambert(0xf5f2ea));
    const coffee = new THREE.Mesh(new THREE.CylinderGeometry(.19, .19, .05, 10), lambert(0x4a2c14));
    coffee.position.y = .17;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 6, 10), lambert(0xf5f2ea));
    handle.position.x = .25;
    const halo = new THREE.PointLight(0xffc21c, 3, 3, 2);
    cup.add(mug, coffee, handle, halo);
    cup.position.set(cx, 1, cz);
    const ph = Math.random() * 9;
    anim(cup, t => { cup.position.y = 1 + Math.sin(t * 2 + ph) * .2; cup.rotation.y = t * 1.4; });
    island.add(cup);
    cups.push(cup);
  }

  /* ================= character ================= */
  const char = new THREE.Group();
  {
    const bodyMat = lambert(0x7fd4ff);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(.42, .6, 6, 12), bodyMat);
    body.position.y = .85;
    const eyeW1 = new THREE.Mesh(new THREE.SphereGeometry(.11, 8, 8), lambert(0xffffff));
    const eyeW2 = eyeW1.clone();
    eyeW1.position.set(-.16, 1.12, .36); eyeW2.position.set(.16, 1.12, .36);
    const pu1 = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 6), lambert(0x0b0e1a));
    const pu2 = pu1.clone();
    pu1.position.set(-.16, 1.12, .45); pu2.position.set(.16, 1.12, .45);
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(.1, .025, 5, 10, Math.PI), lambert(0x0b0e1a));
    mouth.position.set(0, .92, .4); mouth.rotation.x = Math.PI;
    char.add(body, eyeW1, eyeW2, pu1, pu2, mouth);
  }
  const hat = new THREE.Mesh(new THREE.ConeGeometry(.28, .6, 8), lambert(0xff5470, { emissive: 0xaa2244 }));
  hat.position.y = 1.75; hat.visible = false;
  char.add(hat);
  char.position.set(0, 0, 2.5);
  island.add(char);

  /* ================= UI wiring ================= */
  const ui = initUI({
    content, loadMs,
    onTeleport: id => {
      const p = zoneMeta[id].pos;
      const dir = p.clone().normalize();
      char.position.set(p.x - dir.x * 2.2, 0, p.z - dir.z * 2.2);
      zoneArmed[id] = false; // don't double-open
    },
  });

  ui.toast('🕹 WELCOME, PLAYER 2', innerWidth > 900
    ? 'WASD / arrows to move · walk to a zone · <b>~</b> for terminal'
    : 'drag the joystick to move · tap 🗺 to fast-travel', 'open');

  /* ================= input: keyboard + joystick ================= */
  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    // Konami code
    konamiCheck(e.key);
  });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  const joy = document.getElementById('joystick');
  const knob = document.getElementById('joy-knob');
  const joyVec = { x: 0, y: 0 };
  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (isTouch) joy.classList.remove('hidden');
  let joyId = null;
  joy.addEventListener('pointerdown', e => { joyId = e.pointerId; joy.setPointerCapture(joyId); moveJoy(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) moveJoy(e); });
  const endJoy = () => { joyId = null; joyVec.x = joyVec.y = 0; knob.style.transform = 'translate(-50%,-50%)'; };
  joy.addEventListener('pointerup', endJoy);
  joy.addEventListener('pointercancel', endJoy);
  function moveJoy(e) {
    const r = joy.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const m = Math.hypot(dx, dy), max = r.width / 2 - 14;
    if (m > max) { dx = dx / m * max; dy = dy / m * max; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joyVec.x = dx / max; joyVec.y = dy / max;
  }

  /* ================= konami + click-char egg ================= */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kIdx = 0, discoUntil = 0;
  function konamiCheck(key) {
    const k = key.toLowerCase();
    kIdx = (k === KONAMI[kIdx]) ? kIdx + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0;
      discoUntil = clock.elapsedTime + 10;
      hat.visible = true;
      ui.achieve('konami', '30 LIVES', 'the old codes still work');
      ui.confetti(60);
    }
  }

  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let clicks = 0, downAt = 0;
  renderer.domElement.addEventListener('pointerdown', () => { downAt = performance.now(); });
  renderer.domElement.addEventListener('pointerup', e => {
    if (performance.now() - downAt > 260) return; // it was a drag
    ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    if (ray.intersectObject(char, true).length) {
      if (++clicks >= 5) {
        clicks = 0;
        const b = document.getElementById('bubble');
        b.textContent = 'please, I\'m compiling.';
        b.classList.remove('hidden');
        setTimeout(() => b.classList.add('hidden'), 2600);
      }
    }
  });

  /* ================= rocket launch ================= */
  let launchT = -1;
  const exhaust = (() => {
    const g = new THREE.BufferGeometry();
    const N = 60, arr = new Float32Array(N * 3);
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const m = new THREE.PointsMaterial({ color: 0xffc21c, size: .3, transparent: true, opacity: 0 });
    const p = new THREE.Points(g, m);
    p.frustumCulled = false;
    zoneMeta.contact.group.add(p);
    return { p, m, arr, N };
  })();
  ui.onLaunch = () => { if (launchT < 0) launchT = 0; };

  /* ================= zone proximity ================= */
  const zoneArmed = {};
  ZONES.forEach(z => zoneArmed[z.id] = true);
  const collected = new Set();

  function checkZones() {
    if (ui.isPanelOpen()) return ui.hint('');
    let nearest = null, nd = 1e9;
    for (const z of ZONES) {
      const d = char.position.distanceTo(zoneMeta[z.id].pos);
      if (d < nd) { nd = d; nearest = z; }
      if (d > 4.2) zoneArmed[z.id] = true;
      if (d < 2.4 && zoneArmed[z.id]) {
        zoneArmed[z.id] = false;
        ui.openPanel(z.id);
      }
    }
    ui.hint(nd < 4.2 ? `⮕ ${nearest.label}` : '');

    cups.forEach((cup, i) => {
      if (!collected.has(i) && char.position.distanceTo(cup.position) < 1.3) {
        collected.add(i);
        cup.visible = false;
        ui.collectCoffee();
      }
    });
  }

  /* ================= main loop ================= */
  const clock = new THREE.Clock();
  const camTarget = new THREE.Vector3();
  let bobT = 0, fpsFrames = 0, fpsLast = performance.now();
  const SPEED = 6, WALK_R = 11.6;

  function tick() {
    const dt = Math.min(clock.getDelta(), .05);
    const t = clock.elapsedTime;

    // input
    let mx = joyVec.x, mz = joyVec.y;
    if (!ui.isPanelOpen()) {
      if (keys['w'] || keys['arrowup']) mz -= 1;
      if (keys['s'] || keys['arrowdown']) mz += 1;
      if (keys['a'] || keys['arrowleft']) mx -= 1;
      if (keys['d'] || keys['arrowright']) mx += 1;
    } else { mx = mz = 0; }
    const mag = Math.hypot(mx, mz);
    if (mag > 0.01) {
      const s = Math.min(mag, 1) / mag;
      char.position.x += mx * s * SPEED * dt;
      char.position.z += mz * s * SPEED * dt;
      const r = Math.hypot(char.position.x, char.position.z);
      if (r > WALK_R) { char.position.x *= WALK_R / r; char.position.z *= WALK_R / r; }
      char.rotation.y = THREE.MathUtils.lerp(char.rotation.y, Math.atan2(mx, mz), Math.min(1, dt * 12));
      bobT += dt * 11;
      char.position.y = Math.abs(Math.sin(bobT)) * .14;
    } else {
      char.position.y = THREE.MathUtils.lerp(char.position.y, Math.sin(t * 2) * .03 + .02, dt * 6);
    }

    // camera follow
    camTarget.copy(char.position).add(island.position);
    camera.position.lerp(camTarget.clone().add(CAM_OFF), 1 - Math.pow(.001, dt));
    camera.lookAt(camTarget.x, camTarget.y + 1, camTarget.z);

    // idle animations
    for (const a of animated) a.fn(t, dt);

    // disco mode
    if (t < discoUntil) {
      hemi.color.setHSL((t * .5) % 1, .9, .55);
      rim.color.setHSL((t * .5 + .33) % 1, .9, .55);
      rim.intensity = 1.6;
      hat.rotation.y = t * 6;
    } else if (hat.visible) {
      hat.visible = false;
      hemi.color.setHex(0x8fb3ff);
      rim.color.setHex(ACCENT); rim.intensity = .5;
    }

    // rocket launch animation
    if (launchT >= 0) {
      launchT += dt;
      const ph = launchT;
      if (ph < 2.2) {
        rocket.position.y = Math.pow(ph, 2.2) * 6;
        rocket.rotation.z = Math.sin(ph * 30) * .01;
        exhaust.m.opacity = 1;
        for (let i = 0; i < exhaust.N; i++) {
          exhaust.arr[i * 3] = (Math.random() - .5) * .8;
          exhaust.arr[i * 3 + 1] = rocket.position.y + .4 - Math.random() * (1 + ph);
          exhaust.arr[i * 3 + 2] = (Math.random() - .5) * .8;
        }
        exhaust.p.geometry.attributes.position.needsUpdate = true;
      } else if (ph < 4) {
        exhaust.m.opacity = Math.max(0, 1 - (ph - 2.2));
        rocket.position.y = THREE.MathUtils.lerp(rocket.position.y, 0, dt * 2.5);
      } else {
        rocket.position.y = 0; exhaust.m.opacity = 0; launchT = -1;
      }
    }

    checkZones();

    // fps meter
    fpsFrames++;
    const now = performance.now();
    if (now - fpsLast >= 1000) {
      ui.setFPS(Math.round(fpsFrames * 1000 / (now - fpsLast)));
      fpsFrames = 0; fpsLast = now;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  camera.position.copy(char.position).add(CAM_OFF);
  camera.lookAt(char.position);
  tick();
}
