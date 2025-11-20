import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, ChevronDown } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateMenuRecommendation } from '../../services/geminiService';

export const SmartWaiter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I can help you choose the perfect meal. What are you in the mood for?', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const responseText = await generateMenuRecommendation(userText);
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting to the kitchen. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-5 z-30 group"
      >
        <div className="absolute inset-0 bg-[#859F31] rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        <div className="relative w-14 h-14 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 border-2 border-white/20">
            <Sparkles className="w-6 h-6 text-[#859F31] animate-pulse-soft" />
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-5 w-[90vw] md:w-96 bg-white rounded-[2rem] shadow-2xl shadow-gray-900/20 border border-gray-100 flex flex-col z-50 overflow-hidden h-[500px] animate-slide-up">
      {/* Header */}
      <div className="bg-gray-900 p-5 flex justify-between items-center text-white relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-[#859F31]" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">AI Assistant</h3>
            <p className="text-xs text-gray-400">Ask me anything about the menu</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="relative z-10 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-200' : 'bg-[#859F31]/10'}`}>
                {msg.role === 'user' ? <User size={14} className="text-gray-600" /> : <Sparkles size={14} className="text-[#859F31]" />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1.5 items-center">
              <span className="text-xs text-gray-400 font-medium mr-2">Thinking</span>
              <span className="w-1.5 h-1.5 bg-[#859F31] rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-[#859F31] rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-[#859F31] rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for recommendations..."
          className="flex-1 px-5 py-3 bg-gray-50 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#859F31]/20 text-sm text-gray-900 placeholder-gray-400"
        />
        <button 
          onClick={handleSend}
          disabled={!query.trim() || isLoading}
          className="w-12 h-12 bg-[#859F31] text-white rounded-xl hover:bg-[#6d8228] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#859F31]/30 transition-all"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};