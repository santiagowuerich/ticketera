import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;

            // Guardar token y datos del usuario
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirigir al dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rust/20 mb-4">
                        <Ticket className="w-8 h-8 text-rust-light" />
                    </div>
                    <h1 className="text-2xl font-serif font-semibold text-foreground">
                        Museo La Unidad
                    </h1>
                    <p className="text-muted-foreground mt-2">Panel de Administración</p>
                </div>

                {/* Login Form */}
                <div className="bg-[#2d2d2d] rounded-2xl p-8 border border-border">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Iniciar Sesión</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                placeholder="admin@museo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-[#1a1a1a] border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-[#1a1a1a] border-border pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-rust hover:bg-rust-light text-foreground h-12"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Ingresar'
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-muted-foreground text-sm mt-6">
                    © {new Date().getFullYear()} Museo de la Cárcel - La Unidad
                </p>
            </div>
        </div>
    );
}
