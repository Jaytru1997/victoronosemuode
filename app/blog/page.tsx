"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  Share2,
  Sparkles,
  Tag,
  PenTool,
} from "lucide-react";
import SectionPage from "@/src/components/SectionPage";
import ShareButtons from "@/src/components/ShareButtons";

export interface PostItem {
  _id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  authorEmail?: string;
  authorRole?: string;
  createdAt: string | Date;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Compute available categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Filter posts by search query and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        post.content.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <SectionPage
      eyebrow="Ministry Articles &amp; Sermons"
      title="Faith, Wisdom &amp; Community"
      description="Reflections, scriptural expositions, and practical teachings from decades of Christian ministry and community leadership by Ven. Victor Akpevwen Onosemuode."
    >
      <section className="section-pad page-width" style={{ paddingTop: "2.5rem" }}>
        {/* Search and Category Filter Toolbar */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--line, #d8ddd6)",
            borderRadius: "14px",
            padding: "1.25rem 1.5rem",
            marginBottom: "2.5rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                flex: "1 1 300px",
                maxWidth: "460px",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted, #5c6e66)",
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, topics, scriptures..."
                style={{
                  width: "100%",
                  padding: "0.65rem 1rem 0.65rem 2.6rem",
                  borderRadius: "999px",
                  border: "1px solid var(--line, #d8ddd6)",
                  fontSize: "0.92rem",
                  background: "var(--paper, #f8f7f1)",
                  outline: "none",
                  color: "var(--ink, #173a32)",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "var(--muted, #5c6e66)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--muted, #5c6e66)", fontWeight: "600" }}>
              Showing {filteredPosts.length} of {posts.length} articles
            </div>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--line, #d8ddd6)",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "750",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--muted, #5c6e66)",
                  marginRight: "0.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Tag size={12} /> Topics:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.35rem 0.85rem",
                    borderRadius: "999px",
                    fontSize: "0.82rem",
                    fontWeight: "600",
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    borderColor:
                      selectedCategory === cat
                        ? "var(--rust, #a64b32)"
                        : "var(--line, #d8ddd6)",
                    background:
                      selectedCategory === cat
                        ? "var(--rust, #a64b32)"
                        : "#ffffff",
                    color:
                      selectedCategory === cat ? "#ffffff" : "var(--ink, #173a32)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div
            style={{
              padding: "4rem 0",
              textAlign: "center",
              color: "var(--muted, #5c6e66)",
            }}
          >
            <Sparkles size={28} style={{ margin: "0 auto 0.75rem", opacity: 0.6 }} />
            <p style={{ fontSize: "1.05rem", fontWeight: "600" }}>Loading ministry articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              padding: "4rem 2rem",
              borderRadius: "14px",
              border: "1px solid var(--line, #d8ddd6)",
              textAlign: "center",
              color: "var(--muted, #5c6e66)",
            }}
          >
            <BookOpen size={36} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--ink, #173a32)", fontSize: "1.2rem" }}>
              No articles found
            </h3>
            <p style={{ margin: "0 0 1.5rem", fontSize: "0.92rem" }}>
              {searchQuery
                ? `No articles match the search term "${searchQuery}".`
                : "No articles are available in this category yet."}
            </p>
            {(searchQuery || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="button button-rust"
                style={{ minHeight: "38px", padding: "0 1.25rem" }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "2rem",
            }}
          >
            {filteredPosts.map((post) => {
              const postSlug = post.slug || post._id;
              const postUrl = `/blog/${postSlug}`;
              return (
                <article
                  key={post._id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--line, #d8ddd6)",
                    borderRadius: "14px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)";
                  }}
                >
                  <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Meta Top: Category & Reading Time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: "800",
                          textTransform: "uppercase",
                          letterSpacing: "0.8px",
                          color: "var(--rust, #a64b32)",
                          background: "rgba(166, 75, 50, 0.08)",
                          padding: "3px 10px",
                          borderRadius: "999px",
                        }}
                      >
                        {post.category || "Ministry"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--muted, #5c6e66)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Clock size={13} /> {calculateReadTime(post.content)}
                      </span>
                    </div>

                    {/* Post Title */}
                    <h2
                      style={{
                        margin: "0 0 0.85rem",
                        fontSize: "1.35rem",
                        fontWeight: "750",
                        lineHeight: "1.35",
                        color: "var(--ink, #173a32)",
                      }}
                    >
                      <Link
                        href={postUrl}
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p
                      style={{
                        margin: "0 0 1.5rem",
                        fontSize: "0.92rem",
                        lineHeight: "1.6",
                        color: "var(--muted, #5c6e66)",
                        flex: 1,
                      }}
                    >
                      {post.excerpt || post.content.slice(0, 150) + "..."}
                    </p>

                    {/* Post Meta & Actions Footer */}
                    <div
                      style={{
                        paddingTop: "1.25rem",
                        borderTop: "1px solid var(--line, #d8ddd6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: "auto",
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.8rem",
                          color: "var(--muted, #5c6e66)",
                        }}
                      >
                        <Calendar size={13} />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>

                      <Link
                        href={postUrl}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.85rem",
                          fontWeight: "750",
                          color: "var(--rust, #a64b32)",
                          textDecoration: "none",
                        }}
                      >
                        Read Article <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer Call to Action */}
        <div
          style={{
            marginTop: "4rem",
            background: "var(--ink, #173a32)",
            borderRadius: "16px",
            padding: "3rem 2rem",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <p
            className="eyebrow"
            style={{ color: "var(--gold, #c09a58)", marginBottom: "0.75rem" }}
          >
            Spiritual Enrichment
          </p>
          <h2
            style={{
              fontSize: "1.85rem",
              fontWeight: "750",
              margin: "0 0 1rem",
              color: "#ffffff",
            }}
          >
            Explore the Published Works of Ven. Victor Onosemuode
          </h2>
          <p
            style={{
              maxWidth: "600px",
              margin: "0 auto 1.75rem",
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#cbd5e1",
            }}
          >
            Deepen your walk with Christ through our collection of devotionals, hymnology books, and church administration manuals.
          </p>
          <Link
            href="/books"
            className="button button-gold"
            style={{ minHeight: "46px", padding: "0 1.75rem" }}
          >
            View Books Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </SectionPage>
  );
}