"use client";

import Link from "next/link";
import Image from "next/image";
import { referenceImages } from "@/src/data/reference-images";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="Ven. Victor Akpevwen Onosemuode (Rtd.) home">
              <span className="brand-mark">
                <Image src={referenceImages.logo} alt="Ven. Victor Akpevwen Onosemuode (Rtd.) Logo" width={168} height={57} />
              </span>
              <span className="brand-copy">
                <span className="brand-tagline">Anglican priest · Teacher · Author</span>
              </span>
            </Link>
            <p>Ven. Victor Akpevwen Onosemuode JP (Rtd.). A life of Christian faith, teaching, ministry, and service to the community.</p>
          </div>
          <div>
            <h2 className="footer-heading">Explore</h2>
            <nav className="footer-links" aria-label="Footer navigation">
              <Link href="/about">Biography</Link>
              <Link href="/blog">Blog &amp; Articles</Link>
              <Link href="/books">Books</Link>
              <Link href="/events">Events</Link>
              <Link href="/services">Services</Link>
              <Link href="/ministry">Ministry</Link>
              <Link href="/legacy">Legacy</Link>
              <Link href="/calendar">Calendar</Link>
            </nav>
          </div>
          <div>
            <h2 className="footer-heading">Connect</h2>
            <div className="footer-links">
              <Link href="/contact">Contact Victor</Link>
              <a href="mailto:venonosemuode@gmail.com">Email</a>
              <a href="tel:+2348056204871">Call 0805 620 4871</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Ven. Victor Akpevwen Onosemuode (Rtd.)</span>
          <span>“Thus far the Lord has helped us.”</span>
        </div>
      </div>
    </footer>
  );
}