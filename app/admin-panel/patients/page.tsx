'use client';
import React, { useState, useEffect } from 'react';
import PatientProfiles from '../components/PatientProfiles';
import { toast } from 'sonner';

export default function PatientsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) throw new Error(`Bookings API error: ${res.status}`);
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (error: any) {
        console.error('Error loading patients data:', error);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PatientProfiles 
        bookings={bookings} 
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
      />
    </div>
  );
}
