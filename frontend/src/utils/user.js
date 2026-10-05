import { api } from "../api";

// Event yang dikirim saat data profil user berubah, supaya topbar dan sidebar ikut diperbarui
export const USER_UPDATED_EVENT = "tpq-user-updated";

export const bacaUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const simpanUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
};

// Foto bisa berupa URL lengkap atau path dari storage backend
export const fotoUserUrl = (foto) => {
  if (!foto) return null;

  if (foto.startsWith("http://") || foto.startsWith("https://")) return foto;

  return `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/storage/${foto.replace(/^\/+/, "")}`;
};
