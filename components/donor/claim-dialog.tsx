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
    Loader2,
    Heart,
    Mail,
    User,
    CheckCircle2,
    Calendar,
    MapPin
} from "lucide-react";

interface ClaimDialogProps {
    gift: GiftWithClaims;
    children: React.ReactNode;
}

export function ClaimDialog({ gift, children }: ClaimDialogProps) {
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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-[2rem] shadow-2xl">
                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="bg-rose-50/50 p-8 pb-6">
                            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Heart className="h-7 w-7 text-rose-500 fill-rose-500/10" />
                            </div>
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
                                    Claim &quot;{gift.name}&quot;
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 text-base">
                                    Ready to brighten someone&apos;s holiday? Just fill in your details below.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="donorName" className="text-sm font-bold text-slate-700 ml-1">Your Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="donorName"
                                            placeholder="Jane Doe"
                                            className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-slate-900"
                                            required
                                            value={formData.donorName}
                                            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="donorEmail" className="text-sm font-bold text-slate-700 ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="donorEmail"
                                            type="email"
                                            placeholder="jane@example.com"
                                            className="pl-11 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-slate-900"
                                            required
                                            value={formData.donorEmail}
                                            onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1 italic">We&apos;ll send a confirmation and drop-off instructions.</p>
                                </div>

                                {available > 1 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="quantity" className="text-sm font-bold text-slate-700 ml-1">Quantity</Label>
                                        <select
                                            id="quantity"
                                            className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 focus:bg-white transition-all outline-none text-slate-900 font-medium"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        >
                                            {Array.from({ length: available }).map((_, i) => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 pt-0 flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl font-bold text-slate-500"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-12 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold shadow-lg shadow-rose-200 transition-all active:scale-[0.98] text-white"
                                disabled={isLoading}
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
                        <div className="bg-emerald-50/50 p-10 flex flex-col items-center text-center">
                            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-6 animate-in zoom-in duration-500">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You, {formData.donorName}!</h2>
                            <p className="text-slate-500">You&apos;ve successfully claimed this gift.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Important Next Steps</h3>

                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex gap-4">
                                    <div className="p-2 h-fit rounded-lg bg-white shadow-sm">
                                        <MapPin className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-0.5">Drop-off Location</p>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Fox River Grove Village Hall<br />
                                            305 Illinois Route 22<br />
                                            Fox River Grove, IL 60021
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex gap-4">
                                    <div className="p-2 h-fit rounded-lg bg-white shadow-sm">
                                        <Calendar className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-0.5">Deadline</p>
                                        <p className="text-sm text-slate-500">Please drop off by Monday, Dec 16th.</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold transition-all active:scale-[0.98] text-white"
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
