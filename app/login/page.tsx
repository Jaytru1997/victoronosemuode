"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, BookOpen } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      // Successfully logged in
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="page-width" style={{ padding: "4rem 1.5rem", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "var(--card, #ffffff)",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
            <Image
              src="/logo.jpg"
              alt="Victor Onosemuode Logo"
              width={140}
              height={60}
              style={{ objectFit: "contain", maxHeight: "60px", width: "auto", borderRadius: "6px" }}
              priority
            />
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
            Portal Sign In
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Log in to manage ministry posts, resources, or your profile.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                <Mail size={18} />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                <Lock size={18} />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              background: "#1e3a8a",
              color: "#ffffff",
              padding: "0.85rem",
              borderRadius: "8px",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              marginTop: "0.5rem",
            }}
          >
            {loading ? "Authenticating..." : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.9rem", color: "#64748b" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#1e3a8a", fontWeight: "600", textDecoration: "underline" }}>
            Create an Account
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "underline" }}>
            Return to Victor Onosemuode Home
          </Link>
        </div>
      </div>
    </div>
  );
}