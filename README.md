# Africa Hymns [Malawi]


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