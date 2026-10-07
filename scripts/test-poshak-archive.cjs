const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{
  const file=path.join(process.cwd(),req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)});
 }).listen(4176,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
   await page.goto('http://127.0.0.1:4176',{waitUntil:'domcontentloaded'});
   await page.locator('.desk-folder').click();
   await page.locator('.clothing-archive').scrollIntoViewIfNeeded();
   await page.evaluate(()=>document.fonts.ready);
   await page.locator('.clothing-archive img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode()))});
   const result=await page.locator('.clothing-archive').evaluate(el=>({
    text:el.textContent,loaded:[...el.querySelectorAll('img')].every(img=>img.naturalWidth>0),
    overflow:document.querySelector('#desk-view').scrollWidth>document.querySelector('#desk-view').clientWidth+2,
    bounds:[...el.querySelectorAll('img,h3,p')].every(child=>{const b=child.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth})
   }));
   if(!result.loaded||result.overflow||!result.bounds||!result.text.includes('NO LONGER RUNNING')||!result.text.includes('Poshak'))throw Error(JSON.stringify(result));
   await page.locator('.clothing-archive').evaluate(el=>{const dialog=document.querySelector('#desk-view');dialog.scrollTo({top:dialog.scrollTop+el.getBoundingClientRect().top-dialog.getBoundingClientRect().top-85,behavior:'instant'})});
   await page.screenshot({path:`${output}/poshak-${name}.png`});
   await page.locator('.clothing-campaign').scrollIntoViewIfNeeded();
   await page.screenshot({path:`${output}/poshak-campaign-${name}.png`});
   await page.locator('.desk-back').click();
   await page.locator('.desk-player').click();
   if(!(await page.locator('#desk-view').innerText()).toLowerCase().includes('music'))throw Error('Music drawer routing regressed');
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: Poshak images, archive status, drawer routing and no overflow passed`);
   await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
