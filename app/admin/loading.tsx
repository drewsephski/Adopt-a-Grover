export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
            <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
        </div>
    );
}
