import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
} from '@ionic/react';
import { AuthService } from '../../services/auth.service';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) {
      setToastMessage('Please enter email and password');
      setShowToast(true);
      return;
    }

    const result = await AuthService.signIn(email, password);
    if (result.success) {
      setToastMessage('Sign in successful!');
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
    } else {
      setToastMessage(`Sign up failed: ${result.error}`);
    }
    setShowToast(true);
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Firebase Authentication Test</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>
          
          <div style={{ marginTop: '20px' }}>
            <IonButton expand="block" onClick={handleSignIn}>
              Sign In
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={handleSignUp}>
              Create Account
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
      />
    </>
  );
};

export default Login;
