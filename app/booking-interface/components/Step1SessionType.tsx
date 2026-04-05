import React from 'react';
import { Globe, MapPin, Video, Building, Stethoscope } from 'lucide-react';
import { Country, SessionType, Location } from '../types';

interface Props {
  country: Country;
  setCountry: (c: Country) => void;
  sessionType: SessionType;
  setSessionType: (s: SessionType) => void;
  location: Location;
  setLocation: (l: Location) => void;
  onNext: () => void;
  settings: any;
}

export default function Step1SessionType({
  country, setCountry, sessionType, setSessionType, location, setLocation, onNext, settings
}: Props) {
  const isNextDisabled = !country || !sessionType || (sessionType === 'in-center' && !location);

  const countries = settings.countries;
  const sessionTypes = country ? settings.sessionTypes.filter((s: any) => s.availableIn.includes(country)) : [];
  const branches = country ? settings.branches.filter((b: any) => b.countryId === country) : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {countries.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            اختر الدولة
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {countries.map((c: any) => (
              <button
                key={c.id}
                disabled={!c.isActive}
                onClick={() => { setCountry(c.id as Country); setSessionType(''); setLocation(''); }}
                className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                  !c.isActive 
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                    : country === c.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="text-2xl mb-2 block">{c.flag}</span>
                <span className="font-bold">{c.name}</span>
                {!c.isActive && (
                  <div className="absolute inset-x-0 bottom-0 bg-gray-200 text-gray-600 text-xs py-1 font-bold">
                    غير متاح حالياً
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {country && sessionTypes.length > 0 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            نوع الجلسة
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {sessionTypes.map((s: any) => (
              <button
                key={s.id}
                disabled={!s.isActive}
                onClick={() => { setSessionType(s.id as SessionType); setLocation(''); }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center relative overflow-hidden ${
                  !s.isActive 
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                    : sessionType === s.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {s.id === 'online' ? <Video className="w-8 h-8 mb-2" /> : (s.id === 'in-center' ? <Building className="w-8 h-8 mb-2" /> : <Stethoscope className="w-8 h-8 mb-2" />)}
                <span className="font-bold mb-1">{s.name}</span>
                {!s.isActive && (
                  <div className="absolute inset-x-0 bottom-0 bg-gray-200 text-gray-600 text-xs py-1 font-bold w-full text-center">
                    غير متاح حالياً
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {sessionType === 'in-center' && branches.length > 0 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            اختر الفرع
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {branches.map((b: any) => (
              <button
                key={b.id}
                disabled={!b.isActive}
                onClick={() => setLocation(b.id as Location)}
                className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${branches.length === 1 ? 'col-span-2' : ''} ${
                  !b.isActive 
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
                    : location === b.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="font-bold mb-1 block">{b.name}</span>
                {!b.isActive && (
                  <div className="absolute inset-x-0 bottom-0 bg-gray-200 text-gray-600 text-xs py-1 font-bold w-full text-center">
                    غير متاح حالياً
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={isNextDisabled}
        className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
      >
        التالي
      </button>
    </div>
  );
}
