import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/logger';

export async function POST(request) {
    try {
        const data = await request.json();

        // Ensure we only log valid requests
        if (!data.action || !data.ip) {
            return NextResponse.json({ error: 'Invalid log data' }, { status: 400 });
        }

        // Fire and forget logging
        logAudit(data);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process log' }, { status: 500 });
    }
}
