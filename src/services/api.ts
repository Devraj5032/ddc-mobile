import { Drink, Ingredient, User } from "../types";
import { normalizeDrink, normalizeDrinks } from "../utils/normalizeDrink";

const API_BASE = "https://ddc-server.onrender.com/api";

const TIMEOUT = 30000; // 30s for Render cold starts

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return headers;
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      if (res.status >= 500 && i < retries) continue; // retry on server error
      return res;
    } catch (err: any) {
      if (i === retries) throw err;
      // Wait 1s before retry
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Request failed");
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetchWithRetry(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function postJson<T>(url: string, body: object, useAuth = true): Promise<T> {
  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: useAuth ? authHeaders() : { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function putJson<T>(url: string, body: object): Promise<T> {
  const res = await fetchWithRetry(url, {
    method: "PUT",
    headers: authHeaders(),
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
    postJson<{ ok: boolean; message: string }>(`${API_BASE}/auth/send-otp`, { email }, false),

  verifyOtp: (email: string, code: string) =>
    postJson<{ ok: boolean; user: User; token: string }>(`${API_BASE}/auth/verify-otp`, { email, code }, false),

  getMe: () =>
    fetchJson<User>(`${API_BASE}/auth/me`),

  updateProfile: (data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    bio?: string;
    preferenceAlcoholic?: boolean;
  }) => putJson<User>(`${API_BASE}/auth/profile`, data),
};
