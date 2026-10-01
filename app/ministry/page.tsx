import { MapPin, Church, GraduationCap, Award, Compass, ShieldCheck } from "lucide-react";
import SectionPage from "@/src/components/SectionPage";

const appointments = [
  {
    place: "St Luke’s Anglican Church",
    location: "Sapele, Delta State",
    role: "Curate, under Ven. R. U. E. Mariere — Foundational mentorship in church administration and financial stewardship.",
    tag: "Curacy Station",
    period: "1989",
    icon: Church,
  },
  {
    place: "St Philip’s Anglican Church",
    location: "Abraka, Delta State",
    role: "Priestly ministry, spiritual guidance, and strengthening fellowship among students and the local community.",
    tag: "Parish Ministry",
    period: "Parish Leadership",
    icon: Church,
  },
  {
    place: "St James’ Anglican Church",
    location: "Ojagbube-Warri, Delta State",
    role: "Priestly ministry, evangelical outreach, and pastoral care across diocesan communities.",
    tag: "Parish Ministry",
    period: "Diocesan Outreach",
    icon: Church,
  },
  {
    place: "Christ Anglican Church",
    location: "Effurun, Delta State",
    role: "Priestly ministry, discipleship, and expanding youth fellowships and family worship services.",
    tag: "Parish Ministry",
    period: "Community Ministry",
    icon: Church,
  },
  {
    place: "St Peter’s Anglican Church",
    location: "Ekpan, Delta State",
    role: "Pastoral care, leadership development, and fostering Christian reconciliation and welfare support.",
    tag: "Parish Ministry",
    period: "Pastoral Care",
    icon: Church,
  },
  {
    place: "Adam Igbudu Christian Institute",
    location: "Delta State",
    role: "Principal — directing theological instruction, mentoring lay evangelists, and shaping future pastors.",
    tag: "Theological Leadership",
    period: "Institute Principal",
    icon: GraduationCap,
  },
  {
    place: "St Matthew’s Anglican Church",
    location: "Okpara, Delta State",
    role: "Final parish station, bringing decades of dedicated service to full fruition prior to retirement in 2017.",
    tag: "Milestone Station",
    period: "Retirement 2017",
    icon: Award,
  },
];

export default function Ministry() {
  return (
    <SectionPage
      eyebrow="Ministry journey"
      title="Serving people where they are."
      description="A ministry shaped by rural service, church planting, teaching, and the belief that young people can grow into lives of faith and leadership."
    >
      <section className="content-section page-width ministry-intro">
        <div className="story-copy">
          <p className="eyebrow">Called to ordained ministry</p>
          <h2>From the schoolroom to the parish.</h2>
          <p>
            After years of teaching, Victor answered the call to train for ordained ministry in 1986. He completed his ordination course at Trinity Union Theological College, Umuahia, in 1989 and was posted to St Luke’s Anglican Church, Sapele.
          </p>
          <p>
            His mentor, Ven. R. U. E. Mariere, taught him church administration and the care required in keeping accurate records of money received and paid out.
          </p>
        </div>
        <aside className="ministry-quote">
          <span className="eyebrow">In his words</span>
          <p>“The pupils I taught still value the sacrifice I made that helped them become what they are today.”</p>
        </aside>
      </section>

      <section className="timeline-section">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stations of service</p>
              <h2>Across the parishes.</h2>
            </div>
            <p>Anglican ministry and educational leadership throughout the region.</p>
          </div>

          <ol className="appointment-list">
            {appointments.map((appointment, index) => {
              const IconComp = appointment.icon;
              return (
                <li key={appointment.place} className="station-card">
                  <div className="station-card-top">
                    <span className="station-number-pill">
                      STATION {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="station-location-badge">
                      <MapPin size={13} aria-hidden="true" />
                      {appointment.location}
                    </span>
                  </div>

                  <div className="station-card-body">
                    <h3>{appointment.place}</h3>
                    <p>{appointment.role}</p>
                  </div>

                  <div className="station-card-footer">
                    <span className="station-tag">
                      <IconComp size={12} aria-hidden="true" />
                      {appointment.tag}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--muted)" }}>
                      {appointment.period}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="closing-note">
        <div className="page-width">
          <p className="eyebrow">St. Barnabas’ Anglican Church · Arhavwarien</p>
          <h2>Encouraging the next generation to answer the call.</h2>
          <p className="closing-copy">
            As the first priest from Arhavwarien, Victor has encouraged people to train for ministry in Anglican, Roman Catholic, Apostolic Faith, Living Faith, and other churches.
          </p>
        </div>
      </section>
    </SectionPage>
  );
}