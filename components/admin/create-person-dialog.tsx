"use client";

import { useState } from "react";
import { createPerson } from "@/lib/actions/person";
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
import { Loader2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreatePersonDialogProps {
    familyId: string;
    familyAlias: string;
    onSuccess?: () => void;
}

export function CreatePersonDialog({ familyId, familyAlias, onSuccess }: CreatePersonDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        role: "",
        age: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createPerson(
                familyId,
                formData.firstName,
                formData.role === "unassigned" ? undefined : formData.role || undefined,
                formData.age ? parseInt(formData.age) : undefined
            );
            toast.success(`Added ${formData.firstName} to ${familyAlias}`);
            setFormData({ firstName: "", role: "", age: "" });
            setIsOpen(false);
            onSuccess?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Person
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Person to Family</DialogTitle>
                    <DialogDescription>
                        Add a new person to &quot;{familyAlias}&quot; family. Role and age will be shown to donors.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Name</Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger id="role" className="h-11 px-4 py-3">
                                <SelectValue placeholder="Select role (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                <SelectItem value="Boy">Boy</SelectItem>
                                <SelectItem value="Girl">Girl</SelectItem>
                                <SelectItem value="Mother">Mother</SelectItem>
                                <SelectItem value="Father">Father</SelectItem>
                                <SelectItem value="Grandmother">Grandmother</SelectItem>
                                <SelectItem value="Grandfather">Grandfather</SelectItem>
                                <SelectItem value="Infant">Infant</SelectItem>
                                <SelectItem value="Teen">Teen</SelectItem>
                                <SelectItem value="Adult">Adult</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            min="0"
                            max="120"
                            placeholder="12"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full sm:w-auto h-11"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Person"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
