import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#0a0e17" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
