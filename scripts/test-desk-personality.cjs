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
  const adBounds=await page.locator('.desk-business').boundingBox(), links=await page.locator('.desk-bottom').boundingBox();
  if(adBounds.y+adBounds.height>links.y)throw Error(`${name}: ad overlaps desk links ${JSON.stringify({adBounds,links})}`);
  const controls=await page.locator('.portrait-controls').boundingBox();
  if(adBounds.y-12<controls.y+controls.height)throw Error(`${name}: ad tape overlaps portrait controls`);
  await page.screenshot({path:`${output}/desk-${name}.png`,fullPage:true});
  await page.locator('#me').click();if(!(await page.locator('.portrait-dialogue').innerText()).includes('Three projects shipped'))throw Error('Portrait tour failed');
  if(!await page.locator('.portrait-route').isVisible())throw Error('Portrait route missing');
  if((await page.locator('.business-main').getAttribute('href'))!=='https://www.everestsuperchemical.com.np/')throw Error('Ad link wrong');
  if((await page.locator('.business-sister').getAttribute('href'))!=='https://everestbeverage.com.np/')throw Error('Sister company link wrong');
  if(!await page.locator('.desk-business').evaluate(el=>{const main=el.querySelector('.business-main'),sister=el.querySelector('.business-sister');return main.offsetTop+main.offsetHeight<=sister.offsetTop}))throw Error('Family business links overlap');
  for(let stop=0;stop<4;stop++)await page.locator('#me').click();
  const speech=await page.locator('.portrait-dialogue').boundingBox(), heading=await page.locator('.desk-heading').boundingBox(), face=await page.locator('#me').boundingBox();
  if(speech.y<heading.y+heading.height||speech.y+speech.height>face.y)throw Error(`${name}: longest tour reply overlaps introduction or portrait ${JSON.stringify({speech,heading,face})}`);
  await page.screenshot({path:`${output}/desk-tour-${name}.png`,fullPage:true});
  if(name==='desktop'){
   await page.locator('.desk-cat').click();await page.waitForFunction(()=>document.querySelector('.desk-cat').dataset.perch==='mark'&&!document.querySelector('.desk-cat').classList.contains('cat-jumping'));
   await page.locator('.portrait-call').click();await page.waitForFunction(()=>document.querySelector('.desk-cat').dataset.perch==='martin'&&!document.querySelector('.desk-cat').classList.contains('cat-jumping'));
   if(!(await page.locator('.portrait-dialogue').innerText()).includes('hoodie'))throw Error('Portrait does not respond to landing');
   await page.screenshot({path:`${output}/desk-active-${name}.png`,fullPage:true});
  }else{
   await page.evaluate(()=>{const folder=document.querySelector('.desk-folder');scrollTo({top:folder.getBoundingClientRect().top+scrollY-100,behavior:'instant'})});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   await page.locator('.desk-cat').click();
   if(name==='mobile')await page.waitForFunction(()=>document.querySelector('.desk-cat').dataset.perch==='mark'&&!document.querySelector('.desk-cat').classList.contains('cat-jumping'));
   else await page.waitForFunction(()=>!document.querySelector('.desk-cat').classList.contains('cat-jumping'));
   if(name==='mobile'&&(await page.locator('.desk-cat').getAttribute('data-perch'))!=='mark')throw Error('Mobile cat did not hop between visible objects');
  }
  await page.locator('.desk-folder').click();if(!await page.locator('#desk-view').evaluate(el=>el.open))throw Error('Folder failed');
  if(!await page.locator('.desk-cat').evaluate(el=>el.classList.contains('cat-paused')))throw Error('Cat animation running behind folder');
  await page.locator('.desk-back').click();
  await page.locator('.desk-signature').click();if(!await page.locator('#signature-intro').isVisible())throw Error('Signature replay failed');
  await page.keyboard.press('Escape');await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
  if(errors.length)throw Error(errors.join(','));console.log(`${name}: portrait tour, ad link, cat perch, folder, replay and overflow passed`);await page.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));await reduced.goto('http://127.0.0.1:4175');
 if(await reduced.locator('#signature-intro').isVisible())throw Error('Reduced-motion auto intro');
 if(!await reduced.locator('.desk-cat #haru-pet').isVisible())throw Error('Reduced-motion cat missing');
 await reduced.locator('.desk-signature').click();await reduced.locator('.intro-enter').click();console.log('reduced motion: static cat and manual intro passed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
