export const profile = {
  name: "ARSHAD A",
  /** Big garden-sign version. */
  shortName: "ARSHAD",
  tagline: "Developer & Security Researcher",
  portrait: "/images/arshadakl.jpg",
};

export const about = {
  title: "whoami",
  paragraphs: [
    "Nice to meet you! I'm Arshad, a Developer and Cybersecurity Enthusiast.",
    "I create full-stack web applications that are easy to use, hard to break, and built to scale beyond the demo stage.",
    "I follow the latest trends in frontend technologies and libraries, aiming to design and build more accessible applications.",
    "My expertise extends to cybersecurity — I work as a freelance bug hunter, following OWASP security guidelines.",
    "I don't just write code, I analyze how systems behave under pressure. As a security researcher, I apply an attacker's mindset to find weaknesses before they become real-world problems.",
  ],
};

export interface SocialLink {
  label: string;
  url: string;
  short: string;
}

export const socials: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/arshadakl", short: "GH" },
  { label: "LinkedIn", url: "https://linkedin.com/in/arshad-akl", short: "IN" },
  { label: "LeetCode", url: "https://leetcode.com/u/arshadakl", short: "LC" },
  { label: "Blog", url: "https://blog.arshadakl.in", short: "BL" },
];

export const achievement = {
  title: "Featured & Recognized — CERT-In Hall of Fame",
  paragraphs: [
    "National-level recognition from CERT-In (Government of India) for responsibly disclosing a critical vulnerability that exposed 200,000+ students' and alumni's personal and academic data (contact details, Aadhaar, photos, academic records) on a major Kerala public university's website.",
    "Reported to CERT-In with a detailed remediation report; CERT-In coordinated the fix with the university, preventing large-scale data misuse.",
    "Featured in OnManorama and Mathrubhumi news coverage.",
  ],
  press: [
    {
      outlet: "OnManorama",
      url: "https://www.onmanorama.com/news/kerala/2025/10/06/kerala-techie-cybersecurity-hall-of-fame-arshad.html",
    },
    {
      outlet: "Mathrubhumi",
      url: "https://www.mathrubhumi.com/technology/news/kerala-tech-whiz-fixes-university-security-flaw-ueatbr7i",
    },
  ],
};

/** Story shown inside the hidden vault once every bug is squashed. */
export const vault = {
  title: "The Vault",
  intro:
    "You squashed all seven bugs. Here's the story of the real one.",
  paragraphs: [
    "In 2025 I found a critical vulnerability in a major Kerala public university's portal — 200,000+ students' and alumni's records exposed: contact details, Aadhaar numbers, photos, academic records.",
    "No drama, no dumps. I wrote a detailed remediation report and disclosed it responsibly through CERT-In (Government of India).",
    "CERT-In coordinated the fix with the university and listed me in their national Hall of Fame. The press picked it up from there.",
    "That's the job: find it, prove it, report it, get it fixed — before someone less friendly finds it first.",
  ],
  outro: "Thanks for playing. If you hunt bugs too — or need someone who does — say hi in the contact room.",
};

export interface Job {
  company: string;
  period: string;
  role: string;
  location: string;
  bullets: string[];
}

export const experience: Job[] = [
  {
    company: "ELT Global Pvt Ltd",
    period: "Aug 2024 – Present",
    role: "Software Engineer",
    location: "On-Site, Bangalore",
    bullets: [
      "Contributed across frontend and backend to an EdTech platform at 10k+ DAU: a student LMS and an admin ops portal, with SDUI-driven screens (backend controls rendering, no client redeploys).",
      "Built automation (Google Apps Script/Sheets/Classroom + a Docker crash monitor with Slack alerts), cutting 3–4 hrs/day of repetitive work.",
      "Set up a type-safe OpenAPI Swagger + Codegen pipeline, cutting frontend-backend integration overhead ~60%.",
      "Hardened auth flows: token rotation, RBAC, input validation, request signing.",
      "Improved page performance 35–40% via code-splitting, TanStack Query cache-first patterns, request dedup, API batching; cut a key analytics payload ~87% via client-side derivation.",
    ],
  },
  {
    company: "Brototype",
    period: "2023 – 2024",
    role: "Full Stack Engineering Intern",
    location: "Calicut",
    bullets: [
      "Built a freelancer marketplace: real-time chat/video via Socket.IO, Stripe payments, AWS EC2 deploy, ranking algorithm for freelancer discovery.",
      "Built a full e-commerce platform: stock management, coupon engine, Razorpay, session auth, admin panel — deployed end-to-end.",
    ],
  },
];

export interface Project {
  name: string;
  desc: string;
  stack: string[];
  link?: string;
  linkLabel?: string;
}

