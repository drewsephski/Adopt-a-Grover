import Link from "next/link";
import { Package } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Adopt a Grover
                            </span>
                        </div>
                        <p className="text-muted-foreground max-w-md leading-relaxed">
                            Helping our neighbors in Fox River Grove celebrate the holiday
                            season with dignity and community support.
                        </p>
                    </div>
                    <div className="flex flex-col md:items-end gap-6">
                        <div className="text-right">
                            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                                Drop-off Location
                            </p>
                            <p className="text-foreground font-medium">
                                624 Ellington Ct
                                <br />
                                Fox River Grove, IL
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                href="/privacy"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-border pt-8 text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Adopt a Grover. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
