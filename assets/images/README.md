# App Icons and Splash Screen

This directory contains the app icons and splash screen images for the Lung Tracker mobile app.

## Files Required

### App Icons

#### iOS Icon
- **File**: `icon.png`
- **Size**: 1024x1024 px
- **Format**: PNG with transparency
- **Description**: Main app icon used on iOS home screen and app store

#### Android Adaptive Icons
- **Foreground Image**: `android-icon-foreground.png`
  - Size: 1080x1080 px
  - Format: PNG with transparency
  - Padding: Safe zone should be within inner 660x660 px circle
  
- **Background Image**: `android-icon-background.png`
  - Size: 1080x1080 px
  - Format: PNG (solid color or gradient recommended)
  - Used as background behind foreground
  
- **Monochrome Image**: `android-icon-monochrome.png`
  - Size: 1080x1080 px
  - Format: PNG in monochrome/grayscale
  - Used by system for themed icon variants

#### Web Favicon
- **File**: `favicon.png`
- **Size**: 32x32 px or 64x64 px
- **Format**: PNG
- **Description**: Browser tab icon

### Splash Screen
- **File**: `splash-icon.png`
- **Size**: 512x512 px (recommended) or higher for high-DPI devices
- **Format**: PNG with transparency
- **Description**: Center icon displayed on splash screen
- **Configuration**: See `app.json` for splash screen settings (background color, dark mode, etc.)

## Design Guidelines

### Brand Colors (Lung Tracker)
- Primary Blue: `#007AFF`
- Light Blue Background: `#E6F4FE`
- Dark Background: `#000000`

### Safe Zone
Ensure important design elements fit within safe margins:
- Leave 20% padding on all sides for adaptive icon foreground
- Center splash screen icon with adequate margin

## Design Tools

- **Figma**: Recommended for creating multi-sized assets
- **Adobe XD**: Alternative design tool
- **Online Tools**:
  - [GIMP](https://www.gimp.org/) - Free alternative
  - [Pixlr](https://pixlr.com/) - Browser-based editor
  - [Canva](https://www.canva.com/) - Design templates

## Icon Generation Services

Generate all required sizes automatically:
- [AppIcon.co](https://www.appicon.co/) - Supports both iOS and Android
- [Expo Icon Generator](https://icon.expo.io/) - Tailored for Expo projects
- [Image Resizer Online](https://imageresizer.com/) - Free resizing tool

## Workflow

1. Design your main icon (1024x1024 px or larger)
2. Create foreground and background for Android adaptive icon
3. Generate all required sizes using a service or tool
4. Place files in this directory with correct names
5. Test on actual devices or simulators
6. Generate new build with `eas build` or `expo build`

## References

- [Expo Splash Screen Configuration](https://docs.expo.dev/guides/splash-screens-app-icons/)
- [iOS App Icon Requirements](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
