import { NextRequest, NextResponse } from 'next/server';

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    return await searchPlaces(lat, lng);
}

export async function POST(req: NextRequest) {
    const { lat, lng } = await req.json();
    return await searchPlaces(lat, lng);
}

async function searchPlaces(lat: string | null, lng: string | null) {
    if (!lat || !lng) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    if (!PLACES_API_KEY) {
        console.error("ENVIRONMENT ERROR: GOOGLE_PLACES_API_KEY is missing!");
        return NextResponse.json({ error: 'API Key not configured on server.' }, { status: 500 });
    }

    const requestBody = {
        includedTypes: ["hospital"],
        maxResultCount: 20,
        locationRestriction: {
            circle: {
                center: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng)
                },
                radius: 5000.0
            }
        }
    };

    try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': PLACES_API_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();
        
        console.log(`[NEW PLACES API LOG] Search for ${lat},${lng} returned ${data.places?.length || 0} results`);
        
        if (!res.ok) {
            console.error('NEW PLACES API ERROR:', data);
            return NextResponse.json({
                error: 'Places API upstream failure',
                details: data
            }, { status: 502 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Network or Parsing Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch places due to network or JSON parsing error' },
            { status: 500 }
        );
    }
}
