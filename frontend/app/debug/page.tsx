export default function DebugPage() {
  const startTime = Date.now();
  console.log(`[DEBUG] Page render started at: ${new Date().toISOString()}`);
  
  // Log environment info
  console.log(`[DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DEBUG] Next.js version: 14.2.30`);
  
  const renderTime = Date.now() - startTime;
  console.log(`[DEBUG] Page render took: ${renderTime}ms`);

  return (
    <html>
      <head>
        <title>Debug Page</title>
      </head>
      <body style={{ fontFamily: 'monospace', padding: '20px' }}>
        <h1>Debug Information</h1>
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
          <h2>Page Load Performance</h2>
          <p>Server render time: {renderTime}ms</p>
          <p>Timestamp: {new Date().toISOString()}</p>
        </div>

        <div style={{ background: '#e8f5e8', padding: '10px', margin: '10px 0' }}>
          <h2>Environment</h2>
          <p>Node Environment: {process.env.NODE_ENV || 'undefined'}</p>
          <p>Database URL: {process.env.DATABASE_URL ? 'Set' : 'Not set'}</p>
        </div>

        <div style={{ background: '#fff3cd', padding: '10px', margin: '10px 0' }}>
          <h2>Performance Test</h2>
          <p>This page should load instantly as it has:</p>
          <ul>
            <li>No external dependencies</li>
            <li>No database calls</li>
            <li>No client-side JavaScript</li>
            <li>Minimal HTML</li>
            <li>Inline styles only</li>
          </ul>
        </div>

        <div style={{ background: '#f8d7da', padding: '10px', margin: '10px 0' }}>
          <h2>Common Issues</h2>
          <p>If this page is slow, the issue might be:</p>
          <ul>
            <li>Windows WSL performance (very common)</li>
            <li>Node modules in WSL filesystem</li>
            <li>Next.js compilation in development mode</li>
            <li>File watching overhead</li>
            <li>Antivirus scanning node_modules</li>
          </ul>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('[CLIENT] Page loaded at:', new Date().toISOString());
            console.log('[CLIENT] DOM ready');
            
            // Measure client-side timing
            window.addEventListener('load', function() {
              console.log('[CLIENT] Window load event fired');
              
              // Add a visible timer
              const timer = document.getElementById('client-timer');
              let startTime = Date.now();
              
              function updateTimer() {
                const elapsed = Date.now() - startTime;
                if (timer) {
                  timer.textContent = elapsed + 'ms since page load';
                }
              }
              
              setInterval(updateTimer, 100);
            });
          `
        }} />

        <div style={{ background: '#d1ecf1', padding: '10px', margin: '10px 0' }}>
          <h2>Client-Side Timer</h2>
          <p id="client-timer">Loading...</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h2>Navigation</h2>
          <a href="/" style={{ marginRight: '10px', color: 'blue' }}>Home</a>
          <a href="/fast" style={{ marginRight: '10px', color: 'blue' }}>Fast Page</a>
          <a href="/test-simple" style={{ marginRight: '10px', color: 'blue' }}>Simple Page</a>
        </div>
      </body>
    </html>
  );
}