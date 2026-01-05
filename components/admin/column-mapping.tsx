"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, CheckCircle2, AlertCircle, Lightbulb, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ColumnMapping {
  csvColumn: string;
  mappedTo: string;
  confidence: number;
}

interface ColumnMappingProps {
  csvHeaders: string[];
  onMappingChange: (mapping: Record<string, string>) => void;
  detectedMapping?: Record<string, string>;
}

const REQUIRED_FIELDS = [
  { key: "family", label: "Family Name", required: true, description: "Family identifier" },
  { key: "firstName", label: "First Name", required: false, description: "Person's first name" },
  { key: "roleAge", label: "Role / Age", required: false, description: "Family role or age" },
  { key: "sizes", label: "Sizes", required: false, description: "Clothing sizes" },
  { key: "wishlist", label: "Wishlist / Items", required: false, description: "Gift items (comma separated)" },
  { key: "giftName", label: "Gift Name", required: false, description: "Individual gift name" },
  { key: "quantity", label: "Quantity", required: false, description: "Number of items needed" },
  { key: "description", label: "Description", required: false, description: "Additional details" },
  { key: "productUrl", label: "Product URL", required: false, description: "Link to product" },
];

const COLUMN_SUGGESTIONS: Record<string, string[]> = {
  family: ["family", "family_name", "family alias", "alias", "group"],
  firstName: ["first name", "firstname", "first_name", "name", "given_name"],
  roleAge: ["role / age", "role", "age", "role_age", "description"],
  sizes: ["sizes", "size", "clothing_size", "measurements"],
  wishlist: ["wishlist / items", "wishlist", "items", "gifts", "desired_items"],
  giftName: ["gift item", "gift", "item", "product", "gift_name"],
  quantity: ["quantity required", "quantity", "qty", "amount", "number"],
  description: ["description", "desc", "details", "notes", "comments"],
  productUrl: ["product url", "url", "link", "website", "product_url"],
};

export function ColumnMapping({ csvHeaders, onMappingChange, detectedMapping }: ColumnMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<string, number>>({});

  const calculateConfidence = (mapping: Record<string, string>) => {
    const newConfidence: Record<string, number> = {};
    
    Object.entries(mapping).forEach(([field, csvColumn]) => {
      if (!csvColumn) {
        newConfidence[field] = 0;
        return;
      }
      
      const suggestions = COLUMN_SUGGESTIONS[field] || [];
      const csvLower = csvColumn.toLowerCase();
      
      // Exact match gets 100%
      if (suggestions.includes(csvLower)) {
        newConfidence[field] = 100;
      }
      // Partial match gets 70-90%
      else if (suggestions.some(suggestion => csvLower.includes(suggestion) || suggestion.includes(csvLower))) {
        newConfidence[field] = 80;
      }
      // Fuzzy match gets 50-70%
      else if (suggestions.some(suggestion => {
        const csvWords = csvLower.split(/[\s_-]/);
        const suggestionWords = suggestion.split(/[\s_-]/);
        return csvWords.some(word => suggestionWords.some(sWord => 
          word.includes(sWord) || sWord.includes(word)
        ));
      })) {
        newConfidence[field] = 60;
      }
      // No match gets 0-30%
      else {
        newConfidence[field] = 20;
      }
    });
    
    setConfidence(newConfidence);
  };

  const autoDetectMapping = useCallback(() => {
    const detected: Record<string, string> = {};
    
    REQUIRED_FIELDS.forEach(field => {
      const suggestions = COLUMN_SUGGESTIONS[field.key] || [];
      
      // Try to find exact matches first
      const exactMatch = csvHeaders.find(header => 
        suggestions.includes(header.toLowerCase())
      );
      
      if (exactMatch) {
        detected[field.key] = exactMatch;
      } else {
        // Try partial matches
        const partialMatch = csvHeaders.find(header => {
          const headerLower = header.toLowerCase();
          return suggestions.some(suggestion => 
            headerLower.includes(suggestion) || suggestion.includes(headerLower)
          );
        });
        
        if (partialMatch) {
          detected[field.key] = partialMatch;
        }
      }
    });
    
    setMapping(detected);
    calculateConfidence(detected);
    
    toast.success("Auto-detected column mappings");
  }, [csvHeaders]);

  useEffect(() => {
    if (detectedMapping) {
      setMapping(detectedMapping);
      calculateConfidence(detectedMapping);
    } else {
      autoDetectMapping();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvHeaders, detectedMapping]);

  const handleMappingChange = (field: string, csvColumn: string) => {
    const newMapping = { ...mapping, [field]: csvColumn };
    setMapping(newMapping);
    calculateConfidence(newMapping);
    onMappingChange(newMapping);
  };

  const resetMapping = () => {
    setMapping({});
    setConfidence({});
    onMappingChange({});
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (conf >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (conf >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 80) return "High";
    if (conf >= 60) return "Medium";
    if (conf >= 40) return "Low";
    return "Very Low";
  };

  const unmappedColumns = csvHeaders.filter(header => 
    !Object.values(mapping).includes(header)
  );

  const mappedRequiredFields = REQUIRED_FIELDS.filter(field => 
    field.required && mapping[field.key]
  ).length;

  const totalRequiredFields = REQUIRED_FIELDS.filter(field => field.required).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Column Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Map your CSV columns to the required fields. Drag and drop or use the dropdowns.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={autoDetectMapping}
            className="h-8"
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Auto-Detect
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetMapping}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      <div className={`p-3 rounded-lg border ${mappedRequiredFields === totalRequiredFields ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className={`h-4 w-4 ${mappedRequiredFields === totalRequiredFields ? "text-green-600" : "text-orange-600"}`} />
          <span className={`text-sm ${mappedRequiredFields === totalRequiredFields ? "text-green-700" : "text-orange-700"}`}>
            {mappedRequiredFields === totalRequiredFields ? (
              <>
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                All required fields mapped! Ready to import.
              </>
            ) : (
              <>
                {mappedRequiredFields} of {totalRequiredFields} required fields mapped. 
                Please map the remaining required fields.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Mapping Interface */}
      <div className="grid gap-4">
        {REQUIRED_FIELDS.map((field) => (
          <Card key={field.key} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{field.label}</span>
                  {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  {mapping[field.key] && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(confidence[field.key] || 0)}`}
                    >
                      {getConfidenceLabel(confidence[field.key] || 0)} ({confidence[field.key] || 0}%)
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{field.description}</p>
              </div>
              
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              
              <div className="flex-1">
                <Select
                  value={mapping[field.key] || ""}
                  onValueChange={(value) => handleMappingChange(field.key, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select CSV column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- No mapping --</SelectItem>
                    {csvHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Unmapped Columns */}
      {unmappedColumns.length > 0 && (
        <Card className="p-4 bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Unmapped Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unmappedColumns.map((column) => (
                <Badge key={column} variant="secondary" className="text-xs">
                  {column}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These columns were not mapped and will be ignored during import.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
