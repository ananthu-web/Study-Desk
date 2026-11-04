import "server-only";

export class AuthUnavailableError extends Error {
  constructor() {
    super("Authentication is temporarily unavailable.");
    this.name = "AuthUnavailableError";
  }
}

export function getAuthConfig() {
  const uri = process.env.MONGODB_URI?.trim();
  const secret = process.env.BETTER_AUTH_SECRET;
  const databaseName = process.env.MONGODB_DB?.trim() || "studydesk";
  const baseURL = process.env.BETTER_AUTH_URL || (process.env.NODE_ENV !== "production" ? "http://127.0.0.1:3000" : "");
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri) || !secret || secret.length < 32 || !baseURL) throw new AuthUnavailableError();
  let url: URL;
  try { url = new URL(baseURL); } catch { throw new AuthUnavailableError(); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new AuthUnavailableError();
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new AuthUnavailableError();
  const trustedOrigins = [url.origin];
  if (process.env.NODE_ENV !== "production") trustedOrigins.push("http://127.0.0.1:3000", "http://localhost:3000");
  const lanHost = process.env.DEV_LAN_HOST?.trim();
  if (process.env.NODE_ENV !== "production" && lanHost && /^[\d.]+$/.test(lanHost)) trustedOrigins.push(`http://${lanHost}:3000`);
  return { uri, secret, databaseName, baseURL: url.origin, trustedOrigins: [...new Set(trustedOrigins)] };
}
