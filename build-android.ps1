# Build Android Script for RadioM

# Ensure google-services.json exists
if (-not (Test-Path -Path ".\google-services.json")) {
    Write-Error "google-services.json file not found. Please make sure it exists in the project root."
    exit 1
}

# Create android directory if it doesn't exist
if (-not (Test-Path -Path ".\android")) {
    Write-Host "Creating android directory..."
    mkdir android
    mkdir android\app
}

# Copy google-services.json to android/app
Write-Host "Copying google-services.json to android/app..."
Copy-Item -Path ".\google-services.json" -Destination ".\android\app\google-services.json" -Force

# Run prebuild
Write-Host "Running expo prebuild..."
npx expo prebuild --platform android --no-install

# Instructions for Android Studio
Write-Host "`nSetup Complete!`n" -ForegroundColor Green
Write-Host "Now you can open the project in Android Studio:" -ForegroundColor Yellow
Write-Host "1. Open Android Studio" -ForegroundColor Yellow
Write-Host "2. Select 'Open an existing project'" -ForegroundColor Yellow
Write-Host "3. Navigate to and select your android folder at:" -ForegroundColor Yellow
Write-Host "   $((Get-Location).Path)\android" -ForegroundColor Cyan
Write-Host "4. Let Android Studio sync the project" -ForegroundColor Yellow
Write-Host "5. To build your APK: Build -> Build Bundle(s) / APK(s) -> Build APK(s)" -ForegroundColor Yellow
Write-Host "`nThe APK will be generated in android/app/build/outputs/apk/debug/" -ForegroundColor Green 