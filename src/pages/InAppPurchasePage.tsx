import React, { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonActionSheet,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonBadge,
  IonSkeletonText,
  IonToast,
  IonFooter,
  IonSpinner,
} from '@ionic/react';
import { checkmarkCircle, alertCircle, cartOutline, chevronForward } from 'ionicons/icons';
import { InAppPurchaseService } from '../services/InAppPurchaseService';

interface PurchaseItem {
  id: string;
  desc: string;
  price: number;zd
  status: boolean;
  units: number;
  icon: string;
  type: 'PDF' | 'SPECIAL' | 'OTHER';
}

const InAppPurchasePage: React.FC = () => {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PurchaseItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const inapp = new InAppPurchaseService();

  useEffect(() => {
    const initNetworkAndProducts = async () => {
      // Check initial network status
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      
      // Setup network listener
      const unsubscribe = Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
        if (status.connected) {
          // Reload products when network is restored
          setTimeout(() => {
            loadProducts();
            displayItems();
          }, 3000);
        } else {
          setLoaded(false);
          setToastMessage('No network connection. Connect and try again.');
          setShowToast(true);
        }
      });

      // Initial load if online
      if (status.connected) {
        loadProducts();
        displayItems();
      }

      return () => {
        unsubscribe.then(() => {
          console.log('Network listener removed');
        });
      };
    };

    initNetworkAndProducts();
  }, []);

  const loadProducts = async () => {
    try {
      await inapp.loadItems();
      setLoaded(true);
    } catch (error) {
      console.log("Error while loading:", error);
    }
  };

  const displayItems = async () => {
    const displayedItems = await inapp.displayItems();
    setItems(displayedItems);
  };

  const doRefresh = async (event: any) => {
    await displayItems();
    event.detail.complete();
  };

  const showActionForInapp = (item: any) => {
    setSelectedItem(item);
    setShowActionSheet(true);
  };

  const buyItem = async (id: string) => {
    if (isProcessing) {
      setToastMessage('Purchase in progress, please wait...');
      setShowToast(true);
      return;
    }

    // Find the item being purchased
    const itemToBuy = items.find(item => item.id === id);
    if (!itemToBuy) {
      setToastMessage('Item not found');
      setShowToast(true);
      return;
    }

    // Validate purchase before proceeding
    if (!validatePurchase(itemToBuy)) {
      return;
    }
    
    setIsProcessing(true);

    if (!loaded) {
      try {
        await loadProducts();
      } catch (error) {
        setToastMessage('Failed to load products. Please try again.');
        setShowToast(true);
        return;
      }
    }

    try {
      await inapp.purchaseItem(id);
      await handlePurchaseSuccess(itemToBuy);
    } catch (error) {
      handlePurchaseError(error, itemToBuy);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchaseSuccess = async (item: PurchaseItem) => {
    try {
      // Update display after successful purchase
      await displayItems();
      
      // Show different messages based on item type
      if (item.type === 'PDF') {
        setToastMessage(`PDF package activated successfully`);
      } else if (item.type === 'SPECIAL') {
        setToastMessage(`${item.units} units added to your account`);
      } else {
        setToastMessage('Purchase successful');
      }
      setShowToast(true);
    } catch (error) {
      console.error('Error updating items after purchase:', error);
    }
  };

  const handlePurchaseError = (error: any, item: PurchaseItem) => {
    console.error('Purchase failed:', error);
    let errorMessage = 'Purchase failed';

    if (error instanceof Error) {
      if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('already purchased')) {
        errorMessage = 'You already own this item.';
      } else if (error.message.includes('payment')) {
        errorMessage = 'Payment failed. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }

    setToastMessage(errorMessage);
    setShowToast(true);
  };

  const validatePurchase = (item: PurchaseItem): boolean => {
    // Validate network connection first
    if (!isOnline) {
      setToastMessage('No network connection. Please connect and try again.');
      setShowToast(true);
      return false;
    }

    // PDF Package validation
    if (item.desc.includes('PDF')) {
      const hasPurchasedPDF = items.some(i => 
        i.desc.includes('PDF') && i.status === true && i.id !== item.id
      );
      if (hasPurchasedPDF) {
        setToastMessage("You already have an active PDF package");
        setShowToast(true);
        return false;
      }
    }

    // Special package validation (for share/special features)
    if (item.type === 'SPECIAL') {
      const currentUnits = items
        .filter(i => i.type === 'SPECIAL' && i.status)
        .reduce((total, i) => total + i.units, 0);

      if (currentUnits > 30) {
        setToastMessage("Please use your remaining units before purchasing more");
        setShowToast(true);
        return false;
      }
    }

    return true;
  };

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.desc.includes('PDF') ? 'PDF Packages' :
                    item.desc.includes('Share') ? 'Sharing Options' : 'Additional Features';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderSkeletons = () => (
    <IonGrid>
      {[1, 2, 3].map((num) => (
        <IonCard key={num}>
          <IonCardHeader>
            <IonCardTitle>
              <IonSkeletonText animated style={{ width: '70%' }} />
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonSkeletonText animated style={{ width: '90%' }} />
            <IonSkeletonText animated style={{ width: '60%' }} />
          </IonCardContent>
        </IonCard>
      ))}
    </IonGrid>
  );



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>In-app Purchase</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {!loaded ? (
          renderSkeletons()
        ) : (
          Object.entries(groupedItems).map(([category, categoryItems]: [string, any[]]) => (
            <div key={category}>
              <IonItem lines="none" style={{ margin: '10px 0 5px 10px' }}>
                <IonLabel color="primary">
                  <h2>{category}</h2>
                </IonLabel>
              </IonItem>
              <IonGrid>
                <IonRow>
                  {categoryItems.map((item, index) => (
                    <IonCol size="12" sizeMd="6" key={index}>
                      <IonCard>
                        <IonCardHeader>
                          <IonCardTitle>
                            <IonIcon 
                              icon={item.icon} 
                              color={item.status ? 'success' : 'medium'}
                              style={{ marginRight: '8px' }}
                            />
                            {item.desc}
                          </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: '10px' 
                          }}>
                            <div>
                              <h2 style={{ color: 'var(--ion-color-dark)', fontSize: '1.2em', margin: '0' }}>
                                {formatPrice(item.price)}
                              </h2>
                              {item.status && (
                                <div style={{ marginTop: '5px' }}>
                                  <IonBadge 
                                    color={item.units > 3 ? 'success' : 'warning'}
                                    style={{ padding: '8px' }}
                                  >
                                    <IonIcon icon={item.units > 3 ? checkmarkCircle : alertCircle} 
                                            style={{ marginRight: '5px', verticalAlign: 'middle' }}/>
                                    {item.units} units remaining
                                  </IonBadge>
                                </div>
                              )}
                            </div>
                            <IonButton
                              onClick={() => showActionForInapp(item)}
                              color={item.status ? 'success' : 'primary'}
                              disabled={isProcessing}
                            >
                              {isProcessing && selectedItem?.id === item.id ? (
                                <>
                                  <IonSpinner name="crescent" />
                                  &nbsp;Processing...
                                </>
                              ) : (
                                <>
                                  <IonIcon slot="start" icon={item.status ? cartOutline : chevronForward} />
                                  {item.status ? 'Buy More' : 'Purchase'}
                                </>
                              )}
                            </IonButton>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </div>
          ))
        )}

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Confirm Purchase',
              role: 'destructive',
              handler: () => {
                if (selectedItem) {
                  buyItem(selectedItem.id);
                }
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>

      {!loaded && (
        <IonFooter>
          <IonToolbar>
            <div style={{ textAlign: 'center' }}>
              <IonLabel>
                <IonSpinner /> &nbsp;Loading products...
              </IonLabel>
            </div>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default InAppPurchasePage;
