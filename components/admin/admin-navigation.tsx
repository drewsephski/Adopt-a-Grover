"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
    Package,
    Users,
    ClipboardList,
    LayoutDashboard,
    Settings,
    Heart,
    Box,
    History,
    Menu,
    Mail
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Campaigns", href: "/admin/campaigns", icon: <ClipboardList className="h-4 w-4" /> },
    { name: "Families", href: "/admin/families", icon: <Users className="h-4 w-4" /> },
    { name: "Gifts", href: "/admin/gifts", icon: <Box className="h-4 w-4" /> },
    { name: "Claims", href: "/admin/claims", icon: <Heart className="h-4 w-4" /> },
    { name: "Email Templates", href: "/admin/email-templates", icon: <Mail className="h-4 w-4" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="h-4 w-4" /> },
];

interface AdminNavProps {
    mobile?: boolean;
    onClose?: () => void;
}

function AdminNav({ mobile = false, onClose }: AdminNavProps) {
    const pathname = usePathname();

    const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                onClick={mobile ? onClose : undefined}
                className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
            >
                <div className="flex items-center justify-center w-5 h-5">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="truncate">{children}</span>
                </div>
                {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                )}
            </Link>
        );
    };

    return (
        <nav className="space-y-2">
            {navigation.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon}>
                    {item.name}
                </NavLink>
            ))}
        </nav>
    );
}

export function AdminMobileMenu() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-14 items-center border-b px-4">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
                            <Package className="h-5 w-5 text-sidebar-primary" />
                            <span>Pitch In List</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-auto p-4">
                        <AdminNav mobile onClose={() => setOpen(false)} />
                    </div>

                    {/* Footer */}
                    <div className="border-t p-4 space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div className="flex items-center gap-3">
                                <UserButton afterSignOutUrl="/" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-foreground">Admin</span>
                                    <span className="text-[10px] text-muted-foreground">Organizer</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function AdminSidebar() {
    return (
        <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
            {/* Header */}
            <div className="flex h-14 items-center border-b border-sidebar-border px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
                    <Package className="h-5 w-5 text-sidebar-primary" />
                    <span className="text-sm">Pitch In List</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto p-3">
                <AdminNav />
            </div>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserButton afterSignOutUrl="/" />
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-foreground truncate">Admin</span>
                            <span className="text-[10px] text-muted-foreground">Organizer</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </aside>
    );
}
