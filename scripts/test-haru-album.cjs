const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{
  const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)});
 }).listen(4177,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
   await page.goto('http://127.0.0.1:4177',{waitUntil:'domcontentloaded'});
   await page.locator('.desk-photos').click();
   await page.getByRole('button',{name:'HARU, the actual owner',exact:true}).click();
   const group=page.locator('.album-group').filter({has:page.locator('.haru-album')});
   if(!await group.isVisible())throw Error('HARU album not visible');
   await group.locator('.album-selected img').evaluate(img=>img.decode());
   await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:`${output}/haru-album-${name}.png`});
   if(!((await group.locator('.album-selected img').getAttribute('src')).includes('management')))throw Error('Wrong first photo');
   await group.getByRole('button',{name:'inspect the camera →',exact:true}).click();
   await group.locator('.album-selected img').evaluate(img=>img.decode());
   if(!((await group.locator('.album-selected img').getAttribute('src')).includes('inspection')))throw Error('Next did not switch photo');
   if((await group.locator('.album-count').innerText())!=='2 / 2')throw Error('Wrong counter');
   if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error('Album horizontal overflow');
   await page.screenshot({path:`${output}/haru-inspection-${name}.png`});
   await group.locator('.album-selected').click();
   if(!await page.locator('#lightbox').isVisible())throw Error('Enlarged photo did not open');
   if(!(await page.locator('#lb-cap').innerText()).includes('personal space'))throw Error('Enlarged caption incorrect');
   await page.locator('#lb-close').click();
   await group.getByRole('button',{name:'back to management →',exact:true}).focus();
   await page.keyboard.press('Enter');
   if((await group.locator('.album-count').innerText())!=='1 / 2')throw Error('Keyboard navigation failed');
   await page.getByRole('button',{name:'the family',exact:true}).click();
   if(await group.isVisible())throw Error('Album switching failed');
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: both photos, captions, enlarged view, keyboard controls, album switching and overflow passed`);
   await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
