# Manual Testing Guide - Transaction Search and Filtering System

## Overview
This document provides comprehensive manual test cases for the transaction search and filtering system. Test all scenarios to ensure proper functionality across different filter combinations and search capabilities.

## Prerequisites
- Application running on localhost:3000
- Transaction data available in the database
- Access to browser developer tools for debugging
- Different transaction types (income/expense, validated/pending, with/without notes)

## Test Environment Setup
1. Navigate to `http://localhost:3000/transactions`
2. Ensure transaction data is loaded
3. Have browser developer tools ready for network inspection
4. Prepare test scenarios with known data

---

## Test Case 1: Basic Search Functionality

### Test 1.1: Text Search
**Steps:**
1. Navigate to transactions page
2. Enter "grocery" in the search bar
3. Verify results update in real-time
4. Try different search terms: "salary", "gas", "bank name"

**Expected Results:**
- Search results update without page refresh
- Matches found in description, notes, category, origin, and bank fields
- Search is case-insensitive
- Result count updates correctly
- "No results" message shown when no matches

### Test 1.2: Search with Special Characters
**Steps:**
1. Search for terms with special characters: "café", "josé", "R&D"
2. Search for partial words: "super" (should match "Supermarket")
3. Search with numbers: "2024", "100"

**Expected Results:**
- Special characters handled correctly
- Partial matches work as expected
- Numeric searches return relevant results
- No JavaScript errors in console

### Test 1.3: Empty Search Handling
**Steps:**
1. Enter search term and get results
2. Clear search bar completely
3. Verify all transactions return

**Expected Results:**
- All transactions displayed when search is cleared
- No error states
- Smooth transition back to full list

---

## Test Case 2: Date Range Filtering

### Test 2.1: Single Date Filters
**Steps:**
1. Click "Filters" button to open advanced filters
2. Set only start date (e.g., "2024-01-01")
3. Verify only transactions after this date shown
4. Clear and set only end date
5. Verify only transactions before this date shown

**Expected Results:**
- Start date filter shows transactions from date onwards
- End date filter shows transactions up to date
- Date inputs work correctly with calendar picker
- Filter badge appears when date filters active

### Test 2.2: Date Range Combination
**Steps:**
1. Set both start date: "2024-01-01" and end date: "2024-01-31"
2. Verify only January 2024 transactions shown
3. Try overlapping ranges
4. Try invalid ranges (start after end)

**Expected Results:**
- Date range filters work together correctly
- Only transactions within range displayed
- Invalid ranges handled gracefully
- Clear visual indication of active filters

### Test 2.3: Date Edge Cases
**Steps:**
1. Set date range to single day
2. Set very wide date range (full year)
3. Set future dates
4. Set very old dates

**Expected Results:**
- Single day filtering works correctly
- Wide ranges perform adequately
- Future/past dates handled without errors
- No performance issues with large ranges

---

## Test Case 3: Category and Source Filtering

### Test 3.1: Single Category Selection
**Steps:**
1. Open "Categories & Sources" tab in filters
2. Select one category checkbox
3. Verify only transactions from that category shown
4. Select different category
5. Verify results update

**Expected Results:**
- Single category selection works correctly
- Results update immediately upon selection
- Category names display correctly
- Checkbox states reflect selections

### Test 3.2: Multiple Category Selection
**Steps:**
1. Select multiple categories (2-3 categories)
2. Verify transactions from any selected category shown
3. Deselect one category
4. Verify results update correctly

**Expected Results:**
- Multiple selection works as OR logic
- Results include transactions from any selected category
- Deselection updates results immediately
- Filter count badge updates correctly

### Test 3.3: Origin and Bank Filtering
**Steps:**
1. Test origin filtering with single and multiple selections
2. Test bank filtering with single and multiple selections
3. Combine category, origin, and bank filters
4. Verify filters work together correctly

**Expected Results:**
- Origin and bank filters work independently
- Multiple filters combine correctly (AND logic between types)
- All selected items clearly indicated
- Results match filter combinations

---

## Test Case 4: Transaction Type and Status Filtering

### Test 4.1: Flow Type Filtering
**Steps:**
1. Set flow filter to "Income Only"
2. Verify only ENTRADA transactions shown
3. Set to "Expenses Only"
4. Verify only SAIDA transactions shown
5. Test "All Transactions" option

