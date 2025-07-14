import { Preferences } from '@capacitor/preferences';
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2';
import { isPlatform } from '@ionic/react';

// Product IDs
export const PDF_10 = "2014inv10Pdf";
export const PDF_25 = "2014inv25Pdf"; 
export const PDF_50 = "2014inv50Pdf";
export const PDF_100 = "2014inv100Pdf";
export const FB_10 = "2015inv10fb";
export const TW_10 = "2015inv10tw";
export const WA_10 = "2015inv10wa";
export const SMS_10 = "2015inv10sms";
export const SAVE_PDF = "2015inv10save";
export const CLOUD_SAVE = "2015invCloud";
export const SPE_10 = "2015invSavePrintEmail";
export const SPE_500 = "2015inv500SavePrintEmail";
export const SPE_1000 = "2015inv1000SavePrintEmail";

// Product definitions array
export const INAPP_ITEMS = [
  PDF_10, PDF_25, PDF_50, PDF_100, FB_10, TW_10, 
  WA_10, SMS_10, SAVE_PDF, CLOUD_SAVE, SPE_10, SPE_500, SPE_1000
];

// Initial local data structure
export const INAPPLOCAL: InAppProduct[] = [
  {"Feature": "10Pdf", "Id": PDF_10, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "25Pdf", "Id": PDF_25, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "50Pdf", "Id": PDF_50, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "100Pdf", "Id": PDF_100, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "10Fb", "Id": FB_10, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "10Tw", "Id": TW_10, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "10Wa", "Id": WA_10, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "10Sms", "Id": SMS_10, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "10iBooks", "Id": SAVE_PDF, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "email-print-save", "Id": SPE_10, "Purchase":"Yes", "Consumed": 0, "Own": 10},
  {"Feature": "email-second-print-save", "Id": SPE_500, "Purchase":"No", "Consumed": 0, "Own": 0},
  {"Feature": "email-third-print-save", "Id": SPE_1000, "Purchase":"No", "Consumed": 0, "Own": 0}
] as const;

export const CLOUDINAPP: InAppProduct[] = [
  {"Feature": "save", "Id": CLOUD_SAVE, "Purchase":"Yes", "Consumed": 0, "Own": 5}
] as const;

export interface InAppProduct {
  Feature: string;
  Id: string;
  Purchase: "Yes" | "No";
  Consumed: number;
  Own: number;
}

export class InAppPurchaseService {
  private store: typeof InAppPurchase2;
  private isStoreReady = false;
  private purchaseCallbacks: { [key: string]: (success: boolean) => void } = {};

  constructor() {
    this.store = InAppPurchase2;
    
    if (isPlatform('hybrid')) {
      this.initializeStore().catch(err => {
        console.error('Failed to initialize store:', err);
      });
    }
  }

  private async initializeStore(): Promise<void> {
    try {
      // Enable debug logs in development
      this.store.verbosity = this.store.DEBUG;

      // Register all products
      INAPP_ITEMS.forEach(productId => {
        this.store.register({
          id: productId,
          type: this.store.CONSUMABLE
        });
      });

      // Setup purchase handling
      this.store.when('product')
        .approved((product: IAPProduct) => {
          return this.handleApproved(product);
        })
        .verified((product: IAPProduct) => {
          return this.handleVerified(product);
        })
        .finished((product: IAPProduct) => {
          this.handleFinished(product);
        })
        .cancelled((product: IAPProduct) => {
          console.log('Purchase was cancelled', product);
          this.purchaseCallbacks[product.id]?.(false);
        })
        .error((err) => {
          console.error('Store error', err);
        });

      // Initialize the store
      await this.store.ready(() => {
        this.isStoreReady = true;
        console.log('Store is ready');
        this.store.refresh();
      });
    } catch (error) {
      console.error('Store initialization failed', error);
      throw error;
    }
  }

  private async handleApproved(product: IAPProduct): Promise<void> {
    try {
      // First verify the purchase
      product.verify();
      
      // Handle the purchase success
      await this._handlePurchaseSuccess(product.id);
      
      // Mark the product as finished (consumed)
      return product.finish();
    } catch (err) {
      console.error('Error in purchase approval', err);
      throw err;
    }
  }

  private async handleVerified(product: IAPProduct): Promise<void> {
    console.log('Purchase was verified', product);
    this.purchaseCallbacks[product.id]?.(true);
  }

  private handleFinished(product: IAPProduct): void {
    console.log('Purchase was finished', product);
  }

  async loadItems(): Promise<void> {
    if (!isPlatform('hybrid')) {
      return Promise.resolve();
    }

    if (!this.isStoreReady) {
      await this.store.ready(() => {
        this.isStoreReady = true;
      });
    }
    await this.store.refresh();
  }

  async setInappItems(items: InAppProduct[]) {
    await Preferences.set({
      key: 'inapplocal',
      value: JSON.stringify(items)
    });
  }

  async getInappItems(): Promise<InAppProduct[]> {
    const result = await Preferences.get({ key: 'inapplocal' });
    if (!result.value) {
      await this.setInappItems(INAPPLOCAL);
      return INAPPLOCAL;
    }
    return JSON.parse(result.value);
  }

  async setCloudItem(item: InAppProduct) {
    await Preferences.set({
      key: 'cloudInapp',
      value: JSON.stringify(item)
    });
  }

  async getCloudItem() {
    const result = await Preferences.get({ key: 'cloudInapp' });
    if (!result.value) {
      await this.setInappItems(CLOUDINAPP);
      return CLOUDINAPP;
    }
    return JSON.parse(result.value);
  }

