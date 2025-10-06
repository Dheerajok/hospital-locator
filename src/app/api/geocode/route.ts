import { NextRequest, NextResponse } from 'next/server';

const GEOCODING_API_KEY = process.env.GOOGLE_PLACES_API_KEY; // Use server-side key

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
    }

    if (!GEOCODING_API_KEY) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GEOCODING_API_KEY}`
        );
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
    }
}
