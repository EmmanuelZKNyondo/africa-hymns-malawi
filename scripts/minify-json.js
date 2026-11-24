// scripts/minify-json.js
// Minifies all JSON files in the data/ folder for production builds.
// This runs on EAS Build servers, NOT during local development.

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['./src/data']; 

function minifyFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const minified = JSON.stringify(parsed);
    
  if (minified.length < raw.length) {
      fs.writeFileSync(filePath, minified, 'utf8');
      console.log(`Minified: ${filePath}`);
    }
  } catch (err) {
    console.error(`Failed to minify ${filePath}:`, err.message);
    // Do NOT process.exit(1) here, let the build continue if one file fails
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found, skipping: ${dir}`);
    return;
  }
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.json')) {
      minifyFile(fullPath);
    }
  });
}

console.log('🗜️ Starting JSON minification...');
TARGET_DIRS.forEach(walkDir);
console.log('Minification complete.');