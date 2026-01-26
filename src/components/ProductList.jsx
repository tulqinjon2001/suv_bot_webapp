import { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, categories, onAddToCart, cart, onUpdateCart, cartCount, onCartClick }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Kategoriyalarni asosiy va sub kategoriyalarga ajratish
  const mainCategories = categories.filter((cat) => !cat.parent_id);
  const subCategories = categories.filter((cat) => cat.parent_id);

  const getSubCategories = (parentId) => {
    return subCategories.filter((cat) => cat.parent_id === parentId);
  };

  // Asosiy kategoriya tanlansa, uning barcha sub kategoriyalarini topish
  const getCategoryIds = (categoryId) => {
    if (!categoryId) return null;
    
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return [categoryId];
    
    // Agar asosiy kategoriya bo'lsa (parent_id === null)
    if (!category.parent_id) {
      const subCats = getSubCategories(categoryId);
      return [categoryId, ...subCats.map((cat) => cat.id)];
    }
    
    // Agar sub kategoriya bo'lsa
    return [categoryId];
  };

  const filteredProducts = (() => {
    let filtered = products;
    
    if (selectedCategory) {
      const categoryIds = getCategoryIds(selectedCategory);
      filtered = products.filter((p) => categoryIds.includes(p.category_id));
    }
    
    return filtered.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('sut') || name.includes('mahsulot')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }
    if (name.includes('shirinlik')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
    if (name.includes('ichimlik')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="pb-4">
      {/* Categories Drawer */}
      {showCategories && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={() => setShowCategories(false)}
          />
          <div className="fixed left-0 top-0 z-40 h-full w-2/3 max-w-xs bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-lg font-bold text-slate-900">Kategoriyalar</h2>
              <button
                onClick={() => setShowCategories(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <button
                onClick={() => handleCategorySelect(null)}
                className={`mb-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${
                  selectedCategory === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">Barchasi</span>
              </button>
              
              {mainCategories.map((mainCat) => {
                const subs = getSubCategories(mainCat.id);
                const icon = getCategoryIcon(mainCat.name);
                return (
                  <div key={mainCat.id} className="mb-2">
                    <button
                      onClick={() => handleCategorySelect(mainCat.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${
                        selectedCategory === mainCat.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {icon}
                      <span className="font-bold">{mainCat.name}</span>
                    </button>
                    {subs.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {subs.map((subCat) => (
                          <button
                            key={subCat.id}
                            onClick={() => handleCategorySelect(subCat.id)}
                            className={`flex w-full items-center rounded-lg px-4 py-2 text-left text-sm ${
                              selectedCategory === subCat.id
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{subCat.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCategories(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mahsulotlarni qidirish.."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={onCartClick}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center text-slate-700"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Filter/Sort Bar */}
      <div className="mx-4 mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
        <button
          onClick={() => setShowSort(!showSort)}
          className="flex items-center gap-1.5 text-sm text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>Tartiblash</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-medium text-white">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{filteredProducts.length} ta</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const cartItem = cart?.find?.((item) => item.product_id === product.id);
          const quantity = cartItem ? cartItem.quantity : 0;

          return (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantity}
              onAddToCart={onAddToCart}
              onUpdateCart={onUpdateCart}
            />
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center text-slate-500">
          Mahsulotlar topilmadi
        </div>
      )}
    </div>
  );
}
