# Africa Hymns [Malawi]

## Update version 
1. app.json update version to new version 

2. update version with metadata and notes in config/updatesConfig.json to match the new update. 

## Run app with expo and emulator (windows OS)
1. Have emulator set onm your windows machine

2. run app in cli: `npx expo start --clear --lan`

## Building Local APK
1. Update eas.json on the following 
    `{
      "build": {
        "preview": {
          "android": {
            "buildType": "apk"
          },
          "developmentClient": false
        }
      }
    }`

2. `eas build --platform android` or `eas build --platform all`

3. `eas build --platform android --profile preview` if you have expo account and logged in on the cli or `eas build --platform android --profile preview --local`