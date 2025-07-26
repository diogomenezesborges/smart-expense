'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testApi() {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  async function testTransactions() {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions?limit=5');
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  async function testSummary() {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/summary');
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testApi} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Basic API'}
        </button>
        
        <button 
          onClick={testTransactions} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Transactions API
        </button>
        
        <button 
          onClick={testSummary} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Test Summary API
        </button>
      </div>

      {result && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          fontSize: '12px'
        }}>
          <h3>API Response:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <a href="/debug" style={{ color: 'blue', marginRight: '15px' }}>Debug Page</a>
        <a href="/fast" style={{ color: 'blue', marginRight: '15px' }}>Fast Page</a>
        <a href="/" style={{ color: 'blue' }}>Home</a>
      </div>
    </div>
  );
}