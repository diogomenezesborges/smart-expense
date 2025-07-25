// Quick test script for GoCardless authentication
const fetch = require('node-fetch');

async function testGoCardlessAuth() {
  const SECRET_ID = "c6df0ed3-7ee5-495a-980f-6e853399576d";
  const SECRET_KEY = "your-secret-key-for-smart_expenses-account"; // Replace with actual key
  
  console.log('🔍 Testing GoCardless Bank Account Data API...');
  console.log('SECRET_ID:', SECRET_ID);
  
  try {
    // Step 1: Get access token
    console.log('\n📡 Step 1: Getting access token...');
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_id: SECRET_ID,
        secret_key: SECRET_KEY,
      }),
    });
    
    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Failed to get token:', errorText);
      return;
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token obtained successfully!');
    console.log('Access token:', tokenData.access.substring(0, 20) + '...');
    console.log('Expires in:', tokenData.access_expires, 'seconds');
    
    // Step 2: Test API call - get requisitions
    console.log('\n📋 Step 2: Getting requisitions...');
    const requisitionsResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/requisitions/', {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${tokenData.access}`,
      },
    });
    
    console.log('Requisitions response status:', requisitionsResponse.status);
    
    if (!requisitionsResponse.ok) {
      const errorText = await requisitionsResponse.text();
      console.error('❌ Failed to get requisitions:', errorText);
      return;
    }
    
    const requisitionsData = await requisitionsResponse.json();
    console.log('✅ Requisitions fetched successfully!');
    console.log('Found', requisitionsData.count, 'requisitions');
    
    if (requisitionsData.results && requisitionsData.results.length > 0) {
      console.log('\n🏦 Connected accounts:');
      requisitionsData.results.forEach((req, index) => {
        console.log(`  ${index + 1}. Status: ${req.status}, Accounts: ${req.accounts?.length || 0}`);
        if (req.accounts && req.accounts.length > 0) {
          console.log(`     Account IDs: ${req.accounts.join(', ')}`);
        }
      });
      
      // Try to get details for first account
      const activeReq = requisitionsData.results.find(req => req.status === 'LN' && req.accounts?.length > 0);
      if (activeReq) {
        console.log('\n💳 Testing account details for first active account...');
        const accountId = activeReq.accounts[0];
        
        const accountResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${tokenData.access}`,
          },
        });
        
        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          console.log('✅ Account details:', {
            id: accountData.id,
            iban: accountData.iban?.substring(0, 8) + '****', // Masked for security
            institution: accountData.institution_id,
            status: accountData.status,
          });
        }
        
        // Try to get recent transactions
        console.log('\n💰 Testing transactions for first active account...');
        const transactionsResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions/`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${tokenData.access}`,
          },
        });
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          const transactions = transactionsData.transactions?.booked || [];
          console.log('✅ Transactions fetched successfully!');
          console.log('Found', transactions.length, 'transactions');
          
          if (transactions.length > 0) {
            console.log('\n📊 Sample transactions:');
            transactions.slice(0, 3).forEach((tx, index) => {
              console.log(`  ${index + 1}. ${tx.booking_date}: ${tx.amount} ${tx.currency}`);
              console.log(`     ${tx.remittance_information_unstructured || 'No description'}`);
            });
          }
        } else {
          console.log('⚠️ Could not fetch transactions:', transactionsResponse.status);
        }
      }
    } else {
      console.log('⚠️ No active requisitions found. You may need to connect your bank accounts first.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGoCardlessAuth();