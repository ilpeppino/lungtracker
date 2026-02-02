#!/bin/bash

# Lung Tracker - Asset Generation Script
# This script creates placeholder images for icons and splash screen
# Requirements: ImageMagick (install via: brew install imagemagick)

set -e

ASSETS_DIR="./assets/images"
BRAND_BLUE="#007AFF"
LIGHT_BG="#E6F4FE"
DARK_BG="#000000"

echo "🎨 Generating placeholder images for Lung Tracker..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with: brew install imagemagick"
    exit 1
fi

# Function to create a placeholder image with text
create_placeholder() {
    local filename=$1
    local size=$2
    local bg_color=$3
    local text=$4
    local text_color=${5:-white}
    
    echo "📦 Creating $filename (${size}x${size})..."
    
    convert \
        -size "${size}x${size}" \
        "xc:${bg_color}" \
        -fill "${text_color}" \
        -gravity center \
        -pointsize 40 \
        -annotate +0+0 "${text}" \
        "${ASSETS_DIR}/${filename}"
}

# Create app icon (1024x1024)
create_placeholder "icon.png" "1024" "$BRAND_BLUE" "Lung\nTracker" "white"

# Create Android adaptive icon - foreground (1080x1080)
convert \
    -size "1080x1080" \
    "xc:${BRAND_BLUE}" \
    -fill white \
    -gravity center \
    -pointsize 80 \
    -annotate +0+0 "LT" \
    "${ASSETS_DIR}/android-icon-foreground.png"
echo "📦 Created android-icon-foreground.png (1080x1080)"

# Create Android adaptive icon - background (1080x1080)
create_placeholder "android-icon-background.png" "1080" "$LIGHT_BG" "" "transparent"

# Create Android adaptive icon - monochrome (1080x1080)
convert \
    -size "1080x1080" \
    "xc:#808080" \
    -fill white \
    -gravity center \
    -pointsize 80 \
    -annotate +0+0 "LT" \
    "${ASSETS_DIR}/android-icon-monochrome.png"
echo "📦 Created android-icon-monochrome.png (1080x1080)"

# Create splash icon (512x512)
create_placeholder "splash-icon.png" "512" "transparent" "Lung\nTracker" "$BRAND_BLUE"

# Create favicon (64x64)
create_placeholder "favicon.png" "64" "$BRAND_BLUE" "LT" "white"

echo ""
echo "✅ All placeholder images created successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the created images in $ASSETS_DIR"
echo "   2. Replace placeholders with actual design assets"
echo "   3. See README.md in assets/images for detailed specifications"
echo "   4. Run: eas build --platform ios --local"
echo "   5. Run: eas build --platform android --local"
