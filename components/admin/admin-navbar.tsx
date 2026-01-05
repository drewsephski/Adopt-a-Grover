"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { AdminMobileMenu } from "@/components/admin/admin-navigation";

function getBreadcrumbs(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [
        { label: "Dashboard", href: "/admin" }
    ];

    if (segments.length > 1 || (segments.length === 1 && segments[0] !== "admin")) {
        segments.forEach((segment, index) => {
            if (segment === "admin") return;
            
            const href = "/" + segments.slice(0, index + 1).join("/");
            const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
            
            breadcrumbs.push({
                label,
                href
            });
        });
    }

    return breadcrumbs;
}

export function AdminNavbar() {
    const pathname = usePathname();
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 lg:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1">
                <AdminMobileMenu />
                
                {/* Breadcrumbs */}
                <nav className="hidden md:flex">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((item, index) => (
                                <div key={item.href} className="flex items-center">
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    ) : (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink 
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {item.label}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            {index < breadcrumbs.length - 1 && (
                                                <BreadcrumbSeparator className="mx-2" />
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </nav>
            </div>

            {/* Center Section - Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search families, gifts, campaigns..."
                        className="pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-all duration-200"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 flex-1 justify-end">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Profile */}
                <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-border">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>
        </header>
    );
}
