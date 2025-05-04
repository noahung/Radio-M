# RadioM - Release Build Instructions

This guide provides step-by-step instructions for building a release version of the RadioM app.

## Important Note

**Using the build script is highly recommended** over manually building with Android Studio. The build script:
- Ensures proper keystore configuration
- Correctly sets up Google Services
- Prepares the app's native modules correctly
- Configures proper signing for the release

Many of the app issues when building through Android Studio buttons directly may be caused by incomplete configuration steps that the build script handles automatically.

## Prerequisites

1. Node.js and npm installed
2. Android Studio installed
3. Android SDK configured
4. Java Development Kit (JDK) installed (JDK 11 recommended)
5. A keystore file for signing the app (or you can create one)

## Preparing for Release

### Step 1: Create a Keystore (if you don't have one)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore radiom-release-key.keystore -alias radiom-key -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts to complete the keystore creation.

### Step 2: Place Keystore in the Right Location

1. Create a 'keystore' folder in the project root if it doesn't exist
2. Move the keystore file to `./keystore/radiom-release-key.keystore`

### Step 3: Configure Keystore Passwords

Edit the `android/gradle.properties` file and update the following properties with your keystore credentials:

```properties
RADIOM_UPLOAD_STORE_PASSWORD=your_keystore_password
RADIOM_UPLOAD_KEY_PASSWORD=your_key_password
```

## Building the Release APK

### Automatic Build (Recommended)

Run the build script from the project root:

```bash
# On Windows
./build-production.ps1

# On Mac/Linux
chmod +x ./build-production.sh
./build-production.sh
```

### Manual Build

1. Run the prebuild step:
   ```bash
   npx expo prebuild --clean
   ```

2. Navigate to the Android directory:
   ```bash
   cd android
   ```

3. Build the release APK:
   ```bash
   # On Windows
   ./gradlew assembleRelease

   # On Mac/Linux
   chmod +x gradlew
   ./gradlew assembleRelease
   ```

4. Build the release AAB (for Google Play Store):
   ```bash
   ./gradlew bundleRelease
   ```

## Output Files

After successful build:

- APK file: `android/app/build/outputs/apk/release/app-release.apk`
- AAB file: `android/app/build/outputs/bundle/release/app-release.aab`

## Testing the Release Build

1. Install the release APK on a device:
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

2. Test thoroughly to ensure all features work as expected

## Troubleshooting

- **Build errors**: Check the logs for specific error messages
- **Signing issues**: Verify keystore path and password configuration
- **Crashes on startup**: Check for missing or misconfigured native modules
- **Google Sign-In issues**: Verify the google-services.json file is correctly configured

## Notes

- The release build has optimizations enabled and debugging disabled
- The splash screen should properly display for 3 seconds in the release build
- Google Sign-In requires the correct configuration in google-services.json 