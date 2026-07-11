"use client"

import { SiteShell } from "@/components/site-shell"

type Item = {
  title: string // for experience: role. for projects: project name
  org?: string // for experience: company. for projects: undefined
  href?: string // for projects: link URL
  date?: string
  bullets: string[]
}

const experiences: Item[] = [
  {
    title: "AI Engineer Intern",
    org: "IBM oLabs",
    date: "summer 2026",
    bullets: [],
  },
  {
    title: "Software Engineer Intern",
    org: "Echio",
    date: "may – aug 2025",
    bullets: [
      "Implemented in-house video streaming support for HLS and Adaptive Bitrate Streaming (ABS) with Next.js on the client-side, improving UX and decreasing load times by 65%.",
      "Initiated a white-label solution across agency domains by implementing a custom Express API for theming using Material UI, enabling customization for agency portfolio.",
      "Optimized core API fetching from Client-Side Rendering (CSR) to Server-Side Rendering (SSR) using Next.js Server Components, reducing page load times by 35%.",
      "Built an ETL Pipeline in Python to clean and migrate 700,000+ influencers from MongoDB, delivering a dashboard with detailed insights to stakeholders.",
    ],
  },
  {
    title: "Software Development Lead",
    org: "VTHacks",
    date: "feb – sept 2025",
    bullets: [
      "Led development of event application used by 1000+ participants, integrating features for navigation, check-in, and sponsor engagement with Next.js and Shadcn.",
      "Integrated Supabase Auth and designed relational SQL schemas to improve real-time event validation and data accuracy by 30%.",
      "Migrated legacy backend to structured PostgreSQL, applying principles of data modeling, reducing manual effort by 50%.",
    ],
  },
]

const projects: Item[] = [
  {
    title: "JEART Portfolio",
    href: "https://jeremyevansart.com",
    bullets: [
      "Built a modern, responsive portfolio for NBA champion Jeremy Evans using Next.js, Shadcn, and Contentful.",
      "Deployed with AWS Amplify for scalable hosting and leveraged Cloudflare Workers for serverless edge functions, enabling faster load times and API routing.",
      "Implemented type-safe content delivery with schema validation, supporting high availability and secure content management.",
    ],
  },
  {
    title: "UFA Stats Application",
    href: "https://github.com/piyushkomali",
    bullets: [
      "Developed and deployed a full-stack web app surfacing Ultimate Frisbee Association statistics, reducing lookup time by 35%.",
      "Engineered REST APIs in Flask with CRUD operations, JWT authentication, and storage in PostgreSQL.",
      "Integrated Agentic AI features using Cloudflare AutoRAG, enabling intelligent search for players/games and generating personalized statistic pages.",
      "Deployed backend on AWS EC2 with CI/CD pipelines; designed frontend data visualizations using React.js + Tailwind for 150+ active users.",
    ],
  },
]

function ItemBlock({ item }: { item: Item }) {
  const heading = item.org ? `${item.title} @ ${item.org}` : item.title
  const HeadingWrap: React.ElementType = item.href ? "a" : "span"
  const headingProps = item.href
    ? {
        href: item.href,
        target: "_blank",
        rel: "noopener noreferrer",
        className:
          "text-white font-medium hover:opacity-80 transition-opacity duration-150 underline underline-offset-4 decoration-[#333]",
      }
    : {
        className: "text-white font-medium",
      }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <p className="text-sm sm:text-base text-gray-300">
          <HeadingWrap {...headingProps}>{heading}</HeadingWrap>
        </p>
        {item.date && (
          <span className="text-sm text-[#666] tracking-wide">{item.date}</span>
        )}
      </div>

      {item.bullets.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm sm:text-base leading-relaxed text-gray-300 list-disc pl-5 marker:text-[#666]">
          {item.bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-gray-400 text-xs font-medium tracking-[0.2em] uppercase mb-6">
      {children}
    </h2>
  )
}

export default function Work() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        <SiteShell>
          {/* Experience */}
          <div className="space-y-10">
            {experiences.map((item) => (
              <ItemBlock key={item.title} item={item} />
            ))}
          </div>

          {/* Projects */}
          <div className="mt-20">
            <SectionHeading>Projects</SectionHeading>
            <div className="space-y-10">
              {projects.map((item) => (
                <ItemBlock key={item.title} item={item} />
              ))}
            </div>
          </div>

          <div className="h-24" />
        </SiteShell>
      </div>
    </main>
  )
}
