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
    org: "IBM",
    date: "may – aug 2026",
    bullets: [
      "Implemented a LangGraph agentic AI solution to streamline government contract acquisition for the DHS, exposing an Agent-to-Agent (A2A) endpoint via JSON-RPC that cuts 6+ hours each day in review time.",
      "Architected a suite of agents equipped with custom tools and FastMCP-based integrations to autonomously fetch and evaluate SAM.gov data and documents for accurate context, reducing retrieval time by 66%.",
      "Engineered a remote interface on an Express.js backend, empowering developers to access IBM’s internal AI coding agent from mobile devices via secure Tailscale and SSH connections to local workstations.",
      "Leveraged tmux to scrape dynamic terminal outputs and stream real-time progress via a seamless Slack integration, unlocking asynchronous workflows and on-the-go code generation.",
    ],
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
      "Led development and PostgreSQL migration of a Next.js event app for 1000+ participants.",
    ],
  },
]

const projects: Item[] = [
  {
    title: "Agentic AI Stadium Map",
    bullets: [
      "Developed an agentic AI stadium map using the AI SDK and ChromaDB semantic vector search, allowing users to query food preferences, stadium policies, and transit options via natural language.",
      "Integrated an interactive Mapbox map and Konva UI with Next.js so users can conversationally browse seats, select tickets, and intelligently locate amenities.",
      "Engineered geospatial distance math and programmatic UI tools, empowering the AI agent to autonomously highlight nearby locations, control camera zoom, and draw multi-leg navigation.",
    ],
  },
  {
    title: "ShopAI",
    href: "https://shopping.piyushkomali.com",
    bullets: [
      "Built a collaborative agentic shopping-list interface using Durable Objects and WebSockets, enabling persistent shared lists, synchronized CRUD updates, and real-time session counts across clients.",
      "Integrated Cloudflare Workers AI with the Llama 4 Scout model to convert natural-language meal requests into validated grocery-item arrays, enabling conversational list creation.",
      "Deployed the Next.js and TypeScript stack on Cloudflare Workers with Vinext and Vite, connecting route handlers to Workers AI and Durable Object bindings for an edge-hosted full-stack architecture.",
    ],
  },
  {
    title: "JEART Portfolio",
    href: "https://jeremyevansart.com",
    bullets: [
      "Built a modern, responsive portfolio for NBA champion Jeremy Evans using Next.js, Shadcn, and Contentful.",
      "Deployed with AWS Amplify for scalable hosting and leveraged Cloudflare Workers for serverless edge functions, enabling faster load times and API routing.",
      "Implemented type-safe content delivery with schema validation, supporting high availability and secure content management.",
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
