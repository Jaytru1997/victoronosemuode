"use client";

import { useEffect, useState } from "react";
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
  Calendar,
  Clock,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  Loader2,
  Ticket,
  MapPin,
  FileText,
  Video,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useCurrency } from "@/src/context/CurrencyContext";
import { useToast } from "@/src/context/ToastContext";

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
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  authorEmail?: string;
  createdAt: string;
}

interface CommentAdminItem {
  _id: string;
  postId: string;
  postSlug?: string;
  postTitle?: string;
  userId: string;
  authorEmail: string;
  authorName: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

interface UserItem {
  _id: string;
  email: string;
  role: "admin" | "manager" | "user";
  createdAt?: string;
}

interface OrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    street?: string;
  };
  notes?: string;
  items: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    coverImage?: string;
  }[];
  totalAmount: number;
  currency: string;
  status: "payment_submitted" | "confirmed" | "rejected" | "pending_fulfilment";
  senderDetails?: string;
  createdAt: string;
}

interface EventReservationItem {
  _id: string;
  reservationCode: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  customerName: string;
  customerEmail: string;
  seatsCount: number;
  notes?: string;
  createdAt: string;
}

interface MeetingItem {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  clientName?: string;
  clientEmail?: string;
  location?: string;
  meetingUrl?: string;
  status: string;
  duration?: number;
  notes?: string;
}

interface SpeakingEventAdminItem {
  _id: string;
  title: string;
  theme?: string;
  date: string;
  time: string;
  venue: string;
  location?: string;
  clientRole?: string;
  description?: string;
  capacity?: number;
  reservedSeats?: number;
  category?: string;
  posterImage?: string;
}

