const sharp=require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('path');
const photos=[
 ['C:/Users/Asus/AppData/Local/Temp/codex-clipboard-ae6f0170-7b18-40fa-97f9-34707b182148.jpg','haru-camera-inspection.webp'],
 ['C:/Users/Asus/AppData/Local/Temp/codex-clipboard-4669e861-720a-4e62-a613-c235a2f89c71.jpg','haru-management.webp']
];
Promise.all(photos.map(async([source,name])=>{
 const info=await sharp(source).rotate().resize({width:1000,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toFile(path.join(__dirname,'../assets',name));
 console.log(name,JSON.stringify(info));
})).catch(error=>{console.error(error);process.exitCode=1});
