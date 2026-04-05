import React from 'react';
import Link from 'next/link';
import { Shield, Phone, Facebook, Twitter, Instagram, } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { TbHealthRecognition } from "react-icons/tb";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Dr. Amira Attia Logo" className="w-12 h-12 object-contain rounded-full" />
              <span className="font-bold text-xl text-gray-900">Dr.Amira Attia</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">الرئيسية</Link>
              <Link href="/my-bookings" className="text-gray-600 hover:text-blue-600 font-medium">حجوزاتي</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                سرية تامة
              </h3>
              <p className="text-gray-400 text-sm">نحن نضمن سرية جميع بياناتك وجلساتك العلاجية.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400" />
                تواصل معنا
              </h3>
<a href="https://wa.me/201228168170"
  target="_blank" 
  className="text-gray-400 text-sm block">
  مصر : <span dir="ltr" className="whitespace-nowrap">+20 122 816 8170</span>
</a>

<a href="https://wa.me/97477331874"
  target="_blank" 
  className="text-gray-400 text-sm block">
  قطر: <span dir="ltr" className="whitespace-nowrap">+974 7733 1874</span>
</a>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">تابعنا على</h3>
              <div className="flex items-center gap-4">
                <a href="https://www.facebook.com/amiraattiatrainer" 
                  target="_blank" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/dr.amira_attia/"
                  target="_blank" 
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Dr.Amira Attia. جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>
    </div>
  );
}
