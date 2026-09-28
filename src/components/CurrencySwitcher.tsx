"use client";

import { useCurrency, SupportedCurrency } from "@/src/context/CurrencyContext";

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(23, 58, 50, 0.06)",
        borderRadius: "999px",
        padding: "2px",
        border: "1px solid var(--line, #d8ddd6)",
      }}
      role="group"
      aria-label="Currency selection"
    >
      <button
        type="button"
        onClick={() => setCurrency("NGN")}
        aria-pressed={currency === "NGN"}
        style={{
          background: currency === "NGN" ? "#173a32" : "transparent",
          color: currency === "NGN" ? "#ffffff" : "var(--muted, #5c6e66)",
          border: "none",
          borderRadius: "999px",
          padding: "3px 8px",
          fontSize: "11px",
          fontWeight: "750",
          cursor: "pointer",
          letterSpacing: "0.03em",
          transition: "all 0.15s ease",
        }}
      >
        ₦ NGN
      </button>
      <button
        type="button"
        onClick={() => setCurrency("USD")}
        aria-pressed={currency === "USD"}
        style={{
          background: currency === "USD" ? "#173a32" : "transparent",
          color: currency === "USD" ? "#ffffff" : "var(--muted, #5c6e66)",
          border: "none",
          borderRadius: "999px",
          padding: "3px 8px",
          fontSize: "11px",
          fontWeight: "750",
          cursor: "pointer",
          letterSpacing: "0.03em",
          transition: "all 0.15s ease",
        }}
      >
        $ USD
      </button>
    </div>
  );
}
