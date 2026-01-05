"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Loader2, Search, User, Package } from "lucide-react";
import { sendRealClaimConfirmationEmail, getDonorClaimedItems } from "@/lib/actions/email-templates";

interface SendRealEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DonorData {
  donorName: string;
  items: Array<{
    name: string;
    quantity: number;
    familyAlias: string;
  }>;
  campaignName?: string;
  dropOffAddress?: string;
  dropOffDeadline?: Date;
}

export function SendRealEmailDialog({ isOpen, onClose }: SendRealEmailDialogProps) {
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const searchDonor = async () => {
    if (!donorEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setSearching(true);
    setDonorData(null);
    setResult(null);

    try {
      const data = await getDonorClaimedItems(donorEmail.trim());
      setDonorData(data);
    } catch (error) {
      console.error("Failed to search donor:", error);
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to search donor" 
      });
    } finally {
      setSearching(false);
    }
  };

  const sendRealEmail = async () => {
    if (!donorEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const emailResult = await sendRealClaimConfirmationEmail(donorEmail.trim());
      setResult(emailResult);
    } catch (error) {
      console.error("Failed to send real email:", error);
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to send email" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchDonor();
    }
  };

  const resetDialog = () => {
    setDonorEmail("");
    setDonorData(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Real Claim Confirmation Email
          </DialogTitle>
          <DialogDescription>
            Send a real claim confirmation email to a donor with their actual claimed items data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Input Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Donor Email Address</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter donor's email address..."
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={searchDonor} 
                disabled={searching || !donorEmail.trim()}
                variant="outline"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Donor Data Preview */}
          {donorData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Donor Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Name:</span>
                    <span className="ml-2 text-green-600">{donorData.donorName}</span>
                  </div>
                  {donorData.campaignName && (
                    <div>
                      <span className="font-medium text-green-700">Campaign:</span>
                      <span className="ml-2 text-green-600">{donorData.campaignName}</span>
                    </div>
                  )}
                  {donorData.dropOffAddress && (
                    <div>
                      <span className="font-medium text-green-700">Drop-off:</span>
                      <span className="ml-2 text-green-600">{donorData.dropOffAddress}</span>
                    </div>
                  )}
                  {donorData.dropOffDeadline && (
                    <div>
                      <span className="font-medium text-green-700">Deadline:</span>
                      <span className="ml-2 text-green-600">
                        {donorData.dropOffDeadline.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Claimed Items ({donorData.items.length})
                </h3>
                <div className="space-y-2">
                  {donorData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.quantity}x
                        </Badge>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-blue-600">for {item.familyAlias}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                <span className={`text-sm font-medium ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}>
                  {result.success ? "Success" : "Error"}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                result.success ? "text-green-700" : "text-red-700"
              }`}>
                {result.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button
              onClick={sendRealEmail}
              disabled={loading || !donorEmail.trim() || !donorData}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Real Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