**Expected Results:**
- Income filter shows only positive transactions
- Expense filter shows only negative transactions
- All option shows both types
- Visual indicators (green/red) match filter

### Test 4.2: Validation Status Filtering
**Steps:**
1. Filter by "Validated Only"
2. Verify only validated transactions shown
3. Filter by "Pending Only"
4. Verify only pending transactions shown
5. Check status badges match filter

**Expected Results:**
- Validation filters work correctly
- Status badges align with filter selection
- Transition between filters smooth
- Badge colors match status (green/yellow)

### Test 4.3: Combined Type/Status Filtering
**Steps:**
1. Combine flow and validation filters
2. Try "Income + Validated", "Expenses + Pending"
3. Verify results match both criteria
4. Test all combinations

**Expected Results:**
- Combined filters work together (AND logic)
- Results satisfy all selected criteria
- Filter combinations logical and consistent
- No unexpected results

---

## Test Case 5: Amount Range Filtering

### Test 5.1: Single Amount Bounds
**Steps:**
1. Set minimum amount only (e.g., €50)
2. Verify only transactions ≥ €50 shown
3. Set maximum amount only (e.g., €1000)
4. Verify only transactions ≤ €1000 shown

**Expected Results:**
- Minimum filter excludes smaller amounts
- Maximum filter excludes larger amounts
- Amount comparisons work for both income and expenses
- Decimal amounts handled correctly

### Test 5.2: Amount Range Combination
**Steps:**
1. Set both min (€20) and max (€500) amounts
2. Verify only transactions in range shown
3. Try different ranges: €0-€100, €1000-€5000
4. Test with decimal precision: €19.99-€20.01

**Expected Results:**
- Range filtering works correctly
- Both bounds respected simultaneously
- Decimal precision maintained
- Edge cases handled properly

### Test 5.3: Amount Edge Cases
**Steps:**
1. Set minimum amount to 0
2. Set very high maximum amount
3. Test negative amounts (if applicable)
4. Test very small decimal amounts (€0.01)

**Expected Results:**
- Zero minimum includes all amounts
- High maximum doesn't cause errors
- Small decimals handled precisely
- No performance degradation

---

## Test Case 6: Advanced Filtering Options

### Test 6.1: AI Confidence Filtering
**Steps:**
1. Open "Advanced Options" tab
2. Set AI confidence range: 80%-100%
3. Verify only high-confidence transactions shown
4. Try different ranges: 0%-50%, 50%-80%
5. Check AI confidence scores match filter

**Expected Results:**
- Confidence filtering works correctly
- Percentage calculations accurate
- Range inputs accept valid values (0-100)
- Results match confidence criteria

### Test 6.2: Notes Filtering
**Steps:**
1. Filter by "With Notes"
2. Verify only transactions with notes shown
3. Filter by "Without Notes"
4. Verify only transactions without notes shown
5. Check note presence/absence accurately

**Expected Results:**
- Notes presence filter works correctly
- Empty notes treated as "without notes"
- Filter accurately distinguishes presence/absence
- Results consistent with note visibility

### Test 6.3: Items Per Page Setting
**Steps:**
1. Change items per page to 5
2. Verify pagination appears and works
3. Try different page sizes: 10, 25, 50, 100
4. Test pagination with filters active

**Expected Results:**
- Page size changes take effect immediately
- Pagination controls appear when needed
- Page navigation works correctly
- Filters maintained across pages

---

## Test Case 7: Sorting Functionality

### Test 7.1: Basic Column Sorting
**Steps:**
1. Click "Date" column header
2. Verify sort direction changes (asc/desc)
3. Click again to reverse sort
4. Try sorting by "Description", "Amount"
5. Check sort indicators (arrows) display correctly

**Expected Results:**
- Column sorting works in both directions
- Sort indicators show current state
- Data actually sorted by selected column
- Sort direction toggles correctly

### Test 7.2: Sort with Filters
**Steps:**
1. Apply some filters to reduce results
2. Sort filtered results by different columns
3. Verify sorting applies only to filtered data
4. Change filters and verify sort maintained

