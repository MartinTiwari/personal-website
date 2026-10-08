const fs = require('fs'), http = require('http'), path = require('path');
const { chromium } = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
// Deterministic local diagnostic. API responses are fixtures, not production timings.
(async () => {
  const server = http.createServer((req, res) => {
    const file = path.join(process.cwd(), req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0]);
    fs.readFile(file, (error, data) => {
      res.writeHead(error ? 404 : 200, { 'Content-Type': ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg' })[path.extname(file)] || 'text/plain' });
      res.end(error ? '' : data);
    });
  }).listen(4180, '127.0.0.1');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [], reads = [], notePosts = [];
    let noteReadFinished = false;
    let releaseNoteRead;
    const pendingNoteRead = new Promise(resolve => { releaseNoteRead = resolve; });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/') || url.hostname === 'api.open-meteo.com') {
        if (route.request().method() === 'POST') {
          notePosts.push({ path: url.pathname, initialReadFinished: noteReadFinished, body: route.request().postData() });
          return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        }
        reads.push(url.pathname);
        if (url.pathname === '/api/notes') {
          await pendingNoteRead;
          noteReadFinished = true;
        }
        const body = url.pathname === '/api/notes' ? { notes: [{ text: 'Performance fixture note' }] }
          : url.pathname === '/api/clash' ? { trophies: 5000, best: 6000, arena: 'Fixture arena' }
          : url.pathname === '/api/youtube' ? { items: [] }
          : { current: { temperature_2m: 20, weather_code: 1 } };
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      }
      if (url.hostname !== '127.0.0.1') return route.fulfill({ status: 200, body: '' });
      return route.continue();
    });
    await page.addInitScript(() => {
      sessionStorage.setItem('signature-intro-seen-v1', '1');
      window.__perf = { scrollFrames: 0, hiddenRectReads: 0 };
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = callback => {
        const source = new Error().stack || '';
        return raf.call(window, time => {
          if (source.includes('/src/main.js')) window.__perf.scrollFrames++;
          callback(time);
        });
      };
      const rect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        if (this.id === 'ps-note' && this.closest('[hidden]')) window.__perf.hiddenRectReads++;
        return rect.call(this);
      };
    });
    await page.goto('http://127.0.0.1:4180', { waitUntil: 'load' });
    await page.locator('.intro-skip').click({ timeout: 1500 }).catch(() => {});
    await page.waitForTimeout(300);
    const initialReads = [...reads];
    await page.evaluate(async () => {
      window.__perf.scrollFrames = 0; window.__perf.hiddenRectReads = 0;
      for (let i = 0; i < 20; i++) {
        window.dispatchEvent(new Event('scroll'));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }
    });
    const scrollWork = await page.evaluate(() => window.__perf);
    for (const panel of ['about', 'music', 'mark', 'projects', 'photos']) {
      await page.evaluate(key => { location.hash = key; }, panel);
      await page.waitForTimeout(350);
      if (!await page.locator('#desk-view').evaluate(el => el.open)) throw Error(`${panel} failed to open`);
      if (panel === 'about') {
        await page.locator('#disp-sky').scrollIntoViewIfNeeded();
        await page.waitForTimeout(200);
        if (!(await page.locator('#disp-sky').innerText()).includes('20°C')) throw Error('Weather deferred fetch did not render');
      }
      if (panel === 'mark') {
        await page.locator('#book-open').click();
        await page.locator('#note-text').fill('Early submission while the book loads');
        await page.locator('#note-form .pin-btn').click();
        await page.waitForTimeout(100);
        if (notePosts.length) throw Error('Early submission raced the initial guestbook read');
        releaseNoteRead();
        await page.waitForFunction(() => !document.querySelector('#note-form .pin-btn').disabled);
        await page.waitForFunction(() => document.querySelector('#book-inner').innerText.includes('Early submission while the book loads'));
        if (!(await page.locator('#book-inner').innerText()).includes('Performance fixture note')) throw Error('Guestbook deferred fetch did not render');
        if (!(await page.locator('#book-inner').innerText()).includes('Early submission while the book loads')) throw Error('Early note was lost');
        if (notePosts.length !== 1 || !notePosts[0].initialReadFinished) throw Error('Early note did not wait and POST publicly');
      }
    }
    if (process.argv.includes('--assert-optimized')) {
      if (initialReads.length || scrollWork.scrollFrames || scrollWork.hiddenRectReads) throw Error('Hidden work returned to the landing page');
      for (const endpoint of ['/v1/forecast', '/api/clash', '/api/youtube', '/api/notes']) {
        if (reads.filter(read => read === endpoint).length !== 1) throw Error(`Expected exactly one deferred read for ${endpoint}`);
      }
    }
    if (errors.length) throw Error(errors.join('; '));
    console.log(JSON.stringify({ environment: 'Local Edge, fixture APIs, 20 synthetic scroll events', initialReads, scrollWork, allDrawerReads: reads, slowGuestbook: 'Early submission waited for delayed GET and then POSTed publicly, both notes retained', drawers: 'about, music, mark, projects, photos opened without JS errors' }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exit(1); });
