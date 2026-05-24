export interface OAuthUserInfo {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
    raw?: any;
}

export interface OAuthService {
    getAuthUrl(config: any): string;
    getUserInfo(code: string, config: any): Promise<OAuthUserInfo>;
}
