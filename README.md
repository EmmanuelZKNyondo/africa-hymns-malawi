# Africa Hymns [Malawi]

*******************************************************************************************************
## Developer Pre-Requisites 
 - Node v22
 - expo cli 

## Update version 
1. app.json update version to new version 

2. update version with metadata and notes in config/updatesConfig.json to match the new update. 
 

## Run app with expo and emulator (windows OS)
1. Have emulator set onm your windows machine

2. run app in cli: `npx expo start --clear --lan`

## Hymn update

### Hymn JSON format 
  <code>
    {
        "number": 1,
        "title": "song title",
        "writer": "--",
        "rating": 0,
        "previous_version_number": null,
        "tags": ["tag 1", "tage 2", "..."],
        "crossReference": [
          {
            "countryCode": "mw",
            "languageCode": "ch",
            "hymnNumber": 1
          }
        ],
        "content": {
          "verses": [
            {
              "number": 1,
              "lines": [
                "Line 1",
                "..."
              ]
            },
            {
              "number": 2,
              "lines": [
                "Line 1",
                "..."
              ]
            },
            {
              "number": "last_chorus",
              "lines": [
                "Line 1",
                "..."
              ]
            }
          ],
          "chorus": {
            "lines": [
              "Line one",
              "Line 2",
              "..."
            ]
          }
        }
      }
    </code>

*******************************************************************************************************

## Building APK (to online expo)
1. Update eas.json on the following 
    `{
        "cli": {
          "version": ">= 18.6.0",
          "appVersionSource": "remote"
        },
        "build": {
          "development": {
            "developmentClient": false,
            "distribution": "internal"
          },
          "preview": {
            "distribution": "internal",
            "android": {
              "buildType": "apk"
            }
          },
          "production": {
            "autoIncrement": true,
            "android": {
              "buildType": "apk"
            }
          }
        },
        "submit": {
          "production": {}
        }
      }`

      NOTE: you can change the production > android > buildType to aab or remove it to let production build aab for playstore uploads

2. `eas build --platform android` or `eas build --platform all`

3. `eas build --platform android --profile preview` if you have expo account and logged in on the cli 
  or `eas build --platform android --profile preview --local`

*******************************************************************************************************

## Building APK (local)
 NOTE: Have JAVA_HOME set and perform this in WSL or linux platform 
 and the produced APK is un-signed APK by default. 
 
 1. `npx expo prebuild`

 2. `cd android`

 3. `./gradlew assembleRelease`

 4. Locate your apk in `android/app/build/outputs/apk/release/app-release.apk`