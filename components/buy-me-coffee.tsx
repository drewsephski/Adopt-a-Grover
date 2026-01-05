"use client";

import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BuyMeACoffee() {
    return (
        <div className="relative">
            {/* Background decoration - uses primary color theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl blur-xl" />
            
            <div className="relative p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
                {/* Header with icon */}
                <div className="flex gifts-center justify-center gap-2 mb-4">
                    <div className="relative">
                        <Coffee className="w-5 h-5 text-primary" />
                        <Heart className="w-2 h-2 text-primary/80 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Support Development</span>
                </div>
                
                {/* Message */}
                <p className="text-center text-muted-foreground text-sm mb-4 leading-relaxed">
                    Enjoy this platform? Your support helps us continue helping families in need.
                </p>
                
                {/* Stats/Impact */}
                <div className="flex gifts-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
                    <div className="flex gifts-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span>100% Transparent</span>
                    </div>
                    <div className="flex gifts-center gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                        <span>Community Driven</span>
                    </div>
                </div>
                
                {/* CTA Button */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    asChild 
                    className="w-full mx-auto gifts-center justify-center flex rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 group-hover:scale-[1.02]"
                >
                    <a 
                        href="https://buymeacoffee.com/drew2" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex gifts-center justify-center gap-2"
                    >
                        <Coffee className="w-4 h-4" />
                        <span className="font-medium">Buy Me a Coffee</span>
                        <span className="text-xs opacity-60">☕</span>
                    </a>
                </Button>
                
                {/* Footer note */}
                <p className="text-center text-xs text-muted-foreground mt-3 opacity-70">
                    Every cup makes a difference 💝
                </p>
            </div>
        </div>
    );
}
