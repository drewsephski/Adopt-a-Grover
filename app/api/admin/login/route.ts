import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const adminUserId = process.env.ADMIN_USER_ID;

        if (!adminUserId) {
            return NextResponse.json(
                { error: "Server configuration error: Admin user ID not set" },
                { status: 500 }
            );
        }

        if (userId === adminUserId) {
            return NextResponse.json({
                success: true,
                message: "Admin credentials verified",
            });
        } else {
            console.warn(`Admin login attempt with invalid user ID: ${userId}`);
            return NextResponse.json(
                { error: "Invalid admin credentials" },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
