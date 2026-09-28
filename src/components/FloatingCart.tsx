"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/src/context/CartContext";

export default function FloatingCart() {
  const { totalItems, openCart } = useCart();
  const [isNavbarOutOfView, setIsNavbarOutOfView] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    moved: false,
  });

  // Track scroll position to only show when navbar is not on the viewpage
  useEffect(() => {
    const handleScroll = () => {
      // Navbar is sticky/at top with height ~82px
      const scrolled = window.scrollY > 95;
      setIsNavbarOutOfView(scrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize position at bottom right
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initX = Math.max(window.innerWidth - 76, 20);
      const initY = Math.max(window.innerHeight - 86, 20);
      setPosition({ x: initX, y: initY });
    }

    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const clampedX = Math.min(Math.max(prev.x, 15), window.innerWidth - 70);
        const clampedY = Math.min(Math.max(prev.y, 15), window.innerHeight - 70);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Pointer drag events for smooth mouse & touch dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position?.x || (window.innerWidth - 76),
      posY: position?.y || (window.innerHeight - 86),
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragStartRef.current.moved = true;
    }

    const newX = Math.min(Math.max(dragStartRef.current.posX + deltaX, 15), window.innerWidth - 70);
    const newY = Math.min(Math.max(dragStartRef.current.posY + deltaY, 15), window.innerHeight - 70);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // If user clicked without dragging, open cart
    if (!dragStartRef.current.moved) {
      openCart();
    }
  };

  // Only show if user has items in cart AND navbar is not on the viewpage
  if (totalItems === 0 || !isNavbarOutOfView || !position) {
    return null;
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="button"
      tabIndex={0}
      aria-label={`Floating cart with ${totalItems} items. Drag to move or tap to open.`}
      title="Cart · Drag to reposition or click to view"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9990,
        width: "58px",
        height: "58px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #a64b32 0%, #853a29 100%)",
        border: "2px solid #c09a58",
        boxShadow: "0 8px 24px rgba(166, 75, 50, 0.45), 0 3px 10px rgba(0, 0, 0, 0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        transform: isDragging ? "scale(1.08)" : "scale(1)",
        transition: isDragging ? "none" : "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <ShoppingBag size={24} strokeWidth={2.1} />
      <span
        style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          background: "#173a32",
          color: "#ffffff",
          border: "2px solid #ffffff",
          borderRadius: "999px",
          minWidth: "22px",
          height: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "800",
          padding: "0 4px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      >
        {totalItems}
      </span>
    </div>
  );
}
