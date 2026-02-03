# Expo CLI Commands Used in Lung Tracker

This document lists **all `npx expo` commands used so far** in the Lung Tracker project,
with explanations of **what each command does** and **when to use it**.

This file is safe to commit to the repository.

---

## 1. Inspect resolved Expo configuration

    npx expo config --type public

### Purpose
- Prints the fully resolved Expo configuration after applying `app.config.ts`
- Shows exactly what values are baked into Android, iOS, and Web builds

### When to use
- To verify environment variables are correctly injected
- To debug Android builds hanging on the splash screen
- To debug Web builds loading wrong asset paths
- Before sharing builds with testers

### Things to verify in the output
- expo.android.package
- expo.ios.bundleIdentifier
- expo.extra.supabaseUrl
- expo.extra.supabaseAnonKey
- expo.extra.eas.projectId
- expo.web.basePath (for GitHub Pages)

---

## 2. Export the app for Web (static build)

    npx expo export --platform web

### Purpose
- Builds a static Web version of the app
- Outputs files into the `dist/` directory

### When to use
- Before deploying to GitHub Pages
- Before deploying to Cloudflare Pages or Netlify
- After changing `app.config.ts` (especially `web.basePath`)

### Notes
- Output is static HTML, JS, and assets
- Required for free web hosting
- Must be rebuilt after every config change

---

## 3. Export for all platforms (optional)

    npx expo export

### Purpose
- Exports all enabled platforms (Web + others)

### When to use
- Rarely needed in this project
- Mostly useful for multi-platform static workflows

---

## 4. Using Expo CLI via npx (implicit)

    npx expo

### Purpose
- Runs Expo CLI without a global install

### Why this is used
- Avoids version mismatches
- Keeps builds reproducible across machines
- Recommended approach by Expo

---

## Related commands (not `npx expo`, but used together)

### Android build for testers (EAS)

    eas build --profile preview --platform android

- Produces an installable Android build
- Generates a shareable install URL
- Used to distribute the app to testers (e.g. Tyson)

### iOS build for testers (EAS)

    eas build --profile preview --platform ios

- Produces an iOS test build
- Requires Apple Developer account
- Typically distributed via TestFlight

---

## Typical command flow in this project

1. Update `app.config.ts`
2. Verify resolved configuration

       npx expo config --type public

3. Build Android app for testers

       eas build --profile preview --platform android

4. Export Web app

       npx expo export --platform web

5. Deploy `dist/` to GitHub Pages or Cloudflare Pages

---

## Troubleshooting guide

### Web app shows blank page on GitHub Pages
- Check `expo.web.basePath`
- Re-run `npx expo export --platform web`
- Ensure asset URLs include the repository name

### Android app hangs on splash screen
- Verify `expo.extra.supabaseUrl` and `expo.extra.supabaseAnonKey`
- Ensure EAS preview environment variables are set
- Rebuild the Android app

---