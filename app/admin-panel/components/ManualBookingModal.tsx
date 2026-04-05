import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

const ALL_SLOTS = [
  '08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', 
  '12:00 م', '01:00 م', '02:00 م', '03:00 م', 
  '04:00 م', '05:00 م', '06:00 م', '07:00 م'
];

export default function ManualBookingModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    date: '',
    time: ALL_SLOTS[0],
    sessionType: 'in-center',
    country: 'egypt',
    location: 'new-cairo',
    notes: 'حجز يدوي من الإدارة'
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إضافة الحجز');
      }

      toast.success('تم إضافة الحجز بنجاح');
      onSuccess(data.booking);
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">إضافة حجز يدوي</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم المريض</label>
              <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} dir="ltr" className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-right" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">التاريخ</label>
              <input required type="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الوقت</label>
              <select required name="time" value={formData.time} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                {ALL_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الدولة</label>
              <select name="country" value={formData.country} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                <option value="egypt">مصر</option>
                <option value="qatar">قطر</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نوع الجلسة</label>
              <select name="sessionType" value={formData.sessionType} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                <option value="in-center">في المركز</option>
                <option value="online">أونلاين</option>
              </select>
            </div>
            {formData.sessionType === 'in-center' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الفرع</label>
                <select name="location" value={formData.location} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                  <option value="new-cairo">التجمع الخامس</option>
                  <option value="madinaty">مدينتي</option>
                  <option value="doha">الدوحة</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-[2] py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? 'جاري الإضافة...' : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ الحجز
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
