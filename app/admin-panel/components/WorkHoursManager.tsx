import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, CalendarOff, CalendarCheck, Building, Video, ChevronRight, ChevronLeft, MapPin, Stethoscope } from 'lucide-react';
import { startOfWeek, addWeeks, subWeeks, format, addDays, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  schedule: any;
  bookings?: any[];
  onUpdate: (s: any) => void;
}

const ALL_SLOTS = [
  '08:00 ص', '09:00 ص', '10:00 ص', '11:00 ص', 
  '12:00 م', '01:00 م', '02:00 م', '03:00 م', 
  '04:00 م', '05:00 م', '06:00 م', '07:00 م'
];

export default function WorkHoursManager({ schedule, bookings = [], onUpdate }: Props) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 6 }));
  const [scheduleData, setScheduleData] = useState<any>({});
  const [scheduleType, setScheduleType] = useState<string>('in-center_egypt');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data.settings);
        if (data.settings?.sessionTypes?.length > 0) {
          // Set default tab
          const firstSession = data.settings.sessionTypes[0];
          if (firstSession.id === 'in-center' && firstSession.availableIn.includes('egypt')) {
            const firstBranch = data.settings.branches?.find((b: any) => b.countryId === 'egypt');
            if (firstBranch) {
              setScheduleType(`in-center_egypt_${firstBranch.id}`);
            } else {
              setScheduleType('in-center_egypt');
            }
          } else {
            setScheduleType(firstSession.id);
          }
        }
      });
  }, []);

  useEffect(() => {
    if (schedule) {
      setScheduleData(schedule);
    }
  }, [schedule]);

  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const getDayData = (date: Date, type: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    if (scheduleData[type]?.[dateString]) {
      return scheduleData[type][dateString];
    }
    
    // Default to holiday for everything except the old defaults if they existed
    let active = false;
    let slots: string[] = [];
    
    // Default online schedule: active all days except Thursday (4) and Friday (5)
    if (type === 'online') {
      const dayOfWeek = getDay(date);
      if (dayOfWeek !== 4 && dayOfWeek !== 5) {
        active = true;
        slots = [...ALL_SLOTS];
      }
    }
    
    return { active, slots };
  };

  const isSlotBooked = (dateString: string, slot: string) => {
    if (!bookings) return false;
    
    let sessionType = scheduleType;
    let country = '';
    let location = '';
    
    if (scheduleType.startsWith('in-center_')) {
      const parts = scheduleType.split('_');
      sessionType = parts[0]; // 'in-center'
      country = parts[1];
      location = parts[2] || '';
    }

    return bookings.some((b: any) => {
      const isSameDate = b.date === dateString;
      const isSameTime = b.time?.trim() === slot.trim();
      const isNotCancelled = b.status !== 'cancelled';
      const isSameSession = b.sessionType === sessionType;
      
      let isSameLocation = true;
      if (sessionType === 'in-center') {
        isSameLocation = b.country === country && (!location || !b.location || b.location === location);
      }
      
      return isSameDate && isSameTime && isNotCancelled && isSameSession && isSameLocation;
    });
  };

  const toggleDay = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const currentData = getDayData(date, scheduleType);
    
    if (currentData.active) {
      const hasBookings = ALL_SLOTS.some((slot: string) => isSlotBooked(dateString, slot));
      if (hasBookings) {
        toast.error('لا يمكن تعيين اليوم كعطلة لوجود حجوزات مسبقة في هذا اليوم');
        return;
      }
    }
    
    const newData = {
      ...scheduleData,
      [scheduleType]: {
        ...(scheduleData[scheduleType] || {}),
        [dateString]: {
          ...currentData,
          active: !currentData.active,
          slots: !currentData.active ? [...ALL_SLOTS] : [] // Auto-fill slots when activating, or keep empty
        }
      }
    };
    setScheduleData(newData);
  };

  const toggleSlot = (date: Date, slot: string) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const currentData = getDayData(date, scheduleType);
    
    let newSlots = [...currentData.slots];
    if (newSlots.includes(slot)) {
      if (isSlotBooked(dateString, slot)) {
        toast.error('لا يمكن إلغاء هذا الموعد لوجود حجز مسبق');
        return;
      }
      newSlots = newSlots.filter(s => s !== slot);
    } else {
      newSlots.push(slot);
      newSlots.sort((a, b) => ALL_SLOTS.indexOf(a) - ALL_SLOTS.indexOf(b));
    }
    
    let newData = {
      ...scheduleData,
      [scheduleType]: {
        ...(scheduleData[scheduleType] || {}),
        [dateString]: {
          ...currentData,
          slots: newSlots
        }
      }
    };

    setScheduleData(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
      const data = await res.json();
      onUpdate(data.schedule);
      toast.success('تم حفظ المواعيد بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const handleNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));

  if (!settings) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">إدارة ساعات العمل</h2>
          <p className="text-gray-500 mt-2 text-sm">قم بتحديد الأيام المتاحة للحجز واختر المواعيد بالضغط عليها.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? 'جاري الحفظ...' : (
            <>
              <Save className="w-5 h-5" />
              حفظ التغييرات
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap gap-3">
          {settings.sessionTypes.map((session: any) => {
            if (session.id === 'in-center') {
              return (
                <div key={session.id} className="w-full flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="font-bold text-gray-700 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {session.name}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {session.availableIn.map((countryId: string) => {
                      const country = settings.countries.find((c: any) => c.id === countryId);
                      const countryBranches = settings.branches?.filter((b: any) => b.countryId === countryId) || [];
                      
                      return (
                        <div key={countryId} className="w-full flex flex-col gap-2 mt-2">
                          <div className="text-sm font-bold text-gray-500">فروع {country?.name}</div>
                          <div className="flex flex-wrap gap-3">
                            {countryBranches.map((branch: any) => {
                              const tabKey = `in-center_${countryId}_${branch.id}`;
                              return (
                                <button
                                  key={tabKey}
                                  onClick={() => setScheduleType(tabKey)}
                                  className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                                    scheduleType === tabKey ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300'
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                  {branch.name}
                                </button>
                              );
                            })}
                            {countryBranches.length === 0 && (
                                <div className="text-sm text-gray-400 p-2">لا توجد فروع مضافة</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={session.id}
                onClick={() => setScheduleType(session.id)}
                className={`flex-1 min-w-[200px] py-4 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border-2 ${
                  scheduleType === session.id ? 'bg-purple-50 border-purple-600 text-purple-700' : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300'
                }`}
              >
                {session.id === 'online' ? <Video className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                {session.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
        <button onClick={handlePrevWeek} className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        <div className="text-lg font-bold text-gray-900">
          الأسبوع من {format(currentWeekStart, 'd MMMM yyyy', { locale: ar })}
        </div>
        <button onClick={handleNextWeek} className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {weekDates.map((date) => {
          const dayData = getDayData(date, scheduleType);
          const isPast = date < new Date(new Date().setHours(0,0,0,0));
          return (
            <div key={date.toISOString()} className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${dayData.active ? 'border-blue-100 bg-white shadow-sm hover:shadow-md' : 'border-gray-100 bg-gray-50/80'} ${isPast ? 'opacity-60 grayscale-[50%]' : ''}`}>
              <div className={`p-5 flex justify-between items-center border-b ${dayData.active ? 'bg-blue-50/50 border-blue-50' : 'bg-gray-100/50 border-gray-100'}`}>
                <h3 className="text-xl font-bold text-gray-900">
                  {format(date, 'EEEE', { locale: ar })} <span className="text-blue-600 ml-1">{format(date, 'd')}</span>
                </h3>
                <button
                  onClick={() => toggleDay(date)}
                  disabled={isPast}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    dayData.active 
                      ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  } ${isPast ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {dayData.active ? (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      يوم عمل
                    </>
                  ) : (
                    <>
                      <CalendarOff className="w-4 h-4" />
                      عطلة
                    </>
                  )}
                </button>
              </div>
              
              <div className="p-5">
                {dayData.active ? (
                  <div className="flex flex-wrap gap-2">
                    {ALL_SLOTS.map((slot: string) => {
                      const dateString = format(date, 'yyyy-MM-dd');
                      const isActive = dayData.slots.includes(slot);
                      const isBooked = isSlotBooked(dateString, slot);
                      return (
                        <button 
                          key={slot}
                          onClick={() => toggleSlot(date, slot)}
                          disabled={isPast}
                          title={isBooked ? "هذا الموعد محجوز مسبقاً" : ""}
                          className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                            isBooked
                              ? 'bg-gray-400 border-gray-400 text-white cursor-not-allowed opacity-90'
                              : isActive 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                : 'bg-white border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500'
                          } ${isPast ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                    <CalendarOff className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">هذا اليوم محدد كعطلة</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
