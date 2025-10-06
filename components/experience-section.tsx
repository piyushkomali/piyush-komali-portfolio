"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Calendar, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const workExperience = [
  {
    id: "echio",
    company: "Echio",
    position: "Software Engineer Intern",
    location: "Remote",
    period: "May 2025 - August 2025",
    description: [
      "Implemented in-house video streaming support for HLS and Adaptive Bitrate Streaming(ABS) with Next.js in client-side, improving UX and decreasing load times by 65%",
      "Initiated a white-label solution across agency domains by implementing a custom Express API for themeing using Material UI, enabling customization for agency portfolio",
      "Optimized core API fetching from Client-Side Rendering(CSR) to Server-Side Rendering(SSR) using Next.js Server Components reducing page load times by 35%",
      "Built an ETL Pipeline in Python to clean and migrate 700,000+ influencers from MongoDB, delivering a dashboard with detailed insights to stakeholders",
    ],
    technologies: ["Next.js", "Express.js", "Material UI", "Python", "MongoDB", "HLS", "SSR"],
  },
  {
    id: "vthacks",
    company: "VTHacks",
    position: "Software Development Lead",
    location: "Blacksburg, VA",
    period: "February 2025 – Present",
    description: [
      "Led development of event application used by 1000+ participants, integrating features for navigation, check-in, and sponsor engagement with Next.js, Shadcn",
      "Integrated Supabase Auth and designed relational SQL schemas to improve real-time event validation and data accuracy by 30%",
      "Migrated legacy backend to structured PostgreSQL, applying principles of data modeling, reducing manual effort by 50%",
    ],
    technologies: ["Next.js", "Supabase", "PostgreSQL", "Shadcn", "TypeScript"],
  },
]

