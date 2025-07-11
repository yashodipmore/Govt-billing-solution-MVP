import {
  IonButton,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonPage,
  IonPopover,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { APP_NAME, DATA } from "../app-data";
import * as AppGeneral from "../components/socialcalc/index.js";
import { useEffect, useState } from "react";
import { Local, File } from "../components/Storage/LocalStorage";
import { menu, settings } from "ionicons/icons";
import "./Home.css";
import Menu from "../components/Menu/Menu";
import Files from "../components/Files/Files";
import NewFile from "../components/NewFile/NewFile";
import Login from "../components/Auth/Login";
import AuthIcon from "../components/Auth/AuthIcon";
import StorageIcon from "../components/Storage/StorageIcon";

const Home: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPopover, setShowPopover] = useState<{
    open: boolean;
    event: Event | undefined;
  }>({ open: false, event: undefined });
  const [selectedFile, updateSelectedFile] = useState("default");
  const [billType, updateBillType] = useState(1);
  const [device] = useState("default");

  const store = new Local();

  const closeMenu = () => {
    setShowMenu(false);
  };

  const activateFooter = (footer) => {
    AppGeneral.activateFooterButton(footer);
  };

  // Create sample files for testing upload functionality
  const createSampleFiles = async () => {
    try {
      const now = new Date().toISOString();
      
      // Check if sample files already exist
      const existingFiles = await store.getFileList();
      
      if (existingFiles.length === 0) {
        // Create sample files
        const sampleFiles = [
          new File(
            now,
            now,
            "This is a sample electricity bill content.\nCustomer: John Doe\nAmount: $150.00\nDue Date: 2024-02-15",
            "electricity_bill_sample.txt",
            1
          ),
          new File(
            now,
            now,
            "This is a sample water bill content.\nCustomer: Jane Smith\nAmount: $75.50\nDue Date: 2024-02-20",
            "water_bill_sample.txt",
            2
          ),
          new File(
            now,
            now,
            "This is a sample tax document.\nTaxpayer: ABC Corp\nTax Amount: $2,500.00\nFiling Year: 2023",
            "tax_document_sample.txt",
            3
          )
        ];

        for (const file of sampleFiles) {
          await store._saveFile(file);
        }
        
        console.log('Sample files created for testing upload functionality');
      }
    } catch (error) {
      console.error('Error creating sample files:', error);
    }
  };

  useEffect(() => {
    const data = DATA["home"][device]["msc"];
    AppGeneral.initializeApp(JSON.stringify(data));
    // Create sample files for testing
    createSampleFiles();
  }, []);

  useEffect(() => {
    activateFooter(billType);
  }, [billType]);

  const footers = DATA["home"][device]["footers"];
  const footersList = footers.map((footerArray) => {
    return (
      <IonButton
        key={footerArray.index}
        expand="full"
        color="light"
        className="ion-no-margin"
        onClick={() => {
          updateBillType(footerArray.index);
          activateFooter(footerArray.index);
          setShowPopover({ open: false, event: undefined });
        }}
      >
        {footerArray.name}
      </IonButton>
    );
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>{APP_NAME}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonToolbar color="primary">
          <IonIcon
            icon={settings}
            slot="end"
            className="ion-padding-end"
            size="large"
            onClick={(e) => {
              setShowPopover({ open: true, event: e.nativeEvent });
              console.log("Popover clicked");
            }}
          />
          <AuthIcon />
          <StorageIcon />
          <Files
            store={store}
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            updateBillType={updateBillType}
          />

          <NewFile
            file={selectedFile}
            updateSelectedFile={updateSelectedFile}
            store={store}
            billType={billType}
          />
          <IonPopover
            animated
            keyboardClose
            backdropDismiss
            event={showPopover.event}
            isOpen={showPopover.open}
            onDidDismiss={() =>
              setShowPopover({ open: false, event: undefined })
            }
          >
            {footersList}
          </IonPopover>
        </IonToolbar>
        <IonToolbar color="secondary">
          <IonTitle className="ion-text-center">
            Editing : {selectedFile}
          </IonTitle>
        </IonToolbar>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton type="button" onClick={() => setShowMenu(true)}>
            <IonIcon icon={menu} />
          </IonFabButton>
        </IonFab>

        <Menu
          showM={showMenu}
          setM={closeMenu}
          file={selectedFile}
          updateSelectedFile={updateSelectedFile}
          store={store}
          bT={billType}
        />

        <div id="container">
          <div id="workbookControl"></div>
          <div id="tableeditor"></div>
          <div id="msg"></div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
