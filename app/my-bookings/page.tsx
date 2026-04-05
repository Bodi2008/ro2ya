'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Calendar, Clock, MapPin, Video, CheckCircle, XCircle, Phone, LogOut, Edit2, CreditCard } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function MyBookingsPage() {
  const [phoneCode, setPhoneCode] = useState('+20');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    const savedPhone = localStorage.getItem('patientPhone');
    if (savedPhone) {
      setUserPhone(savedPhone);
      setIsLoggedIn(true);
      fetchBookings(savedPhone);
    }
  }, []);

  const fetchBookings = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('فشل تحميل الحجوزات');
      const data = await res.json();
      
      // Filter bookings by phone
      const userBookings = (data.bookings || []).filter((b: any) => b.phone === phone);
      // Sort by date descending
      userBookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setBookings(userBookings);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    const fullPhone = `${phoneCode} ${phoneNumber}`;
    localStorage.setItem('patientPhone', fullPhone);
    setUserPhone(fullPhone);
    setIsLoggedIn(true);
    fetchBookings(fullPhone);
  };

  const handleLogout = () => {
    localStorage.removeItem('patientPhone');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientCountry');
    setIsLoggedIn(false);
    setUserPhone('');
    setBookings([]);
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) return;
    
    try {
      const bookingToUpdate = bookings.find(b => b.id === id);
      if (!bookingToUpdate) return;
      
      const updatedBooking = { ...bookingToUpdate, status: 'cancelled', notes: (bookingToUpdate.notes || '') + '\n[تم الإلغاء من قبل المريض]' };
      
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });

      if (!res.ok) throw new Error('فشل إلغاء الحجز');

      setBookings(bookings.map(b => b.id === id ? updatedBooking : b));
      toast.success('تم إلغاء الحجز بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الإلغاء');
    }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast.error('يرجى اختيار التاريخ والوقت الجديد');
      return;
    }

    try {
      const bookingToUpdate = bookings.find(b => b.id === rescheduleModal.bookingId);
      if (!bookingToUpdate) return;
      
      const updatedBooking = { 
        ...bookingToUpdate, 
        status: 'pending', 
        date: newDate,
        time: newTime,
        notes: (bookingToUpdate.notes || '') + `\n[طلب تعديل موعد: من ${bookingToUpdate.date} ${bookingToUpdate.time} إلى ${newDate} ${newTime}]` 
      };
      
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });

      if (!res.ok) throw new Error('فشل إرسال طلب التعديل');

      setBookings(bookings.map(b => b.id === rescheduleModal.bookingId ? updatedBooking : b));
      toast.success('تم إرسال طلب تعديل الموعد بنجاح، سيتم مراجعته من قبل الإدارة');
      setRescheduleModal({ isOpen: false, bookingId: null });
      setNewDate('');
      setNewTime('');
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (!isLoggedIn) {
    return (
      <AppLayout>
        <Toaster position="bottom-center" richColors />
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">متابعة حجوزاتي</h2>
            <p className="text-center text-gray-500 mb-8">أدخل رقم هاتفك لعرض وإدارة حجوزاتك السابقة والقادمة</p>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <div className="flex gap-3" dir="ltr">
                  <select
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="w-1/3 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  >
                    <option value="+20">مصر (+20)</option>
                    <option value="+974">قطر (+974)</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="1X XXX XXXXX"
                    className="w-2/3 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                عرض حجوزاتي
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
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ملفي الشخصي</h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2" dir="ltr">
                <Phone className="w-4 h-4" />
                {userPhone}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold transition-colors"
            >
              <LogOut className="w-5 h-5" />
              تسجيل خروج
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد حجوزات</h3>
              <p className="text-gray-500">لم نتمكن من العثور على أي حجوزات مسجلة برقم الهاتف هذا.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${
                        booking.sessionType === 'online' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {booking.sessionType === 'online' ? <Video className="w-8 h-8" /> : <MapPin className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.sessionType === 'online' ? 'جلسة أونلاين' : 'جلسة بالمركز'}
                        </h3>
                        <p className="text-gray-500 mt-1">
                          {booking.country === 'egypt' ? 'مصر' : 'قطر'} {booking.location ? `- ${booking.location === 'new-cairo' ? 'التجمع' : booking.location === 'madinaty' ? 'مدينتي' : booking.location}` : ''}
                        </p>
                        <div className="mt-2 text-sm font-mono text-gray-400">
                          رقم الحجز: {booking.referenceNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                        booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                        booking.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                        {booking.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                        {booking.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                        {booking.status === 'pending' && <Clock className="w-4 h-4" />}
                        {booking.status === 'confirmed' ? 'مؤكد' : 
                         booking.status === 'cancelled' ? 'ملغي' : 
                         booking.status === 'completed' ? 'مكتمل' : 'قيد الانتظار'}
                      </div>
                      
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                        booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                        {booking.paymentStatus === 'paid' ? 'تم الدفع' : 'لم يتم الدفع'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium" dir="ltr">{booking.time}</span>
                    </div>
                  </div>

                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setRescheduleModal({ isOpen: true, bookingId: booking.id })}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        طلب تغيير الموعد
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl font-bold transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        إلغاء الحجز
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">طلب تغيير الموعد</h3>
            <p className="text-gray-500 mb-6">اختر التاريخ والوقت الجديد الذي يناسبك. سيتم مراجعة طلبك وتأكيده من قبل الإدارة.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ الجديد</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الوقت الجديد</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">اختر الوقت...</option>
                  <option value="08:00 ص">08:00 صباحاً</option>
                  <option value="09:00 ص">09:00 صباحاً</option>
                  <option value="10:00 ص">10:00 صباحاً</option>
                  <option value="11:00 ص">11:00 صباحاً</option>
                  <option value="12:00 م">12:00 مساءً</option>
                  <option value="01:00 م">01:00 مساءً</option>
                  <option value="02:00 م">02:00 مساءً</option>
                  <option value="03:00 م">03:00 مساءً</option>
                  <option value="04:00 م">04:00 مساءً</option>
                  <option value="05:00 م">05:00 مساءً</option>
                  <option value="06:00 م">06:00 مساءً</option>
                  <option value="07:00 م">07:00 مساءً</option>
                  <option value="08:00 م">08:00 مساءً</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleModal({ isOpen: false, bookingId: null })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleReschedule}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
