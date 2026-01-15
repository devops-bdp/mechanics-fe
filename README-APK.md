# Panduan Build APK dari Next.js Frontend

## Metode: Capacitor (Recommended)

Capacitor adalah framework modern untuk mengkonversi web app menjadi native mobile app (Android/iOS).

## Prerequisites

1. **Node.js 18+** dan npm
2. **Android Studio** (untuk build APK)
   - Download: https://developer.android.com/studio
   - Install Android SDK
3. **Java JDK 11+** (untuk Android build)
4. **Backend sudah ter-deploy** (untuk production API URL)

## Langkah-langkah

### 1. Install Capacitor

```bash
cd mar-fe
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Initialize Capacitor

```bash
npx cap init
```

Saat diminta, isi:
- **App name**: Mechanic Activity Report
- **App ID**: com.mechanicactivityreport.app
- **Web dir**: out (untuk static export)

### 3. Update next.config.mjs untuk Static Export

**PENTING**: Jangan langsung ubah `next.config.mjs` karena itu akan mempengaruhi deployment Vercel!

**Solusi**: Buat config terpisah untuk APK build:

**Opsi A: Backup config saat ini, lalu ubah untuk APK**

```bash
# Backup config untuk Vercel
cp next.config.mjs next.config.vercel.mjs

# Gunakan config untuk APK
cp next.config.apk.mjs next.config.mjs
```

**Opsi B: Gunakan script dengan env variable**

Update `package.json`:
```json
{
  "scripts": {
    "build:apk": "cp next.config.apk.mjs next.config.mjs && npm run build && npx cap sync && cp next.config.vercel.mjs next.config.mjs"
  }
}
```

**PENTING**: Static export berarti:
- ❌ Tidak ada server-side rendering
- ❌ Tidak ada API routes
- ✅ Semua pages menjadi static HTML
- ✅ API calls tetap berfungsi (ke backend external)
- ✅ Dynamic routes tetap berfungsi dengan client-side routing

### 4. Build Static Export

```bash
npm run build
```

Ini akan membuat folder `out/` dengan semua static files.

### 5. Add Android Platform

```bash
npx cap add android
```

### 6. Sync Files ke Android

```bash
npx cap sync
```

### 7. Update capacitor.config.ts

Edit `capacitor.config.ts` untuk set API URL:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mechanicactivityreport.app',
  appName: 'Mechanic Activity Report',
  webDir: 'out',
  server: {
    // Untuk development, uncomment ini:
    // url: 'http://localhost:3000',
    // cleartext: true
    
    // Untuk production, gunakan URL backend Anda:
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
```

### 8. Build APK dengan Android Studio

```bash
# Buka Android Studio
npx cap open android
```

Di Android Studio:
1. Tunggu Gradle sync selesai
2. Klik **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Tunggu build selesai
4. APK akan ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

### 9. Build Release APK (untuk Production)

Untuk production APK yang bisa di-distribute:

1. Di Android Studio, buka **Build** → **Generate Signed Bundle / APK**
2. Pilih **APK**
3. Buat keystore (jika belum ada)
4. Isi informasi signing
5. Pilih **release** build variant
6. Build APK

## Environment Variables untuk APK

Karena static export, environment variables harus di-hardcode atau di-inject saat build.

### Opsi 1: Hardcode di api.ts (Tidak Recommended untuk Production)

```typescript
// lib/api.ts
const API_URL = "https://your-backend.vercel.app"; // Hardcode production URL
```

### Opsi 2: Build Script dengan Environment (Recommended)

Buat script untuk inject environment variable saat build:

```json
// package.json
{
  "scripts": {
    "build:apk": "NEXT_PUBLIC_API_URL=https://your-backend.vercel.app npm run build && npx cap sync"
  }
}
```

## Update API Client untuk Mobile

Pastikan API client menggunakan URL yang benar:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-backend.vercel.app";
```

## Troubleshooting

### Error: "Cannot find module '@capacitor/core'"
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Error: "Gradle sync failed"
- Pastikan Android Studio sudah ter-install dengan benar
- Pastikan Android SDK sudah ter-install
- Coba: **File** → **Invalidate Caches / Restart**

### Error: "Static page generation failed"
- Pastikan semua pages bisa di-render secara static
- Check untuk penggunaan `getServerSideProps` atau server-only features
- Gunakan `getStaticProps` atau client-side data fetching

### API Calls tidak berfungsi di APK
- Pastikan backend CORS sudah allow semua origins
- Pastikan API URL sudah benar (gunakan HTTPS untuk production)
- Check network permissions di `AndroidManifest.xml`

## Update AndroidManifest.xml

Pastikan permissions sudah benar:

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Build Script Otomatis

Buat script untuk build APK dengan satu command:

```json
// package.json
{
  "scripts": {
    "build:apk": "npm run build && npx cap sync && npx cap open android",
    "build:apk:prod": "NEXT_PUBLIC_API_URL=https://your-backend.vercel.app npm run build && npx cap sync"
  }
}
```

## ⚠️ PENTING: Dynamic Routes

Project ini menggunakan **dynamic routes** (seperti `[mechanicId]`, `[unitId]`). Untuk static export, Anda perlu:

### Opsi 1: Generate Static Params (Recommended)

Tambahkan `generateStaticParams` di setiap dynamic route page:

```typescript
// app/planner/reports/mechanics-report/[mechanicId]/page.tsx
export async function generateStaticParams() {
  // Fetch semua mechanic IDs dari API
  const mechanics = await fetch('https://your-api.com/api/planner/mechanics-report')
    .then(res => res.json());
  
  return mechanics.data.map((mechanic: any) => ({
    mechanicId: mechanic.id,
  }));
}
```

**Masalah**: Ini memerlukan API call saat build time, yang mungkin tidak ideal.

### Opsi 2: Client-Side Routing (Lebih Mudah)

Dynamic routes akan tetap berfungsi dengan client-side routing. Pastikan:
- Semua data fetching menggunakan `useEffect` (client-side)
- Tidak ada `getServerSideProps` atau server-only code
- API calls dilakukan di client

**Status Project**: Project ini sudah menggunakan client-side data fetching, jadi seharusnya compatible dengan static export.

## Catatan Penting

1. **Static Export Limitations**:
   - Tidak ada server-side rendering
   - Tidak ada API routes
   - Semua data fetching harus client-side ✅ (Sudah OK)
   - Dynamic routes menggunakan client-side routing ✅ (Sudah OK)

2. **API Backend**:
   - Pastikan backend sudah ter-deploy dan accessible
   - Pastikan CORS sudah dikonfigurasi dengan benar
   - Gunakan HTTPS untuk production

3. **Testing**:
   - Test di emulator Android sebelum build APK
   - Test semua fitur utama
   - Test di berbagai device sizes

4. **Performance**:
   - Static export akan membuat semua pages di-pre-render
   - Initial load mungkin lebih lambat karena semua assets di-load
   - Pertimbangkan code splitting dan lazy loading

## Alternatif: PWA (Progressive Web App)

Jika tidak perlu APK native, bisa membuat PWA yang bisa di-install:

1. Tambahkan `manifest.json` di `public/`
2. Tambahkan service worker
3. User bisa "Add to Home Screen" dari browser

PWA lebih mudah dan tidak perlu build APK, tapi tidak bisa di-upload ke Play Store.

