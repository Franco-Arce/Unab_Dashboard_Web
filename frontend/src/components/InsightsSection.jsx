import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, AlertCircle, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw } from 'lucide-react';
import api from '../api';

const getIcon = (iconStr) => {
    switch (iconStr) {
        case 'trending_up': return TrendingUp;
        case 'trending_down': return TrendingDown;
        case 'alert': return AlertCircle;
        case 'star': return Star;
        default: return Star;
    }
};

const AICard = ({ insight, idx, onVerMas }) => {
    const Icon = insight.icon;
    const isEven = idx % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-8 -mt-8 rounded-full blur-3xl transition-opacity group-hover:opacity-10 ${isEven ? 'bg-indigo-600' : 'bg-emerald-600'}`} />

            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl shadow-lg text-white transition-transform group-hover:rotate-6 duration-500 ${isEven ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                    {Icon && <Icon size={22} strokeWidth={2.5} />}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isEven ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA Insight</span>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight group-hover:text-slate-900 transition-colors">
                    {insight.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed tracking-normal line-clamp-4 group-hover:text-slate-600 transition-colors">
                    {insight.description}
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${isEven ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    Recomendación
                </span>
                <button
                    onClick={onVerMas}
                    className="flex items-center gap-1 text-[10px] font-black text-slate-300 group-hover:text-nods-accent transition-colors uppercase tracking-widest"
                >
                    Ver más <ArrowUpRight size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default function InsightsSection({ page = 'overview', onOpenChat }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInsights = () => {
        setLoading(true);
        setInsights(null);
        api.aiInsights(page)
            .then(res => setInsights(res.insights || []))
            .catch(() => setInsights([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchInsights();
    }, [page]);

    const insightsData = useMemo(() => {
        if (!insights) return [];
        return insights.map((insight) => ({
            title: insight.title,
            description: insight.description,
            icon: getIcon(insight.icon)
        }));
    }, [insights]);

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <div className="space-y-4">
                    <div className="w-48 h-6 bg-slate-100 rounded animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />)}
                    </div>
                </div>
            ) : insightsData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg"><Star className="w-5 h-5 text-indigo-500" /></div>
                            <div>
                                <h3 className="text-xl font-bold text-nods-text-primary">Insights del Analista</h3>
                                <p className="text-nods-text-muted text-sm font-medium">Análisis predictivo y recomendaciones inteligentes</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchInsights}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-nods-border rounded-xl text-[10px] font-black uppercase tracking-widest text-nods-text-muted hover:text-nods-accent hover:border-nods-accent/50 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-3 h-3" /> Regenerar
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {insightsData.map((insight, i) => (
                            <AICard
                                key={i}
                                insight={insight}
                                idx={i}
                                onVerMas={() => onOpenChat?.()}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
