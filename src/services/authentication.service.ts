import axios from "axios";

const AUTH_BASE = "/api/auth";

export const authRoutes = {
  github: `${AUTH_BASE}/github`,
  google: `${AUTH_BASE}/google`,
};

export interface AuthUser {
  id: string;
  username: string | null;
  email: string;
  displayName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  provider: string;
  role: string;
  createdAt: string;
}

export interface OnboardingData {
  username: string;
  fullName: string;
  phoneNumber: string;
}

export const authApi = {
  async getMe(): Promise<{ success: boolean; user?: AuthUser; needsOnboarding?: boolean; error?: string }> {
    const { data } = await axios.get(`${AUTH_BASE}/me`);
    return data;
  },
  async completeOnboarding(form: OnboardingData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const { data } = await axios.post(`${AUTH_BASE}/onboarding`, form);
    return data;
  },
  async logout(): Promise<{ success: boolean }> {
    const { data } = await axios.post(`${AUTH_BASE}/logout`);
    return data;
  },
};
