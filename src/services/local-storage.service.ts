// Local Storage Service for testing without Firebase billing
export class LocalStorageService {
  
  // Store file as base64 in localStorage
  static async uploadFile(path: string, file: File | Blob, fileName?: string) {
    try {
      const finalFileName = fileName || `file_${Date.now()}`;
      const fullPath = `${path}/${finalFileName}`;
      
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);
      
      // Store in localStorage with metadata
      const fileData = {
        name: finalFileName,
        path: fullPath,
        data: base64Data,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      
      // Get existing files
      const existingFiles = this.getStoredFiles();
      existingFiles[fullPath] = fileData;
      
      // Store back
      localStorage.setItem('govt_billing_files', JSON.stringify(existingFiles));
      
      console.log('File stored locally:', fullPath);
      return { 
        success: true, 
        downloadURL: `local://${fullPath}`, 
        path: fullPath 
      };
    } catch (error: any) {
      console.error('Local storage error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get download URL (base64 data URL)
  static async getDownloadURL(path: string) {
    try {
      const files = this.getStoredFiles();
      const file = files[path];
      
      if (!file) {
        throw new Error('File not found');
      }
      
      return { 
        success: true, 
        downloadURL: `data:${file.type};base64,${file.data}` 
      };
    } catch (error: any) {
      console.error('Get local file error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Delete file from localStorage
  static async deleteFile(path: string) {
    try {
      const files = this.getStoredFiles();
      delete files[path];
      localStorage.setItem('govt_billing_files', JSON.stringify(files));
      
      console.log('File deleted locally:', path);
      return { success: true };
    } catch (error: any) {
      console.error('Delete local file error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // List all stored files
  static async listFiles(path: string) {
    try {
      const files = this.getStoredFiles();
      const filteredFiles = Object.keys(files)
        .filter(filePath => filePath.startsWith(path))
        .map(filePath => ({
          name: files[filePath].name,
          fullPath: filePath,
          size: files[filePath].size,
          type: files[filePath].type,
          uploadDate: files[filePath].uploadDate
        }));
      
      return { success: true, files: filteredFiles };
    } catch (error: any) {
      console.error('List local files error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all stored files from localStorage
  private static getStoredFiles(): any {
    try {
      const stored = localStorage.getItem('govt_billing_files');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading stored files:', error);
      return {};
    }
  }
  
  // Convert file to base64
  private static async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:*/*;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
  
  // Get storage usage info
  static getStorageInfo() {
    try {
      const files = this.getStoredFiles();
      const fileCount = Object.keys(files).length;
      
      let totalSize = 0;
      Object.values(files).forEach((file: any) => {
        if (file && typeof file.size === 'number') {
          totalSize += file.size;
        }
      });
      
      return {
        fileCount,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize)
      };
    } catch (error) {
      return { fileCount: 0, totalSize: 0, totalSizeFormatted: '0 Bytes' };
    }
  }
  
  // Format bytes to human readable
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
