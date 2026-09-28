import type { Metadata } from "next";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import { CartProvider } from "@/src/context/CartContext";
import CartDrawer from "@/src/components/CartDrawer";
import { ToastProvider } from "@/src/context/ToastContext";
import ToastContainer from "@/src/components/ToastContainer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://victoronosemuode.org"),
  title: "Ven. Victor Akpevwen Onosemuode | Priest, Teacher & Author",
  description: "The life, ministry, books, and community service of Ven. Victor Akpevwen Onosemuode, Anglican priest, teacher, counsellor, and author from Arhavwarien, Delta State.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Ven. Victor Akpevwen Onosemuode | Priest, Teacher & Author",
    description: "The life, ministry, books, and community service of Ven. Victor Akpevwen Onosemuode, Anglican priest, teacher, counsellor, and author from Arhavwarien, Delta State.",
    images: [
      {
        url: "/logo.png",
        width: 1678,
        height: 574,
        alt: "Ven. Victor Akpevwen Onosemuode Logo",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ToastProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main>{children}</main>
            <Footer />
          </CartProvider>
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
