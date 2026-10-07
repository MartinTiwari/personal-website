// Local reference extraction only. Never publishes the source video.
const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source=process.argv[2],out=process.argv[3];
if(!source||!out)throw Error('Usage: node extract-video-stills.cjs source.mp4 output-directory');
(async()=>{
 const server=http.createServer((req,res)=>{
  if(req.url==='/video'){const size=fs.statSync(source).size;const range=req.headers.range;if(range){const[a,b]=range.replace('bytes=','').split('-');const start=+a,end=b?+b:size-1;res.writeHead(206,{'Content-Type':'video/mp4','Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});fs.createReadStream(source,{start,end}).pipe(res);}else{res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':size});fs.createReadStream(source).pipe(res);}}
  else{res.writeHead(200,{'Content-Type':'text/html'});res.end('<video src="/video" preload="auto"></video>');}
 }).listen(4188,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4188');await page.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
 const meta=await page.$eval('video',v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));console.log(JSON.stringify(meta));
 const cells=[];
 for(let i=0;i<12;i++){
  const time=.001+(meta.duration-.05)*i/12;
  const data=await page.$eval('video',async(v,time)=>{v.currentTime=time;await new Promise(r=>v.addEventListener('seeked',r,{once:true}));const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/png').split(',')[1];},time);
  const frame=Buffer.from(data,'base64');await sharp(frame).png().toFile(path.join(out,`poshak-frame-${i}.png`));
  const thumb=await sharp(frame).resize(360,360,{fit:'contain',background:'#e9e4da'}).png().toBuffer();
  const label=Buffer.from(`<svg width="360" height="30"><rect width="360" height="30" fill="#e9e4da"/><text x="12" y="20" font-family="Arial" font-size="16">${i} · ${time.toFixed(2)}s</text></svg>`);
  cells.push({input:thumb,left:i%4*360,top:Math.floor(i/4)*390},{input:label,left:i%4*360,top:Math.floor(i/4)*390+360});
 }
 await sharp({create:{width:1440,height:1170,channels:3,background:'#e9e4da'}}).composite(cells).png().toFile(path.join(out,'poshak-contact-sheet.png'));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
