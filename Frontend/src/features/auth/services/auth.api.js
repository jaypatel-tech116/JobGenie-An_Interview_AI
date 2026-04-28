import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../../config/firebase";
import api, { setToken, clearToken } from "../../../config/api";

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    if (response.data.token) setToken(response.data.token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    if (response.data.token) setToken(response.data.token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function logout() {
  try {
    const response = await api.get("/api/auth/logout");
    clearToken();
    return response.data;
  } catch (error) {
    clearToken(); // clear locally even if backend call fails
    console.error(error);
    throw error;
  }
}

export async function googleLogin() {
  try {
    console.log("Google popup opening...");
    const result = await signInWithPopup(auth, googleProvider);

    console.log("Popup success");
    const idToken = await result.user.getIdToken();

    const response = await api.post("/api/auth/google", {
      token: idToken,
    });

    if (response.data.token) setToken(response.data.token);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // ✅ IMPORTANT
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error(error);
    }
    throw error;
  }
}