export const projects: Project[] = [
  {
    name: "Triple i Admin Portal",
    desc: "SDUI-powered admin portal: scheduling, fee policy config, file management. O(1) date-keyed availability lookups, instructor scheduling conflict resolution, runtime Zod schema switching, event-bus cross-module updates, RBAC file controls, Figma-to-code design system via Storybook.",
    stack: [
      "Next.js",
      "NestJS",
      "PostgreSQL",
      "Zustand",
      "TanStack",
      "React Hook Form",
      "Zod",
      "Storybook",
    ],
    link: "https://app.eltglobal.in/",
    linkLabel: "app.eltglobal.in",
  },
  {
    name: "Triple i Learning Platform",
    desc: "Student-facing platform with fully SDUI-driven exams (objective/descriptive/scenario questions), backend-controlled scoring, score-banding + percentile analytics, zoomable comparison charts, HLS live classes, SSE schedule notifications.",
    stack: ["Next.js", "NestJS", "PostgreSQL", "HLS", "SSE", "SDUI"],
  },
  {
    name: "SSH Portfolio",
    desc: "Terminal portfolio in Go (Charm's Wish + Bubbletea), served from a GCP e2-micro VM. Same domain serves the Next.js site over HTTPS and the terminal UI over SSH simultaneously via different ports, Dockerized, Nginx reverse proxy, GitHub Actions CI/CD. Try: ssh arshadakl.in",
    stack: ["Go", "Wish", "Bubbletea", "Docker", "Nginx", "GCP", "GitHub Actions"],
    link: "https://github.com/arshadakl/ssh-portfolio",
    linkLabel: "github.com/arshadakl/ssh-portfolio",
  },
  {
    name: "Freelance Marketplace",
    desc: "Client-freelancer matching platform, feedback-based ranking, real-time chat + video (WebRTC), Stripe payments, admin moderation.",
    stack: ["Next.js", "MongoDB", "WebRTC", "Stripe"],
  },
  {
    name: "Specsy",
    desc: "Eyewear e-commerce, MVC architecture. Nodemailer email verification, password reset, session auth, category/product lifecycle admin, search/filters/coupons.",
    stack: ["Node.js", "MongoDB", "EJS", "Bootstrap"],
  },
  {
    name: "Docker Container Crash Monitor",
    desc: "Bash monitor watching for silent Docker container exits, Slack alerts with container name/ID/image/exit code/runtime.",
    stack: ["Bash", "Docker", "Slack Webhooks", "Linux"],
    link: "https://github.com/arshadakl/Docker-Crash-Monitor",
    linkLabel: "github.com/arshadakl/Docker-Crash-Monitor",
  },
  {
    name: "Indian Stock Backtester",
    desc: "30-min Opening Range Breakout backtester for NSE stocks via Angel One SmartAPI; intraday long-only, one trade/stock/day, 1.5R target, OR-low stop, 15:15 IST square-off.",
    stack: ["Python", "Angel One SmartAPI", "Pandas", "NSE"],
  },
  {
    name: "Bulk Image Compressor",
    desc: "Python tool hitting exact target file sizes via binary-search quality tuning, preserves dimensions, JPEG/PNG/WebP, batch folders, compression stats.",
    stack: ["Python", "Pillow"],
    link: "https://github.com/arshadakl/Bulk-Image-Compressor",
    linkLabel: "github.com/arshadakl/Bulk-Image-Compressor",
  },
  {
    name: "UTF2TTF",
    desc: "Static Malayalam Unicode↔ASCII/TTF converter for legacy font workflows (DaVinci Resolve, Premiere, Photoshop, CapCut), instant convert, one-click copy, JSON API for Apple Shortcuts.",
    stack: ["HTML", "JS", "Static API", "GitHub Pages"],
    link: "https://arshadakl.github.io/UTF2TTF/",
    linkLabel: "arshadakl.github.io/UTF2TTF",
  },
  {
    name: "StreamHub",
    desc: "Live TV streaming directory, 20,000+ channels from 180+ countries, Apple TV-inspired browsing UI.",
    stack: ["Next.js 16", "TypeScript", "Streaming UI", "Vercel"],
    link: "https://streamhub-arshad.vercel.app",
    linkLabel: "streamhub-arshad.vercel.app",
  },
];

export interface Skill {
  name: string;
  /** Inventory-slot icon. */
  icon: string;
  /** Enchantment-tooltip lore lines. */
  lore: string[];
}

export const skills: Skill[] = [
  { name: "Next.js", icon: "▲", lore: ["Daily driver for every frontend", "SSR, RSC, edge deploys"] },
  { name: "NestJS", icon: "🐈", lore: ["Backend of choice at work", "Modular APIs, guards, pipes"] },
  { name: "Express.js", icon: "🚂", lore: ["First backend love", "Still ships the small stuff"] },
  { name: "TanStack Query", icon: "🔄", lore: ["Cache-first data fetching", "Cut page loads 35–40%"] },
  { name: "TanStack Table", icon: "📊", lore: ["Heavy admin grids", "Sorting, filters, virtual rows"] },
  { name: "TanStack Form", icon: "📝", lore: ["Type-safe form state", "Pairs with Zod schemas"] },
  { name: "Zustand", icon: "🐻", lore: ["Small store, no boilerplate", "Powers this very site"] },
  { name: "Redux", icon: "🌀", lore: ["The classic state machine", "Toolkit era, not switch-case era"] },
  { name: "Zod", icon: "🛡", lore: ["Runtime schema validation", "Trust no input"] },
  { name: "Tailwind CSS", icon: "🎨", lore: ["Utility-first styling", "Design systems at speed"] },
  { name: "Storybook", icon: "📚", lore: ["Component workshop", "Figma-to-code pipeline"] },
  { name: "TypeScript", icon: "🧩", lore: ["Everything above, typed", "any is a code smell"] },
];

export const SECTION_NAMES = [
  "Garden",
  "Front Door",
  "About Me",
  "Hall of Fame",
  "Experience",
  "Projects",
  "Skills",
  "Contact",
] as const;

export const SECTION_COUNT = SECTION_NAMES.length; // 8 scroll pages
