import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "#/db";
import { tanstackStartCookies } from "better-auth/tanstack-start";

const isProd = process.env.NODE_ENV === "production";
const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseURL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  account: {
    storeStateStrategy: "cookie",
  },
  advanced: {
    useSecureCookies: isProd,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProd,
    },
  },
  socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
 },

    plugins: [tanstackStartCookies()],
});