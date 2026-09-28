"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import SectionPage from "@/src/components/SectionPage";
import { useCart } from "@/src/context/CartContext";
import { useToast } from "@/src/context/ToastContext";

export interface BookItem {
  _id?: string;
  title: string;
  note: string;
  price: number;
  currency?: string;
  coverImage: string;
  tone?: string;
  category?: string;
  author?: string;
}

const fallbackBooks: BookItem[] = [
  {
    _id: "seed-1",
    title: "The Handbook for Conducting Annual Vestry Meetings",
    note: "A practical handbook for church administration, vestry procedures, and annual parish meetings.",
    tone: "book-green",
    coverImage: "/annual-vestry-meeting-poster.png",
    price: 3500,
    currency: "NGN",
    category: "Church Administration",
    author: "Ven. Victor A. Onosemuode JP",
  },
  {
    _id: "seed-2",
    title: "My Patmos",
    note: "God Speaks – A personal work among the five legacy books written to nurture faith and Christian devotion.",
    tone: "book-ochre",
    coverImage: "/my-patmos-poster.png",
    price: 4000,
    currency: "NGN",
    category: "Daily Devotional",
    author: "Ven. Victor A. Onosemuode JP",
  },
  {
    _id: "seed-3",
    title: "The Hymnfinder",
    note: "A comprehensive reference resource for discovering hymns and enriching congregational worship.",
    tone: "book-rust",
    coverImage: "/the-hymnfinder-poster.png",
    price: 5000,
    currency: "NGN",
    category: "Hymnology & Worship",
    author: "Ven. Victor A. Onosemuode JP",
  },
  {
    _id: "seed-4",
    title: "Youth and Children Hymn Book",
    note: "Containing hymns and spiritual songs for youth services, assemblies, conventions, and school devotions.",
    tone: "book-blue",
    coverImage: "/youth-children-hymn-book-poster.png",
    price: 3000,
    currency: "NGN",
    category: "Youth & School Ministry",
    author: "Ven. Victor A. Onosemuode JP",
  },
  {
    _id: "seed-5",
    title: "Historical Encounter of Some Hymn Writers",
    note: "Inspiring biographies of hymn writers and composers, accompanied by scriptures and historical context.",
    tone: "book-plum",
    coverImage: "/historical-encounter-poster.webp",
    price: 4500,
    currency: "NGN",
    category: "Hymn History & Biographies",
    author: "Ven. Victor A. Onosemuode JP",
  },
];

export default function Resources() {
  const [booksList, setBooksList] = useState<BookItem[]>(fallbackBooks);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart, formatPrice } = useCart();
  const { warning } = useToast();

  // Load books directly from MongoDB database
  useEffect(() => {
    async function loadBooksFromDb() {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) {
          throw new Error("The catalog could not be loaded.");
        }
        const data = await res.json();
        if (data.books && data.books.length > 0) {
          setBooksList(data.books);
        }
      } catch (err) {
        console.error("Failed to load books from database, using fallback", err);
        warning("The latest catalog could not be loaded, so we are showing the available collection.", {
          title: "Using available books",
        });
      }
    }
    loadBooksFromDb();
  }, [warning]);

  const handleAddToCart = (book: BookItem, index: number) => {
    const bookId = book._id || `book-${index}`;
    addToCart({
      id: bookId,
      title: book.title,
      price: book.price || 3500,
      currency: book.currency || "NGN",
      coverImage: book.coverImage || "/annual-vestry-meeting-poster.png",
    });

    setAddedId(bookId);
    setTimeout(() => {
      setAddedId(null);
    }, 1800);
  };

  return (
    <SectionPage
      eyebrow="Books and resources"
      title="A small library for a life of worship."
      description="Five legacy books written to help ordained and lay Christians grow in worship, church administration, hymn singing, faith, and service."
    >
      <section className="content-section page-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The five legacy books</p>
            <h2>Resources for the church.</h2>
          </div>
          <p>
            Read from our catalog. Add books directly to your cart to order copies for personal study, church parishes, or school groups.
          </p>
        </div>

        <div className="legacy-book-grid">
          {booksList.map((book, index) => {
            const currentId = book._id || `book-${index}`;
            const isAdded = addedId === currentId;

            return (
              <article className="legacy-book" key={book.title}>
                <div className={`legacy-cover ${book.tone || "book-green"}`}>
                  <Image
                    src={book.coverImage || fallbackBooks[index % fallbackBooks.length].coverImage}
                    alt={book.title}
                    fill
                    sizes="(max-width: 760px) 100vw, (max-width: 1020px) 45vw, 360px"
                    priority={index < 2}
                  />
                  <div className="legacy-cover-shade" />
                  <BookOpen size={20} strokeWidth={1.4} aria-hidden="true" />
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                </div>

                <div className="legacy-book-copy">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "8px" }}>
                    <p className="eyebrow" style={{ margin: 0 }}>
                      Legacy book {String(index + 1).padStart(2, "0")}
                    </p>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "750",
                        color: "var(--muted, #5c6e66)",
                        background: "rgba(23, 58, 50, 0.06)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {book.category || "Ministry"}
                    </span>
                  </div>

                  <h2>{book.title}</h2>
                  <p>{book.note}</p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.5rem",
                      margin: "0.5rem 0 0.2rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--rust, #a64b32)" }}>
                      {formatPrice(book.price || 3500, book.currency)}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted, #5c6e66)" }}>
                      · Mock Price
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "12px", marginTop: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(book, index)}
                      className="button button-rust"
                      style={{
                        minHeight: "42px",
                        padding: "0 18px",
                        fontSize: "11px",
                        letterSpacing: "0.5px",
                        gap: "8px",
                        background: isAdded ? "#16a34a" : undefined,
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} /> Add to Cart
                        </>
                      )}
                    </button>

                    <Link
                      className="text-link dark-link"
                      href="/contact"
                      style={{ fontSize: "11px" }}
                    >
                      Enquire <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="closing-note">
        <div className="page-width">
          <p className="eyebrow">Book enquiries</p>
          <h2>Ask about availability and ordering.</h2>
          <Link className="button button-light" href="/contact">
            Contact Victor <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SectionPage>
  );
}