const projects = [
  {
    id: "jeart",
    title: "JEART Portfolio",
    description: "Built a modern, responsive portfolio for NBA champion Jeremy Evans using Next.js, Shadcn, and Contentful",
    details: [
      "Deployed with AWS Amplify for scalable hosting and leveraged Cloudflare Workers for serverless edge functions enabling faster load times and API routing",
      "Implemented type-safe content delivery with schema validation, supporting high availability and secure content management",
    ],
    technologies: ["Next.js", "Contentful CMS", "AWS Amplify", "Cloudflare Workers", "Shadcn"],
    links: {
      live: "https://jeremyevansart.com",
    },
  },
  {
    id: "ufa-stats",
    title: "UFA Stats Application",
    description:
      "Developed and deployed a full-stack web app surfacing Ultimate Frisbee Association statistics, reducing lookup time by 35%",
    details: [
      "Engineered REST APIs in Flask with CRUD operations, JWT authentication, and persistent storage in SQL databases",
      "Integrated Agentic AI features using Cloudflare AutoRAG, enabling intelligent search for players/games and generating personalized statistic pages",
      "Deployed backend on AWS EC2 with CI/CD pipelines; designed frontend data visualizations using React.js + Tailwind for 150+ active users",
    ],
    technologies: ["Flask", "React.js", "AWS EC2", "SQL", "Cloudflare AutoRAG", "Tailwind CSS", "JWT"],
    links: {
      github: "https://github.com/piyushkomali/ufaproject",
    },
  },
  {
    id: "ultimate-frisbee",
    title: "Ultimate Frisbee Management System",
    description:
      "Developed a comprehensive game management system for Ultimate Frisbee teams to record plays, track statistics, and analyze game performance",
    details: [
      "Built interactive field visualization with real-time player positioning and play recording capabilities",
      "Implemented tournament filtering and play analysis tools for coaches and players to review game footage",
      "Designed intuitive admin interface for managing teams, games, and player statistics across multiple tournaments",
    ],
    technologies: ["React.js", "Node.js", "PostgreSQL", "Flask"],
    links: {
      live: "https://ultimate-db.vercel.app",
    },
  },
  {
    id: "portfolio",
    title: "Personal Portfolio Website",
    description:
      "Designed and developed a modern, responsive portfolio website showcasing my professional experience and projects",
    details: [
      "Implemented glassmorphic design elements with smooth animations and responsive layouts across all devices",
      "Built with modern web technologies including Next.js 15, TypeScript, and Tailwind CSS for optimal performance",
      "Features dynamic project showcases, embedded website previews, and downloadable resume functionality",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Shadcn/ui", "Cloudflare"],
    links: {
      live: "https://piyushkomali.com",
    },
  },
]

export function ExperienceSection() {
  const [activeTab, setActiveTab] = useState<"experience" | "projects">("experience")
  const [selectedItem, setSelectedItem] = useState<string>(workExperience[0].id)

  const currentData = activeTab === "experience" ? workExperience : projects
  const currentItem = currentData.find((item) => item.id === selectedItem) || currentData[0]

  return (
    <section id="experience" className="min-h-screen py-16 sm:py-20 px-4 sm:px-6 lg:px-8 pt-20 md:pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-8 lg:space-y-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Experience</h2>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted/15 p-1 rounded-lg w-full sm:w-fit">
            <Button
              variant={activeTab === "experience" ? "default" : "ghost"}
              onClick={() => {
                setActiveTab("experience")
                setSelectedItem(workExperience[0].id)
              }}
              className="px-4 sm:px-6 flex-1 sm:flex-none border border-border/70"
            >
              Work Experience
            </Button>
            <Button
              variant={activeTab === "projects" ? "default" : "ghost"}
              onClick={() => {
                setActiveTab("projects")
                setSelectedItem(projects[0].id)
              }}
              className="px-4 sm:px-6 flex-1 sm:flex-none border border-border/70"
            >
              Projects
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - List */}
            <div className="lg:space-y-2 flex lg:flex-col gap-2 lg:gap-0 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {currentData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={cn(
                    "flex-shrink-0 lg:flex-shrink lg:w-full text-left p-3 lg:p-4 rounded-lg transition-all duration-200 border min-w-[200px] lg:min-w-0",
                    selectedItem === item.id
                      ? "bg-card border-primary/50 shadow-sm"
                      : "bg-card/30 border-border/30 hover:bg-card/50 hover:border-border/50",
                  )}
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{"company" in item ? item.position : item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {"company" in item ? item.company : item.description.slice(0, 60) + "..."}
                    </p>
                    {"period" in item && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.period}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6 lg:p-8 bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <div className="space-y-4 lg:space-y-6">
                  {/* Header */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 lg:gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl sm:text-2xl font-bold">
                          {"company" in currentItem ? currentItem.position : currentItem.title}
                        </h3>
                        {"company" in currentItem && (
                          <p className="text-base sm:text-lg text-primary font-medium">{currentItem.company}</p>
                        )}
                      </div>
                      {"links" in currentItem && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          {currentItem.links.live && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={currentItem.links.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Live Site
                              </a>
                            </Button>
                          )}
                          {currentItem.links.github && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={currentItem.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                <Github className="h-4 w-4" />
                                GitHub
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {"period" in currentItem && (
                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {currentItem.period}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {currentItem.location}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    {"description" in currentItem && activeTab === "experience" && Array.isArray(currentItem.description) && (
                      <ul className="space-y-3">
                        {(currentItem.description as string[]).map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {"description" in currentItem && activeTab === "projects" && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">{currentItem.description}</p>
                        {"details" in currentItem && (
                          <ul className="space-y-3">
                            {currentItem.details.map((detail, index) => (
                              <li key={index} className="flex items-start gap-3 text-muted-foreground leading-relaxed">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Live Preview for JEART Portfolio */}
                  {activeTab === "projects" &&
                    currentItem.id === "jeart" &&
                    "links" in currentItem &&
                    currentItem.links.live && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                          Live Preview
                        </h4>
                        <div className="relative bg-card/30 rounded-lg border border-border/50 overflow-hidden">
                          {/* Browser Window Header */}
                          <div className="flex items-center gap-2 px-4 py-3 bg-card/50 border-b border-border/70">
                            <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="bg-muted/30 rounded px-3 py-1 text-xs text-muted-foreground text-center border">
                                {currentItem.links.live}
                              </div>
                            </div>
                          </div>
                          {/* Website Iframe */}
                          <div className="relative aspect-video bg-muted/20">
                            <iframe
                              src={currentItem.links.live}
                              className="w-full h-full"
                              title="JEART Portfolio Preview"
                              loading="lazy"
                              sandbox="allow-scripts allow-same-origin"
                            />
                            {/* Overlay for interaction */}
                            <div
                              className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                              onClick={() => window.open(currentItem.links.live, "_blank")}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Live Preview for UFA Stats Application */}
                  {activeTab === "projects" && currentItem.id === "ufa-stats" && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                        Live Preview
                      </h4>
                      <div className="relative bg-card/30 rounded-lg border border-border/50 overflow-hidden">
                        {/* Browser Window Header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-card/50 border-b border-border/70">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-muted/30 rounded px-3 py-1 text-xs text-muted-foreground text-center border">
                              https://ufa-project.onrender.com
                            </div>
                          </div>
                        </div>
                        {/* Website Iframe */}
                        <div className="relative aspect-video bg-muted/20">
                          <iframe
                            src="https://ufa-project.onrender.com"
                            className="w-full h-full"
                            title="UFA Stats Application Preview"
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin"
                          />
                          {/* Overlay for interaction */}
                          <div
                            className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                            onClick={() => window.open("https://ufa-project.onrender.com", "_blank")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Preview for Ultimate Frisbee Management System */}
                  {activeTab === "projects" && currentItem.id === "ultimate-frisbee" && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                        Live Preview
                      </h4>
                      <div className="relative bg-card/30 rounded-lg border border-border/50 overflow-hidden">
                        {/* Browser Window Header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-card/50 border-b border-border/70">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                          </div>
                          <div className="flex-1 mx-4">
                            <div className="bg-muted/30 rounded px-3 py-1 text-xs text-muted-foreground text-center border">
                              https://ultimate-db.vercel.app
                            </div>
                          </div>
                        </div>
                        {/* Static Image Preview */}
                        <div className="relative aspect-video bg-muted/20">
                          <Image
                            src="/images/ultimate-frisbee-preview.png"
                            alt="Ultimate Frisbee Management System Preview"
                            fill
                            className="object-cover"
                          />
                          {/* Overlay for interaction */}
                          <div
                            className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                            onClick={() => window.open("https://ultimate-db.vercel.app", "_blank")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Live Preview for Portfolio Website */}
                  {activeTab === "projects" &&
                    currentItem.id === "portfolio" &&
                    "links" in currentItem &&
                    currentItem.links.live && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                          Live Preview
                        </h4>
                        <div className="relative bg-card/30 rounded-lg border border-border/50 overflow-hidden">
                          {/* Browser Window Header */}
                          <div className="flex items-center gap-2 px-4 py-3 bg-card/50 border-b border-border/70">
                            <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="bg-muted/30 rounded px-3 py-1 text-xs text-muted-foreground text-center border">
                                {currentItem.links.live}
                              </div>
                            </div>
                          </div>
                          {/* Website Iframe */}
                          <div className="relative aspect-video bg-muted/20">
                            <iframe
                              src={currentItem.links.live}
                              className="w-full h-full"
                              title="Portfolio Website Preview"
                              loading="lazy"
                              sandbox="allow-scripts allow-same-origin"
                            />
                            {/* Overlay for interaction */}
                            <div
                              className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                              onClick={() => window.open(currentItem.links.live, "_blank")}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Technologies */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentItem.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
