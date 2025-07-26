# Manual Testing Guide - Financial Goals System

## Overview
This document provides comprehensive manual test cases for the financial goals tracking system. Test all scenarios to ensure proper functionality across different goal types and user interactions.

## Prerequisites
- Application running on localhost
- Access to browser localStorage (for goal persistence)
- Sample data available or ability to create test goals
- Different date scenarios for testing

## Test Environment Setup
1. Navigate to `http://localhost:3000/goals`
2. Clear localStorage if needed: `localStorage.clear()`
3. Have browser developer tools ready for debugging
4. Prepare test data scenarios

---

## Test Case 1: Basic Goal Creation

### Test 1.1: Create Savings Goal
**Steps:**
1. Click "New Goal" button
2. Fill in goal details:
   - Title: "Emergency Fund"
   - Description: "Build 6 months of expenses"
   - Type: "Savings Goal"
   - Period: "Yearly"
   - Target Amount: 6000
   - Start Date: Current date
   - Target Date: 1 year from now
   - Priority: "High"
   - Enable notifications: checked
3. Click "Create Goal"

**Expected Results:**
- Dialog closes automatically
- New goal appears in goals list
- Goal shows 0% progress initially
- Goal has correct priority border color (red for high)
- All details display correctly

### Test 1.2: Create Spending Limit Goal
**Steps:**
1. Create new goal with type "Spending Limit"
2. Set monthly period
3. Target amount: 800 (monthly food budget)
4. Set as recurring goal

**Expected Results:**
- Goal created with spending limit type icon
- Shows as recurring in details
- Monthly period reflected in calculations

### Test 1.3: Create Investment Goal
**Steps:**
1. Create "Investment" type goal
2. Set monthly recurring target
3. Amount: 500 per month

**Expected Results:**
- Investment icon displayed
- Recurring monthly pattern established
- Progress calculations appropriate for monthly goals

---

## Test Case 2: Goal Management

### Test 2.1: Edit Goal Details
**Steps:**
1. Click settings icon on existing goal
2. Modify title, description, or target amount
3. Save changes

**Expected Results:**
- Changes reflected immediately
- Progress recalculates if target amount changed
- Updated timestamp reflects changes

### Test 2.2: Update Goal Progress
**Steps:**
1. Find active goal with progress < 100%
2. Manually update progress through UI or API
3. Verify calculations update

**Expected Results:**
- Progress bar updates visually
- Percentage calculations correct
- "Amount to go" updates
- Days remaining calculations adjust

### Test 2.3: Delete Goal
**Steps:**
1. Click delete button on goal
2. Confirm deletion

**Expected Results:**
- Goal removed from all lists
- No longer appears in insights
- Storage updated correctly

---

## Test Case 3: Goal Progress Tracking

### Test 3.1: Progress Calculations
**Steps:**
1. Create goal with known values
2. Verify progress calculations:
   - Progress percentage = (current/target) * 100
   - Amount to go = target - current
   - Days remaining = target date - current date

**Expected Results:**
- All calculations mathematically correct
- Progress bar reflects percentage accurately
- Text displays match visual indicators

### Test 3.2: On-Track vs Behind Schedule
**Steps:**
1. Create goal with tight deadline
2. Add minimal progress
3. Check "on track" indicator
4. Create goal with generous deadline
5. Add significant progress
6. Verify "on track" status

**Expected Results:**
- Behind schedule goals show warning indicators
- On-track goals show success indicators
- Daily/weekly required amounts calculated correctly

### Test 3.3: Goal Completion
**Steps:**
1. Update goal progress to 100% of target
2. Verify completion status
3. Check if goal moves to completed section

**Expected Results:**
- Goal automatically marked as completed
- Appears in completed tab
- Achievement insight generated
- Completion date recorded

---

## Test Case 4: Goal Types and Behaviors

### Test 4.1: Savings Goal Behavior
**Steps:**
1. Create savings goal
2. Test progress updates
3. Verify positive progress tracking

**Expected Results:**
- Progress increases with positive amounts
- Savings-specific insights generated
- Appropriate icons and messaging

