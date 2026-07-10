export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
  emailVerificationToken?: string | null;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string | null;
}

