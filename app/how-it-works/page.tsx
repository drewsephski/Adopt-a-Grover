"use client";

import { Package, Heart, CheckCircle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OnboardingModal } from "@/components/onboarding-modal";
import { BuyMeACoffee } from "@/components/buy-me-coffee";

export default function HowItWorksPage() {
    return (
        <div className="bg-background min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 lg:space-y-20 relative">

                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />

                {/* Hero Section */}
                <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex gifts-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden xs:inline">Modern • Smart • Impactful</span>
                        <span className="xs:hidden">Modern & Smart</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-top-5 duration-700 delay-100">
                        The Modern SignUp Genius Alternative
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-6 duration-700 delay-200 px-2">
                        Finally, a signup tool designed for community giving. Smart matching, live updates, and thoughtful privacy - everything generic signup tools miss.
                    </p>

                    <div className="pt-2 sm:pt-4 animate-in fade-in slide-in-from-top-7 duration-700 delay-300">
                        <OnboardingModal>
                            <Button size="lg" className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all w-full sm:w-auto">
                                Get Started
                            </Button>
                        </OnboardingModal>
                    </div>
                </div>

                {/* Steps Section */}
                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 rounded-full" />

                    <div className="space-y-8 sm:space-y-12 md:space-y-20 lg:space-y-24">
                        {/* Step 1 */}
                        <div className="relative md:flex gifts-center justify-between group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-6 sm:mb-8 md:mb-0 md:text-right pr-0 md:pr-8 lg:pr-12">
                                <span className="inline-block text-4xl sm:text-5xl md:text-6xl font-black text-muted/20 absolute -top-8 sm:-top-10 md:-right-4 right-4 z-0 pointer-campaigns-none select-none">01</span>
                                <div className="space-y-3 sm:space-y-4 relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Live Opportunity Tracking</h3>
                                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                        See exactly what&apos;s available in real-time. Smart updates prcampaign conflicts - something SignUp Genius struggles with.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pl-0 md:pl-8 lg:pl-12 flex justify-center md:justify-start">
                                <Card className="w-full max-w-xs sm:max-w-sm overflow-hidden border-none shadow-lg sm:shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:scale-105">
                                    <CardContent className="p-6 sm:p-8 flex gifts-center justify-center min-h-[160px] sm:min-h-[200px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                                        <Package className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative md:flex gifts-center justify-between flex-row-reverse group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-6 sm:mb-8 md:mb-0 md:text-left pl-0 md:pl-8 lg:pl-12">
                                <span className="inline-block text-4xl sm:text-5xl md:text-6xl font-black text-muted/20 absolute -top-8 sm:-top-10 md:-left-4 left-4 z-0 pointer-campaigns-none select-none">02</span>
                                <div className="space-y-3 sm:space-y-4 relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Instant Claim Confirmations</h3>
                                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                        Claim opportunities with confidence. Get immediate confirmations with all details - no more wondering if your signup went through.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pr-0 md:pr-8 lg:pr-12 flex justify-center md:justify-end">
                                <Card className="w-full max-w-xs sm:max-w-sm overflow-hidden border-none shadow-lg sm:shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:scale-105">
                                    <CardContent className="p-6 sm:p-8 flex gifts-center justify-center min-h-[160px] sm:min-h-[200px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                                        <Heart className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative md:flex gifts-center justify-between group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-6 sm:mb-8 md:mb-0 md:text-right pr-0 md:pr-8 lg:pr-12">
                                <span className="inline-block text-4xl sm:text-5xl md:text-6xl font-black text-muted/20 absolute -top-8 sm:-top-10 md:-right-4 right-4 z-0 pointer-campaigns-none select-none">03</span>
                                <div className="space-y-3 sm:space-y-4 relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Smart Admin Controls</h3>
                                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                        Admins can manage everything smoothly. Fix mistakes, update claims, and see exactly what's happening - no more coordination chaos.
                                    </p>
                                </div>
                            </div>
                            <div className="md:w-[45%] pl-0 md:pl-8 lg:pl-12 flex justify-center md:justify-start">
                                <Card className="w-full max-w-xs sm:max-w-sm overflow-hidden border-none shadow-lg sm:shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:scale-105">
                                    <CardContent className="p-6 sm:p-8 flex gifts-center justify-center min-h-[160px] sm:min-h-[200px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                                        <Package className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative md:flex gifts-center justify-between flex-row-reverse group">
                            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10 group-hover:scale-125 transition-transform duration-300 shadow-sm" />

                            <div className="md:w-[45%] mb-6 sm:mb-8 md:mb-0 md:text-left pl-0 md:pl-8 lg:pl-12">
                                <span className="inline-block text-4xl sm:text-5xl md:text-6xl font-black text-muted/20 absolute -top-8 sm:-top-10 md:-left-4 left-4 z-0 pointer-campaigns-none select-none">04</span>
                                <div className="space-y-3 sm:space-y-4 relative z-10">
                                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Seamless Coordination</h3>
                                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                                        Perfect organization with smart features. No more lost donations or confusion - everything works together beautifully.
                                    </p>
                                    <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex gifts-start gap-3 mt-4 border border-border/50">
                                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-foreground">Built for Community Giving</p>
                                            <p className="text-muted-foreground mt-1">Unlike SignUp Genius, we&apos;re designed specifically for donation coordination with features that prcampaign common signup problems.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-[45%] pr-0 md:pr-8 lg:pr-12 flex justify-center md:justify-end">
                                <Card className="w-full max-w-xs sm:max-w-sm overflow-hidden border-none shadow-lg sm:shadow-xl bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:scale-105">
                                    <CardContent className="p-6 sm:p-8 flex gifts-center justify-center min-h-[160px] sm:min-h-[200px] bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                                        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-primary drop-shadow-lg" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="pt-8 sm:pt-12 text-center">
                    <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/50 max-w-2xl mx-auto space-y-4 sm:space-y-6">
                        <h3 className="text-xl sm:text-2xl font-bold">Ready to make someone&apos;s holiday?</h3>
                        <p className="text-muted-foreground text-base sm:text-lg">Join hundreds of neighbors in spreading joy this season.</p>
                        <OnboardingModal>
                            <Button size="lg" className="rounded-full px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all w-full sm:w-auto">
                                Get Started
                            </Button>
                        </OnboardingModal>
                    </div>
                </div>

                {/* Buy Me a Coffee */}
                <div className="pt-8 sm:pt-12">
                    <BuyMeACoffee />
                </div>
            </div>
        </div>
    );
}
