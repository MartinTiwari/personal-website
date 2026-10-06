const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0];const file=path.join(process.cwd(),url==='/'?'index.html':url);const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png'};fs.readFile(file,(e,d)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(file)]||'text/plain'});res.end(e?'':d);});}).listen(4175,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['landscape',844,390]]){
  const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
  await page.goto('http://127.0.0.1:4175',{waitUntil:'domcontentloaded'});
  await page.locator('.intro-stroke').evaluateAll(paths=>paths.forEach(p=>p.getAnimations().forEach(a=>{a.pause();a.currentTime=3300;})));
  await page.locator('.intro-letter').evaluate(el=>el.getAnimations().forEach(a=>a.finish()));
  await page.screenshot({path:`${output}/welcome-${name}.png`});
  const letter=await page.locator('.intro-letter').boundingBox();if(letter.x<0||letter.x+letter.width>width+5||letter.y<0||letter.y+letter.height>height)throw Error(`${name}: note outside screen`);
  await page.locator('.intro-skip').click();await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  if(await page.locator('.top .brand-sig').count())throw Error('Signature remains in header');
  if((await page.locator('.desk-contact').innerText()).includes('negotiate'))throw Error('Old intro copy remains');
  if(!await page.locator('.desk-cat #haru-pet').isVisible())throw Error('HARU hidden');
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error(`${name}: horizontal overflow`);
  await page.screenshot({path:`${output}/desk-${name}.png`,fullPage:true});
  await page.locator('.desk-cat').click();if(!await page.locator('.desk-cat').evaluate(el=>el.classList.contains('cat-speaking')))throw Error('Cat click no response');
  await page.locator('.desk-folder').click();if(!await page.locator('#desk-view').evaluate(el=>el.open))throw Error('Folder failed');
  if(!await page.locator('.desk-cat').evaluate(el=>el.classList.contains('cat-paused')))throw Error('Cat animation running behind folder');
  await page.locator('.desk-back').click();
  await page.locator('.desk-signature').click();if(!await page.locator('#signature-intro').isVisible())throw Error('Signature replay failed');
  await page.keyboard.press('Escape');await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
  if(errors.length)throw Error(errors.join(','));console.log(`${name}: intro bounds, header, copy, cat, folder, replay and overflow passed`);await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));await reduced.goto('http://127.0.0.1:4175');
 if(await reduced.locator('#signature-intro').isVisible())throw Error('Reduced-motion auto intro');
 if(!await reduced.locator('.desk-cat #haru-pet').isVisible())throw Error('Reduced-motion cat missing');
 await reduced.locator('.desk-signature').click();await reduced.locator('.intro-enter').click();console.log('reduced motion: static cat and manual intro passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
