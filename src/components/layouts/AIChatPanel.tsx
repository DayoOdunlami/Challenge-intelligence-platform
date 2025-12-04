'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Mic, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'insight';
  content: string | React.ReactNode;
  timestamp: Date;
  isComponent?: boolean; // Flag to indicate if content is a React component
}

export interface AIChatPanelProps {
  mode?: 'text' | 'voice';
  context?: {
    activeViz?: string;
    useNavigateData?: boolean;
    selectedEntities?: any[];
  };
  onFunctionCall?: (functionName: string, args: any) => void;
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

export function AIChatPanel({ mode = 'text', context, onFunctionCall, initialMessages, onMessagesChange }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages && initialMessages.length > 0
      ? initialMessages
      : [
          {
            id: '1',
            role: 'assistant',
            content:
              "Hello! I'm your AI assistant. I can help you explore the NAVIGATE platform, answer questions about the data, and provide insights. What would you like to know?",
            timestamp: new Date(),
          },
        ],
  );
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSyncedMessageCountRef = useRef<number>(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize the ref with the current message count
  useEffect(() => {
    if (initialMessages) {
      lastSyncedMessageCountRef.current = initialMessages.length;
    }
  }, []); // Only run on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  // Sync external message updates (e.g., insight injections) into internal state
  // This ensures that when parent adds new messages (like insights), they appear immediately
  useEffect(() => {
    if (initialMessages && initialMessages.length > lastSyncedMessageCountRef.current) {
      setMessages(prev => {
        // Create a map of existing messages by ID for quick lookup
        const existingMap = new Map(prev.map(m => [m.id, m]));
        
        // Find any new messages in initialMessages that we don't have
        const newMessages = initialMessages.filter(m => !existingMap.has(m.id));
        
        if (newMessages.length > 0) {
          // Merge: keep existing messages, add any new ones from initialMessages
          const merged = [...prev, ...newMessages];
          
          // Sort by timestamp to maintain chronological order
          const sorted = merged.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          // Update the ref to track what we've synced
          lastSyncedMessageCountRef.current = initialMessages.length;
          
          return sorted;
        }
        
        // Update ref even if no new messages (in case of reordering)
        lastSyncedMessageCountRef.current = initialMessages.length;
        
        return prev;
      });
    } else if (initialMessages) {
      // Update ref even if length hasn't increased (handles edge cases)
      lastSyncedMessageCountRef.current = initialMessages.length;
    }
  }, [initialMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Prepare messages for API (excluding insight messages and the empty assistant message)
      // Only include text messages (not React components)
      const apiMessages = [
        ...messages
          .filter(msg => msg.role !== 'insight' && typeof msg.content === 'string')
          .map(msg => ({
            role: msg.role,
            content: msg.content as string,
          })),
        {
          role: 'user' as const,
          content: userInput,
        },
      ];

      // Get current guardrails to send model/temperature with request
      // This allows admin panel changes to take effect immediately
      const currentGuardrails = typeof window !== 'undefined' 
        ? (() => {
            try {
              const stored = localStorage.getItem('navigate_ai_guardrails');
              if (stored) {
                const parsed = JSON.parse(stored);
                return { model: parsed.model, temperature: parsed.temperature };
              }
            } catch (e) {
              console.error('Failed to load guardrails:', e);
            }
            return null;
          })()
        : null;

      // Call API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          context,
          // Include model and temperature from admin panel if set
          ...(currentGuardrails?.model && { model: currentGuardrails.model }),
          ...(currentGuardrails?.temperature !== undefined && { temperature: currentGuardrails.temperature }),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle function calls
              if (parsed.type === 'function_call' && parsed.function && onFunctionCall) {
                const { name, arguments: args } = parsed.function;
                try {
                  const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
                  onFunctionCall(name, parsedArgs);
                  // Add note to message that function was called
                  accumulatedContent += `\n\n[Executing: ${name}...]`;
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                } catch (e) {
                  console.error('Failed to parse function arguments:', e);
                }
              }
              
              // Handle text content
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please check your API key configuration.`,
              }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // In real implementation, this would start/stop voice recognition
  };

  return (
    <div className="flex flex-col h-full">
      {/* Context Indicator */}
      <div className="mb-4 p-3 bg-[#CCE2DC]/20 rounded-lg border border-[#CCE2DC]">
        <div className="text-xs text-gray-600 mb-1">Current Context:</div>
        <div className="text-sm font-medium text-[#006E51]">
          Network Graph • TRL 1-9 • NAVIGATE Data
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {(message.role === 'assistant' || message.role === 'insight') && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'insight' 
                  ? 'bg-[#0f8b8d]' 
                  : 'bg-[#006E51]'
              }`}>
                {message.role === 'insight' ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#006E51] text-white'
                  : message.role === 'insight'
                  ? 'bg-gradient-to-br from-[#0f8b8d]/10 to-[#0f8b8d]/5 border border-[#0f8b8d]/20'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.isComponent && typeof message.content !== 'string' ? (
                // Render React component directly
                <div className="text-sm">
                  {message.content}
                </div>
              ) : message.content ? (
                <div className="text-sm prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-code:text-[#006E51] prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                  <ReactMarkdown
                    components={{
                      // Customize link styling
                      a: ({ node, ...props }) => (
                        <a {...props} className="text-[#006E51] hover:underline" target="_blank" rel="noopener noreferrer" />
                      ),
                      // Customize code blocks
                      code: ({ node, inline, ...props }: any) => {
                        if (inline) {
                          return <code className="bg-gray-100 text-[#006E51] px-1 py-0.5 rounded text-xs" {...props} />;
                        }
                        return <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto" {...props} />;
                      },
                      // Customize lists
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                      // Customize headings
                      h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-base font-semibold mt-2 mb-1" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                    }}
                  >
                    {message.content as string}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question or give a command..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006E51]"
        />
        <Button
          variant="outline"
          onClick={handleVoiceToggle}
          className={`border-[#006E51] ${
            isListening
              ? 'bg-[#006E51] text-white'
              : 'text-[#006E51] hover:bg-[#006E51] hover:text-white'
          }`}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-[#006E51] hover:bg-[#005A42] text-white disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isListening && (
        <div className="mt-2 text-xs text-center text-[#006E51] animate-pulse">
          🎤 Listening...
        </div>
      )}
    </div>
  );
}

