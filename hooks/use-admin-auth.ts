"use client";

import { useState } from "react";

export function useAdminAuth() {
    const [isAdmin, setIsAdmin] = useState(false);

    const loginAdmin = () => {
        // Store admin session
        if (typeof window !== 'undefined') {
            localStorage.setItem("adminSession", "true");
            localStorage.setItem("adminTimestamp", Date.now().toString());
        }
        setIsAdmin(true);
    };

    const logoutAdmin = () => {
        // Clear admin session
        if (typeof window !== 'undefined') {
            localStorage.removeItem("adminSession");
            localStorage.removeItem("adminTimestamp");
        }
        setIsAdmin(false);
    };

    const checkAdminSession = () => {
        if (typeof window !== 'undefined') {
            const adminSession = localStorage.getItem("adminSession");
            const adminTimestamp = localStorage.getItem("adminTimestamp");
            
            if (adminSession === "true" && adminTimestamp) {
                const sessionAge = Date.now() - parseInt(adminTimestamp);
                const maxAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (sessionAge < maxAge) {
                    setIsAdmin(true);
                    return true;
                } else {
                    // Session expired
                    localStorage.removeItem("adminSession");
                    localStorage.removeItem("adminTimestamp");
                }
            }
        }
        return false;
    };

    return {
        isAdmin,
        loginAdmin,
        logoutAdmin,
        checkAdminSession,
    };
}
