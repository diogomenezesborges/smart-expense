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
import { aiAssistant } from '@/lib/ai-assistant';

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
      content: "Hi! I'm your AI Financial Assistant. I can help you understand your spending patterns, create budgets, and provide personalized financial advice. What would you like to know about your finances?",
      timestamp: new Date(),
      suggestions: [
        "Show me my spending this month",
        "How can I save more money?",
        "What's my biggest expense category?",
        "Help me create a budget"
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'spending-summary',
      label: 'Spending Summary',
      query: 'Show me my spending summary for this month',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'bg-primary'
    },
    {
      id: 'budget-help',
      label: 'Budget Advice',
      query: 'Help me create a better budget',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-success'
    },
    {
      id: 'savings-tips',
      label: 'Savings Tips',
      query: 'What are some ways I can save money?',
      icon: <PiggyBank className="h-4 w-4" />,
      color: 'bg-info'
    },
    {
      id: 'expense-analysis',
      label: 'Expense Analysis',
      query: 'Analyze my biggest expenses and suggest improvements',
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
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Use the enhanced AI assistant service
      const aiResponse = await aiAssistant.processQuery(userQuery);
      
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        data: aiResponse.actionItems
      };
    } catch (error) {
      console.error('Error processing AI query:', error);
      
      // Fallback response
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: `I apologize, but I'm having trouble processing your request: "${userQuery}". Please try rephrasing your question or ask about spending analysis, budget planning, savings strategies, or financial goals.`,
        timestamp: new Date(),
        suggestions: [
          "Show me my spending breakdown",
          "Help me create a budget",
          "What are some ways to save money?",
          "Review my financial goals"
        ]
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <p className={`text-xs text-muted-foreground ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTimestamp(message.timestamp)}
                </p>

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