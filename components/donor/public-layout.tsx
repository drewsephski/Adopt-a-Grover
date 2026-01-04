import Link from "next/link";
import { Package, Menu } from "lucide-react";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="p-2 rounded-xl bg-muted group-hover:bg-accent transition-colors">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-foreground">
                                    Adopt a <span className="text-primary">Grover</span>
                                </span>
                            </Link>
                        </div>

                        <div className="hidden md:block">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/admin"
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Admin Portal
                                </Link>
                                <div className="h-4 w-[1px] bg-border" />
                                <button className="rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-lg shadow-border hover:bg-foreground/90 transition-all hover:scale-[1.02]">
                                    How it works
                                </button>
                            </div>
                        </div>

                        <button className="md:hidden p-2 text-muted-foreground">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>

            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-card border-t border-border pt-20 pb-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold tracking-tight text-foreground">Adopt a Grover</span>
                            </div>
                            <p className="text-muted-foreground max-w-md leading-relaxed">
                                Helping our neighbors in Fox River Grove celebrate the holiday season with dignity and community support.
                            </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-6">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-foreground uppercase tracking-widest mb-2">Drop-off Location</p>
                                <p className="text-card-foreground">624 Ellington Ct<br />Fox River Grove, IL</p>
                            </div>
                            <div className="flex gap-4">
                                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-card-foreground transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="text-xs text-muted-foreground hover:text-card-foreground transition-colors">Terms of Service</Link>
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
        </div>
    );
}
