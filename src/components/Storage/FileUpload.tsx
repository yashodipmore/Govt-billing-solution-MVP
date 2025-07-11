import React, { useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonProgressBar,
  IonToast,
  IonText,
  IonIcon,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { cloudUploadOutline, documentOutline, checkmarkCircle } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';

interface FileUploadProps {
  userId?: string;
  onUploadComplete?: (downloadURL: string, filePath: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ userId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{url: string, name: string, path: string}>>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name, file.type, file.size);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setToastMessage('Please select a file first');
      setShowToast(true);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await StorageService.uploadFile(
        'documents',
        selectedFile,
        `${Date.now()}_${selectedFile.name}`
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setToastMessage('File uploaded successfully!');
        
        // Add to uploaded files list
        const newFile = {
          url: result.downloadURL!,
          name: selectedFile.name,
          path: result.path!
        };
        setUploadedFiles(prev => [...prev, newFile]);
        
        // Reset form
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        // Callback to parent component
        if (onUploadComplete) {
          onUploadComplete(result.downloadURL!, result.path!);
        }
      } else {
        setToastMessage(`Upload failed: ${result.error}`);
      }
    } catch (error: any) {
      setToastMessage(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setShowToast(true);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IonIcon icon={cloudUploadOutline} color="primary" />
            File Upload
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* File Selection */}
          <div style={{ marginBottom: '16px' }}>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed var(--ion-color-medium)',
                borderRadius: '8px',
                backgroundColor: 'var(--ion-color-light)',
                cursor: 'pointer'
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <IonItem style={{ '--border-radius': '8px', marginBottom: '16px' }}>
              <IonIcon icon={documentOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>{selectedFile.name}</h3>
                <p>{formatFileSize(selectedFile.size)} • {selectedFile.type}</p>
              </IonLabel>
            </IonItem>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginBottom: '16px' }}>
              <IonText>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                  Uploading... {uploadProgress}%
                </p>
              </IonText>
              <IonProgressBar value={uploadProgress / 100} color="primary" />
            </div>
          )}

          {/* Upload Button */}
          <IonButton
            expand="block"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{ '--border-radius': '8px', height: '48px' }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </IonButton>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <IonText>
                <h4 style={{ margin: '0 0 16px 0', color: 'var(--ion-color-primary)' }}>
                  Uploaded Files
                </h4>
              </IonText>
              {uploadedFiles.map((file, index) => (
                <IonItem 
                  key={index} 
                  button 
                  onClick={() => handleDownload(file.url, file.name)}
                  style={{ '--border-radius': '8px', marginBottom: '8px' }}
                >
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>{file.name}</h3>
                    <p>Click to download</p>
                  </IonLabel>
                </IonItem>
              ))}
            </div>
          )}
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

export default FileUpload;
