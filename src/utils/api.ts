import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { tokenService } from "../services/tokenService";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Helper untuk convert object ke FormData
const objectToFormData = (obj: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

// Interceptor request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { useForm?: boolean }) => {
    const token = tokenService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // useForm = true, convert data ke FormData
    if (config.useForm && config.data && !(config.data instanceof FormData)) {
      config.data = objectToFormData(config.data);
      delete config.headers["Content-Type"];
    } else if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  }
);

export default api;
