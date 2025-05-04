import { NativeModules, NativeEventEmitter } from 'react-native';

const { RadioModule } = NativeModules;

interface RadioModuleInterface {
    startService(): void;
    stopService(): void;
    togglePlayback(): void;
}

export const radioService: RadioModuleInterface = {
    startService: () => RadioModule.startService(),
    stopService: () => RadioModule.stopService(),
    togglePlayback: () => RadioModule.togglePlayback(),
};

export const radioEvents = new NativeEventEmitter(RadioModule); 