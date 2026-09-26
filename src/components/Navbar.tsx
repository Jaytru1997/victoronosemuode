"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { referenceImages } from "@/src/data/reference-images";

const navLinks = [
  { name: "Biography", href: "/about" },
  { name: "Books", href: "/resources" },
  { name: "Services", href: "/services" },
    { name: "Ministry", href: "/twsc" },
    { name: "Legacy", href: "/blog" },
  { name: "Community", href: "/donate" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="page-width nav-inner">
        <Link href="/" className="brand" aria-label="Ven. Victor Akpevwen Onosemuode home" onClick={() => setIsOpen(false)}>
          <span className="brand-mark"><Image src={referenceImages.logo} alt="Temporary logo placeholder; replace with Victor’s mark" width={1000} height={390} /></span>
          <span className="brand-copy"><span className="brand-name">Victor Onosemuode</span><span className="brand-tagline">Anglican priest · Teacher · Author</span></span>
        </Link>
        <nav id="main-navigation" className={`nav-links${isOpen ? " nav-open" : ""}`} aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} aria-current={pathname === link.href ? "page" : undefined} className={`nav-link${pathname === link.href ? " nav-link-active" : ""}`}>
              {link.name}
            </Link>
          ))}
          <Link className="button nav-cta" href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
        </nav>
        <button type="button" className="menu-toggle" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isOpen} aria-controls="main-navigation">
          {isOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}