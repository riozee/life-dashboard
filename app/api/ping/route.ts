import { NextResponse } from 'next/server';

export async function GET() {
	// Simple ping endpoint that always returns 200 OK
	return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
