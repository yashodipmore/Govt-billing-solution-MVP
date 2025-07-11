import { Capacitor } from '@capacitor/core';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';

// Web imports
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase.config';

export interface FileMetadata {
  id?: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  userId: string;
  contentType: string;
  storageUrl?: string;
  billType: number;
  isLocal: boolean;
}

export interface UserProfile {
  id?: string;
  email: string;
  displayName?: string;
  department?: string;
  role?: string;
  createdAt: string;
  lastLogin: string;
}

export class FirestoreService {
  private static isNative = Capacitor.isNativePlatform();

  // File Metadata Operations
  static async saveFileMetadata(metadata: FileMetadata): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform - simplified for Capacitor 5
        const result = await FirebaseFirestore.addDocument({
          reference: 'file_metadata',
          data: metadata
        });
        return { success: true, id: result.reference.id };
      } else {
        // Web platform
        const docRef = await addDoc(collection(db, 'file_metadata'), metadata);
        return { success: true, id: docRef.id };
      }
    } catch (error) {
      console.error('Error saving file metadata:', error);
      return { success: false, error: error.message };
    }
  }

  static async getFileMetadata(fileId: string): Promise<{ success: boolean; data?: FileMetadata; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform - simplified for Capacitor 5
        const result = await FirebaseFirestore.getDocument({
          reference: `file_metadata/${fileId}`
        });
        return { success: true, data: result.snapshot?.data as FileMetadata };
      } else {
        // Web platform
        const docRef = doc(db, 'file_metadata', fileId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { success: true, data: { id: docSnap.id, ...docSnap.data() } as FileMetadata };
        } else {
          return { success: false, error: 'File not found' };
        }
      }
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserFiles(userId: string): Promise<{ success: boolean; files?: FileMetadata[]; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform - simplified collection get
        const result = await FirebaseFirestore.getCollection({
          reference: 'file_metadata'
        });
        // Filter manually for Capacitor 5 compatibility
        const userFiles = result.snapshots
          .filter(snap => snap.data.userId === userId)
          .map(snap => ({ id: snap.id, ...snap.data })) as FileMetadata[];
        return { success: true, files: userFiles };
      } else {
        // Web platform
        const q = query(
          collection(db, 'file_metadata'), 
          where('userId', '==', userId),
          orderBy('uploadDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FileMetadata[];
        return { success: true, files };
      }
    } catch (error) {
      console.error('Error getting user files:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteFileMetadata(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform
        await FirebaseFirestore.deleteDocument({
          reference: `file_metadata/${fileId}`
        });
      } else {
        // Web platform
        await deleteDoc(doc(db, 'file_metadata', fileId));
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting file metadata:', error);
      return { success: false, error: error.message };
    }
  }

  // User Profile Operations
  static async saveUserProfile(profile: UserProfile): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform
        const result = await FirebaseFirestore.addDocument({
          reference: 'user_profiles',
          data: profile
        });
        return { success: true, id: result.reference.id };
      } else {
        // Web platform
        const docRef = await addDoc(collection(db, 'user_profiles'), profile);
        return { success: true, id: docRef.id };
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserProfile(userId: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform
        const result = await FirebaseFirestore.getDocument({
          reference: `user_profiles/${userId}`
        });
        return { success: true, profile: result.snapshot?.data as UserProfile };
      } else {
        // Web platform
        const docRef = doc(db, 'user_profiles', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { success: true, profile: { id: docSnap.id, ...docSnap.data() } as UserProfile };
        } else {
          return { success: false, error: 'Profile not found' };
        }
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform
        await FirebaseFirestore.updateDocument({
          reference: `user_profiles/${userId}`,
          data: updates
        });
      } else {
        // Web platform
        const docRef = doc(db, 'user_profiles', userId);
        await updateDoc(docRef, updates);
      }
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics and Reporting
  static async getFilesByBillType(billType: number): Promise<{ success: boolean; files?: FileMetadata[]; error?: string }> {
    try {
      if (this.isNative) {
        // Native platform - simplified collection get with manual filtering
        const result = await FirebaseFirestore.getCollection({
          reference: 'file_metadata'
        });
        const filteredFiles = result.snapshots
          .filter(snap => snap.data.billType === billType)
          .map(snap => ({ id: snap.id, ...snap.data })) as FileMetadata[];
        return { success: true, files: filteredFiles };
      } else {
        // Web platform
        const q = query(
          collection(db, 'file_metadata'), 
          where('billType', '==', billType),
          orderBy('uploadDate', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FileMetadata[];
        return { success: true, files };
      }
    } catch (error) {
      console.error('Error getting files by bill type:', error);
      return { success: false, error: error.message };
    }
  }
}
