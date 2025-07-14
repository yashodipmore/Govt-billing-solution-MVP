# Google Play Console Setup Guide
## Complete Guide for In-App Purchase Configuration

## Prerequisites
1. Google Play Developer Account
   - Cost: One-time fee of $25
   - Visit: https://play.google.com/console
   - Required documents:
     - Valid credit card
     - Developer agreement acceptance
     - Identity verification

2. App Requirements
   - Privacy Policy URL
   - App signing key
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (minimum 2)

## Step 1: Create Application
1. Go to Google Play Console
   ```
   https://play.google.com/console
   ```

2. Click "Create App"
   - App Name: "Government Billing Solution"
   - Default language: English
   - App or Game: App
   - Free or Paid: Free (with in-app purchases)
   - Declaration compliance

## Step 2: App Setup

### A. Store Listing
1. Short Description (80 chars max)
2. Full Description (4000 chars max)
3. Graphics:
   - Icon (512x512)
   - Feature graphic (1024x500)
   - Phone screenshots (min 2)
   - Tablet screenshots (if supporting tablets)

### B. Content Rating
1. Complete questionnaire
2. Expected rating: PEGI 3 / Everyone
3. Fill required information:
   - Email address
   - Content description
   - Survey questions

### C. App Release
1. Internal testing track setup
   - Create new release
   - Upload APK/Bundle
   - Release name: "Initial Release with IAP"
   - Release notes

## Step 3: In-App Products Setup

### A. Activate In-App Billing
1. Go to "Monetization setup"
2. Enable "In-app products"
3. Fill tax information
4. Set up merchant account

### B. Create Products
1. PDF Packages:
   ```
   Product ID: 2014inv10Pdf
   Name: 10 PDF Package
   Description: Generate and share up to 10 PDF documents
   Price: $0.99
   
   Product ID: 2014inv25Pdf
   Name: 25 PDF Package
   Description: Generate and share up to 25 PDF documents
   Price: $1.99
   
   Product ID: 2014inv50Pdf
   Name: 50 PDF Package
   Description: Generate and share up to 50 PDF documents
   Price: $2.99
   
   Product ID: 2014inv100Pdf
   Name: 100 PDF Package
   Description: Generate and share up to 100 PDF documents
   Price: $3.99
   ```

2. Sharing Packages:
   ```
   Product ID: 2015inv10fb
   Name: Facebook Sharing Package
   Description: Share 10 documents via Facebook
   Price: $0.99
   
   Product ID: 2015inv10tw
   Name: Twitter Sharing Package
   Description: Share 10 documents via Twitter
   Price: $0.99
   
   Product ID: 2015inv10wa
   Name: WhatsApp Sharing Package
   Description: Share 10 documents via WhatsApp
   Price: $0.99
   
   Product ID: 2015inv10sms
   Name: SMS Sharing Package
   Description: Share 10 documents via SMS
   Price: $0.99
   ```

3. SPE Packages:
   ```
   Product ID: 2015invSavePrintEmail
   Name: Basic SPE Package
   Description: 10 Save, Print, and Email operations
   Price: $0.99
   
   Product ID: 2015inv500SavePrintEmail
   Name: Business SPE Package
   Description: 500 Save, Print, and Email operations
   Price: $3.99
   
   Product ID: 2015inv1000SavePrintEmail
   Name: Enterprise SPE Package
   Description: 1000 Save, Print, and Email operations
   Price: $6.99
   ```

## Step 4: Testing Setup

### A. Internal Testing
1. Create test accounts:
   - Go to Setup > Internal testing
   - Add testers (email addresses)
   - Create opt-in URL

2. Test Purchase Setup:
   - Add test payment methods
   - Configure test cards
   - Set up test licenses

### B. License Testing
1. Add test accounts:
   - Go to "License Testing"
   - Add Gmail accounts
   - Configure test response

## Step 5: App Release Process

### A. Internal Testing Track
1. Upload signed APK/Bundle
2. Add release notes
3. Select countries
4. Start rollout

### B. Testing Process
1. Test each product:
   ```
   For each package:
   - Make purchase
   - Verify transaction
   - Check unit allocation
   - Test consumption
   - Verify balance
   ```

2. Test scenarios:
   - Successful purchase
   - Failed purchase
   - Network error
   - Cancellation
   - Refund process

### C. Production Release
1. Requirements checklist:
   - All products tested
   - Prices verified
   - Descriptions approved
   - Screenshots updated
   - Privacy policy current

2. Final checks:
   - App signing
   - Content rating
   - Store listing
   - In-app products
   - Pricing & distribution

## Step 6: Post-Release

### A. Monitoring
1. Check daily:
   - Purchase success rate
   - Error reports
   - User feedback

2. Track metrics:
   - Most popular packages
   - Average purchase value
   - Conversion rate

### B. Maintenance
1. Regular tasks:
   - Update prices if needed
   - Monitor refund requests
   - Check error reports
   - Update product descriptions

2. Support:
   - Handle user inquiries
   - Process refunds
   - Fix reported issues

## Common Issues and Solutions

### 1. Purchase Failed
```
Common causes:
- Invalid product ID
- Test account not set up
- Wrong pricing template
- Incorrect billing permission

Solution:
- Verify product IDs match exactly
- Check test account setup
- Verify app signing
```

### 2. Testing Issues
```
Common problems:
- Test purchases not working
- Real charges on test account
- Products not visible

Solution:
- Verify test account setup
- Check internal testing track
- Clear app data and cache
```

### 3. Production Issues
```
Common issues:
- Products not appearing
- Wrong prices showing
- Purchase verification failing

Solution:
- Verify product status in console
- Check price configuration
- Verify billing permission
```

## Important Links
- Google Play Console: https://play.google.com/console
- Testing Documentation: https://developer.android.com/google/play/billing/test
- Billing Library Guide: https://developer.android.com/google/play/billing/integrate

## Contact Support
For issues with Google Play Console:
1. Developer Support: https://support.google.com/googleplay/android-developer
2. Help Center: https://support.google.com/googleplay/android-developer/answer/4407611
