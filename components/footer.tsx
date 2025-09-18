"use client"

import { Github, Linkedin, Mail, Phone, Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a
              href="https://github.com/piyushkomali"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="text-sm">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/piyush-komali-53bb09240"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="text-sm">LinkedIn</span>
            </a>
            <a
              href="mailto:komali.piyush@gmail.com"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm">Email</span>
            </a>
            <a
              href="tel:704-236-1122"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm">Phone</span>
            </a>
            <a
              href="/resume/Piyush_Komali_Resume.pdf"
              download="Piyush_Komali_Resume.pdf"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Resume</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