**Expected Results:**
- Sorting works on filtered data
- Sort order maintained when filters change
- No conflicts between sorting and filtering
- Performance acceptable with large datasets

### Test 7.3: Sort Edge Cases
**Steps:**
1. Sort by amount with mixed income/expense
2. Sort by AI confidence with various scores
3. Sort by date with different date formats
4. Test sorting with null/empty values

**Expected Results:**
- Amount sorting handles negative/positive correctly
- Confidence sorting by percentage accurate
- Date sorting chronologically correct
- Null values handled appropriately (end of list)

---

## Test Case 8: Pagination and Performance

### Test 8.1: Pagination Navigation
**Steps:**
1. Set low items per page (5-10)
2. Navigate through pages using Previous/Next
3. Click specific page numbers
4. Jump to first/last page
5. Test with different datasets sizes

**Expected Results:**
- Page navigation smooth and responsive
- Page numbers update correctly
- Current page highlighted
- Navigation buttons enabled/disabled appropriately

### Test 8.2: Pagination with Filters
**Steps:**
1. Apply filters that result in multiple pages
2. Navigate through filtered result pages
3. Change filters and verify pagination resets
4. Test edge case: filter reduces to single page

**Expected Results:**
- Pagination resets to page 1 when filters change
- Page counts update based on filtered results
- No "empty page" scenarios
- Smooth transitions between filter states

### Test 8.3: Performance Testing
**Steps:**
1. Test with large transaction dataset (100+ items)
2. Apply complex filter combinations
3. Rapidly change filters and sort options
4. Monitor browser performance/memory usage

**Expected Results:**
- No significant performance degradation
- Filter/sort changes responsive (< 500ms)
- No memory leaks with frequent changes
- Browser remains responsive throughout

---

## Test Case 9: Filter State Management

### Test 9.1: Filter Persistence
**Steps:**
1. Apply multiple filters
2. Refresh the page
3. Navigate away and back to transactions
4. Check if filters are maintained

**Expected Results:**
- Filter state behavior as designed (persist or reset)
- Consistent behavior across page interactions
- No unexpected filter states
- Clear user expectations

### Test 9.2: Clear Filters Functionality
**Steps:**
1. Apply various filters (search, dates, categories, etc.)
2. Click "Clear" button
3. Verify all filters reset to default
4. Check that all transactions visible again

**Expected Results:**
- All filters cleared simultaneously
- Search bar cleared
- All checkboxes unchecked
- Filter count badge disappears
- Full transaction list restored

### Test 9.3: Filter Badge Accuracy
**Steps:**
1. Apply single filter - check badge shows "1"
2. Apply multiple filters - check count increases
3. Remove filters one by one - check count decreases
4. Verify badge disappears when no filters active

**Expected Results:**
- Badge count accurately reflects active filters
- Badge appears/disappears correctly
- Count updates in real-time
- Visual consistency maintained

---

## Test Case 10: Integration and Error Handling

### Test 10.1: API Integration
**Steps:**
1. Open browser dev tools network tab
2. Apply various filters
3. Monitor API calls and responses
4. Check for efficient API usage (no redundant calls)

**Expected Results:**
- API calls triggered appropriately
- Response times acceptable (< 2s)
- Error responses handled gracefully
- No unnecessary network requests

### Test 10.2: Error State Handling
**Steps:**
1. Simulate network disconnection
2. Apply filters while offline
3. Reconnect and verify recovery
4. Test with invalid API responses

**Expected Results:**
- Graceful degradation when offline
- Clear error messages to users
- Recovery when connection restored
- No application crashes

### Test 10.3: Edge Data Scenarios
**Steps:**
1. Test with no transactions in database
2. Test with single transaction
3. Test with transactions missing required fields
4. Test with very long descriptions/notes

**Expected Results:**
- Empty state displayed appropriately
- Single item displays correctly
- Missing data handled gracefully
- Long text truncated with tooltips

---

## Test Case 11: Mobile Responsiveness

### Test 11.1: Mobile Filter Interface
**Steps:**
1. Open transactions on mobile device/responsive mode
2. Test filter panel usability
3. Check touch interactions on checkboxes/inputs
4. Verify filter tabs work on small screens

