"use client";

import React, { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url?: string;
  excerpt?: string;
}

export default function ShareButtons({ title, url, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fallback to window.location.href if url is not provided
  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showNotice("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showNotice("Could not copy link automatically. Please copy the URL from your address bar.");
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: excerpt || title,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleFacebook = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const handleWhatsApp = () => {
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(`*${title}*\n\nRead more here: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleTwitterX = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`${title} — Ven. Victor Onosemuode:`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  };

  const handleInstagram = () => {
    handleCopyLink();
    showNotice("Link copied! Open Instagram to paste into your Story, Bio, or DM.");
  };

  const handleTikTok = () => {
    handleCopyLink();
    showNotice("Link copied! Open TikTok to share in your video caption, bio, or message.");
  };

  return (
    <div className="share-widget" style={{ margin: "2rem 0" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.6rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--muted, #5c6e66)",
            marginRight: "0.25rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Share2 size={14} /> Share:
        </span>

        {/* Facebook */}
        <button
          type="button"
          onClick={handleFacebook}
          className="share-btn share-btn-facebook"
          title="Share to Facebook"
          aria-label="Share to Facebook"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={handleWhatsApp}
          className="share-btn share-btn-whatsapp"
          title="Share to WhatsApp"
          aria-label="Share to WhatsApp"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.979-.276-.101-.476-.15-.676.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.076-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.235-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.802.376-.276.3-1.053 1.028-1.053 2.507s1.078 2.908 1.229 3.109c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.229 1.377.197 1.895.12.577-.087 1.78-.727 2.031-1.429.251-.702.251-1.303.176-1.429-.076-.126-.276-.201-.577-.351z" />
            <path d="M12.004 0C5.385 0 .018 5.367.018 11.986c0 2.112.551 4.174 1.598 5.99L.073 24l6.196-1.492c1.761.96 3.75 1.466 5.735 1.466 6.618 0 11.985-5.367 11.985-11.988S18.622 0 12.004 0zm0 21.844c-1.79 0-3.545-.482-5.074-1.393l-.364-.216-3.771.908.925-3.676-.237-.377A9.824 9.824 0 0 1 2.158 11.986c0-5.428 4.417-9.845 9.846-9.845 5.429 0 9.846 4.417 9.846 9.845 0 5.429-4.417 9.858-9.846 9.858z" />
          </svg>
          <span>WhatsApp</span>
        </button>

        {/* X / Twitter */}
        <button
          type="button"
          onClick={handleTwitterX}
          className="share-btn share-btn-x"
          title="Share to X (Twitter)"
          aria-label="Share to X"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X</span>
        </button>

        {/* Instagram */}
        <button
          type="button"
          onClick={handleInstagram}
          className="share-btn share-btn-instagram"
          title="Share on Instagram (copies link)"
          aria-label="Share on Instagram"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>Instagram</span>
        </button>

        {/* TikTok */}
        <button
          type="button"
          onClick={handleTikTok}
          className="share-btn share-btn-tiktok"
          title="Share on TikTok (copies link)"
          aria-label="Share on TikTok"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
          <span>TikTok</span>
        </button>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="share-btn share-btn-copy"
          title="Copy direct link"
          aria-label="Copy direct link"
        >
          {copied ? <Check size={14} style={{ color: "#166534" }} /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {/* Mobile Native Share button */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="share-btn share-btn-native"
          title="More sharing options"
          aria-label="More sharing options"
        >
          <Share2 size={14} />
          <span>More</span>
        </button>
      </div>

      {notification && (
        <div
          role="status"
          style={{
            marginTop: "0.75rem",
            padding: "0.55rem 0.9rem",
            background: "rgba(23, 58, 50, 0.08)",
            color: "var(--ink, #173a32)",
            borderRadius: "8px",
            fontSize: "0.82rem",
            fontWeight: "600",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            border: "1px solid rgba(23, 58, 50, 0.15)",
          }}
        >
          <Check size={14} style={{ color: "#166534" }} />
          {notification}
        </div>
      )}

      <style jsx>{`
        .share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--ink, #173a32);
          background: #ffffff;
          border: 1px solid var(--line, #d8ddd6);
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .share-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }
        .share-btn-facebook:hover {
          background: #1877f2;
          color: #ffffff;
          border-color: #1877f2;
        }
        .share-btn-whatsapp:hover {
          background: #25d366;
          color: #ffffff;
          border-color: #25d366;
        }
        .share-btn-x:hover {
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        }
        .share-btn-instagram:hover {
          background: #e4405f;
          color: #ffffff;
          border-color: #e4405f;
        }
        .share-btn-tiktok:hover {
          background: #000000;
          color: #ffffff;
          border-color: #000000;
        }
        .share-btn-copy:hover {
          background: var(--ink, #173a32);
          color: #ffffff;
          border-color: var(--ink, #173a32);
        }
        .share-btn-native {
          display: none;
        }
        @media (max-width: 640px) {
          .share-btn-native {
            display: inline-flex;
          }
        }
      `}</style>
    </div>
  );
}
