## Development

1. Install dependencies, set up the Android environment and set up an Android emulator according to the React Native documentation:
    - [React Native Dependencies](https://facebook.github.io/react-native/docs/getting-started#installing-dependencies-3)
    - [Android development environment](https://facebook.github.io/react-native/docs/getting-started#android-development-environment)
    - [Set up emulator](https://facebook.github.io/react-native/docs/getting-started#preparing-the-android-device)

2. Install BloomReader dependencies.

    `yarn install`

3. Make sure the emulator is running, and then run the app.

    `npm run start-android`

(That last is a custom script. It copies bloomPlayerControlBundle.js from node-modules to its proper
place in assets. If you are copying an in-development version of that file manually, just use react-native start-android. If you want to launch your app some other way, you can npm run copyAssets to just copy the file first.)
