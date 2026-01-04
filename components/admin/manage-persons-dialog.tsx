"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { getPersonsByFamily, deletePerson } from "@/lib/actions/person";
import { toast } from "sonner";
import { Loader2, Users, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManagePersonsDialogProps {
    familyId: string;
    familyAlias: string;
    children: React.ReactNode;
}

export function ManagePersonsDialog({ familyId, familyAlias, children }: ManagePersonsDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [persons, setPersons] = useState<Array<{ id: string; firstName: string; lastName: string; role?: string | null; age?: number | null; gifts: any[] }>>([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState<{ id: string; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Load persons when dialog opens
    useEffect(() => {
        async function loadPersons() {
            try {
                const result = await getPersonsByFamily(familyId);
                setPersons(result);
            } catch (error) {
                console.error("Failed to load persons:", error);
                toast.error("Failed to load persons");
            }
        }

        if (isOpen) {
            loadPersons();
        }
    }, [isOpen, familyId]);

    async function handleDeletePerson(personId: string) {
        setIsDeleting(true);
        try {
            await deletePerson(personId);
            toast.success("Person removed from family");
            setShowDeleteDialog(null);
            // Reload persons
            const result = await getPersonsByFamily(familyId);
            setPersons(result);
        } catch (error) {
            toast.error("Failed to remove person");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Manage People - {familyAlias}
                    </DialogTitle>
                    <DialogDescription>
                        Add, view, and remove people from this family.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {persons.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No people added to this family yet.</p>
                            <p className="text-sm text-muted-foreground/70">Add people to start assigning gifts to them.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {persons.map((person) => {
                                const giftCount = person.gifts?.length || 0;
                                return (
                                    <div
                                        key={person.id}
                                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/10">
                                                <Users className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {person.firstName} {person.lastName}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {giftCount} {giftCount === 1 ? 'gift' : 'gifts'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDeleteDialog({ id: person.id, name: `${person.firstName} ${person.lastName}` })}
                                            disabled={isDeleting}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            {isDeleting && showDeleteDialog?.id === person.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t border-border pt-4">
                    <CreatePersonDialog
                        familyId={familyId}
                        familyAlias={familyAlias}
                        onSuccess={async () => {
                            // Reload persons after adding
                            const result = await getPersonsByFamily(familyId);
                            setPersons(result);
                        }}
                    >
                        <Button className="w-full gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Person
                        </Button>
                    </CreatePersonDialog>
                </div>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={showDeleteDialog !== null}
                    onOpenChange={() => setShowDeleteDialog(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Person?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove "{showDeleteDialog?.name}" from the family. Any gifts assigned to this person will become unassigned.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (showDeleteDialog) {
                                        handleDeletePerson(showDeleteDialog.id);
                                    }
                                }}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    "Remove Person"
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}

// Helper component for creating persons inline
function CreatePersonDialog({ familyId, familyAlias, onSuccess, children }: { familyId: string; familyAlias: string; onSuccess?: () => void; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        role: "",
        age: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { createPerson } = await import("@/lib/actions/person");
            await createPerson(
                familyId,
                formData.firstName,
                formData.lastName,
                formData.role || undefined,
                formData.age ? parseInt(formData.age) : undefined
            );
            toast.success(`Added ${formData.firstName} ${formData.lastName} to ${familyAlias}`);
            setFormData({ firstName: "", lastName: "", role: "", age: "" });
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
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Person to {familyAlias}</DialogTitle>
                    <DialogDescription>
                        Add a new person to this family. Role and age will be shown to donors.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="John"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Doe"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select role (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
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
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
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
