import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      callback(dirPath);
    }
  });
}

function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;

  // Replace shadows
  // shadow-sm, shadow-md, shadow-lg, shadow-xl, shadow-2xl, shadow-inner -> shadow-2xs
  // Wait, I will just replace all shadow-* (except shadow-none, shadow-2xs, shadow-lg) with shadow-2xs
  // Actually, let's just do the ones we know are bad:
  newContent = newContent.replace(/\bshadow-(sm|md|xl|2xl|inner)\b/g, 'shadow-2xs');

  // Replace rounded
  // rounded-sm, rounded-lg, rounded-xl, rounded-2xl, rounded-3xl, rounded-full -> rounded-md
  newContent = newContent.replace(/\brounded-(sm|lg|xl|2xl|3xl|full)\b/g, 'rounded-md');
  // Also replace arbitrary rounded-[Xpx] if any, but let's stick to standard classes first
  newContent = newContent.replace(/\brounded-\[.*?\]\b/g, 'rounded-md');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir('./src', processFile);
console.log('UI Compliance sweep complete.');
