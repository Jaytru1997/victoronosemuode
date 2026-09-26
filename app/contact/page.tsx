import { Mail, MapPin, Phone } from "lucide-react";
import SectionPage from "@/src/components/SectionPage";

const locations = [
  { label: "Church", lines: ["St Barnabas’ Anglican Church", "Arhavwarien, Ughelli South L.G.A.", "Delta State, Nigeria"] },
  { label: "Residence", lines: ["42 Vincent Egbo Street", "Okorikpehre, Okpe L.G.A.", "Delta State, Nigeria"] },
];

export default function Contact() {
  return <SectionPage eyebrow="Contact" title="Get in touch with Ven. Victor." description="For book enquiries, church vestments and supplies, guidance and counselling, or priestly mentorship, please use the contact details below.">
    <section className="content-section page-width contact-page-grid"><div className="contact-details"><p className="eyebrow">Direct contact</p><h2>Here to listen and help.</h2><a className="contact-line" href="tel:+2348056204871"><span><Phone size={19} aria-hidden="true" /></span><div><small>Telephone</small><strong>0805 620 4871</strong><strong>0703 530 9844</strong></div></a><a className="contact-line" href="mailto:venonosemuode@gmail.com"><span><Mail size={19} aria-hidden="true" /></span><div><small>Email</small><strong>venonosemuode@gmail.com</strong></div></a></div><div className="contact-addresses"><p className="eyebrow"><MapPin size={14} aria-hidden="true" /> Visit</p>{locations.map((location) => <address className="address-card" key={location.label}><span>{location.label}</span>{location.lines.map((line) => <strong key={line}>{line}</strong>)}</address>)}</div></section>
    <section className="closing-note"><div className="page-width"><p className="eyebrow">A note of thanks</p><h2>“Thus far the Lord has helped us.”</h2></div></section>
  </SectionPage>;
}