"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary">
      <div className="text-center space-y-8">
        <div className="relative w-24 h-24 mx-auto animate-fade-in">
          <Image
            src="/images/eventsco-logo.png"
            alt="Events-Co"
            width={96}
            height={96}
            className="object-contain brightness-0 invert animate-pulse-slow"
          />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-primary-foreground tracking-wide animate-fade-in-up">
            EVENTS<span className="text-accent">CO</span>
          </h1>
          <div className="flex gap-1 justify-center">
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce-delay-0" />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce-delay-1" />
            <div className="w-2 h-2 rounded-full bg-accent animate-bounce-delay-2" />
          </div>
        </div>
      </div>
    </div>
  )
}
