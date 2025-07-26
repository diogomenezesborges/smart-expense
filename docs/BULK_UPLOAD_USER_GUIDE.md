# Bulk Data Upload User Guide

## 📋 Overview

The Bulk Data Upload feature allows you to import your existing financial data from Excel spreadsheets or CSV files. This is perfect for new users migrating from other financial management applications or importing historical transaction data.

## 🚀 Getting Started

### Step 1: Access the Bulk Upload Feature
1. Navigate to the main menu
2. Click on **"Bulk Upload"**
3. You'll see the bulk upload wizard interface

### Step 2: Choose Your Data Type
Select what type of data you want to import:

- **Transactions**: Your financial transactions (income, expenses, transfers)
- **Categories**: Custom spending and income categories
- **Origins**: Who made the transactions (family members, accounts)
- **Banks**: Your financial institutions

## 📊 Data Templates

### Transaction Template
**Use for**: Importing your financial transactions

**Required Columns**:
- **Date**: Transaction date (YYYY-MM-DD format recommended)
- **Origin**: Who made the transaction (John, Jane, Joint Account)
- **Bank**: Financial institution name
- **Flow**: ENTRADA (income) or SAIDA (expense)
- **Major Category**: RENDIMENTO, CUSTOS_FIXOS, CUSTOS_VARIAVEIS, etc.
- **Category**: Main category (Food & Dining, Housing, Salary)
- **Sub Category**: Specific subcategory (Groceries, Rent, Monthly Salary)
- **Description**: Transaction description
- **Income Amount**: Amount for income transactions (leave empty for expenses)
- **Outgoing Amount**: Amount for expense transactions (leave empty for income)
- **Notes**: Optional additional information

**Example Row**:
```
Date: 2024-01-15
Origin: John
Bank: Chase Bank
Flow: ENTRADA
Major Category: RENDIMENTO
Category: Salary
Sub Category: Monthly Salary
Description: January salary payment
Income Amount: 3500.00
Outgoing Amount: (empty)
Notes: Direct deposit
```

### Category Template
**Use for**: Defining your transaction categories

**Required Columns**:
- **Flow**: ENTRADA (income) or SAIDA (expense)
- **Major Category**: Primary classification
- **Category**: Main category name
- **Sub Category**: Specific subcategory

**Example Row**:
```
Flow: SAIDA
Major Category: CUSTOS_VARIAVEIS
Category: Food & Dining
Sub Category: Groceries
```

### Origin Template
**Use for**: Defining who makes transactions

**Required Columns**:
- **Name**: Person or account name

**Examples**:
- John
- Jane
- Joint Account
- Family Fund

### Bank Template
**Use for**: Defining your financial institutions

**Required Columns**:
- **Name**: Bank or financial institution name

**Examples**:
- Chase Bank
- Wells Fargo
- Bank of America
- Credit Union

## 📥 Import Process

### 1. Download Template
1. Select your data type (Transactions, Categories, etc.)
2. Click **"Download [Type] Template"**
3. Open the downloaded Excel file
4. You'll see sample data and a validation rules sheet

### 2. Fill Your Data
1. Replace the sample data with your actual data
2. Follow the format shown in the examples
3. Keep the column headers exactly as provided
4. Remove any empty rows at the bottom

### 3. Upload Your File
1. Click **"Skip to Upload"** or use the Upload tab
2. Select your data type from the dropdown
3. Drag and drop your file or click **"Choose File"**
4. Supported formats: Excel (.xlsx), CSV
5. Maximum file size: 10MB

### 4. Validation
The system will automatically validate your data:
- ✅ **Valid**: Green checkmark, ready to import
- ❌ **Errors Found**: Red warning with details

If errors are found:
1. Review the error list
2. Download the detailed error report
3. Fix the issues in your file
4. Upload the corrected file

### 5. Preview & Import
1. Review the data preview showing first 5 records
2. Verify the information looks correct
3. Click **"Start Import"**
4. Monitor the progress bar
5. Receive completion notification

## ✅ Data Validation Rules

### Date Formats
- **Preferred**: YYYY-MM-DD (2024-01-15)
- **Accepted**: DD/MM/YYYY (15/01/2024)
- **Accepted**: MM/DD/YYYY (01/15/2024)

### Flow Values
- **ENTRADA**: For income transactions
- **SAIDA**: For expense transactions

