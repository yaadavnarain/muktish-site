import type { Metadata } from "next";
import { Quicksand, Nunito, Kanit } from "next/font/google";
import "./globals.css";
import { ScrollProgress } from "@/components/scroll-progress";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

// Display font for the redesign's giant headings only — body stays Nunito.
const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Muktish — Guiding Youth to Live a Fulfilled Life",
  description:
    "Entrepreneur, content creator and numerologist helping young people build wealth, find purpose and live a life they don't need to escape from.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${nunito.variable} ${kanit.variable} h-full`}
    >
      <body className="min-h-full">
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
