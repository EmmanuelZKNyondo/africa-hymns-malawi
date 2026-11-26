// scripts/sync-metadata.js
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../configs/updateConfigs.json');
const APP_JSON_PATH = path.join(__dirname, '../app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');

try {
  console.log('🔄 Syncing app metadata from configs/updateConfigs.json...');
  
  const updateConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));

  const { app, contributors } = updateConfig;

  // 1. Update app.json
  appJson.expo.name = app.name;
  appJson.expo.version = app.version;
  appJson.expo.extra = appJson.expo.extra || {};
  appJson.expo.extra.startYear = app.startYear;
  appJson.expo.extra.contributors = contributors;

  // 2. Update package.json
  packageJson.name = app.name.toLowerCase().replace(/\s+/g, '-');
  packageJson.version = app.version;

  // Write back with consistent 2-space formatting
  fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

  console.log(`✅ Successfully synced version ${app.version} and metadata.`);
  console.log('   - app.json updated');
  console.log('   - package.json updated');
} catch (error) {
  console.error('❌ Failed to sync metadata:', error.message);
  process.exit(1);
}