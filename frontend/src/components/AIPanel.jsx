import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain, TrendingUp, Lightbulb, Sparkles, Loader2, Bot, User } from 'lucide-react';
import api from '../api';

const ICON_MAP = {
    trending_up: <TrendingUp size={14} className="text-emerald-500" />,
    trending_down: <TrendingUp size={14} className="text-rose-500 rotate-180" />,
    alert: <Lightbulb size={14} className="text-amber-500" />,
    star: <Sparkles size={14} className="text-violet-500" />,
};

export default function AIPanel({ onClose }) {
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: '¡Hola! Soy tu analista experto de UNAB. ¿En qué puedo ayudarte hoy con los datos de la campaña?' }
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [insights, setInsights] = useState(null);
    const [loadingInsights, setLoadingInsights] = useState(false);
    const messagesEnd = useRef(null);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;
        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setSending(true);
        try {
            const res = await api.aiChat(input, messages.slice(1));
            setMessages([...newMessages, { role: 'assistant', content: res.response }]);
        } catch (e) {
            setMessages([...newMessages, { role: 'assistant', content: 'Error al procesar tu pregunta. Intentá de nuevo.' }]);
        }
        setSending(false);
    };

    const loadInsights = async () => {
        if (insights) return;
        setLoadingInsights(true);
        try {
            const res = await api.aiInsights();
            setInsights(res.insights);
        } catch (e) {
            setInsights([{ icon: 'alert', title: 'Error', description: 'No se pudieron generar insights.' }]);
        }
        setLoadingInsights(false);
    };

    useEffect(() => {
        if (tab === 'insights') loadInsights();
    }, [tab]);

    const TABS = [
        { key: 'chat', label: '💬 Chat' },
        { key: 'insights', label: '💡 Insights' }
    ];

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] bg-white border-l border-nods-border shadow-2xl flex flex-col z-50 text-nods-text-primary h-screen"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-nods-border flex items-center justify-between bg-nods-sidebar text-white">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-nods-accent rounded-lg flex items-center justify-center">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Analista UNAB AI</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">En Línea</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                    <X size={14} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-nods-border">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${tab === t.key
                            ? 'text-nods-accent border-nods-accent bg-blue-50/50'
                            : 'text-nods-text-muted border-transparent hover:text-nods-accent hover:bg-slate-50'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
                {/* Chat */}
                {tab === 'chat' && (
                    <div className="flex flex-col gap-4 min-h-full">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-200' : 'bg-nods-sidebar'}`}>
                                    {msg.role === 'user' ? <User size={14} className="text-nods-text-muted" /> : <Bot size={14} className="text-white" />}
                                </div>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-nods-accent text-white rounded-tr-none'
                                    : 'bg-white text-nods-text-primary border border-nods-border rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                        {sending && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-nods-sidebar flex items-center justify-center flex-shrink-0">
                                    <Bot size={14} className="text-white" />
                                </div>
                                <div className="bg-white p-3.5 rounded-2xl border border-nods-border shadow-sm rounded-tl-none flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-nods-accent" />
                                    <span className="text-[11px] font-bold text-nods-text-muted uppercase tracking-wider">Analizando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEnd} />
                    </div>
                )}

                {/* Insights */}
                {tab === 'insights' && (
                    <div className="space-y-4">
                        {loadingInsights ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-nods-border" />)}
                            </div>
                        ) : (
                            insights?.map((ins, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white border border-nods-border rounded-2xl p-5 shadow-sm hover:border-nods-accent/30 transition-all hover:scale-[1.02]"
                                    initial={{ opacity: 0, x: 15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest text-nods-text-muted flex items-center gap-2 mb-2">
                                        {ICON_MAP[ins.icon] || ICON_MAP.alert}
                                        {ins.title}
                                    </div>
                                    <p className="text-[13px] font-medium text-nods-text-primary leading-relaxed">{ins.description}</p>
                                </motion.div>
                            ))
                        )}
                        <button
                            onClick={() => { setInsights(null); loadInsights(); }}
                            className="w-full mt-2 py-3 bg-white border border-nods-border rounded-xl text-[10px] font-black uppercase tracking-widest text-nods-accent hover:bg-blue-50 transition-all shadow-sm"
                        >
                            🔄 Regenerar Insights
                        </button>
                    </div>
                )}
            </div>

            {/* Input */}
            {tab === 'chat' && (
                <div className="p-4 bg-white border-t border-nods-border">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Pregunta sobre la campaña..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            disabled={sending}
                            className="w-full bg-slate-50 border border-nods-border rounded-2xl py-3.5 pl-4 pr-12 text-sm outline-none focus:border-nods-accent focus:ring-4 focus:ring-nods-accent/5 transition-all text-nods-text-primary placeholder:text-nods-text-muted font-medium shadow-inner"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-nods-accent text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 shadow-lg"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
