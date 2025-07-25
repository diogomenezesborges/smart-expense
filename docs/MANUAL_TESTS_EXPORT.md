# Manual Testing Guide - Data Export Functionality

## Overview
This document provides comprehensive manual test cases for the data export system. Test all scenarios to ensure proper functionality across different browsers and data conditions.

## Prerequisites
- Application running on localhost with sample data
- Multiple transactions in database (at least 20+ across different categories)
- Various date ranges of data (current month, previous months)
- Different transaction types (income/expense)

## Test Environment Setup
1. Navigate to `http://localhost:3000/export`
2. Ensure you have test data spanning multiple months
3. Have different browsers ready for cross-browser testing
4. Prepare to test different file formats

---

## Test Case 1: Basic Export Configuration

### Test 1.1: CSV Transaction Export
**Steps:**
1. Go to Export Data tab
2. Select "Transactions" as Data Type
3. Select "CSV" as Format
4. Leave date fields empty (all data)
5. Keep "Include metadata" checked
6. Click "Export Data"

**Expected Results:**
- Export completes without errors
- CSV file downloads automatically
- File name format: `finance_transactions_YYYYMMDDTHHMMSS.csv`
- File contains transaction data with headers
- Metadata section included at bottom/top

**Verify CSV Content:**
- Headers: id, date, description, amount, incomes, outgoings, category, subCategory, etc.
- Data properly formatted (dates as YYYY-MM-DD)
- No missing or corrupted data
- Special characters handled correctly

### Test 1.2: Excel Analytics Export
**Steps:**
1. Select "Analytics Report" as Data Type
2. Select "Excel (XLSX)" as Format
3. Set date range: first day of current month to today
4. Click "Export Data"

**Expected Results:**
- Excel file downloads with .xlsx extension
- Multiple worksheets: Summary, Monthly, Categories
- Professional formatting applied
- Data matches expected analytics

**Verify Excel Content:**
- Summary sheet with aggregated statistics
- Monthly sheet with month-by-month breakdown
- Category sheet with spending by category
- Formulas and calculations correct

### Test 1.3: PDF Budget Report
**Steps:**
1. Select "Budget Performance" as Data Type
2. Select "PDF Report" as Format
3. Set date range for current month
4. Click "Export Data"

**Expected Results:**
- PDF file downloads and opens correctly
- Professional report layout
- Tables with proper formatting
- Charts/graphics render properly

**Verify PDF Content:**
- Header with title and generation date
- Budget vs actual comparison tables
- Variance calculations displayed
- Readable fonts and proper spacing

---

## Test Case 2: Date Range Filtering

### Test 2.1: Current Month Filter
**Steps:**
1. Set "From Date" to first day of current month
2. Set "To Date" to today's date
3. Export transactions as CSV
4. Verify exported data

**Expected Results:**
- Only transactions within date range exported
- Date validation working correctly
- No transactions outside range included

### Test 2.2: Custom Date Range
**Steps:**
1. Set specific date range (e.g., 2024-01-01 to 2024-01-31)
2. Export analytics as Excel
3. Check monthly breakdown sheet

**Expected Results:**
- Analytics reflect only selected date range
- Monthly trends match selected period
- Summary statistics accurate for range

### Test 2.3: Invalid Date Range
**Steps:**
1. Set "From Date" after "To Date"
2. Attempt to export

**Expected Results:**
- System handles gracefully
- Either corrects automatically or shows validation error
- No corrupted export generated

---

## Test Case 3: Export Presets

### Test 3.1: Monthly Transactions Preset
**Steps:**
1. Go to "Quick Presets" tab
2. Click "Apply" on "Monthly Transactions"
3. Verify configuration applied
4. Go back to Export Data tab
5. Confirm settings match preset
6. Export data

**Expected Results:**
- Configuration automatically populated
- Date range set to current month
- Format set to Excel
- Type set to Transactions

### Test 3.2: Yearly Analytics Preset
**Steps:**
1. Apply "Yearly Analytics Report" preset
2. Check configuration
3. Export using preset settings

**Expected Results:**
- Date range set to current year
- PDF format selected
- Analytics type selected
- Export completes successfully

### Test 3.3: Custom Preset Application
**Steps:**
1. Apply different presets in sequence
2. Verify each preset overwrites previous configuration
3. Export using different preset settings

**Expected Results:**
- Each preset correctly updates configuration
- No remnants from previous preset
- All presets work as expected

---

## Test Case 4: Export History

### Test 4.1: History Tracking
**Steps:**
1. Perform multiple exports with different settings
2. Go to "Export History" tab
3. Verify all exports listed

**Expected Results:**
- All exports appear in chronological order
- Correct filename, format, type displayed
- Record count accurate
- Timestamps correct

### Test 4.2: Re-download from History
**Steps:**
1. Find completed export in history
2. Click "Download" button
3. Verify file downloads

**Expected Results:**
- File downloads successfully
- Same content as original export
- File not corrupted

### Test 4.3: History Persistence
**Steps:**
1. Export several files
2. Refresh browser page
3. Check export history

**Expected Results:**
- History persists across page refreshes
- All previous exports still listed
- Download links still functional

---

## Test Case 5: Error Handling

