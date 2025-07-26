import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { SidebarNavigation } from '@/components/layout/sidebar-navigation';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartExpense - Intelligent Family Finance Management',
  description: 'Automated expense tracking with ML-powered categorization and multi-channel access',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-background">
            {/* Sidebar Navigation */}
            <SidebarNavigation />
            
            {/* Main Content Area - Dynamic margin based on sidebar state */}
            <div className="ml-64 flex flex-col min-h-screen transition-all duration-300"
                 style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}>
              {/* Top Header */}
              <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16">
                <div className="flex h-16 items-center justify-between px-6">
                  <div className="flex items-center space-x-4">
                    {/* Page title will be added per page */}
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type to search..."
                        className="w-64 h-10 pl-10 pr-4 rounded-lg border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Notification Icon */}
                    <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User Profile Photo */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 overflow-hidden border-2 border-background shadow-md">
                        <img 
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                          alt="User Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </header>
              
              {/* Page Content */}
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}