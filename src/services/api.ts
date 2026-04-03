import { Drink, Ingredient, User } from "../types";
import { normalizeDrink, normalizeDrinks } from "../utils/normalizeDrink";

const API_BASE = "https://ddc-server.onrender.com/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJson<T>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function putJson<T>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  // ─── Ingredients ───────────────────────────────
  getIngredients: () => fetchJson<Ingredient[]>(`${API_BASE}/ingredients`),

  searchIngredients: (q: string) =>
    fetchJson<Ingredient[]>(`${API_BASE}/ingredients/search?q=${encodeURIComponent(q)}`),

  getSuggestedIngredients: () =>
    fetchJson<Ingredient[]>(`${API_BASE}/ingredients/suggested`),

  // ─── Drink Matching ────────────────────────────
  matchDrinks: async (
    ingredientIds: number[],
    alcoholic?: boolean,
    options?: { maxIngredients?: number; maxTime?: number }
  ) => {
    let url = `${API_BASE}/drinks/match?ingredients=${ingredientIds.join(",")}`;
    if (alcoholic !== undefined) url += `&alcoholic=${alcoholic}`;
    if (options?.maxIngredients) url += `&max_ingredients=${options.maxIngredients}`;
    if (options?.maxTime) url += `&max_time=${options.maxTime}`;
    return normalizeDrinks(await fetchJson<any[]>(url));
  },

  // ─── Home Screen ──────────────────────────────
  getQuickDrinks: async (alcoholic?: boolean) => {
    let url = `${API_BASE}/drinks/quick`;
    if (alcoholic !== undefined) url += `?alcoholic=${alcoholic}`;
    return normalizeDrinks(await fetchJson<any[]>(url));
  },

  getPopularDrinks: async (alcoholic?: boolean) => {
    let url = `${API_BASE}/drinks/popular`;
    if (alcoholic !== undefined) url += `?alcoholic=${alcoholic}`;
    return normalizeDrinks(await fetchJson<any[]>(url));
  },

  getRandomDrink: async (alcoholic?: boolean) => {
    let url = `${API_BASE}/drinks/random`;
    if (alcoholic !== undefined) url += `?alcoholic=${alcoholic}`;
    const data = await fetchJson<any>(url);
    return data ? normalizeDrink(data) : null;
  },

  getForYou: async () => normalizeDrinks(await fetchJson<any[]>(`${API_BASE}/drinks/for-you`)),

  // ─── Search ───────────────────────────────────
  searchDrinks: async (q: string, alcoholic?: boolean) => {
    let url = `${API_BASE}/drinks/search?q=${encodeURIComponent(q)}`;
    if (alcoholic !== undefined) url += `&alcoholic=${alcoholic}`;
    return normalizeDrinks(await fetchJson<any[]>(url));
  },

  // ─── Detail ───────────────────────────────────
  getDrink: async (id: number) => normalizeDrink(await fetchJson<any>(`${API_BASE}/drinks/${id}`)),

  // ─── Analytics ────────────────────────────────
  trackEvent: (event: string, payload: object) =>
    postJson(`${API_BASE}/analytics/track`, { event, ...payload }).catch(() => {}),

  // ─── Auth ─────────────────────────────────────
  sendOtp: (email: string) =>
    postJson<{ ok: boolean; message: string }>(`${API_BASE}/auth/send-otp`, { email }),

  verifyOtp: (email: string, code: string) =>
    postJson<{ ok: boolean; user: User }>(`${API_BASE}/auth/verify-otp`, { email, code }),

  getMe: (email: string) =>
    fetchJson<User>(`${API_BASE}/auth/me?email=${encodeURIComponent(email)}`),

  updateProfile: (data: {
    email: string;
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    bio?: string;
    preferenceAlcoholic?: boolean;
  }) => putJson<User>(`${API_BASE}/auth/profile`, data),
};
