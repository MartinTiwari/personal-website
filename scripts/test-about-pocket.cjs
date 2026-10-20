const fs = require('fs'), http = require('http'), path = require('path');
const { chromium } = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output = path.join(process.cwd(), '.qa-about');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = http.createServer((req, res) => {
    const file = path.join(process.cwd(), req.url.split('?')[0] === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(file, (err, data) => { res.writeHead(err ? 404 : 200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream' }); res.end(err ? '' : data); });
  }).listen(4186, '127.0.0.1');
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['phone', 390, 844], ['small', 320, 740]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => { sessionStorage.setItem('signature-intro-seen-v2', '1'); sessionStorage.setItem('ktm-wx', JSON.stringify({t:Date.now(),temp:23,code:2})); });
      await page.route('**/*', r => {
        const u = new URL(r.request().url());
        if (u.hostname === '127.0.0.1' || u.hostname.endsWith('googleapis.com') || u.hostname.endsWith('gstatic.com')) return r.continue();
        return r.fulfill({ status: 200, body: '{}' });
      });
      await page.goto('http://127.0.0.1:4186/#about', { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const panel = page.locator('[data-view="about"]');
      const sections = await panel.locator(':scope > section').evaluateAll(els => els.map(e => ({ classes: e.className, height: Math.round(e.getBoundingClientRect().height) })));
      console.log(name, JSON.stringify(sections));
      if (await panel.locator('.about-pockets').count()) {
        if (!await panel.locator('.rapid-label').isVisible()) throw Error('Deck heading hidden');
        const cards = panel.locator('#strip .card');
        const total = await cards.count();
        if (total !== 14) throw Error('Missing personal detail cards');
        for (let index = 0; index < total; index++) {
          const card = panel.locator('#strip .card:not([hidden])');
          for (const back of [false, true]) {
            const face = card.locator(back ? '.card-back' : '.card-front');
            const overflow = await face.evaluate(el => ({ height: el.clientHeight, scroll: el.scrollHeight }));
            if (overflow.scroll > overflow.height + 2) throw Error(`${name}: card ${index + 1} ${back ? 'back' : 'front'} overflows ${JSON.stringify(overflow)}`);
            await panel.locator('.pocket-flip').click();
            if (await card.getAttribute('aria-pressed') !== String(!back)) throw Error('Flip state incorrect');
          }
          await panel.locator('.pocket-next').click();
        }
        if (await panel.locator('.pocket-count').innerText() !== '1 of 14') throw Error('Deck did not wrap');
        await panel.locator('#strip .card:not([hidden])').focus();
        await page.keyboard.press('ArrowLeft');
        if (await panel.locator('.pocket-count').innerText() !== '14 of 14') throw Error('Keyboard deck navigation failed');
        await page.keyboard.press('Enter');
        if (await panel.locator('#strip .card:not([hidden])').getAttribute('aria-pressed') !== 'true') throw Error('Keyboard flip failed');
        await panel.locator('.pocket-next').click();
        await panel.locator('.about-postscript summary').click();
        if (!await panel.locator('#secrets').isVisible() || !await panel.locator('#ps-note').isVisible()) throw Error('Envelope content lost');
        await panel.locator('.about-postscript summary').click();
      }
      if (await page.locator('#desk-view').evaluate(el => el.scrollWidth > el.clientWidth + 2)) throw Error(name + ': horizontal overflow');
      for (const [label, selector] of [['rollback', '.about-rollback'], ['pockets', '.about-pockets'], ['dispatch', '.outro']]) {
        const section = panel.locator(selector);
        if (!await section.count()) continue;
        await section.evaluate(el => { const d = document.querySelector('#desk-view'); d.scrollTop += el.getBoundingClientRect().top - d.getBoundingClientRect().top - document.querySelector('.desk-view-bar').getBoundingClientRect().height - 12; });
        await page.screenshot({ path: path.join(output, `${name}-${label}.png`) });
      }
      if (errors.length) throw Error(errors.join('\n'));
      await page.close();
    }
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
