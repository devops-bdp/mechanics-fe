# Panduan PWA (Progressive Web App)

Aplikasi ini sudah dikonfigurasi sebagai PWA, sehingga bisa di-install di smartphone seperti aplikasi native.

## Fitur PWA

✅ **Installable** - Bisa di-install dari browser  
✅ **Offline Support** - Service worker untuk caching  
✅ **App-like Experience** - Tampil seperti aplikasi native  
✅ **Fast Loading** - Caching untuk performa lebih cepat  
✅ **No App Store** - Tidak perlu upload ke Play Store/App Store  

## Cara Install PWA

### Android (Chrome)

1. Buka aplikasi di browser Chrome
2. Tap menu (3 dots) di kanan atas
3. Pilih **"Install app"** atau **"Add to Home screen"**
4. Konfirmasi install
5. App akan muncul di home screen seperti aplikasi biasa

### iOS (Safari)

1. Buka aplikasi di Safari
2. Tap tombol **Share** (kotak dengan panah)
3. Scroll dan pilih **"Add to Home Screen"**
4. Edit nama jika perlu, lalu tap **"Add"**
5. App akan muncul di home screen

### Desktop (Chrome/Edge)

1. Buka aplikasi di browser
2. Klik icon **Install** (+) di address bar
3. Atau klik menu → **"Install app"**
4. Konfirmasi install
5. App akan terbuka sebagai window terpisah

## File PWA yang Sudah Dibuat

### 1. `public/manifest.json`
- Konfigurasi PWA
- Nama app, icon, theme color
- Display mode (standalone)

### 2. `public/sw.js`
- Service Worker untuk caching
- Offline support
- Cache management

### 3. `app/pwa-install-prompt.tsx`
- Component untuk prompt install
- Muncul otomatis saat browser support install

### 4. `app/layout.tsx`
- Updated dengan PWA meta tags
- Service worker registration
- Apple touch icon

## Membuat Icon PWA

PWA membutuhkan icon dengan ukuran:
- **192x192** pixels (icon-192.png)
- **512x512** pixels (icon-512.png)

### Cara Membuat Icon:

1. **Gunakan NavLogo.png yang sudah ada:**
   ```bash
   # Convert NavLogo.png ke ukuran yang diperlukan
   # Bisa menggunakan online tool atau image editor
   ```

2. **Online Tools:**
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

3. **Manual dengan Image Editor:**
   - Buka NavLogo.png
   - Resize ke 192x192 dan 512x512
   - Save sebagai `icon-192.png` dan `icon-512.png`
   - Letakkan di folder `public/`

### Quick Fix (Temporary):

Jika belum ada icon, bisa menggunakan placeholder:

```bash
# Di folder public, buat icon sederhana
# Atau gunakan NavLogo.png sebagai icon sementara
```

## Testing PWA

### 1. Test di Browser

1. Buka aplikasi di browser
2. Buka DevTools (F12)
3. Tab **Application** → **Manifest**
   - Check manifest ter-load dengan benar
   - Icon terdeteksi
4. Tab **Application** → **Service Workers**
   - Service worker ter-register
   - Status: activated

### 2. Test Install Prompt

1. Buka aplikasi di mobile browser
2. Install prompt akan muncul otomatis
3. Atau cek di menu browser untuk opsi install

### 3. Test Offline

1. Install PWA
2. Buka aplikasi
3. Matikan internet
4. App masih bisa dibuka (dari cache)

## Update Service Worker

Jika perlu update service worker:

1. Update `CACHE_NAME` di `public/sw.js`
2. Build ulang aplikasi
3. User akan dapat update otomatis saat refresh

## Troubleshooting

### Install Prompt Tidak Muncul

**Penyebab:**
- Browser tidak support PWA
- App sudah ter-install
- HTTPS required (untuk production)

**Solusi:**
- Gunakan Chrome/Edge untuk desktop
- Gunakan Chrome untuk Android
- Pastikan menggunakan HTTPS di production

### Service Worker Tidak Ter-register

**Penyebab:**
- File `sw.js` tidak ditemukan
- Path tidak benar

**Solusi:**
- Pastikan `sw.js` ada di folder `public/`
- Check console untuk error
- Pastikan path di layout.tsx benar: `/sw.js`

### Icon Tidak Muncul

**Penyebab:**
- File icon tidak ada
- Path di manifest.json salah

**Solusi:**
- Pastikan `icon-192.png` dan `icon-512.png` ada di `public/`
- Check path di `manifest.json`
- Gunakan absolute path: `/icon-192.png`

### App Tidak Bisa Offline

**Penyebab:**
- Service worker tidak aktif
- Cache tidak ter-update

**Solusi:**
- Check service worker di DevTools
- Update `CACHE_NAME` untuk force refresh
- Clear cache dan reload

## Production Checklist

- [ ] Icon 192x192 dan 512x512 sudah dibuat
- [ ] Manifest.json sudah dikonfigurasi dengan benar
- [ ] Service worker ter-register
- [ ] Test install di Android (Chrome)
- [ ] Test install di iOS (Safari)
- [ ] Test offline functionality
- [ ] HTTPS enabled (required untuk PWA)
- [ ] Test di berbagai device

## Keuntungan PWA vs APK

### PWA ✅
- Tidak perlu build APK
- Tidak perlu Android Studio
- Update otomatis (seperti website)
- Bisa di-install langsung dari browser
- Cross-platform (Android, iOS, Desktop)
- Lebih mudah maintenance

### APK
- Native app experience
- Bisa upload ke Play Store
- Lebih banyak akses device features
- Perlu build process
- Perlu Android Studio

## Catatan

1. **HTTPS Required**: PWA memerlukan HTTPS di production (Vercel sudah include HTTPS)
2. **Browser Support**: 
   - Android: Chrome, Samsung Internet
   - iOS: Safari (iOS 11.3+)
   - Desktop: Chrome, Edge, Firefox
3. **Update**: Service worker akan auto-update saat user refresh
4. **Storage**: Cache menggunakan browser storage (biasanya 50MB limit)

## Next Steps

1. Buat icon 192x192 dan 512x512 dari NavLogo.png
2. Deploy ke Vercel (HTTPS otomatis)
3. Test install di berbagai device
4. Share link ke user untuk install

PWA sudah siap digunakan! 🎉

