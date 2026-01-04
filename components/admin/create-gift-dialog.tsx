"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createGift } from "@/lib/actions/gift";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateGiftDialogProps {
    familyId: string;
    children: React.ReactNode;
}

export function CreateGiftDialog({ familyId, children }: CreateGiftDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        quantity: 1,
        description: "",
        productUrl: ""
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name.trim() || formData.quantity < 1) return;

        setIsLoading(true);
        try {
            await createGift(
                familyId,
                formData.name,
                formData.quantity,
                formData.description,
                formData.productUrl
            );
            toast.success("Gift added successfully");
            setOpen(false);
            setFormData({
                name: "",
                quantity: 1,
                description: "",
                productUrl: ""
            });
        } catch (error) {
            toast.error("Failed to add gift");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Gift Idea</DialogTitle>
                        <DialogDescription>
                            Specify a gift item requested by this family.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                className="col-span-3"
                                placeholder="e.g. LEGO Star Wars Set"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="quantity" className="text-right">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="1"
                                className="col-span-3"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">Description</Label>
                            <Textarea
                                id="description"
                                className="col-span-3"
                                placeholder="Size, color, or specific details for the donor..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="productUrl" className="text-right">Link (opt)</Label>
                            <Input
                                id="productUrl"
                                className="col-span-3"
                                placeholder="Amazon, Target, Walmart link..."
                                value={formData.productUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Gift Listing
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
