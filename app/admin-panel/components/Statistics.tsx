import React from 'react';
import { Users, Video, Building } from 'lucide-react';

interface Props {
  bookings: any[];
}

export default function Statistics({ bookings }: Props) {
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  
  const totalBookings = confirmedBookings.length;
  const onlineBookings = confirmedBookings.filter(b => b.sessionType === 'online').length;
  const inCenterBookings = confirmedBookings.filter(b => b.sessionType === 'in-center').length;

  const stats = [
    {
      label: 'إجمالي الحجوزات',
      value: totalBookings,
      icon: Users,
      colorClass: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'جلسات أونلاين',
      value: onlineBookings,
      icon: Video,
      colorClass: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'جلسات في المركز',
      value: inCenterBookings,
      icon: Building,
      colorClass: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.colorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900" dir="ltr">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
