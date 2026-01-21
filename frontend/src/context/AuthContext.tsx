import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  login: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (loginData: string, password: string) => {
    try {
      console.log('🔄 Попытка входа с:', { loginData, password });
    
    // Имитация ответа сервера - все тестовые пользователи
        const mockUsers = {
        'student1': { 
            login: 'student1', 
            role: 'student', 
            fullName: 'Иван Учеников' 
        },
        'cook1': { 
            login: 'cook1', 
            role: 'cook', 
            fullName: 'Петр Поваров' 
        },
        'admin1': { 
            login: 'admin1', 
            role: 'admin', 
            fullName: 'Сидор Админов' 
        }
        };
        
        // Находим пользователя по логину
        const user = mockUsers[loginData as keyof typeof mockUsers];
        
        // Проверяем пароль
        if (user && password === 'pass123') {
        const mockToken = 'mock-jwt-token-for-testing';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('✅ Успешный вход для:', user);
        return { success: true, user };
        } else {
        console.log('❌ Неверный логин/пароль или пользователь не найден');
        return { 
            success: false, 
            error: 'Неверный логин или пароль' 
        };
        }
    } catch (error) {
        console.error('🔥 Login error:', error);
        return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
        };
    }
    };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};