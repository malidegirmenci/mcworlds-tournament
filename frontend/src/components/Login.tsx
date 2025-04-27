// src/components/Login.tsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; 

const Login: React.FC = () => {
    // useAuth hook'u ile context'ten gerekli değerleri al
    const { login, isLoading } = useAuth();

    // Form input'u için local state
    const [studentNumber, setStudentNumber] = useState<string>('');
    // Lokal hata mesajı için state
    const [error, setError] = useState<string | null>(null);

    // Form gönderildiğinde çalışacak fonksiyon
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
        setError(null); // Önceki hatayı temizle

        if (!studentNumber.trim()) {
            setError('Lütfen öğrenci numaranızı girin.');
            return;
        }

        // Context'ten aldığımız login fonksiyonunu çağır
        const success = await login(studentNumber);

        if (!success) {
            // Context'teki login fonksiyonu false dönerse (hata oluştuysa)
            setError('Giriş başarısız. Lütfen numaranızı kontrol edin veya daha sonra tekrar deneyin.');
            // Şifre alanını temizle (güvenlik için)
            // setStudentNumber(''); // Numara alanı kalsın, kullanıcı düzeltebilir
        }
    };

    // Input değeri değiştiğinde state'i güncelle
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStudentNumber(event.target.value);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[url(/mcworld-bg.jpg)] bg-center bg-cover bg-no-repeat bg-opacity-60">
            <div className="p-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-100 font-minecraft">
                    Öğrenci Girişi
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-100 mb-1 font-minecraft">
                            Öğrenci Numarası
                        </label>
                        <input
                            type="text"
                            id="studentNumber"
                            value={studentNumber}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2  text-gray-100 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 focus:border-sky-200 font-minecraft" 
                            placeholder=""
                            disabled={isLoading} // AuthContext'teki isLoading durumuna göre disable et
                            required 
                        />
                    </div>

                    {/* Hata Mesajı Alanı */}
                    {error && (
                        <p className="mb-4 text-sm text-red-600 text-center font-minecraft">{error}</p>
                    )}

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