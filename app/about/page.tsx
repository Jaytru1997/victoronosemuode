import Link from "next/link";
import { ArrowRight, Award, BookOpen, Calendar, Cross, GraduationCap, Heart, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import SectionPage from "@/src/components/SectionPage";
import { referenceImages } from "@/src/data/reference-images";

const milestones = [
  {
    year: "1947",
    phase: "Phase 01 · Origin",
    title: "Born in Arhavwarien",
    detail: "Born on February 10 in Arhavwarien, Ughelli South, Delta State. The sixth and youngest child of Lay Reader Peter and Deborah Onosemuode.",
    tags: ["Arhavwarien, Delta State", "Lay Reader Heritage", "Family Roots"],
    icon: Sparkles,
  },
  {
    year: "1955–1969",
    phase: "Phase 02 · Formative Education",
    title: "Schooling in Ughelli and Emevor",
    detail: "Began primary school at Oteri-Ughelli in 1955, completed in 1960, continued through secondary modern school, St Vincent’s Grammar School, and James Welch Grammar School.",
    tags: ["Oteri-Ughelli", "James Welch Grammar", "Pioneer Free Education"],
    icon: GraduationCap,
  },
  {
    year: "1970–1987",
    phase: "Phase 03 · Teaching & Service",
    title: "Years in the Classroom",
    detail: "Began teaching in 1970. During NYSC in 1978, taught at Government Girls Secondary School, Kotorkoship (then Sokoto, now Zamfara State). Later taught at Agbarho Grammar School, Agbarho Teacher Training College in Evwreni, Edo College, and New Era College in Benin City. Earned a National Certificate of Education.",
    tags: ["NYSC 1978 Kotorkoship", "Edo College", "NCE Certification"],
    icon: BookOpen,
  },
  {
    year: "1973",
    phase: "Phase 04 · Spiritual Awakening",
    title: "A Renewed Commitment to Faith",
    detail: "Describes being born again on February 8, 1973, deepening a lifelong commitment to the work of God and active Christian devotion.",
    tags: ["Feb 8, 1973", "Spiritual Renewal", "Lifelong Commitment"],
    icon: Heart,
  },
  {
    year: "1979–1989",
    phase: "Phase 05 · Family & Ordination",
    title: "Family and Ordained Ministry",
    detail: "Married on April 14, 1979. After answering the call to ministry, trained at Trinity Union Theological College in Umuahia and was ordained in the Anglican Communion in 1989.",
    tags: ["Married April 1979", "Trinity Union Umuahia", "Anglican Ordination 1989"],
    icon: Cross,
  },
  {
    year: "1996",
    phase: "Phase 06 · Higher Academia",
    title: "Further Education",
    detail: "Successfully completed a specialized course of higher academic study at Delta State University.",
    tags: ["Delta State University", "Continuing Scholarship"],
    icon: Award,
  },
  {
    year: "1989–2017",
    phase: "Phase 07 · Pastoral Leadership",
    title: "Serving Churches and Communities",
    detail: "Served Anglican churches across Sapele, Abraka, Warri, Effurun, Ekpan, and Okpara, as well as principal of Adam Igbudu Christian Institute. Retired on February 10, 2017.",
    tags: ["7 Regional Parishes", "Institute Principal", "Retirement Feb 2017"],
    icon: ShieldCheck,
  },
];

export default function About() {
  return (
    <SectionPage
      eyebrow="Biography"
      title="A life shaped by faith, learning, and service."
      description="The story of Ven. Victor Akpevwen Onosemuode JP (Rtd.), from his childhood in Arhavwarien to decades of teaching and ordained ministry across Delta State."
    >
      <section className="content-section page-width biography-intro">
        <div className="story-copy">
          <p className="eyebrow">Early life</p>
          <h2>A family rooted in the Anglican faith.</h2>
          <p>
            Victor Akpevwen Onosemuode was baptised at three months old with the names Victor EjAkpevwen Onosemuode, recorded in his school documents. He later chose the shorter Akpevwen for forms with limited space. He was the sixth and last child of Lay Reader Peter and Mrs. Deborah Onosemuode.
          </p>
          <p>
            His father was commissioned a Lay Reader in 1925 and also worked as a farmer, fisherman, and trader. His mother was a subsistence farmer. Victor lost his father at eighteen months. At seven, he went to live with his eldest sister, Elizabeth E. Mukoro, in Oteri-Ughelli, at the request of his eldest brother, Samuel Avwerosuoghene Onosemuode.
          </p>
          <p>
            His family taught humility, respect for elders, hard work, education, and service to God. He began primary school at Oteri-Ughelli in 1955 and graduated in 1960, among the pioneer pupils of the free primary school programme introduced by Chief Obafemi Awolowo.
          </p>
        </div>
        <aside className="fact-panel biography-facts">
          <Image
            src={referenceImages.portrait}
            alt="Ven. Victor Akpevwen Onosemuode (Rtd.)"
            width={1000}
            height={600}
            className="biography-portrait"
          />
          <p className="eyebrow">At a glance</p>
          <dl>
            <div>
              <dt>Born</dt>
              <dd>February 10, 1947</dd>
            </div>
            <div>
              <dt>Birthplace</dt>
              <dd>Arhavwarien, Delta State</dd>
            </div>
            <div>
              <dt>Church</dt>
              <dd>Anglican Communion</dd>
            </div>
            <div>
              <dt>Retired</dt>
              <dd>February 10, 2017</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="timeline-section">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A roadmap</p>
              <h2>Learning. Teaching. Ministry.</h2>
            </div>
            <p>Milestones from a life of service to church and community.</p>
          </div>

          <div className="roadmap-container">
            <ol className="roadmap-track">
              {milestones.map((milestone) => {
                const IconComponent = milestone.icon;
                return (
                  <li className="roadmap-milestone" key={milestone.year}>
                    <div className="roadmap-node-wrapper">
                      <div className="roadmap-node" aria-hidden="true">
                        <IconComponent size={22} strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="roadmap-card">
                      <div className="roadmap-card-header">
                        <span className="roadmap-year-badge">
                          <Calendar size={13} aria-hidden="true" />
                          {milestone.year}
                        </span>
                        <span className="roadmap-phase-badge">{milestone.phase}</span>
                      </div>
                      <h3>{milestone.title}</h3>
                      <p>{milestone.detail}</p>
                      <div className="roadmap-tags" aria-label="Key highlights">
                        {milestone.tags.map((tag) => (
                          <span className="roadmap-tag" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="content-section page-width personal-note">
        <div>
          <p className="eyebrow">Beyond the pulpit</p>
          <h2>A love for people, learning, and life.</h2>
        </div>
        <div>
          <p>
            Victor enjoys sports, games, reading, writing, worship, praise, dancing, and travelling to discover new things. He has a special love for children and a deep concern for the welfare of others.
          </p>
          <p>
            He and his family remain committed to St. Barnabas’ Anglican Church in Arhavwarien. He helped lead the church’s 1910–2010 centenary celebration, during which a new church building reached roofing level.
          </p>
          <Link className="text-link dark-link" href="/blog">
            Read about his community legacy <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SectionPage>
  );
}