type TabType =
  | "pending-payments"
  | "purchased-books"
  | "scheduled-events"
  | "approvals"
  | "posts"
  | "comments"
  | "books"
  | "users"
  | "schedule"
  | "events";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>("pending-payments");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reservations, setReservations] = useState<EventReservationItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [allBooks, setAllBooks] = useState<BookAdminItem[]>([]);

  // Events state
  const [eventsList, setEventsList] = useState<SpeakingEventAdminItem[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTheme, setNewEventTheme] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("10:00 AM WAT");
  const [newEventVenue, setNewEventVenue] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventRole, setNewEventRole] = useState("Attendee");
  const [newEventCapacity, setNewEventCapacity] = useState("200");
  const [newEventCategory, setNewEventCategory] = useState("Synod");
  const [newEventPoster, setNewEventPoster] = useState("/annual-vestry-meeting-poster.png");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Admin state
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Ministry & Teachings");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Comments moderation state
  const [commentsList, setCommentsList] = useState<CommentAdminItem[]>([]);
  const [pendingCommentsCount, setPendingCommentsCount] = useState(0);
  const [commentFilter, setCommentFilter] = useState<"pending" | "approved" | "all">("pending");
  const [commentActionLoading, setCommentActionLoading] = useState<string | null>(null);

  const [booksAdminList, setBooksAdminList] = useState<BookAdminItem[]>([]);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookNote, setNewBookNote] = useState("");
  const [newBookPrice, setNewBookPrice] = useState("3500");
  const [newBookCategory, setNewBookCategory] = useState("Church Administration");
  const [newBookTone, setNewBookTone] = useState("book-green");
  const [newBookCover, setNewBookCover] = useState("/annual-vestry-meeting-poster.png");
  const [newBookAuthor, setNewBookAuthor] = useState("Ven. Victor A. Onosemuode JP (Rtd.)");
  const [savingBook, setSavingBook] = useState(false);

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "manager" | "user">("user");
  const [creatingUser, setCreatingUser] = useState(false);

  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [approvingMeetingId, setApprovingMeetingId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Set default tab on user load
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "manager") {
        setActiveTab("approvals");
      } else {
        // If user has pending payments, default to that, else purchased books
        setActiveTab("pending-payments");
      }
    }
  }, [user]);

  // Fetch data
  const fetchOrders = async () => {
    if (!user) return;
    try {
      // Admins/managers fetch all orders; regular users fetch their own
      const url =
        user.role === "admin" || user.role === "manager"
          ? "/api/orders"
          : `/api/orders?email=${encodeURIComponent(user.email)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };

  const fetchReservations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/events/my-reservations?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error("Failed to load reservations:", err);
    }
  };

  const fetchMeetings = async () => {
    if (!user) return;
    try {
      // Admins/managers fetch all meetings (no date filter) for full oversight
      const isAdminOrManager = user.role === "admin" || user.role === "manager";
      const now = new Date();
      const future = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 180 days ahead for regular users
      const url = isAdminOrManager
        ? "/api/meetings"
        : `/api/meetings?from=${now.toISOString()}&to=${future.toISOString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const userMeetings = (data.meetings || []).filter(
          (m: MeetingItem) =>
            m.clientEmail?.toLowerCase() === user.email.toLowerCase() ||
            isAdminOrManager
        );
        setMeetings(userMeetings);
      }
    } catch (err) {
      console.error("Failed to load meetings:", err);
    }
  };


  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setAllBooks(data.books || []);
        setBooksAdminList(data.books || []);
      }
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data.comments || []);
        setPendingCommentsCount(data.pendingCount || 0);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleUpdateCommentStatus = async (commentId: string, status: "approved" | "rejected") => {
    setCommentActionLoading(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || `Comment ${status}`);
        fetchComments();
      } else {
        error(data.error || "Failed to update comment status");
      }
    } catch {
      error("Network error while updating comment status");
    } finally {
      setCommentActionLoading(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;
    setCommentActionLoading(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || "Comment deleted");
        fetchComments();
      } else {
        error(data.error || "Failed to delete comment");
      }
    } catch {
      error("Network error while deleting comment");
    } finally {
      setCommentActionLoading(null);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEventsList(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchReservations();
      fetchMeetings();
      fetchBooks();
      fetchEvents();
      if (user.role === "admin" || user.role === "manager") {
        fetchPosts();
        fetchComments();
        fetchUsers();
      }
    }
  }, [user]);

  // Handle URL query parameters (e.g. ?tab=posts&edit=POST_ID)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as TabType | null;
      const editPostIdParam = params.get("edit");
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (editPostIdParam && posts.length > 0) {
        const targetPost = posts.find(
          (p) => p._id === editPostIdParam || p.slug === editPostIdParam
        );
        if (targetPost) {
          startEditingPost(targetPost);
        }
      }
    }
  }, [posts]);

  // Admin Event Creation Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate.trim() || !newEventVenue.trim()) {
      error("Title, date, and venue are required.");
      return;
    }
    setCreatingEvent(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          theme: newEventTheme.trim(),
          date: newEventDate.trim(),
          time: newEventTime.trim(),
          venue: newEventVenue.trim(),
          location: newEventLocation.trim() || newEventVenue.trim(),
          clientRole: newEventRole.trim(),
          description: newEventDesc.trim(),
          capacity: Number(newEventCapacity) || 100,
          category: newEventCategory,
          posterImage: newEventPoster,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      success(`Event "${newEventTitle}" added successfully!`, { title: "Event Created" });
      setNewEventTitle("");
      setNewEventTheme("");
      setNewEventDate("");
      setNewEventVenue("");
      setNewEventLocation("");
      setNewEventDesc("");
      fetchEvents();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) {
        success(`Event "${title}" deleted successfully.`, { title: "Deleted" });
        fetchEvents();
      } else {
        const data = await res.json();
        error(data.error || "Failed to delete event");
      }
    } catch {
      error("Failed to delete event");
    }
  };

  // Admin Payment Confirmation Handler
  const handleConfirmPayment = async (orderId: string) => {
    setApprovingOrderId(orderId);
    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "confirm" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to confirm payment.");
      }
      success(data.message || "Payment confirmed and book(s) unlocked for user!", {
        title: "Payment Approved",
      });
      await fetchOrders();
      await refreshUser();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error confirming payment.";
      error(msg, { title: "Approval Failed" });
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    if (!confirm("Are you sure you want to mark this payment as rejected?")) return;
    setApprovingOrderId(orderId);
    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject payment.");
      }
      info("Payment marked as rejected.", { title: "Order Updated" });
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error rejecting payment.";
      error(msg, { title: "Action Failed" });
    } finally {
      setApprovingOrderId(null);
    }
  };

  // Admin Meeting Approval Handler
  const handleApproveMeeting = async (meetingId: string) => {
    setApprovingMeetingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "scheduled" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve meeting.");
      success("Meeting approved and confirmed for the client!", { title: "Meeting Approved" });
      fetchMeetings();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error approving meeting.");
    } finally {
      setApprovingMeetingId(null);
    }
  };

  const handleRejectMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to decline this meeting request?")) return;
    setApprovingMeetingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancellationReason: "Declined by admin." }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline meeting.");
      info("Meeting request declined.", { title: "Meeting Declined" });
      fetchMeetings();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error declining meeting.");
    } finally {
      setApprovingMeetingId(null);
    }
  };

  // Post Editing & Creation Handlers
  const startEditingPost = (p: PostItem) => {
    setEditingPostId(p._id);
    setPostTitle(p.title);
    setPostCategory(p.category || "Ministry & Teachings");
    setPostExcerpt(p.excerpt || "");
    setPostContent(p.content);
    setActiveTab("posts");
    const formElement = document.getElementById("post-form-card");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const cancelEditingPost = () => {
    setEditingPostId(null);
    setPostTitle("");
    setPostCategory("Ministry & Teachings");
    setPostExcerpt("");
    setPostContent("");
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      error("Title and content are required.");
      return;
    }
    setPosting(true);
    try {
      if (editingPostId) {
        // Update existing post
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: postTitle,
            category: postCategory,
            excerpt: postExcerpt,
            content: postContent,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update post");

        success("Post updated successfully!", { title: "Post Updated" });
        cancelEditingPost();
        fetchPosts();
      } else {
        // Publish new post
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
        if (!res.ok) throw new Error(data.error || "Failed to publish post");

        success("Post published successfully!", { title: "Post Live" });
        setPostTitle("");
        setPostExcerpt("");
        setPostContent("");
        fetchPosts();
      }
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error saving post");
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setDeletingPostId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");

      success("Post removed successfully", { title: "Post Deleted" });
      if (editingPostId === postId) {
        cancelEditingPost();
      }
      fetchPosts();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error deleting post");
    } finally {
      setDeletingPostId(null);
    }
  };

  // Admin Book Creation Handler
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBook(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBookTitle,
          note: newBookNote,
          price: Number(newBookPrice) || 3500,
          category: newBookCategory,
          tone: newBookTone,
          coverImage: newBookCover,
          author: newBookAuthor,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add book");

      success("Book added to catalog successfully!", { title: "Book Created" });
      setNewBookTitle("");
      setNewBookNote("");
      fetchBooks();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error adding book");
    } finally {
      setSavingBook(false);
    }
  };

  // Admin User Creation Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user account");

      success(`User account created for ${newUserEmail}`, { title: "Account Created" });
      setNewUserEmail("");
      setNewUserPassword("");
      fetchUsers();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setCreatingUser(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="page-width" style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem", opacity: 0.6 }} />
        <p style={{ fontSize: "1.1rem", color: "#64748b" }}>Loading your dashboard...</p>
      </div>
    );
  }

  // Filter pending payments
  const pendingOrders = orders.filter(
    (o) => o.status === "payment_submitted" || o.status === "pending_fulfilment"
  );

  // Filter purchased books (ONLY books the user has purchased, or all for admin/manager)
  const purchasedBooksList = allBooks.filter((book) => {
    if (user.role === "admin" || user.role === "manager") return true;
    return user.purchasedItems?.some(
      (item) => item.toLowerCase() === book.title.toLowerCase() || item.toLowerCase() === book._id?.toLowerCase()
    );
  });

  const roleColors = {
    admin: { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe" },
    manager: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
    user: { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar + Content Layout */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "0", alignItems: "flex-start", padding: "1.5rem 2rem 5rem" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: "240px",
          flexShrink: 0,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          padding: "1.25rem 0.75rem",
          position: "sticky",
          top: "80px",
          marginRight: "1.5rem",
          alignSelf: "flex-start",
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", padding: "0 0.75rem", marginBottom: "0.5rem" }}>Navigation</p>

          {/* Admin Approvals Tab */}
          {(user.role === "admin" || user.role === "manager") && (
            <button
              onClick={() => setActiveTab("approvals")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                width: "100%",
                padding: "0.65rem 0.75rem",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "approvals" ? "#1e3a8a" : "transparent",
                color: activeTab === "approvals" ? "#ffffff" : "#475569",
                fontWeight: "600",
                fontSize: "0.88rem",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "2px",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <CreditCard size={16} style={{ flexShrink: 0 }} /> Payment Approvals
              {pendingOrders.length > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: activeTab === "approvals" ? "#ef4444" : "#fee2e2",
                  color: activeTab === "approvals" ? "#ffffff" : "#b91c1c",
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  flexShrink: 0,
                }}>{pendingOrders.length}</span>
              )}
            </button>
          )}

          {/* Pending Payments */}
          <button
            onClick={() => setActiveTab("pending-payments")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "pending-payments" ? "#1e3a8a" : "transparent",
              color: activeTab === "pending-payments" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "2px",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <CreditCard size={16} style={{ flexShrink: 0 }} /> Pending Payments
            {pendingOrders.length > 0 && (
              <span style={{
                marginLeft: "auto",
                background: activeTab === "pending-payments" ? "#ef4444" : "#fee2e2",
                color: activeTab === "pending-payments" ? "#ffffff" : "#b91c1c",
                fontSize: "10px",
                fontWeight: "800",
                padding: "1px 6px",
                borderRadius: "999px",
                flexShrink: 0,
              }}>{pendingOrders.length}</span>
            )}
          </button>

          {/* Purchased Books */}
          <button
            onClick={() => setActiveTab("purchased-books")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "purchased-books" ? "#1e3a8a" : "transparent",
              color: activeTab === "purchased-books" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "2px",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <BookOpen size={16} style={{ flexShrink: 0 }} /> Purchased Books
            <span style={{
              marginLeft: "auto",
              background: activeTab === "purchased-books" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
              color: activeTab === "purchased-books" ? "#ffffff" : "#64748b",
              fontSize: "10px",
              fontWeight: "800",
              padding: "1px 6px",
              borderRadius: "999px",
              flexShrink: 0,
            }}>{purchasedBooksList.length}</span>
          </button>

          {/* Scheduled Events */}
          <button
            onClick={() => setActiveTab("scheduled-events")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              border: "none",
              background: activeTab === "scheduled-events" ? "#1e3a8a" : "transparent",
              color: activeTab === "scheduled-events" ? "#ffffff" : "#475569",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "2px",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <Calendar size={16} style={{ flexShrink: 0 }} /> Scheduled Events
            <span style={{
              marginLeft: "auto",
              background: activeTab === "scheduled-events" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
              color: activeTab === "scheduled-events" ? "#ffffff" : "#64748b",
              fontSize: "10px",
              fontWeight: "800",
              padding: "1px 6px",
              borderRadius: "999px",
              flexShrink: 0,
            }}>{reservations.length + meetings.length}</span>
          </button>

          {/* Admin-only section */}
          {(user.role === "admin" || user.role === "manager") && (
            <>
              <div style={{ height: "1px", background: "#f1f5f9", margin: "0.75rem 0.75rem" }} />
              <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", padding: "0 0.75rem", marginBottom: "0.5rem" }}>Admin</p>

              <button
                onClick={() => setActiveTab("posts")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "posts" ? "#1e3a8a" : "transparent",
                  color: activeTab === "posts" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <PenTool size={16} style={{ flexShrink: 0 }} /> Manage Posts
              </button>

              <button
                onClick={() => setActiveTab("comments")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "comments" ? "#1e3a8a" : "transparent",
                  color: activeTab === "comments" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <MessageSquare size={16} style={{ flexShrink: 0 }} /> Moderate Comments
                {pendingCommentsCount > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: activeTab === "comments" ? "#f59e0b" : "#fef3c7",
                      color: activeTab === "comments" ? "#ffffff" : "#b45309",
                      fontSize: "10px",
                      fontWeight: "800",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    {pendingCommentsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("books")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "books" ? "#1e3a8a" : "transparent",
                  color: activeTab === "books" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Library size={16} style={{ flexShrink: 0 }} /> Manage Catalog
              </button>

              <button
                onClick={() => setActiveTab("users")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "users" ? "#1e3a8a" : "transparent",
                  color: activeTab === "users" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Users size={16} style={{ flexShrink: 0 }} /> User Directory
              </button>

              <button
                onClick={() => setActiveTab("schedule")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "schedule" ? "#1e3a8a" : "transparent",
                  color: activeTab === "schedule" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Calendar size={16} style={{ flexShrink: 0 }} /> All Meetings
                {meetings.filter((m) => m.status === "pending").length > 0 && (
                  <span style={{
                    marginLeft: "auto",
                    background: activeTab === "schedule" ? "#ef4444" : "#fee2e2",
                    color: activeTab === "schedule" ? "#ffffff" : "#b91c1c",
                    fontSize: "10px",
                    fontWeight: "800",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    flexShrink: 0,
                  }}>{meetings.filter((m) => m.status === "pending").length}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("events")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  width: "100%",
                  padding: "0.65rem 0.75rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "events" ? "#1e3a8a" : "transparent",
                  color: activeTab === "events" ? "#ffffff" : "#475569",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "2px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Ticket size={16} style={{ flexShrink: 0 }} /> Events
                <span style={{
                  marginLeft: "auto",
                  background: activeTab === "events" ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                  color: activeTab === "events" ? "#ffffff" : "#64748b",
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  flexShrink: 0,
                }}>{eventsList.length}</span>
              </button>
            </>
          )}

          {/* Sign out at bottom of sidebar */}
          <div style={{ height: "1px", background: "#f1f5f9", margin: "0.75rem 0.75rem" }} />
          <button
            onClick={() => { logout(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              width: "100%",
              padding: "0.65rem 0.75rem",
              borderRadius: "10px",
              border: "none",
              background: "transparent",
              color: "#dc2626",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} /> Sign Out
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Tabs Navigation */}


          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 1: PENDING PAYMENTS (User View)                           */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "pending-payments" && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "750", color: "#0f172a", margin: "0 0 0.35rem" }}>
                  Pending Bank Transfer Payments
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
                  Orders awaiting administrative verification. Once confirmed, books are automatically unlocked in your Purchased Books tab.
                </p>
              </div>

              {pendingOrders.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "3.5rem 1.5rem",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={46} color="#16a34a" style={{ margin: "0 auto 1rem", opacity: 0.8 }} />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.4rem" }}>
                    No Pending Payments
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
                    You have no outstanding bank transfer payments awaiting admin approval.
                  </p>
                  <Link
                    href="/books"
                    className="button button-rust"
                    style={{ minHeight: "42px", padding: "0 1.25rem", fontSize: "0.85rem" }}
                  >
                    Browse Books Catalog
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {pendingOrders.map((order) => (
                    <div
                      key={order._id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "1rem",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
                            <span style={{ fontFamily: "monospace", fontWeight: "800", fontSize: "1.05rem", color: "var(--rust, #a64b32)" }}>
                              {order.orderNumber}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: "750",
                                background: "#fef3c7",
                                color: "#b45309",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <Clock size={12} /> Awaiting Admin Confirmation
                            </span>
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Total Amount</div>
                          <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
                            {formatPrice(order.totalAmount)}
                          </div>
                        </div>
                      </div>

                      {/* Items list */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                          Ordered Publications:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.88rem",
                                padding: "0.4rem 0.6rem",
                                background: "#f8fafc",
                                borderRadius: "6px",
                              }}
                            >
                              <span>{item.quantity}x <strong>{item.title}</strong></span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Transfer Details info note */}
                      <div
                        style={{
                          background: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          borderRadius: "8px",
                          padding: "0.75rem 1rem",
                          fontSize: "0.85rem",
                          color: "#166534",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Building size={16} style={{ flexShrink: 0 }} />
                        <span>
                          Direct Bank Transfer sent to <strong>Zenith Bank (Acc: 1014892014)</strong>. Once administrative review is complete, your books will be automatically available for download.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 2: PURCHASED BOOKS & RESOURCES (User View)                */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "purchased-books" && (
            <div>
              <div
                style={{
                  marginBottom: "1.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "750", color: "#0f172a", margin: "0 0 0.35rem" }}>
                    My Purchased Books &amp; Resources
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
                    Access published literature, pastoral guides, and spiritual hymnbooks by Ven. Victor Akpevwen Onosemuode (Rtd.).
                  </p>
                </div>
                <Link
                  href="/books"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--rust, #a64b32)",
                    fontSize: "0.9rem",
                    fontWeight: "750",
                    textDecoration: "none",
                  }}
                >
                  Public Book Catalog <ExternalLink size={15} />
                </Link>
              </div>

              {purchasedBooksList.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "4rem 1.5rem",
                    textAlign: "center",
                  }}
                >
                  <Library size={48} color="#94a3b8" style={{ margin: "0 auto 1.25rem", opacity: 0.6 }} />
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.4rem" }}>
                    You have not purchased any books yet
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.92rem", maxWidth: "440px", margin: "0 auto 1.75rem", lineHeight: "1.6" }}>
                    Explore the five legacy books written by Ven. Victor Akpevwen Onosemuode (Rtd.) to nurture faith, Anglican worship, and pastoral administration.
                  </p>
                  <Link
                    href="/books"
                    className="button button-rust"
                    style={{ minHeight: "44px", padding: "0 1.5rem", fontSize: "0.88rem" }}
                  >
                    Browse Books Catalog
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {purchasedBooksList.map((book) => (
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
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: "750",
                              textTransform: "uppercase",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "4px",
                              background: "#f1f5f9",
                              color: "#475569",
                              display: "inline-block",
                              marginBottom: "0.35rem",
                            }}
                          >
                            {book.category || "Christian Literature"}
                          </span>
                          <h3
                            style={{
                              margin: "0 0 0.35rem",
                              fontSize: "1.05rem",
                              fontFamily: "Georgia, serif",
                              lineHeight: "1.3",
                              color: "var(--ink, #173a32)",
                            }}
                          >
                            {book.title}
                          </h3>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              fontSize: "0.75rem",
                              fontWeight: "750",
                              color: "#16a34a",
                              background: "#dcfce7",
                              padding: "0.15rem 0.55rem",
                              borderRadius: "999px",
                            }}
                          >
                            <CheckCircle size={12} /> Unlocked
                          </div>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5" }}>
                        {book.note}
                      </p>

                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <a
                          href={book.coverImage || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-rust"
                          style={{
                            flex: 1,
                            minHeight: "38px",
                            padding: "0 0.75rem",
                            fontSize: "0.78rem",
                            borderRadius: "6px",
                          }}
                        >
                          <Download size={14} /> Download Study Guide
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 3: SCHEDULED EVENTS & CONSULTATIONS (User View)           */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "scheduled-events" && (
            <div>
              <div
                style={{
                  marginBottom: "1.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "750", color: "#0f172a", margin: "0 0 0.35rem" }}>
                    My Scheduled Events &amp; Consultations
                  </h2>
                  <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
                    Events where you have reserved seats, plus any personal meetings scheduled with Ven. Victor Onosemuode (Rtd.).
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Link
                    href="/events"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: "var(--rust, #a64b32)",
                      fontSize: "0.88rem",
                      fontWeight: "750",
                    }}
                  >
                    Events <ExternalLink size={14} />
                  </Link>
                  <Link
                    href="/calendar"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: "#1e3a8a",
                      fontSize: "0.88rem",
                      fontWeight: "750",
                    }}
                  >
                    Calendar Booking <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              {reservations.length === 0 && meetings.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "3.5rem 1.5rem",
                    textAlign: "center",
                  }}
                >
                  <Calendar size={48} color="#94a3b8" style={{ margin: "0 auto 1.25rem", opacity: 0.6 }} />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.4rem" }}>
                    No Scheduled Events or Meetings
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
                    You have not booked any event seat reservations or scheduled consultations yet.
                  </p>
                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                    <Link
                      href="/events"
                      className="button button-rust"
                      style={{ minHeight: "42px", padding: "0 1.25rem", fontSize: "0.85rem" }}
                    >
                      <Ticket size={14} /> Reserve Event Seat
                    </Link>
                    <Link
                      href="/calendar"
                      style={{
                        padding: "0 1.25rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      Book Meeting
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Event Reservations */}
                  {reservations.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#334155", marginBottom: "0.75rem" }}>
                        Event Reservations ({reservations.length})
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                        {reservations.map((res) => (
                          <div
                            key={res._id}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              padding: "1.25rem",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <span style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: "800", color: "var(--rust, #a64b32)" }}>
                                {res.reservationCode}
                              </span>
                              <span style={{ fontSize: "0.72rem", fontWeight: "750", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "999px" }}>
                                {res.seatsCount} {res.seatsCount === 1 ? "Seat" : "Seats"} Confirmed
                              </span>
                            </div>
                            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1rem", color: "var(--ink, #173a32)", fontFamily: "Georgia, serif" }}>
                              {res.eventTitle}
                            </h4>
                            <div style={{ fontSize: "0.82rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                              <div><Calendar size={13} style={{ display: "inline", marginRight: "4px" }} /> {res.eventDate}</div>
                              <div><MapPin size={13} style={{ display: "inline", marginRight: "4px" }} /> {res.eventVenue}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consultation Meetings */}
                  {meetings.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#334155", marginBottom: "0.75rem" }}>
                        Consultation Meetings ({meetings.length})
                      </h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                        {meetings.map((m) => (
                          <div
                            key={m._id}
                            style={{
                              background: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              padding: "1.25rem",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                              <span style={{ fontSize: "0.75rem", fontWeight: "750", textTransform: "uppercase", color: "#1e3a8a" }}>
                                Consultation
                              </span>
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: "750",
                                  textTransform: "uppercase",
                                  background:
                                    m.status === "pending"
                                      ? "#fef3c7"
                                      : m.status === "scheduled"
                                        ? "#dcfce7"
                                        : m.status === "cancelled"
                                          ? "#fee2e2"
                                          : "#e0e7ff",
                                  color:
                                    m.status === "pending"
                                      ? "#b45309"
                                      : m.status === "scheduled"
                                        ? "#15803d"
                                        : m.status === "cancelled"
                                          ? "#b91c1c"
                                          : "#3730a3",
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                }}
                              >
                                {m.status === "pending" ? "Pending Approval" : m.status}
                              </span>
                            </div>
                            <h4 style={{ margin: "0 0 0.4rem", fontSize: "1rem", color: "var(--ink, #173a32)" }}>
                              {m.title}
                            </h4>
                            <div style={{ fontSize: "0.82rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                              <div><Clock size={13} style={{ display: "inline", marginRight: "4px" }} /> {new Date(m.startTime).toLocaleString()}</div>
                              {m.location && <div><MapPin size={13} style={{ display: "inline", marginRight: "4px" }} /> {m.location}</div>}
                              {m.status === "scheduled" && m.meetingUrl && (
                                <div><Video size={13} style={{ display: "inline", marginRight: "4px" }} /> <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1e3a8a", textDecoration: "underline" }}>Join Online Meeting</a></div>
                              )}
                              {m.status === "pending" && (
                                <div style={{ marginTop: "0.35rem", padding: "0.4rem 0.6rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "0.76rem", color: "#92400e" }}>
                                  ⏳ Awaiting admin/manager approval. You will receive meeting confirmation once reviewed.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 4: PAYMENT APPROVALS (Admin & Manager View)               */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "approvals" && (user.role === "admin" || user.role === "manager") && (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "750", color: "#0f172a", margin: "0 0 0.35rem" }}>
                  Bank Transfer Payment Approvals
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.92rem", margin: 0 }}>
                  Review customer payment transfers sent to Zenith Bank. Confirming an order immediately unlocks the books in that user&apos;s account.
                </p>
              </div>

              {pendingOrders.length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "3.5rem 1.5rem",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={46} color="#16a34a" style={{ margin: "0 auto 1rem", opacity: 0.8 }} />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", margin: "0 0 0.4rem" }}>
                    All Payments Cleared!
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    There are no pending bank transfers awaiting review at this time.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {pendingOrders.map((order) => {
                    const isApproving = approvingOrderId === order._id;
                    const addr = order.deliveryAddress;
                    const fullAddressString = [
                      addr?.street,
                      addr?.city,
                      addr?.state,
                      addr?.postalCode,
                      addr?.country,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={order._id}
                        style={{
                          background: "#ffffff",
                          border: "1.5px solid #cbd5e1",
                          borderRadius: "14px",
                          padding: "1.5rem",
                          boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            flexWrap: "wrap",
                            gap: "1rem",
                            marginBottom: "1rem",
                            paddingBottom: "1rem",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                              <span style={{ fontFamily: "monospace", fontSize: "1.15rem", fontWeight: "850", color: "var(--rust, #a64b32)" }}>
                                {order.orderNumber}
                              </span>
                              <span style={{ fontSize: "0.72rem", fontWeight: "750", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "999px" }}>
                                Payment Submitted
                              </span>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                              Customer: <strong>{order.customerName}</strong> ({order.customerEmail}) · Phone: {order.customerPhone || "N/A"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Order Total</div>
                            <div style={{ fontSize: "1.35rem", fontWeight: "850", color: "#166534" }}>
                              {formatPrice(order.totalAmount)}
                            </div>
                          </div>
                        </div>

                        {/* 5-part Delivery Address breakdown */}
                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "0.85rem 1rem",
                            fontSize: "0.85rem",
                            color: "#334155",
                            marginBottom: "1rem",
                          }}
                        >
                          <div style={{ fontWeight: "750", marginBottom: "0.25rem", color: "#0f172a" }}>
                            5-Part Delivery Address:
                          </div>
                          <div>{fullAddressString || "Address not provided"}</div>
                        </div>

                        {/* Sender payment note if provided */}
                        {order.senderDetails && (
                          <div
                            style={{
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              borderRadius: "8px",
                              padding: "0.75rem 1rem",
                              fontSize: "0.85rem",
                              color: "#166534",
                              marginBottom: "1rem",
                            }}
                          >
                            <strong>Sender Bank Note:</strong> {order.senderDetails}
                          </div>
                        )}

                        {/* Ordered Publications */}
                        <div style={{ marginBottom: "1.25rem" }}>
                          <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#475569", marginBottom: "0.4rem" }}>
                            Ordered Publications ({order.items.length}):
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: "#ffffff",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "6px",
                                  padding: "0.35rem 0.75rem",
                                  fontSize: "0.82rem",
                                  fontWeight: "600",
                                  color: "#1e293b",
                                }}
                              >
                                {item.quantity}x {item.title}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleRejectPayment(order._id)}
                            disabled={isApproving}
                            style={{
                              padding: "0.6rem 1rem",
                              borderRadius: "6px",
                              border: "1px solid #fecaca",
                              background: "#ffffff",
                              color: "#b91c1c",
                              fontSize: "0.85rem",
                              fontWeight: "650",
                              cursor: "pointer",
                            }}
                          >
                            <XCircle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleConfirmPayment(order._id)}
                            disabled={isApproving}
                            className="button"
                            style={{
                              background: "#166534",
                              color: "#ffffff",
                              minHeight: "40px",
                              padding: "0 1.25rem",
                              fontSize: "0.85rem",
                              borderRadius: "6px",
                            }}
                          >
                            {isApproving ? (
                              <>
                                <Loader2 size={16} className="animate-spin" /> Unlocking...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={16} /> Confirm Payment &amp; Unlock Books
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 5: MANAGE POSTS (Admin & Manager)                          */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "posts" && (user.role === "admin" || user.role === "manager") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
              {/* Post Creation / Editing Form */}
              <div
                id="post-form-card"
                style={{
                  background: "#ffffff",
                  border: editingPostId ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "2rem",
                  boxShadow: editingPostId ? "0 4px 16px rgba(30, 58, 138, 0.08)" : "0 2px 8px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "750", color: "#0f172a", margin: 0 }}>
                    {editingPostId ? "Edit Ministry Post" : "Publish New Ministry Post"}
                  </h2>
                  {editingPostId && (
                    <span
                      style={{
                        background: "#fef3c7",
                        color: "#b45309",
                        fontSize: "0.75rem",
                        fontWeight: "750",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <PenTool size={12} /> Editing Mode
                    </span>
                  )}
                </div>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  {editingPostId
                    ? "Update the title, category, summary, or full content of this post. Changes will reflect immediately on the live blog."
                    : "Compose and publish articles, sermons, or ministry announcements."}
                </p>

                <form onSubmit={handleSavePost} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                        style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                        Category
                      </label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", background: "#ffffff" }}
                      >
                        <option value="Ministry & Teachings">Ministry &amp; Teachings</option>
                        <option value="Church Leadership">Church Leadership</option>
                        <option value="Christian Living & Books">Christian Living &amp; Books</option>
                        <option value="Community & Centenary">Community &amp; Centenary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                      Short Summary / Excerpt
                    </label>
                    <input
                      type="text"
                      placeholder="A brief 1-2 sentence preview"
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "0.35rem" }}>
                      Post Content
                    </label>
                    <textarea
                      required
                      rows={8}
                      placeholder="Write the full message, scripture references, and reflection..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      style={{ width: "100%", padding: "0.7rem 0.9rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
                    <button
                      type="submit"
                      disabled={posting}
                      className="button button-rust"
                      style={{ minHeight: "44px", padding: "0 1.5rem" }}
                    >
                      {posting
                        ? (editingPostId ? "Updating..." : "Publishing...")
                        : (editingPostId ? "Save & Update Post" : "Publish Post")}
                    </button>

                    {editingPostId && (
                      <button
                        type="button"
                        onClick={cancelEditingPost}
                        className="button"
                        style={{
                          minHeight: "44px",
                          padding: "0 1.25rem",
                          background: "#ffffff",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Posts list */}
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1rem" }}>
                  Existing Published Posts ({posts.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {posts.map((p) => (
                    <div key={p._id} style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>{p.title}</h4>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: "0 0 0.75rem", fontSize: "0.88rem", color: "#475569" }}>{p.excerpt || p.content.slice(0, 140)}...</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}>
                          {p.category}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            type="button"
                            onClick={() => startEditingPost(p)}
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: "700",
                              color: "#1e3a8a",
                              background: "rgba(30, 58, 138, 0.08)",
                              border: "1px solid rgba(30, 58, 138, 0.2)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <PenTool size={12} /> Edit Post
                          </button>

                          <button
                            type="button"
                            disabled={deletingPostId === p._id}
                            onClick={() => handleDeletePost(p._id, p.title)}
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              color: "#b91c1c",
                              background: "#ffffff",
                              border: "1px solid #fecaca",
                              borderRadius: "6px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>

                          <Link
                            href={`/blog/${p.slug || p._id}`}
                            target="_blank"
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: "600",
                              color: "#475569",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              marginLeft: "0.25rem",
                            }}
                          >
                            View Live <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB: MODERATE COMMENTS (Admin & Manager)                      */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "comments" && (user.role === "admin" || user.role === "manager") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1.75rem 2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: "750", color: "#0f172a", margin: "0 0 0.35rem" }}>
                    Blog Comments Moderation
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    Review submitted reflections and approve them before they are visible on ministry posts.
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setCommentFilter("pending")}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: commentFilter === "pending" ? "#f59e0b" : "#e2e8f0",
                      background: commentFilter === "pending" ? "#fffbeb" : "#ffffff",
                      color: commentFilter === "pending" ? "#b45309" : "#475569",
                    }}
                  >
                    Pending Confirmation ({commentsList.filter((c) => c.status === "pending").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter("approved")}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: commentFilter === "approved" ? "#10b981" : "#e2e8f0",
                      background: commentFilter === "approved" ? "#ecfdf5" : "#ffffff",
                      color: commentFilter === "approved" ? "#047857" : "#475569",
                    }}
                  >
                    Approved Live ({commentsList.filter((c) => c.status === "approved").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentFilter("all")}
                    style={{
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: commentFilter === "all" ? "#1e3a8a" : "#e2e8f0",
                      background: commentFilter === "all" ? "#eff6ff" : "#ffffff",
                      color: commentFilter === "all" ? "#1e3a8a" : "#475569",
                    }}
                  >
                    All ({commentsList.length})
                  </button>
                </div>
              </div>

              {/* Comments List */}
              {commentsList.filter(
                (c) => commentFilter === "all" || c.status === commentFilter
              ).length === 0 ? (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "3.5rem 2rem",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <MessageSquare size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                  <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem", color: "#0f172a" }}>
                    No {commentFilter === "all" ? "" : commentFilter} comments
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem" }}>
                    {commentFilter === "pending"
                      ? "All submitted comments have been reviewed! New submissions will appear here."
                      : "No comments match this filter."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {commentsList
                    .filter(
                      (c) => commentFilter === "all" || c.status === commentFilter
                    )
                    .map((comm) => (
                      <div
                        key={comm._id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "1.5rem",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.85rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                background: "#f1f5f9",
                                color: "#1e3a8a",
                                fontWeight: "750",
                                fontSize: "0.82rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {comm.authorName?.slice(0, 2).toUpperCase() || "U"}
                            </div>
                            <div>
                              <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#0f172a" }}>
                                {comm.authorName} <span style={{ color: "#64748b", fontWeight: "400", fontSize: "0.82rem" }}>({comm.authorEmail})</span>
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                                Submitted {new Date(comm.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {comm.status === "pending" && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  background: "#fef3c7",
                                  color: "#b45309",
                                  padding: "3px 9px",
                                  borderRadius: "999px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <Clock size={11} /> Awaiting Confirmation
                              </span>
                            )}
                            {comm.status === "approved" && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  background: "#ecfdf5",
                                  color: "#047857",
                                  padding: "3px 9px",
                                  borderRadius: "999px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <CheckCircle2 size={11} /> Live &amp; Approved
                              </span>
                            )}
                            {comm.status === "rejected" && (
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: "800",
                                  background: "#fef2f2",
                                  color: "#b91c1c",
                                  padding: "3px 9px",
                                  borderRadius: "999px",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                }}
                              >
                                <XCircle size={11} /> Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Associated Post */}
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: "0.6rem 0.9rem",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "#64748b" }}>
                            Post: <strong style={{ color: "#0f172a" }}>{comm.postTitle || "Ministry Article"}</strong>
                          </span>
                          <Link
                            href={`/blog/${comm.postSlug || comm.postId}`}
                            target="_blank"
                            style={{
                              color: "#1e3a8a",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            View Post <ExternalLink size={12} />
                          </Link>
                        </div>

                        {/* Comment Text */}
                        <div
                          style={{
                            fontSize: "0.92rem",
                            lineHeight: "1.6",
                            color: "#334155",
                            padding: "0.5rem 0",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          &ldquo;{comm.content}&rdquo;
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "0.65rem",
                            paddingTop: "0.75rem",
                            borderTop: "1px solid #f1f5f9",
                          }}
                        >
                          {comm.status !== "approved" && (
                            <button
                              type="button"
                              disabled={commentActionLoading === comm._id}
                              onClick={() => handleUpdateCommentStatus(comm._id, "approved")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.45rem 0.9rem",
                                borderRadius: "6px",
                                background: "#166534",
                                color: "#ffffff",
                                border: "none",
                                fontSize: "0.82rem",
                                fontWeight: "700",
                                cursor: "pointer",
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve Comment
                            </button>
                          )}

                          {comm.status === "approved" && (
                            <button
                              type="button"
                              disabled={commentActionLoading === comm._id}
                              onClick={() => handleUpdateCommentStatus(comm._id, "rejected")}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.45rem 0.85rem",
                                borderRadius: "6px",
                                background: "#fef2f2",
                                color: "#991b1b",
                                border: "1px solid #fecaca",
                                fontSize: "0.82rem",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              <XCircle size={14} /> Revoke Approval
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={commentActionLoading === comm._id}
                            onClick={() => handleDeleteComment(comm._id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.45rem 0.85rem",
                              borderRadius: "6px",
                              background: "#ffffff",
                              color: "#64748b",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 6: MANAGE BOOKS (Admin & Manager)                          */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "books" && (user.role === "admin" || user.role === "manager") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Add Book Form */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "2rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "750", color: "#0f172a", marginBottom: "0.5rem" }}>
                  Add Publication to Catalog
                </h2>
                <form onSubmit={handleCreateBook} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>Title</label>
                      <input
                        type="text"
                        required
                        placeholder="Book Title"
                        value={newBookTitle}
                        onChange={(e) => setNewBookTitle(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>Price (NGN)</label>
                      <input
                        type="number"
                        required
                        value={newBookPrice}
                        onChange={(e) => setNewBookPrice(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>Description / Note</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Summary of contents and significance..."
                      value={newBookNote}
                      onChange={(e) => setNewBookNote(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>Category</label>
                      <input
                        type="text"
                        value={newBookCategory}
                        onChange={(e) => setNewBookCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.3rem" }}>Author</label>
                      <input
                        type="text"
                        value={newBookAuthor}
                        onChange={(e) => setNewBookAuthor(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={savingBook} className="button button-rust" style={{ alignSelf: "flex-start", minHeight: "42px" }}>
                    {savingBook ? "Adding..." : "Add Book to Catalog"}
                  </button>
                </form>
              </div>

              {/* Book Catalog list */}
              <div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1rem" }}>Catalog Books ({booksAdminList.length})</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {booksAdminList.map((b) => (
                    <div key={b._id} style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <h4 style={{ margin: "0 0 0.3rem", fontSize: "0.95rem" }}>{b.title}</h4>
                      <div style={{ color: "var(--rust, #a64b32)", fontWeight: "750", fontSize: "0.9rem" }}>{formatPrice(b.price)}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{b.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 7: USER DIRECTORY (Admin & Manager)                        */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "users" && (user.role === "admin" || user.role === "manager") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {/* Create User Form */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.75rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "750", marginBottom: "1rem" }}>Create New User Account</h2>
                <form onSubmit={handleCreateUser} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <input
                    type="email"
                    required
                    placeholder="User Email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    style={{ padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    style={{ padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "admin" | "manager" | "user")}
                    style={{ padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" disabled={creatingUser} className="button button-rust" style={{ minHeight: "42px" }}>
                    {creatingUser ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>

              {/* Users Table */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: "700" }}>
                  Registered Users ({usersList.length})
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "0.75rem 1.5rem" }}>Email</th>
                        <th style={{ padding: "0.75rem 1.5rem" }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "0.75rem 1.5rem", fontWeight: "600" }}>{u.email}</td>
                          <td style={{ padding: "0.75rem 1.5rem" }}>
                            <span style={{ textTransform: "uppercase", fontSize: "0.72rem", fontWeight: "750", padding: "2px 8px", borderRadius: "999px", background: roleColors[u.role].bg, color: roleColors[u.role].text }}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 8: SCHEDULE & MEETINGS (Admin & Manager)                  */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "schedule" && (user.role === "admin" || user.role === "manager") && (() => {
            const pendingMeetings = meetings.filter((m) => m.status === "pending");
            const otherMeetings = meetings.filter((m) => m.status !== "pending");
            return (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.35rem", fontWeight: "750", margin: "0 0 0.25rem" }}>Meeting Requests &amp; Schedule</h2>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>Review, approve, or decline client consultation requests.</p>
                  </div>
                  <Link href="/calendar" className="button button-rust" style={{ minHeight: "40px", fontSize: "0.85rem" }}>
                    Open Full Calendar
                  </Link>
                </div>

                {/* Pending approvals */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "750", color: "#b45309", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fcd34d", borderRadius: "999px", padding: "1px 10px", fontSize: "0.8rem", fontWeight: "800" }}>
                      {pendingMeetings.length}
                    </span>
                    Pending Meeting Requests
                  </h3>
                  {pendingMeetings.length === 0 ? (
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "2.5rem 1.5rem", textAlign: "center" }}>
                      <CheckCircle2 size={38} color="#16a34a" style={{ margin: "0 auto 0.75rem", opacity: 0.8 }} />
                      <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem" }}>No pending meeting requests at this time.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {pendingMeetings.map((m) => {
                        const isActing = approvingMeetingId === m._id;
                        return (
                          <div
                            key={m._id}
                            style={{
                              background: "#ffffff",
                              border: "1.5px solid #fcd34d",
                              borderRadius: "12px",
                              padding: "1.25rem 1.5rem",
                              boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                              <div style={{ flex: 1, minWidth: "200px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                                  <span style={{ fontSize: "0.72rem", fontWeight: "800", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
                                    Awaiting Approval
                                  </span>
                                </div>
                                <h4 style={{ margin: "0 0 0.4rem", fontSize: "1rem", color: "#0f172a" }}>{m.title}</h4>
                                <div style={{ fontSize: "0.83rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                  <div><strong>Client:</strong> {m.clientName || m.clientEmail || "Unknown"}</div>
                                  {m.clientEmail && <div style={{ color: "#94a3b8" }}>{m.clientEmail}</div>}
                                  <div><Clock size={13} style={{ display: "inline", marginRight: "4px" }} />
                                    {new Date(m.startTime).toLocaleString(undefined, {
                                      weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                    })}
                                    <span style={{ marginLeft: "6px", color: "#94a3b8" }}>({m.duration} min)</span>
                                  </div>
                                  {m.location && <div><MapPin size={13} style={{ display: "inline", marginRight: "4px" }} />{m.location}</div>}
                                  {m.notes && <div style={{ fontStyle: "italic", color: "#94a3b8", marginTop: "0.2rem" }}>Note: {m.notes}</div>}
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexShrink: 0 }}>
                                <button
                                  onClick={() => handleApproveMeeting(m._id)}
                                  disabled={isActing}
                                  style={{
                                    padding: "0.5rem 1.1rem",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "#16a34a",
                                    color: "#ffffff",
                                    fontSize: "0.85rem",
                                    fontWeight: "700",
                                    cursor: isActing ? "not-allowed" : "pointer",
                                    opacity: isActing ? 0.7 : 1,
                                  }}
                                >
                                  {isActing ? "..." : "✓ Approve"}
                                </button>
                                <button
                                  onClick={() => handleRejectMeeting(m._id)}
                                  disabled={isActing}
                                  style={{
                                    padding: "0.5rem 1.1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #fca5a5",
                                    background: "#fff1f2",
                                    color: "#dc2626",
                                    fontSize: "0.85rem",
                                    fontWeight: "700",
                                    cursor: isActing ? "not-allowed" : "pointer",
                                    opacity: isActing ? 0.7 : 1,
                                  }}
                                >
                                  ✕ Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* All other meetings */}
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: "750", color: "#0f172a", marginBottom: "1rem" }}>
                    All Meetings ({otherMeetings.length})
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {otherMeetings.length === 0 ? (
                      <p style={{ color: "#64748b", textAlign: "center", padding: "2rem 0" }}>No confirmed meetings found.</p>
                    ) : otherMeetings.map((m) => (
                      <div key={m._id} style={{ background: "#ffffff", padding: "1.1rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div>
                          <h4 style={{ margin: "0 0 0.25rem", fontSize: "0.97rem" }}>{m.title}</h4>
                          <div style={{ fontSize: "0.83rem", color: "#64748b" }}>
                            {m.clientName || m.clientEmail} · {new Date(m.startTime).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <span style={{
                          textTransform: "capitalize",
                          fontSize: "0.76rem",
                          fontWeight: "750",
                          padding: "3px 10px",
                          borderRadius: "6px",
                          background: m.status === "scheduled" ? "#dcfce7" : m.status === "cancelled" ? "#fee2e2" : "#f1f5f9",
                          color: m.status === "scheduled" ? "#15803d" : m.status === "cancelled" ? "#b91c1c" : "#475569",
                        }}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}


          {/* ───────────────────────────────────────────────────────────── */}
          {/* TAB 9: EVENTS MANAGEMENT (Admin & Manager)                    */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "events" && (user.role === "admin" || user.role === "manager") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "750", margin: "0 0 0.25rem" }}>
                    Events Management
                  </h2>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                    Create and manage events, synods, services, and gatherings the client will attend, with poster visuals and seat reservations.
                  </p>
                </div>
                <Link href="/events" className="button button-rust" style={{ minHeight: "40px", fontSize: "0.85rem" }}>
                  View Public Events Page
                </Link>
              </div>

              {/* Create Event Card */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "1.75rem",
                  marginBottom: "2rem",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem", color: "var(--ink, #173a32)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <PlusCircle size={18} style={{ color: "var(--rust)" }} /> Add New Event
                </h3>

                <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Event Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anglican Diocesan Clergy & Laity Synod 2026"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Theme / Focus
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Anchored in Christ: Sustaining Pastoral Ministry"
                        value={newEventTheme}
                        onChange={(e) => setNewEventTheme(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Date *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. October 14–16, 2026 or 2026-10-14"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 AM WAT"
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Category
                      </label>
                      <select
                        value={newEventCategory}
                        onChange={(e) => setNewEventCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                      >
                        <option value="Synod">Synod</option>
                        <option value="Hymnology">Hymnology</option>
                        <option value="Youth Convention">Youth Convention</option>
                        <option value="Colloquium">Colloquium</option>
                        <option value="Special Service">Special Service</option>
                        <option value="Conference">Conference</option>
                        <option value="Retreat">Retreat</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Anniversary">Anniversary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Venue *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cathedral Church of St. Andrew, Warri"
                        value={newEventVenue}
                        onChange={(e) => setNewEventVenue(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Attendee, Speaker, Guest Minister, Special Guest"
                        value={newEventRole}
                        onChange={(e) => setNewEventRole(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                        Seat Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="200"
                        value={newEventCapacity}
                        onChange={(e) => setNewEventCapacity(e.target.value)}
                        style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                      Poster Image Preset
                    </label>
                    <select
                      value={newEventPoster}
                      onChange={(e) => setNewEventPoster(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#ffffff" }}
                    >
                      <option value="/annual-vestry-meeting-poster.png">Annual Vestry Meeting Poster</option>
                      <option value="/the-hymnfinder-poster.png">The Hymnfinder Poster</option>
                      <option value="/youth-children-hymn-book-poster.png">Youth & Children Hymn Book Poster</option>
                      <option value="/my-patmos-poster.png">My Patmos Devotional Poster</option>
                      <option value="/historical-encounter-poster.webp">Historical Encounter Poster</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", marginBottom: "0.3rem", color: "#334155" }}>
                      Description & Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide background, attendee instructions, or topics covered..."
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="submit"
                      disabled={creatingEvent}
                      className="button button-rust"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", minHeight: "42px" }}
                    >
                      {creatingEvent && <Loader2 size={16} className="animate-spin" />}
                      Publish Event
                    </button>
                  </div>
                </form>
              </div>

              {/* Events List */}
              <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e2e8f0", fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Published Events ({eventsList.length})</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {eventsList.map((ev) => (
                    <div
                      key={ev._id}
                      style={{
                        padding: "1.25rem 1.5rem",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div style={{ position: "relative", width: "70px", height: "70px", borderRadius: "8px", overflow: "hidden", background: "#173a32", flexShrink: 0 }}>
                          <Image
                            src={ev.posterImage || "/annual-vestry-meeting-poster.png"}
                            alt={ev.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.2rem" }}>
                            <span style={{ fontSize: "0.72rem", fontWeight: "800", textTransform: "uppercase", background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: "4px" }}>
                              {ev.category || "Event"}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {ev.date} • {ev.time}
                            </span>
                          </div>
                          <h4 style={{ margin: "0 0 0.2rem", fontSize: "1.05rem", color: "#0f172a" }}>
                            {ev.title}
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                            📍 {ev.venue} • Role: <strong>{ev.clientRole || "Attendee"}</strong>
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: "750", color: "#166534" }}>
                            {ev.reservedSeats || 0} / {ev.capacity || 200}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Seats Reserved</div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(ev._id, ev.title)}
                          style={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fca5a5",
                            borderRadius: "8px",
                            padding: "0.45rem 0.8rem",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>{/* end sidebar + content layout */}
    </div>
  );
}

