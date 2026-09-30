"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Send, CheckCircle2, ShieldAlert, LogIn, Clock } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export interface CommentItem {
  _id: string;
  postId: string;
  postSlug?: string;
  postTitle?: string;
  userId: string;
  authorEmail: string;
  authorName: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string | Date;
}

interface CommentsSectionProps {
  postId: string;
  postSlug?: string;
  postTitle: string;
}

export default function CommentsSection({
  postId,
  postSlug,
  postTitle,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const param = postSlug || postId;
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(param)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      setErrorMessage("You must be logged in to leave a comment.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          postSlug,
          postTitle,
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit comment.");
      }

      setContent("");
      setSubmittedNotice(true);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || "An error occurred while posting your comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <section
      id="comments"
      style={{
        marginTop: "3.5rem",
        paddingTop: "2.5rem",
        borderTop: "2px solid var(--line, #d8ddd6)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "750",
            color: "var(--ink, #173a32)",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            margin: 0,
          }}
        >
          <MessageSquare size={22} style={{ color: "var(--rust, #a64b32)" }} />
          Discussion &amp; Reflections ({comments.length})
        </h2>
      </div>

      {/* COMMENT SUBMISSION FORM OR LOGIN PROMPT */}
      {user ? (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line, #d8ddd6)",
            borderRadius: "14px",
            padding: "1.5rem",
            marginBottom: "2.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--line, #d8ddd6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--ink, #173a32)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {getInitials(user.email)}
              </div>
              <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--ink, #173a32)" }}>
                Commenting as <strong style={{ color: "var(--rust, #a64b32)" }}>{user.email}</strong>
              </span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                background: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: "4px",
                color: "#64748b",
                fontWeight: "600",
              }}
            >
              {user.role}
            </span>
          </div>

          {submittedNotice ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "8px",
                padding: "1.25rem",
                textAlign: "center",
                color: "#065f46",
              }}
            >
              <CheckCircle2 size={32} style={{ margin: "0 auto 0.5rem", color: "#10b981" }} />
              <h4 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem", fontWeight: "700" }}>
                Comment Submitted for Review!
              </h4>
              <p style={{ margin: "0 0 1rem", fontSize: "0.88rem" }}>
                Thank you for contributing. Your reflection has been sent to our ministry administrators for confirmation and will appear here shortly once approved.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedNotice(false)}
                className="button"
                style={{
                  minHeight: "36px",
                  padding: "0 1rem",
                  fontSize: "11px",
                  background: "var(--ink, #173a32)",
                  color: "#ffffff",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Post Another Comment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="comment-textarea"
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "var(--ink, #173a32)",
                }}
              >
                Leave your reflection or testimony:
              </label>
              <textarea
                id="comment-textarea"
                rows={4}
                required
                placeholder="Share your encouragement, question, or reflection on this message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "8px",
                  border: "1px solid var(--line, #d8ddd6)",
                  fontSize: "0.95rem",
                  lineHeight: "1.5",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: "0.75rem",
                }}
              />

              {errorMessage && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    padding: "0.6rem 0.85rem",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="button button-rust"
                  style={{
                    minHeight: "42px",
                    padding: "0 1.5rem",
                    cursor: submitting || !content.trim() ? "not-allowed" : "pointer",
                    opacity: submitting || !content.trim() ? 0.6 : 1,
                  }}
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send size={15} /> Submit for Confirmation
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* PROMPT FOR VISITORS NOT LOGGED IN */
        <div
          style={{
            background: "#ffffff",
            border: "1px dashed var(--line, #d8ddd6)",
            borderRadius: "14px",
            padding: "2rem",
            textAlign: "center",
            marginBottom: "2.5rem",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(166, 75, 50, 0.1)",
              color: "var(--rust, #a64b32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <LogIn size={22} />
          </div>
          <h3
            style={{
              margin: "0 0 0.5rem",
              fontSize: "1.15rem",
              fontWeight: "750",
              color: "var(--ink, #173a32)",
            }}
          >
            Join the Ministry Discussion
          </h3>
          <p
            style={{
              margin: "0 auto 1.25rem",
              maxWidth: "520px",
              fontSize: "0.92rem",
              color: "var(--muted, #5c6e66)",
              lineHeight: "1.5",
            }}
          >
            Only registered and logged-in members can leave comments on blog posts. Log in to share your thoughts, prayer requests, or testimonies.
          </p>
          <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href={`/login?redirect=/blog/${encodeURIComponent(postSlug || postId)}`}
              className="button button-rust"
              style={{ minHeight: "40px", padding: "0 1.25rem" }}
            >
              <LogIn size={15} /> Log In to Comment
            </Link>
            <Link
              href="/signup"
              className="button button-outline"
              style={{ minHeight: "40px", padding: "0 1.25rem" }}
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* APPROVED COMMENTS LIST */}
      <div>
        <h3
          style={{
            fontSize: "1.15rem",
            fontWeight: "700",
            marginBottom: "1.25rem",
            color: "var(--ink, #173a32)",
          }}
        >
          Confirmed Comments ({comments.length})
        </h3>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted, #5c6e66)" }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "2.5rem 1.5rem",
              borderRadius: "12px",
              border: "1px solid var(--line, #d8ddd6)",
              textAlign: "center",
              color: "var(--muted, #5c6e66)",
            }}
          >
            <MessageSquare size={32} style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: "600" }}>
              No comments yet on this article.
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
              Be the first to share an encouraging word or reflection!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {comments.map((comment) => (
              <div
                key={comment._id}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--line, #d8ddd6)",
                  borderRadius: "12px",
                  padding: "1.25rem 1.5rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(23, 58, 50, 0.08)",
                        color: "var(--ink, #173a32)",
                        fontWeight: "750",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(23, 58, 50, 0.15)",
                      }}
                    >
                      {getInitials(comment.authorName || comment.authorEmail)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--ink, #173a32)" }}>
                        {comment.authorName}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted, #5c6e66)" }}>
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: "700",
                      color: "#166534",
                      background: "rgba(22, 101, 52, 0.08)",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <CheckCircle2 size={12} /> Confirmed
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.92rem",
                    lineHeight: "1.65",
                    color: "var(--ink, #173a32)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
