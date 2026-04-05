import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Heart, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="bg-therapy-calm py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-relaxed md:leading-tight">
            خطوتك الأولى نحو <br className="sm:hidden" /><span className="text-blue-600 inline-block mt-2.5 sm:mt-0">صحة نفسية أفضل</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
           ابدأ رحلة التعافي في بيئة آمنة وداعمة مع <span className="font-bold text-blue-600">د. أميرة عطية</span>.
          </p>
          <Link 
            href="/booking-interface" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            احجز جلستك الآن
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">رعاية متخصصة</h3>
              <p className="text-gray-600">نقدم خطط علاجية مخصصة تناسب احتياجاتك الفردية.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">خصوصية تامة</h3>
              <p className="text-gray-600">نلتزم بأعلى معايير السرية والخصوصية لجميع عملائنا.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gray-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">مواعيد مرنة</h3>
              <p className="text-gray-600">نوفر جلسات حضورية وأونلاين لتناسب جدولك الزمني.</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
