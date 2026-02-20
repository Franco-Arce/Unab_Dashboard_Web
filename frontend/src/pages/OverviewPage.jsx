import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    CreditCard,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import api from '../api';
import AIPanel from '../components/AIPanel';

export default function OverviewPage() {
    const [kpis, setKpis] = useState(null);
    const [funnel, setFunnel] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [k, f] = await Promise.all([api.kpis(), api.funnel()]);
                setKpis(k);
                setFunnel(f);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-3xl" />)}
            </div>
            <div className="h-[400px] bg-zinc-900 rounded-3xl" />
        </div>
    );

    const cards = [
        { label: 'Total Leads', value: kpis.total_leads, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Matriculados', value: kpis.matriculados, icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'En Gestión', value: kpis.en_gestion, icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Pagados', value: kpis.pagados, icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                <span>+12%</span>
                                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{card.label}</h3>
                            <div className="text-3xl font-black">{card.value?.toLocaleString()}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Embudo de Conversión</h3>
                                <p className="text-zinc-500 text-sm">Rendimiento de las etapas de la campaña</p>
                            </div>
                            <div className="bg-zinc-800 px-4 py-2 rounded-xl text-xs font-bold border border-zinc-700">
                                Global
                            </div>
                        </div>

                        <div className="h-[300px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnel} layout="vertical" margin={{ left: 100, right: 30 }}>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="stage"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }}
                                        width={120}
                                    />
                                    <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40} isAnimationActive={false}>
                                        {funnel.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Funnel Details Table */}
                        <div className="mt-8 grid grid-cols-4 gap-4">
                            {funnel.map((f, i) => (
                                <div key={i} className="bg-black/30 p-4 rounded-2xl border border-zinc-800/50">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">{f.stage}</div>
                                    <div className="text-lg font-bold">{f.value.toLocaleString()}</div>
                                    <div className="text-[10px] text-zinc-400">{f.percent}% de leads</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Eficiencia</h4>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
                                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 - (251 * (kpis.matriculados / kpis.total_leads))} className="text-primary" />
                                    </svg>
                                    <span className="absolute text-lg font-black">{Math.round((kpis.matriculados / kpis.total_leads) * 100)}%</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Tasa de Conversión</div>
                                    <div className="text-xs text-zinc-500">Leads a Matriculados</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Salud de Base</h4>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
                                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 - (251 * (kpis.en_gestion / kpis.total_leads))} className="text-amber-400" />
                                    </svg>
                                    <span className="absolute text-lg font-black">{Math.round((kpis.en_gestion / kpis.total_leads) * 100)}%</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Cobertura</div>
                                    <div className="text-xs text-zinc-500">Leads en gestión</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Panel Section */}
                <div className="h-full min-h-[600px]">
                    <AIPanel />
                </div>
            </div>
        </div>
    );
}
