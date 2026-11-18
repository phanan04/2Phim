import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Crown, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    login,
    register,
    quickLoginVip,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync tab state when modal opened with specific tab
  React.useEffect(() => {
    setActiveTab(authModalTab);
    setError(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await login(email, password);
        if (!res.success) setError(res.error || 'Đăng nhập không thành công');
      } else {
        const res = await register(name, email, password);
        if (!res.success) setError(res.error || 'Đăng ký không thành công');
      }
    } catch {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Blurred Backdrop */}
      <div
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/75 backdrop-blur-xl transition-opacity"
      />

      {/* Liquid Glass Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden liquid-glass-dropdown border border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#FECF59]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors z-20"
          title="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FECF59]/15 border border-[#FECF59]/30 text-[#FECF59] text-[11px] font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>2PHIM VIP MEMBER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {activeTab === 'login' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản VIP'}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {activeTab === 'login'
              ? 'Đăng nhập để đồng bộ phim yêu thích và lịch sử xem'
              : 'Đăng ký ngay hôm nay để nhận 30 ngày VIP trải nghiệm miễn phí'}
          </p>
        </div>

        {/* Quick Demo VIP Login Shortcut Button */}
        <button
          type="button"
          onClick={quickLoginVip}
          className="w-full mb-5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#FECF59] via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-[0_0_25px_rgba(254,207,89,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Trải nghiệm ngay tài khoản VIP (1 Click)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[11px] uppercase tracking-wider font-bold text-white/40">hoặc</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'register'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {activeTab === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                Họ và Tên
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Long"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FECF59] text-white placeholder-white/30 text-xs sm:text-sm outline-none transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
              Địa Chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FECF59] text-white placeholder-white/30 text-xs sm:text-sm outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-[#FECF59] text-white placeholder-white/30 text-xs sm:text-sm outline-none transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all shadow-md disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : activeTab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </button>
        </form>

        {/* VIP Perks Micro-List */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FECF59] shrink-0" />
            <span className="truncate">Tốc độ Full HD/4K</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FECF59] shrink-0" />
            <span className="truncate">100% Không quảng cáo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FECF59] shrink-0" />
            <span className="truncate">Đồng bộ mọi thiết bị</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FECF59] shrink-0" />
            <span className="truncate">Xem tiếp không gián đoạn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
