import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonSkeletonText,
  IonText,
  IonRippleEffect
} from '@ionic/react';
import { 
  checkmarkCircle, 
  lockClosed,
  timerOutline,
  chevronForward
} from 'ionicons/icons';
import './InAppPurchaseCard.css';

interface Package {
  id: string;
  name: string;
  desc: string;
  price: number;
  units: number;
  icon: string;
  status: boolean;
}

interface Props {
  package: Package;
  onPurchase: (id: string) => Promise<void>;
  loading?: boolean;
}

export const InAppPurchaseCard: React.FC<Props> = ({ 
  package: pkg,
  onPurchase,
  loading = false 
}) => {
  const handlePurchase = async () => {
    try {
      await onPurchase(pkg.id);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  return (
    <IonCard className="purchase-card ion-activatable ripple-parent">
      <IonRippleEffect></IonRippleEffect>
      <div className={`card-overlay ${pkg.status ? 'active' : ''}`}>
        {pkg.status && (
          <div className="status-badge">
            <IonIcon icon={checkmarkCircle} color="success" />
            <IonText color="success">Active</IonText>
          </div>
        )}
      </div>
      
      <IonCardHeader>
        <div className="card-header-content">
          <div className="package-icon">
            <IonIcon icon={pkg.icon} color="primary" size="large" />
          </div>
          <div className="package-info">
            <IonCardTitle>{loading ? <IonSkeletonText animated style={{ width: '70%' }} /> : pkg.name}</IonCardTitle>
            <IonCardSubtitle>
              {loading ? <IonSkeletonText animated style={{ width: '40%' }} /> : pkg.desc}
            </IonCardSubtitle>
          </div>
        </div>
      </IonCardHeader>

      <IonCardContent>
        <div className="package-details">
          {pkg.units > 0 && (
            <div className="units-badge">
              <IonBadge color="primary">
                <IonIcon icon={timerOutline} /> {pkg.units} units remaining
              </IonBadge>
            </div>
          )}
          
          <div className="price-action">
            <div className="price-tag">
              {loading ? (
                <IonSkeletonText animated style={{ width: '30%' }} />
              ) : (
                <>
                  <span className="currency">$</span>
                  <span className="amount">{pkg.price.toFixed(2)}</span>
                </>
              )}
            </div>
            
            <IonButton
              expand="block"
              disabled={loading}
              color={pkg.status ? 'medium' : 'primary'}
              onClick={handlePurchase}
              className="purchase-button"
            >
              <IonIcon slot="start" icon={pkg.status ? checkmarkCircle : lockClosed} />
              {pkg.status ? 'Purchased' : 'Buy Now'}
              <IonIcon slot="end" icon={chevronForward} />
            </IonButton>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};
