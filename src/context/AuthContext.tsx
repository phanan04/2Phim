import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isVip: boolean;
  vipPlan?: 'VIP 1 Tháng' | 'VIP 1 Năm' | 'VIP Vĩnh Viễn';
  vipExpiresAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickLoginVip: () => void;
  logout: () => void;
  upgradeToVip: (planName?: 'VIP 1 Tháng' | 'VIP 1 Năm' | 'VIP Vĩnh Viễn') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '2phim_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ' };
    }

    // Generate nice display name from email
    const fallbackName = email.split('@')[0];
    const isVipEmail = email.toLowerCase().includes('vip');

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      isVip: isVipEmail,
      vipPlan: isVipEmail ? 'VIP 1 Năm' : undefined,
      vipExpiresAt: isVipEmail ? '31/12/2026' : undefined,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const register = async (name: string, email: string): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) {
      return { success: false, error: 'Vui lòng nhập họ và tên' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ' };
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      isVip: true, // Bonus VIP 1 month on registration
      vipPlan: 'VIP 1 Tháng',
      vipExpiresAt: '30 ngày tới',
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    setUser(newUser);
    closeAuthModal();
    return { success: true };
  };

  const quickLoginVip = () => {
    const vipUser: User = {
      id: 'usr_vip_premium',
      name: 'Thành Viên VIP',
      email: 'vip.member@2phim.vip',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isVip: true,
      vipPlan: 'VIP Vĩnh Viễn',
      vipExpiresAt: 'Không giới hạn',
      createdAt: '18/11/2026',
    };
    setUser(vipUser);
    closeAuthModal();
  };

  const logout = () => {
    setUser(null);
  };

  const upgradeToVip = (planName: 'VIP 1 Tháng' | 'VIP 1 Năm' | 'VIP Vĩnh Viễn' = 'VIP 1 Năm') => {
    if (!user) {
      openAuthModal('register');
      return;
    }
    setUser({
      ...user,
      isVip: true,
      vipPlan: planName,
      vipExpiresAt: planName === 'VIP Vĩnh Viễn' ? 'Không giới hạn' : '31/12/2026',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        quickLoginVip,
        logout,
        upgradeToVip,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
