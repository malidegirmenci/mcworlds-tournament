// src/components/Login.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Lütfen email ve şifrenizi girin.');
            return;
        }

        const success = await login(email, password);

        if (!success) {
            setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            setPassword('');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-cover bg-center" style={{ backgroundImage: "url('/arkaplan.jpg')" }}>

            {/* Login Kutusu */}
            <div className="p-6 sm:p-8 bg-gray-800 bg-opacity-90 rounded-lg shadow-xl w-full max-w-md backdrop-blur-sm border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider font-minecraft">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-500 font-minecraft"
                            placeholder="" 
                            disabled={isLoading}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1 uppercase tracking-wider font-minecraft">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent placeholder-gray-500 font-minecraft"
                            placeholder="" 
                            disabled={isLoading}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Hata Mesajı Alanı */}
                    {error && (
                        <p className="text-sm text-red-400 text-center font-minecraft">{error}</p>
                    )}

                    {/* Giriş Butonu */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full px-4 py-3 text-lg font-bold cursor-grab text-white rounded-sm transition-colors duration-200 font-minecraft uppercase tracking-wider ${isLoading
                                ? 'bg-sky-800 cursor-not-allowed'
                                : 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500'
                            }`}
                    >
                        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

