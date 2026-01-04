"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportClaimsToCSV, exportCampaignInventoryToCSV, exportArchiveToCSV } from "@/lib/actions/export";
import { toast } from "sonner";

interface ExportButtonProps {
    campaignId: string;
    campaignName: string;
    type: "claims" | "inventory" | "archive";
    variant?: "outline" | "default" | "ghost";
    className?: string;
    label?: string;
}

export function ExportButton({
    campaignId,
    campaignName,
    type,
    variant = "outline",
    className,
    label
}: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleExport() {
        setIsLoading(true);
        try {
            let csvContent: string;
            let filename: string;

            if (type === "claims") {
                csvContent = await exportClaimsToCSV(campaignId);
                filename = `${campaignName.replace(/\s+/g, '-').toLowerCase()}-claims-${new Date().toISOString().split('T')[0]}.csv`;
            } else if (type === "inventory") {
                csvContent = await exportCampaignInventoryToCSV(campaignId);
                filename = `${campaignName.replace(/\s+/g, '-').toLowerCase()}-inventory-${new Date().toISOString().split('T')[0]}.csv`;
            } else {
                csvContent = await exportArchiveToCSV(campaignId); // This is actually the 'year' for archives
                filename = `archive-${campaignId}-${new Date().toISOString().split('T')[0]}.csv`;
            }

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export successful");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to export data";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant={variant}
            className={className}
            onClick={handleExport}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {label || (type === "claims" ? "Export Claims" : "Export Inventory")}
        </Button>
    );
}
