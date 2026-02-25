import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Filter, CreditCard, GraduationCap, Target } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const SummaryCards = ({ kpis = {} }) => {
    // Definimos valores seguros por defecto
    const total_leads = kpis.total_leads || 0;
    const en_gestion = kpis.en_gestion || 0;
    const op_venta = kpis.op_venta || 0;
    const proceso_pago = kpis.proceso_pago || 0;
    const pagados = kpis.pagados || 0;
    const metas = kpis.metas || 0;

    const cards = [
        {
            id: 1,
            label: 'TOTAL LEADS',
            value: total_leads,
            color: 'from-slate-700 to-slate-900',
            icon: Users,
            percentage: 100,
            description: "Todos los contactos"
        },
        {
            id: 2,
            label: 'EN GESTIÓN',
            value: en_gestion,
            color: 'from-orange-500 to-amber-600',
            icon: UserCheck,
            percentage: total_leads > 0 ? Math.round((en_gestion / total_leads) * 100) : 0,
            description: `${total_leads > 0 ? ((en_gestion / total_leads) * 100).toFixed(1) : 0}% del total`
        },
        {
            id: 3,
            label: 'OP. DE VENTA',
            value: op_venta,
            color: 'from-blue-500 to-blue-700',
            icon: Filter,
            percentage: en_gestion > 0 ? Math.round((op_venta / en_gestion) * 100) : 0,
            description: `${en_gestion > 0 ? ((op_venta / en_gestion) * 100).toFixed(1) : 0}% de en gestión`
        },
        {
            id: 4,
            label: 'PROCESO PAGO',
            value: proceso_pago,
            color: 'from-violet-500 to-purple-600',
            icon: CreditCard,
            percentage: op_venta > 0 ? Math.round((proceso_pago / op_venta) * 100) : 0,
            description: `${op_venta > 0 ? ((proceso_pago / op_venta) * 100).toFixed(1) : 0}% de op. venta`
        },
        {
            id: 5,
            label: 'PAGADOS',
            value: pagados,
            color: 'from-emerald-500 to-teal-600',
            icon: GraduationCap,
            percentage: metas > 0 ? Math.round((pagados / metas) * 100) : 0,
            description: `de ${metas?.toLocaleString('es-AR') || 0} meta`
        },
        {
            id: 6,
            label: 'CONVERSIÓN',
            value: `${total_leads > 0 ? ((pagados / total_leads) * 100).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 0}%`,
            color: 'from-orange-500 to-amber-600',
            icon: Target,
            percentage: total_leads > 0 ? Math.round((pagados / total_leads) * 100 * 5) : 0,
            description: "Leads -> Pagados",
            unit: null
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
        >
            {cards.map((card, i) => (
                <motion.div key={card.id || i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <MetricCard data={card} />
                </motion.div>
            ))}
        </motion.div>
    );
};
