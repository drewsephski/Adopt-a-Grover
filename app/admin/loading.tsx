import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                <Loader2 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
    );
}
