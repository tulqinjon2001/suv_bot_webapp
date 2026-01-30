import { useState, useEffect } from 'react';
import { api } from '../api/client';

const PROFILE_STORAGE_KEY = 'suv_bot_profile';

function getProfileData() {
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

export default function Cart({ cart, onUpdate, onRemove, onBack, onSuccess, total, onNavigateToProfile, customerId }) {
  const [profileData, setProfileData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState('cash');

  useEffect(() => {
    // Profil ma'lumotlarini yuklash
    const data = getProfileData();
    setProfileData(data);
  }, []);

  if (cart.length === 0) {
    return (
      <div>
        <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-lg font-bold text-slate-900">Savat</h2>
          </div>
        </header>
        <div className="px-4 pt-12 text-center text-slate-500">
          <p className="mb-4">Savat bo'sh</p>
          <button
            onClick={onBack}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Mahsulotlar sahifasiga qaytish
          </button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    // Profil to'ldirilganligini tekshirish
    if (!profileData || !profileData.full_name || !profileData.phone || !profileData.address) {
      alert('Iltimos, avval profil ma\'lumotlaringizni to\'ldiring!');
      if (onNavigateToProfile) {
        onNavigateToProfile();
      }
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Telegram Web App-dan telegram_id olish (agar mavjud bo'lsa)
      let telegramId = null;
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
      }

      // Backend telefon raqam orqali mijozni topadi yoki yaratadi
      const response = await api.orders.create({
        phone: profileData.phone,
        full_name: profileData.full_name,
        telegram_id: telegramId,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product.price, // Narxni ham yuboramiz
        })),
        address: profileData.address,
        location_lat: profileData.location?.lat || null,
        location_long: profileData.location?.long || null,
        payment_type: paymentType,
      });

      // Buyurtma muvaffaqiyatli yaratildi
      onSuccess(response);
    } catch (e) {
      setError(e.message || 'Buyurtma yuborishda xatolik');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-bold text-slate-900">Savat</h2>
        </div>
      </header>
      <div className="px-4 pt-4">

      <div className="space-y-3">
        {cart.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                  —
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">{item.product.name}</h3>
              <p className="text-sm text-blue-600 font-medium">
                {Number(item.product.price).toLocaleString()} so'm
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate(item.product_id, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdate(item.product_id, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                +
              </button>
            </div>
            <button
              onClick={() => onRemove(item.product_id)}
              className="ml-2 text-red-600 hover:text-red-700"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Profil ma'lumotlari */}
      {profileData && profileData.full_name && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Yetkazib berish ma'lumotlari</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="font-medium">Ism:</span> {profileData.full_name}</p>
            <p><span className="font-medium">Telefon:</span> {profileData.phone}</p>
            <p><span className="font-medium">Manzil:</span> {profileData.address}</p>
            {profileData.location && (
              <p><span className="font-medium">Lokatsiya:</span> 📍 {profileData.location.lat.toFixed(6)}, {profileData.location.long.toFixed(6)}</p>
            )}
          </div>
          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Ma'lumotlarni tahrirlash
            </button>
          )}
        </div>
      )}

      {!profileData || !profileData.full_name && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-medium text-amber-900">
            ⚠️ Profil ma'lumotlarini to'ldiring
          </p>
          <p className="mb-3 text-xs text-amber-700">
            Buyurtma berish uchun avval profil ma'lumotlaringizni to'ldiring.
          </p>
          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Profilga o'tish
            </button>
          )}
        </div>
      )}

      {/* To'lov turi */}
      <div className="mt-6">
        <h3 className="mb-3 text-base font-semibold text-slate-900 px-1">To'lov turi</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentType('cash')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              paymentType === 'cash'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <svg className={`h-8 w-8 ${paymentType === 'cash' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className={`text-sm font-medium ${paymentType === 'cash' ? 'text-blue-600' : 'text-slate-700'}`}>
              Naqd
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentType('rahmat')}
            className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              paymentType === 'rahmat'
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <svg className={`h-8 w-8 ${paymentType === 'rahmat' ? 'text-blue-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className={`text-sm font-medium ${paymentType === 'rahmat' ? 'text-blue-600' : 'text-slate-700'}`}>
              Rahmat
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 mt-6 border-t border-slate-200 bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-700">Jami:</span>
          <span className="text-xl font-bold text-blue-600">
            {total.toLocaleString()} so'm
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={submitting}
          className="w-full rounded-lg bg-blue-500 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? 'Yuborilmoqda…' : 'Buyurtma berish'}
        </button>
      </div>
      </div>
    </div>
  );
}
