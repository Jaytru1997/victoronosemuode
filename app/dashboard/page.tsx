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
  Library,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { useToast } from "@/src/context/ToastContext";

interface CurrentUser {
  id: string;
  email: string;
  role: "admin" | "manager" | "user";
  purchasedItems: string[];
}

interface BookAdminItem {
  _id: string;
  title: string;
  note: string;
  price: number;
  currency?: string;
  coverImage: string;
  tone?: string;
  category?: string;
  author?: string;
  createdAt?: string;
  format?: string;
  pages?: string;
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

const authenticDefaultBooks: BookAdminItem[] = [
  {
    _id: "seed-1",
    title: "The Handbook for Conducting Annual Vestry Meetings",
    category: "Church Administration",
    note: "A practical handbook for church administration, vestry procedures, and annual parish meetings.",
    price: 3500,
    currency: "NGN",
    coverImage: "/annual-vestry-meeting-poster.png",
    tone: "book-green",
    author: "Ven. Victor A. Onosemuode JP",
    format: "Print & Study Guide (PDF)",
    pages: "148 Pages",
  },
  {
    _id: "seed-2",
    title: "My Patmos",
    category: "Daily Devotional",
    note: "God Speaks – A personal work among the five legacy books written to nurture faith and Christian devotion.",
    price: 4000,
    currency: "NGN",
    coverImage: "/my-patmos-poster.png",
    tone: "book-ochre",
    author: "Ven. Victor A. Onosemuode JP",
    format: "Hardcover & Devotional eBook",
    pages: "184 Pages",
  },
  {
    _id: "seed-3",
    title: "The Hymnfinder",
    category: "Hymnology & Worship",
    note: "A comprehensive reference resource for discovering hymns and enriching congregational worship.",
    price: 5000,
    currency: "NGN",
    coverImage: "/the-hymnfinder-poster.png",
    tone: "book-rust",
    author: "Ven. Victor A. Onosemuode JP",
    format: "Complete Hymnal Reference Index",
    pages: "312 Pages",
  },
  {
    _id: "seed-4",
    title: "Youth and Children Hymn Book",
    category: "Youth & School Ministry",
    note: "Containing hymns and spiritual songs for youth services, assemblies, conventions, and school devotions.",
    price: 3000,
    currency: "NGN",
    coverImage: "/youth-children-hymn-book-poster.png",
    tone: "book-blue",
    author: "Ven. Victor A. Onosemuode JP",
    format: "Youth Hymnal & Musical Notation",
    pages: "160 Pages",
  },
  {
    _id: "seed-5",
    title: "Historical Encounter of Some Hymn Writers",
    category: "Hymn History & Biographies",
    note: "Inspiring biographies of hymn writers and composers, accompanied by scriptures and historical context.",
    price: 4500,
    currency: "NGN",
    coverImage: "/historical-encounter-poster.webp",
    tone: "book-plum",
    author: "Ven. Victor A. Onosemuode JP",
    format: "Biographical Anthology & Reflections",
    pages: "228 Pages",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "books" | "users" | "resources">("resources");

  // Posts state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Ministry & Teachings");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [postMessage, setPostMessage] = useState<string | null>(null);

  // Books state for managers and admins
  const [booksAdminList, setBooksAdminList] = useState<BookAdminItem[]>([]);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookNote, setNewBookNote] = useState("");
  const [newBookPrice, setNewBookPrice] = useState("3500");
  const [newBookCategory, setNewBookCategory] = useState("Church Administration");
  const [newBookTone, setNewBookTone] = useState("book-green");
  const [newBookCover, setNewBookCover] = useState("/annual-vestry-meeting-poster.png");
  const [newBookAuthor, setNewBookAuthor] = useState("Ven. Victor A. Onosemuode JP");
  const [bookSaving, setBookSaving] = useState(false);
  const [bookAdminMessage, setBookAdminMessage] = useState<string | null>(null);

  // Users state
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "user">("user");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const { addToCart, formatPrice } = useCart();
  const { success, error, info } = useToast();
  const [userBooks, setUserBooks] = useState<BookAdminItem[]>(authenticDefaultBooks);
  const [addedBookId, setAddedBookId] = useState<string | null>(null);

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

  // Load posts, books, or users based on activeTab
  useEffect(() => {
    if (activeTab === "posts") {
      fetch("/api/posts")
        .then((r) => r.json())
        .then((d) => {
          if (d.posts) setPosts(d.posts);
        })
        .catch(console.error);
    }
    if (activeTab === "books" && (user?.role === "admin" || user?.role === "manager")) {
      fetch("/api/books")
        .then((r) => r.json())
        .then((d) => {
          if (d.books) setBooksAdminList(d.books);
        })
        .catch(console.error);
    }
    if (activeTab === "resources") {
      fetch("/api/books")
        .then((r) => r.json())
        .then((d) => {
          if (d.books && d.books.length > 0) {
            setUserBooks(d.books);
          }
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

  const handleAddToCartInDashboard = (book: BookAdminItem) => {
    addToCart({
      id: book._id,
      title: book.title,
      price: book.price || 3500,
      currency: book.currency || "NGN",
      coverImage: book.coverImage || "/annual-vestry-meeting-poster.png",
    });
    setAddedBookId(book._id);
    setTimeout(() => {
      setAddedBookId(null);
    }, 1800);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Unable to log out. Please try again.");

      success("You have been logged out successfully.", { title: "Signed out" });
      startTransition(() => {
        router.push("/login");
        router.refresh();
      });
    } catch (err) {
      console.error("Failed to log out:", err);
      error(err instanceof Error ? err.message : "Unable to log out. Please try again.", {
        title: "Could not sign out",
      });
    }
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
      success("Post created successfully!", { title: "Post published" });
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
      error(err instanceof Error ? err.message : "Failed to create post", {
        title: "Could not create post",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p._id !== id));
      success("Post deleted successfully.", { title: "Post deleted" });
    } catch (err) {
      console.error("Failed to delete post:", err);
      error(err instanceof Error ? err.message : "Failed to delete post", {
        title: "Could not delete post",
      });
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle || !newBookNote) return;

    setBookSaving(true);
    setBookAdminMessage(null);

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBookTitle,
          note: newBookNote,
          price: parseFloat(newBookPrice) || 3500,
          currency: "NGN",
          coverImage: newBookCover,
          tone: newBookTone,
          category: newBookCategory,
          author: newBookAuthor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add book");

      setBookAdminMessage("✅ Book added to database catalog successfully!");
      success("Book added to the database catalog successfully!", { title: "Book added" });
      setNewBookTitle("");
      setNewBookNote("");
      setNewBookPrice("3500");

      // Refresh list
      const r = await fetch("/api/books");
      const d = await r.json();
      if (d.books) setBooksAdminList(d.books);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setBookAdminMessage(`❌ ${err.message}`);
      } else {
        setBookAdminMessage("❌ Failed to add book to catalog");
      }
      error(err instanceof Error ? err.message : "Failed to add book to catalog", {
        title: "Could not add book",
      });
    } finally {
      setBookSaving(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book from the database catalog?")) return;
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete book");

      // Refresh list
      const r = await fetch("/api/books");
      const d = await r.json();
      if (d.books) setBooksAdminList(d.books);
      success("Book deleted from the database catalog.", { title: "Book deleted" });
    } catch (err) {
      console.error("Failed to delete book:", err);
      error("Error deleting book from catalog", { title: "Could not delete book" });
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
      success(`User role successfully updated to ${targetRole}.`, { title: "Role updated" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUserMessage(`❌ ${err.message}`);
      }
      error(err instanceof Error ? err.message : "Failed to update user role", {
        title: "Could not update role",
      });
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
      success("User created successfully!", { title: "Account created" });
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
      error(err instanceof Error ? err.message : "Failed to create user", {
        title: "Could not create account",
      });
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
            onClick={() => setActiveTab("books")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "books" ? "#1e3a8a" : "transparent",
              color: activeTab === "books" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <Library size={18} /> Manage Books &amp; Catalog
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

      {/* TAB: MANAGE BOOKS & CATALOG */}
      {activeTab === "books" && (user.role === "admin" || user.role === "manager") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          {/* Book Creation Form */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <Library size={24} color="#1e3a8a" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Add New Book to Database Catalog
              </h2>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Save books directly to the MongoDB database. Published books will instantly appear on the website&apos;s Books page with pricing and cart purchasing.
            </p>

            {bookAdminMessage && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  marginBottom: "1.25rem",
                  background: bookAdminMessage.startsWith("✅") ? "#f0fdf4" : "#fef2f2",
                  color: bookAdminMessage.startsWith("✅") ? "#166534" : "#991b1b",
                  border: `1px solid ${bookAdminMessage.startsWith("✅") ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {bookAdminMessage}
              </div>
            )}

            <form onSubmit={handleCreateBook} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Guidance for Ministry and Faithful Stewardship"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
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
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Church Administration">Church Administration</option>
                    <option value="Daily Devotional">Daily Devotional</option>
                    <option value="Hymnology & Worship">Hymnology & Worship</option>
                    <option value="Youth & School Ministry">Youth & School Ministry</option>
                    <option value="Hymn History & Biographies">Hymn History & Biographies</option>
                    <option value="Ministry & Pastoral Care">Ministry & Pastoral Care</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                    Mock Price (₦ NGN) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#64748b" }}>
                      ₦
                    </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      placeholder="3500"
                      value={newBookPrice}
                      onChange={(e) => setNewBookPrice(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.7rem 0.9rem 0.7rem 2rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Mock price, can be updated later</small>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="Ven. Victor A. Onosemuode JP"
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
                    Color Tone / Theme
                  </label>
                  <select
                    value={newBookTone}
                    onChange={(e) => setNewBookTone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.95rem",
                      background: "#ffffff",
                    }}
                  >
                    <option value="book-green">Green (Church Admin)</option>
                    <option value="book-ochre">Ochre (Devotional)</option>
                    <option value="book-rust">Rust (Hymnology)</option>
                    <option value="book-blue">Blue (Youth & Children)</option>
                    <option value="book-plum">Plum (Hymn History)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Poster Image Cover
                </label>
                <select
                  value={newBookCover}
                  onChange={(e) => setNewBookCover(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    background: "#ffffff",
                    marginBottom: "0.5rem",
                  }}
                >
                  <option value="/annual-vestry-meeting-poster.png">The Handbook for Annual Vestry Meetings</option>
                  <option value="/my-patmos-poster.png">My Patmos (God Speaks)</option>
                  <option value="/the-hymnfinder-poster.png">The Hymnfinder</option>
                  <option value="/youth-children-hymn-book-poster.png">Youth and Children Hymn Book</option>
                  <option value="/historical-encounter-poster.webp">Historical Encounter of Some Hymn Writers</option>
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom image path / URL (e.g. /custom-book.png)"
                  value={newBookCover}
                  onChange={(e) => setNewBookCover(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                  Description / Note *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the purpose, contents, and audience for this book..."
                  value={newBookNote}
                  onChange={(e) => setNewBookNote(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={bookSaving}
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
                    cursor: bookSaving ? "not-allowed" : "pointer",
                    opacity: bookSaving ? 0.7 : 1,
                  }}
                >
                  <PlusCircle size={18} />
                  {bookSaving ? "Adding Book..." : "Add Book to Database"}
                </button>
              </div>
            </form>
          </div>

          {/* Book Catalog List */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                  Active Catalog Books
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.2rem 0 0" }}>
                  Books currently available in MongoDB database ({booksAdminList.length})
                </p>
              </div>
              <button
                onClick={() => {
                  fetch("/api/books")
                    .then((r) => r.json())
                    .then((d) => { if (d.books) setBooksAdminList(d.books); });
                }}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  cursor: "pointer",
                }}
              >
                Refresh List
              </button>
            </div>

            {booksAdminList.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
                No books found in the database. Use the form above to add your first book!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {booksAdminList.map((book) => (
                  <div
                    key={book._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "70px 1fr auto",
                      alignItems: "center",
                      gap: "1.25rem",
                      padding: "1rem 1.25rem",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "70px",
                        height: "90px",
                        background: "radial-gradient(circle, #f8f7f1 0%, #ebe7dc 100%)",
                        borderRadius: "6px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={book.coverImage || "/annual-vestry-meeting-poster.png"}
                        alt={book.title}
                        fill
                        sizes="80px"
                        style={{ objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
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
                          {book.category || "Ministry"}
                        </span>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            background: "rgba(166, 75, 50, 0.1)",
                            color: "var(--rust, #a64b32)",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "4px",
                            fontWeight: "800",
                          }}
                        >
                          ₦{Number(book.price || 0).toLocaleString()}
                        </span>
                        <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", margin: 0 }}>
                          {book.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                        {book.note}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      title="Delete book from catalog"
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
          <div style={{ marginBottom: "1.75rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.35rem" }}>
                My Books &amp; Ministry Resources
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.95rem", margin: 0 }}>
                Access published literature, pastoral guides, and spiritual hymnbooks by Ven. Victor Akpevwen Onosemuode.
              </p>
            </div>
            <Link
              href="/resources"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--rust, #a64b32)",
                fontSize: "0.9rem",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Public Book Library <ExternalLink size={15} />
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {userBooks.map((book) => {
              const isPurchased =
                user.role === "admin" ||
                user.role === "manager" ||
                user.purchasedItems?.some(
                  (item) =>
                    item.toLowerCase() === book.title.toLowerCase() ||
                    item.toLowerCase() === book._id?.toLowerCase()
                );
              const isAdded = addedBookId === book._id;

              return (
                <div
                  key={book._id || book.title}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    gap: "1.25rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    {/* Book Poster Thumbnail */}
                    <div
                      style={{
                        position: "relative",
                        width: "85px",
                        height: "115px",
                        background: "radial-gradient(circle, #f8f7f1 0%, #ebe7dc 100%)",
                        borderRadius: "8px",
                        overflow: "hidden",
                        flexShrink: 0,
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={book.coverImage || "/annual-vestry-meeting-poster.png"}
                        alt={book.title}
                        fill
                        sizes="100px"
                        style={{ objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))" }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: "750",
                            color: "var(--muted, #5c6e66)",
                            background: "rgba(23, 58, 50, 0.06)",
                            padding: "2px 7px",
                            borderRadius: "4px",
                          }}
                        >
                          {book.category || "Ministry"}
                        </span>

                        {isPurchased ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.72rem",
                              fontWeight: "750",
                              color: "#047857",
                              background: "#ecfdf5",
                              padding: "2px 8px",
                              borderRadius: "999px",
                            }}
                          >
                            <CheckCircle size={13} /> Unlocked
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: "800",
                              color: "var(--rust, #a64b32)",
                            }}
                          >
                            {formatPrice(book.price || 3500, book.currency)}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: "700",
                          color: "#0f172a",
                          margin: "0 0 0.35rem",
                          lineHeight: "1.3",
                        }}
                      >
                        {book.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "#64748b",
                          margin: 0,
                          lineHeight: "1.45",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {book.note}
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {isPurchased ? (
                      <>
                        <button
                          onClick={() =>
                            info(`Starting download of reading copy / study materials for "${book.title}"...`, {
                              title: "Preparing download",
                            })
                          }
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
                            fontSize: "0.85rem",
                            cursor: "pointer",
                          }}
                        >
                          <Download size={15} /> Download PDF
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
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            textDecoration: "none",
                          }}
                        >
                          Details
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAddToCartInDashboard(book)}
                          style={{
                            flex: 1,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.4rem",
                            background: isAdded ? "#16a34a" : "var(--rust, #a64b32)",
                            color: "#ffffff",
                            padding: "0.65rem",
                            borderRadius: "8px",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                        >
                          {isAdded ? (
                            <>
                              <Check size={15} /> Added to Cart!
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={15} /> Order / Add to Cart
                            </>
                          )}
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
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            textDecoration: "none",
                          }}
                        >
                          Read More
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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
                Looking for copies for your church parish, choir, or school?
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
                Explore the complete five legacy books written by Ven. Victor Akpevwen Onosemuode or make bulk enquiries.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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
                Explore All 5 Books <ExternalLink size={15} />
              </Link>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.6rem 1.1rem",
                  background: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Parish Enquiries
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
