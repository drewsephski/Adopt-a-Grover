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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGift } from "@/lib/actions/gift";
import { getPersonsByFamily } from "@/lib/actions/person";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateGiftDialogProps {
    familyId: string;
    personId?: string;
    personName?: string;
    children: React.ReactNode;
}

export function CreateGiftDialog({ familyId, personId: initialPersonId, personName, children }: CreateGiftDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [persons, setPersons] = useState<Array<{ id: string; firstName: string; lastName: string; role: string | null; age: number | null }>>([]);

    const [formData, setFormData] = useState({
        name: "",
        quantity: 1,
        description: "",
        productUrl: "",
        personId: initialPersonId || "",
        createNewPerson: !initialPersonId,
        newPersonRole: "",
        newPersonAge: ""
    });

    // Load persons when dialog opens
    async function loadPersons() {
        try {
            const result = await getPersonsByFamily(familyId);
            setPersons(result);
        } catch (error) {
            console.error("Failed to load persons:", error);
        }
    }

    function handleOpenChange(newOpen: boolean) {
        setOpen(newOpen);
        if (newOpen) {
            loadPersons();
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.name.trim() || formData.quantity < 1) return;

        // Validate new person fields if creating a new person
        if (formData.createNewPerson && !formData.newPersonRole.trim()) {
            toast.error("Please provide a role for the new person");
            return;
        }

        setIsLoading(true);
        try {
            await createGift(
                familyId,
                formData.name,
                formData.quantity,
                formData.description,
                formData.productUrl,
                formData.personId || undefined,
                formData.createNewPerson ? {
                    role: formData.newPersonRole,
                    age: formData.newPersonAge ? parseInt(formData.newPersonAge) : undefined
                } : undefined
            );
            toast.success("Gift added successfully");
            setOpen(false);
            setFormData({
                name: "",
                quantity: 1,
                description: "",
                productUrl: "",
                personId: initialPersonId || "",
                createNewPerson: !initialPersonId,
                newPersonRole: "",
                newPersonAge: ""
            });
        } catch (error) {
            toast.error("Failed to add gift");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {personName ? `Add Gift for ${personName}` : "Add Gift Idea"}
                        </DialogTitle>
                        <DialogDescription>
                            {personName
                                ? `Specify a gift item requested by ${personName}.`
                                : "Specify a gift item requested by this family."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-5 py-6">
                        {!initialPersonId && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Assign to</Label>
                                    <div className="col-span-3 flex gap-2">
                                        <Button
                                            type="button"
                                            variant={formData.createNewPerson ? "default" : "outline"}
                                            onClick={() => setFormData(prev => ({ ...prev, createNewPerson: true, personId: "" }))}
                                            className="flex-1"
                                        >
                                            New Person
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={!formData.createNewPerson ? "default" : "outline"}
                                            onClick={() => setFormData(prev => ({ ...prev, createNewPerson: false }))}
                                            className="flex-1"
                                            disabled={persons.length === 0}
                                        >
                                            Existing Person
                                        </Button>
                                    </div>
                                </div>

                                {formData.createNewPerson ? (
                                    <>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="newPersonRole" className="text-right">Role *</Label>
                                            <Input
                                                id="newPersonRole"
                                                className="col-span-3"
                                                placeholder="e.g. Boy, Girl, Mother, Father"
                                                value={formData.newPersonRole}
                                                onChange={(e) => setFormData(prev => ({ ...prev, newPersonRole: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="newPersonAge" className="text-right">Age</Label>
                                            <Input
                                                id="newPersonAge"
                                                type="number"
                                                min="0"
                                                max="120"
                                                className="col-span-3"
                                                placeholder="e.g. 8"
                                                value={formData.newPersonAge}
                                                onChange={(e) => setFormData(prev => ({ ...prev, newPersonAge: e.target.value }))}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="personId" className="text-right">Person</Label>
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
                                                        {person.role && person.age
                                                            ? `${person.role}, ${person.age}`
                                                            : person.role
                                                                ? person.role
                                                                : person.firstName && person.lastName
                                                                    ? `${person.firstName} ${person.lastName}`
                                                                    : 'Unnamed'
                                                        }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </>
                        )}
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
                                placeholder="Size, color, or specific details for donor..."
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
