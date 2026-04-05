'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, CalendarDays } from 'lucide-react';
import WorkHoursManager from './components/WorkHoursManager';
import Statistics from './components/Statistics';
import MonthlyCalendar from './components/MonthlyCalendar';
import BookingsTable from './components/BookingsTable';
import { toast } from 'sonner';

export default function AdminPanelPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsRes, scheduleRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/schedule')
        ]);
        
        if (!bookingsRes.ok) throw new Error(`Bookings API error: ${bookingsRes.status}`);
        if (!scheduleRes.ok) throw new Error(`Schedule API error: ${scheduleRes.status}`);
        
        const bookingsData = await bookingsRes.json();
        const scheduleData = await scheduleRes.json();
        
        setBookings(bookingsData.bookings || []);
        setSchedule(scheduleData.schedule || []);
      } catch (error: any) {
        console.error('Error loading admin data:', error);
        toast.error(`حدث خطأ أثناء تحميل البيانات: ${error.message || 'خطأ غير معروف'}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePaymentStatusChange = async (id: string, paymentStatus: 'paid' | 'unpaid') => {
    try {
      const bookingToUpdate = bookings.find(b => b.id === id);
      if (!bookingToUpdate) return;
      
      const updatedBooking = { ...bookingToUpdate, paymentStatus };
      
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });

      if (!res.ok) throw new Error('Failed to update');

      const updated = bookings.map((b) => b.id === id ? updatedBooking : b);
      setBookings(updated);
      toast.success('تم تحديث حالة الدفع');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const bookingToUpdate = bookings.find(b => b.id === id);
      if (!bookingToUpdate) return;
      
      const updatedBooking = { ...bookingToUpdate, status };
      
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });

      if (!res.ok) throw new Error('Failed to update');

      const updated = bookings.map((b) => b.id === id ? updatedBooking : b);
      setBookings(updated);
      toast.success('تم تحديث حالة الحجز');
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const confirmDelete = async () => {
    if (!bookingToDelete) return;
    
    try {
      const res = await fetch(`/api/bookings?id=${bookingToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      const updated = bookings.filter((b) => b.id !== bookingToDelete);
      setBookings(updated);
      toast.success('تم حذف الحجز نهائياً');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setBookingToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative">
      {/* Delete Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الحجز نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setBookingToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          الإحصائيات
        </h2>
        <Statistics bookings={bookings} />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          إدارة المواعيد
        </h2>
        <WorkHoursManager 
          schedule={schedule}
          bookings={bookings}
          onUpdate={setSchedule}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarDays className="text-blue-600" />
          التقويم الشهري
        </h2>
        <MonthlyCalendar 
          bookings={bookings}
          onUpdate={setBookings}
          schedule={schedule}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarDays className="text-blue-600" />
          جدول الحجوزات
        </h2>
        <BookingsTable 
          bookings={bookings}
          onPaymentStatusChange={handlePaymentStatusChange}
          onStatusChange={handleStatusChange}
          onDelete={(id) => setBookingToDelete(id)}
        />
      </section>
    </div>
  );
}
