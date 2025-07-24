import { Suspense } from 'react';

// Minimal inline styles for performance
const styles = {
  container: { padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px' },
  card: { background: '#f8f9fa', padding: '15px', margin: '10px 0', borderRadius: '4px', border: '1px solid #e9ecef' },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px' },
  th: { background: '#e9ecef', padding: '8px', textAlign: 'left' as const, borderBottom: '2px solid #dee2e6' },
  td: { padding: '8px', borderBottom: '1px solid #e9ecef' },
  green: { color: '#28a745', fontWeight: 'bold' as const },
  red: { color: '#dc3545', fontWeight: 'bold' as const },
  link: { color: '#007bff', textDecoration: 'none', marginRight: '15px' }
};

// Static data for instant loading
const transactions = [
  { id: '1', date: '15/01/2025', desc: 'SALARIO MENSAL EMPRESA XYZ', amount: 2800, flow: 'ENTRADA', category: 'Salário → Salario Liq.', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 95 },
  { id: '2', date: '20/01/2025', desc: 'CONTINENTE COLOMBO', amount: 85.40, flow: 'SAIDA', category: 'Alimentação → Supermercado', origin: 'Comum', bank: 'Millennium BCP', validated: true, confidence: 92 },
  { id: '3', date: '18/01/2025', desc: 'GALP ENERGIA BENFICA', amount: 65.20, flow: 'SAIDA', category: 'Transportes → Combustível', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 98 },
  { id: '4', date: '22/01/2025', desc: 'RESTAURANTE AVENIDAS NOVAS', amount: 45.50, flow: 'SAIDA', category: 'Alimentação → Refeições fora', origin: 'Joana', bank: 'Montepio', validated: false, confidence: 85 },
  { id: '5', date: '10/01/2025', desc: 'EDP COMERCIAL FATURA JANEIRO', amount: 120.30, flow: 'SAIDA', category: 'Casa → Electricidade', origin: 'Comum', bank: 'Activo Bank', validated: true, confidence: 96 },
  { id: '6', date: '15/12/2024', desc: 'SALARIO DEZEMBRO + SUBSIDIO NATAL', amount: 3200, flow: 'ENTRADA', category: 'Salário → Salario Liq.', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 95 },
  { id: '7', date: '24/12/2024', desc: 'PINGO DOCE COMPRAS NATAL', amount: 245.80, flow: 'SAIDA', category: 'Alimentação → Supermercado', origin: 'Comum', bank: 'Millennium BCP', validated: true, confidence: 88 },
  { id: '8', date: '01/12/2024', desc: 'HOLMES PLACE MENSALIDADE', amount: 75.00, flow: 'SAIDA', category: 'Desporto → Ginásio', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 94 },
  { id: '9', date: '03/12/2024', desc: 'SPOTIFY PREMIUM FAMILY', amount: 7.99, flow: 'SAIDA', category: 'Subscrições → Spotify', origin: 'Joana', bank: 'Montepio', validated: true, confidence: 99 },
  { id: '10', date: '15/11/2024', desc: 'SALARIO NOVEMBRO EMPRESA XYZ', amount: 2800, flow: 'ENTRADA', category: 'Salário → Salario Liq.', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 95 },
  { id: '11', date: '25/11/2024', desc: 'LIDL COMPRAS SEMANAIS', amount: 67.30, flow: 'SAIDA', category: 'Alimentação → Supermercado', origin: 'Comum', bank: 'Millennium BCP', validated: true, confidence: 91 },
  { id: '12', date: '18/11/2024', desc: 'BP BENFICA POSTO COMBUSTIVEL', amount: 58.90, flow: 'SAIDA', category: 'Transportes → Combustível', origin: 'Diogo', bank: 'Activo Bank', validated: true, confidence: 97 }
];

// Pre-calculated summary
const totalIncome = 8800;
const totalExpenses = 771.39;
const netAmount = 8028.61;

function SummaryCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0' }}>
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>Total Income</h3>
        <div style={{ ...styles.green, fontSize: '24px' }}>€{totalIncome.toLocaleString()}</div>
      </div>
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>Total Expenses</h3>
        <div style={{ ...styles.red, fontSize: '24px' }}>€{totalExpenses.toLocaleString()}</div>
      </div>
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>Net Amount</h3>
        <div style={{ ...styles.green, fontSize: '24px' }}>€{netAmount.toLocaleString()}</div>
      </div>
      <div style={styles.card}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>Transactions</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{transactions.length}</div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: typeof transactions[0] }) {
  return (
    <tr>
      <td style={styles.td}>{transaction.date}</td>
      <td style={styles.td}>{transaction.desc}</td>
      <td style={{ ...styles.td, textAlign: 'right', ...(transaction.flow === 'ENTRADA' ? styles.green : styles.red) }}>
        {transaction.flow === 'ENTRADA' ? '+' : '-'}€{transaction.amount.toFixed(2)}
      </td>
      <td style={styles.td}>{transaction.category}</td>
      <td style={styles.td}>{transaction.origin}</td>
      <td style={styles.td}>{transaction.bank}</td>
      <td style={{ ...styles.td, textAlign: 'center' }}>
        <span style={{ 
          background: transaction.validated ? '#d4edda' : '#fff3cd', 
          padding: '2px 6px', 
          borderRadius: '3px', 
          fontSize: '12px' 
        }}>
          {transaction.validated ? '✓' : '⏳'} {transaction.confidence}%
        </span>
      </td>
    </tr>
  );
}

function TransactionTable() {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Description</th>
          <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
          <th style={styles.th}>Category</th>
          <th style={styles.th}>Origin</th>
          <th style={styles.th}>Bank</th>
          <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </tbody>
    </table>
  );
}

export default function FastPage() {
  return (
    <div style={styles.container}>
      <header style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#343a40' }}>SmartExpense - Fast Dashboard</h1>
        <nav>
          <a href="/" style={styles.link}>Home</a>
          <a href="/dashboard" style={styles.link}>Full Dashboard</a>
          <a href="/transactions" style={styles.link}>Edit Transactions</a>
          <a href="/test-simple" style={styles.link}>Simple View</a>
        </nav>
      </header>

      <Suspense fallback={<div>Loading summary...</div>}>
        <SummaryCards />
      </Suspense>

      <div style={styles.card}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>Recent Transactions</h2>
        <Suspense fallback={<div>Loading transactions...</div>}>
          <TransactionTable />
        </Suspense>
      </div>

      <footer style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '4px', fontSize: '12px', color: '#6c757d' }}>
        <p><strong>Performance optimizations:</strong></p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Static data (no database calls)</li>
          <li>Inline styles (no CSS loading)</li>
          <li>Minimal JavaScript bundle</li>
          <li>Server-side rendering</li>
          <li>Component splitting with Suspense</li>
        </ul>
      </footer>
    </div>
  );
}