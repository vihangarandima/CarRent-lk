import axios from "axios";
import { API_URL } from "../config";

// Listers (personal hosts and rent-a-car companies) work from a dashboard.
// They can switch to "browsing" mode to see the site the way customers do.
export const LISTER_ROLES = ["owner", "company"];
export const DASHBOARD_PATH = "/dashboard";
const MODE_KEY = "appMode";

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const isLister = (user = getStoredUser()) =>
  Boolean(user && LISTER_ROLES.includes(user.role));

export const isBrowsingAsCustomer = () =>
  localStorage.getItem(MODE_KEY) === "browsing";

export const setBrowsingAsCustomer = (browsing) => {
  if (browsing) localStorage.setItem(MODE_KEY, "browsing");
  else localStorage.removeItem(MODE_KEY);
  window.dispatchEvent(new Event("user-updated"));
};

// Where a user should land after signing in
export const homePathFor = (user) => {
  if (user?.role === "admin") return "/admin";
  if (isLister(user)) return DASHBOARD_PATH;
  return "/home";
};

// Persist the response of /login, /register or /firebase-login
export const saveSession = (data) => {
  const user = { ...data.user };
  if (data.company) {
    user.companyId = data.company.id;
    localStorage.setItem("company", JSON.stringify(data.company));
  } else {
    localStorage.removeItem("company");
  }
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.removeItem(MODE_KEY);
  return user;
};

export const updateStoredUser = (changes) => {
  const user = { ...(getStoredUser() || {}), ...changes };
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("user-updated"));
  return user;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("company");
  localStorage.removeItem(MODE_KEY);
};

export const logout = () => {
  clearSession();
  window.location.href = "/";
};

// Attach the auth token to every request to our API, and sign the user out
// cleanly when the server says the token has expired.
let interceptorsInstalled = false;
export const installAuthInterceptors = () => {
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    const url = config.url || "";
    if (token && url.startsWith(API_URL)) {
      config.headers = config.headers || {};
      if (!config.headers["x-auth-token"]) {
        config.headers["x-auth-token"] = token;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const msg = error.response?.data?.msg || "";
      const sentToken = error.config?.headers?.["x-auth-token"];
      if (status === 401 && sentToken && /token is not valid/i.test(msg)) {
        clearSession();
        const here = window.location.pathname + window.location.search;
        window.location.href = `/login?expired=1&redirect=${encodeURIComponent(here)}`;
      }
      return Promise.reject(error);
    }
  );
};
