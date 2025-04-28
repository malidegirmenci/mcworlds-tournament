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

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

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
            if (error.response && error.response.status === 401) {
                setTokenInStorage(null);
                setUser(null);
            }
            return null;
        }
    }, []);

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
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        console.log(`Attempting login for email: ${email}`);
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiClient.post<AuthToken>(
                '/auth/login',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token } = response.data;
            console.log("Login successful, received token:", access_token);
            setTokenInStorage(access_token);
            await fetchUser(access_token);
            return true;

        } catch (error: any) {
            console.error("Login hatası:", error.response?.data || error.message);
            setTokenInStorage(null);
            setUser(null);
            return false;
        } finally {
            setIsLoading(false);
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