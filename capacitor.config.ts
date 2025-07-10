import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Consider changing this to a unique ID like 'com.yourcompany.govtbilling'
  appName: 'GovtInvoiceNew',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-6312756313711545~1844628732', // Replace with your AdMob App ID
      initializeForTesting: true // Set to false for production
    }
  }
};

export default config;