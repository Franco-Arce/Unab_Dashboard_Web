import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';
import api from '../api';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [username, setUsername] = useState('Admin'); // Default for convenience
    const [password, setPassword] = useState('Admin123'); // Default for convenience
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
                setError('No se pudo conectar con el servidor. Verifica VITE_API_URL en Vercel.');
            } else {
                setError(err.message || 'Credenciales incorrectas');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,188,2,0.3)]">
                        <span className="text-black font-black text-2xl">U</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Universidad UNAB</h1>
                    <p className="text-zinc-500 text-sm mt-1">Dashboard de Control de Campaña</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Usuario</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(245,188,2,0.2)] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Iniciando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-col items-center">
                    <span className="text-zinc-600 text-xs font-bold tracking-widest uppercase">Grupo Nods</span>
                </div>
            </motion.div>
        </div>
    );
}
