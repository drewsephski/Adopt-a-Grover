"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateGift } from "@/lib/actions/gift";
import { getPersonsByFamily } from "@/lib/actions/person";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Gift } from "@/lib/types";

interface EditGiftDialogProps {
    gift: Gift;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditGiftDialog({ gift, open, onOpenChange }: EditGiftDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [persons, setPersons] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

    const [formData, setFormData] = useState({
        name: gift.name,
        quantity: gift.quantity,
        description: gift.description || "",
        productUrl: gift.productUrl || "",
        personId: gift.personId || ""
    });

    // Load persons when dialog opens
    useEffect(() => {
        async function loadPersons() {
            try {
                const result = await getPersonsByFamily(gift.familyId);
                setPersons(result);
            } catch (error) {
                console.error("Failed to load persons:", error);
            }
        }

        if (open) {
            loadPersons();
        }
    }, [open, gift.familyId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name.trim() || formData.quantity < 1) return;

        setIsLoading(true);
        try {
            await updateGift(gift.id, {
                name: formData.name,
                quantity: formData.quantity,
                description: formData.description || null,
                productUrl: formData.productUrl || null,
                personId: formData.personId || null
            });
            toast.success("Gift updated successfully");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update gift");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Gift Details</DialogTitle>
                        <DialogDescription>
                            Update the details for &quot;{gift.name}&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        {persons.length > 0 && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-personId" className="text-right">Person</Label>
                                <Select
                                    value={formData.personId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a person (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Unassigned</SelectItem>
                                        {persons.map((person) => (
                                            <SelectItem key={person.id} value={person.id}>
                                                {person.firstName} {person.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input
                                id="edit-name"
                                className="col-span-3 text-foreground"
                                placeholder="e.g. LEGO Star Wars Set"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                            <Input
                                id="edit-quantity"
                                type="number"
                                min="1"
                                className="col-span-3 text-foreground"
                                value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-description" className="text-right pt-2">Description</Label>
                            <Textarea
                                id="edit-description"
                                className="col-span-3 text-foreground"
                                placeholder="Size, color, or specific details for the donor..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-productUrl" className="text-right">Link (opt)</Label>
                            <Input
                                id="edit-productUrl"
                                className="col-span-3 text-foreground"
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
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !formData.name.trim()}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
