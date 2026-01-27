import { useState, useEffect } from "react";
import { api } from "./api/client";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Profile from "./components/Profile";
import OrdersHistory from "./components/OrdersHistory";
import Help from "./components/Help";
import OrderDetail from "./components/OrderDetail";

const STEPS = {
  PRODUCTS: "products",
  CART: "cart",
  CHECKOUT: "checkout",
  PROFILE: "profile",
  ORDERS_HISTORY: "orders_history",
  HELP: "help",
  ORDER_DETAIL: "order_detail",
};

export default function App() {
  const [step, setStep] = useState(STEPS.PRODUCTS);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Set colors - only if supported in this Telegram version
      try {
        if (tg.setHeaderColor) {
          tg.setHeaderColor("#10b981");
        }
        if (tg.setBackgroundColor) {
          tg.setBackgroundColor("#f1f5f9");
        }
      } catch (e) {
        // Telegram version 6.0 va undan pastda qo'llab-quvvatlanmaydi - ignore
        console.debug("Telegram colors:", e.message);
      }

      const initData = tg.initDataUnsafe;
      if (initData?.user?.id) {
        const telegramId = initData.user.id;
        fetchCustomerId(telegramId);
      }
    }
    loadData();
  }, []);

  const fetchCustomerId = async (telegramId) => {
    try {
      const res = await fetch(`/api/webapp/user/${telegramId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerId(data.id);
      }
    } catch (err) {
      console.error("Customer ID topilmadi:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        api.products.list(),
        api.categories.list(),
      ]);
      setProducts(Array.isArray(prods) ? prods : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setError("");
    } catch (e) {
      setError(e.message);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, quantity = 1) => {
    const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
    if (qty <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }
      return [...prev, { product_id: product.id, product, quantity: qty }];
    });
  };

  const updateCartItem = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product_id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const getTotal = () => {
    return cart.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    );
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
          >
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      {step === STEPS.PRODUCTS && (
        <ProductList
          products={products}
          categories={categories}
          onAddToCart={addToCart}
          cart={cart}
          onUpdateCart={updateCartItem}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setStep(STEPS.CART)}
        />
      )}

      {step === STEPS.CART && (
        <Cart
          cart={cart}
          onUpdate={updateCartItem}
          onRemove={removeFromCart}
          onBack={() => setStep(STEPS.PRODUCTS)}
          onSuccess={(orderData) => {
            setCart([]);
            setCurrentOrderId(orderData.id);
            setStep(STEPS.ORDERS_HISTORY);
          }}
          onNavigateToProfile={() => setStep(STEPS.PROFILE)}
          customerId={customerId}
          total={getTotal()}
        />
      )}

      {step === STEPS.CHECKOUT && (
        <Checkout
          cart={cart}
          total={getTotal()}
          customerId={customerId}
          onBack={() => setStep(STEPS.CART)}
          onSuccess={() => {
            setCart([]);
            setStep(STEPS.PRODUCTS);
          }}
        />
      )}

      {step === STEPS.PROFILE && (
        <Profile
          customerId={customerId}
          onBack={() => setStep(STEPS.PRODUCTS)}
        />
      )}

      {step === STEPS.ORDERS_HISTORY && (
        <OrdersHistory
          customerId={customerId}
          onBack={() => setStep(STEPS.PRODUCTS)}
          onViewOrder={(orderId) => {
            setCurrentOrderId(orderId);
            setStep(STEPS.ORDER_DETAIL);
          }}
        />
      )}

      {step === STEPS.HELP && <Help onBack={() => setStep(STEPS.PRODUCTS)} />}

      {step === STEPS.ORDER_DETAIL && (
        <OrderDetail
          orderId={currentOrderId}
          onBack={() => setStep(STEPS.ORDERS_HISTORY)}
        />
      )}

      {(step === STEPS.PRODUCTS ||
        step === STEPS.CART ||
        step === STEPS.PROFILE ||
        step === STEPS.ORDERS_HISTORY ||
        step === STEPS.HELP) && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="mx-auto flex max-w-md items-center justify-around">
            <button
              onClick={() => setStep(STEPS.PRODUCTS)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                step === STEPS.PRODUCTS
                  ? "bg-amber-500 text-white"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </button>
            <button
              onClick={() => setStep(STEPS.HELP)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                step === STEPS.HELP
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => setStep(STEPS.ORDERS_HISTORY)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                step === STEPS.ORDERS_HISTORY
                  ? "bg-blue-500 text-white"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </button>
            <button
              onClick={() => setStep(STEPS.PROFILE)}
              className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                step === STEPS.PROFILE
                  ? "bg-purple-500 text-white"
                  : "bg-purple-50 text-purple-600"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
