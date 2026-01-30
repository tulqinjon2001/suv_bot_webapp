import { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";
import { getApiBase } from "../api/client";

const PROFILE_STORAGE_KEY = "suv_bot_profile";

export default function Profile({ customerId, onBack }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Backend'dan ma'lumotlarni yuklash (agar customerId bo'lsa)
    if (customerId) {
      const base = getApiBase();
      fetch(`${base}/webapp/user/${customerId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
        })
        .catch((e) =>
          console.error("Backend'dan ma'lumot yuklashda xatolik:", e),
        );
    }

    // localStorage'dan ma'lumotlarni yuklash
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFullName((prev) => prev || data.full_name || "");
        setPhone((prev) => prev || data.phone || "");
        if (data.address) setAddress(data.address);
        if (data.location) {
          setLocation(data.location);
        }
      } catch (e) {
        console.error("Profil ma'lumotlarini yuklashda xatolik:", e);
      }
    }
  }, [customerId]);

  const requestLocation = () => {
    // LocationPicker komponentida modal ochiladi
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Ism kiritilishi shart");
      return;
    }
    if (!phone.trim()) {
      setError("Telefon raqami kiritilishi shart");
      return;
    }
    if (!address.trim()) {
      setError("Uy manzili kiritilishi shart");
      return;
    }

    setSaving(true);
    setError("");
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
          const base = getApiBase();
          const res = await fetch(`${base}/webapp/user/${customerId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              full_name: fullName.trim(),
              phone: phone.trim(),
            }),
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Backend'ga saqlashda xatolik");
          }
        } catch (e) {
          console.error("Backend'ga saqlashda xatolik:", e);
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
      setError("Ma'lumotlarni saqlashda xatolik");
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
          <LocationPicker
            onSelect={handleLocationSelect}
            initialLocation={location}
          />
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
          disabled={
            saving || !fullName.trim() || !phone.trim() || !address.trim()
          }
          className="w-full rounded-lg bg-blue-500 py-3 text-lg font-medium text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? "Saqlanmoqda…" : "Saqlash"}
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
    console.error("Profil ma'lumotlarini olishda xatolik:", e);
  }
  return null;
}
