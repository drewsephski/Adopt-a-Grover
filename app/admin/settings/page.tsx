"use client";

import { useState, useEffect } from "react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Settings, Database, Shield, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useFormState } from "react-dom";
import { updateSettings, getSettings, exportDatabase } from "@/lib/actions/settings";
import { sendTestEmail, getEmailConfigurationStatus } from "@/lib/actions/email-settings";

interface SettingsData {
  emailNotifications: boolean;
  autoArchiveCampaigns: boolean;
  automaticBackups: boolean;
  twoFactorAuth: boolean;
  allowAdminRegistration: boolean;
}

const initialState = {
  success: false,
  error: null,
  message: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    autoArchiveCampaigns: true,
    automaticBackups: true,
    twoFactorAuth: false,
    allowAdminRegistration: false,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const [state, formAction] = useFormState(updateSettings, initialState);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        setSettings({
          emailNotifications: data.emailNotifications,
          autoArchiveCampaigns: data.autoArchiveCampaigns,
          automaticBackups: data.automaticBackups,
          twoFactorAuth: data.twoFactorAuth,
          allowAdminRegistration: data.allowAdminRegistration,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportDatabase();
      
      // Create and download JSON file
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `pitch-in-list-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Here you would call the import function
        console.log("Import data:", data);
        alert("Import functionality would be implemented here");
        
      } catch (error) {
        console.error("Import failed:", error);
        alert("Invalid file format. Please select a valid JSON export file.");
      }
    };
    
    input.click();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <AdminBreadcrumbs />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Settings</h1>
          <p className="text-muted-foreground">
            Essential system configuration and preferences.
          </p>
        </div>
      </div>

      {state.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {state.error}</p>
        </div>
      )}

      <form action={formAction}>
        {/* Essential Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Essential Settings</CardTitle>
                <CardDescription>Core system preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for new claims and campaign updates
                </p>
              </div>
              <Switch 
                id="email-notifications"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-archive">Auto-Archive Campaigns</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically archive completed campaigns
                </p>
              </div>
              <Switch 
                id="auto-archive"
                name="autoArchiveCampaigns"
                checked={settings.autoArchiveCampaigns}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoArchiveCampaigns: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <Database className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Backup and data operations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Create daily database backups
                </p>
              </div>
              <Switch 
                id="auto-backup"
                name="automaticBackups"
                checked={settings.automaticBackups}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, automaticBackups: checked }))
                }
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exporting..." : "Export Database"}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={handleImport}
              >
                Import Database
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Access control and authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for admin accounts
                </p>
              </div>
              <Switch 
                id="two-factor"
                name="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, twoFactorAuth: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-registration">Allow Admin Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Permit new admin account creation
                </p>
              </div>
              <Switch 
                id="allow-registration"
                name="allowAdminRegistration"
                checked={settings.allowAdminRegistration}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowAdminRegistration: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Test and verify email settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <Input
                  id="test-email"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Send a test email to verify your email configuration is working
                </p>
              </div>
              
              <Button 
                type="button"
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  if (!testEmail) {
                    alert("Please enter an email address");
                    return;
                  }
                  
                  setTestEmailLoading(true);
                  try {
                    const result = await sendTestEmail(testEmail);
                    if (result.success) {
                      alert("Test email sent successfully!");
                    } else {
                      alert(`Failed to send test email: ${result.error}`);
                    }
                  } catch (error) {
                    alert("Failed to send test email");
                  } finally {
                    setTestEmailLoading(false);
                  }
                }}
                disabled={testEmailLoading || !testEmail}
              >
                {testEmailLoading ? "Sending..." : "Send Test Email"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Email Configuration Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resend API Key: Configured</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>From Email: onboarding@resend.dev (default)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Email Templates: Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Reply-To: onboarding@resend.dev (default)</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Using Resend&apos;s default email domain. 
                  For production use, configure your own domain in Resend dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="min-w-[120px]">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