**Expected Results:**
- Filter panel accessible on mobile
- Touch targets appropriately sized
- Tabs navigate correctly
- No horizontal scrolling required

### Test 11.2: Mobile Table Display
**Steps:**
1. Check transaction table on mobile
2. Test horizontal scrolling if needed
3. Verify important columns visible
4. Check pagination controls on mobile

**Expected Results:**
- Table data readable on mobile
- Smooth horizontal scrolling
- Key information prioritized
- Pagination controls usable

### Test 11.3: Mobile Performance
**Steps:**
1. Test filter performance on mobile device
2. Check memory usage during filtering
3. Test with mobile network speeds
4. Verify touch responsiveness

**Expected Results:**
- Acceptable performance on mobile
- No excessive memory usage
- Graceful handling of slow networks
- Responsive touch interactions

---

## Accessibility Testing

### Test A.1: Keyboard Navigation
**Steps:**
1. Navigate entire filter interface using only Tab key
2. Test spacebar/enter on checkboxes and buttons
3. Verify focus indicators visible throughout
4. Test Escape key to close filter panels

**Expected Results:**
- All interactive elements keyboard accessible
- Logical tab order throughout interface
- Clear focus indicators
- Escape key works as expected

### Test A.2: Screen Reader Support
**Steps:**
1. Test with screen reader software
2. Verify filter labels read correctly
3. Check checkbox states announced
4. Test result count announcements

**Expected Results:**
- Filter controls properly labeled
- Checkbox states clearly announced
- Results changes communicated
- No missing or confusing labels

---

## Performance Benchmarks

Document performance results:

| Test Case | Dataset Size | Filter Complexity | Response Time | Status |
|-----------|--------------|------------------|---------------|---------|
| Basic search | 100 transactions | Single term | X.X ms | ✅/❌ |
| Complex filters | 500 transactions | 5+ filters | X.X ms | ✅/❌ |
| Pagination | 1000 transactions | With filters | X.X ms | ✅/❌ |
| Sort operations | 200 transactions | Multiple columns | X.X ms | ✅/❌ |

---

## Bug Reporting Template

**Bug Title:** [Concise description]

**Filter Configuration:**
- Search term: [if applicable]
- Date range: [start - end]
- Categories: [selected categories]
- Flow type: [income/expense/all]
- Amount range: [min - max]
- Other filters: [list active filters]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Additional Information:**
- Browser: [Chrome/Firefox/Safari/Edge + version]
- Screen size: [Desktop/Tablet/Mobile]
- Dataset size: [approximate number of transactions]
- Console errors: [if any]
- Network tab info: [if relevant]

---

## Sign-off Checklist

- [ ] Basic search functionality works correctly
- [ ] All filter types function as expected
- [ ] Filter combinations work properly (AND/OR logic)
- [ ] Sorting works on all sortable columns
- [ ] Pagination handles all scenarios
- [ ] Filter state management consistent
- [ ] Clear filters functionality works
- [ ] Performance acceptable for expected dataset sizes
- [ ] Mobile responsiveness adequate
- [ ] Accessibility requirements met
- [ ] Error handling graceful
- [ ] API integration efficient
- [ ] No console errors or warnings
- [ ] Browser compatibility verified

**Tested by:** [Name]  
**Date:** [Date]  
**Environment:** [Browser/OS details]  
**Dataset:** [Size and type of test data]  
**Overall Status:** ✅ PASS / ❌ FAIL

---

## Sample Test Data

### Quick Test Scenarios
Use these for rapid testing:

1. **Basic Search Tests**
   - "grocery" - should match food transactions
   - "salary" - should match income transactions
   - "bank" - should match bank names
   - "2024" - should match dates or descriptions with 2024

2. **Filter Combinations**
   - Income + Validated + This month
   - Expenses + Pending + Amount > €100
   - Specific category + Date range + With notes
   - Multiple categories + Single bank + AI confidence > 80%

3. **Edge Cases**
   - Empty search with all filters
   - Single transaction result
   - No results scenario
   - Very large amount values
   - Special characters in search

4. **Performance Tests**
   - 1000+ transactions with complex filters
   - Rapid filter changes
   - Multiple browser tabs
   - Mobile device with limited memory