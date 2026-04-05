import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { format, addDays, startOfToday, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, isBefore } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Country, SessionType, Location } from '../types';

interface Props {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedTime: string;
  setSelectedTime: (t: string) => void;
  country: Country;
  sessionType: SessionType;
  location: Location;
  patientPhone?: string;
  onNext: () => void;
  onBack: () => void;
}

const ALL_SLOTS = [
  '08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', 
  '12:00 م', '01:00 م', '02:00 م', '03:00 م', 
  '04:00 م', '05:00 م', '06:00 م', '07:00 م'
];

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

export default function Step2DateTime({
  selectedDate, setSelectedDate, selectedTime, setSelectedTime, country, sessionType, location, patientPhone, onNext, onBack
}: Props) {
  const [schedule, setSchedule] = useState<any>({ egyptCenter: {}, qatarCenter: {}, online: {} });
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(startOfToday()));

  useEffect(() => {
    Promise.all([
      fetch('/api/schedule').then(res => res.json()),
      fetch('/api/bookings').then(res => res.json())
    ]).then(([scheduleData, bookingsData]) => {
      setSchedule(scheduleData.schedule || { egyptCenter: {}, qatarCenter: {}, online: {} });
      setBookings(bookingsData.bookings || []);
      setLoading(false);
    });
  }, []);

  const today = startOfToday();
  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDayOfWeek = (getDay(startOfMonth(currentMonth)) + 1) % 7; // Adjust for Saturday start
  const blanks = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  const isTimePast = (date: Date, timeStr: string) => {
    const now = new Date();
    if (!isSameDay(date, now)) return false;
    
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'م' && hours !== 12) hours += 12;
    if (period === 'ص' && hours === 12) hours = 0;
    
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    
    return isBefore(slotDate, now);
  };

  const getSlotStatus = (date: Date, slot: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (isTimePast(date, slot)) return 'unavailable';
    
    // Default to holiday (active: false, slots: [])
    let isActive = false;
    let availableSlots: string[] = [];
    
    // Determine the correct schedule key
    let typeKey = sessionType === 'in-center' ? `in-center_${country}_${location}` : sessionType;
    
    // Fallback for old data structure if needed
    if (!schedule[typeKey]) {
      if (sessionType === 'online' && schedule['online']) typeKey = 'online';
      else if (sessionType === 'in-center' && country === 'egypt' && schedule['egyptCenter']) typeKey = 'egyptCenter';
      else if (sessionType === 'in-center' && country === 'qatar' && schedule['qatarCenter']) typeKey = 'qatarCenter';
      else if (sessionType === 'in-center') typeKey = `in-center_${country}`; // fallback to country level if branch level doesn't exist
    }

    const override = schedule[typeKey]?.[dateString];
    
    if (override) {
      isActive = override.active;
      availableSlots = override.slots;
    } else if (typeKey === 'online') {
      // Default online schedule: active all days except Thursday (4) and Friday (5)
      const dayOfWeek = getDay(date);
      if (dayOfWeek !== 4 && dayOfWeek !== 5) {
        isActive = true;
        availableSlots = [...ALL_SLOTS];
      }
    }
    
    if (!isActive || !availableSlots.includes(slot)) return 'unavailable';
    
    const booking = bookings.find(b => 
      b.date === dateString && 
      b.time === slot && 
      b.status !== 'cancelled' &&
      b.sessionType === sessionType &&
      (sessionType === 'online' || (b.country === country && (sessionType !== 'in-center' || b.location === location)))
    );
    
    if (booking) {
      if (patientPhone && booking.phone === patientPhone) {
        return 'booked_by_you';
      }
      return 'booked';
    }
    
    return 'available';
  };

  const hasAnyAvailableSlots = (date: Date) => {
    return ALL_SLOTS.some(slot => getSlotStatus(date, slot) === 'available');
  };

  const isNextDisabled = !selectedDate || !selectedTime;

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prevMonth), today)) {
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">جاري تحميل المواعيد المتاحة...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              1. اختر اليوم
            </h2>
            
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={handlePrevMonth} 
                  disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
                  className="p-2 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-bold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                </h3>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'].map(day => (
                  <div key={day} className="text-center text-sm font-bold text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {blanks.map(blank => (
                  <div key={`blank-${blank}`} className="aspect-square"></div>
                ))}
                {monthDays.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateStr;
                  const isPast = isBefore(date, today);
                  const hasSlots = !isPast && hasAnyAvailableSlots(date);
                  const isToday = isSameDay(date, today);

                  return (
                    <button
                      key={dateStr}
                      disabled={isPast || !hasSlots}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedTime('');
                      }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                          : isPast 
                            ? 'text-gray-300 cursor-not-allowed'
                            : hasSlots
                              ? 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                              : 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                      } ${isToday && !isSelected ? 'border-2 border-blue-600 text-blue-600' : ''}`}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedDate && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                2. اختر الوقت
              </h2>
              
              {country === 'qatar' && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100 flex items-start gap-3">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    المواعيد المعروضة بتوقيت قطر (متقدمة ساعة عن توقيت مصر).
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {ALL_SLOTS.map((time: string) => {
                  const status = getSlotStatus(parseISO(selectedDate), time);
                  const isSelected = selectedTime === time;
                  const isDisabled = status !== 'available';
                  const displayTime = country === 'qatar' ? qatarTimeMap[time] : time;
                  
                  let buttonClass = '';
                  let label = displayTime;
                  
                  if (status === 'booked_by_you') {
                    buttonClass = 'border-blue-200 bg-blue-50 text-blue-600 cursor-not-allowed opacity-80';
                    label = 'تم حجزها لك';
                  } else if (isSelected) {
                    buttonClass = 'border-blue-600 bg-blue-600 text-white shadow-md';
                  } else if (isDisabled) {
                    buttonClass = 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60';
                  } else {
                    buttonClass = 'border-gray-100 bg-white hover:border-blue-200 hover:text-blue-600';
                  }

                  return (
                    <button
                      key={time}
                      disabled={isDisabled}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl border-2 font-bold text-lg transition-all duration-200 ${buttonClass}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              
              {!hasAnyAvailableSlots(parseISO(selectedDate)) && (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-500 font-medium">عذراً، لا توجد مواعيد متاحة في هذا اليوم.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="pt-8 flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
        >
          رجوع
        </button>
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
