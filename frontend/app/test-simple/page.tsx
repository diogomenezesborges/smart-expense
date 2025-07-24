export default function TestSimplePage() {
  const mockData = [
    { date: '2025-01-15', desc: 'SALARIO MENSAL EMPRESA XYZ', amount: 2800, type: 'income', category: 'Salário', origin: 'Diogo', bank: 'Activo' },
    { date: '2025-01-20', desc: 'CONTINENTE COLOMBO', amount: -85.40, type: 'expense', category: 'Supermercado', origin: 'Comum', bank: 'Millennium' },
    { date: '2025-01-18', desc: 'GALP ENERGIA BENFICA', amount: -65.20, type: 'expense', category: 'Combustível', origin: 'Diogo', bank: 'Activo' },
    { date: '2024-12-15', desc: 'SALARIO DEZEMBRO + SUBSIDIO NATAL', amount: 3200, type: 'income', category: 'Salário', origin: 'Diogo', bank: 'Activo' },
    { date: '2024-12-24', desc: 'PINGO DOCE COMPRAS NATAL', amount: -245.80, type: 'expense', category: 'Supermercado', origin: 'Comum', bank: 'Millennium' },
  ];

  const totalIncome = mockData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(mockData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));

  return (
    <html>
      <body style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
        <h1>SmartExpense - Quick View</h1>
        <p>Sample data preview (fast loading)</p>
        
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #ccc' }}>
          <h3>Financial Summary</h3>
          <div style={{ display: 'flex', gap: '30px' }}>
            <div>
              <strong style={{ color: 'green' }}>Income: €{totalIncome.toLocaleString()}</strong>
            </div>
            <div>
              <strong style={{ color: 'red' }}>Expenses: €{totalExpenses.toLocaleString()}</strong>
            </div>
            <div>
              <strong>Net: €{(totalIncome - totalExpenses).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Date</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>Amount</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Origin</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Bank</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((transaction, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {new Date(transaction.date).toLocaleDateString('pt-PT')}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {transaction.desc}
                </td>
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: '10px', 
                  textAlign: 'right',
                  color: transaction.type === 'income' ? 'green' : 'red',
                  fontWeight: 'bold'
                }}>
                  €{Math.abs(transaction.amount).toFixed(2)}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {transaction.category}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {transaction.origin}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  {transaction.bank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>← Home</a>
            <a href="/dashboard" style={{ color: 'blue', textDecoration: 'underline' }}>Dashboard</a>
            <a href="/transactions" style={{ color: 'blue', textDecoration: 'underline' }}>Edit Transactions</a>
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <p>This is a fast-loading preview with sample data from your SmartExpense system.</p>
          <p>Your actual data includes: €8,800 income, €771.39 expenses, €8,028.61 net</p>
        </div>
      </body>
    </html>
  );
}