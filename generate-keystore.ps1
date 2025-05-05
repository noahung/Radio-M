# Change directory to android
cd android

# Generate a new keystore file
keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass your_keystore_password -keypass your_key_password -dname "CN=Radio M,OU=,O=,L=,S=,C=US"

# Move keystore file to the app directory
Move-Item -Path my-upload-key.keystore -Destination app/

# Return to project root
cd ..

Write-Host "Keystore generated and moved to android/app/my-upload-key.keystore"
Write-Host "Make sure to remember the keystore password: your_keystore_password"
Write-Host "Make sure to remember the key password: your_key_password" 