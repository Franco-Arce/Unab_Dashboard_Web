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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8 animate-pulse"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-zinc-100 shadow-sm" />)}
            </div>
            <div className="h-[400px] bg-white rounded-3xl border border-zinc-100 shadow-sm" />
        </motion.div>
    );

    const cards = [
        { label: 'Total Leads', value: kpis.total_leads, icon: Users, color: 'text-nods-accent', bg: 'bg-nods-accent/10' },
        { label: 'Matriculados', value: kpis.matriculados, icon: UserPlus, color: 'text-nods-success', bg: 'bg-nods-success/10' },
        { label: 'En Gestión', value: kpis.en_gestion, icon: Target, color: 'text-nods-accent', bg: 'bg-nods-accent/10' },
        { label: 'Pagados', value: kpis.pagados, icon: CreditCard, color: 'text-nods-warning', bg: 'bg-nods-warning/10' },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.4, delay: i * 0.1 }}
                        className="bg-white border border-nods-border p-6 rounded-3xl hover:border-nods-accent/30 hover:shadow-lg transition-all group relative overflow-hidden shadow-sm cursor-pointer"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} blur-3xl rounded-full translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={`p-3 rounded-2xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <div className="flex items-center gap-1 text-[11px] font-black text-nods-success uppercase tracking-widest">
                                <span>+12%</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-nods-text-muted text-xs font-bold uppercase tracking-widest mb-1">{card.label}</h3>
                            <div className="text-3xl font-black text-nods-text-primary">{card.value?.toLocaleString()}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Funnel Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="bg-white border border-nods-border rounded-3xl p-8 relative overflow-hidden group shadow-xl">
                        <div className="flex justify-between items-end mb-10 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold mb-1 text-nods-text-primary">Embudo de Conversión</h3>
                                <p className="text-nods-text-muted text-sm font-medium">Rendimiento de las etapas de la campaña</p>
                            </div>
                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold border border-nods-border text-nods-text-primary">
                                Global
                            </div>
                        </div>

                        <div className="py-6 w-full flex flex-col gap-3 relative z-10 min-h-[320px]">
                            {funnel.map((entry, index) => (
                                <motion.div
                                    key={index}
                                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-nods-border/60 transition-colors p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group cursor-pointer"
                                >
                                    {/* Left: Stage Name */}
                                    <div className="md:w-1/4 flex-shrink-0">
                                        <div className="text-xs font-bold text-nods-text-muted uppercase tracking-widest mb-1 group-hover:text-nods-accent transition-colors">
                                            Paso {index + 1}
                                        </div>
                                        <div className="text-sm font-black text-nods-text-primary">
                                            {entry.stage}
                                        </div>
                                    </div>

                                    {/* Center: Progress Bar */}
                                    <div className="w-full md:flex-grow relative h-6 bg-slate-200/50 rounded-full overflow-hidden shadow-inner flex items-center">
                                        <motion.div
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: `${Math.max(entry.percent, 3)}%` }}
                                            transition={{
                                                duration: 1.2,
                                                delay: 0.6 + (index * 0.15),
                                                type: "spring", bounce: 0.15
                                            }}
                                            className="h-full rounded-full relative"
                                            style={{ backgroundColor: entry.color }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                                        </motion.div>
                                    </div>

                                    {/* Right: Value & Badge */}
                                    <div className="md:w-1/5 flex-shrink-0 flex items-center justify-end gap-3 w-full md:w-auto">
                                        <div className="text-xl font-black text-nods-text-primary tracking-tight">
                                            {entry.value.toLocaleString()}
                                        </div>
                                        <div className="px-2 py-1 bg-white border border-nods-border rounded-lg text-[10px] font-bold text-nods-text-muted shadow-sm select-none">
                                            {entry.percent}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Quick Stats vertically stacked */}
                <div className="flex flex-col space-y-6 justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-white border border-nods-border rounded-3xl p-6 shadow-lg w-full cursor-pointer"
                    >
                        <h4 className="text-sm font-bold uppercase tracking-widest text-nods-text-muted mb-6">Eficiencia</h4>
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 - (251 * (kpis.matriculados / kpis.total_leads))} className="text-nods-accent" />
                                </svg>
                                <span className="absolute text-lg font-black text-nods-text-primary">{Math.round((kpis.matriculados / kpis.total_leads) * 100)}%</span>
                            </div>
                            <div>
                                <div className="text-sm font-black text-nods-text-primary">Tasa de Conversión</div>
                                <div className="text-xs text-nods-text-primary/70 font-bold mt-1">Leads a Matriculados</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-white border border-nods-border rounded-3xl p-6 shadow-lg w-full cursor-pointer"
                    >
                        <h4 className="text-sm font-bold uppercase tracking-widest text-nods-text-muted mb-6">Salud de Base</h4>
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                                    <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={251} strokeDashoffset={251 - (251 * (kpis.en_gestion / kpis.total_leads))} className="text-nods-warning" />
                                </svg>
                                <span className="absolute text-lg font-black text-nods-text-primary">{Math.round((kpis.en_gestion / kpis.total_leads) * 100)}%</span>
                            </div>
                            <div>
                                <div className="text-sm font-black text-nods-text-primary">Cobertura</div>
                                <div className="text-xs text-nods-text-primary/70 font-bold mt-1">Leads en gestión</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
