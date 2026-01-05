"use client";

import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection({ campaignName }: { campaignName?: string }) {
    const scrollToBrowse = () => {
        if (typeof window === 'undefined') return;

        const element = document.getElementById("browse");
        
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            // Try to scroll to the content area instead
            const contentArea = document.querySelector('.max-w-7xl');
            if (contentArea) {
                contentArea.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Fallback: scroll to bottom of page
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    };

    return (
        <section className="relative overflow-hidden bg-background pt-20 pb-20 md:pt-32 md:pb-32">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-muted/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-accent/30 rounded-full blur-[100px]" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-primary text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-700 sm:px-3 sm:py-1">
                        <Heart className="h-4 w-4 fill-primary" />
                        <span className="hidden sm:inline">Modern Alternative to SignUp Genius</span>
                        <span className="sm:hidden">Alternative to SignUp Genius</span>
                    </div>

                    <h1 className="mx-auto max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {campaignName ? (
                            <>Sharing the Joy for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">{campaignName}</span></>
                        ) : (
                            <>Pitch In to Make <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Local Impact</span></>
                        )}
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                        The smarter way to coordinate holiday donations. Real-time availability, zero duplicate claims, and complete privacy for families - everything SignUp Genius isn&apos;t built for.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Button
                            size="lg"
                            onClick={scrollToBrowse}
                            className="bg-foreground text-background hover:bg-foreground/90 h-14 px-8 text-md font-bold rounded-2xl shadow-xl shadow-border/50 transition-all hover:scale-[1.01] group cursor-pointer"
                        >
                            Browse Needs
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-md font-bold rounded-2xl border-border hover:bg-muted transition-all"
                            asChild
                        >
                            <Link href="/how-it-works">
                                Learn More
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
