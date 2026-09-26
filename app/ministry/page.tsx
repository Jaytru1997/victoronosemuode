import SectionPage from "@/src/components/SectionPage";

const appointments = [
  { place: "St Luke’s Anglican Church", location: "Sapele", role: "Curate, under Ven. R. U. E. Mariere" },
  { place: "St Philip’s Anglican Church", location: "Abraka", role: "Priestly ministry" },
  { place: "St James’ Anglican Church", location: "Ojagbube-Warri", role: "Priestly ministry" },
  { place: "Christ Anglican Church", location: "Effurun", role: "Priestly ministry" },
  { place: "St Peter’s Anglican Church", location: "Ekpan", role: "Priestly ministry" },
  { place: "Adam Igbudu Christian Institute", location: "Delta State", role: "Principal" },
  { place: "St Matthew’s Anglican Church", location: "Okpara", role: "Final station before retirement in 2017" },
];

export default function Ministry() {
  return <SectionPage eyebrow="Ministry journey" title="Serving people where they are." description="A ministry shaped by rural service, church planting, teaching, and the belief that young people can grow into lives of faith and leadership.">
    <section className="content-section page-width ministry-intro"><div className="story-copy"><p className="eyebrow">Called to ordained ministry</p><h2>From the schoolroom to the parish.</h2><p>After years of teaching, Victor answered the call to train for ordained ministry in 1986. He completed his ordination course at Trinity Union Theological College, Umuahia, in 1989 and was posted to St Luke’s Anglican Church, Sapele.</p><p>His mentor, Ven. R. U. E. Mariere, taught him church administration and the care required in keeping accurate records of money received and paid out.</p></div><aside className="ministry-quote"><span className="eyebrow">In his words</span><p>“The pupils I taught still value the sacrifice I made that helped them become what they are today.”</p></aside></section>
    <section className="timeline-section"><div className="page-width"><div className="section-heading"><div><p className="eyebrow">Stations of service</p><h2>Across the parishes.</h2></div><p>Anglican ministry and educational leadership throughout the region.</p></div><ol className="appointment-list">{appointments.map((appointment, index) => <li key={appointment.place}><span className="service-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{appointment.place}</h3><p>{appointment.role}</p></div><span className="appointment-location">{appointment.location}</span></li>)}</ol></div></section>
    <section className="closing-note"><div className="page-width"><p className="eyebrow">St. Barnabas’ Anglican Church · Arhavwarien</p><h2>Encouraging the next generation to answer the call.</h2><p className="closing-copy">As the first priest from Arhavwarien, Victor has encouraged people to train for ministry in Anglican, Roman Catholic, Apostolic Faith, Living Faith, and other churches.</p></div></section>
  </SectionPage>;
}