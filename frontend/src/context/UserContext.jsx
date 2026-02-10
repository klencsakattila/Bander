import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMe } from "../services/UserService";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { token, isAuth } = useAuth();

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

    try {
      setLoading(true);
      const data = await getMe(token);

      setUser(data.user);
      setBand(data.band);
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

  useEffect(() => {
    loadUser();
  }, [isAuth]);

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
