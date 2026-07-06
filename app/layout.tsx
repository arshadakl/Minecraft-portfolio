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

const SITE_URL = "https://minecraft.arshadakl.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arshad A — Full-Stack Developer & Security Researcher in Kerala",
    template: "%s | Arshad A",
  },
  description:
    "Arshad A (Arshad AKL) — full-stack web developer and freelance security researcher / bug bounty hunter from Malappuram, Kerala, India. CERT-In Hall of Fame. Explore a 3D Minecraft-style portfolio of projects, experience and skills.",
  applicationName: "Arshad A Portfolio",
  authors: [{ name: "Arshad A", url: SITE_URL }],
  creator: "Arshad A",
  publisher: "Arshad A",
  keywords: [
    "Arshad",
    "Arshad A",
    "Arshad AKL",
    "Arshad Kerala",
    "Arshad Malappuram",
    "Arshad security researcher",
    "Arshad developer",
    "Arshad bug hunter",
    "web developer in Kerala",
    "full stack developer Kerala",
    "full stack developer Malappuram",
    "security researcher Kerala",
    "bug bounty hunter India",
    "React developer Kerala",
    "Next.js developer India",
    "CERT-In Hall of Fame",
    "freelance developer Kerala",
    "cybersecurity researcher India",
    "minecraft portfolio",
    "minecraft 3d portfolio",
    "minecraft style portfolio website",
    "voxel portfolio",
    "3d developer portfolio",
    "interactive 3d portfolio",
  ],
  category: "technology",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Arshad A — Developer & Security Researcher",
    title: "Arshad A — Full-Stack Developer & Security Researcher in Kerala",
    description:
      "Full-stack developer and security researcher from Malappuram, Kerala. CERT-In Hall of Fame. Explore a 3D Minecraft-style portfolio.",
    locale: "en_IN",
    images: [
      {
        url: "/images/arshadakl.jpg",
        width: 800,
        height: 800,
        alt: "Arshad A — Developer & Security Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arshad A — Full-Stack Developer & Security Researcher in Kerala",
    description:
      "Full-stack developer and security researcher from Malappuram, Kerala. CERT-In Hall of Fame.",
    images: ["/images/arshadakl.jpg"],
  },
  icons: {
    icon: [
      {
        url: "/favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/favicon/web-app-manifest-192x192.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Person structured data — helps search engines link the "Arshad" entity to
// this site for name + location + role queries.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Arshad A",
  alternateName: ["Arshad AKL", "Arshad", "Arshad Akl"],
  jobTitle: ["Full-Stack Developer", "Security Researcher"],
  url: SITE_URL,
  image: `${SITE_URL}/images/arshadakl.jpg`,
  description:
    "Full-stack web developer and freelance security researcher / bug bounty hunter from Malappuram, Kerala, India. CERT-In Hall of Fame.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Malappuram",
    addressRegion: "Kerala",
    addressCountry: "IN",
  },
  worksFor: {
    "@type": "Organization",
    name: "ELT Global Pvt Ltd",
  },
  knowsAbout: [
    "Web Development",
    "Full-Stack Development",
    "Cybersecurity",
    "Bug Bounty Hunting",
    "Security Research",
    "Next.js",
    "React",
    "Node.js",
    "NestJS",
    "OWASP",
  ],
  award: "CERT-In Hall of Fame (Government of India)",
  sameAs: [
    "https://arshadakl.in",
    "https://github.com/arshadakl",
    "https://linkedin.com/in/arshad-akl",
    "https://leetcode.com/u/arshadakl",
    "https://blog.arshadakl.in",
  ],
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
      <body className="h-full overflow-hidden bg-[#181310]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* Crawlable content — the visual site is a WebGL canvas, so this
            gives search engines real text to index. Hidden from sighted users. */}
        <div className="sr-only">
          <h1>
            Arshad A — Full-Stack Developer &amp; Security Researcher — Minecraft
            Portfolio
          </h1>
          <p>
            Arshad A (also known as Arshad AKL) is a full-stack web developer and
            freelance security researcher / bug bounty hunter based in Malappuram,
            Kerala, India. This is his interactive 3D Minecraft-style portfolio —
            a scroll-driven voxel world tour of his projects, experience and
            skills. He builds full-stack web applications with Next.js, React,
            NestJS and Node.js, and works as a freelance bug hunter following
            OWASP security guidelines.
          </p>
          <p>
            Arshad received national-level recognition in the CERT-In Hall of
            Fame (Government of India) for responsibly disclosing a critical
            vulnerability affecting 200,000+ students on a major Kerala public
            university website, featured in OnManorama and Mathrubhumi.
          </p>
          <h2>What Arshad does</h2>
          <ul>
            <li>Web developer in Kerala — React and Next.js applications</li>
            <li>Full-stack developer in Malappuram, Kerala, India</li>
            <li>Security researcher and bug bounty hunter</li>
            <li>Software Engineer at ELT Global Pvt Ltd, Bangalore</li>
          </ul>
        </div>
        {children}
      </body>
    </html>
  );
}
