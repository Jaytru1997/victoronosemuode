import type { Metadata } from "next";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer"
import "./globals.css";

export const metadata: Metadata = {
  title: "Ven. Victor Akpevwen Onosemuode | Priest, Teacher & Author",
  description: "The life, ministry, books, and community service of Ven. Victor Akpevwen Onosemuode, Anglican priest, teacher, counsellor, and author from Arhavwarien, Delta State.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
