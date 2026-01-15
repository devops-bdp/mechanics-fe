import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mechanicactivityreport.app',
  appName: 'Mechanic Activity Report',
  webDir: 'out',
  server: {
    // Untuk development, uncomment baris di bawah:
    // url: 'http://localhost:3000',
    // cleartext: true
    
    // Untuk production, gunakan HTTPS
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

