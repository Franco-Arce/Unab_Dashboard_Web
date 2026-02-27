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
    Sparkles,
    Menu,
    X
} from 'lucide-react';
import AIPanel from '../components/AIPanel';
import api from '../api';
import { useFilters } from '../context/FilterContext';
import logoUnab from '../assets/unab-logo.jpg';
import nLogo from '../assets/n-logo.png';
import nodsWhite from '../assets/nods-white.png';
import nodsDark from '../assets/nods-dark.png';

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [meta, setMeta] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showAI, setShowAI] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { nivel, setNivel } = useFilters();

    const openAIPanel = () => {
        setShowAI(true);
    };
    const navigate = useNavigate();
    const location = useLocation();

    // Derive current page name from path for page-specific AI insights
    const currentPage = location.pathname.split('/').pop() || 'overview';

    // Close sidebar on navigation (mobile) + scroll to top
    useEffect(() => {
        setSidebarOpen(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

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
            window.location.reload();
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

    const sidebarContent = (
        <div className="p-8 flex flex-col h-full">
            {/* Logo Section - Grupo Nods Logo */}
            <div className="flex items-center justify-center mb-8">
                <img
                    src={nodsWhite}
                    alt="Grupo Nods"
                    className="h-8 w-auto"
                />
            </div>

            {/* Level Selector */}
            <div className="mb-6 bg-slate-800/20 p-1.5 rounded-2xl border border-slate-700/30 flex gap-2">
                {['TODOS', 'GRADO', 'POSGRADO'].map((opt) => (
                    <button
                        key={opt}
                        onClick={() => setNivel(opt)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 tracking-widest ${nivel === opt
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
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
                                ? 'text-white shadow-2xl shadow-blue-900/40'
                                : 'text-slate-500 hover:text-slate-200'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {/* Background active highlight (Matches Total Leads Blue) */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 z-0 overflow-hidden"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] opacity-100" />
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
            <div className="pt-8 mt-auto border-t border-slate-800/50">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-blue-500/10">
                            {user?.username?.[0] || 'A'}
                        </div>
                        <div>
                            <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Personal</span>
                            <span className="block text-sm font-black text-white tracking-tight">{user?.username || 'Administrador'}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-xl transition-all group"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-nods-bg text-nods-text-primary font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-shrink-0 bg-[#0a0f18] flex-col sticky top-0 h-screen transition-all duration-300 border-r border-slate-800/30">
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 w-72 h-screen bg-[#0a0f18] z-50 lg:hidden shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 min-w-0 min-h-screen">
                {/* Header */}
                <header className="h-20 border-b border-nods-border/50 bg-nods-card/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-nods-text-muted hover:text-nods-text-primary hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold">{currentTitle}</h2>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 bg-white text-nods-text-primary border border-nods-border hover:border-nods-accent hover:text-nods-accent px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">ACTUALIZAR DATOS</span>
                                    <span className="sm:hidden">ACTUALIZAR</span>
                                </button>
                                {meta?.fecha_actualizacion && (
                                    <span className="text-nods-text-muted text-[10px] uppercase font-bold tracking-wider flex items-center h-full pt-1 hidden sm:flex">
                                        Actualizado: {meta.fecha_actualizacion}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Aliado Educativo</span>
                            <span className="font-bold text-sm text-nods-text-primary">Universidad UNAB</span>
                        </div>
                        <div className="w-11 h-11 bg-transparent p-1 rounded-xl flex items-center justify-center mr-2">
                            <img
                                src={logoUnab}
                                alt="UNAB"
                                className="w-full h-auto object-contain mix-blend-multiply"
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content with transition */}
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 md:p-8 max-w-[1600px] mx-auto w-full"
                >
                    <Outlet context={{ openAIPanel, currentPage }} />
                </motion.div>

                {/* Premium Floating AI Button */}
                {!showAI && (
                    <div className="fixed bottom-10 right-10 z-30">
                        <button
                            onClick={openAIPanel}
                            className="relative group outline-none"
                        >
                            {/* Aura/Glow on hover */}
                            <div className="absolute inset-[-8px] bg-indigo-500/30 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ai-pulse" />

                            {/* Pulse ring */}
                            <div className="absolute inset-0 bg-indigo-400/20 rounded-2xl animate-ai-pulse" />

                            {/* Main body */}
                            <div className="relative flex items-center justify-center w-[60px] h-[60px] bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 rounded-2xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] border border-white/20 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 animate-ai-float active:scale-95">
                                <Sparkles className="text-white w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />

                                {/* Active indicator */}
                                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
                                </div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                                Consultar a la IA
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                            </div>
                        </button>
                    </div>
                )}

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

            {/* AI Button Animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes ai-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes ai-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.4); opacity: 0.1; }
                }
                .animate-ai-float {
                    animation: ai-float 3.5s ease-in-out infinite;
                }
                .animate-ai-pulse {
                    animation: ai-pulse 4s ease-in-out infinite;
                }
            `}} />
        </div>
    );
}
