import { createContext, useState, useEffect, useRef } from "react";
import { getMe } from "./services/auth.api"; // adjust path

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data?.user || null);
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.error(error);
        }
      } finally {
        setAuthChecked(true);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
