// frontend/src/components/Login.tsx

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
        <div className="flex items-center justify-center min-h-screen bg-[url(/mcworld-bg.jpg)] bg-center bg-cover bg-no-repeat bg-opacity-60">
            <div className="p-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-md w-full max-w-sm">
                
                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-100 mb-1 font-minecraft">
                            Email Adresi
                        </label>
                        <input
                            type="email" 
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            className="text-lg w-full px-3 py-4 border text-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-minecraft"
                            placeholder=""
                            disabled={isLoading}
                            required
                            autoComplete="email"
                        />
                    </div>
                    {/* Password Input */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-100 mb-1 font-minecraft">
                            Şifre
                        </label>
                        <input
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full px-3 py-4 border text-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-minecraft"
                            placeholder=""
                            disabled={isLoading}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (<p className="mb-4 text-sm text-red-600 text-center font-minecraft">{error}</p>)}

                    <button
                        type="submit"
                        disabled={isLoading} // AuthContext'teki isLoading durumuna göre disable et
                        className={`w-full px-4 py-3 text-gray-100 rounded-md transition-colors duration-200 font-minecraft ${isLoading
                                ? 'bg-sky-300 cursor-not-allowed'
                                : 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500'
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