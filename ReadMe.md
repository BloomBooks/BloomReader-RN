# Development

1. Install dependencies, set up the Android environment and set up an Android emulator according to the React Native documentation:
    - [React Native Dependencies](https://facebook.github.io/react-native/docs/getting-started#installing-dependencies-3)
    - [Android development environment](https://facebook.github.io/react-native/docs/getting-started#android-development-environment)
    - [Set up emulator](https://facebook.github.io/react-native/docs/getting-started#preparing-the-android-device)

2. Install BloomReader dependencies.

    `yarn install`

3. Make sure the emulator is running, and then run the app.

    `react-native run-android`

# Testing

## Unit Testing

`yarn test`

or

`yarn test-watch`

## Integration Testing on the Android Emulator

1. Set ENV variables and PATH according to [Appium docs for UIAutomator2](http://appium.io/docs/en/drivers/android-uiautomator2/index.html#basic-setup)

2. Check your configuration.

    `yarn run appium-doctor --android`

3. [Download](https://drive.google.com/drive/folders/1K0RsdmvvNHvlVeDpAiNY48cjOKw6hwI1?usp=sharing) BloomReaderTest_X.zip and place the contents in `integration-tests/emulators/avd/`

4. Setup for testing.

    `yarn int-test-prep`

    This builds the APK, starts the React Native packager, starts the emulator and starts the Appium server.

5. Run the integration tests.

    `yarn int-test`

### Writing tests

- [Documentation for Appium](http://appium.io/docs/en/about-appium/intro/)
- [Documentation for WebdriverIO](https://webdriver.io/docs/selectors.html#mobile-selectors)
- [Documentation for UIAutomator2 selectors](https://developer.android.com/reference/android/support/test/uiautomator/UiSelector.html)

The emulator loads from a snapshot, so the state of the device before all tests is consistent, but it's not practical to reset device state between tests, so **any effects from one test will carry into the next one.**

### Test Emulator Version

If you run `yarn int-test-prep` and get this error : `emulator: ERROR: Unknown AVD name [BloomReaderTest_{X}]`, then you need to download a new version of the test emulator from the link in step 3.

