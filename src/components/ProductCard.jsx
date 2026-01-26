import { useState, useEffect } from 'react';

export default function ProductCard({ product, quantity, onAddToCart, onUpdateCart }) {
  const [localQuantity, setLocalQuantity] = useState(quantity.toString());
  const [isEditing, setIsEditing] = useState(false);

  // quantity o'zgarganda localQuantity ni yangilash (faqat foydalanuvchi yozmayotganda)
  useEffect(() => {
    if (!isEditing) {
      setLocalQuantity(quantity.toString());
    }
  }, [quantity, isEditing]);

  const handleDecrease = () => {
    setIsEditing(false);
    if (quantity <= 0) return;
    if (quantity === 1) {
      onUpdateCart(product.id, 0);
    } else {
      onUpdateCart(product.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    setIsEditing(false);
    if (quantity <= 0) {
      onAddToCart(product, 1);
    } else {
      onUpdateCart(product.id, quantity + 1);
    }
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;
    setIsEditing(true);
    // Har qanday kiritilgan qiymatni local state'ga saqlash
    setLocalQuantity(inputValue);
    
    // Faqat to'liq raqam bo'lsa, cart'ni yangilash
    if (inputValue === '' || inputValue === '-') {
      return; // Foydalanuvchi yozishni davom ettirishi uchun
    }
    
    const value = parseInt(inputValue, 10);
    if (!Number.isNaN(value) && value > 0) {
      onUpdateCart(product.id, value);
    }
  };

  const handleQuantityBlur = (e) => {
    setIsEditing(false);
    const inputValue = e.target.value.trim();
    if (inputValue === '' || inputValue === '0') {
      onUpdateCart(product.id, 0);
      setLocalQuantity('0');
    } else {
      const value = parseInt(inputValue, 10);
      if (Number.isNaN(value) || value <= 0) {
        onUpdateCart(product.id, 0);
        setLocalQuantity('0');
      } else {
        onUpdateCart(product.id, value);
        setLocalQuantity(value.toString());
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="relative h-24 w-full overflow-hidden rounded-t-xl bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
            Rasm yo'q
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="mb-1 text-sm font-bold leading-tight text-slate-900">
          {product.name}
        </h3>
        <p className="mb-1.5 text-xs text-slate-500">Kod: {product.id}</p>
        <p className="mb-2 text-base font-bold text-blue-600">
          {Number(product.price).toLocaleString()} SUM
        </p>

        {/* Holat 1: hali savatda emas – ko'k "Savatga" tugmasi */}
        {quantity <= 0 ? (
          <button
            type="button"
            onClick={() => onAddToCart(product, 1)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-500 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Savatga
          </button>
        ) : (
          /* Holat 2: savatda bor – stepper + input */
          <div className="mt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              aria-label="Kamaytirish"
            >
              <span className="text-lg leading-none">−</span>
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={localQuantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              className="h-9 w-16 rounded-lg border-2 border-blue-500 bg-white px-2 text-center text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="button"
              onClick={handleIncrease}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm hover:bg-blue-600"
              aria-label="Oshirish"
            >
              <span className="text-lg leading-none">+</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
