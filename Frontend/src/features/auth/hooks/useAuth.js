import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, googleLogin, getMe } from "../services/auth.api";
import { signOut } from "firebase/auth";
import { auth } from "../../../config/firebase";

export const useAuth = () => {
  const context = useContext(AuthContext);

  const { user, setUser, loading, setLoading, authChecked } = context;

  const handleLogin = async ({ email, password }) => {
    try {
      setLoading(true);

      const data = await login({ email, password });
      setUser(data.user);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    try {
      setLoading(true);

      const data = await register({ username, email, password });
      setUser(data.user);
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      // best-effort: clear backend cookie + any firebase session
      await logout();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error(error);
      // Even if logout fails (network, already expired), treat user as signed out locally.
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const data = await googleLogin();

      // Use the user returned directly from /auth/google
      // instead of a separate getMe() call, which can fail
      // if the cookie hasn't been set yet in cross-site contexts
      setUser(data.user);
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        return; // ✅ silently ignore
      }
      console.error(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    authChecked,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGoogleLogin,
  };
};
