import { AdminSidebar } from "@/components/admin/admin-navigation";
import { AdminNavbar } from "@/components/admin/admin-navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-sidebar overflow-hidden">
            {/* Desktop Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Mobile Navbar */}
                <div className="lg:hidden">
                    <AdminNavbar />
                </div>

                {/* Page Content */}
                <div className="h-[calc(100vh-4rem)] lg:h-screen overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
