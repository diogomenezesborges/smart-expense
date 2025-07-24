export default function AnalyticsPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Analytics</h1>
      <p>Analytics page - Coming soon!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', marginRight: '15px' }}>Home</a>
        <a href="/dashboard" style={{ color: 'blue', marginRight: '15px' }}>Dashboard</a>
        <a href="/transactions" style={{ color: 'blue', marginRight: '15px' }}>Transactions</a>
        <a href="/api-test" style={{ color: 'blue' }}>API Test</a>
      </div>
    </div>
  );
}