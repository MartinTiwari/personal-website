const fs = require('fs'), http = require('http'), path = require('path');
const {chromium} = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out = path.join(process.cwd(), '.qa-family');
(async () => {
 fs.mkdirSync(out, {recursive:true});
 const server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0],file=path.join(process.cwd(),name==='/'?'index.html':name);
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)});
 }).listen(4187,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try {
  for(const [name,width,height] of [['desktop',1440,1000],['phone',390,844],['small',320,740],['reduced',390,844]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:name==='reduced'?'reduce':'no-preference'}), errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v2','1'));
   await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'||u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('gstatic.com')?r.continue():r.fulfill({status:200,body:'{}'})});
   await page.goto('http://127.0.0.1:4187/#photos',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   const tabs=page.locator('.album-tabs button');
   if(await tabs.count()!==3)throw Error('Unexpected album count');
   if((await tabs.allTextContents()).some(s=>s.includes('confirmed')))throw Error('Dad spoiler tab remains');
   await tabs.filter({hasText:'family'}).click();
   const family=page.locator('.album-group:not([hidden])');
   if((await family.innerText()).includes('first, the cat'))throw Error('Persistent cat introduction remains');
   if(await family.locator('.pol').count()!==7)throw Error('Family members missing or duplicated');
   if(!await family.locator('.pol.album-selected img').getAttribute('src').then(s=>s.includes('graduation')))throw Error('Family does not start with mom');
   await page.screenshot({path:path.join(out,`${name}-family.png`)});
   await family.locator('.pol.album-selected').click();
   if(!await page.locator('#lightbox').isVisible())throw Error('Family lightbox broken');
   for(let i=0;i<22;i++) { if((await page.locator('#lb-img').getAttribute('src')).includes('dad-topi'))throw Error('Dad revealed by lightbox'); await page.locator('#lb-next').click(); }
   await page.locator('#lb-close').click();
   for(let i=0;i<5;i++)await family.locator('.album-controls button').last().click();
   if(!await family.locator('#gf-card').isVisible())throw Error('Private family card missing');
   await family.locator('#gf-card').click();
   if(!await family.locator('#gf-card .gf-stamp').isVisible())throw Error('Privacy treatment lost');
   await family.locator('.album-controls button').last().click();
   const dad=family.locator('.family-dad');
   if(!await dad.isVisible() || !await dad.locator('.dad-reveal').isVisible())throw Error('Dad setup missing');
   if((await dad.innerText()).includes('caught.'))throw Error('Punchline visible before reveal');
   await dad.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${name}-dad-before.png`)});
   if(name==='phone') {
    let first=true;
    await page.route('**/assets/dad-topi.webp',r=>{if(first){first=false;return r.abort()}return r.continue()});
    await dad.locator('.dad-reveal').click();
    await page.waitForFunction(()=>document.querySelector('.dad-reveal').textContent.includes('try again'));
    if(!await dad.locator('.dad-missing').isVisible()||!await dad.locator('.dad-reveal').isEnabled())throw Error('Failed photo has no retry');
   }
   await dad.locator('.dad-reveal').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>{const el=document.querySelector('.family-dad');return el.innerText.includes('caught. putting a topi')});
   const img=dad.locator('img');
   if(!await img.evaluate(el=>el.complete&&el.naturalWidth>0))throw Error('Dad revealed before image loaded');
   if(await img.evaluate(el=>getComputedStyle(el).objectPosition)!=='50% 65%')throw Error('Dad photo crop overridden');
   await page.waitForTimeout(name==='reduced'?0:550);
   await page.screenshot({path:path.join(out,`${name}-dad-after.png`)});
   await family.locator('.album-controls button').first().click();await family.locator('.album-controls button').last().click();
   if(!(await dad.innerText()).includes('caught.'))throw Error('Dad reveal state lost');
   await tabs.filter({hasText:'HARU'}).click();
   const haru=page.locator('.album-group:not([hidden])');
   if(await haru.locator('.pol').count()!==3)throw Error('HARU birthday photo missing');
   for(let i=0;i<3;i++)await haru.locator('.album-controls button').last().click();
   if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error(name+': horizontal overflow');
   if(errors.length)throw Error(errors.join('\n'));
   console.log(name+': family sequence, privacy, lightbox, dad reveal, retained state and HARU passed');
   await page.close();
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
