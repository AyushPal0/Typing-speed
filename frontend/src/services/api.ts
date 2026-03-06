import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000";

// ─── Token Helpers ───────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem("token");
export const saveToken = (token: string) => localStorage.setItem("token", token);
export const clearToken = () => localStorage.removeItem("token");

// ─── Auth API ────────────────────────────────────────────────────

/** Login — backend expects query params, not JSON body */
export const loginUser = async (username: string, password: string) => {
  const res = await axios.post(
    `${BASE_URL}/login`,
    null,
    { params: { username, password } }
  );
  return res.data; // { access_token: string }
};

/** Register — backend expects query params */
export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const res = await axios.post(
    `${BASE_URL}/register`,
    null,
    { params: { username, email, password } }
  );
  return res.data;
};
