import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Cross, HeartHandshake, Shirt } from "lucide-react";
import { referenceImages } from "@/src/data/reference-images";

export default function Home() {
  return (
    <>
      <section className="hero">
        <Image src={referenceImages.hero} alt="Ven. Victor Akpevwen Onosemuode (Rtd.)" fill sizes="100vw" className="hero-image" priority />
        <div className="hero-shade" />
        <div className="hero-pattern" aria-hidden="true"><span>VO</span></div>
        <div className="hero-content page-width">
          <p className="eyebrow hero-eyebrow">Priest · Teacher · Author · Mentor</p>
          <h1>Ven. Victor Akpevwen <em>Onosemuode (Rtd.)</em></h1>
          <p className="hero-copy">A life of faith and service, devoted to strengthening Christian worship, nurturing young people, and grounding the next generation of priests.</p>
          <div className="hero-actions"><Link className="button button-rust" href="/about">Read my story <ArrowRight size={17} aria-hidden="true" /></Link><Link className="text-link light-link" href="/books">Explore the books <ArrowDownRight size={17} aria-hidden="true" /></Link></div>
        </div>
        <p className="hero-caption">“Thus far the Lord has helped us.”</p>
      </section>

      <section className="intro section-pad">
        <div className="intro-copy"><p className="eyebrow">A life of service</p><h2>Rooted in faith.<br /><em>Given to the work.</em></h2><p>I am the sixth and last child of Lay Reader Peter and Deborah Onosemuode. Raised in the Anglican faith in Arhavwarien, I grew through teaching, ordained ministry, and a lifelong commitment to serving people.</p><p>My five legacy books are written to support Christian worship, church administration, hymn singing, and the service of God’s people.</p><Link className="text-link dark-link" href="/about">Read the full biography <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        <div className="quote-feature"><Image src={referenceImages.portrait} alt="Ven. Victor Akpevwen Onosemuode (Rtd.)" fill sizes="(max-width: 760px) 100vw, 42vw" className="quote-photo" /><div className="quote-photo-shade" /><span className="quote-mark" aria-hidden="true">“</span><p>What I am today is the impact of God&apos;s love and the faith my parents taught us.</p><span className="quote-attribution">Ven. Victor Akpevwen Onosemuode (Rtd.)</span></div>
      </section>

      <section className="weekly-band"><Image src={referenceImages.institute} alt="Ven. Victor Akpevwen Onosemuode in priestly robes" fill sizes="100vw" className="weekly-band-image" /><div className="page-width weekly-inner"><div><p className="eyebrow">The calling</p><h2>Teaching, ministry, and the care of people.</h2></div><p>From the classroom to the parish, a life spent helping others learn, worship, and find their footing.</p><Link className="button button-light" href="/ministry">Explore the journey <ArrowRight size={17} aria-hidden="true" /></Link></div></section>

      <section className="journal section-pad page-width"><div className="book-stack" aria-label="Ven. Victor Onosemuode legacy books"><Image src={referenceImages.journal} alt="Five books by Ven. Victor Akpevwen Onosemuode" fill sizes="(max-width: 760px) 80vw, 32vw" className="journal-placeholder-image" /><div className="book-stack-copy"><BookOpen size={38} strokeWidth={1.2} aria-hidden="true" /><span>Five books</span><strong>Faith<br />in practice.</strong></div><i aria-hidden="true" /></div><div className="journal-copy"><p className="eyebrow">Books for the church</p><h2>Resources to strengthen worship and service.</h2><p>Practical guides and hymn resources for ordained and lay Christians, created to nurture faith, love, and a deeper understanding of worship.</p><Link className="button button-rust" href="/books">Meet the five books <ArrowUpRight size={17} aria-hidden="true" /></Link></div><span className="journal-index">A lifetime of learning</span></section>

      <section className="initiatives section-pad"><div className="page-width"><div className="section-heading"><div><p className="eyebrow">Ways I serve</p><h2>Faith put into practice.</h2></div><p>Practical support for church life, personal guidance, and those preparing for ministry.</p></div><div className="home-services">
        <article className="home-service"><div className="home-service-image"><Image src={referenceImages.serviceCards[0]} alt="Decent Vestments Stores" fill sizes="(max-width: 760px) 100vw, 33vw" /></div><Shirt size={28} strokeWidth={1.4} aria-hidden="true" /><span className="service-number">01 · PROVISION</span><h3>Decent Vestments Stores</h3><p>Bishop dresses, imported tower bells, cassocks, surplices, chalices, pattens, Bibles, and hymn books.</p><Link className="text-link dark-link" href="/services">View services <ArrowUpRight size={16} aria-hidden="true" /></Link></article>
        <article className="home-service"><div className="home-service-image"><Image src={referenceImages.serviceCards[1]} alt="Guidance & counselling" fill sizes="(max-width: 760px) 100vw, 33vw" /></div><HeartHandshake size={28} strokeWidth={1.4} aria-hidden="true" /><span className="service-number">02 · GUIDANCE</span><h3>Guidance &amp; counselling</h3><p>A listening ear and thoughtful counsel, offered with care for the welfare and dignity of each person.</p><Link className="text-link dark-link" href="/services">Learn more <ArrowUpRight size={16} aria-hidden="true" /></Link></article>
        <article className="home-service"><div className="home-service-image"><Image src={referenceImages.serviceCards[2]} alt="Supporting young priests" fill sizes="(max-width: 760px) 100vw, 33vw" /></div><Cross size={28} strokeWidth={1.4} aria-hidden="true" /><span className="service-number">03 · MENTORSHIP</span><h3>Supporting young priests</h3><p>Helping young priests become grounded in ministry, church administration, and faithful service.</p><Link className="text-link dark-link" href="/contact">Get in touch <ArrowUpRight size={16} aria-hidden="true" /></Link></article>
      </div></div></section>

      <section className="latest section-pad page-width"><div className="section-heading"><div><p className="eyebrow">The work in pictures</p><h2>People, places, and ministry.</h2></div><p>A visual journey through teaching, parish life, and published worship literature.</p></div><div className="latest-grid">
        <Link className="latest-card" href="/blog"><div className="latest-image"><Image src={referenceImages.latest[0]} alt="Articles and Blog teachings by Ven. Victor" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="play-mark">Read articles <ArrowUpRight size={16} aria-hidden="true" /></span></div><p className="eyebrow">Articles &amp; Blog</p><h3>Reflections and teachings on Christian faith.</h3></Link>
        <Link className="latest-card" href="/legacy"><div className="latest-image"><Image src={referenceImages.latest[1]} alt="Books and worship resources by Ven. Victor" fill sizes="(max-width: 700px) 100vw, 50vw" /><span className="play-mark">View books <ArrowUpRight size={16} aria-hidden="true" /></span></div><p className="eyebrow">Books and worship</p><h3>Resources for faith, hymn singing, and service.</h3></Link>
      </div></section>

      <section className="culture-feature legacy-feature"><Image src={referenceImages.culture} alt="A legacy of encouragement" fill sizes="100vw" className="culture-image" /><div className="culture-shade" /><div className="culture-ornament" aria-hidden="true"><Cross size={90} strokeWidth={0.8} /></div><div className="culture-copy page-width"><p className="eyebrow">A legacy of encouragement</p><h2>Helping others find their way to serve.</h2><p>Students, teachers, priests, and community leaders have grown into lives of service. I give thanks for every person who has carried that work forward.</p><Link className="button button-light" href="/blog">Discover the legacy <ArrowRight size={17} aria-hidden="true" /></Link></div></section>

      <section className="reference-endorsements section-pad"><div className="page-width"><div className="section-heading"><div><p className="eyebrow">Ministry &amp; Life</p><h2>A life devoted to faith and leadership.</h2></div><p>Photographs reflecting decades of faithful service, pastoral care, teaching, and church ministry.</p></div><div className="reference-endorsement-grid">{referenceImages.endorsements.map((image, index) => <figure key={image}><Image src={image} alt={`Ven. Victor Akpevwen Onosemuode photo ${index + 1}`} width={928} height={400} /><figcaption>Ministry gallery {String(index + 1).padStart(2, "0")}</figcaption></figure>)}</div></div></section>

      <section className="contact-band"><div className="page-width contact-inner"><div><p className="eyebrow">Connect</p><h2>For books, counselling, or ministry enquiries.</h2></div><Link className="button button-light" href="/contact">Contact Victor <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
    </>
  );
}