### Test 5.1: Network Error Simulation
**Steps:**
1. Start export process
2. Disconnect network during export
3. Observe error handling

**Expected Results:**
- Clear error message displayed
- Export status updates appropriately
- No partial/corrupted files created

### Test 5.2: Large Dataset Export
**Steps:**
1. Export all transactions (if dataset is large >1000 records)
2. Monitor export progress
3. Verify completion

**Expected Results:**
- Export handles large datasets
- No timeout errors
- Performance remains acceptable
- Memory usage reasonable

### Test 5.3: Invalid Configuration
**Steps:**
1. Try various invalid configurations
2. Submit export requests
3. Check error handling

**Expected Results:**
- Validation prevents invalid exports
- Clear error messages provided
- System remains stable

---

## Test Case 6: Cross-Browser Compatibility

### Test 6.1: Chrome Testing
**Steps:**
1. Test all export formats in Chrome
2. Verify downloads work correctly
3. Check file opening in Chrome

### Test 6.2: Firefox Testing
**Steps:**
1. Repeat all tests in Firefox
2. Verify download behavior
3. Check file compatibility

### Test 6.3: Safari Testing (if available)
**Steps:**
1. Test core functionality in Safari
2. Verify file downloads
3. Check any Safari-specific issues

### Test 6.4: Edge Testing
**Steps:**
1. Test in Microsoft Edge
2. Verify all formats work
3. Check download handling

---

## Test Case 7: File Format Verification

### Test 7.1: CSV Format Validation
**Steps:**
1. Export CSV file
2. Open in Excel/Google Sheets
3. Verify proper parsing
4. Check character encoding (UTF-8)
5. Verify special characters display correctly

### Test 7.2: Excel Format Validation
**Steps:**
1. Export Excel file
2. Open in Microsoft Excel or LibreOffice
3. Check all worksheets accessible
4. Verify formulas work
5. Check formatting preserved

### Test 7.3: PDF Format Validation
**Steps:**
1. Export PDF file
2. Open in PDF reader
3. Verify text searchable
4. Check tables properly formatted
5. Verify print quality

---

## Test Case 8: Data Accuracy

### Test 8.1: Transaction Data Verification
**Steps:**
1. Export recent transactions as CSV
2. Compare with database/UI data
3. Verify all fields accurate
4. Check calculations correct

### Test 8.2: Analytics Data Verification
**Steps:**
1. Export analytics report
2. Manually calculate some totals
3. Compare with exported data
4. Verify percentages and averages

### Test 8.3: Budget Data Verification
**Steps:**
1. Export budget performance
2. Compare with actual spending data
3. Verify variance calculations
4. Check percentage calculations

---

## Test Case 9: Performance Testing

### Test 9.1: Export Speed
**Steps:**
1. Time various export operations
2. Note performance for different data sizes
3. Check for reasonable response times

**Expected Results:**
- Small exports (< 100 records): < 5 seconds
- Medium exports (100-1000 records): < 15 seconds
- Large exports (> 1000 records): < 30 seconds

### Test 9.2: Memory Usage
**Steps:**
1. Monitor browser memory during exports
2. Check for memory leaks
3. Verify memory released after export

### Test 9.3: Concurrent Exports
**Steps:**
1. Try multiple exports simultaneously
2. Check system handling
3. Verify all complete successfully

---

## Test Case 10: Edge Cases

### Test 10.1: Empty Dataset
**Steps:**
1. Configure date range with no data
2. Attempt export
3. Check handling of empty results

**Expected Results:**
- System handles gracefully
- Appropriate message shown
- Empty file structure maintained

### Test 10.2: Special Characters
**Steps:**
1. Ensure data contains special characters (€, ñ, ç, etc.)
2. Export in all formats
3. Verify characters preserved

### Test 10.3: Very Long Descriptions
**Steps:**
1. Export data with very long transaction descriptions
2. Check formatting in all export formats
3. Verify no truncation or errors

---

## Bug Reporting Template

When reporting bugs, include:

**Bug Title:** [Concise description]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge + version]
- OS: [Windows/Mac/Linux]
- Data size: [Approximate number of records]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Additional Information:**
- Screenshots if applicable
- Console errors if any
- File samples if relevant

---

## Performance Benchmarks

Document performance results:

| Test Case | Data Size | Format | Time (seconds) | File Size | Status |
|-----------|-----------|--------|----------------|-----------|---------|
| Basic CSV | 100 records | CSV | X.X | XXX KB | ✅/❌ |
| Analytics | 1 month | Excel | X.X | XXX KB | ✅/❌ |
| Budget | Current month | PDF | X.X | XXX KB | ✅/❌ |

---

## Sign-off Checklist

- [ ] All export formats work correctly
- [ ] Date filtering functions properly
- [ ] Presets apply correctly
- [ ] History tracking works
- [ ] Error handling is robust
- [ ] Cross-browser compatibility verified
- [ ] File formats are valid and readable
- [ ] Data accuracy confirmed
- [ ] Performance is acceptable
- [ ] Edge cases handled appropriately

**Tested by:** [Name]  
**Date:** [Date]  
**Environment:** [Browser/OS details]  
**Overall Status:** ✅ PASS / ❌ FAIL