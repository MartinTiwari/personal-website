const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output='C:/Users/Asus/.codex/visualizations/2026/09/22/01a0c894-15ee-7bb0-96ed-85854ff03ca4';
(async()=>{
 const server=http.createServer((req,res)=>{
  const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)});
 }).listen(4178,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
   await page.goto('http://127.0.0.1:4178',{waitUntil:'domcontentloaded'});
   if(!(await page.locator('.folder-status').innerText()).toLowerCase().includes('3 shipped'))throw Error('Wrong completed project count');
   if(await page.locator('.desk-business > img').count())throw Error('Shared chemical logo remains');
   await page.locator('.desk-folder').click();
   if(await page.locator('.project-entry').count()!==3)throw Error('Expected three completed projects');
   const beverage=page.locator('.project-entry').filter({has:page.getByRole('heading',{name:'Everest Beverage website',exact:true})});
   if(!await beverage.isVisible())throw Error('Beverage project missing');
   if(await beverage.locator('a').getAttribute('href')!=='https://everestbeverage.com.np/')throw Error('Beverage project link wrong');
   if((await page.locator('.project-live-number').innerText())!=='04')throw Error('Ongoing counter number not updated');
   await beverage.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
   if(await page.locator('#desk-view').evaluate(el=>el.scrollWidth>el.clientWidth+2))throw Error('Projects overflow horizontally');
   await page.screenshot({path:`${output}/beverage-project-${name}.png`});
   if(errors.length)throw Error(errors.join('\n'));
   console.log(`${name}: three shipped projects, Beverage link, ongoing project04 and layout passed`);
   await page.close();
  }
 }finally{await browser.close();server.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
