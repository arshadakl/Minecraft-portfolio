import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixelHead = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const pixelBody = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-body",
});

export const metadata: Metadata = {
  title: "Arshad A — Developer & Security Researcher",
  description:
    "Scroll-driven 3D voxel home tour portfolio of Arshad A: full-stack developer, freelance bug hunter, CERT-In Hall of Fame.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelHead.variable} ${pixelBody.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-[#181310]">{children}</body>
    </html>
  );
}
