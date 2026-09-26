import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import SectionPage from "@/src/components/SectionPage";
import { referenceImages } from "@/src/data/reference-images";

export default function Community() {
  return <SectionPage eyebrow="Community" title="Building faith and peace together." description="A lifetime of service to local churches, young people, and community wellbeing in Delta State.">
    <section className="content-section page-width"><div className="community-feature-image"><Image src={referenceImages.consulting} alt="Temporary reference community photograph; replace with a picture of Victor’s church or community work" fill sizes="(max-width: 760px) 100vw, 80vw" /></div><small className="image-replace-note">Temporary community image · replace with Victor’s photograph</small><div className="community-grid"><article><p className="eyebrow">St. Barnabas’ centenary</p><h2>A hundred years of worship in Arhavwarien.</h2><p>Victor helped lead St. Barnabas’ Anglican Church through its 1910–2010 centenary celebration. The gathering supported the building of a new church, which reached roofing level during the celebration.</p></article><article><p className="eyebrow">Peace and service</p><h2>Care that reaches beyond the church.</h2><p>Alongside service with Christian organisations, Victor contributed to peace and conflict resolution in the community and encouraged young people to serve across church traditions.</p></article></div></section>
    <section className="closing-note"><div className="page-width"><p className="eyebrow">Learn more</p><h2>Read about the life behind the work.</h2><Link className="button button-light" href="/about">Explore the biography <ArrowRight size={17} aria-hidden="true" /></Link></div></section>
  </SectionPage>;
}