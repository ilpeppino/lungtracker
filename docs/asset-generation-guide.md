# Asset Generation Guide

This guide explains how to set up and generate app icons and splash screens for the Lung Tracker mobile app.

## Quick Start

### Option 1: Using Node.js (Recommended)

```bash
# Install Sharp dependency
npm install --save-dev sharp

# Generate placeholder assets
node scripts/generate-assets.js
```

### Option 2: Using ImageMagick

```bash
# Install ImageMagick (macOS)
brew install imagemagick

# Make script executable
chmod +x scripts/generate-assets.sh

# Generate placeholder assets
./scripts/generate-assets.sh
```

## Generated Assets Overview

| Asset | Size | Purpose |
|-------|------|---------|
| `icon.png` | 1024×1024 | Main app icon (iOS & Web) |
| `android-icon-foreground.png` | 1080×1080 | Android adaptive icon foreground |
| `android-icon-background.png` | 1080×1080 | Android adaptive icon background |
| `android-icon-monochrome.png` | 1080×1080 | Android monochrome icon variant |
| `splash-icon.png` | 512×512 | Splash screen center icon |
| `favicon.png` | 64×64 | Web browser tab icon |

## Design Specifications

### Brand Colors
```
Primary Blue:      #007AFF
Light Background:  #E6F4FE
Dark Background:   #000000
```

### iOS Icon Requirements
- **Dimensions**: 1024×1024 px (minimum)
- **Format**: PNG with transparency
- **Color Space**: RGB or SRGB
- **No Rounded Corners**: iOS adds these automatically
- **Safe Zone**: Keep important elements within center 660×660 px

### Android Adaptive Icons
Adaptive icons support dynamic shapes and themed variants.

**Foreground (`android-icon-foreground.png`)**
- Dimensions: 1080×1080 px
- Safe Zone: Elements within center 660×660 px circle
- Background: Should be transparent
- Includes 108 px (10%) padding on all sides

**Background (`android-icon-background.png`)**
- Dimensions: 1080×1080 px
- Can be solid color, gradient, or pattern
- Recommended: `#E6F4FE` (light blue)

**Monochrome (`android-icon-monochrome.png`)**
- Dimensions: 1080×1080 px
- Grayscale only (black/white)
- Used for themed icon variants
- Safe Zone: Same as foreground

### Splash Screen
- **Icon Size**: 512×512 px or higher
- **Format**: PNG with transparency
- **Background**: White (`#ffffff`) or dark (`#000000`)
- **Configuration**: Set in `app.json` under `expo.plugins`

### Web Favicon
- **Dimensions**: 32×32, 64×64, or 128×128 px
- **Format**: PNG
- **Background**: Can be transparent or solid

## Design Tools & Services

### Free Desktop Tools
- **[GIMP](https://www.gimp.org/)** - Full-featured image editor
- **[Pixlr](https://pixlr.com/)** - Browser-based editor, no installation needed
- **[Krita](https://krita.org/)** - Digital painting & illustration

### Online Asset Generators
- **[AppIcon.co](https://www.appicon.co/)** 
  - Upload one image, generates all sizes
  - Supports iOS and Android
  - Free tier available

- **[Expo Icon Generator](https://icon.expo.io/)**
  - Specifically designed for Expo projects
  - Simple interface
  - Generates adaptive icons

- **[IconKitchen](https://www.iconkitchen.com/)**
  - Modern icon design tool
  - Generates all app icon sizes
  - Free web tool

### Design with Code
- **[Figma](https://www.figma.com/)** - Collaborative design tool (free tier)
- **[Sketch](https://www.sketch.com/)** - macOS design tool
- **[Adobe XD](https://www.adobe.com/products/xd.html)** - Adobe's design tool

## Customization

### Changing Brand Colors

Edit the color variables in the generation scripts:

**Node.js script** (`scripts/generate-assets.js`):
```javascript
const BRAND_BLUE = '#007AFF';
const LIGHT_BG = '#E6F4FE';
const DARK_BG = '#000000';
```

**Bash script** (`scripts/generate-assets.sh`):
```bash
BRAND_BLUE="#007AFF"
LIGHT_BG="#E6F4FE"
DARK_BG="#000000"
```

Then regenerate assets.

### Manual Image Replacement

Simply replace the PNG files in `assets/images/` with your own:
- Keep the exact filenames
- Follow size requirements above
- Test on actual devices or simulators

## Configuration

The app's icon and splash screen configuration is defined in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      }
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

## Building & Testing

### Local Testing
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Production Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build both
eas build --platform all
```

## Troubleshooting

### Icon not updating
- Clear build cache: `expo prebuild --clean`
- Rebuild the app fresh
- Check that PNG files aren't corrupted

### Splash screen not showing correctly
- Verify `splash-icon.png` is exactly the right size
- Check background color in `app.json`
- Test on actual device/simulator

### Adaptive icon looks strange on Android
- Verify safe zone: important elements within center circle
- Check foreground and background images have no gaps
- Regenerate with correct dimensions (1080×1080)

## References

- **[Expo Icon Documentation](https://docs.expo.dev/guides/app-icons/)**
- **[Expo Splash Screens](https://docs.expo.dev/guides/splash-screens/)**
- **[iOS App Icon Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)**
- **[Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)**
- **[Web Favicon Best Practices](https://favicon-generator.org/)**

## Next Steps

1. ✅ Generate placeholder assets with `node scripts/generate-assets.js`
2. 📝 Design custom icons using your preferred tool
3. 📦 Replace placeholder PNGs with your designs
4. 🧪 Test on iOS simulator
5. 🧪 Test on Android emulator
6. 📱 Test on real devices
7. 🚀 Submit to App Store / Google Play

---

For additional help with icon design, check the `assets/images/README.md` file.
