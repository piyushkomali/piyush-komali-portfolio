"use client"

import { SiteShell } from "@/components/site-shell"

const experiences = [
  {
    company: "IBM oLabs",
    role: "AI Engineer Intern",
    date: "Summer 2026",
    location: "Reston, VA",
    bullets: [] as string[],
  },
  {
    company: "Echio",
    role: "Software Engineer Intern",
    date: "May 2025 – August 2025",
    location: "Remote",
    bullets: [
      "Implemented in-house video streaming support for HLS and Adaptive Bitrate Streaming (ABS) with Next.js on the client-side, improving UX and decreasing load times by 65%.",
      "Initiated a white-label solution across agency domains by implementing a custom Express API for theming using Material UI, enabling customization for agency portfolio.",
      "Optimized core API fetching from Client-Side Rendering (CSR) to Server-Side Rendering (SSR) using Next.js Server Components, reducing page load times by 35%.",
      "Built an ETL Pipeline in Python to clean and migrate 700,000+ influencers from MongoDB, delivering a dashboard with detailed insights to stakeholders.",
    ],
  },
  {
    company: "VTHacks",
    role: "Software Development Lead",
    date: "February 2025 – Present",
    location: "Blacksburg, VA",
    bullets: [
      "Led development of event application used by 1000+ participants, integrating features for navigation, check-in, and sponsor engagement with Next.js and Shadcn.",
      "Integrated Supabase Auth and designed relational SQL schemas to improve real-time event validation and data accuracy by 30%.",
      "Migrated legacy backend to structured PostgreSQL, applying principles of data modeling, reducing manual effort by 50%.",
    ],
  },
]

const NAV_FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export default function Work() {
  return (
    <main className="min-h-screen">
      <div className="pt-16">
        <SiteShell>
        {/* Quick page nav */}
        <div className="flex gap-6 flex-wrap mb-10">
          {experiences.map((exp) => (
            <a
              key={exp.company}
              href={`#${exp.company.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-[#666] hover:text-white transition-colors duration-150 tracking-wide"
              style={{ fontFamily: NAV_FONT }}
            >
              {exp.company.toLowerCase()}
            </a>
          ))}
        </div>

        {/* Experience list */}
        <div className="space-y-12">
          {experiences.map((exp) => (
            <div
              key={exp.company}
              id={exp.company.toLowerCase().replace(/\s+/g, "-")}
              className="scroll-mt-24"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <h2 className="text-lg sm:text-xl text-white font-normal tracking-tight">
                  {exp.company}
                </h2>
                {exp.date && (
                  <span className="text-sm text-[#666] tracking-wide">
                    {exp.date}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mt-1">
                <p className="text-sm sm:text-base text-gray-300">{exp.role}</p>
                {exp.location && (
                  <span className="text-sm text-[#666] tracking-wide">
                    {exp.location}
                  </span>
                )}
              </div>

              {exp.bullets.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm sm:text-base leading-relaxed text-gray-300 list-disc pl-5 marker:text-[#666]">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="h-24" />
      </SiteShell>
      </div>
    </main>
  )
}
