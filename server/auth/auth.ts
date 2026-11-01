import "server-only";
import { betterAuth } from "better-auth/minimal";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDatabase } from "@/server/db/mongodb";
import { getAuthConfig } from "./config";

async function createAuth() {
  const config = getAuthConfig();
  const { client, db } = await getDatabase();
  return betterAuth({
    appName: "StudyDesk",
    baseURL: config.baseURL,
    secret: config.secret,
    trustedOrigins: config.trustedOrigins,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128, autoSignIn: true },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async user => {
            const name = user.name.trim();
            if (!name || name.length > 100 || user.email.length > 254) throw new APIError("BAD_REQUEST", { message: "Please check your name and email address.", code: "INVALID_PROFILE" });
            return { data: { ...user, name } };
          },
        },
      },
    },
  });
}

let authPromise: ReturnType<typeof createAuth> | undefined;

export function getAuth() {
  if (!authPromise) authPromise = createAuth().catch(error => { authPromise = undefined; throw error; });
  return authPromise;
}
