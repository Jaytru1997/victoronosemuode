import SectionPage from "@/src/components/SectionPage";

const achievements = [
  { number: "01", title: "Churches opened and strengthened", detail: "Pioneered new churches and Christian fellowships across the dioceses of Warri, Ughelli, and Sapele. Several have grown into parishes, districts, and archdeaconry headquarters." },
  { number: "02", title: "A teacher beyond the classroom", detail: "Encouraged academic, sporting, and spiritual growth among students, including through Scripture Union activities. Former pupils went on to help sustain their local church communities." },
  { number: "03", title: "Leaders formed for service", detail: "Students and young people he encouraged have become graduates, teachers, lecturers, doctors, catechists, deacons, priests, canons, archdeacons, and bishops." },
  { number: "04", title: "Service to church and community", detail: "Held roles with the Christian Association of Nigeria, Christian Council of Nigeria, Bible Society of Nigeria, and Scripture Union; served as a women’s organisation chaplain and contributed to peace and conflict resolution." },
];

export default function Legacy() {
  return <SectionPage eyebrow="Legacy and recognition" title="A life measured in people encouraged." description="The work is carried forward in the churches that grew, the students who found their calling, and the leaders who now serve others.">
    <section className="content-section page-width"><div className="section-heading"><div><p className="eyebrow">The work carried forward</p><h2>Service that keeps growing.</h2></div><p>Victor gives thanks to God and to the many people who have shared in this work.</p></div><div className="legacy-list">{achievements.map((item) => <article className="legacy-row" key={item.number}><span className="service-number">{item.number}</span><h2>{item.title}</h2><p>{item.detail}</p></article>)}</div></section>
    <section className="honours-section"><div className="page-width"><p className="eyebrow">Awards and recognition</p><h2>Honours received along the way.</h2><div className="honour-grid"><article><strong>1997</strong><span>Justice of the Peace, appointed by the Delta State Government.</span></article><article><strong>Three pilgrimages</strong><span>Pilgrimages to Israel in recognition of leadership roles in CAN and CCN.</span></article><article><strong>Diocese of Warri</strong><span>Named honorary Canon and Archdeacon by the Bishop, the Rt. Rev. C. E. Ide JP.</span></article><article><strong>Community service</strong><span>Couple of the Year, Diocese of Warri Women’s Organisation; religious adviser to HRM Ovie Okukren III of Arhavwarien Kingdom.</span></article></div></div></section>
  </SectionPage>;
}