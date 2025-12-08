import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  user_id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const tokenService = {
  // ==================== Access Token ====================
  setToken: (token: string | null) => {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),

  // ==================== Refresh Token ====================
  setRefreshToken: (token: string | null) => {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  // ==================== Clear Tokens ====================
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // ==================== Decode Token ====================
  decodeToken: (token?: string): DecodedToken | null => {
    const t = token || localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!t) return null;

    try {
      return jwtDecode<DecodedToken>(t);
    } catch (error) {
      console.error("Invalid token format");
      return null;
    }
  },

  // ==================== Check Expired ====================
  isTokenExpired: (): boolean => {
    const decoded = tokenService.decodeToken();
    if (!decoded) return true;
    const currentTime = Date.now() / 1000; // in seconds
    return decoded.exp < currentTime;
  },
};
