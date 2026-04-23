import axiosInstance from "@/lib/axiosInstance";

// ─── Token Helpers ────────────────────────────────────────────

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
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