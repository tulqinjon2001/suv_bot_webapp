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

export default function OrderDetail({ orderId, onBack }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const base = getApiBase();
      const response = await fetch(`${base}/webapp/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Buyurtma topilmadi");
      }
      const data = await response.json();
      setOrder(data);
      setError("");
    } catch (err) {
      setError(err.message || "Buyurtmani yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Yuklanmoqda…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-lg font-bold text-slate-900">
              Buyurtma
            </h2>
          </div>
        </header>
        <div className="px-4 pt-12 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={onBack}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.new;

  return (
    <div>
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="flex-1 text-lg font-bold text-slate-900">
            Buyurtma #{order.id}
          </h2>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-4 pb-24">
        {/* Status */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Holat</h3>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        {/* Manzil */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            Yetkazib berish manzili
          </h3>
          <p className="text-slate-900">{order.address}</p>
          {order.location_lat && order.location_long && (
            <p className="mt-1 text-xs text-slate-500">
              📍 {Number(order.location_lat).toFixed(6)},{" "}
              {Number(order.location_long).toFixed(6)}
            </p>
          )}
        </div>

        {/* Mahsulotlar */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">
            Mahsulotlar
          </h3>
          <div className="space-y-2">
            {order.OrderItems &&
              order.OrderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {item.Product?.name || "Mahsulot"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.quantity} x{" "}
                      {Number(item.price_at_purchase).toLocaleString()} so'm
                    </p>
                  </div>
                  <p className="font-medium text-blue-600">
                    {(
                      item.quantity * Number(item.price_at_purchase)
                    ).toLocaleString()}{" "}
                    so'm
                  </p>
                </div>
              ))}
          </div>
        </div>

        {/* Jami */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-slate-700">Jami:</span>
            <span className="text-xl font-bold text-blue-600">
              {Number(order.total_amount).toLocaleString()} so'm
            </span>
          </div>
          {order.paid_amount > 0 && (
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-600">To'landi:</span>
              <span className="font-medium text-green-600">
                {Number(order.paid_amount).toLocaleString()} so'm
              </span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-sm text-slate-600">To'lov turi:</span>
            <span className="text-sm font-medium text-slate-900">
              {order.payment_type === "rahmat" ? "Rahmat (Online)" : "Naqd"}
            </span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-lg bg-blue-500 py-3 text-lg font-medium text-white hover:bg-blue-600"
        >
          Orqaga
        </button>
      </div>
    </div>
  );
}
