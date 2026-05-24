import axios from "axios";
import { OAuthUserInfo } from "./types";

export interface GitHubConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
}

export const githubOAuthService = {
    getAuthUrl(config: GitHubConfig, state?: string): string {
        const rootUrl = "https://github.com/login/oauth/authorize";
        const options = {
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            scope: ["read:user", "user:email"].join(" "),
            state: state || "",
        };

        const qs = new URLSearchParams(options);
        return `${rootUrl}?${qs.toString()}`;
    },

    async getUserInfo(code: string, config: GitHubConfig): Promise<OAuthUserInfo> {
        const url = "https://github.com/login/oauth/access_token";
        const values = {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: config.redirectUri,
        };

        try {
            const res = await axios.post(url, values, {
                headers: {
                    Accept: "application/json",
                },
            });

            const { access_token } = res.data;

            const { data: user } = await axios.get("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            const { data: emails } = await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

            return {
                id: user.id.toString(),
                email: primaryEmail,
                name: user.name || user.login,
                avatar: user.avatar_url,
                raw: user,
            };
        } catch (error: any) {
            console.error("GitHub OAuth Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch GitHub user info");
        }
    },
};
