import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes - admin area requires authentication and admin privileges
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicAdminRoute = createRouteMatcher(["/admin/login"]);

export default clerkMiddleware(async (auth, req) => {
    // Allow access to admin login page
    if (isPublicAdminRoute(req)) {
        return;
    }
    
    if (isProtectedRoute(req)) {
        const authResult = await auth();
        const userId = authResult.userId;
        
        // Check if user is authenticated
        if (!userId) {
            await auth.protect();
            return;
        }
        
        // Check if user is the admin
        const adminUserId = process.env.ADMIN_USER_ID;
        if (!adminUserId) {
            throw new Error("Server configuration error: Admin user ID not set");
        }
        
        if (userId !== adminUserId) {
            console.warn(`Unauthorized admin access attempt by user: ${userId} to ${req.url}`);
            // Redirect to admin login page
            const url = new URL("/admin/login", req.url);
            return Response.redirect(url);
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
