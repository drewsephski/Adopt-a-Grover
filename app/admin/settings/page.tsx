import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Database, Shield } from "lucide-react";

export default function AdminSettingsPage() {
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
                        <Switch id="email-notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-archive">Auto-Archive Campaigns</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically archive completed campaigns
                            </p>
                        </div>
                        <Switch id="auto-archive" />
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
                        <Switch id="auto-backup" />
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                        <Button variant="outline" className="w-full">
                            Export Database
                        </Button>
                        <Button variant="outline" className="w-full">
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
                        <Switch id="two-factor" />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="allow-registration">Allow Admin Registration</Label>
                            <p className="text-sm text-muted-foreground">
                                Permit new admin account creation
                            </p>
                        </div>
                        <Switch id="allow-registration" />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button size="lg" className="min-w-[120px]">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
