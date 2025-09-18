"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Phone, ExternalLink } from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "komali.piyush@gmail.com",
    href: "mailto:komali.piyush@gmail.com",
    description: "Best way to reach me for opportunities",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "704-236-1122",
    href: null,
    description: "Reach out via call or text",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/piyushkomali",
    href: "https://www.linkedin.com/in/piyush-komali-53bb09240",
    description: "Connect with me professionally",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/piyushkomali",
    href: "https://github.com/piyushkomali",
    description: "Check out my code and projects",
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="min-h-screen py-20 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          <div className="text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">Get In Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              If you want to chat, connect or whatever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-all duration-300 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{method.label}</h3>
                        {method.href && <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <a
                            href={method.href}
                            target={method.href.startsWith("http") ? "_blank" : undefined}
                            rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>}
                      </div>
                      <p className="text-primary font-mono text-sm">{method.value}</p>
                      <p className="text-muted-foreground text-sm">{method.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Looking for Internship Opportunities</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                I'm actively seeking software engineering internships for 2026. I'm interested in lots of different facets of tech and looking to pursue and learn as much as possible with an innovative tech company.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:komali.piyush@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send me an email
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://www.linkedin.com/in/piyush-komali-53bb09240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Linkedin className="h-5 w-5" />
                  Connect on LinkedIn
                </a>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
