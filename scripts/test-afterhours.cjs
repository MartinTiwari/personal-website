const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4182,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['tablet',701,900],['small',320,740]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v1','1'));
   await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4182')?r.continue():r.fulfill({status:200,body:''}));
   await page.goto('http://127.0.0.1:4182',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   if(!/^Kathmandu \d{2}:\d{2}$/.test(await page.locator('.desk-local-time').innerText()))throw Error('Local clock absent');
   if(await page.locator('.desk-invitation-copy > a').getAttribute('href')!=='https://ig.me/m/martin_tiwari')throw Error('Invitation should open Instagram messages');
   if(name==='tablet'){
    if(!await page.locator('.desk-photos').evaluate(el=>{const title=el.querySelector('strong'),caption=el.querySelector('.object-caption');return title.offsetTop+title.offsetHeight<=caption.offsetTop}))throw Error('Tablet photo caption overlaps its title');
    if(!await page.locator('.desk-scene').evaluate(el=>{const book=el.querySelector('.desk-book'),ad=el.querySelector('.desk-business');return book.offsetTop+book.offsetHeight<=ad.offsetTop}))throw Error('Tablet guestbook overlaps family notice');
   }
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error(`${name}: page overflow`);
   const invitation=await page.locator('.desk-invitation').boundingBox(),signature=await page.locator('.desk-signature img').boundingBox();
   if(signature.x<invitation.x-3||signature.x+signature.width>invitation.x+invitation.width+3)throw Error(`${name}: signature outside invitation`);
   await page.screenshot({path:`${output}/afterhours-${name}.png`,fullPage:true});
   await page.locator('.desk-surprise').click();
   await page.waitForFunction(()=>document.querySelector('#desk-view').open);
   if(!await page.locator('.desk-route-note').isVisible())throw Error('HARU choice lacks visible explanation');
   const chosen=new URL(page.url()).hash;
   if((await page.locator('.desk-file-nav [aria-current="page"]').getAttribute('href'))!==chosen)throw Error('Active file missing');
   await page.locator('.desk-back').click();
   await page.locator('.desk-surprise').click();await page.waitForFunction(()=>document.querySelector('#desk-view').open);
   if(new URL(page.url()).hash===chosen)throw Error('HARU repeated a file before the others');
   for(const key of ['projects','photos','music','mark','about','internet']){
    await page.locator(`.desk-file-nav a[href="#${key}"]`).click();
    if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error(`${name}: ${key} overflow`);
    if(await page.locator('.desk-route-note').isVisible())throw Error('HARU note persists on manual route');
    if(name==='desktop'||name==='mobile')await page.screenshot({path:`${output}/file-${key}-${name}.png`});
   }
   await page.locator('.desk-file-nav a[href="#projects"]').click();
   if(await page.locator('.clothing-archive').isVisible())throw Error('Archive should be behind its divider');
   await page.getByRole('button',{name:'Poshak archive',exact:true}).click();
   if(!await page.locator('.clothing-archive').isVisible()||await page.locator('.project-desk').isVisible())throw Error('Archive divider failed');
   await page.getByRole('button',{name:'the workbench',exact:true}).focus();await page.keyboard.press('Enter');
   if(!await page.locator('.project-desk').isVisible())throw Error('Workbench keyboard control failed');
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: local clock, HARU choice, six files, keyboard dividers and layout passed`);
   await page.close();
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
