import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Family Finances',
  description: 'User permissions and system administration',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Family Finances Administration
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}