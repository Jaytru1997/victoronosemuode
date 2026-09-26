import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "victor-onosemuode-secret-key-development-2026";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export type Role = "admin" | "manager" | "user";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Sign a new JWT session token (valid for 7 days)
 */
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Verify a JWT session token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Read the session from the HTTP-only cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Check if the user has one of the allowed roles
 */
export function hasRole(role: Role, allowed: Role[]): boolean {
  if (role === "admin") return true; // admin has all authority
  return allowed.includes(role);
}
