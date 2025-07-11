import React, { useState, useEffect } from 'react';
import {
  IonIcon,
  IonPopover,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonCheckbox,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { 
  cloudUploadOutline, 
  documentOutline, 
  checkmarkCircle,
  cloudDoneOutline 
} from 'ionicons/icons';
import { Local } from '../Storage/LocalStorage';
import { StorageService } from '../../services/storage.service';

const StorageIcon: React.FC = () => {
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({ open: false, event: undefined });
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const store = new Local();

  useEffect(() => {
    // Load saved files when popover opens
    if (showPopover.open) {
      loadSavedFiles();
    }
  }, [showPopover.open]);

  const loadSavedFiles = async () => {
    try {
      // Get all saved file names from localStorage
      const files = await store.getFileList();
      setSavedFiles(files);
      console.log('Loaded saved files:', files);
    } catch (error) {
      console.error('Error loading saved files:', error);
      setToastMessage('Error loading saved files');
      setShowToast(true);
    }
  };

  const handleFileSelection = (fileName: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileName]);
    } else {
      setSelectedFiles(prev => prev.filter(f => f !== fileName));
    }
  };

  const handleUploadSelected = async () => {
    if (selectedFiles.length === 0) {
      setToastMessage('Please select files to upload');
      setShowToast(true);
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const fileName of selectedFiles) {
        try {
          // Get file content from localStorage
          const fileContent = await store.getFileContent(fileName);
          
          if (fileContent) {
            // Get file info to determine bill type
            const fileData = await store._getFile(fileName);
            const billType = fileData?.billType || 1;
            
            // Convert content to blob for upload
            const blob = new Blob([fileContent], { type: 'text/plain' });
            
            // Upload to cloud storage with metadata
            const result = await StorageService.uploadFile(
              'app-files',
              blob,
              fileName,
              billType
            );

            if (result.success) {
              successCount++;
              console.log(`File ${fileName} uploaded successfully`, result.metadataId ? `with metadata ID: ${result.metadataId}` : '');
              console.log(`Uploaded: ${fileName}`);
            } else {
              failCount++;
              console.error(`Failed to upload ${fileName}:`, result.error);
            }
          } else {
            failCount++;
            console.error(`File content not found: ${fileName}`);
          }
        } catch (error) {
          failCount++;
          console.error(`Error uploading ${fileName}:`, error);
        }
      }

      // Show results
      if (successCount > 0 && failCount === 0) {
        setToastMessage(`Successfully uploaded ${successCount} files`);
      } else if (successCount > 0 && failCount > 0) {
        setToastMessage(`Uploaded ${successCount} files, ${failCount} failed`);
      } else {
        setToastMessage(`Upload failed for all ${failCount} files`);
      }
      
      // Clear selection
      setSelectedFiles([]);
      
    } catch (error: any) {
      setToastMessage(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      setShowToast(true);
    }
  };

  const selectAll = () => {
    setSelectedFiles([...savedFiles]);
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  return (
    <>
      <IonIcon
        icon={cloudUploadOutline}
        slot="end"
        className="ion-padding-end"
        size="large"
        color="light"
        onClick={(e) => {
          setShowPopover({ open: true, event: e.nativeEvent });
        }}
        style={{ cursor: 'pointer' }}
      />

      <IonPopover
        animated
        keyboardClose
        backdropDismiss
        event={showPopover.event}
        isOpen={showPopover.open}
        onDidDismiss={() => setShowPopover({ open: false, event: undefined })}
      >
        <IonCard style={{ margin: 0, maxWidth: '450px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <IonCardHeader style={{ paddingBottom: '10px' }}>
            <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={cloudUploadOutline} color="primary" />
                Upload Saved Files
              </div>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ paddingTop: '0' }}>
            {savedFiles.length > 0 ? (
              <>
                {/* Selection Controls */}
                <IonGrid style={{ padding: '0', marginBottom: '16px' }}>
                  <IonRow>
                    <IonCol size="6">
                      <IonButton 
                        fill="outline" 
                        size="small" 
                        expand="block"
                        onClick={selectAll}
                        disabled={uploading}
                      >
                        Select All
                      </IonButton>
                    </IonCol>
                    <IonCol size="6">
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        expand="block"
                        onClick={clearSelection}
                        disabled={uploading}
                      >
                        Clear
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                {/* Files List */}
                <IonList style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {savedFiles.map((fileName, index) => (
                    <IonItem key={index} style={{ '--border-radius': '8px', marginBottom: '4px' }}>
                      <IonCheckbox
                        slot="start"
                        checked={selectedFiles.includes(fileName)}
                        onIonChange={(e) => handleFileSelection(fileName, e.detail.checked)}
                        disabled={uploading}
                      />
                      <IonIcon icon={documentOutline} slot="start" color="medium" style={{ marginLeft: '8px' }} />
                      <IonLabel>
                        <h3 style={{ fontSize: '14px', margin: '0' }}>{fileName}</h3>
                        <p style={{ fontSize: '12px', margin: '0', color: 'var(--ion-color-medium)' }}>
                          Saved invoice/bill
                        </p>
                      </IonLabel>
                      {selectedFiles.includes(fileName) && (
                        <IonIcon icon={checkmarkCircle} slot="end" color="success" />
                      )}
                    </IonItem>
                  ))}
                </IonList>

                {/* Upload Button */}
                <div style={{ marginTop: '16px' }}>
                  <IonText>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                      Selected: {selectedFiles.length} of {savedFiles.length} files
                    </p>
                  </IonText>
                  <IonButton
                    expand="block"
                    onClick={handleUploadSelected}
                    disabled={selectedFiles.length === 0 || uploading}
                    style={{ '--border-radius': '8px', height: '48px', fontSize: '16px' }}
                  >
                    <IonIcon icon={uploading ? cloudDoneOutline : cloudUploadOutline} slot="start" />
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
                  </IonButton>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon 
                  icon={documentOutline} 
                  color="medium" 
                  style={{ fontSize: '3rem', marginBottom: '16px' }} 
                />
                <IonText>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--ion-color-medium)' }}>
                    No Saved Files
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                    Create some invoices or bills first, then upload them to cloud storage.
                  </p>
                </IonText>
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

export default StorageIcon;
