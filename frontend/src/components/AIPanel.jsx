import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Brain, TrendingUp, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function AIPanel() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu analista experto de UNAB. ¿En qué puedo ayudarte hoy con los datos de la campaña?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState([]);
    const [loadingInsights, setLoadingInsights] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchInsights();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchInsights = async () => {
        setLoadingInsights(true);
        try {
            const res = await api.aiInsights();
            setInsights(res.insights || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingInsights(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.aiChat(input, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu consulta.' }]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (name) => {
        switch (name) {
            case 'trending_up': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'trending_down': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
            case 'alert': return <AlertCircle className="w-4 h-4 text-amber-400" />;
            case 'star': return <Star className="w-4 h-4 text-primary" />;
            default: return <Sparkles className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingInsights ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                    ))
                ) : (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl hover:border-primary/30 transition-all group flex flex-col gap-2 min-h-[120px]"
                    >
                        <div className="flex items-start gap-2">
                            <div className="mt-0.5 flex-shrink-0">{getIcon(insight.icon)}</div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-tight">
                                {insight.title}
                            </h3>
                        </div>
                        <p className="text-[12px] text-zinc-300 leading-snug break-words overflow-hidden line-clamp-3 group-hover:line-clamp-none transition-all">
                            {insight.description}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden relative group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />

                <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/20">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">Analista UNAB AI</span>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, x: m.role === 'user' ? 20 : -20 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-zinc-800' : 'bg-primary'
                                    }`}>
                                    {m.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-black" />}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user'
                                    ? 'bg-zinc-900 text-white border border-zinc-800'
                                    : 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/30'
                                    }`}>
                                    {m.content}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-black" />
                            </div>
                            <div className="bg-zinc-800/50 rounded-2xl px-4 py-2 flex items-center gap-1">
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="p-4 bg-zinc-900/30 border-t border-zinc-800/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Pregunta sobre los datos..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-3 pl-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-600 shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-black rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:grayscale shadow-lg active:scale-95"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
