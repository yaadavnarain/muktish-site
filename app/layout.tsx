import type { Metadata } from "next";
import { Quicksand, Nunito } from "next/font/google";
import "./globals.css";

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
      className={`${quicksand.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
