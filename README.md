# Govt Billing Solution MVP

A cross-platform government billing and invoicing MVP built with [Capacitor](https://capacitorjs.com/) and [Ionic](https://ionicframework.com/), featuring AdMob banner integration for monetization.

---

## Features

- Cross-platform: Android and Web
- Built with Capacitor, Ionic, and modern JS/TS
- AdMob banner ad integration (monetization)
- Modular, extensible codebase
- Ready for production builds and easy development setup

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Ionic CLI](https://ionicframework.com/docs/cli)  
  Install via: `npm install -g @ionic/cli`
- [Capacitor CLI](https://capacitorjs.com/docs/getting-started)
- [Android Studio](https://developer.android.com/studio) (for Android builds)
- A [Google AdMob account](https://admob.google.com/home/) and valid App/Ad Unit IDs

---

## Getting Started

### 1. Clone the Repository

```bash
git clone REPO_URL
cd REPO_NAME
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Install the Ionic CLI (if not already installed)

```bash
npm install -g @ionic/cli
```

---

## Running the Project on Web

You can run the app in your browser for development:

```bash
ionic serve
```

This will open the app in your default browser with live reload enabled.

---

## Running the Project on Android

### 1. Build the Web Assets

```bash
npm run build
```

### 2. Add Android Platform (if not already added)

```bash
npx cap add android
```

### 3. Sync Changes

```bash
npx cap sync
```

### 4. Open in Android Studio

```bash
npx cap open android
```

### 5. Build and Run

- Use Android Studio to build and run the app on a device or emulator.

---

## AdMob Banner Ads Integration

- The project uses `@capacitor-community/admob` for banner ads.
- **No need to manually install the AdMob plugin**—it is already included in `package.json`.  
  When you run `npm install`, all plugins will be installed automatically.
- To use your own AdMob IDs, set them in the configuration (see `.env.example` or your environment setup).

### **Where are AdMob Banner Ads Shown?**

- **Platform:** Banner ads are shown on **Android** builds only.
- **Location:** The AdMob banner is displayed at the **bottom of the main billing/invoice screen** in the app.
- **Purpose:** These ads provide monetization for the app without interrupting the user experience.
- **How to Change:**  
  - If you want to show the banner ad on a different screen, check the code in `src/components/AdMobBanner.tsx` (or equivalent) and include the banner wherever you want in your UI.
  - You can adjust ad position and visibility by modifying the component placement in your page files.

---

## Project Structure

```
.
├── src/
│   ├── components/
│   │   └── AdMobBanner.tsx   # AdMob Banner component
│   ├── hooks/
│   ├── pages/
│   └── ...
├── android/         # Android platform (auto-generated)
├── public/
├── package.json
├── capacitor.config.json
└── ...
```

---

## Building for Production

1. Build the project:
    ```bash
    npm run build
    ```
2. Sync with Capacitor:
    ```bash
    npx cap sync
    ```
3. Open the native project:
    ```bash
    npx cap open android
    ```
4. Build and sign APK using Android Studio for production deployment.

---

## Environment Variables

If your project uses environment variables (for AdMob IDs, API keys, etc.), create a `.env` file in the root directory.

Example:
```env
REACT_APP_ADMOB_BANNER_ID=ca-app-pub-xxxxxx/yyyyyy
```

---

## Troubleshooting

- **Android build issues:** Ensure Android Studio and required SDKs are up to date.
- **AdMob issues:** Use test ad units during development. Replace with your production AdMob IDs before release.
- If you have other issues, consult [Capacitor Docs](https://capacitorjs.com/docs/) or the [AdMob Plugin documentation](https://github.com/capacitor-community/admob).

