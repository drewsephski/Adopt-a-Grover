"use client"

import Link from "next/link"
import { Package, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { OnboardingModal } from "@/components/onboarding-modal"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Package className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Adopt a <span className="text-primary">Grover</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/how-it-works"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                How it works
                            </Link>
                            <Link
                                href="/admin"
                                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Admin Portal
                            </Link>
                            <div className="h-4 w-[1px] bg-border" />
                            <ThemeToggle />
                            <OnboardingModal>
                                <Button className="rounded-full shadow-lg hover:scale-[1.02] transition-all">
                                    Get Started
                                </Button>
                            </OnboardingModal>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-4">
                    <Link
                        href="/how-it-works"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                        How it works
                    </Link>
                    <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                        Admin Portal
                    </Link>
                    <div className="h-[1px] bg-border my-2" />
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>
            )}
        </nav>
    )
}
