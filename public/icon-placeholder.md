# Icon PWA

Untuk PWA, Anda perlu membuat icon dengan ukuran:
- **192x192** pixels → `icon-192.png`
- **512x512** pixels → `icon-512.png`

## Cara Membuat Icon

### Opsi 1: Gunakan NavLogo.png

1. Buka NavLogo.png di image editor (Photoshop, GIMP, atau online editor)
2. Resize ke 192x192 pixels
3. Save sebagai `icon-192.png` di folder `public/`
4. Resize ke 512x512 pixels
5. Save sebagai `icon-512.png` di folder `public/`

### Opsi 2: Online Tools

1. **PWA Builder Image Generator:**
   - https://www.pwabuilder.com/imageGenerator
   - Upload NavLogo.png
   - Generate semua ukuran
   - Download dan letakkan di `public/`

2. **RealFaviconGenerator:**
   - https://realfavicongenerator.net/
   - Upload NavLogo.png
   - Generate icons
   - Download dan extract ke `public/`

### Opsi 3: Quick Command (jika ada ImageMagick)

```bash
# Install ImageMagick dulu
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Convert NavLogo.png ke icon
magick public/NavLogo.png -resize 192x192 public/icon-192.png
magick public/NavLogo.png -resize 512x512 public/icon-512.png
```

## Catatan

- Icon harus berbentuk **persegi** (square)
- Format: **PNG** dengan transparansi
- Background bisa transparan atau solid color
- Pastikan icon terlihat jelas di berbagai ukuran

## Temporary Fix

Jika belum sempat membuat icon, PWA masih bisa berfungsi, hanya saja icon akan menggunakan default browser icon.

