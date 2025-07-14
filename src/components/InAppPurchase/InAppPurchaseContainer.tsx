import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSearchbar,
  IonText,
  IonSpinner,
  useIonToast
} from '@ionic/react';
import { InAppPurchaseCard } from './InAppPurchaseCard';
import { InAppPurchaseService } from '../../services/InAppPurchaseService';
import './InAppPurchaseContainer.css';

type PackageType = 'pdf' | 'sharing' | 'spe' | 'all';

export const InAppPurchaseContainer: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PackageType>('all');
  const [searchText, setSearchText] = useState('');
  const [present] = useIonToast();
  const inAppService = new InAppPurchaseService();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const items = await inAppService.displayItems();
      setPackages(items);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load packages:', error);
      showToast('Failed to load packages', 'danger');
      setLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    try {
      setLoading(true);
      await inAppService.purchaseItem(id);
      await loadPackages(); // Refresh packages after purchase
      showToast('Purchase successful!', 'success');
    } catch (error) {
      console.error('Purchase failed:', error);
      showToast('Purchase failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, color: 'success' | 'danger' = 'success') => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: color,
    });
  };

  const filterPackages = () => {
    return packages.filter(pkg => {
      const matchesType = selectedType === 'all' || 
        (selectedType === 'pdf' && pkg.name.toLowerCase().includes('pdf')) ||
        (selectedType === 'sharing' && (
          pkg.name.toLowerCase().includes('facebook') ||
          pkg.name.toLowerCase().includes('twitter') ||
          pkg.name.toLowerCase().includes('whatsapp') ||
          pkg.name.toLowerCase().includes('sms')
        )) ||
        (selectedType === 'spe' && pkg.name.toLowerCase().includes('spe'));

      const matchesSearch = searchText === '' ||
        pkg.name.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.desc.toLowerCase().includes(searchText.toLowerCase());

      return matchesType && matchesSearch;
    });
  };

  return (
    <IonContent>
      <div className="purchase-container">
        <div className="purchase-header">
          <h1>In-App Purchases</h1>
          <IonText color="medium">
            Select a package to enhance your experience
          </IonText>
        </div>

        <div className="filters">
          <IonSegment value={selectedType} onIonChange={e => setSelectedType(e.detail.value as PackageType)}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pdf">
              <IonLabel>PDF</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="sharing">
              <IonLabel>Sharing</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="spe">
              <IonLabel>SPE</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Search packages..."
            className="package-search"
          />
        </div>

        {loading ? (
          <div className="loading-container">
            <IonSpinner />
            <IonText color="medium">Loading packages...</IonText>
          </div>
        ) : (
          <IonGrid>
            <IonRow>
              {filterPackages().map(pkg => (
                <IonCol size="12" sizeMd="6" sizeLg="4" key={pkg.id}>
                  <InAppPurchaseCard
                    package={pkg}
                    onPurchase={handlePurchase}
                    loading={loading}
                  />
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}
      </div>
    </IonContent>
  );
};
