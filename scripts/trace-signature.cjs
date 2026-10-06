// Trace the alpha boundary of Martin's supplied signature; no invented lettering.
const fs = require('fs');
const sharp = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const strokes = [
  // The signing video begins with this downward stem, before the B-like loops.
  'M155 146 C157 223 177 347 191 426 C204 522 215 616 239 680',
  'M5 497 C4 451 3 401 32 335 C80 246 155 140 257 34 C263 29 262 36 255 51 L10 482',
  'M10 482 C80 354 169 229 222 176 C287 122 242 210 217 252 L53 497 C48 501 52 484 62 469 L193 296 C217 266 232 263 231 296 C240 300 249 248 273 242 C292 235 316 266 337 244 C359 216 385 106 391 44 C396 11 384 -9 371 10 C333 63 298 216 296 309 C294 380 294 436 316 466 C348 511 375 493 337 470 C316 454 286 452 251 463 L228 475',
  'M228 475 C220 480 227 462 240 445 L383 248',
  'M307 375 L339 354'
];
const durations = [350, 650, 1150, 330, 110];
function samples(d) {
  const tokens=d.match(/[MCL]|-?\d+(?:\.\d+)?/g), points=[];
  let i=0,x=0,y=0;
  while(i<tokens.length) {
    const command=tokens[i++];
    if(command==='M') { x=+tokens[i++];y=+tokens[i++];points.push([x,y]); }
    else if(command==='L') {
      const a=+tokens[i++],b=+tokens[i++],n=Math.ceil(Math.hypot(a-x,b-y)/2);
      for(let j=1;j<=n;j++)points.push([x+(a-x)*j/n,y+(b-y)*j/n]);x=a;y=b;
    } else if(command==='C') {
      const a=+tokens[i++],b=+tokens[i++],c=+tokens[i++],e=+tokens[i++],f=+tokens[i++],g=+tokens[i++];
      for(let j=1;j<=250;j++){const t=j/250,u=1-t;points.push([u*u*u*x+3*u*u*t*a+3*u*t*t*c+t*t*t*f,u*u*u*y+3*u*u*t*b+3*u*t*t*e+t*t*t*g]);}x=f;y=g;
    }
  }
  return points;
}
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
  const labels = new Uint8Array(w*h);
  const lines = strokes.map(samples);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>90){
    let nearest=Infinity,owner=0;
    lines.forEach((points,index)=>{for(const p of points){const distance=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y);if(distance<nearest){nearest=distance;owner=index;}}});
    labels[y*w+x]=owner+1;
  }
  // Each pen stroke owns its ink. Crossings cannot expose a future stroke.
  function trace(owner) {
  const on = (x,y) => x>=0 && x<w && y>=0 && y<h && labels[y*w+x]===owner+1;
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
  return contours.map(points=>`M${points.map(p=>p.join(' ')).join('L')}Z`).join('');
  }
  const mask=strokes.map((d,i)=>`<mask id="signature-write-mask-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><path class="intro-stroke" data-duration="${durations[i]}" d="${d}" fill="none" stroke="white" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/></mask>`).join('\n');
  const ink=strokes.map((d,i)=>`<path class="intro-ink" data-ink="${i}" d="${trace(i)}" fill="currentColor" fill-rule="evenodd" mask="url(#signature-write-mask-${i})"/>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs>${mask}</defs>${ink}</svg>`;
  fs.writeFileSync('assets/signature-traced.svg',svg);
  await sharp(Buffer.from(svg.replaceAll('currentColor','#E8532F'))).resize({height:681}).flatten({background:'#ffffff'}).png().toFile('signature-trace-preview.png');
  console.log(JSON.stringify({ strokes:strokes.length, bytes:svg.length }));
})();
