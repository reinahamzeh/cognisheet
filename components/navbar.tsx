"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { openSignIn, openSignUp } = useClerk()
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  const handleSignIn = (e) => {
    e.preventDefault()
    openSignIn()
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    openSignUp()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              CogniSheet
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Pricing
          </Link>
          <Link 
            href="/app" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            App
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <Link href="/app">
              <Button size="sm">Go to App</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button size="sm" onClick={handleSignUp}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-md p-2 text-muted-foreground md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col gap-4 pb-6">
            <Link
              href="#features"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/app"
              className="text-base font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              App
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              {isSignedIn ? (
                <Link href="/app" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">Go to App</Button>
                </Link>
              ) : (
                <>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button className="w-full justify-start" onClick={handleSignUp}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
} 