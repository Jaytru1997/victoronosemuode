"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Building,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import { useCurrency } from "@/src/context/CurrencyContext";
import { useToast } from "@/src/context/ToastContext";

type CheckoutStep = "cart" | "address" | "payment" | "success";

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
  } = useCart();
  const { user } = useAuth();
  const { formatPrice, currency } = useCurrency();
  const { success, error } = useToast();

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-generate reference for this checkout session
  const [pendingRef, setPendingRef] = useState<string>("");

  useEffect(() => {
    if (isCartOpen && !pendingRef) {
      setPendingRef(`VO-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [isCartOpen, pendingRef]);

  // Form states - Customer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Subdivided 5-part Delivery Address
  const [country, setCountry] = useState("Nigeria");
  const [stateAddress, setStateAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");

  // Payment Sender Details
  const [senderDetails, setSenderDetails] = useState("");

  // Auto-fill user email if logged in
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  if (!isCartOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please enter your name and email address.");
      return;
    }

    if (!street.trim() || !city.trim() || !stateAddress.trim()) {
      setErrorMessage("Please complete your delivery address (Country, State, City, and Street Address).");
      return;
    }

    setCheckoutStep("payment");
  };

  const handleConfirmPaymentSent = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: pendingRef,
          items,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryAddress: {
            country: country.trim(),
            state: stateAddress.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            street: street.trim(),
          },
          notes,
          currency,
          senderDetails: senderDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process payment confirmation.");
      }

      setOrderInfo({ orderNumber: data.orderNumber || pendingRef });
      setCheckoutStep("success");
      clearCart();
      success(
        "Your payment has been logged and sent to the admin pending list for verification.",
        {
          title: `Payment Sent (Ref: ${data.orderNumber || pendingRef})`,
          duration: 6000,
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while confirming payment.";
      setErrorMessage(msg);
      error(msg, { title: "Could not submit payment" });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleClose = () => {
    if (checkoutStep === "success") {
      setCheckoutStep("cart");
      setPendingRef("");
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
          background: "rgba(15, 37, 31, 0.65)",
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
          maxWidth: "500px",
          height: "100%",
          background: "var(--paper, #f8f7f1)",
          boxShadow: "-8px 0 35px rgba(0, 0, 0, 0.28)",
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
            <h2
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontFamily: "Georgia, serif",
                color: "var(--ink, #173a32)",
              }}
            >
              {checkoutStep === "success"
                ? "Payment Submitted"
                : checkoutStep === "payment"
                  ? "Bank Transfer Payment"
                  : checkoutStep === "address"
                    ? "Delivery & Order Details"
                    : "Your Book Cart"}
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
          {/* STEP 1: CART ITEMS */}
          {checkoutStep === "cart" && (
            <>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted, #5c6e66)" }}>
                  <ShoppingBag size={52} strokeWidth={1.2} style={{ margin: "0 auto 1rem", opacity: 0.35 }} />
                  <p style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", color: "var(--ink, #173a32)" }}>
                    Your cart is currently empty
                  </p>
                  <p style={{ fontSize: "0.9rem", maxWidth: "280px", margin: "0 auto 1.5rem" }}>
                    Select books from Ven. Victor Onosemuode (Rtd.)&apos;s publications to order.
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
                          {formatPrice(item.price)}
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

          {/* STEP 2: CUSTOMER DETAILS & 5-PART SUBDIVIDED ADDRESS */}
          {checkoutStep === "address" && (
            <form onSubmit={handleProceedToPayment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--line, #d8ddd6)",
                  fontSize: "0.88rem",
                  color: "var(--muted, #5c6e66)",
                }}
              >
                Ordering <strong>{totalItems} {totalItems === 1 ? "book" : "books"}</strong> for total{" "}
                <strong style={{ color: "var(--rust, #a64b32)" }}>{formatPrice(totalAmount)}</strong>.
              </div>

              {errorMessage && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.88rem" }}>
                  {errorMessage}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bro. David Osagie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                    Phone (WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                  />
                </div>
              </div>

              {/* Subdivided Delivery Address Header */}
              <div style={{ borderTop: "1px solid var(--line, #d8ddd6)", paddingTop: "0.85rem", marginTop: "0.25rem" }}>
                <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.92rem", fontWeight: "750", color: "var(--ink, #173a32)" }}>
                  Delivery Address Details (5 Subdivisions)
                </h4>

                {/* (i) Country */}
                <div style={{ marginBottom: "0.65rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem", background: "#ffffff" }}
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Ghana">Ghana</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* (ii) State & (iii) City */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.65rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delta State"
                      value={stateAddress}
                      onChange={(e) => setStateAddress(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ughelli / Warri"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                    />
                  </div>
                </div>

                {/* (iv) Postal / ZIP Code */}
                <div style={{ marginBottom: "0.65rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 330101 (Optional for Nigeria)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                  />
                </div>

                {/* (v) Street Address */}
                <div style={{ marginBottom: "0.65rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>
                    Street Address &amp; House Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Mission Road, Beside St. Barnabas Church"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Special Note or Dedication Inscription (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please dedicate to St. Peter's Anglican Youth"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="button button-rust"
                  style={{ flex: 1, minHeight: "46px", justifyContent: "center" }}
                >
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: BANK TRANSFER PAYMENT DISPLAY */}
          {checkoutStep === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "1.2rem",
                  borderRadius: "10px",
                  border: "1px solid var(--line, #d8ddd6)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--muted, #5c6e66)" }}>Total Amount to Pay:</span>
                  <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--rust, #a64b32)" }}>
                    {formatPrice(totalAmount)}
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  For <strong>{totalItems} books</strong> · Recipient: {name} ({email})
                </div>
              </div>

              {errorMessage && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.88rem" }}>
                  {errorMessage}
                </div>
              )}

              {/* Official Bank Account Box */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #86efac",
                  borderRadius: "10px",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "#166534" }}>
                  <Building size={20} />
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "750" }}>
                    Official Ministry Transfer Details
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ background: "#ffffff", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                      Bank Name
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a" }}>
                      Zenith Bank PLC
                    </div>
                  </div>

                  <div style={{ background: "#ffffff", padding: "0.75rem 0.9rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                      Account Name
                    </div>
                    <div style={{ fontSize: "0.98rem", fontWeight: "700", color: "#0f172a" }}>
                      Ven. Dr. Victor A. Onosemuode (Rtd.)
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                        Account Number
                      </div>
                      <div style={{ fontSize: "1.25rem", fontWeight: "850", color: "#166534", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                        1014892014
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("1014892014", "acc")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: copiedField === "acc" ? "#166534" : "#f8fafc",
                        color: copiedField === "acc" ? "#ffffff" : "#334155",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {copiedField === "acc" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedField === "acc" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "0.75rem 0.9rem",
                      borderRadius: "8px",
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                        Order Narration / Reference
                      </div>
                      <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--rust, #a64b32)", letterSpacing: "0.04em", fontFamily: "monospace" }}>
                        {pendingRef}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pendingRef, "ref")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.45rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        background: copiedField === "ref" ? "#166534" : "#f8fafc",
                        color: copiedField === "ref" ? "#ffffff" : "#334155",
                        fontSize: "0.78rem",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {copiedField === "ref" ? <Check size={14} /> : <Copy size={14} />}
                      {copiedField === "ref" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sender Details Input */}
              <div style={{ background: "#ffffff", padding: "1rem", borderRadius: "8px", border: "1px solid var(--line, #d8ddd6)" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "0.3rem" }}>
                  Sender Bank / Account Name (Optional but recommended)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transferred from GTBank - David Osagie"
                  value={senderDetails}
                  onChange={(e) => setSenderDetails(e.target.value)}
                  style={{ width: "100%", padding: "0.65rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.92rem" }}
                />
                <small style={{ color: "#64748b", fontSize: "0.75rem", display: "block", marginTop: "0.35rem" }}>
                  Helps our accountant quickly verify and approve your transfer.
                </small>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setCheckoutStep("address")}
                  disabled={submitting}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--line, #d8ddd6)",
                    background: "#ffffff",
                    color: "var(--muted, #5c6e66)",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPaymentSent}
                  disabled={submitting}
                  className="button button-rust"
                  style={{ flex: 1, minHeight: "48px", justifyContent: "center", fontWeight: "750" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Submitting Payment...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} /> I Have Sent the Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS VIEW */}
          {checkoutStep === "success" && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 1.25rem",
                  color: "#16a34a",
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.45rem", margin: "0 0 0.5rem", color: "var(--ink, #173a32)" }}>
                Payment Submitted!
              </h3>
              {orderInfo?.orderNumber && (
                <div style={{ display: "inline-block", background: "#f1f5f9", padding: "6px 14px", borderRadius: "6px", fontWeight: "800", fontSize: "0.95rem", color: "var(--rust, #a64b32)", margin: "0.5rem 0 1rem", letterSpacing: "0.05em" }}>
                  Ref: {orderInfo.orderNumber}
                </div>
              )}
              <p style={{ color: "var(--muted, #5c6e66)", fontSize: "0.92rem", lineHeight: "1.6", maxWidth: "360px", margin: "0 auto 1.5rem" }}>
                Thank you! Your payment notice has been added to our pending list. Our administration will confirm the transfer and unlock your books in your Member Dashboard under <strong>Purchased Books &amp; Resources</strong>.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "280px", margin: "0 auto" }}>
                <Link
                  href="/dashboard"
                  onClick={handleClose}
                  className="button button-rust"
                  style={{ width: "100%", justifyContent: "center", minHeight: "44px" }}
                >
                  View in Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid var(--line, #d8ddd6)",
                    background: "transparent",
                    color: "var(--muted, #5c6e66)",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Continue Browsing
                </button>
              </div>
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
              onClick={() => setCheckoutStep("address")}
              className="button button-rust"
              style={{ width: "100%", justifyContent: "center", minHeight: "48px", fontSize: "0.9rem" }}
            >
              Proceed to Delivery Details <ArrowRight size={16} />
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
