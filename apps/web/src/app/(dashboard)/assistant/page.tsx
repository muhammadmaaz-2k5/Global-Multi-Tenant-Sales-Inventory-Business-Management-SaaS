'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your ShopFlow AI Assistant. Ask me anything about your business metrics, top selling products, or inventory alerts." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const user = await fetchApi<{ memberships: { organizationId: string }[] }>('/users/me');
      const orgId = user.memberships[0]?.organizationId;
      if (orgId) {
        const response = await fetchApi<{ answer: string; type: string }>(`/organizations/${orgId}/ai/query`, {
          method: 'POST',
          body: JSON.stringify({ question: userMessage })
        });
        
        setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the system right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-surface-900">AI Business Assistant</h1>
        <p className="text-surface-500">Ask questions about your data in plain English.</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-surface-200 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-surface-100 text-surface-900 rounded-bl-sm border border-surface-200'
              }`}>
                <p className="text-sm font-medium">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface-100 text-surface-900 rounded-2xl rounded-bl-sm border border-surface-200 px-5 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-surface-50 border-t border-surface-200">
          <form onSubmit={sendMessage} className="flex gap-4">
            <div className="flex-1">
              <Input
                label=""
                placeholder="E.g., What are my top selling products?"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()}>Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
