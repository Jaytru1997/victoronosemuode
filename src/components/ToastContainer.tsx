"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast, ToastItem } from "@/src/context/ToastContext";

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration <= 0) return;

    const intervalTime = 50;
    const totalSteps = toast.duration / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= decrement) {
            clearInterval(timer);
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 240);
            return 0;
          }
          return prev - decrement;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, isPaused, onDismiss]);

  const handleManualDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 240);
  };

  const config = {
    success: {
      icon: <CheckCircle2 size={19} color="#15803d" />,
      borderColor: "#86efac",
      bgColor: "#ffffff",
      accentBg: "#f0fdf4",
      progressColor: "#22c55e",
      titleColor: "#14532d",
    },
    error: {
      icon: <AlertCircle size={19} color="#b91c1c" />,
      borderColor: "#fca5a5",
      bgColor: "#ffffff",
      accentBg: "#fef2f2",
      progressColor: "#ef4444",
      titleColor: "#7f1d1d",
    },
    warning: {
      icon: <AlertTriangle size={19} color="#b45309" />,
      borderColor: "#fde68a",
      bgColor: "#ffffff",
      accentBg: "#fffbeb",
      progressColor: "#f59e0b",
      titleColor: "#78350f",
    },
    info: {
      icon: <Info size={19} color="#1e3a8a" />,
      borderColor: "#bfdbfe",
      bgColor: "#ffffff",
      accentBg: "#eff6ff",
      progressColor: "#3b82f6",
      titleColor: "#1e3a8a",
    },
  }[toast.type];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        maxWidth: "380px",
        background: config.bgColor,
        borderRadius: "12px",
        border: `1px solid ${config.borderColor}`,
        boxShadow: "0 10px 25px -5px rgba(23, 58, 50, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? "translateX(20px) scale(0.96)" : "translateX(0) scale(1)",
        transition: "opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "auto",
      }}
      role="alert"
    >
      {/* Icon Pill */}
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: config.accentBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {config.icon}
      </div>

      {/* Text Message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <h4
            style={{
              margin: "0 0 2px",
              fontSize: "0.88rem",
              fontWeight: "750",
              color: config.titleColor,
              letterSpacing: "-0.2px",
            }}
          >
            {toast.title}
          </h4>
        )}
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "#334155",
            lineHeight: "1.45",
            wordBreak: "break-word",
          }}
        >
          {toast.message}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleManualDismiss}
        style={{
          background: "transparent",
          border: "none",
          padding: "4px",
          cursor: "pointer",
          color: "#94a3b8",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#334155")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>

      {/* Auto-dismiss progress bar */}
      {toast.duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "rgba(0, 0, 0, 0.04)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: config.progressColor,
              transition: isPaused ? "none" : "width 50ms linear",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 100000,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
        width: "calc(100% - 48px)",
        maxWidth: "380px",
      }}
      className="site-toast-container"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
