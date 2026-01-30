import { useState, useEffect } from "react";
import { getApiBase } from "../api/client";

const STATUS_LABELS = {
  new: { label: "Yangi", color: "bg-blue-100 text-blue-800" },
  confirmed: { label: "Tasdiqlangan", color: "bg-green-100 text-green-800" },
  preparing: { label: "Yig'ilmoqda", color: "bg-yellow-100 text-yellow-800" },
  on_the_way: { label: "Yo'lda", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Yetkazildi", color: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Bekor qilindi", color: "bg-red-100 text-red-800" },
};

export default function OrdersHistory({ customerId, onBack, onViewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customerId) {
      loadOrders();
    } else {
      // Telefon raqam asosida customer topish
      loadOrdersByPhone();
    }
  }, [customerId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const base = getApiBase();
      const response = await fetch(
        `${base}/webapp/customer/${customerId}/orders`,
      );
      if (!response.ok) {
        throw new Error("Buyurtmalarni yuklashda xatolik");
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Buyurtmalarni yuklashda xatolik");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersByPhone = async () => {
    try {
      setLoading(true);
      const PROFILE_STORAGE_KEY = "suv_bot_profile";
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!saved) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const profile = JSON.parse(saved);
      if (!profile.phone) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Telefon raqam asosida customer ID topish
      const base = getApiBase();
      const userResponse = await fetch(
        `${base}/webapp/user/phone/${encodeURIComponent(profile.phone)}`,
      );
      if (!userResponse.ok) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const userData = await userResponse.json();

      // Customer ID asosida buyurtmalarni yuklash
      const ordersResponse = await fetch(
        `${base}/webapp/customer/${userData.id}/orders`,
      );
      if (!ordersResponse.ok) {
        throw new Error("Buyurtmalarni yuklashda xatolik");
      }
      const data = await ordersResponse.json();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Buyurtmalarni yuklashda xatolik");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-lg font-bold text-slate-900">
              Buyurtmalar tarixi
            </h2>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-500">Yuklanmoqda…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-bold text-slate-900">
            Buyurtmalar tarixi
          </h2>
        </div>
      </header>
      <div className="px-4 py-4 pb-24">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <p>Hozircha buyurtmalar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] || STATUS_LABELS.new;
              return (
                <div
                  key={order.id}
                  onClick={() => onViewOrder && onViewOrder(order.id)}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Buyurtma #{order.id}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-slate-600">
                    Mahsulotlar: {order.OrderItems?.length || 0} ta
                  </p>
                  <p className="mb-2 text-sm text-slate-500">
                    Manzil: {order.address}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-sm text-slate-600">Jami:</span>
                    <span className="font-bold text-blue-600">
                      {Number(order.total_amount).toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
