import React from 'react';
import { Capacitor } from '@capacitor/core';
import './BannerAd.css';

interface BannerAdProps {
  className?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({ className = '' }) => {
  // Only show placeholder on web platform for development
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className={`banner-ad-placeholder ${className}`}>
        <div className="banner-ad-content">
          <span>AdMob Banner Ad Placeholder</span>
          <small>Ads will appear here on mobile devices</small>
        </div>
      </div>
    );
  }

  // On native platforms, the banner will be handled by the AdMob plugin
  // and positioned at the bottom of the screen
  return (
    <div className={`banner-ad-spacer ${className}`}>
      {/* This spacer ensures content doesn't overlap with the banner */}
    </div>
  );
};

export default BannerAd;
