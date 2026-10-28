'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Lightbulb,
  HelpCircle,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage, Question, StudentUser } from '@/lib/types';

interface Props {
  student: StudentUser;
  currentTopic: string;
  weakSubSkills: string[];
  activeQuestion?: Question | null;
  apiKey?: string;
}

export function AIDoubtSolverDrawer({
  student,
  currentTopic,
  weakSubSkills,
  activeQuestion,
  apiKey,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello ${student.name}! I'm your personalized **Quizora AI Tutor**. 

I'm aware of your preferred **${student.preferredLearningStyle.toUpperCase()}** learning style and current study focus on **${currentTopic}**. 

Ask me anything, or tap one of the quick chips below!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChips = [
    { label: '💡 Explain my last wrong answer simply', prompt: 'Explain my last wrong answer simply' },
    { label: '🌍 Give me a real-world analogy', prompt: 'Give me a real-world analogy for this topic' },
    { label: '🎯 Quiz me on my weakest sub-topic', prompt: 'Quiz me on my weakest sub-topic' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          student,
          currentTopic,
          weakSubSkills,
          activeQuestion,
          customApiKey: apiKey,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `I'm here to help, ${student.name}! Ask me any specific question about ${currentTopic}.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat tutor error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `I had trouble connecting to the network, but remember: in ${currentTopic}, focus on memory allocation and Big-O invariants!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Always Accessible in Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all transform hover:-translate-y-1 active:scale-95 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
        </span>
        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform" />
        <span>Ask AI Tutor</span>
      </button>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl relative">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/40 shadow-md bg-[#0b0e23] flex items-center justify-center shrink-0">
                    <img
                      src="/logo.jpg"
                      alt="Quizora AI"
                      className="w-full h-full object-cover object-left scale-125"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white">Quizora AI Tutor</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Context-Aware
                      </span>
                    </div>
                    <p className="text-[10px] text-indigo-300/80 font-bold uppercase tracking-wider">
                      LEARN • PRACTICE • IMPROVE
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Context Summary Bar */}
              <div className="px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Topic: <strong className="text-slate-200">{currentTopic}</strong></span>
                </div>
                {weakSubSkills.length > 0 && (
                  <div className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 truncate">
                    Focused Gap: {weakSubSkills[0]}
                  </div>
                )}
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-br-sm'
                            : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-sm space-y-2'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div
                          className={`text-[10px] text-right mt-1 ${
                            isUser ? 'text-indigo-200' : 'text-slate-500'
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-2xl flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-slate-400 ml-1">AI Tutor formulating explanation...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Starter Chips */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 tracking-wider">
                  Quick-Action Starter Chips:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isTyping}
                      onClick={() => handleSendMessage(chip.prompt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition text-left"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Box */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask a doubt in ${currentTopic}...`}
                    disabled={isTyping}
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white transition shadow-md shadow-indigo-600/30 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
