import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU4jl_uDC3yYps9Ijo0BK5fv0DnYeMmU8",
  authDomain: "jobgenie---an-interview-ai.firebaseapp.com",
  projectId: "jobgenie---an-interview-ai",
  appId: "1:166590211912:web:d08bf35716a42a09bfb57d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();