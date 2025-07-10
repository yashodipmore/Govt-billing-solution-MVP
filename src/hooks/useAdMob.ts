import { useEffect, useState } from 'react';
import { AdMobService } from '../services/AdMobService';
import { Capacitor } from '@capacitor/core';

export const useAdMob = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adMobService] = useState(() => AdMobService.getInstance());

  useEffect(() => {
    const initializeAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await adMobService.initialize();
          await adMobService.showBannerAd();
          setIsAdLoaded(true);
        } catch (error) {
          console.error('Failed to initialize AdMob:', error);
        }
      }
    };

    initializeAdMob();

    // Cleanup function to hide ads when component unmounts
    return () => {
      if (Capacitor.isNativePlatform()) {
        adMobService.hideBannerAd().catch(console.error);
      }
    };
  }, [adMobService]);

  const showBanner = async () => {
    try {
      await adMobService.showBannerAd();
      setIsAdLoaded(true);
    } catch (error) {
      console.error('Failed to show banner:', error);
    }
  };

  const hideBanner = async () => {
    try {
      await adMobService.hideBannerAd();
      setIsAdLoaded(false);
    } catch (error) {
      console.error('Failed to hide banner:', error);
    }
  };

  return {
    isAdLoaded,
    showBanner,
    hideBanner,
    adMobService,
  };
};
