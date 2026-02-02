/**
 * Asset Generation Script (Node-based alternative to ImageMagick)
 * 
 * This script generates placeholder images using Sharp (Node.js image library)
 * Install dependencies: npm install sharp
 * 
 * Usage: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.error(
    '❌ Sharp not found. Install with: npm install --save-dev sharp'
  );
  process.exit(1);
}

const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const BRAND_BLUE = '#007AFF';
const LIGHT_BG = '#E6F4FE';
const DARK_BG = '#000000';

/**
 * Create a solid color placeholder image
 */
async function createPlaceholder(filename, width, height, bgColor) {
  const filepath = path.join(ASSETS_DIR, filename);
  
  console.log(`📦 Creating ${filename} (${width}x${height})...`);
  
  // Create SVG with background color
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-size="80" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        Placeholder
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(filepath);
}

/**
 * Create adaptive icon with Safe Zone guide
 */
async function createAdaptiveIcon() {
  const width = 1080;
  const height = 1080;
  const safeZoneRadius = 330; // Inner safe zone
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#007AFF;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0051D5;stop-opacity:1" />
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <circle cx="540" cy="540" r="${safeZoneRadius}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="20" stroke-dasharray="20,20"/>
      <text 
        x="540" 
        y="500" 
        font-size="120" 
        fill="white" 
        text-anchor="middle" 
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        LT
      </text>
      <text 
        x="540" 
        y="620" 
        font-size="40" 
        fill="white" 
        text-anchor="middle" 
        font-family="Arial, sans-serif"
      >
        Lung Tracker
      </text>
    </svg>
  `;
  
  const filepath = path.join(ASSETS_DIR, 'android-icon-foreground.png');
  console.log(`📦 Creating android-icon-foreground.png (${width}x${height})...`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(filepath);
}

/**
 * Create splash screen icon
 */
async function createSplashIcon() {
  const width = 512;
  const height = 512;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#E6F4FE;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#B3E0FF;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#splashGrad)"/>
      <text 
        x="256" 
        y="180" 
        font-size="90" 
        fill="#007AFF" 
        text-anchor="middle" 
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        💨
      </text>
      <text 
        x="256" 
        y="340" 
        font-size="60" 
        fill="#007AFF" 
        text-anchor="middle" 
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        Lung Tracker
      </text>
    </svg>
  `;
  
  const filepath = path.join(ASSETS_DIR, 'splash-icon.png');
  console.log(`📦 Creating splash-icon.png (${width}x${height})...`);
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(filepath);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎨 Generating placeholder images for Lung Tracker...\n');
    
    // Create app icon
    await createPlaceholder('icon.png', 1024, 1024, BRAND_BLUE);
    
    // Create Android adaptive icon
    await createAdaptiveIcon();
    
    // Create background
    await createPlaceholder('android-icon-background.png', 1080, 1080, LIGHT_BG);
    
    // Create monochrome
    await createPlaceholder('android-icon-monochrome.png', 1080, 1080, '#808080');
    
    // Create splash icon
    await createSplashIcon();
    
    // Create favicon
    await createPlaceholder('favicon.png', 64, 64, BRAND_BLUE);
    
    console.log('\n✅ All placeholder images created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review the created images in assets/images');
    console.log('   2. Replace placeholders with actual design assets');
    console.log('   3. See README.md in assets/images for specifications');
    console.log('   4. Run: eas build --platform ios --local');
    console.log('   5. Run: eas build --platform android --local');
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

main();
