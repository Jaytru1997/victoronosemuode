"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { referenceImages } from "@/src/data/reference-images";
import { useCart } from "@/src/context/CartContext";

const navLinks = [
  { name: "Biography", href: "/about" },
  { name: "Books", href: "/books" },
  { name: "Services", href: "/services" },
  { name: "Ministry", href: "/ministry" },
  { name: "Legacy", href: "/legacy" },
  { name: "Community", href: "/community" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  return (
    <header className="site-header">
      <div className="page-width nav-inner">
        <Link href="/" className="brand" aria-label="Ven. Victor Akpevwen Onosemuode home" onClick={() => setIsOpen(false)}>
          <span className="brand-mark">
            <Image
              src={referenceImages.logo}
              alt="Ven. Victor Akpevwen Onosemuode Logo"
              width={168}
              height={57}
              priority
            />
          </span>
          {/*<span className="brand-copy">
            <span className="brand-tagline">Anglican priest · Teacher · Author</span>
          </span>*/}
        </Link>
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
          <Link
            className={`nav-link${pathname === "/login" || pathname === "/dashboard" ? " nav-link-active" : ""}`}
            href="/login"
            onClick={() => setIsOpen(false)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
          >
            <LogIn size={15} /> Portal
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openCart();
            }}
            className="nav-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
              fontWeight: "inherit",
            }}
            aria-label={`Open cart with ${totalItems} items`}
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span
                style={{
                  background: "var(--rust, #a64b32)",
                  color: "#ffffff",
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "1px 6px",
                  borderRadius: "10px",
                  lineHeight: "1.3",
                }}
              >
                {totalItems}
              </span>
            )}
          </button>
          <Link className="button nav-cta" href="/contact" onClick={() => setIsOpen(false)}>
            Contact
          </Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            onClick={openCart}
            className="mobile-header-cart"
            aria-label={`Open cart with ${totalItems} items`}
          >
            <ShoppingBag size={17} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="cart-badge">
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