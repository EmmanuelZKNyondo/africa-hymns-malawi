// scripts/01-migrate-hymn-structure.js
const fs = require('fs');
const path = require('path');

// Target the specific directory containing your hymn JSON files
const TARGET_DIR = './src/data/hymns/mw';

function migrateHymn(hymn) {
  let changed = false;

  // 1. Migrate Verses: Convert string[] to { text, align }[]
  if (hymn.content?.verses) {
    hymn.content.verses = hymn.content.verses.map(verse => {
      if (Array.isArray(verse.lines) && verse.lines.length > 0 && typeof verse.lines[0] === 'string') {
        changed = true;
        return {
          ...verse,
          lines: verse.lines.map(line => ({ text: line, align: 'left' })) // Default to left
        };
      }
      return verse;
    });
  }

  // 2. Migrate Single Chorus to Choruses Array
  if (hymn.content?.chorus && !hymn.content.choruses) {
    changed = true;
    const oldChorusLines = Array.isArray(hymn.content.chorus.lines) 
      ? hymn.content.chorus.lines 
      : [];

    hymn.content.choruses = [
      {
        id: 'main_chorus',
        label: 'Chorus',
        position: 0, // Default: renders after verse 0 (before verse 1)
        lines: oldChorusLines.map(line => ({ text: line, align: 'center' })) // Choruses often look better centered
      }
    ];
    
    // Clean up the old property
    delete hymn.content.chorus;
  }

  return { hymn, changed };
}

function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    let fileChanged = false;

    if (Array.isArray(data.hymns)) {
      data.hymns = data.hymns.map(h => {
        const result = migrateHymn(h);
        if (result.changed) fileChanged = true;
        return result.hymn;
      });
    }

    if (fileChanged) {
      // Minify and save back to the file
      fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
      console.log(`✅ Migrated & Minified: ${path.basename(filePath)}`);
    } else {
      console.log(`⏭️  Already up to date: ${path.basename(filePath)}`);
    }
  } catch (err) {
    console.error(`❌ Failed to process ${filePath}:`, err.message);
  }
}

console.log('🔄 Starting Hymn JSON Migration (01-structure)...');
if (fs.existsSync(TARGET_DIR)) {
  const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    processFile(path.join(TARGET_DIR, file));
  });
  console.log('✨ Migration complete. Commit these changes to Git!');
} else {
  console.error(`❌ Directory not found: ${TARGET_DIR}`);
}