/** @type {import('next').NextConfig} */
// Configuration untuk build APK (Static Export)
const nextConfig = {
  output: 'export', // Static export untuk Capacitor
  images: {
    unoptimized: true, // Required untuk static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  trailingSlash: true, // Recommended untuk static export
  // Disable features yang tidak support static export
  distDir: 'out',
};

export default nextConfig;

