"use client";

import { useState } from "react";
import { adoptPerson } from "@/lib/actions/claim";
import type { PersonWithGifts } from "@/lib/types";
import { getAvailableQuantity } from "@/lib/types";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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

interface AdoptPersonDialogProps {
    familyId: string;
    person: PersonWithGifts;
    children: React.ReactNode;
    disabled?: boolean;
}

export function AdoptPersonDialog({ familyId, person, children, disabled }: AdoptPersonDialogProps) {
    const personId = person.id.startsWith('temp-') ? undefined : person.id;
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
            // For temporary persons (from old schema), we can't adopt by person
            if (!personId) {
                throw new Error("Please add this person to the family first to adopt their gifts");
            }

            await adoptPerson(
                familyId,
                personId,
                formData.donorName,
                formData.donorEmail
            );
            setStep(2);
            toast.success(`You've adopted ${person.firstName} ${person.lastName}! Thank you so much.`);
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

    function handleOpenChange(open: boolean) {
        // Prevent closing the dialog when on the thank you screen (step 2)
        // Only allow closing if the user explicitly clicks the Close button
        if (!open && step === 2) {
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
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="bg-primary/10 p-8 pb-6 text-center flex flex-col items-center">
                            <div className="bg-background w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Sparkles className="h-8 w-8 text-primary fill-primary/10" />
                            </div>
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">
                                    Adopt "{person.firstName} {person.lastName}"
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground text-base">
                                    By adopting this person, you're committing to provide ALL remaining items on their list.
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

                            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 space-y-4">
                                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Your Impact Summary</p>
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] font-bold">
                                        {person.gifts.filter((g: any) => getAvailableQuantity(g) > 0).length} ITEMS
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                                    {person.gifts
                                        .filter((g: any) => getAvailableQuantity(g) > 0)
                                        .map((g: any) => (
                                            <div key={g.id} className="flex items-center gap-3 bg-background/50 p-2.5 rounded-xl border border-primary/5 group/item transition-colors hover:bg-background">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {getAvailableQuantity(g)}x
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                                                    {g.description && <p className="text-[10px] text-muted-foreground truncate">{g.description}</p>}
                                                </div>
                                            </div>
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
                                className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
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
                            <p className="text-muted-foreground text-lg">Thank you for adopting &quot;{person.fullName}&quot;.</p>
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
