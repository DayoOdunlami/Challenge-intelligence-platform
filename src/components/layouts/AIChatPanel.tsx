'use client';

import React, { useState } from 'react';
import { MessageCircle, Mic, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatPanelProps {
  mode?: 'text' | 'voice';
}

export function AIChatPanel({ mode = 'text' }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you explore the NAVIGATE platform, answer questions about the data, and provide insights. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${input}". This is a prototype - in the full version, I would analyze the current visualization, filters, and selected entities to provide contextual insights.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput('');
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
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#006E51] flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#006E51] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
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
          className="bg-[#006E51] hover:bg-[#005A42] text-white"
        >
          <Send className="h-4 w-4" />
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

