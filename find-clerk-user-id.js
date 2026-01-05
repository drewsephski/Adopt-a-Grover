#!/usr/bin/env node

// Helper script to find your Clerk User ID
// Run with: node find-clerk-user-id.js

import { auth } from "@clerk/nextjs/server";

async function findCurrentUserId() {
    try {
        console.log('🔍 Looking for your Clerk User ID...\n');
        
        // This will show the current authenticated user's ID
        const { userId } = await auth();
        
        if (userId) {
            console.log('✅ Found your Clerk User ID:');
            console.log(userId);
            console.log('\n📝 Add this to your .env file:');
            console.log(`ADMIN_USER_ID=${userId}`);
            console.log('\n⚠️  Make sure to restart your development server after updating .env');
        } else {
            console.log('❌ No authenticated user found');
            console.log('Please make sure you are logged in and try again.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Alternative method:');
        console.log('1. Go to your Clerk Dashboard');
        console.log('2. Navigate to "Users"');
        console.log('3. Find your account and copy the User ID');
        console.log('4. Add it to your .env file as ADMIN_USER_ID');
    }
}

findCurrentUserId();
