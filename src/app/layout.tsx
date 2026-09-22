import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spider - Web Hunting Game",
  description:
    "Hunt prey and spin webs in this atmospheric spider survival game",
  keywords: ["game", "spider", "web", "hunting", "arcade"],
  authors: [{ name: "Spider Game" }],
  openGraph: {
    title: "Spider - Web Hunting Game",
    description:
      "Hunt prey and spin webs in this atmospheric spider survival game",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0e17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
