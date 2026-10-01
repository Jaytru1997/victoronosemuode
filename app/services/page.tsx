import Link from "next/link";
import { ArrowRight, BookOpen, Cross, HeartHandshake, Music2, Shirt } from "lucide-react";
import Image from "next/image";
import SectionPage from "@/src/components/SectionPage";
import { referenceImages } from "@/src/data/reference-images";

const services = [
  { title: "Decent Vestments Stores", description: "Bishop dresses, imported tower bells, cassocks, surplices, and church ornaments including chalices and pattens.", icon: Shirt, number: "01" },
  { title: "Christian books", description: "Sales of Christian books and worship resources, including Bibles and hymn books.", icon: BookOpen, number: "02" },
  { title: "Guidance and counselling", description: "Personal guidance and counselling, offered with concern for the good and welfare of others.", icon: HeartHandshake, number: "03" },
  { title: "Mentoring young priests", description: "Helping young priests become grounded in ministry, church administration, and faithful service.", icon: Cross, number: "04" },
  { title: "Worship and hymn resources", description: "Books and guidance that support church administration, hymn singing, and Christian worship.", icon: Music2, number: "05" },
];

export default function Services() {
  return <SectionPage eyebrow="Services" title="Practical care for church and community." description="From the resources used in worship to personal guidance and priestly mentorship, these services grow out of a lifetime of ministry.">
    <section className="content-section page-width"><div className="section-heading"><div><p className="eyebrow">How I can help</p><h2>Goods, guidance, and mentorship.</h2></div><p>For enquiries about items, counselling, or ministry support, please get in touch directly.</p></div><div className="ministry-service-grid">{services.map(({ title, description, icon: Icon, number }, index) => <article className="ministry-service" key={title}><div className="ministry-service-image"><Image src={referenceImages.serviceCards[index]} alt={title} fill sizes="(max-width: 760px) 100vw, 33vw" /></div><span className="service-number">{number}</span><Icon size={30} strokeWidth={1.4} aria-hidden="true" /><h2>{title}</h2><p>{description}</p></article>)}</div><div className="service-logo-placeholder"><Image src={referenceImages.consultingLogo} alt="Ven. Victor Akpevwen Onosemuode (Rtd.) Ministry Logo" width={340} height={116} /><span>Ven. Victor Akpevwen Onosemuode (Rtd.) Ministry</span></div></section>
    <section className="closing-note"><div className="page-width"><p className="eyebrow">For young priests</p><h2>Grounded ministry grows through guidance.</h2><p className="closing-copy">Victor also helps young priests become well grounded in ministry and faithful service.</p><Link className="button button-light" href="/contact">Make an enquiry <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </SectionPage>;
}