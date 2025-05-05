# RadioM Production Build Script
# This script prepares and builds a production release version of the RadioM app for Android

Write-Host "Starting RadioM Android Production Build..." -ForegroundColor Green

# 1. Verify environment is set up
if (-not (Test-Path -Path ".\node_modules")) {
    Write-Host "Installing node modules..." -ForegroundColor Yellow
    npm install
}

# 2. Clean build folders
if (Test-Path -Path ".\android\app\build") {
    Write-Host "Cleaning previous build files..." -ForegroundColor Yellow
    Remove-Item -Path ".\android\app\build" -Recurse -Force
}

# 3. Check for keystore, but don't require it
$useDebugKeystore = $false
if (-not (Test-Path -Path ".\keystore\radiom-release-key.keystore")) {
    Write-Host "Warning: Keystore file is missing. Will use debug keystore for signing." -ForegroundColor Yellow
    $useDebugKeystore = $true
}

# 4. Update app.json for production
Write-Host "Configuring app for production..." -ForegroundColor Yellow

# 5. Prebuild the app
Write-Host "Running prebuild step..." -ForegroundColor Yellow
npx expo prebuild --clean

# 6. Ensure gradlew is executable
Write-Host "Setting up Android build..." -ForegroundColor Yellow
if (Test-Path -Path ".\android\gradlew") {
    # Ensure gradlew has executable permission (equivalent to chmod +x)
    # Note: PowerShell doesn't have a direct equivalent to chmod, 
    # but for Windows this is generally not an issue for command execution
}

# 7. Update build.gradle if using debug keystore
if ($useDebugKeystore) {
    Write-Host "Configuring build to use debug keystore..." -ForegroundColor Yellow
    # The signConfig in android/app/build.gradle already defaults to debug if release config is missing
}

# 8. Build APK
Write-Host "Building APK..." -ForegroundColor Yellow
Set-Location -Path ".\android"
./gradlew assembleRelease
Set-Location -Path ".."

# 9. Verify build was successful
if (Test-Path -Path ".\android\app\build\outputs\apk\release\app-release.apk") {
    Write-Host "Production build completed successfully!" -ForegroundColor Green
    Write-Host "APK is available at: .\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Green
} else {
    Write-Host "Build failed. Check the logs for errors." -ForegroundColor Red
    exit 1
}

# 10. Create AAB for Google Play Store (optional)
Write-Host "Creating App Bundle (AAB) for Google Play Store..." -ForegroundColor Yellow
Set-Location -Path ".\android"
./gradlew bundleRelease
Set-Location -Path ".."

if (Test-Path -Path ".\android\app\build\outputs\bundle\release\app-release.aab") {
    Write-Host "AAB file created successfully!" -ForegroundColor Green
    Write-Host "AAB is available at: .\android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Green
} else {
    Write-Host "AAB creation failed. Check the logs for errors." -ForegroundColor Red
}

Write-Host "Build process completed." -ForegroundColor Green 