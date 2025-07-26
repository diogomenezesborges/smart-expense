'use client';

import { useState, useRef, useEffect } from 'react';
import { AIService, AIResponse, FinancialContext } from '@/lib/services/ai-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  TrendingUp, 
  AlertCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'chart' | 'recommendation' | 'insight';
  data?: any;
  confidence?: number;
}

interface ChatInterfaceProps {
  userId: string;
  financialContext: FinancialContext;
  className?: string;
}

export function ChatInterface({ userId, financialContext, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI financial assistant powered by Google Gemini 🤖\n\nI can help you:\n• Analyze your spending patterns\n• Optimize your budget\n• Work towards financial goals\n• Provide personalized advice based on your data\n\nWhat would you like to know about your finances?`,
      timestamp: new Date(),
      type: 'text',
      confidence: 1.0
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the new Gemini-only API directly
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim(),
          context: financialContext,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          type: data.type,
          data: data.data,
          confidence: data.confidence
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Add follow-up questions if provided
        if (data.followUpQuestions && data.followUpQuestions.length > 0) {
          setTimeout(() => {
            const followUpMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: "Here are some related questions you might find helpful:",
              timestamp: new Date(),
              type: 'text',
              data: { followUpQuestions: data.followUpQuestions }
            };
            setMessages(prev => [...prev, followUpMessage]);
          }, 1000);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Failed to get AI response:', error);
      
      let errorContent = "I apologize, but I'm having trouble processing your request right now.";
      
      // Handle specific error types
      if (error.message?.includes('MISSING_API_KEY')) {
        errorContent = "❌ Gemini AI is not configured. Please contact support to enable AI features.";
      } else if (error.message?.includes('GEMINI_ERROR')) {
        errorContent = "❌ There was an issue with the AI service. Please try again in a moment.";
      } else if (error.message?.includes('rate limit')) {
        errorContent = "⏳ Too many requests. Please wait a moment before trying again.";
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        confidence: 0.0
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const getMessageIcon = (role: string, type?: string) => {
    if (role === 'user') {
      return <User className="h-4 w-4" />;
    }
    
    switch (type) {
      case 'chart':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'insight':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <Bot className="h-4 w-4 text-purple-600" />;
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence || confidence < 0.5) return null;
    
    const level = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
    const variant = level === 'high' ? 'default' : level === 'medium' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="text-xs ml-2">
        {Math.round(confidence * 100)}% confident
      </Badge>
    );
  };

  const quickQuestions = [
    "How much did I spend on dining out this month?",
    "Am I on track to meet my savings goal?",
    "What's my biggest expense category?",
    "How can I reduce my monthly expenses?",
    "Show me my spending trends",
    "Help me create a budget"
  ];

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          AI Financial Assistant
          <Badge variant="outline" className="ml-auto">
            Premium Feature
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 gap-4 p-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message.role, message.type)}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  
                  {/* Follow-up questions */}
                  {message.data?.followUpQuestions && (
                    <div className="mt-3 space-y-2">
                      {message.data.followUpQuestions.map((question: string, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 block w-full text-left"
                          onClick={() => handleQuickQuestion(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {getConfidenceBadge(message.confidence)}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Quick questions to get started:</div>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.slice(0, 4).map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 text-left justify-start"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your finances..."
              disabled={isLoading}
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setIsListening(!isListening)}
              disabled={isLoading}
            >
              {isListening ? (
                <MicOff className="h-3 w-3 text-red-500" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}