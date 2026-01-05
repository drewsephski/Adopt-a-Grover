import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        // Get email configuration status
        const configStatus = await emailService.getEmailConfigurationStatus();
        
        // Send test email
        const result = await emailService.sendTestEmail(email);
        
        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully!',
            configStatus,
            result
        });
        
    } catch (error) {
        console.error('Test email failed:', error);
        return NextResponse.json(
            { 
                error: 'Failed to send test email',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const configStatus = await emailService.getEmailConfigurationStatus();
        
        return NextResponse.json({
            message: 'Email configuration status',
            configStatus
        });
        
    } catch (error) {
        console.error('Config check failed:', error);
        return NextResponse.json(
            { 
                error: 'Failed to get email configuration',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
