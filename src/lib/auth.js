import axiosInstance from "@/lib/axiosInstance";

// ─── Token Helpers ────────────────────────────────────────────

export function getToken() {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  } catch {
    console.error("Failed to set token");
  }
}

export function removeToken() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {
    console.error("Failed to remove token");
  }
}

export function getUser() {
  try {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    console.error("Failed to set user");
  }
}

export function isAuthenticated() {
  try {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

// ─── Auth APIs ────────────────────────────────────────────────

// Login
export async function signin({ email, password }) {
  const { data } = await axiosInstance.post("/auth/signin", {
    email,
    password,
  });

  if (data.token) setToken(data.token);
  if (data.user) setUser(data.user);

  return data;
}

// Get the user from signin response (more reliable than getUser after signin)
export function getUserFromSignin(data) {
  return data?.user || null;
}

// Logout
export function signout() {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// Forgot Password
export async function forgotPassword({ email }) {
  const { data } = await axiosInstance.post("/auth/forgot-password", {
    email,
  });
  return data;
}

// Get logged-in user
export async function getUserDetails() {
  const { data } = await axiosInstance.get("/auth/user");
  return data;
}

// ─── Admin APIs ───────────────────────────────────────────────

export async function adminCreateUser(payload) {
  const { data } = await axiosInstance.post("/auth/admin/users", payload);
  return data;
}

export async function adminGetUsers() {
  const { data } = await axiosInstance.get("/auth/admin/users");
  return data;
}

export async function adminGetUserById(id) {
  const { data } = await axiosInstance.get(`/auth/admin/users/${id}`);
  return data;
}

export async function adminUpdateUser(id, payload) {
  const { data } = await axiosInstance.put(
    `/auth/admin/users/${id}`,
    payload
  );
  return data;
}

export async function adminDeleteUser(id) {
  const { data } = await axiosInstance.delete(
    `/auth/admin/users/${id}`
  );
  return data;
}