import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import SectionPage from "@/src/components/SectionPage";
import { referenceImages } from "@/src/data/reference-images";

const books = [
  { title: "The Handbook for Conducting Annual Vestry Meetings", note: "A practical handbook for church administration and annual vestry meetings.", tone: "book-green" },
  { title: "My Patmos", note: "A personal work among the five books written to nurture faith and Christian service.", tone: "book-ochre" },
  { title: "The Hymnfinder", note: "A resource for finding hymns and enriching congregational worship.", tone: "book-rust" },
  { title: "Youth and Children Hymnbook", note: "Hymns gathered to encourage young people and children in worship.", tone: "book-blue" },
  { title: "Historical Encounter of Some Hymn Writers", note: "Stories of hymn writers and the histories behind the songs of the church.", tone: "book-plum" },
];

export default function Resources() {
  return <SectionPage eyebrow="Books and resources" title="A small library for a life of worship." description="Five legacy books written to help ordained and lay Christians grow in worship, church administration, hymn singing, faith, and service.">
    <section className="content-section page-width"><div className="section-heading"><div><p className="eyebrow">The five legacy books</p><h2>Resources for the church.</h2></div><p>Used thoughtfully, these works can nurture God’s people in service and deepen understanding of worship.</p></div><div className="legacy-book-grid">{books.map((book, index) => <article className="legacy-book" key={book.title}><div className={`legacy-cover ${book.tone}`}><Image src={referenceImages.books[index]} alt={`Temporary reference book cover ${index + 1}; replace with the cover of ${book.title}`} fill sizes="(max-width: 760px) 55vw, 20vw" /><div className="legacy-cover-shade" /><BookOpen size={25} strokeWidth={1.4} aria-hidden="true" /><span>VEN. VICTOR AKPEVWEN ONOSEMUODE</span><strong>{book.title}</strong><i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i><small>Reference cover · replace</small></div><div className="legacy-book-copy"><p className="eyebrow">Legacy book {String(index + 1).padStart(2, "0")}</p><h2>{book.title}</h2><p>{book.note}</p></div></article>)}</div></section>
    <section className="closing-note"><div className="page-width"><p className="eyebrow">Book enquiries</p><h2>Ask about availability and ordering.</h2><Link className="button button-light" href="/contact">Contact Victor <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </SectionPage>;
}