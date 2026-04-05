import React, { useMemo, useState } from 'react';
import { Users, Phone, Calendar, Clock, MapPin, Video, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  bookings: any[];
  onStatusChange?: (id: string, status: string) => void;
  onPaymentStatusChange?: (id: string, paymentStatus: 'paid' | 'unpaid') => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'مؤكد', className: 'bg-green-100 text-green-700' },
  pending: { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'مكتمل', className: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'ملغي', className: 'bg-red-100 text-red-700' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  paid: { label: 'تم الدفع ✓', className: 'bg-green-100 text-green-700' },
  unpaid: { label: 'لم يتم الدفع ✕', className: 'bg-red-100 text-red-700' },
};

export default function PatientProfiles({ bookings, onStatusChange, onPaymentStatusChange }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Group bookings by phone number
  const patients = useMemo(() => {
    const grouped: Record<string, any> = {};
    
    bookings.forEach(booking => {
      const phone = booking.phone?.trim();
      if (!phone) return;
      
      if (!grouped[phone]) {
        grouped[phone] = {
          phone,
          name: booking.patientName, // Take the most recent name
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          bookings: [],
          lastBookingDate: booking.createdAt,
        };
      }
      
      grouped[phone].bookings.push(booking);
      grouped[phone].totalBookings += 1;
      
      if (booking.status === 'confirmed') grouped[phone].completedBookings += 1;
      if (booking.status === 'cancelled') grouped[phone].cancelledBookings += 1;
      
      // Update last booking date if this one is newer
      if (new Date(booking.createdAt) > new Date(grouped[phone].lastBookingDate)) {
        grouped[phone].lastBookingDate = booking.createdAt;
        grouped[phone].name = booking.patientName; // Update name to latest
      }
    });
    
    // Sort bookings for each patient by date descending
    Object.values(grouped).forEach(patient => {
      patient.bookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    
    return Object.values(grouped).sort((a: any, b: any) => new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime());
  }, [bookings]);

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm);
    let matchFilter = true;
    if (patientFilter === 'has_unpaid') {
      matchFilter = p.bookings.some((b: any) => b.paymentStatus !== 'paid');
    } else if (patientFilter === 'has_pending') {
      matchFilter = p.bookings.some((b: any) => b.status === 'pending');
    }
    return matchSearch && matchFilter;
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">ملفات المرضى</h3>
            <p className="text-gray-500 mt-1">إدارة سجلات المرضى وتاريخ حجوزاتهم</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 text-right text-sm font-bold text-gray-700"
            >
              <option value="all">كل المرضى</option>
              <option value="has_unpaid">عليهم مدفوعات متأخرة</option>
              <option value="has_pending">لديهم حجوزات غير مؤكدة</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="بحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
              <Users className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gray-100">
        {/* Patients List */}
        <div className="lg:col-span-1 h-[600px] overflow-y-auto bg-gray-50/50">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              لا يوجد مرضى مطابقين للبحث
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPatients.map((patient: any) => (
                <button
                  key={patient.phone}
                  onClick={() => setSelectedPatient(patient.phone)}
                  className={`w-full text-right p-6 transition-colors hover:bg-blue-50/50 ${
                    selectedPatient === patient.phone ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-lg">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{patient.name}</h4>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1" dir="ltr">
                        <Phone className="w-3 h-3" />
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
                    <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs">
                      {patient.totalBookings} حجوزات
                    </span>
                    {patient.bookings.some((b: any) => b.paymentStatus !== 'paid') && (
                      <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-100">
                        غير مدفوع
                      </span>
                    )}
                    {patient.bookings.some((b: any) => b.status === 'pending') && (
                      <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-xs font-bold border border-amber-100">
                        غير مؤكد
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs mt-2 text-right">
                    آخر حجز: {new Date(patient.lastBookingDate).toLocaleDateString('ar-EG')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2 h-[600px] overflow-y-auto bg-white p-6 sm:p-8">
          {!selectedPatient ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p>اختر مريضاً لعرض ملفه وتاريخ حجوزاته</p>
            </div>
          ) : (
            (() => {
              const patient = patients.find(p => p.phone === selectedPatient);
              if (!patient) return null;

              return (
                <div className="animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-200">
                      <span className="text-white font-bold text-3xl">
                        {patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{patient.name}</h2>
                      <div className="flex items-center gap-2 text-gray-600" dir="ltr">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium text-lg">{patient.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{patient.totalBookings}</div>
                      <div className="text-sm text-gray-500">إجمالي الحجوزات</div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">{patient.completedBookings}</div>
                      <div className="text-sm text-green-600">مؤكدة</div>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-4 text-center">
                      <div className="text-3xl font-bold text-red-700 mb-1">{patient.cancelledBookings}</div>
                      <div className="text-sm text-red-600">ملغاة</div>
                    </div>
                  </div>

                  {/* Booking History */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        سجل الحجوزات
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-right"
                        >
                          <option value="all">كل الحالات</option>
                          <option value="confirmed">مؤكد</option>
                          <option value="pending">قيد الانتظار</option>
                          <option value="completed">مكتمل</option>
                          <option value="cancelled">ملغي</option>
                        </select>

                        <select
                          value={filterPayment}
                          onChange={(e) => setFilterPayment(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-right"
                        >
                          <option value="all">حالة الدفع (الكل)</option>
                          <option value="paid">تم الدفع</option>
                          <option value="unpaid">لم يتم الدفع</option>
                        </select>

                        <select
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-right"
                        >
                          <option value="all">المكان (الكل)</option>
                          <option value="online">أونلاين</option>
                          <option value="new-cairo">التجمع</option>
                          <option value="madinaty">مدينتي</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {patient.bookings
                        .filter((b: any) => {
                          const matchStatus = filterStatus === 'all' || b.status === filterStatus;
                          const matchPayment = filterPayment === 'all' || (filterPayment === 'paid' ? b.paymentStatus === 'paid' : b.paymentStatus !== 'paid');
                          const matchLocation = filterLocation === 'all' || (filterLocation === 'online' ? b.sessionType === 'online' : b.location === filterLocation);
                          return matchStatus && matchPayment && matchLocation;
                        })
                        .map((booking: any) => (
                        <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${
                                booking.sessionType === 'online' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                {booking.sessionType === 'online' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">
                                  {booking.sessionType === 'online' ? 'جلسة أونلاين' : 'جلسة بالمركز'}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {booking.country === 'egypt' ? 'مصر' : 'قطر'} {booking.location ? `- ${booking.location}` : ''}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {onStatusChange ? (
                                <select
                                  value={booking.status}
                                  onChange={(e) => onStatusChange(booking.id, e.target.value)}
                                  className={`text-xs font-bold rounded-lg px-2 py-1.5 border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${statusConfig[booking.status]?.className || 'bg-gray-100 text-gray-700'}`}
                                >
                                  <option value="confirmed">مؤكد</option>
                                  <option value="pending">قيد الانتظار</option>
                                  <option value="completed">مكتمل</option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                              ) : (
                                <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 w-fit ${statusConfig[booking.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                                  {booking.status === 'confirmed' && <CheckCircle className="w-4 h-4" />}
                                  {booking.status === 'cancelled' && <XCircle className="w-4 h-4" />}
                                  {booking.status === 'pending' && <Clock className="w-4 h-4" />}
                                  {statusConfig[booking.status]?.label || booking.status}
                                </div>
                              )}

                              {onPaymentStatusChange && (
                                <select
                                  value={booking.paymentStatus || 'unpaid'}
                                  onChange={(e) => onPaymentStatusChange(booking.id, e.target.value as 'paid' | 'unpaid')}
                                  className={`text-xs font-bold rounded-lg px-2 py-1.5 border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${paymentStatusConfig[booking.paymentStatus || 'unpaid']?.className || 'bg-gray-100 text-gray-700'}`}
                                >
                                  <option value="paid">تم الدفع ✓</option>
                                  <option value="unpaid">لم يتم الدفع ✕</option>
                                </select>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {booking.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
