import * as jwt_decode from "jwt-decode";

export interface DecodedToken {
  user_id: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return (jwt_decode as any)(token) as DecodedToken;
  } catch (error) {
    return null;
  }
};
