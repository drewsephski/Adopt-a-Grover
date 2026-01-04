"use client";

import { Gift, Heart, Package, CheckCircle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingModal } from "@/components/onboarding-modal";

export default function HowItWorksPage() {
    return (
        <div className="bg-background min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-5xl mx-auto space-y-20 relative">

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

                {/* Hero Section */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700">
                        <Sparkles className="h-4 w-4" />
                        <span>Simple • Transparent • Impactful</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-top-5 duration-700 delay-100">
                        How It Works
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-6 duration-700 delay-200">
                        Brightening holidays for Fox River Grove families is easier than ever. Follow these simple steps to make a difference today.
                    </p>

                    <div className="pt-4 animate-in fade-in slide-in-from-top-7 duration-700 delay-300">
                        <OnboardingModal>
                            <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all">
                                Get Started
                            </Button>
                        </OnboardingModal>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 rounded-full" />

                    <div className="space-y-12 md:space-y-24">
                        {/* Step 1 */}
                        <div className="relative md:flex items-center justify-between group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-8 md:mb-0 md:text-right pr-0 md:pr-12">
                                <span className="inline-block text-6xl font-black text-muted/20 absolute -top-10 md:-right-4 right-4 z-0 pointer-events-none select-none">01</span>
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl font-bold text-foreground">Browse Requests</h3>
                                    <p className="text-muted-foreground text-lg">
                                        Explore our list of local families and their specific holiday wishes. Filter by family size or needs to find a perfect match for your contribution.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pl-0 md:pl-12 flex justify-center md:justify-start">
                                <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-300">
                                    <CardContent className="p-8 flex items-center justify-center min-h-[200px] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                        <Gift className="w-24 h-24 text-blue-500 drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative md:flex items-center justify-between flex-row-reverse group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-8 md:mb-0 md:text-left pl-0 md:pl-12">
                                <span className="inline-block text-6xl font-black text-muted/20 absolute -top-10 md:-left-4 left-4 z-0 pointer-events-none select-none">02</span>
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl font-bold text-foreground">Claim a Gift</h3>
                                    <p className="text-muted-foreground text-lg">
                                        Select a family or individual gift to support. Simply enter your email to confirm your commitment—no account creation required.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pr-0 md:pr-12 flex justify-center md:justify-end">
                                <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-300">
                                    <CardContent className="p-8 flex items-center justify-center min-h-[200px] bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
                                        <Heart className="w-24 h-24 text-pink-500 drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative md:flex items-center justify-between group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-8 md:mb-0 md:text-right pr-0 md:pr-12">
                                <span className="inline-block text-6xl font-black text-muted/20 absolute -top-10 md:-right-4 right-4 z-0 pointer-events-none select-none">03</span>
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl font-bold text-foreground">Purchase & Wrap</h3>
                                    <p className="text-muted-foreground text-lg">
                                        Buy and wrap your gifts. Label them clearly with the unique Family ID provided in your confirmation email to ensure they reach the right home.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pl-0 md:pl-12 flex justify-center md:justify-start">
                                <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-300">
                                    <CardContent className="p-8 flex items-center justify-center min-h-[200px] bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                                        <Package className="w-24 h-24 text-amber-500 drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative md:flex items-center justify-between flex-row-reverse group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-8 md:mb-0 md:text-left pl-0 md:pl-12">
                                <span className="inline-block text-6xl font-black text-muted/20 absolute -top-10 md:-left-4 left-4 z-0 pointer-events-none select-none">04</span>
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl font-bold text-foreground">Drop Off</h3>
                                    <p className="text-muted-foreground text-lg">
                                        Drop off your wrapped gifts at our secure collection point. We handle the final silent delivery to the families.
                                    </p>
                                    <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 mt-4 border border-border/50">
                                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-foreground">624 Ellington Ct, Fox River Grove, IL</p>
                                            <p className="text-muted-foreground mt-1">Please ensure drop-off by the date listed in your email.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-[45%] pr-0 md:pr-12 flex justify-center md:justify-end">
                                <Card className="w-full max-w-sm overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-colors duration-300">
                                    <CardContent className="p-8 flex items-center justify-center min-h-[200px] bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                                        <CheckCircle className="w-24 h-24 text-emerald-500 drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="pt-12 text-center">
                    <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 max-w-2xl mx-auto space-y-6">
                        <h3 className="text-2xl font-bold">Ready to make someone&apos;s holiday?</h3>
                        <p className="text-muted-foreground">Join hundreds of neighbors in spreading joy this season.</p>
                        <OnboardingModal>
                            <Button size="lg" className="rounded-full px-12 py-6 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                Get Started
                            </Button>
                        </OnboardingModal>
                    </div>
                </div>
            </div>
        </div>
    );
}
