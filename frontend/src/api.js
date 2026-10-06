import axios from "axios";
import {
  mulaiLoading,
  selesaiLoading,
  mulaiMemuat,
  selesaiMemuat,
} from "./loadingStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

// =========================================================
// OTOMATIS KIRIM TOKEN LOGIN
// =========================================================
// Token disimpan oleh LoginAdmin.jsx di localStorage
// dengan key: "token"
// =========================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =========================================================
// LOADING UNTUK CREATE / UPDATE / DELETE
// =========================================================
// Request POST, PUT, PATCH, DELETE menampilkan overlay loading.
// Request GET tidak. Tambahkan skipLoading: true pada config
// untuk request yang tidak perlu overlay (login, logout, chat).
// =========================================================

const METHOD_TULIS = ["post", "put", "patch", "delete"];

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();

  if (METHOD_TULIS.includes(method) && !config.skipLoading) {
    config._trackLoading = true;
    mulaiLoading();
  } else if (method === "get" && !config.skipLoading) {
    config._trackMemuat = true;
    mulaiMemuat();
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config._trackLoading) selesaiLoading();
    if (response.config._trackMemuat) selesaiMemuat();

    return response;
  },
  (error) => {
    if (error?.config?._trackLoading) selesaiLoading();
    if (error?.config?._trackMemuat) selesaiMemuat();

    return Promise.reject(error);
  },
);
