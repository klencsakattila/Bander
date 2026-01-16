// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

// --- helpers: decode JWT without any library ---
function safeBase64UrlDecode(str) {
  try {
    // base64url -> base64
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    // pad
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");

    // decode
    const json = atob(padded);

    // handle unicode
    const decoded = decodeURIComponent(
      json
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return decoded;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const payload = safeBase64UrlDecode(parts[1]);
  if (!payload) return null;

  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  // exp is seconds since epoch
  if (!payload || typeof payload.exp !== "number") return false; // if no exp, we don't force logout
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSeconds;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  // derived info from token
  const payload = useMemo(() => decodeJwtPayload(token), [token]);

  const isAuth = useMemo(() => {
    if (!token) return false;
    if (!payload) return false;
    if (isTokenExpired(payload)) return false;
    return true;
  }, [token, payload]);

  // IMPORTANT:
  // change these if your backend uses different field names in JWT payload
  const userId = useMemo(() => {
    if (!payload) return null;
    return payload.id ?? payload.userId ?? payload.user_id ?? null;
  }, [payload]);

  const username = useMemo(() => {
    if (!payload) return null;
    return payload.username ?? payload.userName ?? null;
  }, [payload]);

  const email = useMemo(() => {
    if (!payload) return null;
    return payload.email ?? null;
  }, [payload]);

  useEffect(() => {
    // keep localStorage in sync
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    // auto-logout if token becomes expired
    if (token && payload && isTokenExpired(payload)) {
      setToken("");
      localStorage.removeItem("token");
    }
  }, [token, payload]);

  function login(newToken) {
    if (!newToken || typeof newToken !== "string") return;
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }

  function logout() {
    setToken("");
    localStorage.removeItem("token");
  }

  const value = useMemo(
    () => ({
      token,
      isAuth,
      userId,
      username,
      email,
      payload, // optional, useful for debugging
      login,
      logout,
    }),
    [token, isAuth, userId, username, email, payload]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
