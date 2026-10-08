const fs=require('fs'),http=require('http'),path=require('path');
const {chromium}=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const server=http.createServer((req,res)=>{const url=req.url.split('?')[0],file=path.join(process.cwd(),url==='/'?'index.html':url);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':{'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'text/plain'});res.end(err?'':data)})}).listen(4181,'127.0.0.1');
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),images=[];
  await page.addInitScript(()=>sessionStorage.setItem('signature-intro-seen-v1','1'));
  page.on('request',r=>{if(r.resourceType()==='image'&&r.url().includes('/assets/'))images.push(new URL(r.url()).pathname.split('/').pop())});
  await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4181')?r.continue():r.fulfill({status:200,body:''}));
  await page.goto('http://127.0.0.1:4181',{waitUntil:'load'});await page.waitForTimeout(500);
  const bytes=images.reduce((sum,name)=>sum+fs.statSync(path.join('assets',name)).size,0);
  console.log(JSON.stringify({landingImages:images,landingImageBytes:bytes}));
  if(process.argv.includes('--assert-lazy')&&images.some(n=>['haru-management.webp','haru.webp','dad-topi.webp','clothing-brand-still.webp'].includes(n)))throw Error('Closed album image loaded eagerly');
  await page.locator('.desk-photos').click();await page.getByRole('button',{name:'HARU, the actual owner',exact:true}).click();
  await page.locator('.haru-album .album-selected img').evaluate(img=>img.decode());
  if(!images.includes('haru-management.webp'))throw Error('Visible album image did not load');
  console.log('Visible HARU album loads on demand');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
