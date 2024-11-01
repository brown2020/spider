import type { Metadata } from "next";
import "./globals.css";
import "@/styles/game.css";

export const metadata: Metadata = {
  title: "Spider Demo",
  description: "Spider animation demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
