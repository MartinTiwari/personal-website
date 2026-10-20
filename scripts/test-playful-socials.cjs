const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4183,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844],['small',320,740]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v2','1'));
   await page.route('**/*',r=>{const url=new URL(r.request().url());return url.hostname==='127.0.0.1'||url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'?r.continue():r.fulfill({status:200,body:''})});
   await page.goto('http://127.0.0.1:4183/#internet',{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   await page.waitForSelector('#desk-view[open]');
   const expected=['https://www.instagram.com/martin_tiwari/','https://github.com/MartinTiwari','https://www.facebook.com/tominarii','mailto:martintiwari0@gmail.com'];
   const links=await page.locator('#internet .social').evaluateAll(nodes=>nodes.map(el=>el.getAttribute('href')));
   if(JSON.stringify(links)!==JSON.stringify(expected))throw Error('A real contact destination changed');
   if(!await page.locator('#internet .s-name').first().evaluate(el=>getComputedStyle(el).fontFamily.includes('Fraunces')))throw Error('Preferred heading font lost');
   if(!await page.locator('#internet .s-note').first().evaluate(el=>getComputedStyle(el).fontFamily.includes('Caveat')))throw Error('Preferred handwritten font lost');
   if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error(`${name}: dialog overflows`);
   for(const link of await page.locator('#internet .social').all()){
    await link.focus();if(!await link.evaluate(el=>document.activeElement===el))throw Error('Link cannot receive keyboard focus');
    const b=await link.boundingBox();if(b.width<44||b.height<44)throw Error('Contact target too small');
   }
   await page.evaluate(()=>document.activeElement?.blur());
   await page.locator('#desk-view').evaluate(el=>el.scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:`${output}/playful-socials-${name}.png`});
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: original fonts, destinations, keyboard focus and fit passed`);
   await page.close();
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
