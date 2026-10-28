# Google Play Store Release Metadata & Guidelines
**Application:** HisabPro – Monthly Expense Tracker  
**Package Name / Application ID:** `com.hisabpro.expensetracker`  
**Current Version:** `1.0.0` (versionCode `1`)  
**Target Category:** Finance / Personal Finance Management  
**Content Rating:** Everyone  

---

## 1. Store Listing Details

### App Title (Max 30 characters)
`HisabPro – Expense Tracker`

### Short Description (Max 80 characters)
`Track daily expenses, monthly budgets, savings goals & wallets 100% offline.`

### Full Description (Max 4,000 characters)
```
Take control of your personal finances with HisabPro, the clean, fast, and modern expense tracker designed for everyday budgeting.

Whether you're managing household expenses, tracking fuel and grocery bills, planning savings targets, or monitoring multiple bank accounts and cash wallets, HisabPro gives you clear financial clarity with zero ads and total privacy.

KEY FEATURES:

📊 Smart Dashboard & Monthly Overview
• High-level summary of Total Income, Total Spending, Net Savings, and Remaining Budget.
• Month-over-month comparison to easily see your spending trends.
• Interactive Category Spending Donut Chart with live percentage breakdown.
• 30-Day Daily Spending Spike Chart to spot high-outflow days.

💳 Accounts & Wallets Management
• Track balances across Cash in Hand, Bank Accounts, High-Yield Savings, Credit Cards, and Mobile Wallets (JazzCash, Nayapay, Easypaisa, etc.).
• Record instant transfers between accounts without skewing expense metrics.
• Live net worth calculation across all accounts.

🎯 Savings Goals Tracker
• Set ambitious targets for Emergency Funds, Travel & Umrah, Gadgets, or House Down Payments.
• Visual progress indicators with target dates and remaining amount countdowns.
• Convenient one-tap deposit and withdrawal logging.

🏷️ Detailed Transaction Ledger
• Record Expenses, Incomes, and Transfers in seconds.
• Categorize transactions, add merchant names, notes, and custom tags.
• Instant search and powerful multi-criteria filter (by category, account, date range, or amount).
• Grouped daily views with net daily totals.

💡 Monthly & Category Budget Limits
• Set hard monthly budget ceilings and per-category spending targets.
• Real-time progress bars with amber warning states and red over-budget alerts.
• Spending insights highlighting daily burn rate, largest outflow, and savings pace.

🇵🇰 Default PKR with Global Currency Flexibility
• Pakistani Rupee (PKR - Rs) formatted out of the box with localized numbering.
• Full support for USD, EUR, GBP, INR, AED, SAR, BDT, CAD, and AUD in Settings.

🔒 100% Private & Offline First
• All financial records are stored securely on your personal device.
• No cloud tracking, no third-party analytics, and no external data selling.
• Export complete JSON backups to preserve your data across devices.
• Export transaction history to CSV format for Excel or Google Sheets.
• Print-ready monthly financial statements.

🎨 Refined Experience
• Seamless Dark and Light appearance.
• Smooth gestures and responsive mobile-first navigation.
```

---

## 2. Google Play Data Safety Form Answers

Google Play requires all apps to complete the Data Safety questionnaire. Because HisabPro stores all data on the user's device:

| Question | Answer | Rationale |
| :--- | :--- | :--- |
| **Does your app collect or share any user data?** | **No** | The application operates entirely locally on device storage. |
| **Is all user data encrypted in transit?** | **Not Applicable / Yes** | No financial data leaves the device. Local scheme runs over secure `https://localhost`. |
| **Do you provide a way for users to request data deletion?** | **Yes** | Users can delete all transactions directly inside the Settings tab, or uninstall the app to erase all records. |
| **Are there any third-party advertising SDKs?** | **No** | No ad networks or user tracking libraries are included. |
| **Are there financial permissions requested?** | **No** | The app does not access SMS or bank APIs; tracking is manual and secure. |

---

## 3. Play Store Graphics Checklist

Prepare the following assets for the Google Play Console:

1. **App Icon**: 512 × 512 px, 32-bit PNG with alpha.
2. **Feature Graphic**: 1024 × 500 px, JPG or 24-bit PNG (no alpha).
3. **Phone Screenshots**: Minimum 4 screenshots (1080 × 1920 px or 1080 × 2400 px) showing:
   * Dashboard with PKR balance, KPI cards, and Donut Chart
   * Transaction Ledger with search, filters, and grouped history
   * Category Budgets & progress bars with alerts
   * Wallets & Savings Goals with deposit flows

---

## 4. Release Checklist for Google Play Console

1. **Build the Android App Bundle (AAB)**:
   ```bash
   npm run android:bundle:release
   ```
2. **Locate the Output Bundle**:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
3. **Google Play Console Setup**:
   * Create app with name **HisabPro – Expense Tracker**.
   * Set default language to English (or English - Pakistan).
   * Free / Paid: Set to **Free**.
4. **App Content Tasks**:
   * **Privacy Policy**: Enter the hosted URL of `PRIVACY_POLICY.md`.
   * **Target Audience**: Age 18 and over (or Everyone).
   * **News / Government App**: Select **No**.
   * **Financial Features**: Select **Personal finance management / Expense tracking (Manual tracking)**.
   * **Data Safety**: Select **No data collected or shared**.
5. **Testing Track**:
   * Upload `app-release.aab` to **Internal Testing** track first.
   * Test installation on your personal Android device via the internal tester link.
   * Promote to **Closed Testing** or **Production** once approved.
