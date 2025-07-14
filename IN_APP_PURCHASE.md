# In-App Purchase Implementation Guide

## Overview
This document explains the complete in-app purchase flow implemented in the Government Billing Solution MVP. The implementation uses `@ionic-native/in-app-purchase-2` for handling purchases and `@capacitor/preferences` for local storage.

## Available Packages

### PDF Packages
| Package | Units | Price | Product ID |
|---------|--------|--------|------------|
| Basic | 10 PDFs | $0.99 | 2014inv10Pdf |
| Standard | 25 PDFs | $1.99 | 2014inv25Pdf |
| Premium | 50 PDFs | $2.99 | 2014inv50Pdf |
| Professional | 100 PDFs | $3.99 | 2014inv100Pdf |

### Sharing Packages
| Package | Units | Price | Product ID |
|---------|--------|--------|------------|
| Facebook Share | 10 shares | $0.99 | 2015inv10fb |
| Twitter Share | 10 shares | $0.99 | 2015inv10tw |
| WhatsApp Share | 10 shares | $0.99 | 2015inv10wa |
| SMS Share | 10 shares | $0.99 | 2015inv10sms |

### Save-Print-Email (SPE) Packages
| Package | Units | Price | Product ID |
|---------|--------|--------|------------|
| Basic SPE | 10 operations | $0.99 | 2015invSavePrintEmail |
| Business SPE | 500 operations | $3.99 | 2015inv500SavePrintEmail |
| Enterprise SPE | 1000 operations | $6.99 | 2015inv1000SavePrintEmail |

## User Purchase Flow

1. **Package Selection**
   - User browses available packages in the app
   - Each package shows:
     - Description
     - Price
     - Number of units
     - Current status (if already purchased)

2. **Purchase Process**
   ```typescript
   // Initiating a purchase
   await inAppPurchaseService.purchaseItem(productId);
   ```
   - User clicks "Buy" button
   - Google Play payment interface opens
   - User completes payment
   - Purchase is verified
   - Units are credited to user's account

3. **Purchase States**
   - **Approved**: Initial approval from store
   - **Verified**: Purchase verified by app
   - **Finished**: Purchase completed and consumed
   - **Cancelled**: User cancelled the purchase
   - **Error**: Purchase failed

## Package Usage

### PDF Generation
```typescript
// Check PDF availability
if (await inAppPurchaseService.isPDFAvailable()) {
    // Generate PDF
    await inAppPurchaseService.updatePDF();
}
```

### Save-Print-Email Operations
```typescript
// Check SPE availability
if (await inAppPurchaseService.isSavePrintEmailAvailable()) {
    // Perform SPE operation
    await inAppPurchaseService.updateSavePrintEmail();
}
```

## Technical Implementation

### 1. Store Initialization
```typescript
private async initializeStore(): Promise<void> {
    // Enable debug logs
    // Register products
    // Setup purchase handling
    // Initialize store
}
```

### 2. Purchase Handling
```typescript
// Purchase approval
private async handleApproved(product: IAPProduct)

// Purchase verification
private async handleVerified(product: IAPProduct)

// Purchase completion
private handleFinished(product: IAPProduct)
```

### 3. Local Storage
- Products are stored locally using Capacitor Preferences
- Tracks:
  - Purchase status
  - Units owned
  - Units consumed

## Error Handling

1. **Network Errors**
   - Store initialization failures
   - Purchase verification failures
   - Retry mechanisms

2. **Purchase Errors**
   - Payment failures
   - Verification failures
   - Cancellations

3. **Usage Errors**
   - Insufficient units
   - Invalid product IDs
   - Store not ready

## Security Measures

1. **Purchase Verification**
   - Every purchase is verified before activation
   - Server-side verification (when implemented)
   - Local storage security

2. **Usage Tracking**
   - Secure unit counting
   - Prevention of unauthorized usage
   - Transaction logging

## Testing

1. **Test Accounts**
   - Create test accounts in Google Play Console
   - Use test payment methods
   - Test all package types

2. **Test Scenarios**
   - Successful purchases
   - Failed purchases
   - Cancelled purchases
   - Network errors
   - Unit consumption

## Best Practices

1. **Purchase Flow**
   - Always verify purchases
   - Handle all possible states
   - Provide clear user feedback

2. **Unit Management**
   - Track units accurately
   - Update counts atomically
   - Persist changes immediately

3. **Error Handling**
   - Show user-friendly errors
   - Provide retry options
   - Log all failures

## Integration Steps

1. **Google Play Console**
   - Create all products with exact IDs
   - Set correct prices
   - Configure test accounts

2. **App Configuration**
   - Add billing permission
   - Configure product IDs
   - Setup test environment

3. **Testing**
   - Test with test accounts
   - Verify all purchase flows
   - Check unit tracking

## Support and Maintenance

1. **Monitoring**
   - Track purchase success rates
   - Monitor unit consumption
   - Watch for errors

2. **Updates**
   - Update prices when needed
   - Add new packages
   - Modify unit counts

3. **Support**
   - Handle purchase issues
   - Restore purchases
   - Manage refunds
