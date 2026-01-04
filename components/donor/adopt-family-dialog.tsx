"use client";

import { useState } from "react";
import { adoptFamily } from "@/lib/actions/claim";
import type { FamilyWithGifts } from "@/lib/types";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Loader2,
    Heart,
    Mail,
    User,
    Calendar,
    MapPin,
    Sparkles
} from "lucide-react";

interface AdoptFamilyDialogProps {
    family: FamilyWithGifts;
    children: React.ReactNode;
}

export function AdoptFamilyDialog({ family, children }: AdoptFamilyDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        donorName: "",
        donorEmail: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            await adoptFamily(
                family.id,
                formData.donorName,
                formData.donorEmail
            );
            setStep(2);
            toast.success(`You've adopted ${family.alias}! Thank you so much.`);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        setIsOpen(false);
        // Reset state after transition
        setTimeout(() => {
            setStep(1);
            setFormData({ donorName: "", donorEmail: "" });
        }, 300);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="bg-primary/10 p-8 pb-6 text-center flex flex-col items-center">
                            <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Sparkles className="h-8 w-8 text-primary fill-primary/10" />
                            </div>
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                                    Adopt &quot;{family.alias}&quot;
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-base">
                                    By adopting this family, you&apos;re committing to provide ALL remaining items on their list.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="donorName" className="text-sm font-bold text-foreground ml-1">Your Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="donorName"
                                            placeholder="Jane Doe"
                                            className="pl-11 h-12 rounded-xl bg-muted border-border focus:bg-background transition-all"
                                            required
                                            value={formData.donorName}
                                            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="donorEmail" className="text-sm font-bold text-foreground ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="donorEmail"
                                            type="email"
                                            placeholder="jane@example.com"
                                            className="pl-11 h-12 rounded-xl bg-muted border-border focus:bg-background transition-all"
                                            required
                                            value={formData.donorEmail}
                                            onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground ml-1 italic">We&apos;ll send a full summary and drop-off instructions.</p>
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Items you are claiming:</p>
                                <div className="flex flex-wrap gap-2">
                                    {family.gifts.map(g => (
                                        <span key={g.id} className="text-[10px] bg-background px-2 py-1 rounded-md text-foreground border border-primary/10">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 pt-0 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl font-bold text-muted-foreground"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] text-background"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Confirm Adoption"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col">
                        <div className="bg-primary/10 p-10 flex flex-col items-center text-center">
                            <div className="bg-background w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-6 animate-in zoom-in duration-500">
                                <Heart className="h-10 w-10 text-primary fill-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground mb-2">You&apos;re a Hero!</h2>
                            <p className="text-muted-foreground text-lg">Thank you for adopting &quot;{family.alias}&quot;.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Important Next Steps</h3>

                                <div className="bg-muted rounded-2xl p-5 border border-border flex gap-4">
                                    <div className="p-2 h-fit rounded-lg bg-background shadow-sm">
                                        <MapPin className="h-5 w-5 text-secondary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground mb-0.5">Drop-off Location</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            624 Ellington Court<br />
                                            Fox River Grove, IL 60021
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-2xl p-5 border border-border flex gap-4">
                                    <div className="p-2 h-fit rounded-lg bg-background shadow-sm">
                                        <Calendar className="h-5 w-5 text-accent-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground mb-0.5">Deadline</p>
                                        <p className="text-sm text-muted-foreground">Please drop off all items by Monday, Dec 19th.</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-bold transition-all active:scale-[0.98]"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
