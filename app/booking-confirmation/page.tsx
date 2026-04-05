'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar, MapPin, Phone, User, Download, Share2, Image as ImageIcon } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { toast, Toaster } from 'sonner';
import { toPng } from 'html-to-image';

interface BookingData {
  id: string;
  patientName: string;
  phone: string;
  country: string;
  sessionType: string;
  location?: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  referenceNumber: string;
  createdAt: string;
}

const qatarTimeMap: Record<string, string> = {
  '08:00 ص': '09:00 ص',
  '09:00 ص': '10:00 ص',
  '10:00 ص': '11:00 ص',
  '11:00 ص': '12:00 م',
  '12:00 م': '01:00 م',
  '01:00 م': '02:00 م',
  '02:00 م': '03:00 م',
  '03:00 م': '04:00 م',
  '04:00 م': '05:00 م',
  '05:00 م': '06:00 م',
  '06:00 م': '07:00 م',
  '07:00 م': '08:00 م'
};

export default function BookingConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedBooking = sessionStorage.getItem('lastBooking');
    if (savedBooking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBooking(JSON.parse(savedBooking));
    } else {
      router.push('/booking-interface');
    }

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        setLoading(false);
      });
  }, [router]);

  const getCountryName = (c: string) => settings?.countries.find((x: any) => x.id === c)?.name || c;
  const getSessionTypeName = (s: string) => settings?.sessionTypes.find((x: any) => x.id === s)?.name || s;
  const getLocationName = (l: string) => settings?.branches.find((x: any) => x.id === l)?.name || l;

  const handleShare = async () => {
    if (!booking) return;

    const displayTime = booking.country === 'qatar' ? qatarTimeMap[booking.time] : booking.time;

    const shareData = {
      title: 'حجز جلسة علاجية',
      text: `حجزت جلسة ${getSessionTypeName(booking.sessionType)} في ${booking.date} الساعة ${displayTime}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط الحجز');
    }
  };

  const handleDownload = async () => {
    if (!booking || !cardRef.current) return;

    try {
      // Temporarily add a background color to the ref element for the screenshot
      const originalBg = cardRef.current.style.backgroundColor;
      cardRef.current.style.backgroundColor = '#f8fafc'; // A light gray/blue matching therapy-calm
      cardRef.current.style.padding = '24px';
      cardRef.current.style.borderRadius = '24px';
      cardRef.current.style.margin = '-24px';

      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });
      
      // Restore original styles
      cardRef.current.style.backgroundColor = originalBg;
      cardRef.current.style.padding = '';
      cardRef.current.style.borderRadius = '';
      cardRef.current.style.margin = '';

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `تأكيد-حجز-${booking.referenceNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('تم حفظ الصورة بنجاح');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('حدث خطأ أثناء حفظ الصورة');
    }
  };

  const handleNewBooking = () => {
    sessionStorage.removeItem('lastBooking');
    router.push('/booking-interface');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">جاري تحميل تأكيد الحجز...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!booking) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">لم يتم العثور على بيانات الحجز</p>
            <button
              onClick={() => router.push('/booking-interface')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              حجز جديد
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const displayTime = booking.country === 'qatar' ? qatarTimeMap[booking.time] : booking.time;

  return (
    <AppLayout>
      <Toaster position="bottom-center" richColors />
      <div className="min-h-screen bg-therapy-calm py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div ref={cardRef} className="pb-4" style={{ backgroundColor: '#f8fafc', color: '#111827' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-sm" style={{ backgroundColor: '#dcfce7' }}>
                <CheckCircle className="w-10 h-10" style={{ color: '#16a34a' }} />
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
                تم تأكيد حجزك بنجاح!
              </h1>
              <p className="text-lg" style={{ color: '#4b5563' }}>
                شكراً لك {booking.patientName}، تم استلام حجزك وجاري معالجته
              </p>
            </div>

            <div className="rounded-3xl shadow-lg p-8 mb-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6' }}>
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 rounded-full text-sm font-bold border" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#dbeafe' }}>
                  رقم المرجع: <span className="text-lg ml-2 tracking-wider">{booking.referenceNumber}</span>
                </div>
              </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                  <User className="w-5 h-5" style={{ color: '#4b5563' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#6b7280' }}>الاسم</p>
                  <p className="font-bold" style={{ color: '#111827' }}>{booking.patientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                  <Calendar className="w-5 h-5" style={{ color: '#4b5563' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#6b7280' }}>التاريخ والوقت</p>
                  <p className="font-bold" style={{ color: '#111827' }}>
                    {booking.date} الساعة {displayTime}
                    {booking.country === 'qatar' && (
                      <span className="text-sm block mt-1 font-normal" style={{ color: '#2563eb' }}>
                        (بتوقيت قطر)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#4b5563' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#6b7280' }}>نوع الجلسة</p>
                  <p className="font-bold" style={{ color: '#111827' }}>
                    {getSessionTypeName(booking.sessionType)}
                    {booking.sessionType === 'in-center' && booking.location ? ` - ${getLocationName(booking.location)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: '#f9fafb' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                  <Phone className="w-5 h-5" style={{ color: '#4b5563' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#6b7280' }}>رقم الهاتف</p>
                  <p className="font-bold" dir="ltr" style={{ color: '#111827' }}>{booking.phone}</p>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <button
              onClick={() => {
                const url = sessionStorage.getItem('lastWhatsappUrl');
                if (url) window.location.href = url;
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              <Phone className="w-5 h-5" />
              إرسال رسالة تأكيد عبر الواتس
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-4 px-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              مشاركة
            </button>
            
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-4 px-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              حفظ كصورة
            </button>
            
            <button
              onClick={handleNewBooking}
              className="flex-1 bg-blue-600 text-white py-4 px-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              حجز جديد
            </button>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="font-bold text-yellow-800 mb-3 text-lg">ملاحظات هامة</h3>
            <ul className="space-y-3 text-sm text-yellow-700">
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>سيتم التواصل معك قريباً لتأكيد الموعد النهائي.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>يرجى الحضور قبل 10 دقائق من الموعد المحدد في حالة الجلسات الحضورية.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold">•</span>
                <span>في حالة عدم القدرة على الحضور، يرجى إلغاء الموعد قبل 24 ساعة.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
