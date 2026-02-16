import axios from "axios";

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

export const authProxy = {
  async getMe(): Promise<{ success: boolean; user?: AuthUser; needsOnboarding?: boolean; error?: string }> {
    const { data } = await axios.get("/api/auth/me");
    return data;
  },

  async completeOnboarding(form: OnboardingData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const { data } = await axios.post("/api/auth/onboarding", form);
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    const { data } = await axios.post("/api/auth/logout");
    return data;
  },
};
