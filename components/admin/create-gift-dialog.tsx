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
    const [persons, setPersons] = useState<Array<{ id: string; firstName: string; role: string | null; age: number | null }>>([]);

    const [formData, setFormData] = useState({
        name: "",
        quantity: 1,
        description: "",
        productUrl: "",
        personId: initialPersonId || "",
        createNewPerson: !initialPersonId,
        newPersonFirstName: "",
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
        if (formData.createNewPerson) {
            if (!formData.newPersonFirstName.trim()) {
                toast.error("Please provide a name for the new person");
                return;
            }
        }

        // Validate existing person selection if not creating a new person
        if (!formData.createNewPerson && !formData.personId) {
            toast.error("Please select a person or choose to create a new person");
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
                    firstName: formData.newPersonFirstName,
                    role: formData.newPersonRole || undefined,
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
                newPersonFirstName: "",
                newPersonRole: "",
                newPersonAge: ""
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add gift";
            toast.error(message);
            console.error("Failed to add gift:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[425px]">
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
                    <div className="grid gap-1.5 py-2">
                        {!initialPersonId && (
                            <>
                                <div className="grid gap-1">
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant={formData.createNewPerson ? "default" : "outline"}
                                            onClick={() => setFormData(prev => ({ ...prev, createNewPerson: true, personId: "" }))}
                                            className="flex-1 h-9 text-xs"
                                        >
                                            New Person
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={!formData.createNewPerson ? "default" : "outline"}
                                            onClick={() => {
                                                if (persons.length === 0) {
                                                    toast.error("No family members exist yet. Please add family members first or create a new person.");
                                                    return;
                                                }
                                                setFormData(prev => ({
                                                    ...prev,
                                                    createNewPerson: false,
                                                    personId: persons[0]?.id || ""
                                                }));
                                            }}
                                            className="flex-1 h-9 text-xs"
                                        >
                                            Existing Person
                                        </Button>
                                    </div>
                                    {persons.length === 0 && !formData.createNewPerson && (
                                        <p className="text-[10px] text-muted-foreground">
                                            No family members available
                                        </p>
                                    )}
                                </div>

                                {formData.createNewPerson ? (
                                    <>
                                        <div className="grid gap-0.5">
                                            <Label htmlFor="newPersonFirstName" className="text-[10px]">Name *</Label>
                                            <Input
                                                id="newPersonFirstName"
                                                className="h-9 text-xs"
                                                placeholder="e.g. John"
                                                value={formData.newPersonFirstName}
                                                onChange={(e) => setFormData(prev => ({ ...prev, newPersonFirstName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="grid gap-0.5">
                                                <Label htmlFor="newPersonRole" className="text-[10px]">Role</Label>
                                                <Input
                                                    id="newPersonRole"
                                                    className="h-9 text-xs"
                                                    placeholder="e.g. Boy"
                                                    value={formData.newPersonRole}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newPersonRole: e.target.value }))}
                                                />
                                            </div>
                                            <div className="grid gap-0.5">
                                                <Label htmlFor="newPersonAge" className="text-[10px]">Age</Label>
                                                <Input
                                                    id="newPersonAge"
                                                    type="number"
                                                    min="0"
                                                    max="120"
                                                    className="h-9 text-xs"
                                                    placeholder="e.g. 8"
                                                    value={formData.newPersonAge}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, newPersonAge: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid gap-0.5">
                                        <Label htmlFor="personId" className="text-[10px]">Person *</Label>
                                        <Select
                                            value={formData.personId}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}
                                        >
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select a person" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {persons.map((person) => (
                                                    <SelectItem key={person.id} value={person.id}>
                                                        {person.role && person.age
                                                            ? `${person.role}, ${person.age}`
                                                            : person.role
                                                                ? person.role
                                                                : person.firstName
                                                                    ? person.firstName
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
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-0.5">
                                <Label htmlFor="name" className="text-[10px]">Name</Label>
                                <Input
                                    id="name"
                                    className="h-9 text-xs"
                                    placeholder="e.g. LEGO Set"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="grid gap-0.5">
                                <Label htmlFor="quantity" className="text-[10px]">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    className="h-9 text-xs"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-0.5">
                            <Label htmlFor="description" className="text-[10px]">Description</Label>
                            <Textarea
                                id="description"
                                className="min-h-[35px] px-2 py-1 text-xs"
                                placeholder="Size, color..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-0.5">
                            <Label htmlFor="productUrl" className="text-[10px]">Link (opt)</Label>
                            <Input
                                id="productUrl"
                                className="h-9 text-xs"
                                placeholder="Amazon, Target..."
                                value={formData.productUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, productUrl: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isLoading ||
                                !formData.name.trim() ||
                                (!formData.createNewPerson && !formData.personId) ||
                                (formData.createNewPerson && !formData.newPersonFirstName.trim())
                            }
                            className="w-full sm:w-auto h-9 text-xs"
                        >
                            {isLoading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                            Add Gift
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
