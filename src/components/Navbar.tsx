"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, ShoppingBag, UserCheck } from "lucide-react";
import Image from "next/image";
import { referenceImages } from "@/src/data/reference-images";
import { useCart } from "@/src/context/CartContext";
import { useAuth } from "@/src/context/AuthContext";
import CurrencySwitcher from "@/src/components/CurrencySwitcher";

const navLinks = [
  { name: "Biography", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Books", href: "/books" },
  { name: "Events", href: "/events" },
  { name: "Services", href: "/services" },
  { name: "Ministry", href: "/ministry" },
  { name: "Legacy", href: "/legacy" },
  { name: "Calendar", href: "/calendar" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();

  return (
    <header className="site-header">
      <div className="page-width nav-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Ven. Victor Akpevwen Onosemuode (Rtd.) home"
          onClick={() => setIsOpen(false)}
        >
          <span className="brand-mark">
            <Image
              src={referenceImages.logo}
              alt="Ven. Victor Akpevwen Onosemuode (Rtd.) Logo"
              width={155}
              height={52}
              style={{ objectFit: "contain", height: "40px", width: "auto" }}
              priority
            />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav id="main-navigation" className={`nav-links${isOpen ? " nav-open" : ""}`} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`nav-link${pathname === link.href ? " nav-link-active" : ""}`}
            >
              {link.name}
            </Link>
          ))}

          {/* User Email Identification & Portal */}
          {user ? (
            <Link
              className={`nav-link${pathname === "/dashboard" ? " nav-link-active" : ""}`}
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#166534",
                fontWeight: "750",
                background: "rgba(22, 101, 52, 0.08)",
                padding: "4px 9px",
                borderRadius: "999px",
                fontSize: "11px",
              }}
              title={`Logged in as ${user.email}`}
            >
              <UserCheck size={13} />
              <span
                style={{
                  maxWidth: "110px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.email.split("@")[0]}
              </span>
            </Link>
          ) : (
            <Link
              className={`nav-link${pathname === "/login" || pathname === "/dashboard" ? " nav-link-active" : ""}`}
              href="/login"
              onClick={() => setIsOpen(false)}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
            >
              <LogIn size={14} /> Portal
            </Link>
          )}

          {/* Desktop Cart Button - Icon only, no 'CART' text */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openCart();
            }}
            className="nav-link"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              color: "var(--ink, #173a32)",
            }}
            aria-label={`Open cart with ${totalItems} items`}
            title={`Cart (${totalItems} items)`}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "-4px",
                  background: "var(--rust, #a64b32)",
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: "800",
                  padding: "1px 5px",
                  borderRadius: "10px",
                  lineHeight: "1.2",
                  minWidth: "15px",
                  textAlign: "center",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {/* Desktop-only Currency Switcher (Single instance on web view) */}
          <div className="desktop-currency-switcher" style={{ display: "inline-flex", alignItems: "center" }}>
            <CurrencySwitcher />
          </div>

          <Link className="button nav-cta" href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
        </nav>

        {/* Mobile-only Header Controls: (Hidden on desktop via .mobile-header-controls) */}
        <div className="mobile-header-controls">
          <CurrencySwitcher />

          {/* Mobile Cart Button - Icon only */}
          <button
            type="button"
            onClick={openCart}
            className="mobile-header-cart"
            style={{ position: "relative" }}
            aria-label={`Open cart with ${totalItems} items`}
            title={`Cart (${totalItems} items)`}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "var(--rust, #a64b32)",
                  color: "#ffffff",
                  fontSize: "9px",
                  fontWeight: "800",
                  padding: "1px 5px",
                  borderRadius: "10px",
                  lineHeight: "1.2",
                  minWidth: "15px",
                  textAlign: "center",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="main-navigation"
          >
            {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}