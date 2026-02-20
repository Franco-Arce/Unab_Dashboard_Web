import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { XCircle, Info, Filter } from 'lucide-react';
import api from '../api';

export default function NoUtilPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.noUtil().then(setData).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-96 bg-zinc-900 animate-pulse rounded-3xl" />;

    const COLORS = ['#f5bc02', '#3b82f6', '#10b981', '#f43f5e', '#ec4899', '#a855f7', '#fb923c', '#94a3b8'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between w-full">
                        Distribución No Útil
                        <XCircle className="w-5 h-5 text-red-400" />
                    </h3>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.subcategorias.slice(0, 10)}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="leads"
                                    nameKey="subcategoria"
                                >
                                    {data.subcategorias.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid #27272a', padding: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 text-center bg-red-400/5 p-6 rounded-3xl border border-red-400/10 w-full">
                        <div className="text-4xl font-black text-red-400">{data.total.toLocaleString()}</div>
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Leads No Útiles Totales</div>
                    </div>
                </div>

                {/* Subcategories List */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                        Detalle de Subcategorías
                        <Info className="w-5 h-5 text-zinc-500" />
                    </h3>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {data.subcategorias.map((item, idx) => (
                            <div key={idx} className="bg-black/30 p-4 rounded-2xl border border-zinc-800/50 hover:border-primary/20 transition-all group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-zinc-200 group-hover:text-primary transition-colors">{item.subcategoria}</span>
                                    <span className="text-xs font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg">{item.porcentaje}%</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.porcentaje}%` }}
                                        transition={{ duration: 1, delay: idx * 0.05 }}
                                        className="h-full bg-zinc-400 group-hover:bg-primary transition-all"
                                    />
                                </div>
                                <div className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    {item.leads} Leads
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
