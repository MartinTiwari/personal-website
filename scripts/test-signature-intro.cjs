const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const server=http.createServer((req,res)=>{const url=req.url.split('?')[0];const file=path.join(process.cwd(),url==='/'?'index.html':url);const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png'};fs.readFile(file,(e,d)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(file)]||'text/plain'});res.end(e?'':d);});}).listen(4174,'127.0.0.1');
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));
 await page.goto('http://127.0.0.1:4174',{waitUntil:'domcontentloaded'});
 await page.locator('.intro-letter').evaluateAll(nodes=>nodes.forEach(node=>node.getAnimations().forEach(a=>a.finish())));
 for(const [time,stage] of [[300,0],[750,1],[1800,2],[2850,3],[3120,4],[3300,5]]){
  await page.locator('.intro-stroke').evaluateAll((paths,time)=>paths.forEach(p=>p.getAnimations().forEach(a=>{a.pause();a.currentTime=time;})),time);
  const offsets=await page.locator('.intro-stroke').evaluateAll(paths=>paths.map(p=>({offset:parseFloat(getComputedStyle(p).strokeDashoffset),opacity:parseFloat(getComputedStyle(p).opacity)})));
  if(offsets.length!==5)throw Error('Wrong number of strokes');
  if(stage<5){for(let i=stage+1;i<5;i++)if(offsets[i].opacity!==0)throw Error('Future stroke visible');if(offsets[stage].offset>=1||offsets[stage].offset<=0)throw Error('Current stroke is not drawing');}
  else if(offsets.some(p=>p.offset!==0||p.opacity!==1))throw Error('Incomplete signature');
  console.log(name,time,JSON.stringify(offsets));
 }
 await page.locator('.intro-enter').click();await page.waitForSelector('#signature-intro[hidden]',{state:'attached'});
 if(await page.locator('.desk-home').evaluate(el=>el.inert))throw Error('Background remains locked');
 if(errors.length)throw Error(errors.join(','));await page.close();
}const auto=await browser.newPage();await auto.route('**/anime.min.js',r=>r.fulfill({status:200,body:''}));await auto.goto('http://127.0.0.1:4174');await auto.waitForSelector('#signature-intro[hidden]',{state:'attached',timeout:5000});console.log('automatic exit passed');
}finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
