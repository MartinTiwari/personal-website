const path = require('path');
const sharp = require('C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source = process.argv[2];
if (!source) throw new Error('Provide the selected original video frame.');
sharp(source).resize({width:1080,withoutEnlargement:true}).webp({quality:85})
  .toFile(path.join(__dirname,'../assets/clothing-brand-still.webp'))
  .then(info=>console.log(JSON.stringify(info)))
  .catch(error=>{console.error(error);process.exitCode=1;});
