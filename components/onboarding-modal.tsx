"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Search, Truck, ThumbsUp, ThumbsDown, ArrowRight, Check, Users, Shield, Sparkles, Package, Box } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface OnboardingModalProps {
    children: React.ReactNode;
}

export function OnboardingModal({ children }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);
    const [comment, setComment] = useState("");

    const totalSteps = 5;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            // Handle feedback submission
            if (feedback || comment) {
                // Here you could send feedback to your backend
                console.log("Feedback submitted:", { feedback, comment });
            }
            setOpen(false);
            setStep(1); // Reset for next time
            setFeedback(null);
            setComment("");
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFeedback = (type: "helpful" | "not-helpful") => {
        setFeedback(type);
    };

    const contentForStep = (currentStep: number) => {
        const animationClass = "animate-in fade-in slide-in-from-right-8 duration-300 ease-out";

        switch (currentStep) {
            case 1:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full text-primary ring-2 ring-primary/20 border border-primary/10">
                                <Sparkles className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">Welcome to Pitch In List!</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                The modern SignUp Genius alternative built for community giving. Smart features that generic signup tools miss.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full mt-4">
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="text-left">
                                        <span className="font-semibold block text-primary">100% Private</span>
                                        <span className="text-sm text-muted-foreground">Better privacy than SignUp Genius</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="text-left">
                                        <span className="font-semibold block text-primary">Smart Matching</span>
                                        <span className="text-sm text-muted-foreground">Unlike generic signup tools</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20 hover:border-primary/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Package className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="text-left">
                                        <span className="font-semibold block text-primary">No Conflicts</span>
                                        <span className="text-sm text-muted-foreground">Something SignUp Genius can&apos;t do</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full text-primary ring-2 ring-primary/20 border border-primary/10">
                                <Search className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">Step 1: Browse & Choose</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Browse opportunities with confidence. Our smart filtering prcampaigns the confusion that happens with generic signup tools.
                            </p>
                        </div>
                        <div className="w-full max-w-sm space-y-4">
                            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                <div className="flex items-center gap-3 mb-3">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Pro Tip</Badge>
                                </div>
                                <ul className="text-left space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm">See real-time availability</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm">Filter by family needs</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm">No duplicate signups</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full text-primary ring-2 ring-primary/20 border border-primary/10">
                                <Truck className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">Step 2: Claim & Confirm</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Claim with instant confirmation. No more wondering if your signup went through like with other tools.
                            </p>
                        </div>
                        <div className="w-full max-w-sm bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                                        <span className="text-white text-xs font-bold">1</span>
                                    </div>
                                    <span className="text-sm font-medium">Click &quot;Claim Gift&quot; on your selection</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                                        <span className="text-white text-xs font-bold">2</span>
                                    </div>
                                    <span className="text-sm font-medium">Fill in your contact information</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 animate-pulse">
                                        <span className="text-white text-xs font-bold">3</span>
                                    </div>
                                    <span className="text-sm font-medium">Get instant email confirmation</span>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <p className="text-xs text-primary font-medium">
                                    ✓ Drop-off location and deadline included
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full text-primary ring-2 ring-primary/20 border border-primary/10">
                                <Heart className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">Step 3: Make It Happen</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Complete your donation with confidence. We provide the coordination that SignUp Genius lacks.
                            </p>
                        </div>
                        <div className="w-full max-w-sm space-y-3">
                            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                                <h4 className="font-semibold text-primary mb-3 text-sm">Gift Guidelines</h4>
                                <ul className="text-left space-y-2 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Box className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>New, unwrapped gifts preferred</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Include gift receipt when possible</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                                        <span>Age-appropriate selections only</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-primary/10 rounded-xl p-3 border border-primary/20">
                                <p className="text-xs text-primary font-medium flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Drop-off details in your confirmation email
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-xl rounded-full animate-pulse" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full text-primary ring-2 ring-primary/20 border border-primary/10">
                                <Check className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tight">You&apos;re All Set!</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                You&apos;re ready to make a difference! Thank you for choosing a smarter way to coordinate community giving.
                            </p>
                        </div>

                        <div className="flex flex-col gap-6 w-full max-w-sm bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
                            <div className="text-center">
                                <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">Ready to Help</Badge>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Was this guide helpful? We&apos;d love to hear your feedback!
                                </p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant={feedback === 'helpful' ? "default" : "outline"}
                                    onClick={() => handleFeedback('helpful')}
                                    className="gap-2 flex-1 h-11"
                                >
                                    <ThumbsUp className="w-4 h-4" /> Helpful
                                </Button>
                                <Button
                                    variant={feedback === 'not-helpful' ? "default" : "outline"}
                                    onClick={() => handleFeedback('not-helpful')}
                                    className="gap-2 flex-1 h-11"
                                >
                                    <ThumbsDown className="w-4 h-4" /> Not Helpful
                                </Button>
                            </div>

                            {feedback && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <Label htmlFor="feedback" className="text-xs font-semibold text-left block text-muted-foreground uppercase tracking-wider">
                                        Additional feedback (Optional)
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Tell us how we can improve this guide..."
                                        className="text-sm resize-none bg-background min-h-[100px] px-4 py-3"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-w-lg sm:max-w-[600px] p-0 overflow-hidden gap-0 mx-4 sm:mx-auto">
                <DialogHeader className="p-6 pb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-500 ${i + 1 <= step ? "bg-gradient-to-r from-primary to-primary/80 min-w-[2rem]" : "w-2 bg-muted hover:bg-muted-foreground/30"
                                        }`}
                                    aria-label={`Step ${i + 1}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            {step} of {totalSteps}
                        </span>
                    </div>
                    <div className="mb-2">
                        {/* Progress bar removed for now - can be added later if needed */}
                    </div>
                    <DialogTitle className="sr-only">Onboarding Step {step}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Step {step} of {totalSteps} in the onboarding process.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-4 flex items-center justify-center">
                    <div key={step} className="w-full">
                        {/* Wrapper with key to force re-render for animation */}
                        {contentForStep(step)}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 flex sm:justify-between items-center sm:items-center gap-4 bg-muted/10 border-t border-border/50">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`text-muted-foreground hover:text-foreground ${step === 1 ? "invisible" : ""}`}
                    >
                        Back
                    </Button>
                    <div className="flex gap-4">
                        {step === totalSteps ? (
                            <Button asChild className="gap-2 px-8 shadow-md hover:shadow-lg transition-all rounded-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                <Link href="#browse" onClick={() => setOpen(false)}>
                                    Start Browsing <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button onClick={handleNext} className="gap-2 rounded-full px-6 h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                {step === totalSteps - 1 ? "Finish" : "Next"} <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}

                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