### Test 4.2: Spending Limit Goal
**Steps:**
1. Create spending limit goal
2. Test approaching limit scenarios
3. Verify warning thresholds

**Expected Results:**
- Warnings when nearing limit
- Different progress visualization (red for over-limit)
- Appropriate messaging for spending vs saving

### Test 4.3: Emergency Fund Goal
**Steps:**
1. Create emergency fund goal
2. Test large target amounts
3. Verify specific emergency fund insights

**Expected Results:**
- Emergency fund specific messaging
- Shield icon displayed
- Appropriate priority and insights

---

## Test Case 5: Insights System

### Test 5.1: Achievement Insights
**Steps:**
1. Complete a goal (reach 100%)
2. Check insights section
3. Verify achievement appears

**Expected Results:**
- Achievement insight with trophy icon
- Congratulatory messaging
- Actionable button to mark as completed

### Test 5.2: Warning Insights
**Steps:**
1. Create goal with tight deadline
2. Make minimal progress
3. Check for warning insights

**Expected Results:**
- Warning insight with alert icon
- Specific daily/weekly requirements mentioned
- Actionable suggestions provided

### Test 5.3: Milestone Insights
**Steps:**
1. Progress goal to 75-99% completion
2. Check for milestone insights

**Expected Results:**
- Milestone insight generated
- Encouraging messaging
- Progress percentage mentioned

### Test 5.4: Suggestion Insights
**Steps:**
1. Create goal with generous timeline
2. Make significant progress early
3. Check for suggestion insights

**Expected Results:**
- Suggestion to increase target or create new goal
- Recognition of ahead-of-schedule progress
- Actionable recommendations

---

## Test Case 6: Filtering and Views

### Test 6.1: Status Filtering
**Steps:**
1. Create goals with different statuses
2. Test status filter dropdown
3. Verify filtering works correctly

**Expected Results:**
- Active filter shows only active goals
- Completed filter shows only completed goals
- All status shows everything
- Counts in tabs update correctly

### Test 6.2: Type Filtering
**Steps:**
1. Create goals of different types
2. Test type filter dropdown
3. Combine with status filters

**Expected Results:**
- Type filters work independently
- Combined filters work correctly
- Results match selected criteria

### Test 6.3: Tab Navigation
**Steps:**
1. Switch between Overview, Active, and Completed tabs
2. Verify different content in each tab
3. Check tab counters

**Expected Results:**
- Overview shows summary and top goals
- Active tab shows only active goals
- Completed tab shows only completed goals
- Counters in tab labels accurate

---

## Test Case 7: Data Persistence

### Test 7.1: Browser Refresh
**Steps:**
1. Create several goals
2. Refresh browser page
3. Verify goals persist

**Expected Results:**
- All goals reload correctly
- Progress data maintained
- Insights recalculate properly

### Test 7.2: Browser Close/Reopen
**Steps:**
1. Create goals and close browser
2. Reopen browser and navigate to goals page
3. Verify data persistence

**Expected Results:**
- Goals persist across browser sessions
- localStorage maintains all data
- Date objects properly restored

### Test 7.3: Data Export/Import (Manual)
**Steps:**
1. Create goals
2. Export localStorage data
3. Clear localStorage
4. Import data back
5. Verify goals restored

**Expected Results:**
- Data exports cleanly
- Import restores all functionality
- No data corruption or loss

---

## Test Case 8: Edge Cases

### Test 8.1: Invalid Date Ranges
**Steps:**
1. Try creating goal with start date after end date
2. Test with past target dates
3. Verify validation

**Expected Results:**
- Appropriate validation messages
- Prevents invalid goal creation
- Suggests corrections

### Test 8.2: Zero or Negative Amounts
**Steps:**
1. Try creating goal with 0 target amount
2. Try negative amounts
3. Test progress updates with invalid amounts

**Expected Results:**
- Validation prevents invalid amounts
- Clear error messages
- System remains stable

### Test 8.3: Very Large Numbers
**Steps:**
1. Create goal with very large target (millions)
2. Test display formatting
3. Verify calculations still work

