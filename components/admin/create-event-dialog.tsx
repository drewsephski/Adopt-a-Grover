"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent } from "@/lib/actions/events";
import { OrganizationType } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, Calendar, Users, Utensils, Trophy, Heart, GraduationCap, Building2, Plus } from "lucide-react";

interface CreateEventDialogProps {
    children: React.ReactNode;
}

// Event type definitions with icons and descriptions
const EVENT_TYPES = [
    {
        type: "POTLUCK",
        name: "Potluck",
        description: "Organize food contributions for parties and gatherings",
        icon: Utensils,
        color: "bg-orange-100 text-orange-700 border-orange-200",
        template: {
            categories: [
                {
                    name: "Main Dishes",
                    description: "Hearty main courses",
                    items: [
                        { name: "Casserole", quantity: 3, itemType: "QUANTITY_BASED" },
                        { name: "Grilled Items", quantity: 2, itemType: "QUANTITY_BASED" }
                    ]
                },
                {
                    name: "Side Dishes",
                    description: "Salads, vegetables, and breads",
                    items: [
                        { name: "Salad", quantity: 4, itemType: "QUANTITY_BASED" },
                        { name: "Bread/Rolls", quantity: 3, itemType: "QUANTITY_BASED" }
                    ]
                },
                {
                    name: "Desserts",
                    description: "Sweet treats to finish",
                    items: [
                        { name: "Cake", quantity: 2, itemType: "QUANTITY_BASED" },
                        { name: "Cookies", quantity: 5, itemType: "QUANTITY_BASED" }
                    ]
                },
                {
                    name: "Drinks & Supplies",
                    description: "Beverages and party essentials",
                    items: [
                        { name: "Soda/Water", quantity: 4, itemType: "QUANTITY_BASED" },
                        { name: "Plates/Cups", quantity: 2, itemType: "QUANTITY_BASED" }
                    ]
                }
            ]
        }
    },
    {
        type: "SPORTS_TEAM",
        name: "Sports Team",
        description: "Manage team rosters and volunteer positions",
        icon: Trophy,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        template: {
            categories: [
                {
                    name: "Player Positions",
                    description: "Team roster spots",
                    items: [
                        { name: "Forward", quantity: 4, itemType: "SINGLE_SLOT" },
                        { name: "Defense", quantity: 4, itemType: "SINGLE_SLOT" },
                        { name: "Goalie", quantity: 1, itemType: "SINGLE_SLOT" }
                    ]
                },
                {
                    name: "Game Day Volunteers",
                    description: "Essential game support roles",
                    items: [
                        { name: "Scorekeeper", quantity: 1, itemType: "SINGLE_SLOT" },
                        { name: "Water/First Aid", quantity: 2, itemType: "SINGLE_SLOT" },
                        { name: "Setup Crew", quantity: 3, itemType: "SINGLE_SLOT" }
                    ]
                }
            ]
        }
    },
    {
        type: "VOLUNTEER",
        name: "Volunteer Event",
        description: "Coordinate volunteers and shifts",
        icon: Users,
        color: "bg-green-100 text-green-700 border-green-200",
        template: {
            categories: [
                {
                    name: "Morning Shift",
                    description: "9:00 AM - 12:00 PM",
                    items: [
                        { name: "Registration Desk", quantity: 2, itemType: "TIME_SLOT", startTime: "09:00", endTime: "12:00" },
                        { name: "Event Setup", quantity: 4, itemType: "TIME_SLOT", startTime: "09:00", endTime: "12:00" }
                    ]
                },
                {
                    name: "Afternoon Shift",
                    description: "12:00 PM - 4:00 PM",
                    items: [
                        { name: "Activity Helper", quantity: 6, itemType: "TIME_SLOT", startTime: "12:00", endTime: "16:00" },
                        { name: "Food Service", quantity: 3, itemType: "TIME_SLOT", startTime: "12:00", endTime: "16:00" }
                    ]
                },
                {
                    name: "Cleanup Crew",
                    description: "4:00 PM - 6:00 PM",
                    items: [
                        { name: "Breakdown Team", quantity: 5, itemType: "TIME_SLOT", startTime: "16:00", endTime: "18:00" }
                    ]
                }
            ]
        }
    },
    {
        type: "PARTY",
        name: "Party Planning",
        description: "Coordinate supplies and roles for celebrations",
        icon: Calendar,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        template: {
            categories: [
                {
                    name: "Food & Drinks",
                    description: "Party refreshments",
                    items: [
                        { name: "Pizza", quantity: 5, itemType: "QUANTITY_BASED" },
                        { name: "Birthday Cake", quantity: 1, itemType: "SINGLE_SLOT" },
                        { name: "Drinks", quantity: 3, itemType: "QUANTITY_BASED" }
                    ]
                },
                {
                    name: "Decorations",
                    description: "Party setup and ambiance",
                    items: [
                        { name: "Balloons", quantity: 2, itemType: "QUANTITY_BASED" },
                        { name: "Table Settings", quantity: 1, itemType: "SINGLE_SLOT" },
                        { name: "Sound System", quantity: 1, itemType: "SINGLE_SLOT" }
                    ]
                },
                {
                    name: "Party Roles",
                    description: "Helper positions during the party",
                    items: [
                        { name: "Host/Coordinator", quantity: 1, itemType: "SINGLE_SLOT" },
                        { name: "Photographer", quantity: 1, itemType: "SINGLE_SLOT" },
                        { name: "Game Leader", quantity: 2, itemType: "SINGLE_SLOT" }
                    ]
                }
            ]
        }
    },
    {
        type: "SCHOOL_EVENT",
        name: "School Event",
        description: "Organize school activities and supplies",
        icon: GraduationCap,
        color: "bg-indigo-100 text-indigo-700 border-indigo-200",
        template: {
            categories: [
                {
                    name: "Classroom Supplies",
                    description: "Essential learning materials",
                    items: [
                        { name: "Notebooks", quantity: 10, itemType: "QUANTITY_BASED" },
                        { name: "Pencils/Pens", quantity: 15, itemType: "QUANTITY_BASED" },
                        { name: "Art Supplies", quantity: 5, itemType: "QUANTITY_BASED" }
                    ]
                },
                {
                    name: "Event Volunteers",
                    description: "Parent and community helpers",
                    items: [
                        { name: "Chaperone", quantity: 4, itemType: "SINGLE_SLOT" },
                        { name: "Traffic Helper", quantity: 2, itemType: "SINGLE_SLOT" },
                        { name: "First Aid", quantity: 1, itemType: "SINGLE_SLOT" }
                    ]
                }
            ]
        }
    },
    {
        type: "DONATION_DRIVE",
        name: "Donation Drive",
        description: "Coordinate charitable giving and donations",
        icon: Heart,
        color: "bg-red-100 text-red-700 border-red-200",
        template: {
            categories: [
                {
                    name: "Family Support",
                    description: "Help families in need",
                    items: [
                        { name: "Gift Cards", quantity: 8, itemType: "QUANTITY_BASED" },
                        { name: "Clothing", quantity: 10, itemType: "QUANTITY_BASED" }
                    ]
                }
            ]
        }
    },
    {
        type: "CUSTOM",
        name: "Custom Event",
        description: "Create your own event structure",
        icon: Plus,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        template: {
            categories: [
                {
                    name: "General Items",
                    description: "Custom signup items",
                    items: []
                }
            ]
        }
    }
];

