# Set the NODE_ENV environment variable for production
$env:NODE_ENV = "production"

# Install any missing dependencies
npm install

# Install eas cli if not already installed
npm install -g eas-cli

# Build locally using EAS
npx eas build --platform android --profile local --local

# Output the location of the generated APK
Write-Host "Build completed. APK is located at build-*.apk in the current directory."

# Clean and prebuild the project
npx expo prebuild --clean

# Create necessary splash screen resources
$splashDir = Join-Path -Path "android/app/src/main/res" -ChildPath "mipmap-mdpi"
if (-not (Test-Path $splashDir)) {
    New-Item -ItemType Directory -Path $splashDir -Force
}

# Copy splash screen resources
Copy-Item -Path "assets/images/splashscreen_logo.png" -Destination "android/app/src/main/res/mipmap-mdpi/splashscreen_logo.png" -Force

# Change directory to android and build the release APK
Set-Location -Path android
./gradlew.bat clean
./gradlew.bat assembleRelease

# Return to the project root
Set-Location -Path ..

Write-Host "Build completed. APK is located at android/app/build/outputs/apk/release/app-release.apk" 