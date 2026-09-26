"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      // Automatically logged in, direct to dashboard
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

  return (
    <div
      className="page-width"
      style={{
        padding: "4rem 1.5rem",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#1e3a8a",
              color: "#f8fafc",
              marginBottom: "1rem",
            }}
          >
            <UserPlus size={22} />
          </span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
            Create an Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Sign up to access your purchased books, ministry resources, and study materials.
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
          <div>
            <label
              htmlFor="name"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}
            >
              Full Name (Optional)
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
                <User size={18} />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
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
                placeholder="Minimum 6 characters"
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
              htmlFor="confirmPassword"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}
            >
              Confirm Password
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
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.75rem", fontSize: "0.9rem", color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#1e3a8a", fontWeight: "600", textDecoration: "underline" }}>
            Sign In
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "#64748b", textDecoration: "underline" }}>
            Return to Victor Onosemuode Home
          </Link>
        </div>
      </div>
    </div>
  );
}
