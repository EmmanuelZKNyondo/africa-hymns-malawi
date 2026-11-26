# Africa Hymns [Malawi]

*******************************************************************************************************
## Developer Pre-Requisites 
- Node.js v22+
- Expo CLI
- Android Studio (for local emulator builds)

## Updating App Version & Metadata
**Do not manually edit `app.json` or `package.json`.**
1. Open `configs/updateConfigs.json`.
2. Update the `app.version`, add new entries to the `versions` array (changelog), and update `contributors` if needed.
3. The `sync:updates-log` script will **automatically** sync these changes to `app.json` and `package.json` when you run `npm start` or during GitHub Actions CI/CD builds.

## Running the App (Local Development)
1. Ensure an Android Emulator is running.
2. Start the development server:
   ```bash
   npm start
   # or
   npx expo start --clear --lan
   ```
3. Open the Expo Go app on your emulator/device and paste the LAN URL shown in the terminal.

## Hymn JSON Format
Hymns are stored in `src/data/hymns/`. The structure supports optional intros, multiple choruses, and per-line styling.

```json
{
  "number": 1,
  "title": "Song Title",
  "writer": "Author Name",
  "rating": 4.5,
  "previous_version_number": null,
  "tags": ["worship", "trinity"],
  "crossReference": [
    { "countryCode": "mw", "languageCode": "ch", "hymnNumber": 1 }
  ],
  "content": {
    "intro": [
      { "text": "\"Holy, holy, holy is the Lord of hosts.\"", "align": "center", "fontStyle": "italic", "fontWeight": "300" }
    ],
    "verses": [
      {
        "number": 1,
        "lines": [
          { "text": "Line 1 text", "align": "left" },
          { "text": "Line 2 text", "align": "left", "fontWeight": "bold" }
        ]
      }
    ],
    "choruses": [
      {
        "id": "main_chorus",
        "label": "Chorus",
        "position": 0,
        "lines": [
          { "text": "Chorus line 1", "align": "center" }
        ]
      }
    ]
  }
}
```
*Note: `align` can be `left`, `center`, `right`, or `justify`. `fontStyle` can be `normal` or `italic`. `fontWeight` accepts standard values (`normal`, `bold`, `100`–`900`).*

*******************************************************************************************************
## Building APK (Expo EAS - Recommended)
*Requires an Expo account and `EXPO_TOKEN` set in GitHub Secrets for automated CI/CD.*

1. Ensure `eas.json` is configured (already set to build APKs for `production` and `preview` profiles).
2. **Via GitHub Actions (CI/CD)**: Push or merge to the `main` branch. The workflow will automatically sync metadata, minify JSON, and trigger an EAS build.
3. **Via CLI (Manual)**:
   ```bash
   # Production APK
   eas build --platform android --profile production
   
   # Preview/Internal APK
   eas build --platform android --profile preview
   ```
*(Note: To build an `.aab` for the Play Store, change `"buildType": "apk"` to `"buildType": "app-bundle"` in `eas.json` under the production profile).*

*******************************************************************************************************
## Building APK (Local - Unsigned)
*Requires `JAVA_HOME` set. Best performed in WSL or Linux.*

1. Prebuild the native code:
   ```bash
   npx expo prebuild --clean
   ```
2. Navigate to the Android directory and build:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
3. Locate the unsigned APK at: `android/app/build/outputs/apk/release/app-release.apk`

*******************************************************************************************************
## CI/CD Pipeline (GitHub Actions)
*Automated builds are triggered on every push/merge to the `main` branch.*

1. **Prerequisites**:
   - Generate an Expo Access Token (Release Manager role) from your Expo Dashboard.
   - Add it to GitHub Repository → Settings → Secrets and variables → Actions as `EXPO_TOKEN`.
2. **Workflow file**: `.github/workflows/eas-build.yml`
3. **What happens on each push**:
   - Node.js 22 is installed.
   - Dependencies are installed via `npm ci`.
   - `eas-build-post-install` hook runs automatically:
     - Syncs metadata from `configs/updateConfigs.json` to `app.json` and `package.json`.
     - Minifies all JSON files in `src/data/` to reduce APK size.
   - EAS Production Build is queued (APK format).
4. **Download**: Expo emails you a download link once the build completes (~8–12 minutes).

*******************************************************************************************************
## Project Structure
```
africa-hymns-malawi/
├── configs/
│   └── updateConfigs.json        # Single source of truth for version & changelog
├── scripts/
│   ├── sync-updates-log.js       # Syncs metadata to app.json & package.json
│   ├── minify-json.js            # Minifies hymn JSON for production builds
│   └── 01-migrate-hymn-structure.js  # One-time migration script
├── src/
│   ├── components/               # Reusable UI components
│   ├── screens/                  # Screen components
│   ├── navigation/               # React Navigation setup
│   ├── store/                    # Zustand state management
│   ├── contexts/                 # React Context (Toast, etc.)
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Helpers (theme, dataLoader, etc.)
│   ├── data/                     # Hymn & prayer JSON files
│   └── assets/                   # Images, icons, fonts
├── app.json                      # Auto-synced from updateConfigs.json
├── package.json                  # Auto-synced from updateConfigs.json
├── eas.json                      # EAS Build configuration
└── .github/workflows/            # CI/CD workflows
```

*******************************************************************************************************
## Common Commands
| Command | Description |
|---------|-------------|
| `npm start` | Starts Expo dev server (syncs metadata first) |
| `npm run sync:updates-log` | Manually sync metadata from `updateConfigs.json` |
| `eas build --profile production` | Build production APK via EAS |
| `eas build --profile preview` | Build preview APK via EAS |
| `npx expo prebuild --clean` | Regenerate native `android/` and `ios/` folders |

*******************************************************************************************************
## Support
For issues or contributions, please contact the project maintainers listed in the app's About section.

*******************************************************************************************************