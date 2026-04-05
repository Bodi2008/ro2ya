'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Lock, LogOut, LayoutDashboard, Settings, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Amira' && password === '1871982') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
    } else {
      toast.error('بيانات الدخول غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    router.push('/admin-panel');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <Toaster position="bottom-center" richColors />
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">تسجيل الدخول للإدارة</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent text-right"
                  dir="ltr"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="bottom-center" richColors />
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="bg-white shadow-sm border-b sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-bold text-gray-900">الإدارة</h1>
                <nav className="hidden md:flex items-center gap-2">
                  <Link 
                    href="/admin-panel" 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${pathname === '/admin-panel' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <LayoutDashboard size={18} />
                    الرئيسية
                  </Link>
                  <Link 
                    href="/admin-panel/patients" 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${pathname === '/admin-panel/patients' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Users size={18} />
                    ملفات المرضى
                  </Link>
                  <Link 
                    href="/admin-panel/settings" 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${pathname === '/admin-panel/settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Settings size={18} />
                    الإعدادات
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden sm:block">
                  آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                >
                  <LogOut size={16} />
                  تسجيل خروج
                </button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </AppLayout>
  );
}
