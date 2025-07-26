import { prisma } from '@/lib/database/client';

async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
        origin: true,
        bank: true,
      },
      orderBy: { date: 'desc' },
      take: 20,
    });
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export default async function SimplePage() {
  const transactions = await getTransactions();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>SmartExpense - Simple View</h1>
      <p>Fast loading transaction table ({transactions.length} records)</p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Description</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Amount</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Category</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Origin</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Bank</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(t.date).toLocaleDateString('pt-PT')}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {t.description}
              </td>
              <td style={{ 
                border: '1px solid #ddd', 
                padding: '8px', 
                textAlign: 'right',
                color: t.flow === 'ENTRADA' ? 'green' : 'red',
                fontWeight: 'bold'
              }}>
                {t.flow === 'ENTRADA' ? '+' : '-'}
                €{(t.incomes || t.outgoings || 0).toFixed(2)}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {t.category.category} → {t.category.subCategory}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {t.origin.name}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {t.bank.name}
              </td>
              <td style={{ 
                border: '1px solid #ddd', 
                padding: '8px', 
                textAlign: 'center',
                backgroundColor: t.isValidated ? '#d4edda' : '#fff3cd'
              }}>
                {t.isValidated ? '✓' : '⏳'} {Math.round(t.aiConfidence * 100)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
        <h3>Summary</h3>
        <p>
          Total Income: €{transactions.filter(t => t.flow === 'ENTRADA').reduce((sum, t) => sum + (t.incomes || 0), 0).toFixed(2)}
        </p>
        <p>
          Total Expenses: €{transactions.filter(t => t.flow === 'SAIDA').reduce((sum, t) => sum + (t.outgoings || 0), 0).toFixed(2)}
        </p>
        <p>
          Net: €{(
            transactions.filter(t => t.flow === 'ENTRADA').reduce((sum, t) => sum + (t.incomes || 0), 0) -
            transactions.filter(t => t.flow === 'SAIDA').reduce((sum, t) => sum + (t.outgoings || 0), 0)
          ).toFixed(2)}
        </p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/dashboard" style={{ marginRight: '10px', color: 'blue' }}>Dashboard</a>
        <a href="/transactions" style={{ marginRight: '10px', color: 'blue' }}>Full Editor</a>
        <a href="/" style={{ color: 'blue' }}>Home</a>
      </div>
    </div>
  );
}