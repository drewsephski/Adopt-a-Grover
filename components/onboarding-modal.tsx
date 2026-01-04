"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Search, Gift, Truck, ThumbsUp, ThumbsDown, ArrowRight, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OnboardingModalProps {
    children: React.ReactNode;
}

export function OnboardingModal({ children }: OnboardingModalProps) {
    const [step, setStep] = useState(1);
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);
    const [comment, setComment] = useState("");

    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            setOpen(false);
            setStep(1); // Reset for next time
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
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-6 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                                <Heart className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Welcome to Adopt a Grover!</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Connect with Fox River Grove families who need a little extra holiday cheer this season.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4 text-left">
                            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 hover:bg-muted transition-colors">
                                <span className="font-semibold block mb-1 text-primary">Anonymous</span>
                                <span className="text-sm text-muted-foreground">Privacy is protected for all families.</span>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 hover:bg-muted transition-colors">
                                <span className="font-semibold block mb-1 text-primary">Impactful</span>
                                <span className="text-sm text-muted-foreground">Directly help your neighbors.</span>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-6 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                                <Search className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Step 1: Browse & Choose</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Explore our list of families. Filter by size or specific needs to find the perfect match for you.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-muted/50 px-6 py-3 rounded-full border border-border/50">
                            <Gift className="w-5 h-5 text-primary" />
                            <span className="font-medium">Select gifts you want to provide</span>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-6 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                                <Truck className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Step 2: Purchase & Deliver</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Purchase the gifts, wrap them, and we&apos;ll handle the delivery logistics.
                            </p>
                        </div>
                        <div className="w-full max-w-xs mx-auto bg-muted/30 rounded-xl p-4 border border-border/50">
                            <ul className="text-left space-y-3">
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Receive confirmation email</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Wrap & Label gifts</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium">Drop off at verified location</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className={`flex flex-col items-center text-center space-y-6 py-6 ${animationClass}`}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative p-6 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                                <Check className="w-12 h-12" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">You&apos;re Ready!</h3>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
                                Thank you for making a difference. Before you go, was this quick tour helpful?
                            </p>
                        </div>

                        <div className="flex flex-col gap-6 w-full max-w-xs bg-muted/30 p-6 rounded-xl border border-border/50">
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant={feedback === 'helpful' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback('helpful')}
                                    className="gap-2 flex-1"
                                >
                                    <ThumbsUp className="w-4 h-4" /> Yes
                                </Button>
                                <Button
                                    variant={feedback === 'not-helpful' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback('not-helpful')}
                                    className="gap-2 flex-1"
                                >
                                    <ThumbsDown className="w-4 h-4" /> No
                                </Button>
                            </div>

                            {feedback && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                    <Label htmlFor="feedback" className="text-xs font-semibold text-left block text-muted-foreground uppercase tracking-wider">
                                        Additional feedback (Optional)
                                    </Label>
                                    <Textarea
                                        id="feedback"
                                        placeholder="Tell us how we can improve..."
                                        className="text-sm resize-none bg-background min-h-[80px]"
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
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-300 ${i + 1 <= step ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/30"
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                    <DialogTitle className="sr-only">Onboarding Step {step}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Step {step} of {totalSteps} in the onboarding process.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-4 min-h-[400px] flex items-center justify-center">
                    <div key={step} className="w-full">
                        {/* Wrapper with key to force re-render for animation */}
                        {contentForStep(step)}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 flex sm:justify-between items-center sm:items-center gap-2 bg-muted/10 border-t border-border/50">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`text-muted-foreground hover:text-foreground ${step === 1 ? "invisible" : ""}`}
                    >
                        Back
                    </Button>
                    <div className="flex gap-2">
                        {step === totalSteps ? (
                            <Button asChild className="gap-2 px-8 shadow-md hover:shadow-lg transition-all rounded-full">
                                <Link href="/" onClick={() => setOpen(false)}>
                                    Start Browsing <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button onClick={handleNext} className="gap-2 rounded-full px-6">
                                Next <ArrowRight className="w-4 h-4" />
                            </Button>
                        )}

                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
