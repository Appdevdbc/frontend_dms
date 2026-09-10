// FILE: session.js
// Session Facade — mengelola identitas user (blob AES terenkripsi di localStorage).
// TOKEN TIDAK disimpan di sini; token dikelola backend via httpOnly cookie.

import { useEncrypt, useDecrypt } from "./utils.js";
import router from "./routes/router.js";

const SESSION_KEY = "session";
const LOGGED_IN_KEY = "isLoggedIn";

/**
 * Simpan payload identitas user sebagai satu blob terenkripsi.
 * @param {Object} payload - objek identitas (empid, nama, role, domain, dll.)
 */
export const setSession = (payload) => {
  try {
    const encrypted = useEncrypt(JSON.stringify(payload || {}));
    window.localStorage.setItem(SESSION_KEY, encrypted);
    window.localStorage.setItem(LOGGED_IN_KEY, "1");
  } catch (err) {
    console.error("setSession error:", err);
  }
};

/**
 * Ambil & dekripsi objek identitas user.
 * @returns {Object} objek identitas, atau {} jika kosong/gagal.
 */
export const getSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const decrypted = useDecrypt(raw);
    if (!decrypted) return {};
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("getSession error:", err);
    return {};
  }
};

/**
 * Hapus session + flag isLoggedIn (identitas saja).
 * Preferensi UI non-auth (dark, menu, dll.) TIDAK ikut terhapus.
 */
export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(LOGGED_IN_KEY);
};

/**
 * Status login berdasarkan flag.
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  return window.localStorage.getItem(LOGGED_IN_KEY) === "1";
};

/**
 * Arahkan ke halaman login (env-aware).
 * - LOCAL   → router internal ke /login
 * - selain  → replace ke Portal DBC (VITE_APPDBC)
 */
export const redirectToLogin = () => {
  const environment = `${import.meta.env.VITE_ENV}`;
  if (environment === "LOCAL") {
    router.push("/login");
  } else {
    window.location.replace(`${import.meta.env.VITE_APPDBC}`);
  }
};
