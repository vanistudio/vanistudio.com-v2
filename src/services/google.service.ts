import axios from "axios";
import { OAuthUserInfo } from "./types";

export interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export const googleOAuthService = {
    getAuthUrl(config: GoogleConfig, state?: string): string {
        const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
        const options = {
            redirect_uri: config.redirectUri,
            client_id: config.clientId,
            access_type: "offline",
            response_type: "code",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ].join(" "),
            state: state || "",
        };

        const qs = new URLSearchParams(options);
        return `${rootUrl}?${qs.toString()}`;
    },

    async getUserInfo(code: string, config: GoogleConfig): Promise<OAuthUserInfo> {
        const url = "https://oauth2.googleapis.com/token";
        const values = {
            code,
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.redirectUri,
            grant_type: "authorization_code",
        };

        try {
            const res = await axios.post(url, new URLSearchParams(values), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const { access_token } = res.data;

            const googleUserRes = await axios.get(
                `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );

            const googleUser = googleUserRes.data;

            return {
                id: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                avatar: googleUser.picture,
                raw: googleUser,
            };
        } catch (error: any) {
            console.error("Google OAuth Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch Google user info");
        }
    },
};
