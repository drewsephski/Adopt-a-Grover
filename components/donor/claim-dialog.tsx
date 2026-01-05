"use client";

import { useState } from "react";
import { getAvailableQuantity } from "@/lib/types";
import type { GiftWithClaims } from "@/lib/types";
import { claimGift } from "@/lib/actions/claim";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Heart,
    CheckCircle2,
    Calendar,
    MapPin
} from "lucide-react";

interface ClaimDialogProps {
    gift: GiftWithClaims;
    children: React.ReactNode;
    disabled?: boolean;
}

export function ClaimDialog({ gift, children, disabled }: ClaimDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        donorName: "",
        donorEmail: "",
        quantity: 1,
    });

    const available = getAvailableQuantity(gift);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            await claimGift(
                gift.id,
                formData.donorName,
                formData.donorEmail,
                formData.quantity
            );
            setStep(2);
            toast.success("Gift claimed! Thank you for your generosity.");
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
            setFormData({ donorName: "", donorEmail: "", quantity: 1 });
        }, 300);
    }

    function handleOpenChange(open: boolean) {
        // Prevent closing if we're loading or on success step
        if (!open && (isLoading || step === 2)) {
            return;
        }
        setIsOpen(open);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {disabled ? (
                children
            ) : (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="bg-primary/10 p-6 sm:p-8 pb-4 sm:pb-6">
                            <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Heart className="h-7 w-7 text-primary fill-primary/10" />
                            </div>
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                    Claim {gift.name}
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-sm sm:text-base">
                                    Ready to brighten someone&apos;s holiday? Just fill in your details below.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="donorName" className="text-sm font-bold text-foreground ml-1">Your Name</Label>
                                    <Input
                                        id="donorName"
                                        placeholder="Jane Doe"
                                        className="h-10 sm:h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground"
                                        required
                                        value={formData.donorName}
                                        onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="donorEmail" className="text-sm font-bold text-foreground ml-1">Email Address</Label>
                                    <Input
                                        id="donorEmail"
                                        type="email"
                                        placeholder="jane@example.com"
                                        className="h-10 sm:h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground"
                                        required
                                        value={formData.donorEmail}
                                        onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground ml-1 italic">We&apos;ll send a confirmation and drop-off instructions.</p>
                                </div>

                                {available > 1 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity" className="text-sm font-bold text-foreground ml-1">Quantity</Label>
                                        <Select
                                            value={formData.quantity.toString()}
                                            onValueChange={(value) => setFormData({ ...formData, quantity: parseInt(value) })}
                                        >
                                            <SelectTrigger id="quantity" className="h-10 sm:h-12 rounded-xl bg-muted border-border focus:bg-background transition-all text-foreground font-medium">
                                                <SelectValue placeholder="Select quantity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: available }).map((_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                        {i + 1}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 pt-0 flex gap-3 sm:gap-4 md:gap-6">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:w-auto rounded-xl font-bold text-muted-foreground text-sm sm:text-base"
                                onClick={handleClose}
                                disabled={isLoading}
                                size="default"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-full sm:w-auto rounded-xl bg-destructive hover:bg-destructive/90 font-bold shadow-lg shadow-destructive/20 transition-all active:scale-[0.98] text-background text-sm sm:text-base"
                                disabled={isLoading}
                                size="default"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Confirm Claim"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="flex flex-col">
                        <div className="bg-primary/10 p-8 sm:p-10 flex flex-col items-center text-center">
                            <div className="bg-background w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-6 animate-in zoom-in duration-500">
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Thank You, {formData.donorName}!</h2>
                            <p className="text-muted-foreground">You&apos;ve successfully claimed this gift.</p>
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
                                        <p className="text-sm text-muted-foreground">Please drop off by Monday, Dec 16th.</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full rounded-xl bg-foreground hover:bg-foreground/90 font-bold transition-all active:scale-[0.98] text-background text-sm sm:text-base"
                                size="default"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
