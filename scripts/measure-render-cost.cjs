const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const frozen=new Map();
for(const name of ['index.html','styles.css','desk.css','intro.css','desk-cat.css','clothing-archive.css',...fs.readdirSync('src').filter(n=>n.endsWith('.js')).map(n=>'src/'+n)])frozen.set(name,fs.readFileSync(name));
(async()=>{
 const server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0].slice(1)||'index.html',mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'};
  const send=(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(name)]||'text/plain'});res.end(err?'':data)};
  if(frozen.has(name))send(null,frozen.get(name));else fs.readFile(name,send);
 }).listen(4179,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  for(const lean of [false,true]){
   const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
   await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v1','1'));
   await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4179')?r.continue():r.fulfill({status:200,contentType:'application/json',body:'{}'}));
   await page.goto('http://127.0.0.1:4179',{waitUntil:'load'});
   if(lean)await page.addStyleTag({content:'.desk-mode .grain{display:none!important}.desk-view::backdrop{backdrop-filter:none!important}'});
   const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
   await cdp.send('Tracing.start',{categories:'devtools.timeline,cc',transferMode:'ReturnAsStream'});
   const before=(await cdp.send('Performance.getMetrics')).metrics;
   const frames=await page.evaluate(async()=>{
    const times=[];let previous=performance.now();
    for(let i=0;i<100;i++){await new Promise(requestAnimationFrame);const now=performance.now();times.push(now-previous);previous=now;window.scrollTo({top:(i%50)/49*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'})}
    document.querySelector('.desk-photos').click();await new Promise(r=>setTimeout(r,100));
    for(let i=0;i<70;i++){await new Promise(requestAnimationFrame);const now=performance.now();times.push(now-previous);previous=now;document.querySelector('#desk-view').scrollTop=(i%35)*10}
    return times.slice(1).sort((a,b)=>a-b);
   });
   const after=(await cdp.send('Performance.getMetrics')).metrics;
   const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await done;
   let raw='';for(;;){const chunk=await cdp.send('IO.read',{handle:stream});raw+=chunk.data;if(chunk.eof)break}await cdp.send('IO.close',{handle:stream});
   const events=JSON.parse(raw).traceEvents,byName={};for(const event of events)if(['Paint','RasterTask','Layout','UpdateLayoutTree'].includes(event.name)&&event.dur)byName[event.name]=(byName[event.name]||0)+event.dur/1000;
   const metrics={};for(const key of ['TaskDuration','LayoutDuration','RecalcStyleDuration','ScriptDuration'])metrics[key]=+(1000*(after.find(m=>m.name===key).value-before.find(m=>m.name===key).value)).toFixed(2);
   console.log(JSON.stringify({mode:lean?'no full viewport grain or backdrop blur':'baseline',cpuThrottle:4,p95FrameMs:+frames[Math.floor(frames.length*.95)].toFixed(2),framesOver33ms:frames.filter(t=>t>33).length,traceMs:byName,metrics}));
   await page.close();
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
