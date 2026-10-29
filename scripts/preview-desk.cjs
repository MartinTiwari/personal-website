const http=require('http'),fs=require('fs'),path=require('path');
const root=process.cwd();
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp3':'audio/mpeg'};
http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||pathname.split('/').some(part=>part.startsWith('.'))||!mime[path.extname(file)]){res.writeHead(404);res.end();return}
 fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)],'Cache-Control':'no-store'});res.end(error?'Not found':data)});
}).listen(4189,'127.0.0.1',()=>console.log('Working preview: http://127.0.0.1:4189/'));