**Expected Results:**
- Large numbers display properly formatted
- Calculations remain accurate
- UI doesn't break with large values

### Test 8.4: Special Characters in Text
**Steps:**
1. Create goal with special characters in title/description
2. Include emoji, accents, symbols
3. Verify display and storage

**Expected Results:**
- Special characters display correctly
- Data persists properly
- No encoding issues

---

## Test Case 9: Performance Testing

### Test 9.1: Many Goals
**Steps:**
1. Create 20+ goals of various types
2. Navigate between tabs
3. Test filtering with large dataset

**Expected Results:**
- UI remains responsive
- Filtering works quickly
- No performance degradation

### Test 9.2: Complex Progress Calculations
**Steps:**
1. Create goals with complex date ranges
2. Test rapid progress updates
3. Monitor calculation performance

**Expected Results:**
- Calculations remain fast
- UI updates smoothly
- No lag in progress updates

---

## Test Case 10: Integration Testing

### Test 10.1: API Integration
**Steps:**
1. Create goals via UI
2. Verify API calls succeed
3. Test error handling

**Expected Results:**
- All API endpoints respond correctly
- Error states handled gracefully
- Data consistency maintained

### Test 10.2: Navigation Integration
**Steps:**
1. Navigate to goals from other pages
2. Test deep linking to specific tabs
3. Verify breadcrumbs/navigation

**Expected Results:**
- Navigation works seamlessly
- URLs update appropriately
- Back button functions correctly

---

## Accessibility Testing

### Test A.1: Keyboard Navigation
**Steps:**
1. Navigate entire goals interface using only keyboard
2. Test Tab, Enter, Escape keys
3. Verify focus indicators

**Expected Results:**
- All interactive elements keyboard accessible
- Clear focus indicators
- Logical tab order

### Test A.2: Screen Reader Support
**Steps:**
1. Test with screen reader software
2. Verify semantic markup
3. Check ARIA labels

**Expected Results:**
- Content properly announced
- Interactive elements properly labeled
- Table data accessible

---

## Bug Reporting Template

**Bug Title:** [Concise description]

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge + version]
- OS: [Windows/Mac/Linux]
- Screen size: [Desktop/Tablet/Mobile]

**Goal Configuration:**
- Goal type: [savings/spending_limit/etc.]
- Period: [monthly/yearly/etc.]
- Target amount: [amount]
- Date range: [start - end dates]

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
- localStorage data if relevant

---

## Performance Benchmarks

Document performance results:

| Test Case | Goals Count | Action | Time (ms) | Status |
|-----------|-------------|--------|-----------|---------|
| Create Goal | N/A | Create new goal | X.X | ✅/❌ |
| Load Goals | 10 | Initial page load | X.X | ✅/❌ |
| Progress Update | 20+ | Update progress | X.X | ✅/❌ |

---

## Sign-off Checklist

- [ ] Goal creation works for all types
- [ ] Progress tracking calculates correctly
- [ ] Insights generate appropriately
- [ ] Filtering and sorting function properly
- [ ] Data persists across sessions
- [ ] Edge cases handled gracefully
- [ ] Performance is acceptable
- [ ] Accessibility requirements met
- [ ] API integration works correctly
- [ ] UI is responsive and intuitive

**Tested by:** [Name]  
**Date:** [Date]  
**Environment:** [Browser/OS details]  
**Overall Status:** ✅ PASS / ❌ FAIL

---

## Sample Test Data

### Quick Test Goals
Use these for rapid testing:

1. **Emergency Fund**
   - Type: Emergency Fund
   - Target: €6,000
   - Period: Yearly
   - Start: Jan 1, 2024
   - End: Dec 31, 2024

2. **Monthly Food Budget**
   - Type: Spending Limit
   - Target: €800
   - Period: Monthly
   - Recurring: Yes

3. **Vacation Savings**
   - Type: Savings
   - Target: €2,500
   - Period: One-time
   - Start: Jan 1, 2024
   - End: Jun 30, 2024

4. **Investment Goal**
   - Type: Investment
   - Target: €500
   - Period: Monthly
   - Recurring: Yes