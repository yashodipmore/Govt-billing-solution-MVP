import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export class AdMobService {
  private static instance: AdMobService;
  private isInitialized = false;

  // Test banner ad unit ID for Android
  private readonly TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';
  
  // Your actual banner ad unit ID (replace with your real banner ad unit ID)
  private readonly PROD_BANNER_ID = 'ca-app-pub-6312756313711545/1234567890'; // Replace with your actual banner ad unit ID

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || !Capacitor.isNativePlatform()) {
      return;
    }    try {
      await AdMob.initialize({
        initializeForTesting: true, // Set to false for production
      });
      
      this.isInitialized = true;
      console.log('AdMob initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  async showBannerAd(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('AdMob banners are only available on native platforms');
      return;
    }

    try {
      const options: BannerAdOptions = {
        adId: this.TEST_BANNER_ID, // Using test ID, change to PROD_BANNER_ID for production
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true, // Set to false for production
      };

      await AdMob.showBanner(options);
      console.log('Banner ad shown successfully');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  }

  async hideBannerAd(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await AdMob.hideBanner();
      console.log('Banner ad hidden successfully');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  async removeBannerAd(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await AdMob.removeBanner();
      console.log('Banner ad removed successfully');
    } catch (error) {
      console.error('Failed to remove banner ad:', error);
    }
  }

  getBannerAdUnitId(): string {
    return this.TEST_BANNER_ID; // Return test ID for now
  }
}
