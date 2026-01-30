import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import { getProfileData } from "./Profile";
import LocationPicker from "./LocationPicker";

export default function Checkout({
  cart,
  total,
  customerId,
  onBack,
  onSuccess,
}) {
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Profil ma'lumotlarini yuklash
    const profile = getProfileData();
    if (profile) {
      setProfileData(profile);
      if (profile.address) setAddress(profile.address);
      if (profile.location) setLocation(profile.location);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!address.trim()) {
      setError("Manzil kiritilishi shart");
      return;
    }

    if (!profileData || !profileData.phone) {
      setError("Telefon raqam talab qilinadi");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Telegram Web App-dan telegram_id olish (agar mavjud bo'lsa)
      let telegramId = null;
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
      }

      // Backend telefon raqam orqali mijozni topadi yoki yaratadi
      await api.orders.create({
        phone: profileData.phone,
        full_name: profileData.full_name || 'Mijoz',
        telegram_id: telegramId,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.product.price, // Narxni ham yuboramiz
        })),
        address: address.trim(),
        location_lat: location?.lat || null,
        location_long: location?.long || null,
        payment_type: paymentType,
      });

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.showAlert("Buyurtma muvaffaqiyatli yuborildi!");
      }

      onSuccess();
    } catch (e) {
      setError(e.message || "Buyurtma yuborishda xatolik");
    } finally {
      setSubmitting(false);
    }
  }, [profileData, address, location, paymentType, cart, onSuccess]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.MainButton.setText("Buyurtmani yuborish");
      tg.MainButton.show();
      tg.MainButton.onClick(handleSubmit);

      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(handleSubmit);
      };
    }
  }, [handleSubmit]);

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-bold text-slate-900">Buyurtma</h2>
        </div>
      </header>
      <div className="space-y-4 px-4 pt-4">
        {/* Profil ma'lumotlari */}
        {profileData && profileData.full_name && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-2 text-base font-semibold text-slate-900">
              Yetkazib berish ma'lumotlari
            </h3>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium">Ism:</span>{" "}
                {profileData.full_name}
              </p>
              <p>
                <span className="font-medium">Telefon:</span>{" "}
                {profileData.phone}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Manzil *
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Manzilni kiriting..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Lokatsiya (ixtiyoriy)
          </label>
          <LocationPicker
            onSelect={(loc) => setLocation(loc)}
            initialLocation={location}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            To'lov turi
          </label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-slate-600">Mahsulotlar:</span>
            <span className="font-medium">{cart.length} ta</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-lg font-semibold text-slate-700">Jami:</span>
            <span className="text-xl font-bold text-blue-600">
              {total.toLocaleString()} so'm
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !address.trim()}
          className="w-full rounded-lg bg-blue-500 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? "Yuborilmoqda…" : "Buyurtmani yuborish"}
        </button>
      </div>
    </div>
  );
}
