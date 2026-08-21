const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.toLowerCase().includes('prompt library')) {
      // Replace with 'Mira Prompts' while trying to preserve case where it matters, 
      // or just replace 'prompt library' -> 'Mira Prompts' and 'Prompt Library' -> 'Mira Prompts'
      let newContent = content.replace(/Prompt Library/g, 'Mira Prompts');
      newContent = newContent.replace(/prompt library/g, 'Mira Prompts');
      newContent = newContent.replace(/Prompt library/g, 'Mira Prompts');
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated:', filePath);
      count++;
    }
  }
});
console.log('Files updated:', count);
