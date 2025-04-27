// src/context/AuthContext.tsx

import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    useMemo,
    useCallback,
    ReactNode,
} from 'react';
import apiClient from '../services/api'; 

interface AuthToken {
    access_token: string;
    token_type: string; 
}

interface User {
    id: number;
    student_number: string;
}


// Context'in sağlayacağı değerlerin tipi
interface AuthContextType {
    token: string | null;
    user: User | null; // Giriş yapan kullanıcı bilgisi
    isAuthenticated: boolean; // Giriş yapıldı mı?
    isLoading: boolean; // Auth durumu kontrol ediliyor mu (ilk yükleme)?
    login: (studentNumber: string) => Promise<boolean>; // Login fonksiyonu (başarı durumunu dönsün)
    logout: () => void; // Logout fonksiyonu
}

// Context'i oluşturma (başlangıç değeri undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Bileşeni
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null); 
    const [isLoading, setIsLoading] = useState<boolean>(true); 

    // Token'ı localStorage'dan alma/ayarlama fonksiyonları (helper)
    const setTokenInStorage = (newToken: string | null) => {
        if (newToken) {
            localStorage.setItem('authToken', newToken);
        } else {
            localStorage.removeItem('authToken');
        }
        setToken(newToken);
    };

    // Kullanıcı bilgilerini getiren fonksiyon
    const fetchUser = useCallback(async (currentToken: string) => {
        if (!currentToken) return null;
        try {
            console.log("Fetching user data...");
            const response = await apiClient.get<User>('/auth/me');
            console.log("User data fetched:", response.data);
            setUser(response.data);
            return response.data;
        } catch (error: any) {
            console.error("Kullanıcı bilgisi alınamadı (fetchUser):", error);
            // Token geçersizse temizle
            if (error.response && error.response.status === 401) {
                setTokenInStorage(null);
                setUser(null);
            }
            return null;
        }
    }, []);


    // İlk Yükleme Effect'i: Sayfa yüklendiğinde token'ı kontrol et
    useEffect(() => {
        console.log("AuthContext: Initial load effect running...");
        const initialToken = localStorage.getItem('authToken');
        if (initialToken) {
            console.log("Token found in storage:", initialToken);
            setToken(initialToken);
            fetchUser(initialToken).finally(() => {
                setIsLoading(false);
                console.log("Initial auth check complete.");
            });
        } else {
            console.log("No token found in storage.");
            setIsLoading(false); // Token yoksa yüklemeyi bitir
        }
    }, [fetchUser]); 

    // Login Fonksiyonu
    const login = useCallback(async (studentNumber: string): Promise<boolean> => {
        setIsLoading(true); // Login işlemi başladığında yükleniyor
        console.log(`Attempting login for student: ${studentNumber}`);
        try {
            // Backend'e login isteği gönder (x-www-form-urlencoded olarak)
            const formData = new URLSearchParams();
            formData.append('student_number', studentNumber);

            const response = await apiClient.post<AuthToken>(
                '/auth/login',
                formData, // Veriyi form data olarak gönder
                { // Axios config
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token } = response.data;
            console.log("Login successful, received token:", access_token);
            setTokenInStorage(access_token); // Token'ı state'e ve storage'a kaydet
            await fetchUser(access_token); // Kullanıcı bilgilerini çek ve state'e kaydet
            return true; // Başarılı login

        } catch (error: any) {
            console.error("Login hatası:", error.response?.data || error.message);
            setTokenInStorage(null); // Hata durumunda token'ı temizle
            setUser(null);
            return false; // Başarısız login
        } finally {
            setIsLoading(false); // Login işlemi bittiğinde yükleniyor durumunu kapat
        }
    }, [fetchUser]); 

    // Logout Fonksiyonu
    const logout = useCallback(() => {
        console.log("Logging out...");
        setTokenInStorage(null); // Token'ı state'den ve storage'dan sil
        setUser(null); // Kullanıcı bilgisini sil

    }, []);

    const value = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token && !!user, // Hem token hem user varsa giriş yapılmış sayılır
        isLoading, // isLoading state'ini context'e ekle
        login,
        logout,
    }), [token, user, isLoading, login, logout]);
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook: Context'i kullanmayı kolaylaştırır
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};