import { Request } from "express";

export type AuthCookie = {
    refreshToken: string;
    accessToken: string;
};

export const Roles = {
    CUSTOMER: "customer",
    ADMIN: "admin",
    MANAGER: "manager",
} as const;

export type IRole = (typeof Roles)[keyof typeof Roles];

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        jti?: string;
        tenant: string;
    };
}
