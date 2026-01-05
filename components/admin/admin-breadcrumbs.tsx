"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const breadcrumbs = getBreadcrumbs(pathname);

    // Don't show breadcrumbs on the main dashboard
    if (breadcrumbs.length === 1) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            {breadcrumbs.map((item, index) => (
                <div key={item.href} className="flex items-center">
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-foreground font-medium">{item.label}</span>
                    ) : (
                        <>
                            <Link 
                                href={item.href}
                                className="hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                            <span className="text-muted-foreground/30 mx-2">/</span>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
