"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store admin session in localStorage
                localStorage.setItem("adminSession", "true");
                localStorage.setItem("adminTimestamp", Date.now().toString());
                router.push("/admin");
            } else {
                setError(data.error || "Invalid admin credentials");
            }
        } catch {
            setError("Failed to verify admin credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
                    <p className="text-muted-foreground mt-2">Enter your admin credentials to continue</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Admin Login
                        </CardTitle>
                        <CardDescription>
                            Enter your Clerk User ID to access the admin dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="userId">Admin User ID</Label>
                                <Input
                                    id="userId"
                                    type="text"
                                    placeholder="Enter your Clerk User ID"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                    className="font-mono"
                                />
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading || !userId.trim()}
                            >
                                {isLoading ? (
                                    "Verifying..."
                                ) : (
                                    <>
                                        Access Admin Dashboard
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t text-center">
                            <p className="text-sm text-muted-foreground">
                                Don&apos;t have access? Contact the system administrator.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
