import { FirebaseStorage } from '@capacitor-firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { app } from '../firebase.config';
import { Capacitor } from '@capacitor/core';
import { LocalStorageService } from './local-storage.service';
import { FirestoreService, FileMetadata } from './firestore.service';
import { AuthService } from './auth.service';

// Initialize Firebase Storage
const storage = getStorage(app);

export class StorageService {
  
  // Check if running on native platform
  private static isNative() {
    return Capacitor.isNativePlatform();
  }
  
  // Use local storage fallback for now (due to Firebase billing requirement)
  private static useLocalStorage = true; // Set to false when Firebase billing is enabled
  
  // Upload file with metadata tracking
  static async uploadFile(path: string, file: File | Blob, fileName?: string, billType: number = 1) {
    try {
      const finalFileName = fileName || `file_${Date.now()}`;
      const fullPath = `${path}/${finalFileName}`;
      let uploadResult;
      
      // Use local storage as fallback
      if (this.useLocalStorage) {
        console.log('Using local storage (Firebase billing required for cloud storage)');
        uploadResult = await LocalStorageService.uploadFile(path, file, fileName);
      } else {
        if (this.isNative()) {
          // For native platforms, use simpler approach for now
          console.log('Native file upload not fully implemented yet');
          return { success: false, error: 'Native upload not implemented' };
        } else {
          // Use Firebase SDK for web
          const storageRef = ref(storage, fullPath);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log('File uploaded (web):', downloadURL);
          uploadResult = { success: true, downloadURL, path: fullPath };
        }
      }
      
      // Save metadata to Firestore if upload was successful
      if (uploadResult.success) {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser && currentUser.uid) {
          const metadata: FileMetadata = {
            fileName: finalFileName,
            fileSize: file.size || 0,
            uploadDate: new Date().toISOString(),
            userId: currentUser.uid,
            contentType: file.type || 'application/octet-stream',
            storageUrl: uploadResult.downloadURL || `local://${fullPath}`,
            billType: billType,
            isLocal: this.useLocalStorage
          };
          
          const metadataResult = await FirestoreService.saveFileMetadata(metadata);
          if (metadataResult.success) {
            console.log('File metadata saved to Firestore:', metadataResult.id);
            return {
              ...uploadResult,
              metadataId: metadataResult.id
            };
          } else {
            console.warn('Failed to save metadata:', metadataResult.error);
          }
        }
      }
      
      return uploadResult;
    } catch (error: any) {
      console.error('Upload error:', error);
      // Fallback to local storage on error
      if (!this.useLocalStorage) {
        console.log('Firebase upload failed, falling back to local storage');
        return await LocalStorageService.uploadFile(path, file, fileName);
      }
      return { success: false, error: error.message };
    }
  }
  
  // Download file URL
  static async getDownloadURL(path: string) {
    try {
      if (this.useLocalStorage || path.startsWith('local://')) {
        const localPath = path.replace('local://', '');
        return await LocalStorageService.getDownloadURL(localPath);
      }
      
      if (this.isNative()) {
        const result = await FirebaseStorage.getDownloadUrl({ path });
        return { success: true, downloadURL: result.downloadUrl };
      } else {
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        return { success: true, downloadURL };
      }
    } catch (error: any) {
      console.error('Get download URL error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete file
  static async deleteFile(path: string) {
    try {
      if (this.useLocalStorage || path.startsWith('local://')) {
        const localPath = path.replace('local://', '');
        return await LocalStorageService.deleteFile(localPath);
      }
      
      if (this.isNative()) {
        await FirebaseStorage.deleteFile({ path });
        console.log('File deleted (native):', path);
      } else {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        console.log('File deleted (web):', path);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // List files in a directory
  static async listFiles(path: string) {
    try {
      if (this.useLocalStorage) {
        return await LocalStorageService.listFiles(path);
      }
      
      if (this.isNative()) {
        console.log('Native list files not implemented yet');
        return { success: false, error: 'Native list not implemented' };
      } else {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);
        const files = result.items.map(item => ({
          name: item.name,
          fullPath: item.fullPath
        }));
        return { success: true, files };
      }
    } catch (error: any) {
      console.error('List files error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Enable Firebase Storage (call this after setting up billing)
  static enableFirebaseStorage() {
    this.useLocalStorage = false;
    console.log('Firebase Storage enabled');
  }
  
  // Get storage info
  static getStorageInfo() {
    if (this.useLocalStorage) {
      return {
        ...LocalStorageService.getStorageInfo(),
        storageType: 'Local Storage (Temporary)',
        note: 'Files stored locally. Enable Firebase billing for cloud storage.'
      };
    }
    return {
      storageType: 'Firebase Cloud Storage',
      note: 'Files stored in Firebase Cloud Storage'
    };
  }
  
  // Upload invoice/bill file
  static async uploadInvoice(file: File, invoiceId: string, billType: number = 1) {
    const path = `invoices/${invoiceId}`;
    return await this.uploadFile(path, file, `invoice_${invoiceId}.pdf`, billType);
  }
  
  // Upload user profile image
  static async uploadProfileImage(file: File, userId: string) {
    const path = `profiles/${userId}`;
    const fileName = `profile_${userId}_${Date.now()}.jpg`;
    return await this.uploadFile(path, file, fileName);
  }

  // Get user's uploaded files from Firestore
  static async getUserFiles() {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser || !currentUser.uid) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await FirestoreService.getUserFiles(currentUser.uid);
      return result;
    } catch (error: any) {
      console.error('Error getting user files:', error);
      return { success: false, error: error.message };
    }
  }

  // Get files by bill type
  static async getFilesByBillType(billType: number) {
    try {
      const result = await FirestoreService.getFilesByBillType(billType);
      return result;
    } catch (error: any) {
      console.error('Error getting files by bill type:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete file and its metadata
  static async deleteFileWithMetadata(path: string, metadataId?: string) {
    try {
      // Delete from storage
      const deleteResult = await this.deleteFile(path);
      
      // Delete metadata from Firestore
      if (metadataId && deleteResult.success) {
        const metadataResult = await FirestoreService.deleteFileMetadata(metadataId);
        if (!metadataResult.success) {
          console.warn('Failed to delete metadata:', metadataResult.error);
        }
      }
      
      return deleteResult;
    } catch (error: any) {
      console.error('Error deleting file with metadata:', error);
      return { success: false, error: error.message };
    }
  }
}
