#!/usr/bin/env node

// Test email script for pitchitlist.com
// Run with: node test-email.js

import { emailService } from './lib/email-service.js';

async function testEmailConfiguration() {
    console.log('🧪 Testing email configuration for pitchitlist.com...\n');
    
    try {
        // Check configuration status
        const configStatus = await emailService.getEmailConfigurationStatus();
        console.log('📧 Email Configuration Status:');
        console.log(JSON.stringify(configStatus, null, 2));
        
        if (!configStatus.configured) {
            console.log('\n❌ Email not properly configured');
            console.log('Missing:', Object.keys(configStatus).filter(key => !configStatus[key]));
            return;
        }
        
        // Send test email (you'll need to provide your email)
        const testEmail = process.argv[2] || 'your-email@example.com';
        
        console.log(`\n📤 Sending test email to: ${testEmail}`);
        
        const result = await emailService.sendTestEmail(testEmail);
        
        console.log('\n✅ Test email sent successfully!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Details:', error);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    testEmailConfiguration();
}

export { testEmailConfiguration };
