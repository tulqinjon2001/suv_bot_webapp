import { useState, useEffect } from 'react';

const PROFILE_STORAGE_KEY = 'suv_bot_profile';

export default function Profile({ customerId, onBack }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    // Backend'dan ma'lumotlarni yuklash (agar customerId bo'lsa)
    if (customerId) {
      fetch(`/api/webapp/user/${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
        })
        .catch((e) => console.error('Backend\'dan ma\'lumot yuklashda xatolik:', e));
    }

    // localStorage'dan ma'lumotlarni yuklash
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFullName((prev) => prev || data.full_name || '');
        setPhone((prev) => prev || data.phone || '');
        if (data.address) setAddress(data.address);
        if (data.location) {
          setLocation(data.location);
        }
      } catch (e) {
        console.error('Profil ma\'lumotlarini yuklashda xatolik:', e);
      }
    }
  }, [customerId]);

  const requestLocation = () => {
    setShowMapPicker(true);
  };

  const handleMapClick = (lat, lng) => {
    setLocation({ lat, long: lng });
    setShowMapPicker(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            long: pos.coords.longitude,
          });
        },
        () => {
          setError('Lokatsiya olishda xatolik');
        }
      );
    } else {
      setError('Lokatsiya qo\'llab-quvvatlanmaydi');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Ism kiritilishi shart');
      return;
    }
    if (!phone.trim()) {
      setError('Telefon raqami kiritilishi shart');
      return;
    }
    if (!address.trim()) {
      setError('Uy manzili kiritilishi shart');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const profileData = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        location: location,
      };

      // localStorage'ga saqlash
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));

      // Backend'ga yuborish (agar customerId bo'lsa)
      if (customerId) {
        try {
          const res = await fetch(`/api/webapp/user/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: fullName.trim(),
              phone: phone.trim(),
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Backend\'ga saqlashda xatolik');
          }
        } catch (e) {
          console.error('Backend\'ga saqlashda xatolik:', e);
          // localStorage'da saqlangan bo'lsa, xatolikni ko'rsatmaymiz
        }
      }

      setSuccess(true);
      // 1.5 soniyadan keyin mahsulotlar bo'limiga o'tish
      setTimeout(() => {
        setSuccess(false);
        if (onBack) {
          onBack();
        }
      }, 1500);
    } catch (e) {
      setError('Ma\'lumotlarni saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-bold text-slate-900">Profil</h2>
        </div>
      </header>
      <div className="space-y-4 px-4 pt-4 pb-24">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ism Familya *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ism familya"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefon raqami *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Uy manzili *
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Uy manzilini kiriting..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lokatsiya (ixtiyoriy)
          </label>
          {location ? (
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm">
              <p className="text-slate-600">
                📍 {location.lat.toFixed(6)}, {location.long.toFixed(6)}
              </p>
              <button
                onClick={() => setLocation(null)}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                O'chirish
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={requestLocation}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                🗺️ Xaritadan tanlash
              </button>
              <button
                onClick={getCurrentLocation}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                📍 Hozirgi joylashuv
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
            Ma'lumotlar muvaffaqiyatli saqlandi!
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !fullName.trim() || !phone.trim() || !address.trim()}
          className="w-full rounded-lg bg-blue-500 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saqlanmoqda…' : 'Saqlash'}
        </button>
      </div>

      {/* Yandex Xarita Modal */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMapPicker(false)}>
          <div className="relative h-[80vh] w-[90vw] max-w-2xl rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Lokatsiyani tanlang</h3>
              <button
                onClick={() => setShowMapPicker(false)}
                className="text-2xl text-slate-500 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-600">Xaritani bosib, lokatsiyani tanlang</p>
            <YandexMapPicker onLocationSelect={handleMapClick} currentLocation={location} />
          </div>
        </div>
      )}
    </div>
  );
}

// Yandex Map Picker komponenti
function YandexMapPicker({ onLocationSelect, currentLocation }) {
  const [selectedLat, setSelectedLat] = useState(currentLocation?.lat || 41.311081);
  const [selectedLng, setSelectedLng] = useState(currentLocation?.long || 69.240562);

  useEffect(() => {
    // Yandex Maps API'ni yuklash
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  const initMap = () => {
    window.ymaps.ready(() => {
      const map = new window.ymaps.Map('yandex-map', {
        center: [selectedLat, selectedLng],
        zoom: 15,
        controls: ['zoomControl', 'searchControl']
      });

      const placemark = new window.ymaps.Placemark([selectedLat, selectedLng], {}, {
        preset: 'islands#redDotIcon',
        draggable: true
      });

      placemark.events.add('dragend', function () {
        const coords = placemark.geometry.getCoordinates();
        setSelectedLat(coords[0]);
        setSelectedLng(coords[1]);
      });

      map.events.add('click', function (e) {
        const coords = e.get('coords');
        placemark.geometry.setCoordinates(coords);
        setSelectedLat(coords[0]);
        setSelectedLng(coords[1]);
      });

      map.geoObjects.add(placemark);
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div id="yandex-map" className="flex-1 rounded-lg" style={{ minHeight: '450px' }}></div>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-medium">Tanlangan lokatsiya:</p>
          <p className="text-xs text-slate-600 mt-1">
            Lat: {selectedLat.toFixed(6)}, Lng: {selectedLng.toFixed(6)}
          </p>
        </div>
        <button
          onClick={() => onLocationSelect(selectedLat, selectedLng)}
          className="w-full rounded-lg bg-blue-500 py-3 text-base font-semibold text-white hover:bg-blue-600 shadow-md"
        >
          ✓ Lokatsiyani tasdiqlash
        </button>
      </div>
    </div>
  );
}

export function getProfileData() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Profil ma\'lumotlarini olishda xatolik:', e);
  }
  return null;
}
