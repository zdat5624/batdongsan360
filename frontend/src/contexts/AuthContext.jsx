import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserData = async (token) => {
        try {
            const response = await axiosInstance.get('/api/auth/account');
            if (response.data.statusCode === 200) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setIsAuthenticated(true);
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const checkAuthStatus = async () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        if (storedUser && token) {
            await fetchUserData(token);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            checkAuthStatus();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', token);
        await fetchUserData(token); // Gọi API để lấy thông tin người dùng mới nhất
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);