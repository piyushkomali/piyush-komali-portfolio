export type Project = {
  slug: string
  title: string
  description: string
  year: string
  tags: string[]
  href?: string
  github?: string
}

export const projects: Project[] = [
  {
    slug: "jeart-portfolio",
    title: "JEART Portfolio",
    description:
      "Production portfolio for NBA champion Jeremy Evans. Type-safe Contentful CMS pipeline served via Cloudflare Workers edge functions on AWS Amplify.",
    year: "2025",
    tags: ["Next.js", "Contentful", "AWS Amplify", "Cloudflare Workers"],
    href: "https://jeremyevansart.com",
  },
  {
    slug: "ufa-stats",
    title: "UFA Stats Application",
    description:
      "Full-stack analytics platform surfacing Ultimate Frisbee Association data. Flask REST API with JWT auth, Cloudflare AutoRAG agentic search, deployed on AWS EC2. 150+ active users.",
    year: "2025",
    tags: ["Flask", "React", "AWS EC2", "Cloudflare AutoRAG", "JWT"],
    github: "https://github.com/piyushkomali/ufaproject",
  },
  {
    slug: "echio-streaming",
    title: "Echio — HLS Streaming + White-label",
    description:
      "Shipped in-house HLS / adaptive bitrate streaming for an influencer marketing platform, cutting load times 65%. Built a Material UI white-label engine and an ETL pipeline migrating 700k+ Mongo documents.",
    year: "2025",
    tags: ["Next.js", "Express", "MongoDB", "HLS", "Python"],
  },
  {
    slug: "vthacks-platform",
    title: "VTHacks Event Platform",
    description:
      "Led development of the hackathon event app used by 1000+ participants. Supabase Auth, PostgreSQL relational schemas, real-time check-in and sponsor engagement flows.",
    year: "2025",
    tags: ["Next.js", "Supabase", "PostgreSQL", "TypeScript"],
  },
  {
    slug: "ultimate-db",
    title: "Ultimate Frisbee Management System",
    description:
      "Game management system with interactive field visualization, real-time player positioning, tournament filtering, and game footage review tools for coaches.",
    year: "2024",
    tags: ["React", "Node.js", "PostgreSQL", "Flask"],
    href: "https://ultimate-db.vercel.app",
  },
  {
    slug: "portfolio",
    title: "piyushkomali.com",
    description:
      "This site. Next.js 14, Geist, brutalist-minimalist layout. Live Last.fm scrobble feed via the edge, command menu, MDX-flavored writing.",
    year: "2025",
    tags: ["Next.js", "TypeScript", "Tailwind", "Edge"],
    href: "https://piyushkomali.com",
    github: "https://github.com/piyushkomali",
  },
]