export function CreateEventDialog({ children }: CreateEventDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<string>("POTLUCK");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [organizationType, setOrganizationType] = useState("NONPROFIT");
    const router = useRouter();

    const selectedTemplate = EVENT_TYPES.find(t => t.type === selectedEventType);
    const Icon = selectedTemplate?.icon || Plus;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !selectedTemplate) return;

        setIsLoading(true);
        try {
            const result = await createEvent({
                name: name.trim(),
                description: description.trim() || undefined,
                eventType: selectedEventType as "POTLUCK" | "SPORTS_TEAM" | "VOLUNTEER" | "PARTY" | "SCHOOL_EVENT" | "DONATION_DRIVE" | "CUSTOM",
                organizationType: organizationType as OrganizationType,
                templateConfig: selectedTemplate.template
            });

            if (result.success && result.event) {
                toast.success(`${selectedTemplate.name} event created successfully!`);
                setOpen(false);
                setName("");
                setDescription("");
                setSelectedEventType("POTLUCK");
                router.push(`/admin/events/${result.event.id}`);
            } else {
                throw new Error(result.error || "Failed to create event");
            }
        } catch (error) {
            toast.error("Failed to create event");
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                            Choose an event type to get started with a pre-configured template, or create a custom event.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Event Type Selection */}
                        <div className="space-y-3">
                            <Label>Event Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {EVENT_TYPES.map((eventType) => {
                                    const TypeIcon = eventType.icon;
                                    return (
                                        <Card
                                            key={eventType.type}
                                            className={`cursor-pointer transition-all hover:shadow-md ${
                                                selectedEventType === eventType.type
                                                    ? "ring-2 ring-primary border-primary"
                                                    : "border-border"
                                            }`}
                                            onClick={() => setSelectedEventType(eventType.type)}
                                        >
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${eventType.color}`}>
                                                        <TypeIcon className="h-4 w-4" />
                                                    </div>
                                                    <CardTitle className="text-sm">{eventType.name}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <CardDescription className="text-xs">
                                                    {eventType.description}
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Event Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Company Potluck - Fall 2025"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoFocus
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizationType">Organization Type</Label>
                                <Select
                                    value={organizationType}
                                    onValueChange={setOrganizationType}
                                >
                                    <SelectTrigger id="organizationType" className="h-11">
                                        <SelectValue placeholder="Select organization type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONPROFIT">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Nonprofit
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="SCHOOL">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                School
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="CHURCH">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Church
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="BUSINESS">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4" />
                                                Business
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your event to help participants understand what to expect..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Template Preview */}
                        {selectedTemplate && (
                            <div className="space-y-3">
                                <Label>Template Preview</Label>
                                <div className={`p-4 rounded-lg border ${selectedTemplate.color}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Icon className="h-5 w-5" />
                                        <h4 className="font-semibold">{selectedTemplate.name} Template</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {selectedTemplate.template.categories.map((category, idx) => (
                                            <div key={idx} className="ml-4">
                                                <div className="font-medium text-sm">{category.name}</div>
                                                <div className="text-xs opacity-75 ml-2">
                                                    {category.items.length} items • {category.description}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !name.trim() || !selectedTemplate} 
                            className="w-full sm:w-auto"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create {selectedTemplate?.name} Event
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
