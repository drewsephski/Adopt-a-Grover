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
import { ColumnMapping } from "@/components/admin/column-mapping";

interface ImportCSVDialogProps {
    campaignId: string;
    children: React.ReactNode;
}

export function ImportCSVDialog({ campaignId, children }: ImportCSVDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<{ families: number; gifts: number } | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [showMapping, setShowMapping] = useState(false);
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

    function processCSVData(data: Record<string, string>[], mapping: Record<string, string>) {
        const familiesMap = new Map<string, ImportFamily>();

        data.forEach((row) => {
            // Use the mapping to get the correct values
            const familyAlias = row[mapping.family] || row[mapping.family_alias] || row[mapping.family_name];
            if (!familyAlias || !familyAlias.trim()) return;

            const trimmedAlias = familyAlias.trim();
            if (!familiesMap.has(trimmedAlias)) {
                familiesMap.set(trimmedAlias, {
                    alias: trimmedAlias,
                    gifts: [],
                });
            }

            // Get mapped values
            // const firstName = row[mapping.firstName] || row[mapping.firstname] || row[mapping.first_name]; // Currently unused but kept for reference
            const roleAge = row[mapping.roleAge] || row[mapping.role] || row[mapping.age];
            const sizes = row[mapping.sizes] || row[mapping.size];
            const wishlist = row[mapping.wishlist] || row[mapping.items] || row[mapping.gifts];
            const giftName = row[mapping.giftName] || row[mapping.gift] || row[mapping.item];
            const quantity = row[mapping.quantity] || row[mapping.qty] || row[mapping.amount];
            const description = row[mapping.description] || row[mapping.desc] || row[mapping.details];
            const productUrl = row[mapping.productUrl] || row[mapping.url] || row[mapping.link];

            // Handle wishlist format (splits into multiple gifts)
            if (wishlist && wishlist.trim()) {
                const items = wishlist.split(/[,;]/).filter(it => it.trim());
                items.forEach(item => {
                    let giftDesc = roleAge ? `For: ${roleAge}` : "";
                    if (sizes) giftDesc += giftDesc ? ` (${sizes})` : `Size: ${sizes}`;

                    familiesMap.get(trimmedAlias)!.gifts.push({
                        name: item.trim(),
                        quantity: 1,
                        description: giftDesc.trim(),
                    });
                });
                return; // Wishlist handled
            }

            // Handle individual gift
            if (giftName && giftName.trim()) {
                const quantityVal = parseInt(String(quantity || "1").replace(/[^0-9]/g, ""));
                const finalQuantity = isNaN(quantityVal) ? 1 : quantityVal;

                familiesMap.get(trimmedAlias)!.gifts.push({
                    name: giftName.trim(),
                    quantity: finalQuantity,
                    description: description?.trim(),
                    productUrl: productUrl?.trim(),
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
                const headers = results.meta.fields || [];
                
                setCsvHeaders(headers);
                setCsvData(data);
                setShowMapping(true);
                
                // Auto-detect mapping and preview
                const familiesArray = processCSVData(data, columnMapping);
                const totalGifts = familiesArray.reduce((acc, f) => acc + f.gifts.length, 0);
                setPreview({ families: familiesArray.length, gifts: totalGifts });
            },
            error: (error) => {
                toast.error("Failed to parse CSV: " + error.message);
            }
        });
    }

    function handleMappingChange(mapping: Record<string, string>) {
        setColumnMapping(mapping);
        
        // Update preview with new mapping
        if (csvData.length > 0) {
            const familiesArray = processCSVData(csvData, mapping);
            const totalGifts = familiesArray.reduce((acc, f) => acc + f.gifts.length, 0);
            setPreview({ families: familiesArray.length, gifts: totalGifts });
        }
    }

    async function handleImport() {
        if (!file) return;

        setIsLoading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const data = results.data as Record<string, string>[];
                const familiesArray = processCSVData(data, columnMapping);

                try {
                    const result = await importFromCSV(campaignId, familiesArray);
                    if ((result as ImportResult).success) {
                        toast.success(`Imported ${(result as ImportResult).familiesCreated} families and ${(result as ImportResult).giftsCreated} gifts`);
                        setOpen(false);
                        resetState();
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

    function resetState() {
        setFile(null);
        setPreview(null);
        setCsvHeaders([]);
        setCsvData([]);
        setColumnMapping({});
        setShowMapping(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function downloadTemplate(type: "inventory" | "archive" | "adopt") {
        let headers: string[];
        let rows: string[][];
        let filename: string;

        if (type === "adopt") {
            headers = ["First name", "Family", "Role / Age", "Sizes", "Wishlist / Items"];
            rows = [
                ["Cesar", "A", "Dad", "Shirt L; Jeans 34x32; Shoes 11", "Socks, PJs, Hoodie, Dress Shirt, Sweat pants, Tee shirt"],
                ["Maria", "A", "Mom", "Shirt XL; Shoes 8", "Socks, PJs, Hoodie, Sweat pants, Tee shirt, Dress Shirt, Leggings"],
                ["Vitalii", "B", "Boy 13", "Men's M; Winter Boots 10", "Socks, PJs, Tee Shirts, Hoodie, Sweat pants, Hat, Mittens, Winter Boots; Art supplies (pencils, drawing pads); LEGO sets (cars, plane)"]
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
            <DialogContent className="max-w-[95vw] max-w-md sm:max-w-[500px]">
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
                        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
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
                                <Button variant="ghost" size="icon" className="h-11 w-11" onClick={(e) => {
                                    e.stopPropagation();
                                    resetState();
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
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm mt-1">
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
                        {showMapping && csvHeaders.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <Info className="h-3 w-3" />
                                    Step 2: Map Your Columns
                                </div>
                                <ColumnMapping
                                    csvHeaders={csvHeaders}
                                    onMappingChange={handleMappingChange}
                                    detectedMapping={columnMapping}
                                />
                            </>
                        )}
                        
                        {!showMapping && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <AlertCircle className="h-3 w-3" />
                                    CSV Templates
                                </div>
                                <div className="bg-muted p-3 rounded-lg text-[11px] sm:text-xs text-muted-foreground">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="font-semibold">Adopt Format:</span> First name, Family, Role / Age, Sizes, Wishlist / Items
                                        </div>
                                        <div>
                                            <span className="font-semibold">Inventory Format:</span> Family, Gift Item, Description, Quantity Required, Product URL
                                        </div>
                                        <div>
                                            <span className="font-semibold">Archive Format:</span> Family, Member, Donor, Gift Description
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => downloadTemplate("adopt")}
                                className="h-11 text-xs"
                            >
                                <Info className="h-4 w-4 mr-1" />
                                Adopt Template
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => downloadTemplate("inventory")}
                                className="h-11 text-xs"
                            >
                                <Info className="h-4 w-4 mr-1" />
                                Inventory Template
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => downloadTemplate("archive")}
                                className="h-11 text-xs"
                            >
                                <Info className="h-4 w-4 mr-1" />
                                Archive Template
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="w-full sm:w-auto h-11"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={isLoading || !file || !showMapping}
                        className="w-full sm:w-auto h-11 bg-primary hover:bg-primary/90"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Import Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
