import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase.config';
import { Capacitor } from '@capacitor/core';

// Initialize Firebase Auth
const auth = getAuth(app);

export class AuthService {
  
  // Check if running on native platform
  private static isNative() {
    return Capacitor.isNativePlatform();
  }
  
  // Sign up with email and password
  static async signUp(email: string, password: string) {
    try {
      if (this.isNative()) {
        // Use Capacitor Firebase plugin for native
        const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
          email,
          password
        });
        console.log('User signed up (native):', result.user);
        return { success: true, user: result.user };
      } else {
        // Use Firebase SDK for web
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up (web):', result.user);
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    try {
      if (this.isNative()) {
        // Use Capacitor Firebase plugin for native
        const result = await FirebaseAuthentication.signInWithEmailAndPassword({
          email,
          password
        });
        console.log('User signed in (native):', result.user);
        return { success: true, user: result.user };
      } else {
        // Use Firebase SDK for web
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in (web):', result.user);
        return { success: true, user: result.user };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  static async signOut() {
    try {
      if (this.isNative()) {
        await FirebaseAuthentication.signOut();
      } else {
        await signOut(auth);
      }
      console.log('User signed out');
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      if (this.isNative()) {
        const result = await FirebaseAuthentication.getCurrentUser();
        return result.user;
      } else {
        return auth.currentUser;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: any) => void) {
    if (this.isNative()) {
      // For native, we'll use a polling approach or Firebase plugin events
      return FirebaseAuthentication.addListener('authStateChange', (data) => {
        callback(data.user);
      });
    } else {
      return onAuthStateChanged(auth, callback);
    }
  }
}