  async purchaseItem(id: string): Promise<boolean> {
    if (!isPlatform('hybrid')) {
      return Promise.reject('In-app purchases are only available on mobile devices');
    }

    if (!this.isStoreReady) {
      throw new Error('Store not ready');
    }

    return new Promise((resolve, reject) => {
      try {
        // Set callback for this purchase
        this.purchaseCallbacks[id] = (success: boolean) => {
          if (success) {
            resolve(true);
          } else {
            reject(new Error('Purchase cancelled'));
          }
          delete this.purchaseCallbacks[id];
        };

        // Order the product
        const product = this.store.get(id);
        if (!product) {
          throw new Error('Product not found');
        }
        this.store.order(id);
      } catch (error) {
        reject(error);
      }
    });
  }

  async displayItems() {
    const items = await this.getInappItems();
    const displayItems = [];

    for (const item of items) {
      let desc = '';
      let price = 0;
      let icon = '';
      let status = false;
      const units = item.Own - item.Consumed;

      switch(item.Feature) {
        case "10Pdf":
          desc = 'Send 10 PDFs';
          price = 0.99;
          icon = 'document';
          break;
        case "25Pdf":
          desc = 'Send 25 PDFs';
          price = 1.99;
          icon = 'document';
          break;
        case "50Pdf":
          desc = 'Send 50 PDFs';
          price = 2.99;
          icon = 'document';
          break;
        case "100Pdf":
          desc = 'Send 100 PDFs';
          price = 3.99;
          icon = 'document';
          break;
        case "10Fb":
          desc = 'Share 10 PDFs via Facebook';
          price = 0.99;
          icon = 'logo-facebook';
          break;
        case "10Tw":
          desc = 'Share 10 PDFs via Twitter';
          price = 0.99;
          icon = 'logo-twitter';
          break;
        case "10Wa":
          desc = 'Share 10 PDFs via WhatsApp';
          price = 0.99;
          icon = 'logo-whatsapp';
          break;
        case "10Sms":
          desc = 'Share 10 PDFs via SMS';
          price = 0.99;
          icon = 'mail';
          break;
        case "email-print-save":
          desc = '10 times Email, Print and Save as';
          price = 0.99;
          icon = 'more';
          break;
        case "email-second-print-save":
          desc = '500 times Email, Print and Save as';
          price = 3.99;
          icon = 'more';
          break;
        case "email-third-print-save":
          desc = '1000 times Email, Print and Save as';
          price = 6.99;
          icon = 'more';
          break;
      }

      if (units > 0 && item.Purchase === 'Yes') {
        status = true;
      }

      if (item.Feature !== "10iBooks") {
        displayItems.push({
          name: item.Feature,
          units: units,
          id: item.Id,
          desc: desc,
          price: price,
          icon: icon,
          status: status
        });
      }
    }

    return displayItems;
  }

  async incrementCounter(index: number) {
    const products = await this.getInappItems();
    let consumed = products[index].Consumed;
    consumed++;
    
    if (consumed == products[index].Own) {
      products[index].Purchase = 'No';
      products[index].Consumed = 0;
      products[index].Own = 0;
    } else {
      products[index].Consumed = consumed;
    }

    const left = products[index].Own - products[index].Consumed;
    await this.setInappItems(products);
    return left;
  }

  async isPDFAvailable() {
    const products = await this.getInappItems();
    for (let i = 0; i < 4; i++) {
      if (products[i].Purchase === 'Yes') {
        const units = products[i].Own - products[i].Consumed;
        if (units > 0) return true;
      }
    }
    return false;
  }

  async isSavePrintEmailAvailable() {
    const products = await this.getInappItems();
    for (let i = 9; i <= 11; i++) {
      if (products[i].Purchase === 'Yes') {
        const units = products[i].Own - products[i].Consumed;
        if (units > 0) return true;
      }
    }
    return false;
  }

  private async _handlePurchaseSuccess(id: string) {
    const products = await this.getInappItems();
    
    // Find the product index
    const index = products.findIndex(p => p.Id === id);
    if (index === -1) return;

    // Update the product
    products[index].Purchase = "Yes";
    
    // Add units based on product type
    switch(products[index].Feature) {
      case "10Pdf":
        products[index].Own = 10 + (products[index].Own - products[index].Consumed);
        break;
      case "25Pdf":
        products[index].Own = 25 + (products[index].Own - products[index].Consumed);
        break;
      case "50Pdf":
        products[index].Own = 50 + (products[index].Own - products[index].Consumed);
        break;
      case "100Pdf":
        products[index].Own = 100 + (products[index].Own - products[index].Consumed);
        break;
      case "10Fb":
      case "10Tw":
      case "10Wa":
      case "10Sms":
        products[index].Own = 10 + (products[index].Own - products[index].Consumed);
        break;
      case "email-print-save":
        products[index].Own = 10 + (products[index].Own - products[index].Consumed);
        break;
      case "email-second-print-save":
        products[index].Own = 500 + (products[index].Own - products[index].Consumed);
        break;
      case "email-third-print-save":
        products[index].Own = 1000 + (products[index].Own - products[index].Consumed);
        break;
    }

    products[index].Consumed = 0;
    
    await this.setInappItems(products);
    return products;
  }

  async updatePDF() {
    const products = await this.getInappItems();
    for (let i = 0; i < 4; i++) {
      if (products[i].Purchase === 'Yes') {
        return this.incrementCounter(i);
      }
    }
  }

  async updateSavePrintEmail() {
    const products = await this.getInappItems();
    for (let i = 9; i <= 11; i++) {
      if (products[i].Purchase === 'Yes' && 
          products[i].Consumed <= products[i].Own) {
        return this.incrementCounter(i);
      }
    }
  }
}
