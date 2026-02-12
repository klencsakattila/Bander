import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserById } from "../services/UserService";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { token, isAuth, userId} = useAuth();

  const [user, setUser] = useState(null);
  const [band, setBand] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    if (!isAuth) {
      setUser(null);
      setBand(null);
      setLoading(false);
      return;
    }

    // ha nincs userId, nem tudunk mit tölteni
    if (!userId) {
      setUser(null);
      setBand(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await getUserById(userId, token);

      // ha apiFetch valamiért textet adna vissza, dobjunk értelmes hibát
      if (typeof data === "string") {
        throw new Error(`getUserById returned non-JSON: ${data.slice(0, 80)}`);
      }

      setUser(data);     // backend: getUserById tipikusan a user objectet adja vissza
      setBand(null);     // ha band külön endpoint, majd később ide jön
    } catch (err) {
      if (String(err?.message || "").includes(" 401 ")) {
        setUser(null);
        setBand(null);
        return;
      }
      console.error("Failed to load user", err);
      setUser(null);
      setBand(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUser(); }, [isAuth, userId]);

  return (
    <UserContext.Provider
      value={{
        user,
        band,
        isInBand: !!band,
        loading,
        refreshUser: loadUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
