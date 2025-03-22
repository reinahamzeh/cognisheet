"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "../components/ui/button"
import { ChevronRight, BarChart2, FileSpreadsheet, Upload, MessageSquareText } from "lucide-react"
import Navbar from "../components/navbar"
import FeatureCard from "../components/feature-card"
import PricingCard from "../components/pricing-card"
import PricingModal from "../components/pricing-modal"
import Footer from "../components/footer"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function Home() {
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { openSignUp } = useClerk()
  const router = useRouter()

  const handleOpenPricing = () => {
    setShowPricingModal(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  The Future of Spreadsheets is AI-Powered
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Let AI automate your formulas, generate charts, and source data — all in a clean, user-friendly
                  interface.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push("/app")}>
                  Try Free Demo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleOpenPricing}>View Pricing</Button>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <div className="relative rounded-lg overflow-hidden border shadow-xl dark:border-gray-800">
                <Image
                  src="/placeholder.svg"
                  width={800}
                  height={600}
                  alt="CogniSheet Interface"
                  className="object-cover aspect-video"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background to-background/0 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful AI, Simple Interface</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                CogniSheet combines the power of AI with the simplicity of modern design to transform how you work with
                data.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
            <FeatureCard
              icon={<MessageSquareText className="h-10 w-10 text-primary" />}
              title="Natural Language Assistant"
              description="Ask questions in plain English and let AI handle complex spreadsheet commands for you."
            />
            <FeatureCard
              icon={<BarChart2 className="h-10 w-10 text-primary" />}
              title="Auto Chart Generation"
              description="Instantly create beautiful visualizations from your table data with a single click."
            />
            <FeatureCard
              icon={<Upload className="h-10 w-10 text-primary" />}
              title="Import Existing Files"
              description="Seamlessly import and edit your existing Excel or Numbers files without losing formatting."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="h-10 w-10 text-primary" />}
              title="Smart, Responsive UI"
              description="Enjoy a zero learning curve with our intuitive interface that adapts to your workflow."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, Transparent Pricing</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Choose the plan that works best for you and your team.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2 mt-12">
            <PricingCard
              title="Free"
              price="$0"
              description="Perfect for trying out CogniSheet"
              features={["1 spreadsheet file", "Basic AI assistance", "Standard charts", "Export to CSV"]}
              buttonText="Get Started"
              buttonVariant="outline"
              onClick={() => openSignUp()}
            />
            <PricingCard
              title="Pro"
              price="$12"
              period="/month"
              description="Everything you need for serious data work"
              features={[
                "Unlimited spreadsheet files",
                "Advanced AI features",
                "Custom chart styles",
                "Import/export all formats",
                "Priority support",
              ]}
              buttonText="Upgrade to Pro"
              buttonVariant="default"
              popular
              onClick={handleOpenPricing}
            />
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Pricing Modal */}
      <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} />
    </div>
  )
} 