'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  BarChart3,
  ShoppingCart,
  Home,
  Car,
  Coffee,
  Briefcase
} from 'lucide-react';

export default function HomePage() {
  // Static data for instant loading
  const balance = 12456.78;
  const expenses = 3245.67;
  const balanceVisible = true;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const transactions = [
    { id: '1', desc: 'Salary Payment', amount: 4200, person: 'Diogo', icon: Briefcase },
    { id: '2', desc: 'Supermarket', amount: -87.45, person: 'Comum', icon: ShoppingCart }
  ];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Row - Account Balance and Expenses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Balance Widget */}
        <Card className="bg-primary text-primary-foreground shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Account Balance</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(balance)}
            </div>
            <div className="flex items-center text-primary-foreground/80 text-sm">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+2.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Widget */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1 text-red-600">
              {formatCurrency(expenses)}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
              <span>-5.2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Analytics</CardTitle>
          <div className="flex space-x-2 mt-2">
            <Button variant="default" size="sm">7d</Button>
            <Button variant="outline" size="sm">30d</Button>
            <Button variant="outline" size="sm">3m</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg border">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Analytics chart visualization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last Payments */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Last Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <transaction.icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{transaction.desc}</p>
                    <span className="text-xs text-muted-foreground">•••• •••• •••• 4590</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Report - Simple Donut */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Sales Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted-foreground/20" />
                  <circle cx="64" cy="64" r="50" stroke="#fb923c" strokeWidth="12" fill="transparent" strokeDasharray="141 314" strokeDashoffset="0" />
                  <circle cx="64" cy="64" r="50" stroke="#3b82f6" strokeWidth="12" fill="transparent" strokeDasharray="110 314" strokeDashoffset="-141" />
                  <circle cx="64" cy="64" r="50" stroke="#eab308" strokeWidth="12" fill="transparent" strokeDasharray="63 314" strokeDashoffset="-251" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-sm">Sales</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Orders</span>
                </div>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Returns</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}