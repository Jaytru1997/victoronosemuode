import { Award, BookOpen, Church, Medal, Scroll, Shield, Star, Users } from "lucide-react";
import SectionPage from "@/src/components/SectionPage";

const achievements = [
  {
    number: "01",
    title: "Churches opened and strengthened",
    detail: "Pioneered new churches and Christian fellowships across the dioceses of Warri, Ughelli, and Sapele. Several have grown into parishes, districts, and archdeaconry headquarters.",
    icon: Church,
    tag: "Church Planting & Growth",
  },
  {
    number: "02",
    title: "A teacher beyond the classroom",
    detail: "Encouraged academic, sporting, and spiritual growth among students, including through Scripture Union activities. Former pupils went on to help sustain their local church communities.",
    icon: BookOpen,
    tag: "Mentorship & Education",
  },
  {
    number: "03",
    title: "Leaders formed for service",
    detail: "Students and young people he encouraged have become graduates, teachers, lecturers, doctors, catechists, deacons, priests, canons, archdeacons, and bishops.",
    icon: Users,
    tag: "Generational Impact",
  },
  {
    number: "04",
    title: "Service to church and community",
    detail: "Held roles with the Christian Association of Nigeria, Christian Council of Nigeria, Bible Society of Nigeria, and Scripture Union; served as a women’s organisation chaplain and contributed to peace and conflict resolution.",
    icon: Award,
    tag: "Ecumenical Leadership",
  },
];

const honours = [
  {
    year: "1997",
    title: "Justice of the Peace (JP)",
    detail: "Appointed by the Delta State Government in recognition of public integrity and leadership.",
    icon: Medal,
  },
  {
    year: "Holy Land",
    title: "Three Pilgrimages to Israel",
    detail: "Pilgrimages to Israel in recognition of dedicated leadership roles in CAN and CCN.",
    icon: Star,
  },
  {
    year: "Diocese of Warri",
    title: "Honorary Canon & Archdeacon",
    detail: "Named honorary Canon and Archdeacon by the Bishop, the Rt. Rev. C. E. Ide JP.",
    icon: Shield,
  },
  {
    year: "Community",
    title: "Couple of the Year & Royal Adviser",
    detail: "Couple of the Year, Diocese of Warri Women’s Organisation; religious adviser to HRM Ovie Okukren III of Arhavwarien Kingdom.",
    icon: Scroll,
  },
];

export default function Legacy() {
  return (
    <SectionPage
      eyebrow="Legacy and recognition"
      title="A life measured in people encouraged."
      description="The work is carried forward in the churches that grew, the students who found their calling, and the leaders who now serve others."
    >
      <section className="content-section page-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The work carried forward</p>
            <h2>Service that keeps growing.</h2>
          </div>
          <p>Victor gives thanks to God and to the many people who have shared in this work.</p>
        </div>

        <div className="legacy-list">
          {achievements.map((item) => {
            const IconComponent = item.icon;
            return (
              <article className="legacy-impact-card" key={item.number}>
                <div className="legacy-impact-card-top">
                  <div className="legacy-impact-icon" aria-hidden="true">
                    <IconComponent size={22} strokeWidth={1.8} />
                  </div>
                  <span className="legacy-impact-num">{item.number}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.detail}</p>
                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--rust)",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.tag}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="honours-section">
        <div className="page-width">
          <p className="eyebrow">Awards and recognition</p>
          <h2>Honours received along the way.</h2>

          <div className="honour-grid">
            {honours.map((honour) => {
              const IconComp = honour.icon;
              return (
                <article className="honour-badge-card" key={honour.title}>
                  <div className="honour-badge-header">
                    <IconComp size={18} className="honour-badge-icon" aria-hidden="true" />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        letterSpacing: "0.5px",
                        color: "var(--rust)",
                        textTransform: "uppercase",
                      }}
                    >
                      {honour.year}
                    </span>
                  </div>
                  <strong>{honour.title}</strong>
                  <span>{honour.detail}</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </SectionPage>
  );
}