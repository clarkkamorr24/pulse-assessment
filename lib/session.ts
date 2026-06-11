import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "pulse_session";
const MAX_AGE_SECONDS = 60 * 60 * 24;

function key(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "dev-only-insecure-session-secret";
}

function sign(id: string): string {
  const mac = createHmac("sha256", key()).update(id).digest("base64url");
  return `${id}.${mac}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", key()).update(id).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return timingSafeEqual(a, b) ? id : null;
}

export function newSessionId(): string {
  return randomUUID();
}

export function sessionCookie(id: string): string {
  const parts = [
    `${COOKIE_NAME}=${sign(id)}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function readSessionId(request: NextRequest): string | null {
  return verify(request.cookies.get(COOKIE_NAME)?.value);
}
