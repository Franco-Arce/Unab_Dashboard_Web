import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Send,
    CheckCircle2,
    XCircle,
    Users,
    LogOut,
    ChevronRight,
    RefreshCw,
    Sparkles
} from 'lucide-react';
import AIPanel from '../components/AIPanel';
import api from '../api';
import logoUnab from '../assets/unab-logo.jpg';
import logoNods from '../assets/logo-nods.ico';
import nodsDark from '../assets/nods-dark.png';

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [meta, setMeta] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.me().then(setUser).catch(() => navigate('/'));
        loadMeta();
    }, []);

    const loadMeta = () => {
        api.meta().then(setMeta).catch(() => { });
    };

    const handleLogout = () => {
        localStorage.removeItem('unab_token');
        navigate('/');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.refresh();
            await loadMeta();
            // Trigger a re-render of the current page if it's a dashboard child
            // This is a simple way; a better way would be a global state/event,
            // but for now, re-fetching meta might be enough if pages listen or we just notify.
            window.location.reload(); // Simple brute force to ensure all charts update
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
        { path: '/dashboard/admisiones', label: 'Admisiones', icon: Send },
        { path: '/dashboard/estados', label: 'Estados', icon: CheckCircle2 },
        { path: '/dashboard/no-util', label: 'No Útil', icon: XCircle },
        { path: '/dashboard/leads', label: 'Leads', icon: Users },
    ];

    const currentTitle = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="flex min-h-screen bg-nods-bg text-nods-text-primary font-sans">
            {/* Sidebar ... (no changes needed) */}
            {/* Sidebar Redesign */}
            <aside className="w-72 flex-shrink-0 bg-[#0a0f18] flex flex-col sticky top-0 h-screen transition-all duration-300 border-r border-slate-800/30">
                <div className="p-8 flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="p-2.5 bg-white/10 rounded-2xl shadow-lg">
                            <img src={logoNods} alt="NODS" className="h-6 w-auto" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter italic uppercase opacity-90">Dashboard</span>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/dashboard'}
                                className={({ isActive }) => `
                                    relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group overflow-hidden
                                    ${isActive
                                        ? 'text-white shadow-2xl shadow-blue-500/10'
                                        : 'text-slate-500 hover:text-slate-200'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Background active highlight (Glassmorphism + Liquid) */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-blue-600 z-0 overflow-hidden"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-800 opacity-90" />
                                                {/* Liquid flow effect */}
                                                <div className="absolute inset-0 opacity-20 animate-liquid-1 filter blur-sm"
                                                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%)', backgroundSize: '100% 100%' }} />
                                                <div className="absolute inset-0 opacity-10 animate-liquid-2 filter blur-md"
                                                    style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 40%)', backgroundSize: '120% 120%' }} />
                                            </motion.div>
                                        )}

                                        <div className="relative z-10 flex items-center justify-between w-full">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl transition-colors duration-500 ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-slate-800/50'}`}>
                                                    <item.icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                                </div>
                                                <span className={`text-sm tracking-tight transition-all duration-300 ${isActive ? 'font-black uppercase text-[11px] tracking-[0.1em]' : 'font-bold'}`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                                        </div>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Section Redesign */}
                    <div className="pt-8 mt-auto">
                        <div className="bg-slate-900/40 border border-slate-800/50 p-5 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
                            {/* Decorative liquid accent */}
                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-600/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="w-12 h-12 rounded-full border-2 border-slate-700 p-0.5 transition-transform duration-500 group-hover:rotate-12">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-sm font-black text-white shadow-inner">
                                        {user?.username?.[0] || 'A'}
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-xs font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Usuario</span>
                                    <span className="block text-sm font-black text-white italic tracking-tight">{user?.username || 'Administrador'}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 hover:text-rose-400 transition-all uppercase tracking-[0.2em] w-full py-2 border-t border-slate-800/50 mt-2 hover:bg-rose-400/5 rounded-lg"
                            >
                                <LogOut className="w-3 h-3" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 min-h-screen">
                {/* Header */}
                <header className="h-20 border-b border-nods-border/50 bg-nods-card/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold">{currentTitle}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 bg-white text-nods-text-primary border border-nods-border hover:border-nods-accent hover:text-nods-accent px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                ACTUALIZAR DATOS
                            </button>
                            {meta?.fecha_actualizacion && (
                                <span className="text-nods-text-muted text-[10px] uppercase font-bold tracking-wider flex items-center h-full pt-1">
                                    Actualizado: {meta.fecha_actualizacion}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Aliado Educativo</span>
                            <span className="font-bold text-sm text-nods-text-primary">Universidad UNAB</span>
                        </div>
                        <div className="w-11 h-11 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center border border-nods-border/50 mr-2">
                            <img src={logoUnab} alt="UNAB" className="w-full h-auto object-contain" />
                        </div>
                        <button
                            onClick={() => setShowAI(!showAI)}
                            className={`p-2.5 rounded-xl border transition-all ${showAI
                                ? 'bg-nods-accent border-nods-accent text-white shadow-lg shadow-nods-accent/20 scale-110'
                                : 'bg-white border-nods-border text-nods-text-muted hover:border-nods-accent/50 hover:text-nods-accent hover:bg-slate-50'
                                }`}
                            title="Asistente IA"
                        >
                            <Sparkles size={18} className={showAI ? 'animate-pulse' : ''} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>

                <AnimatePresence>
                    {showAI && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAI(false)}
                                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                            />
                            <AIPanel onClose={() => setShowAI(false)} />
                        </>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
