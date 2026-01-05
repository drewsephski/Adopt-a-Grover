"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, X, Loader2, Users } from "lucide-react";
import { EmailTemplateType } from "@/lib/email-template-types";

interface TestEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    type: EmailTemplateType;
    name: string;
    isActive: boolean;
  };
  onSendTestEmail: (emails: string[], customVariables?: Record<string, string>) => Promise<{ success: boolean; message: string }>;
}

export function TestEmailDialog({ isOpen, onClose, template, onSendTestEmail }: TestEmailDialogProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [customVariables, setCustomVariables] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ email: string; success: boolean; message: string }[]>([]);

  const addEmail = () => {
    const email = currentEmail.trim();
    if (email && !emails.includes(email)) {
      setEmails([...emails, email]);
      setCurrentEmail("");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const parseCustomVariables = (): Record<string, string> => {
    const variables: Record<string, string> = {};
    if (!customVariables.trim()) return variables;

    customVariables.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        variables[key.trim()] = valueParts.join(':').trim();
      }
    });
    return variables;
  };

  const sendTestEmails = async () => {
    if (emails.length === 0) {
      alert("Please add at least one email address");
      return;
    }

    setSending(true);
    setResults([]);

    try {
      const customVars = parseCustomVariables();
      
      // Send emails individually to track results
      const emailResults = await Promise.all(
        emails.map(async (email) => {
          try {
            const result = await onSendTestEmail([email], customVars);
            return {
              email,
              success: result.success,
              message: result.message
            };
          } catch (error) {
            return {
              email,
              success: false,
              message: error instanceof Error ? error.message : "Unknown error"
            };
          }
        })
      );

      setResults(emailResults);
    } catch (error) {
      console.error("Failed to send test emails:", error);
      alert("Failed to send test emails. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const resetDialog = () => {
    setEmails([]);
    setCurrentEmail("");
    setCustomVariables("");
    setResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email{emails.length > 1 ? "s" : ""} - {template.name}
          </DialogTitle>
          <DialogDescription>
            Send test emails to verify template rendering and functionality.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Input Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Email Addresses</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={addEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Email List */}
            {emails.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {emails.length} recipient{emails.length > 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-2">
                  {emails.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Custom Variables Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Custom Variables (Optional)</Label>
            <Textarea
              placeholder="Override default test variables (one per line):&#10;donorName: John Doe&#10;campaignName: My Campaign&#10;dropOffAddress: 123 Main St"
              value={customVariables}
              onChange={(e) => setCustomVariables(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Format: key:value (one per line). These will override the default test variables.
            </p>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Send Results</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.email}
                    className={`flex items-center justify-between p-2 rounded border ${
                      result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <span className="text-sm font-medium">{result.email}</span>
                    <span className={`text-xs ${result.success ? "text-green-600" : "text-red-600"}`}>
                      {result.success ? "✓ Sent" : "✗ Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button
              onClick={sendTestEmails}
              disabled={sending || emails.length === 0 || !template.isActive}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test Email{emails.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
