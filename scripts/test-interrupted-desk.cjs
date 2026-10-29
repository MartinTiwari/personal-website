const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(process.cwd(),'.qa-interrupted');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const file=path.join(process.cwd(),req.url.split('?')[0]==='/'?'index.html':req.url.split('?')[0]);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4190,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 for(const [name,width,height]of[['desktop',1440,900],['phone',390,844],['small',320,740],['tablet',768,1024],['reduced',390,844]].filter(([name])=>!process.env.DESK_QA_VIEW||name===process.env.DESK_QA_VIEW)){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:name==='reduced'?'reduce':'no-preference'}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v2','1'));
  await page.route('**/*',r=>{const u=new URL(r.request().url());return u.hostname==='127.0.0.1'||u.hostname.endsWith('googleapis.com')||u.hostname.endsWith('gstatic.com')?r.continue():r.fulfill({status:200,body:'{}'})});
  await page.goto('http://127.0.0.1:4190/',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))throw Error(name+': horizontal overflow');
  if(await page.locator('.desk-photos img').count())throw Error('Unnecessary landing photo images remain');
  const fileSelectors=['.desk-folder','.desk-photos','.desk-player','.desk-book'];
  for(const selector of fileSelectors){
   const file=page.locator(selector);const b=await file.boundingBox();
   if(b.x<-2||b.x+b.width>width+2)throw Error(name+': file outside screen '+selector);
   if(name==='phone'&&b.y+b.height>height)throw Error('Phone file navigation below first viewport '+selector);
   await file.scrollIntoViewIfNeeded();
   const hit=await file.evaluate(el=>{const b=el.getBoundingClientRect();return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('a')===el});
   if(!hit)throw Error(name+': file click area obstructed '+selector);
   const escaped=await file.evaluate(el=>{const outer=el.getBoundingClientRect();return [...el.querySelectorAll('strong,.object-caption,.spine-arrow,.folder-status')].filter(child=>getComputedStyle(child).display!=='none').some(child=>{const b=child.getBoundingClientRect();return b.left<outer.left-2||b.right>outer.right+2||b.top<outer.top-2||b.bottom>outer.bottom+2})});
   if(escaped)throw Error(name+': file text escapes spine '+selector);
  }
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,name+'-closed.png'),fullPage:true});
  const toggle=page.locator('.relatives-toggle');
  if(await toggle.getAttribute('aria-expanded')!=='false')throw Error('Ad should start tucked away');
  if(await page.locator('.relatives-slip').isVisible())throw Error('Ad visible when closed');
  await toggle.focus();await page.keyboard.press('Enter');
  if(await toggle.getAttribute('aria-expanded')!=='true'||!await page.locator('.business-main').isVisible()||!await page.locator('.business-sister').isVisible())throw Error('Ad pull tab does not open');
  if(await page.locator('.business-main').getAttribute('href')!=='https://www.everestsuperchemical.com.np/')throw Error('Chemical link changed');
  if(await page.locator('.business-sister').getAttribute('href')!=='https://everestbeverage.com.np/')throw Error('Beverage link changed');
  await page.screenshot({path:path.join(out,name+'-ad-open.png'),fullPage:true});
  await toggle.click();if(await page.locator('.relatives-slip').isVisible())throw Error('Ad did not close');
  for(const selector of fileSelectors){await page.locator(selector).click();await page.waitForFunction(()=>document.querySelector('#desk-view').open);await page.locator('.desk-back').click()}
  await page.locator('#me').click();if(!(await page.locator('.portrait-dialogue').innerText()).includes('Three projects shipped'))throw Error('Portrait tour broken');
  const callReachable=await page.locator('.portrait-call').evaluate(el=>{const b=el.getBoundingClientRect();return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===el});
  if(!callReachable)throw Error(name+': call HARU control obstructed');
  for(let i=0;i<4;i++)await page.locator('#me').click();
  await page.locator('#me').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,name+'-long-tour.png'),fullPage:true});
  if(!await page.locator('.desk-cat #haru-pet').isVisible())throw Error('HARU gone');
  await page.locator('.desk-signature').click();if(!await page.locator('#signature-intro').isVisible())throw Error('Signature replay broken');await page.keyboard.press('Escape');
  if(errors.length)throw Error(errors.join('\n'));
  console.log(name+': file navigation, first viewport fit, pull tab, links, portrait, cat and signature passed');await page.close();
 }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
