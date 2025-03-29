# Radio M

A modern radio streaming app built with Expo and React Native.

## Features

- 40 curated radio stations
- Beautiful, responsive UI following Figma design
- Audio streaming with play/pause controls
- Favorites system
- Clean architecture with reusable components

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the app:
   - iOS: Press 'i' in the terminal
   - Android: Press 'a' in the terminal
   - Web: Press 'w' in the terminal

## Project Structure

```
├── app/                 # App routes and navigation
│   ├── (tabs)/         # Tab-based navigation
│   └── player/         # Player screen
├── components/         # Reusable components
├── constants/         # Theme and configuration
├── data/             # Static data and mock APIs
├── hooks/            # Custom React hooks
└── types/            # TypeScript type definitions
```

## Customization

To customize the radio stations:
1. Update the stations data in `data/stations.ts`
2. Replace placeholder stream URLs with actual radio streams
3. Update station images with your preferred artwork

## Dependencies

- expo-router: File-based routing
- expo-av: Audio playback
- @expo-google-fonts/inter: Typography
- lucide-react-native: Icons