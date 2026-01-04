import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
    Package,
    Users,
    Gift,
    ClipboardList,
    LayoutDashboard,
    Settings
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-full w-64 border-r bg-white lg:block">
                <div className="flex h-full flex-col">
                    <div className="flex h-14 items-center border-b px-6">
                        <Link href="/admin" className="flex items-center gap-2 font-semibold text-slate-900">
                            <Package className="h-5 w-5 text-indigo-600" />
                            <span>Adopt a Grover</span>
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
                            Dashboard
                        </AdminNavLink>
                        <AdminNavLink href="/admin/campaigns" icon={<ClipboardList className="h-4 w-4" />}>
                            Campaigns
                        </AdminNavLink>
                        <AdminNavLink href="/admin/families" icon={<Users className="h-4 w-4" />}>
                            Families
                        </AdminNavLink>
                        <AdminNavLink href="/admin/claims" icon={<Gift className="h-4 w-4" />}>
                            Claims
                        </AdminNavLink>
                    </nav>

                    <div className="border-t p-4">
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                            <div className="flex items-center gap-2">
                                <UserButton afterSignOutUrl="/" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-slate-900">Admin</span>
                                    <span className="text-[10px] text-slate-500">Organizer</span>
                                </div>
                            </div>
                            <Link href="/admin/settings" className="text-slate-400 hover:text-slate-600">
                                <Settings className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-64">
                {/* Header (Mobile) */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
                    <Link href="/admin" className="flex items-center gap-2 font-semibold">
                        <Package className="h-5 w-5 text-indigo-600" />
                        <span>Adopt a Grover</span>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                </header>

                <div className="p-4 md:p-8 lg:p-10">
                    {children}
                </div>
            </main>
        </div>
    );
}

function AdminNavLink({
    href,
    children,
    icon
}: {
    href: string;
    children: React.ReactNode;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-indigo-600"
        >
            {icon}
            {children}
        </Link>
    );
}
