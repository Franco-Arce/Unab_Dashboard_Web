import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Activity, BarChart3, ShieldCheck, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import logoUnab from '../assets/logo-unab-full.png';
import nodsDark from '../assets/nods-dark.png';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.login(username, password);
            localStorage.setItem('unab_token', res.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            if (err.message === 'Failed to fetch') {
                setError('No se pudo conectar con el servidor.');
            } else {
                setError(err.message || 'Credenciales incorrectas');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans bg-[#f8fafc] overflow-hidden text-slate-900">
            {/* Panel Izquierdo */}
            <div className="hidden lg:flex w-[45%] bg-[#0a0f18] relative flex-col items-center justify-center p-16 text-white overflow-hidden">
                {/* Fondo abstracto */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1" />
                            </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#grid)" />
                        <path d="M0,85 Q20,75 40,85 T80,65 T100,75" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="0.2" />
                        <path d="M0,40 Q30,50 60,30 T100,45" fill="none" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="0.2" />
                    </svg>
                </div>

                {/* Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-slate-800/20 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 text-center max-w-sm"
                >
                    {/* Logo UNAB */}
                    <div className="mb-8 inline-flex items-center justify-center">
                        <img src={logoUnab} alt="UNAB" className="h-20 w-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]" />
                    </div>

                    <h1 className="text-5xl font-black tracking-tighter mb-4">
                        Grupo <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">NODS</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold tracking-[0.3em] uppercase opacity-80">
                        IA DASHBOARD
                    </p>

                    <div className="mt-16 flex justify-between items-center opacity-60 px-4">
                        <div className="flex flex-col items-center gap-3">
                            <Activity size={20} className="text-blue-400" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Métricas</span>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div className="flex flex-col items-center gap-3">
                            <BarChart3 size={20} className="text-blue-400" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Análisis</span>
                        </div>
                        <div className="w-px h-8 bg-slate-700" />
                        <div className="flex flex-col items-center gap-3">
                            <ShieldCheck size={20} className="text-blue-400" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Seguridad</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Panel Derecho: Formulario */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative">
                {/* Decoración sutil */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />

                {/* Mobile header */}
                <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                        <img src={logoUnab} alt="UNAB" className="w-7 h-auto" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">UNAB</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="w-full max-w-md"
                >
                    {/* Card with Border Beam */}
                    <div className="relative rounded-[3rem] p-[2px] overflow-hidden">
                        {/* Rotating beam */}
                        <div
                            className="absolute animate-border-beam rounded-[3rem]"
                            style={{
                                background: 'conic-gradient(from 0deg, transparent 0%, transparent 75%, #3b82f6 85%, transparent 100%)',
                            }}
                        />
                        <div className="bg-white backdrop-blur-2xl p-8 sm:p-12 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative z-10 transition-all hover:shadow-[0_40px_80px_-12px_rgba(0,0,0,0.12)]">
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Acceso Administrativo</span>
                                </div>
                                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Bienvenido.</h2>
                                <p className="text-slate-500 mt-3 text-lg">Inicia sesión en la plataforma de control.</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-7">
                                {/* Usuario */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Usuario</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Ingresá tu usuario"
                                            className="w-full pl-12 pr-4 py-[1.125rem] bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Contraseña */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full pl-12 pr-12 py-[1.125rem] bg-slate-50/50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/50 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2.5 text-red-600 text-xs font-bold bg-red-50 p-3.5 rounded-xl border border-red-100"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Submit */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group w-full py-5 bg-[#1e40af] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                Ingresando...
                                            </>
                                        ) : (
                                            <>
                                                Iniciar Sesión
                                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-center space-y-4">
                        <div className="flex items-center justify-center gap-3 opacity-30">
                            <div className="h-px w-8 bg-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500">Credenciales</span>
                            <div className="h-px w-8 bg-slate-400" />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-slate-400 text-xs font-medium">Powered by</span>
                            <img src={nodsDark} alt="NODS" className="h-5 w-auto opacity-50 hover:opacity-80 transition-opacity duration-500" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes border-beam {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-border-beam {
                    animation: border-beam 4s linear infinite;
                    width: 200%;
                    height: 200%;
                    top: -50%;
                    left: -50%;
                }
            `}} />
        </div>
    );
}
