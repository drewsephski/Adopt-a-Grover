"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, FileUp, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import Papa from "papaparse";
import { importFromCSV, type ImportFamily } from "@/lib/actions/import";
import type { ImportResult } from "@/lib/actions/import";

interface ImportCSVDialogProps {
    campaignId: string;
    children: React.ReactNode;
}

export function ImportCSVDialog({ campaignId, children }: ImportCSVDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<{ families: number; gifts: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                toast.error("Please select a CSV file");
                return;
            }
            setFile(selectedFile);
            parseAndPreview(selectedFile);
        }
    }

    function processCSVData(data: Record<string, string>[]) {
        const familiesMap = new Map<string, ImportFamily>();

        data.forEach((row) => {
            const familyAlias = row.Family || row.family_alias || row.family || row.alias;
            if (!familyAlias || !familyAlias.trim()) return;

            const trimmedAlias = familyAlias.trim();
            if (!familiesMap.has(trimmedAlias)) {
                familiesMap.set(trimmedAlias, {
                    alias: trimmedAlias,
                    gifts: [],
                });
            }

            // Priority 1: Direct Gift mapping
            let giftName = row["Gift Item"] || row.gift_name || row.gift || row.item;
            let description = row.Description || row.description || row.desc;
            let quantityAttr = row["Quantity Required"] || row.quantity || row.qty || row["Quantity"];
            const firstName = row.firstName || row.first_name;
            const lastName = row.lastName || row.last_name;

            // Priority 2: Archive format mapping (Member, Donor, Gift Description)
            if (!giftName && row.Member) {
                giftName = row.Member;
                const donor = row.Donor || row.donor;
                const giftDesc = row["Gift Description"] || row.gift_description;
                if (donor && giftDesc) description = `[Prev Donor: ${donor}] ${giftDesc}`;
                else if (giftDesc) description = giftDesc;
                else if (donor) description = `[Prev Donor: ${donor}]`;
                if (quantityAttr === undefined) quantityAttr = "1";
            }

            // Priority 3: Adopt format mapping (Wishlist / Items, Role / Age, etc.)
            const wishlist = row["Wishlist / Items"] || row.wishlist || row.items;
            const roleAge = row["Role / Age"] || row.role || row.age;
            const sizes = row.Sizes || row.sizes;
            const adoptFirstName = row["First name"] || row.firstName;
            const adoptLastName = row["Last name"] || row.lastName;

            if (!giftName && wishlist) {
                // Split wishlist by comma or semicolon
                const items = wishlist.split(/[;,]/).filter(it => it.trim());
                items.forEach(item => {
                    let giftDesc = roleAge ? `For: ${roleAge}` : "";
                    if (sizes) giftDesc += giftDesc ? ` (${sizes})` : `Size: ${sizes}`;

                    familiesMap.get(trimmedAlias)!.gifts.push({
                        name: item.trim(),
                        quantity: 1,
                        description: giftDesc.trim(),
                        firstName: adoptFirstName?.trim(),
                        lastName: adoptLastName?.trim(),
                    });
                });
                return; // Wishlist handled
            }

            const quantityVal = parseInt(String(quantityAttr || "1").replace(/[^0-9]/g, ""));
            const quantity = isNaN(quantityVal) ? 1 : quantityVal;
            const productUrl = row["Product URL"] || row.product_url || row.url || row.link;

            if (giftName && giftName.trim()) {
                familiesMap.get(trimmedAlias)!.gifts.push({
                    name: giftName.trim(),
                    quantity,
                    description: description?.trim(),
                    productUrl: productUrl?.trim(),
                    firstName: firstName?.trim(),
                    lastName: lastName?.trim(),
                });
            }
        });

        return Array.from(familiesMap.values());
    }

    function parseAndPreview(file: File) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as Record<string, string>[];
                const familiesArray = processCSVData(data);
                const totalGifts = familiesArray.reduce((acc, f) => acc + f.gifts.length, 0);
                setPreview({ families: familiesArray.length, gifts: totalGifts });
            },
            error: (error) => {
                toast.error("Failed to parse CSV: " + error.message);
            }
        });
    }

    async function handleImport() {
        if (!file) return;

        setIsLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as Record<string, string>[];
                const familiesArray = processCSVData(data);

                try {
                    const result = await importFromCSV(campaignId, familiesArray);
                    if ((result as ImportResult).success) {
                        toast.success(`Imported ${(result as ImportResult).familiesCreated} families and ${(result as ImportResult).giftsCreated} gifts`);
                        setOpen(false);
                        setFile(null);
                        setPreview(null);
                    } else {
                        toast.error("Import failed: " + (result as ImportResult).error);
                    }
                } catch (error) {
                    toast.error("An unexpected error occurred during import");
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            }
        });
    }

    function downloadTemplate(type: "inventory" | "archive" | "adopt") {
        let headers: string[];
        let rows: string[][];
        let filename: string;

        if (type === "adopt") {
            headers = ["First name", "Last name", "Family", "Role / Age", "Sizes", "Wishlist / Items"];
            rows = [
                ["Cesar", "Aguira", "A", "Dad", "Shirt L; Jeans 34x32; Shoes 11", "Socks, PJs, Hoodie, Dress Shirt, Sweat pants, Tee shirt"],
                ["Maria", "Rodriguiz", "A", "Mom", "Shirt XL; Shoes 8", "Socks, PJs, Hoodie, Sweat pants, Tee shirt, Dress Shirt, Leggings"],
                ["Vitalii", "Dychko", "B", "Boy 13", "Men’s M; Winter Boots 10", "Socks, PJs, Tee Shirts, Hoodie, Sweat pants, Hat, Mittens, Winter Boots; Art supplies (pencils, drawing pads); LEGO sets (cars, plane)"]
            ];
            filename = "campaign_adopt_template.csv";
        } else if (type === "inventory") {
            headers = ["Family", "Gift Item", "Description", "Quantity Required", "Product URL"];
            rows = [
                ["Family 101", "Lego Set", "Standard Lego Classic box", "1", "https://example.com/lego"],
                ["Family 101", "Barbie Doll", "Fashionistas collection", "1", ""],
                ["Family 102", "Winter Coat", "Size 10 Boys Red", "1", ""]
            ];
            filename = "campaign_inventory_template.csv";
        } else {
            headers = ["Family", "Member", "Donor", "Gift Description"];
            rows = [
                ["Family A", "Mom", "Ashley Waxler", "I’ll get everything."],
                ["Family A", "Girl (7)", "Katie Gleason", "doll + coloring books"],
                ["Family B", "Boy (13)", "Christie Morgan", "Will buy all for him."]
            ];
            filename = "campaign_archive_template.csv";
        }

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(c => `"${c}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-primary" />
                        Import from Document
                    </DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to bulk import families and gifts into this campaign.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                        {file ? (
                            <>
                                <CheckCircle2 className="h-10 w-10 text-primary" />
                                <div className="text-center">
                                    <p className="font-medium text-foreground">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                    setPreview(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}>
                                    Remove file
                                </Button>
                            </>
                        ) : (
                            <>
                                <FileUp className="h-10 w-10 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">CSV files only</p>
                                </div>
                            </>
                        )}
                    </div>

                    {preview && (
                        <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2 border border-border">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                Import Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-1">
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Families to create</span>
                                    <span className="font-bold">{preview.families}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Gifts to create</span>
                                    <span className="font-bold">{preview.gifts}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" />
                            CSV Column Mapping
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-[10px] font-mono text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="font-bold text-primary/70 col-span-2 mb-1 border-b border-primary/10 pb-1">ADOPT FORMAT (PRIVATE NAMES)</div>
                            <div>First name / Last name</div>
                            <div>Family (required)</div>
                            <div>Role / Age</div>
                            <div>Wishlist / Items (splits into gifts)</div>
                            <div className="col-span-2 mb-2">Sizes (added to description)</div>

                            <div className="font-bold text-primary/70 col-span-2 mb-1 border-b border-primary/10 pb-1 opacity-60">INVENTORY FORMAT</div>
                            <div>Family (required)</div>
                            <div>Gift Item</div>
                            <div>Quantity Required</div>
                            <div>Description</div>
                            <div className="col-span-2 mb-2">Product URL (optional)</div>

                            <div className="font-bold text-primary/70 col-span-2 mb-1 border-b border-primary/10 pb-1 opacity-60">ARCHIVE FORMAT</div>
                            <div>Family (required)</div>
                            <div>Member (gift name)</div>
                            <div>Gift Description</div>
                            <div className="col-span-2">Donor (optional)</div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-2 mt-1">
                            <button
                                type="button"
                                onClick={() => downloadTemplate("adopt")}
                                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                            >
                                <Info className="h-3 w-3" />
                                Adopt Template
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadTemplate("inventory")}
                                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                            >
                                <Info className="h-3 w-3" />
                                Inventory Template
                            </button>
                            <button
                                type="button"
                                onClick={() => downloadTemplate("archive")}
                                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                            >
                                <Info className="h-3 w-3" />
                                Archive Template
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isLoading || !file}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
