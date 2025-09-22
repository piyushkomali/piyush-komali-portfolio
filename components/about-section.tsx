"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const skills = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "SQL", "Java", "Swift", "C"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["Next.js", "React.js", "Node.js", "Flask", "Tailwind CSS", "Redux"],
  },
  {
    category: "Developer Tools",
    items: ["PostgreSQL", "MongoDB", "Supabase", "Firebase", "Git", "Docker", "Postman"],
  },
  {
    category: "Platforms & CMS",
    items: ["Contentful CMS", "Vercel", "AWS EC2", "SQLite"],
  },
]

const achievements = [
  "Dean's List",
  "Charlotte Alumni Chapter Scholarship",
  "VTHacks Development Committee Lead",
  "Virginia Tech Men's Club Ultimate Frisbee Captain",
]

export function AboutSection() {
  return (
    <section id="about" className="min-h-screen py-16 sm:py-20 px-4 sm:px-6 lg:px-8 pt-20 md:pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Left Column - About Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">About</h2>
              <div className="space-y-4 lg:space-y-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <p>
                  I am a Computer Science student at <strong className="text-foreground">Virginia Tech</strong> with a
                  passion for building innovative software solutions. I aim to pursue a career where I can bridge the thrill of technological challenges while seeing a tangible impact in making the world a better place.
                </p>

                <p>
                  When making software I aim to create something that is not only technically relevant but also something that excites me and motivates me to keep learning and improving.
                </p>


                <p>
                  You can gain further insights into my background and interests through my{" "}
                  <a href="/experience" className="text-primary hover:underline">
                    experience
                  </a>
                  , find me on{" "}
                  <a
                    href="https://github.com/piyushkomali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub
                  </a>
                  , and{" "}
                  <a
                    href="https://www.linkedin.com/in/piyush-komali-53bb09240"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LinkedIn
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Resume Download Section */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Resume</h3>
              <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Download My Resume</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a detailed overview of my experience, education, and technical skills.
                    </p>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                    <a
                      href="/resume/Piyush_Komali_Resume.pdf"
                      download="Piyush_Komali_Resume.pdf"
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Resume</span>
                    </a>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Education</h3>
              <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-semibold text-lg">Virginia Tech</h4>
                    <span className="text-sm text-muted-foreground">Blacksburg, VA</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-muted-foreground">BS in Computer Science</p>
                    <span className="text-sm text-muted-foreground">Expected Graduation: May 2027</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Relevant Coursework:</strong> Computer Systems/Architecture, Data Structures and
                      Algorithms, Combinatorics, Discrete Math, Linear Algebra, Statistics, Intro to Data Analytics and
                      Visualization
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">Achievements & Leadership</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-sm font-medium">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Skills */}
          <div className="space-y-6 lg:space-y-8">
            <h3 className="text-lg sm:text-xl font-semibold">Technical Skills</h3>
            <div className="space-y-6">
              {skills.map((skillGroup, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                    {skillGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 text-xs font-medium bg-secondary/50 text-secondary-foreground rounded-full border border-border/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
