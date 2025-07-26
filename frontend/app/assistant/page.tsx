'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingUp, 
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  BarChart3,
  DollarSign,
  PiggyBank,
  CreditCard
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

interface QuickAction {
  id: string;
  label: string;
  query: string;
  icon: React.ReactNode;
  color: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI financial assistant. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "Analyze my spending this month",
        "How's my budget looking?", 
        "Any savings opportunities?",
        "Help me with my financial goals"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'expense-ratios',
      label: 'Expense Ratios',
      query: 'SELECT expense_ratios FROM categories COMPARE TO industry_benchmarks',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'bg-primary'
    },
    {
      id: 'savings-analysis',
      label: 'Savings Analysis', 
      query: 'CALCULATE savings_rate, cash_flow FROM income_expenses WHERE month = current',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-success'
    },
    {
      id: 'cost-optimization',
      label: 'Cost Optimization',
      query: 'FIND optimization_opportunities FROM variable_costs ORDER BY potential_savings DESC',
      icon: <PiggyBank className="h-4 w-4" />,
      color: 'bg-info'
    },
    {
      id: 'risk-assessment',
      label: 'Risk Assessment',
      query: 'ANALYZE financial_risk FROM debt_ratio, emergency_fund, expense_volatility',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-warning'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userQuery: string): Promise<Message> => {
    try {
      // Enhanced financial context for the AI with comprehensive business rules
      const enhancedContext = {
        userId: 'current-user',
        totalIncome: 3500,
        totalExpenses: 2800,
        
        // Hierarchical category breakdown
        categories: {
          byMajorCategory: {
            'Housing': 950,
            'Food & Dining': 980,
            'Transportation': 340,
            'Entertainment & Lifestyle': 350,
            'Healthcare': 150,
            'Shopping': 30
          },
          byCategory: {
            'Bills & Utilities': 950,
            'Groceries': 460,
            'Restaurants': 520,
            'Car Expenses': 180,
            'Public Transport': 160,
            'Entertainment': 200,
            'Personal Care': 150,
            'Healthcare': 150,
            'Shopping': 30
          },
          bySubCategory: {
            'Electricity': 320,
            'Water': 180,
            'Internet': 450,
            'Supermarket': 460,
            'Restaurants': 420,
            'Take-away': 100,
            'Fuel': 120,
            'Car Maintenance': 60,
            'Metro/Bus': 160,
            'Movies': 80,
            'Sports': 70,
            'Streaming': 50,
            'Pharmacy': 80,
            'Medical': 70,
            'Clothing': 30
          },
          hierarchy: [
            { majorCategory: 'Food & Dining', category: 'Groceries', subCategory: 'Supermarket', amount: 460, percentage: 16.4 },
            { majorCategory: 'Housing', category: 'Bills & Utilities', subCategory: 'Internet', amount: 450, percentage: 16.1 },
            { majorCategory: 'Food & Dining', category: 'Restaurants', subCategory: 'Restaurants', amount: 420, percentage: 15.0 },
            { majorCategory: 'Housing', category: 'Bills & Utilities', subCategory: 'Electricity', amount: 320, percentage: 11.4 },
            { majorCategory: 'Housing', category: 'Bills & Utilities', subCategory: 'Water', amount: 180, percentage: 6.4 },
            { majorCategory: 'Transportation', category: 'Public Transport', subCategory: 'Metro/Bus', amount: 160, percentage: 5.7 },
            { majorCategory: 'Healthcare', category: 'Personal Care', subCategory: 'Pharmacy', amount: 80, percentage: 2.9 }
          ]
        },
        
        // Spending by person/origin
        spendingByOrigin: {
          'Comum': 1680,  // Joint expenses (60%)
          'Diogo': 700,   // Diogo's personal (25%)
          'Joana': 420    // Joana's personal (15%)
        },
        
        // Transaction patterns and insights
        transactionPatterns: {
          totalTransactions: 127,
          averageTransactionSize: 22.05,
          recurringTransactions: [
            { description: 'Supermarket Continente', amount: 120, frequency: 'weekly' as const, category: 'Groceries', origin: 'Comum' },
            { description: 'Metro Card Top-up', amount: 40, frequency: 'monthly' as const, category: 'Public Transport', origin: 'Diogo' },
            { description: 'Netflix Subscription', amount: 15.99, frequency: 'monthly' as const, category: 'Streaming', origin: 'Comum' }
          ],
          unusualTransactions: [
            { id: 'tx_001', description: 'Electronics Store - Laptop', amount: 899, date: '2024-01-15', reason: 'high_amount' as const },
            { id: 'tx_002', description: 'Luxury Restaurant', amount: 180, date: '2024-01-20', reason: 'unusual_category' as const }
          ]
        },
        
        // Enhanced goals with priorities
        goals: [
          {
            id: '1',
            name: 'Emergency Fund',
            target: 5000,
            current: 3200,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            category: 'Savings',
            priority: 'high' as const
          },
          {
            id: '2',
            name: 'Vacation Fund',
            target: 2000,
            current: 800,
            deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            category: 'Travel',
            priority: 'medium' as const
          }
        ],
        
        // Budget vs actual comparison
        budgetComparison: {
          planned: {
            'Food & Dining': 800,
            'Housing': 900,
            'Transportation': 300,
            'Entertainment': 200
          },
          actual: {
            'Food & Dining': 980,
            'Housing': 950,
            'Transportation': 340,
            'Entertainment': 200
          },
          variance: {
            'Food & Dining': 180,  // Over budget
            'Housing': 50,         // Over budget
            'Transportation': 40,  // Over budget
            'Entertainment': 0     // On budget
          }
        },
        
        timeframe: '1month' as const,
        currency: 'EUR' as const,
        analysisDate: new Date().toISOString()
      };

      // Call the new Gemini API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userQuery,
          context: enhancedContext,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      if (data.success) {
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.message,
          timestamp: new Date(),
          suggestions: data.followUpQuestions || [
            "ANALYZE my_biggest_expenses FROM categories",
            "SELECT optimization_opportunities FROM spending_patterns", 
            "CALCULATE savings_potential FROM variable_costs"
          ]
        };
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error processing AI query:', error);
      
      let errorContent = "I apologize, but I'm having trouble processing your financial analysis request.";
      let suggestions = [
        "SELECT savings_rate FROM current_month",
        "ANALYZE expense_ratios FROM all_categories",
        "CALCULATE emergency_fund_progress FROM goals"
      ];
      
      // Handle specific error types
      if (error.message?.includes('MISSING_API_KEY') || error.message?.includes('503')) {
        errorContent = "❌ Gemini AI Financial Analyst is not configured. Please contact support to enable advanced AI features.";
        suggestions = ["Contact support for AI setup"];
      } else if (error.message?.includes('Failed to fetch')) {
        errorContent = "🔄 I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
        suggestions = ["Try refreshing the page", "Check your internet connection"];
      } else {
        errorContent = `⚠️ AI Service Error: ${error.message}. Let me try to help with a basic response.`;
      }
      
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        suggestions
      };
    }
  };

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(messageText);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (date: Date) => {
    // Use consistent 24-hour format to avoid hydration mismatch
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">AI Financial Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Get personalized insights and advice for your finances
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-muted/20">
        <p className="text-sm font-medium mb-3">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleSendMessage(action.query)}
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <div className={`p-1 rounded ${action.color} text-white`}>
                {action.icon}
              </div>
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className={message.type === 'user' ? 'bg-primary' : 'bg-muted'}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Message Content */}
              <div className={`space-y-2`}>
                <div
                  className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
                
                {/* Timestamp */}
                {mounted && (
                  <p className={`text-xs text-muted-foreground ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                )}

                {/* Action Items */}
                {message.data && message.data.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Recommended Actions:</p>
                    <div className="space-y-2">
                      {message.data.map((action: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded border">
                          <div className="flex-1">
                            <h5 className="text-xs font-medium">{action.title}</h5>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={action.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                              {action.priority}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                              onClick={() => window.open(action.actionUrl, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(suggestion)}
                          className="text-xs h-auto py-1 px-2"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-[80%]">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try asking about your spending, budgets, savings goals, or financial advice.
        </p>
      </div>
    </div>
  );
}