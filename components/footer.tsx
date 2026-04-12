"use client"

import { Instagram, Twitter, Linkedin, Github } from "lucide-react"

const navLinks = [
  { href: "#home", label: "HOME" },
  { href: "#layanan", label: "LAYANAN" },
  { href: "#project", label: "PROJECT" },
  { href: "#pricing", label: "PRICING" },
  { href: "#testimoni", label: "TESTIMONI" },
  { href: "#faq", label: "FAQ" },
]

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
]

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Logo and Tagline */}
          <div className="text-center lg:text-left">
            <a href="#home" className="text-xl font-bold tracking-tight text-foreground">
              CuanPage.
            </a>
            <p className="text-sm text-muted-foreground mt-1">
              Website profesional dalam 24 jam
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs font-medium tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="size-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2026 CuanPage. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
