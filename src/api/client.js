// API base URL - development uchun proxy, production uchun Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const API = import.meta.env.PROD ? import.meta.env.VITE_API_URL : API_BASE_URL;

// Barcha fetch chaqiruvlari uchun (App, Profile, OrdersHistory va boshqalar)
export const getApiBase = () =>
  (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  products: {
    list: () => request("/webapp/products"),
  },
  categories: {
    list: () => request("/webapp/categories"),
  },
  orders: {
    create: (body) =>
      request("/webapp/orders", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
};
