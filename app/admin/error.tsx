"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-destructive/10 p-6 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-md mb-8">
                An error occurred while loading the admin dashboard. We&apos;ve been notified and are looking into it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} size="lg" className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                    <Link href="/admin">
                        <Home className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            {error.digest && (
                <p className="mt-8 text-xs text-muted-foreground/50 font-mono">
                    Error ID: {error.digest}
                </p>
            )}
        </div>
    );
}
