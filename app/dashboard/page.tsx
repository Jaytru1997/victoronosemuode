"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  UserCheck,
  BookOpen,
  LogOut,
  PenTool,
  Users,
  CheckCircle,
  AlertCircle,
  Trash2,
  PlusCircle,
  Download,
  ExternalLink,
} from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  role: "admin" | "manager" | "user";
  purchasedItems: string[];
}

interface PostItem {
  _id: string;
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  authorEmail?: string;
  createdAt: string;
}

interface UserItem {
  _id: string;
  email: string;
  role: "admin" | "manager" | "user";
  createdAt?: string;
}

const defaultBooks = [
  {
    id: "bk-1",
    title: "The Christian & Politics: A Practical Guide to Faith in Public Life",
    type: "eBook (PDF)",
    pages: "184 Pages",
    access: "full",
  },
  {
    id: "bk-2",
    title: "Divine Provision in Times of Scarcity: Biblical Principles for Today",
    type: "eBook + Study Guide",
    pages: "220 Pages",
    access: "full",
  },
  {
    id: "bk-3",
    title: "Living a Life of Integrity in an Uncompromising World",
    type: "Audio Devotional + eBook",
    pages: "160 Pages",
    access: "full",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "users" | "resources">("resources");

  // Posts state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Ministry & Teachings");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postMessage, setPostMessage] = useState<string | null>(null);

  // Users state
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "user">("user");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Load user session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          // Set default tab according to role
          if (data.user.role === "admin" || data.user.role === "manager") {
            setActiveTab("posts");
          } else {
            setActiveTab("resources");
          }
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [router]);

  // Load posts when activeTab is posts
  useEffect(() => {
    if (activeTab === "posts") {
      fetch("/api/posts")
        .then((r) => r.json())
        .then((d) => {
          if (d.posts) setPosts(d.posts);
        })
        .catch(console.error);
    }
    if (activeTab === "users" && (user?.role === "admin" || user?.role === "manager")) {
      fetch("/api/users")
        .then((r) => r.json())
        .then((d) => {
          if (d.users) setUsersList(d.users);
        })
        .catch(console.error);
    }
  }, [activeTab, user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    setPosting(true);
    setPostMessage(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          category: postCategory,
          excerpt: postExcerpt,
          content: postContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");

      setPostMessage("✅ Post created successfully!");
      setPostTitle("");
      setPostExcerpt("");
      setPostContent("");

      // Refresh list
      const r = await fetch("/api/posts");
      const d = await r.json();
      if (d.posts) setPosts(d.posts);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPostMessage(`❌ ${err.message}`);
      }
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleUpdateRole = async (userId: string, targetRole: "admin" | "manager" | "user") => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: targetRole } : u))
      );
      setUserMessage(`✅ User role successfully updated to ${targetRole}.`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserMessage(`❌ ${err.message}`);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMessage(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUserMessage("✅ User created successfully!");
      setNewEmail("");
      setNewPassword("");
      // Refresh list
      const r = await fetch("/api/users");
      const d = await r.json();
      if (d.users) setUsersList(d.users);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserMessage(`❌ ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-width" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "#64748b" }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const roleColors = {
    admin: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
    manager: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
    user: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  };

  return (
    <div className="page-width" style={{ padding: "3rem 1.5rem 5rem" }}>
      {/* Top Banner / User Header */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          padding: "1.75rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <Link href="/" title="Return to Website" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image
              src="/logo.png"
              alt="Ven. Victor Akpevwen Onosemuode Logo"
              width={160}
              height={55}
              style={{ objectFit: "contain", maxHeight: "44px", width: "auto" }}
              priority
            />
          </Link>
          <div style={{ width: "1px", height: "36px", background: "#e2e8f0" }} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <h1 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Management Portal
              </h1>
            <span
              style={{
                textTransform: "uppercase",
                fontSize: "0.75rem",
                fontWeight: "700",
                letterSpacing: "0.06em",
                padding: "0.25rem 0.65rem",
                borderRadius: "999px",
                backgroundColor: roleColors[user.role].bg,
                color: roleColors[user.role].text,
                border: `1px solid ${roleColors[user.role].border}`,
              }}
            >
              {user.role}
            </span>
          </div>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
              Logged in as: <strong>{user.email}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1.1rem",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#334155",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "2rem",
          paddingBottom: "0.5rem",
        }}
      >
        {(user.role === "admin" || user.role === "manager") && (
          <button
            onClick={() => setActiveTab("posts")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "posts" ? "#1e3a8a" : "transparent",
              color: activeTab === "posts" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <PenTool size={18} /> Manage Posts
          </button>
        )}

        {(user.role === "admin" || user.role === "manager") && (
          <button
            onClick={() => setActiveTab("users")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "users" ? "#1e3a8a" : "transparent",
              color: activeTab === "users" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <Users size={18} /> User Directory
          </button>
        )}

        <button
          onClick={() => setActiveTab("resources")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "resources" ? "#1e3a8a" : "transparent",
            color: activeTab === "resources" ? "#ffffff" : "#475569",
            fontWeight: "600",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          <BookOpen size={18} /> Purchased Resources & Books
        </button>
      </div>

      {/* TAB 1: MANAGE POSTS */}
      {activeTab === "posts" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          {/* Post Creation Form */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
              Publish New Ministry Post
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Compose and publish articles, sermons, or ministry announcements.
            </p>

            {postMessage && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  marginBottom: "1.25rem",
                  background: postMessage.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                  color: postMessage.startsWith("✅") ? "#166534" : "#991b1b",
                  border: `1px solid ${postMessage.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {postMessage}
              </div>
            )}

            <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                    Post Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walking in Divine Wisdom and Integrity"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                    Category
                  </label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Ministry & Teachings">Ministry & Teachings</option>
                    <option value="Church Leadership">Church Leadership</option>
                    <option value="Christian Living & Books">Christian Living & Books</option>
                    <option value="Community & Centenary">Community & Centenary</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Short Summary / Excerpt
                </label>
                <input
                  type="text"
                  placeholder="A brief 1-2 sentence preview for visitors"
                  value={postExcerpt}
                  onChange={(e) => setPostExcerpt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Post Content
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write the full message, scripture references, and reflection..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={posting}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    cursor: posting ? "not-allowed" : "pointer",
                    opacity: posting ? 0.7 : 1,
                  }}
                >
                  <PlusCircle size={18} />
                  {posting ? "Publishing..." : "Publish Post"}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Posts Table */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>
              Existing Posts ({posts.length})
            </h2>

            {posts.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.95rem" }}>No posts created yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {posts.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "1rem 1.25rem",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            background: "#e2e8f0",
                            color: "#334155",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: "600",
                          }}
                        >
                          {p.category || "Ministry"}
                        </span>
                        <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", margin: 0 }}>
                          {p.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                        {p.excerpt || p.content.slice(0, 100) + "..."}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePost(p._id)}
                      title="Delete post"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #fecaca",
                        background: "#fff1f2",
                        color: "#be123c",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE USERS & ROLES */}
      {activeTab === "users" && (user.role === "admin" || user.role === "manager") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
          {userMessage && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: userMessage.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                color: userMessage.startsWith("✅") ? "#166534" : "#991b1b",
                border: `1px solid ${userMessage.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {userMessage}
            </div>
          )}

          {/* Add User Form */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
              Add New User / Assign Role
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Admins can assign any role; Managers can add new standard users.
            </p>

            <form
              onSubmit={handleAddUser}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                alignItems: "flex-end",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Assigned Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "admin" | "manager" | "user")}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.9rem",
                    background: "#ffffff",
                  }}
                >
                  <option value="user">User (Purchased items & access)</option>
                  <option value="manager">Manager (Posts & users)</option>
                  {user.role === "admin" && <option value="admin">Admin (All authority)</option>}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>

          {/* User List */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>
              Registered Users Directory ({usersList.length})
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>User Email</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Current Role</th>
                    {user.role === "admin" && <th style={{ padding: "0.75rem 1rem" }}>Role Authority (Admin Action)</th>}
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 1rem", fontWeight: "500", color: "#0f172a" }}>
                        {u.email}
                      </td>
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span
                          style={{
                            textTransform: "uppercase",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "999px",
                            backgroundColor: roleColors[u.role].bg,
                            color: roleColors[u.role].text,
                            border: `1px solid ${roleColors[u.role].border}`,
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      {user.role === "admin" && (
                        <td style={{ padding: "0.85rem 1rem" }}>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateRole(u._id, e.target.value as "admin" | "manager" | "user")
                            }
                            style={{
                              padding: "0.35rem 0.65rem",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.85rem",
                              background: "#ffffff",
                            }}
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER PURCHASED RESOURCES */}
      {activeTab === "resources" && (
        <div>
          <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.35rem" }}>
              My Books & Ministry Resources
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              Access your unlocked literature, study materials, and spiritual resources by Ven. Victor Akpevwen Onosemuode.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {defaultBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "#047857",
                        background: "#ecfdf5",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "999px",
                      }}
                    >
                      <CheckCircle size={14} /> Unlocked in Library
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{book.pages}</span>
                  </div>

                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
                    Format: <strong>{book.type}</strong>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => alert(`Starting download for "${book.title}"...`)}
                    style={{
                      flex: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      background: "#1e3a8a",
                      color: "#ffffff",
                      padding: "0.65rem",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.88rem",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={16} /> Download
                  </button>

                  <Link
                    href="/resources"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      fontSize: "0.88rem",
                      textDecoration: "none",
                    }}
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "2.5rem",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "12px",
              padding: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", margin: "0 0 0.25rem" }}>
                Looking for more books or mentorship resources?
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                Explore the complete collection of Ven. Victor Onosemuode&apos;s published ministry books.
              </p>
            </div>
            <Link
              href="/resources"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.6rem 1.1rem",
                background: "#0f172a",
                color: "#ffffff",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Browse All Books <ExternalLink size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
