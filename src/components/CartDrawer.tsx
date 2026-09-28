"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/src/context/CartContext";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalAmount,
    formatPrice,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form" | "success">("cart");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryAddress: address,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process order.");
      }

      setOrderInfo({ orderNumber: data.orderNumber });
      setCheckoutStep("success");
      clearCart();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred during checkout.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (checkoutStep === "success") {
      setCheckoutStep("cart");
    }
    closeCart();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 37, 31, 0.6)",
          backdropFilter: "blur(4px)",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          background: "var(--paper, #f8f7f1)",
          boxShadow: "-8px 0 35px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--line, #d8ddd6)",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShoppingBag size={20} color="var(--rust, #a64b32)" />
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "Georgia, serif", color: "var(--ink, #173a32)" }}>
              {checkoutStep === "success" ? "Order Confirmed" : checkoutStep === "form" ? "Book Order Details" : "Your Book Cart"}
            </h2>
            {checkoutStep === "cart" && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "750",
                  padding: "0.15rem 0.55rem",
                  borderRadius: "12px",
                  background: "rgba(166, 75, 50, 0.12)",
                  color: "var(--rust, #a64b32)",
                }}
              >
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--muted, #5c6e66)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          {checkoutStep === "cart" && (
            <>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted, #5c6e66)" }}>
                  <ShoppingBag size={52} strokeWidth={1.2} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--ink, #173a32)" }}>
                    Your cart is currently empty
                  </p>
                  <p style={{ fontSize: "0.9rem", maxWidth: "280px", margin: "0 auto 1.5rem" }}>
                    Select books from our library to add them to your order.
                  </p>
                  <button
                    onClick={handleClose}
                    className="button button-rust"
                    style={{ fontSize: "0.85rem", padding: "0 1.25rem", minHeight: "42px" }}
                  >
                    Browse Books
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "72px 1fr auto",
                        gap: "1rem",
                        alignItems: "center",
                        padding: "1rem",
                        background: "#ffffff",
                        border: "1px solid var(--line, #d8ddd6)",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(23, 58, 50, 0.04)",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "72px",
                          height: "92px",
                          background: "radial-gradient(circle, #f4f2eb 0%, #ebe7dc 100%)",
                          borderRadius: "6px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          src={item.coverImage}
                          alt={item.title}
                          fill
                          sizes="80px"
                          style={{ objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))" }}
                        />
                      </div>
                      <div>
                        <h4
                          style={{
                            margin: "0 0 0.3rem",
                            fontSize: "0.95rem",
                            fontFamily: "Georgia, serif",
                            lineHeight: "1.25",
                            color: "var(--ink, #173a32)",
                          }}
                        >
                          {item.title}
                        </h4>
                        <div style={{ color: "var(--rust, #a64b32)", fontWeight: "750", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                          {formatPrice(item.price, item.currency)}
                        </div>
                        {/* Quantity Controls */}
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "var(--paper, #f8f7f1)", borderRadius: "6px", padding: "2px 6px", border: "1px solid var(--line, #d8ddd6)" }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: "2px" }}
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ fontSize: "0.85rem", fontWeight: "700", minWidth: "20px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex", padding: "2px" }}
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "6px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        title="Remove book from cart"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === "form" && (
            <form onSubmit={handleCheckoutSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid var(--line, #d8ddd6)", fontSize: "0.88rem", color: "var(--muted, #5c6e66)" }}>
                Purchasing <strong>{totalItems} {totalItems === 1 ? "book" : "books"}</strong> for total{" "}
                <strong style={{ color: "var(--rust, #a64b32)" }}>{formatPrice(totalAmount)}</strong>.
              </div>

              {errorMessage && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.88rem" }}>
                  {errorMessage}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bro. David Osagie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Phone Number (WhatsApp preferred)
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Delivery Address / Church Parish
                </label>
                <textarea
                  rows={2}
                  placeholder="State, City, Parish or mailing address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Special Note or Inscription Request
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please sign with dedication to St. Paul's Youth"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "0.7rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--line, #d8ddd6)",
                    background: "#ffffff",
                    color: "var(--muted, #5c6e66)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-rust"
                  style={{ flex: 1, minHeight: "46px", justifyContent: "center" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order · {formatPrice(totalAmount)}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {checkoutStep === "success" && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 1.25rem",
                  color: "#16a34a",
                }}
              >
                <CheckCircle2 size={34} />
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.45rem", margin: "0 0 0.5rem", color: "var(--ink, #173a32)" }}>
                Order Received!
              </h3>
              {orderInfo?.orderNumber && (
                <div style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 12px", borderRadius: "4px", fontWeight: "750", fontSize: "0.9rem", color: "#334155", margin: "0.5rem 0 1rem" }}>
                  Ref: {orderInfo.orderNumber}
                </div>
              )}
              <p style={{ color: "var(--muted, #5c6e66)", fontSize: "0.95rem", lineHeight: "1.6", maxWidth: "340px", margin: "0 auto 1.5rem" }}>
                Thank you for your order! Your request has been logged in our system. The ministry office will contact you for payment verification and delivery.
              </p>
              <button
                onClick={handleClose}
                className="button button-rust"
                style={{ padding: "0 1.5rem", minHeight: "44px" }}
              >
                Continue Browsing
              </button>
            </div>
          )}
        </div>

        {/* Footer actions for Cart View */}
        {checkoutStep === "cart" && items.length > 0 && (
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--line, #d8ddd6)",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.95rem", color: "var(--muted, #5c6e66)" }}>Subtotal ({totalItems} items):</span>
              <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--ink, #173a32)" }}>
                {formatPrice(totalAmount)}
              </span>
            </div>
            <button
              onClick={() => setCheckoutStep("form")}
              className="button button-rust"
              style={{ width: "100%", justifyContent: "center", minHeight: "48px", fontSize: "0.9rem" }}
            >
              Proceed to Purchase <ArrowRight size={16} />
            </button>
            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8" }}>
              Direct order fulfilment · Delivery coordinated across Nigeria &amp; International
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
