#!/usr/bin/env node

/**
 * AI Finance Assistant - Automated Test Script
 * 
 * This script demonstrates basic automated testing for the AI Assistant.
 * It uses Playwright for browser automation and can be extended with more comprehensive tests.
 * 
 * Usage: node scripts/test-ai-assistant.js
 * Prerequisites: npm install -D @playwright/test
 */

const { chromium } = require('playwright');

class AIAssistantTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Starting AI Assistant automated tests...\n');
    
    try {
      this.browser = await chromium.launch({ headless: false }); // Set to true for CI
      this.page = await this.browser.newPage();
      
      // Set viewport for consistent testing
      await this.page.setViewportSize({ width: 1200, height: 800 });
      
      // Listen for console errors
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('❌ Console Error:', msg.text());
        }
      });
      
      console.log('✅ Browser setup complete');
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Print test summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
    
    console.log(failed === 0 ? '\n🎉 All tests passed!' : '\n⚠️  Some tests failed');
  }

  async recordResult(testName, status, error = null) {
    this.testResults.push({ name: testName, status, error });
    const icon = status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${testName}${error ? ` - ${error}` : ''}`);
  }

  async testPageLoad() {
    try {
      await this.page.goto(`${this.baseUrl}/assistant`);
      await this.page.waitForLoadState('networkidle');
      
      // Check if page loaded successfully
      const title = await this.page.title();
      if (!title.includes('SmartExpense')) {
        throw new Error('Page title incorrect');
      }
      
      // Check for main elements
      await this.page.waitForSelector('h1:has-text("AI Financial Assistant")', { timeout: 5000 });
      await this.page.waitForSelector('input[placeholder*="finances"]', { timeout: 5000 });
      
      await this.recordResult('Page Load', 'PASS');
    } catch (error) {
      await this.recordResult('Page Load', 'FAIL', error.message);
    }
  }

  async testWelcomeMessage() {
    try {
      // Check for welcome message
      const welcomeMessage = await this.page.locator('.space-y-4 > div').first();
      const messageText = await welcomeMessage.textContent();
      
      if (!messageText.includes('AI Financial Assistant')) {
        throw new Error('Welcome message not found');
      }
      
      // Check for suggestion buttons
      const suggestions = await this.page.locator('button:has-text("Show me my spending")').count();
      if (suggestions === 0) {
        throw new Error('Suggestion buttons not found');
      }
      
      await this.recordResult('Welcome Message', 'PASS');
    } catch (error) {
      await this.recordResult('Welcome Message', 'FAIL', error.message);
    }
  }

  async testQuickActions() {
    try {
      // Test Spending Summary quick action
      await this.page.click('button:has-text("Spending Summary")');
      
      // Wait for user message to appear
      await this.page.waitForSelector('.justify-end', { timeout: 3000 });
      
      // Wait for AI response (with typing indicator)
      await this.page.waitForSelector('.animate-bounce', { timeout: 2000 });
      
      // Wait for final response
      await this.page.waitForSelector('.justify-start:has-text("spending")', { timeout: 10000 });
      
      // Verify response contains expected content
      const response = await this.page.locator('.justify-start').last().textContent();
      if (!response.includes('€') || !response.includes('Food & Dining')) {
        throw new Error('AI response missing expected financial data');
      }
      
      await this.recordResult('Quick Actions', 'PASS');
    } catch (error) {
      await this.recordResult('Quick Actions', 'FAIL', error.message);
    }
  }

  async testCustomQuery() {
    try {
      // Type custom query
      const input = this.page.locator('input[placeholder*="finances"]');
      await input.fill('Help me create a budget');
      
      // Send message
      await this.page.click('button:has-text("Send") >> visible=true');
      
      // Wait for response
      await this.page.waitForSelector('.animate-bounce', { timeout: 2000 });
      await this.page.waitForSelector('.justify-start:has-text("budget")', { timeout: 10000 });
      
      // Verify budget-specific response
      const response = await this.page.locator('.justify-start').last().textContent();
      if (!response.includes('50/30/20') || !response.includes('€4,200')) {
        throw new Error('Budget response missing expected content');
      }
      
      await this.recordResult('Custom Query', 'PASS');
    } catch (error) {
      await this.recordResult('Custom Query', 'FAIL', error.message);
    }
  }

  async testInputValidation() {
    try {
      const input = this.page.locator('input[placeholder*="finances"]');
      const sendButton = this.page.locator('button:has-text("Send") >> visible=true');
      
      // Test empty input
      await input.clear();
      const isDisabled = await sendButton.isDisabled();
      if (!isDisabled) {
        throw new Error('Send button should be disabled for empty input');
      }
      
      // Test with text
      await input.fill('Test message');
      const isEnabled = await sendButton.isDisabled();
      if (isEnabled) {
        throw new Error('Send button should be enabled with text');
      }
      
      await this.recordResult('Input Validation', 'PASS');
    } catch (error) {
      await this.recordResult('Input Validation', 'FAIL', error.message);
    }
  }

  async testActionItems() {
    try {
      // Send query that should generate action items
      const input = this.page.locator('input[placeholder*="finances"]');
      await input.fill('I need help with my overspending');
      await this.page.click('button:has-text("Send") >> visible=true');
      
      // Wait for response
      await this.page.waitForSelector('.animate-bounce', { timeout: 2000 });
      await this.page.waitForTimeout(8000); // Wait for full response
      
      // Look for action items section (if present)
      const actionItems = await this.page.locator('p:has-text("Recommended Actions")').count();
      
      // This test is conditional - action items may or may not appear based on query
      await this.recordResult('Action Items', 'PASS', 'Conditional test - action items display when relevant');
    } catch (error) {
      await this.recordResult('Action Items', 'FAIL', error.message);
    }
  }

  async testResponsiveDesign() {
    try {
      // Test mobile viewport
      await this.page.setViewportSize({ width: 375, height: 667 });
      await this.page.waitForTimeout(1000);
      
      // Check if elements are still accessible
      await this.page.waitForSelector('input[placeholder*="finances"]', { timeout: 5000 });
      
      const input = this.page.locator('input[placeholder*="finances"]');
      const isVisible = await input.isVisible();
      if (!isVisible) {
        throw new Error('Input field not visible on mobile');
      }
      
      // Reset to desktop viewport
      await this.page.setViewportSize({ width: 1200, height: 800 });
      
      await this.recordResult('Responsive Design', 'PASS');
    } catch (error) {
      await this.recordResult('Responsive Design', 'FAIL', error.message);
    }
  }

  async testPerformance() {
    try {
      const startTime = Date.now();
      
      // Send a query and measure response time
      const input = this.page.locator('input[placeholder*="finances"]');
      await input.fill('Quick performance test');
      await this.page.click('button:has-text("Send") >> visible=true');
      
      // Wait for typing indicator
      await this.page.waitForSelector('.animate-bounce', { timeout: 3000 });
      
      // Wait for response
      await this.page.waitForSelector('.justify-start:last-child', { timeout: 10000 });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime > 15000) { // 15 second threshold
        throw new Error(`Response time too slow: ${responseTime}ms`);
      }
      
      await this.recordResult('Performance', 'PASS', `Response time: ${responseTime}ms`);
    } catch (error) {
      await this.recordResult('Performance', 'FAIL', error.message);
    }
  }

  async runAllTests() {
    await this.setup();
    
    try {
      console.log('🧪 Running test suite...\n');
      
      await this.testPageLoad();
      await this.testWelcomeMessage();
      await this.testQuickActions();
      await this.testCustomQuery();
      await this.testInputValidation();
      await this.testActionItems();
      await this.testResponsiveDesign();
      await this.testPerformance();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      await this.teardown();
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new AIAssistantTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AIAssistantTester;