# Deployment Guide untuk Frontend (Next.js) ke Vercel

## Prerequisites
1. Akun Vercel (https://vercel.com)
2. Backend sudah ter-deploy (untuk mendapatkan API URL)
3. Code sudah di-push ke Git repository

## Environment Variables yang Diperlukan

### Wajib:
- `NEXT_PUBLIC_API_URL` - URL backend API (contoh: `https://your-backend.vercel.app`)

### Opsional:
- `NODE_ENV` - Set ke `production` (otomatis di-set oleh Vercel)

## Langkah-langkah Deployment

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code ke Git repository**
   ```bash
   git add .
   git commit -m "Prepare frontend for deployment"
   git push
   ```

2. **Import Project di Vercel Dashboard**
   - Login ke https://vercel.com
   - Klik "Add New..." → "Project"
   - Import repository dari GitHub/GitLab/Bitbucket
   - Pilih repository yang berisi frontend

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (otomatis terdeteksi)
   - **Root Directory**: `mar-fe` (atau kosongkan jika root project)
   - **Build Command**: `npm run build` (otomatis)
   - **Output Directory**: `.next` (otomatis)
   - **Install Command**: `npm install` (otomatis)

4. **Set Environment Variables**
   - Klik "Environment Variables"
   - Tambahkan:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: URL backend Anda (contoh: `https://your-backend.vercel.app`)
     - Environment: Production, Preview, Development (centang semua)

5. **Deploy**
   - Klik "Deploy"
   - Tunggu build selesai
   - Frontend akan otomatis ter-deploy!

### Opsi 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Login
vercel login

# Deploy (dari folder mar-fe)
cd mar-fe
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL

# Deploy ke production
vercel --prod
```

## Catatan Penting

### 1. **TIDAK PERLU `npm run build` Manual**
   - Vercel akan otomatis menjalankan `npm run build` saat deployment
   - Build akan otomatis dijalankan di Vercel's build environment

### 2. **Environment Variables**
   - Pastikan `NEXT_PUBLIC_API_URL` sudah di-set di Vercel
   - Variable yang dimulai dengan `NEXT_PUBLIC_` akan tersedia di client-side
   - Set untuk semua environments (Production, Preview, Development)

### 3. **Next.js Auto-detection**
   - Vercel otomatis detect Next.js project
   - Tidak perlu `vercel.json` khusus untuk Next.js
   - Build settings sudah otomatis dikonfigurasi

### 4. **Image Optimization**
   - `next.config.mjs` sudah dikonfigurasi untuk allow external images
   - Pastikan image URLs valid dan accessible

### 5. **API Routes**
   - Jika ada API routes di Next.js, akan otomatis menjadi serverless functions
   - Untuk project ini, semua API calls ke backend external

## Testing Deployment

Setelah deploy, test:
1. Login page: `https://your-frontend.vercel.app/login`
2. Pastikan API calls berfungsi
3. Check browser console untuk errors

## Update Backend CORS (Jika Perlu)

Jika backend di Vercel, pastikan CORS sudah allow frontend domain:
```typescript
// Di backend src/index.ts
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000' // untuk development
  ],
  credentials: true
}));
```

## Troubleshooting

### Build Error
- Check build logs di Vercel Dashboard
- Pastikan semua dependencies compatible
- Pastikan TypeScript compilation berhasil

### API Connection Error
- Pastikan `NEXT_PUBLIC_API_URL` sudah benar
- Pastikan backend sudah ter-deploy dan accessible
- Check CORS settings di backend

### Image Loading Error
- Pastikan image URLs valid
- Check `next.config.mjs` remotePatterns settings

## Production Checklist

- [ ] Code sudah di-push ke Git
- [ ] Environment variable `NEXT_PUBLIC_API_URL` sudah di-set
- [ ] Backend sudah ter-deploy dan accessible
- [ ] CORS di backend sudah allow frontend domain
- [ ] Test login dan semua fitur utama
- [ ] Check mobile responsiveness
- [ ] Test semua role access (PLANNER, MECHANIC, dll)

