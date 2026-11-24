// scripts/minify-json.js
// Minifies all JSON files in the data/ folder for production builds.
// This runs on EAS Build servers, NOT during local development.

const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['./data']; // Add more folders if needed

function minifyFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const minified = JSON.stringify(parsed);
    
  if (minified.length < raw.length) {
      fs.writeFileSync(filePath, minified, 'utf8');
      const saved = ((raw.length - minified.length) / 1024).toFixed(2);
      console.log(`✅ Minified: ${filePath} (saved ${saved} KB)`);
    }
  } catch (err) {
    console.error(`❌ Failed to minify ${filePath}:`, err.message);
    process.exit(1); // Fail the build if JSON is invalid
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
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

console.log('🗜️  Starting JSON minification for production build...');
TARGET_DIRS.forEach(walkDir);
console.log('✨ JSON minification complete.\n');