### Major Categories
- **RENDIMENTO**: Income
- **RENDIMENTO_EXTRA**: Extra Income  
- **ECONOMIA_INVESTIMENTOS**: Economy & Investments
- **CUSTOS_FIXOS**: Fixed Costs
- **CUSTOS_VARIAVEIS**: Variable Costs
- **GASTOS_SEM_CULPA**: Guilt-free Spending

### Amount Rules
- Use decimal point for cents (1250.50)
- No currency symbols (€, $)
- For ENTRADA transactions: fill "Income Amount", leave "Outgoing Amount" empty
- For SAIDA transactions: fill "Outgoing Amount", leave "Income Amount" empty

### Required Fields
All fields marked as required must have values:
- Date, Origin, Bank, Flow, Categories, Description
- Amounts (appropriate to flow type)

## ❌ Common Errors & Solutions

### "Invalid date format"
**Problem**: Date not in recognized format
**Solution**: Use YYYY-MM-DD format (2024-01-15)

### "Invalid flow value" 
**Problem**: Flow column contains invalid value
**Solution**: Use only ENTRADA or SAIDA

### "Income amount required for ENTRADA transactions"
**Problem**: Missing amount for income transaction
**Solution**: Fill the "Income Amount" column for ENTRADA transactions

### "Outgoing amount should be empty for ENTRADA transactions"
**Problem**: Both income and outgoing amounts filled
**Solution**: For income transactions, only fill "Income Amount"

### "Invalid major category"
**Problem**: Major category not in allowed list
**Solution**: Use only the predefined major categories (check validation sheet)

### "Required field missing"
**Problem**: Empty required field
**Solution**: Fill all required columns with appropriate values

## 💡 Best Practices

### Before You Start
1. **Backup Your Data**: Keep a copy of your original file
2. **Start Small**: Try importing a few transactions first
3. **Clean Your Data**: Remove duplicate or invalid entries
4. **Check Categories**: Ensure your categories match the system requirements

### File Preparation
1. **Use Templates**: Always start with the downloaded template
2. **Keep Headers**: Don't modify column headers
3. **Remove Empty Rows**: Delete any empty rows at the bottom
4. **Check Formats**: Ensure dates and amounts are properly formatted

### During Import
1. **Review Errors**: Read error messages carefully
2. **Fix and Retry**: Correct issues and re-upload
3. **Monitor Progress**: Watch the progress bar during import
4. **Don't Close Browser**: Keep the page open during import

### After Import
1. **Verify Data**: Check your dashboard for imported data
2. **Review Categories**: Ensure categories were created correctly
3. **Test Transactions**: Verify transaction amounts and dates
4. **Clean Up**: Delete any incorrect imports if needed

## 🔧 Troubleshooting

### Upload Issues
**File won't upload**:
- Check file size (must be under 10MB)
- Ensure file format is Excel (.xlsx) or CSV
- Try refreshing the page

**Validation taking too long**:
- Large files may take time to process
- Don't close the browser tab
- Consider splitting large files into smaller chunks

### Import Errors
**"Database error during import"**:
- Check for duplicate transactions
- Ensure all referenced categories/origins/banks exist
- Contact support if error persists

**"Import stuck at X%"**:
- Large imports may take several minutes
- Don't refresh the page
- Check your internet connection

### Data Issues
**Transactions not appearing**:
- Check date ranges in your dashboard filters
- Verify the import completed successfully
- Look for the imported data in transaction list

**Categories missing**:
- Import categories before transactions
- Check category names match exactly
- Review major category assignments

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check Error Messages**: Read them carefully for specific guidance
2. **Download Error Report**: Contains detailed information about issues
3. **Try Sample Data**: Test with the template's sample data first
4. **Contact Support**: Include your error report and file details

## 🎯 Tips for Migrating from Other Apps

### From Banking Apps
- Export transactions as CSV from your banking app
- Map your bank's categories to our system
- Check date formats (banks often use different formats)

### From Spreadsheet Apps
- Copy data into our template format
- Ensure amount columns are numeric
- Convert any date formats to YYYY-MM-DD

### From Other Finance Apps
- Export data in CSV or Excel format
- Map categories to our major category system
- Split combined amount columns into income/outgoing

---

**Need Help?** This feature is designed to make your data migration as smooth as possible. Take your time, follow the steps, and don't hesitate to use the error reports to fix any issues.