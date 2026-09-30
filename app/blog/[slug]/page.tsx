import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, BookOpen, User, Tag, Share2, PenTool } from "lucide-react";
import { getPostBySlugOrId, getAllPosts } from "@/src/models/post";
import { getSession, hasRole } from "@/src/lib/auth";
import ShareButtons from "@/src/components/ShareButtons";
import CommentsSection from "@/src/components/CommentsSection";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugOrId(slug);

  if (!post) {
    return {
      title: "Article Not Found | Ven. Victor Onosemuode",
    };
  }

  return {
    title: `${post.title} | Ven. Victor Onosemuode`,
    description: post.excerpt || post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlugOrId(slug);

  if (!post) {
    notFound();
  }

  const session = await getSession();
  const canEdit = session && hasRole(session.role, ["admin", "manager"]);

  const postId = post._id ? post._id.toString() : slug;
  const postSlug = post.slug || postId;

  // Fetch recent posts for sidebar / bottom suggestions
  const allPosts = await getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p._id?.toString() !== postId)
    .slice(0, 3)
    .map((p) => ({
      _id: p._id?.toString() || "",
      title: p.title,
      slug: p.slug || p._id?.toString() || "",
      excerpt: p.excerpt,
      category: p.category,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
    }));

  const words = post.content.trim().split(/\s+/).length;
  const readTime = `${Math.ceil(words / 200)} min read`;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : "";

  // Split content by double linebreaks into paragraphs
  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main style={{ background: "var(--paper, #f8f7f1)", minHeight: "100vh", paddingBottom: "5rem" }}>
      {/* Top Banner & Navigation */}
      <div
        style={{
          borderBottom: "1px solid var(--line, #d8ddd6)",
          background: "#ffffff",
          padding: "1rem 0",
        }}
      >
        <div className="page-width" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: "750",
              color: "var(--rust, #a64b32)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={16} /> Back to all articles
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            {canEdit && (
              <Link
                href={`/dashboard?tab=posts&edit=${postId}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.78rem",
                  fontWeight: "750",
                  color: "#1e3a8a",
                  background: "rgba(30, 58, 138, 0.08)",
                  border: "1px solid rgba(30, 58, 138, 0.2)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                <PenTool size={12} /> Edit Article
              </Link>
            )}

            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: "700",
                color: "var(--muted, #5c6e66)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {post.category || "Ministry Article"}
            </span>
          </div>
        </div>
      </div>

      {/* Article Content Container */}
      <article className="page-width" style={{ maxWidth: "860px", margin: "3rem auto 0" }}>
        {/* Header Section */}
        <header style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--rust, #a64b32)",
                background: "rgba(166, 75, 50, 0.08)",
                padding: "4px 12px",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Tag size={12} /> {post.category || "Ministry & Teachings"}
            </span>

            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--muted, #5c6e66)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Calendar size={14} /> {formattedDate}
            </span>

            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--muted, #5c6e66)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Clock size={14} /> {readTime}
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: "800",
              lineHeight: "1.25",
              color: "var(--ink, #173a32)",
              margin: "0 0 1.25rem",
            }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p
              style={{
                fontSize: "1.18rem",
                lineHeight: "1.65",
                color: "var(--muted, #5c6e66)",
                fontStyle: "italic",
                borderLeft: "3px solid var(--rust, #a64b32)",
                paddingLeft: "1.25rem",
                margin: "0 0 1.75rem",
              }}
            >
              {post.excerpt}
            </p>
          )}

          {/* Author Chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.85rem 1rem",
              background: "#ffffff",
              borderRadius: "10px",
              border: "1px solid var(--line, #d8ddd6)",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--ink, #173a32)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "750",
                fontSize: "0.82rem",
              }}
            >
              VO
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "750", color: "var(--ink, #173a32)" }}>
                Ven. Victor A. Onosemuode JP (Rtd.)
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted, #5c6e66)" }}>
                Anglican Priest · Teacher · Author
              </div>
            </div>
          </div>

          {/* Top Social Sharing Widget */}
          <ShareButtons title={post.title} excerpt={post.excerpt} />
        </header>

        {/* Main Article Body */}
        <section
          style={{
            background: "#ffffff",
            padding: "clamp(1.75rem, 4vw, 3rem)",
            borderRadius: "16px",
            border: "1px solid var(--line, #d8ddd6)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              fontSize: "1.08rem",
              lineHeight: "1.85",
              color: "var(--ink, #173a32)",
            }}
          >
            {paragraphs.map((para, idx) => {
              // Check if paragraph is a section heading (short line without trailing period)
              const isHeading =
                para.length < 60 &&
                !para.includes(".") &&
                !para.includes("?") &&
                !para.includes("!") &&
                !para.startsWith("http");

              if (isHeading) {
                return (
                  <h3
                    key={idx}
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: "750",
                      color: "var(--ink, #173a32)",
                      margin: "2rem 0 0.85rem",
                      paddingBottom: "0.35rem",
                      borderBottom: "1px solid var(--line, #d8ddd6)",
                    }}
                  >
                    {para}
                  </h3>
                );
              }

              // Check if prayer or scripture callout
              const isPrayerOrCallout =
                para.startsWith("A Prayer") ||
                para.startsWith("Prayer:") ||
                para.startsWith("Lord,") ||
                para.startsWith("Father,");

              if (isPrayerOrCallout) {
                return (
                  <blockquote
                    key={idx}
                    style={{
                      background: "rgba(192, 154, 88, 0.08)",
                      borderLeft: "4px solid var(--gold, #c09a58)",
                      padding: "1.25rem 1.5rem",
                      borderRadius: "0 10px 10px 0",
                      margin: "1.75rem 0",
                      fontStyle: "italic",
                      fontSize: "1.05rem",
                      color: "var(--ink, #173a32)",
                    }}
                  >
                    {para}
                  </blockquote>
                );
              }

              return (
                <p
                  key={idx}
                  style={{
                    margin: "0 0 1.4rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {para}
                </p>
              );
            })}
          </div>

          {/* Bottom Social Sharing Widget */}
          <div
            style={{
              marginTop: "3rem",
              paddingTop: "1.75rem",
              borderTop: "1px solid var(--line, #d8ddd6)",
            }}
          >
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: "750",
                color: "var(--ink, #173a32)",
                marginBottom: "0.25rem",
              }}
            >
              Found this message encouraging?
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--muted, #5c6e66)",
                margin: "0 0 0.75rem",
              }}
            >
              Share it with family, church members, and friends across social media.
            </p>
            <ShareButtons title={post.title} excerpt={post.excerpt} />
          </div>

          {/* COMMENTS SECTION */}
          <CommentsSection
            postId={postId}
            postSlug={postSlug}
            postTitle={post.title}
          />
        </section>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: "4rem" }}>
            <h3
              style={{
                fontSize: "1.35rem",
                fontWeight: "750",
                color: "var(--ink, #173a32)",
                marginBottom: "1.5rem",
              }}
            >
              More Ministry Teachings
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {relatedPosts.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/blog/${rel.slug}`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line, #d8ddd6)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    textDecoration: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "750",
                        textTransform: "uppercase",
                        color: "var(--rust, #a64b32)",
                      }}
                    >
                      {rel.category || "Ministry"}
                    </span>
                    <h4
                      style={{
                        margin: "0.5rem 0 0.5rem",
                        fontSize: "1.05rem",
                        fontWeight: "700",
                        color: "var(--ink, #173a32)",
                        lineHeight: "1.35",
                      }}
                    >
                      {rel.title}
                    </h4>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--rust, #a64b32)",
                      marginTop: "1rem",
                    }}
                  >
                    Read message →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
