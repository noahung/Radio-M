# Prepare Android Studio build script for RadioM
# This script prepares the Android project for building with Android Studio

Write-Host "Preparing RadioM for Android Studio build..." -ForegroundColor Green

# 1. Ensure google-services.json is copied to android/app
if (Test-Path -Path ".\google-services.json") {
    Write-Host "Copying google-services.json to Android project..." -ForegroundColor Yellow
    Copy-Item -Path ".\google-services.json" -Destination ".\android\app\google-services.json" -Force
    Write-Host "Google services file copied successfully." -ForegroundColor Green
} else {
    Write-Host "Warning: google-services.json not found in project root. Please add it manually to android/app directory." -ForegroundColor Yellow
}

# 2. Run prebuild to ensure everything is up to date
Write-Host "Running expo prebuild..." -ForegroundColor Yellow
npx expo prebuild --platform android --no-install

# 3. Instructions for Android Studio
Write-Host "`nSetup Complete!`n" -ForegroundColor Green
Write-Host "Now you can build a production APK in Android Studio:" -ForegroundColor Yellow
Write-Host "1. Open Android Studio" -ForegroundColor Yellow
Write-Host "2. Select 'Open an existing project'" -ForegroundColor Yellow
Write-Host "3. Navigate to and select your android folder at:" -ForegroundColor Yellow
Write-Host "   $((Get-Location).Path)\android" -ForegroundColor Cyan
Write-Host "4. Let Android Studio sync the project" -ForegroundColor Yellow
Write-Host "5. Go to Build -> Generate Signed Bundle / APK" -ForegroundColor Yellow
Write-Host "6. Select APK and click Next" -ForegroundColor Yellow
Write-Host "7. Create a new keystore or use an existing one" -ForegroundColor Yellow
Write-Host "8. Fill in the key details and select Next" -ForegroundColor Yellow
Write-Host "9. Select release build variant and click Finish" -ForegroundColor Yellow
Write-Host "`nThe signed APK will be generated in android/app/release/" -ForegroundColor Green 