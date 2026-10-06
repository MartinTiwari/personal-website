// Trace the alpha boundary of Martin's supplied signature; no invented lettering.
const fs = require('fs');
const sharp = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const strokes = [
  'M5 497 C4 451 3 401 32 335 C80 246 155 140 257 34 C263 29 262 36 255 51 L10 482',
  'M10 482 C80 354 169 229 222 176 C287 122 242 210 217 252 L53 497 C48 501 52 484 62 469 L193 296 C217 266 232 263 231 296 C240 300 249 248 273 242 C292 235 316 266 337 244 C359 216 385 106 391 44 C396 11 384 -9 371 10 C333 63 298 216 296 309 C294 380 294 436 316 466 C348 511 375 493 337 470 C316 454 286 452 251 463 L228 475 C220 480 227 462 240 445 L383 248',
  'M155 146 C157 223 177 347 191 426 C204 522 215 616 239 680',
  'M307 375 L339 354'
];
function simplify(points, tolerance = .65) {
  if (points.length < 3) return points;
  const a = points[0], b = points.at(-1), dx = b[0] - a[0], dy = b[1] - a[1];
  let far = 0, index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t = dx || dy ? Math.max(0, Math.min(1, ((p[0]-a[0])*dx + (p[1]-a[1])*dy)/(dx*dx+dy*dy))) : 0;
    const d = Math.hypot(p[0]-a[0]-t*dx, p[1]-a[1]-t*dy);
    if (d > far) { far = d; index = i; }
  }
  return far <= tolerance ? [a,b] : [...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)];
}
(async () => {
  const { data, info } = await sharp('assets/signature.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const w = info.width, h = info.height;
  const on = (x,y) => x>=0 && x<w && y>=0 && y<h && data[(y*w+x)*4+3] > 90;
  const edges = new Map();
  const edge = (x,y,a,b) => { const key = `${x},${y}`; if (!edges.has(key)) edges.set(key,[]); edges.get(key).push([a,b]); };
  for (let y=0;y<h;y++) for(let x=0;x<w;x++) if(on(x,y)) {
    if(!on(x,y-1)) edge(x,y,x+1,y);
    if(!on(x+1,y)) edge(x+1,y,x+1,y+1);
    if(!on(x,y+1)) edge(x+1,y+1,x,y+1);
    if(!on(x-1,y)) edge(x,y+1,x,y);
  }
  const contours=[];
  while(edges.size) {
    const start=edges.keys().next().value; let key=start;
    const points=[start.split(',').map(Number)];
    do {
      const nexts=edges.get(key); if(!nexts) break;
      const next=nexts.pop(); if(!nexts.length) edges.delete(key);
      points.push(next); key=next.join(',');
    } while(key!==start);
    if(points.length>5) contours.push(simplify(points));
  }
  const outline=contours.map(points=>`M${points.map(p=>p.join(' ')).join('L')}Z`).join('');
  const mask=strokes.map(d=>`<path class="intro-stroke" d="${d}" fill="none" stroke="white" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`).join('\n');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><mask id="signature-write-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">${mask}</mask></defs><path class="intro-ink" d="${outline}" fill="currentColor" fill-rule="evenodd" mask="url(#signature-write-mask)"/></svg>`;
  fs.writeFileSync('assets/signature-traced.svg',svg);
  await sharp(Buffer.from(svg.replace('currentColor','#E8532F'))).resize({height:681}).flatten({background:'#ffffff'}).png().toFile('signature-trace-preview.png');
  console.log(JSON.stringify({ contours:contours.length, strokes:strokes.length, bytes:svg.length }));
})();
