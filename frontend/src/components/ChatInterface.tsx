import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare, FiCpu, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../utils/api';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: any[];
}

const ChatInterface = () => {
    const SendIcon = FiSend as React.ComponentType<{ className?: string }>;
    const XIcon = FiX as React.ComponentType<{ className?: string }>;
    const MessageSquareIcon = FiMessageSquare as React.ComponentType<{ className?: string }>;
    const CpuIcon = FiCpu as React.ComponentType<{ className?: string }>;
    const ExternalLinkIcon = FiExternalLink as React.ComponentType<{ className?: string }>;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Hello! I'm your Second Brain AI. Ask me anything about your saved notes."
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await contentAPI.chat(userMessage.content);
            const data = response.data;

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                sources: data.sources
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to your brain right now. Please try again later."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                                    <CpuIcon className="text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Ask Your Brain</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Powered by AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            >
                                <XIcon />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Sources:</p>
                                                <div className="space-y-2">
                                                    {msg.sources.slice(0, 3).map((source: any, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href={source.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block p-2 rounded bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition border border-slate-100 dark:border-slate-700 group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium text-xs text-slate-700 dark:text-slate-300 truncate pr-2">
                                                                    {source.title || source.link}
                                                                </span>
                                                                <ExternalLinkIcon className="text-slate-400 group-hover:text-blue-500 text-xs shrink-0" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <SendIcon className="text-sm" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30 text-white flex items-center justify-center z-50 hover:shadow-blue-500/50 transition-shadow"
            >
                {isOpen ? <XIcon className="text-2xl" /> : <MessageSquareIcon className="text-2xl" />}
            </motion.button>
        </>
    );
};

export default ChatInterface;
