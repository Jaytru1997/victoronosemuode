import type { ReactNode } from "react";
import Image from "next/image";
import { referenceImages } from "@/src/data/reference-images";

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function SectionPage({ eyebrow, title, description, children }: SectionPageProps) {
  return (
    <>
      <section className="inner-hero">
        <Image src={referenceImages.hero} alt="Ven. Victor Akpevwen Onosemuode (Rtd.)" fill sizes="100vw" className="inner-hero-image" priority />
        <div className="inner-hero-shade" />
        <div className="page-width inner-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="inner-hero-description">{description}</p>
        </div>
      </section>
      {children}
    </>
  );
}