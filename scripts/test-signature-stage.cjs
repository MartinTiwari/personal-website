const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4185,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['phone',390,844],['small',320,740],['landscape',844,390]]){
   const page=await browser.newPage({viewport:{width,height}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>{const url=new URL(r.request().url());return url.hostname==='127.0.0.1'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'?r.continue():r.fulfill({status:200,body:''})});
   await page.goto('http://127.0.0.1:4185',{waitUntil:'domcontentloaded'});
   await page.locator('.intro-stroke').evaluateAll(paths=>paths.forEach(p=>p.getAnimations().forEach(a=>{a.pause();a.currentTime=3550})));
   if(!await page.locator('#signature-intro').isVisible())throw Error('Entry missing');
   if(await page.locator('.intro-letter-copy,.intro-postscript,.intro-pen').count())throw Error('Letter or pen remains');
   const sig=await page.locator('.intro-autograph svg').boundingBox();
   if(sig.x<0||sig.y<0||sig.x+sig.width>width||sig.y+sig.height>height)throw Error(`${name}: signature clipped ${JSON.stringify(sig)}`);
   if(Math.abs(sig.x+sig.width/2-width/2)>30||Math.abs(sig.y+sig.height/2-height/2)>60)throw Error(`${name}: signature not central`);
   if(width<500&&sig.width<width*.72)throw Error(`${name}: signature still too small`);
   if(width>1000&&sig.height<height*.65)throw Error('Desktop signature still too small');
   if(!await page.locator('.desk-home').evaluate(el=>el.inert))throw Error('Background interactive during entry');
   await page.screenshot({path:`${output}/signature-stage-${name}.png`});
   await page.keyboard.press('Escape');await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
   if(await page.locator('.desk-home').evaluate(el=>el.inert))throw Error('Background remains locked');
   await page.goto('http://127.0.0.1:4185/?intro=1#about',{waitUntil:'domcontentloaded'});
   if(!await page.locator('#signature-intro').isVisible())throw Error('Direct replay link failed');
   if(await page.locator('#desk-view').evaluate(el=>el.open))throw Error('Other page opened over forced entry');
   await page.locator('.intro-enter').click();await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: big centred entry, no letter, skip, focus and direct replay passed`);
   await page.close();
  }
  const reduced=await browser.newPage({reducedMotion:'reduce'});await reduced.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
  await reduced.goto('http://127.0.0.1:4185/?intro=1');
  if(!await reduced.locator('#signature-intro').isVisible())throw Error('Reduced motion replay missing');
  if(await reduced.locator('#signature-intro').evaluate(el=>el.getAnimations({subtree:true}).length))throw Error('Reduced motion still animates');
  await reduced.locator('.intro-enter').click();console.log('Reduced motion: static centred signature with manual entry passed');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
