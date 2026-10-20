const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4184,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['small',320,740]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v2','1'));
   await page.route('**/*',r=>{const url=new URL(r.request().url());return url.hostname==='127.0.0.1'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'?r.continue():r.fulfill({status:200,body:''})});
   await page.goto('http://127.0.0.1:4184/#about',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.locator('.classified-open').click();
   if(!await page.locator('.private-probe').first().evaluate(el=>document.activeElement===el))throw Error('Section shortcut does not move keyboard focus');
   const secrets=await page.locator('#classified-file .probe-ink').allTextContents();
   for(let i=0;i<4;i++)await page.locator('.private-probe').nth(i%2).click();
   if(JSON.stringify(secrets)!==JSON.stringify(await page.locator('#classified-file .probe-ink').allTextContents()))throw Error('Interaction changed private details');
   if(await page.locator('.private-probe[data-tried="true"]').count()!==2)throw Error('Both private controls must respond');
   if(await page.locator('#badge').evaluate(el=>getComputedStyle(el).animationName)!=='none')throw Error('Ambient badge animation returned');
   await page.locator('#badge').evaluate(el=>el.style.transform='rotate(18deg)');
   await page.locator('.badge-reset').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>Math.abs(parseFloat(getComputedStyle(document.querySelector('#badge')).rotate)||0)<.1);
   if(await page.locator('#badge').evaluate(el=>el.style.transform)!=='')throw Error('Keyboard ID reset failed');
   if(!await page.locator('#badge').evaluate(el=>['0deg','none'].includes(getComputedStyle(el).rotate)))throw Error('Photo reset state: '+JSON.stringify(await page.locator('#badge').evaluate(el=>({inline:el.style.cssText,rotate:getComputedStyle(el).rotate,reply:document.querySelector('#clearance-reply').textContent}))));
   if(name==='desktop'){
    await page.locator('#badge').scrollIntoViewIfNeeded();
    const b=await page.locator('#badge').boundingBox();
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();
    await page.mouse.move(b.x+b.width/2+25,b.y+b.height/2);
    if(!await page.locator('#badge').evaluate(el=>el.style.transform.includes('rotate(')))throw Error('ID no longer responds to dragging');
    await page.mouse.up();
   }
   await page.locator('#classified-file .private-probe').first().click();
   if(!(await page.locator('#clearance-reply').innerText()).includes('nice try'))throw Error('Private control response broken');
   if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error(`${name}: dossier overflow`);
   await page.locator('#classified-file').evaluate(el=>{const dialog=document.querySelector('#desk-view');dialog.scrollTo({top:dialog.scrollTop+el.getBoundingClientRect().top-dialog.getBoundingClientRect().top-80,behavior:'instant'})});
   await page.evaluate(()=>{document.activeElement?.blur();document.querySelector('#toast-root').replaceChildren()});
   await page.screenshot({path:`${output}/classified-${name}.png`});
   if(name==='desktop'){
    await page.setViewportSize({width:1440,height:1350});
    await page.reload({waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
    await page.locator('.classified-open').click();await page.evaluate(()=>document.activeElement?.blur());
    await page.locator('#classified-file').screenshot({path:`${output}/classified-preview.png`});
   }
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: confidential values, clearance, keyboard ID reset, original controls and fit passed`);
   await page.close();
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
