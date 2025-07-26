'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Home,
  BarChart3,
  CreditCard,
  Target,
  PiggyBank,
  TrendingUp,
  Users,
  Settings,
  Bell,
  HelpCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Wallet,
  FileText,
  Calendar,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  section: 'main' | 'tools' | 'preferences' | 'account';
}

interface SidebarNavigationProps {
  className?: string;
}

export function SidebarNavigation({ className }: SidebarNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  const navigationItems: NavigationItem[] = [
    // Main Navigation
    {
      id: 'home',
      label: 'Homepage',
      href: '/',
      icon: <Home className="h-4 w-4" />,
      section: 'main'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      section: 'main'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/transactions',
      icon: <CreditCard className="h-4 w-4" />,
      section: 'main'
    },
    {
      id: 'budgeting',
      label: 'Budgeting',
      href: '/budgeting',
      icon: <Target className="h-4 w-4" />,
      section: 'main'
    },
    {
      id: 'goals',
      label: 'Goals',
      href: '/goals',
      icon: <PiggyBank className="h-4 w-4" />,
      section: 'main'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: <TrendingUp className="h-4 w-4" />,
      section: 'main'
    },

    // Tools & Features
    {
      id: 'assistant',
      label: 'AI Assistant',
      href: '/assistant',
      icon: <Shield className="h-4 w-4" />,
      badge: 'Premium',
      section: 'tools'
    },
    {
      id: 'export',
      label: 'Export',
      href: '/export',
      icon: <FileText className="h-4 w-4" />,
      section: 'tools'
    },
    {
      id: 'banking',
      label: 'Bank Connection',
      href: '/banking/connect',
      icon: <Wallet className="h-4 w-4" />,
      section: 'tools'
    },

    // Preferences
    {
      id: 'notifications',
      label: 'Notifications',
      href: '/notifications',
      icon: <Bell className="h-4 w-4" />,
      section: 'preferences'
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
      section: 'preferences'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'main': return 'Navigation';
      case 'tools': return 'Tools';
      case 'preferences': return 'Preferences';
      case 'account': return 'Account';
      default: return '';
    }
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  return (
    <div className={`fixed left-0 top-0 z-40 flex flex-col h-screen bg-background border-r shadow-lg ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg">SmartExpense</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <div className="flex justify-center mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-b">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Diogo</p>
              <p className="text-xs text-muted-foreground">Premium Account</p>
            </div>
          )}
        </div>
      </div>


      {/* Navigation - Optimized for all icons */}
      <div className="flex-1 overflow-y-auto py-2 min-h-0 scrollbar-hide">
        <div className="space-y-4 pb-2">
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section} className={isCollapsed ? 'px-2' : 'px-4'}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {getSectionTitle(section)}
                </h3>
              )}
              <div className="space-y-0.5">
                {items.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? 'secondary' : 'ghost'}
                      className={`w-full h-9 ${isCollapsed ? 'px-0 justify-center' : 'px-3 justify-start'} ${
                        isActive(item.href) 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {isCollapsed ? (
                        item.icon
                      ) : (
                        <div className="flex items-center space-x-3 w-full">
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </Button>
                  </Link>
                ))}
                
                {/* Theme Toggle in Preferences section */}
                {section === 'preferences' && mounted && (
                  <div className={`${isCollapsed ? 'px-0' : 'px-3'} mt-2`}>
                    {!isCollapsed ? (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          {resolvedTheme === 'dark' ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                          </span>
                        </div>
                        <Switch
                          checked={resolvedTheme === 'dark'}
                          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                          className="h-9 w-full"
                          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                          {resolvedTheme === 'dark' ? (
                            <Moon className="h-4 w-4" />
                          ) : (
                            <Sun className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {section !== 'preferences' && !isCollapsed && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${isCollapsed ? 'px-2' : ''}`}>
        <Link href="/help">
          <Button 
            variant="ghost" 
            className={`w-full h-9 ${isCollapsed ? 'px-0 justify-center' : 'px-3 justify-start'}`}
            title={isCollapsed ? 'Help & Support' : undefined}
          >
            <HelpCircle className="h-4 w-4" />
            {!isCollapsed && <span className="ml-3">Help & Support</span>}
          </Button>
        </Link>
      </div>
    </div>
  );
}