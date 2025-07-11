import React, { useState, useEffect } from 'react';
import {
  IonIcon,
  IonPopover,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { 
  person, 
  personOutline, 
  logOutOutline, 
  mailOutline, 
  lockClosedOutline,
  checkmarkCircle 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

const AuthIcon: React.FC = () => {
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({ open: false, event: undefined });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen to auth state changes
    let unsubscribe: any;
    
    const setupAuthListener = async () => {
      unsubscribe = await AuthService.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
      });
    };
    
    setupAuthListener();
    
    return () => {
      if (unsubscribe) {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        } else if (unsubscribe.remove) {
          unsubscribe.remove();
        }
      }
    };
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      setToastMessage('Please enter email and password');
      setShowToast(true);
      return;
    }

    const result = await AuthService.signIn(email, password);
    if (result.success) {
      setToastMessage('Sign in successful!');
      setShowPopover({ open: false, event: undefined });
      setEmail('');
      setPassword('');
    } else {
      setToastMessage(`Sign in failed: ${result.error}`);
    }
    setShowToast(true);
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setToastMessage('Please enter email and password');
      setShowToast(true);
      return;
    }

    const result = await AuthService.signUp(email, password);
    if (result.success) {
      setToastMessage('Account created successfully!');
      setEmail('');
      setPassword('');
    } else {
      setToastMessage(`Sign up failed: ${result.error}`);
    }
    setShowToast(true);
  };

  const handleSignOut = async () => {
    const result = await AuthService.signOut();
    if (result.success) {
      setToastMessage('Signed out successfully');
      setShowPopover({ open: false, event: undefined });
    } else {
      setToastMessage('Sign out failed');
    }
    setShowToast(true);
  };

  return (
    <>
      <IonIcon
        icon={user ? person : personOutline}
        slot="end"
        className="ion-padding-end"
        size="large"
        color={user ? "success" : "light"}
        onClick={(e) => {
          setShowPopover({ open: true, event: e.nativeEvent });
        }}
        style={{ cursor: 'pointer', position: 'relative' }}
      />
      
      {user && (
        <IonIcon
          icon={checkmarkCircle}
          color="success"
          size="small"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'white',
            borderRadius: '50%',
            fontSize: '12px'
          }}
        />
      )}

      <IonPopover
        animated
        keyboardClose
        backdropDismiss
        event={showPopover.event}
        isOpen={showPopover.open}
        onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
      >
        <IonCard style={{ margin: 0, maxWidth: '400px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <IonCardHeader style={{ paddingBottom: '10px' }}>
            <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={person} color="success" />
                  Welcome Back
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={personOutline} color="primary" />
                  Sign In
                </div>
              )}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ paddingTop: '0' }}>
            {!user ? (
              <>
                <IonItem style={{ '--border-radius': '8px', marginBottom: '12px', '--min-height': '56px' }}>
                  <IonIcon icon={mailOutline} slot="start" color="medium" />
                  <IonLabel position="floating">Email Address</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onIonInput={(e) => setEmail(e.detail.value!)}
                  />
                </IonItem>
                
                <IonItem style={{ '--border-radius': '8px', marginBottom: '24px', '--min-height': '56px' }}>
                  <IonIcon icon={lockClosedOutline} slot="start" color="medium" />
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onIonInput={(e) => setPassword(e.detail.value!)}
                  />
                </IonItem>
                
                <IonGrid style={{ padding: '0' }}>
                  <IonRow>
                    <IonCol>
                      <IonButton 
                        expand="block" 
                        onClick={handleSignIn}
                        style={{ '--border-radius': '8px', height: '48px', fontSize: '16px' }}
                      >
                        Sign In
                      </IonButton>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <IonButton 
                        expand="block" 
                        fill="outline" 
                        onClick={handleSignUp}
                        style={{ '--border-radius': '8px', height: '48px', fontSize: '16px' }}
                      >
                        Create Account
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'var(--ion-color-light)', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '16px' 
                }}>
                  <IonIcon 
                    icon={person} 
                    color="success" 
                    style={{ fontSize: '2rem', marginBottom: '8px' }} 
                  />
                  <IonText>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--ion-color-medium)' }}>
                      Signed in as
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontWeight: '600', fontSize: '1rem' }}>
                      {user.email}
                    </p>
                  </IonText>
                </div>
                
                <IonButton
                  expand="block"
                  fill="outline"
                  color="danger"
                  onClick={handleSignOut}
                  style={{ '--border-radius': '8px', height: '48px', fontSize: '16px' }}
                >
                  <IonIcon icon={logOutOutline} slot="start" />
                  Sign Out
                </IonButton>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      </IonPopover>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
      />
    </>
  );
};

export default AuthIcon;
