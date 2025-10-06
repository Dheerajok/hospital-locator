// Maps.tsx - The component that loads and displays the map

'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
    GoogleMap,
    Marker,
    InfoWindow,
    useJsApiLoader,
} from '@react-google-maps/api';
import Container from './common/Container';
import Title from './common/Title';
import { HospitalCard } from './HospitalCard';
import { useUserLocation } from '../hooks/useUserLocation';
import { useHospitalData } from '../hooks/useHospitalData';

const containerStyle = {
    width: '100%',
    height: '600px',
};

// Client-side key from .env.local (HTTP Referrer Restricted)
const MAPS_JS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY;

type MapsProps = {
    overrideLocation?: { lat: number; lng: number } | null;
};

const Maps: React.FC<MapsProps> = ({ overrideLocation }) => {
    // Note: useUserLocation and useHospitalData are custom hooks not defined here.
    const location = useUserLocation(overrideLocation); 
    const hospitals = useHospitalData(location);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: MAPS_JS_API_KEY!, // Use the dedicated Map Key
        libraries: ['places'], // Essential if you use any Places features on the map
    });

    const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const [zoom, setZoom] = useState(15); 

    // Map functions (onLoad, onZoomChanged) remain the same...
    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        setZoom(map.getZoom() ?? 13);
    }, []);

    const onZoomChanged = () => {
        if (mapRef.current) {
            setZoom(mapRef.current.getZoom() ?? 13);
        }
    };

    if (loadError)
        return (
             <div className="flex items-center justify-center h-[300px] w-full">
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-red-500 font-medium">
                        Error loading map. Check console for ApiProjectMapError.
                    </p>
                </div>
            </div>
        );
    if (!isLoaded || !location) {
        return (
            <div className="flex items-center justify-center h-[300px] w-full">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-green border-t-transparent" />
                    <p className="text-gray-600 font-medium">Loading map...</p>
                </div>
            </div>
        );
    }
        

    return (
        <section id="find-hospital">
            <Container className="py-5 md:py-10">
                <Title
                    title="Nearby Hospitals"
                    description="Find hospitals near your current location."
                />
                <div className="flex flex-col md:flex-row gap-5 my-8">
                    <div className="w-full md:w-3/4">
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={location}
                            zoom={zoom}
                            onLoad={onMapLoad}
                            onZoomChanged={onZoomChanged}
                        >
                            {/* Green marker for user's location */}
                            <Marker
                                position={location}
                                label="Me"
                                icon={{
                                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Fallback to a simple Google icon
                                    scaledSize: new window.google.maps.Size(40, 40),
                                }}
                                zIndex={999}
                            />

                            {/* Hospital markers */}
                            {hospitals.map((hospital, i) => (
                                <Marker
                                    key={i}
                                    position={{ lat: hospital.lat, lng: hospital.lng }}
                                    onClick={() => setSelectedHospital(i)}
                                    // ... (rest of marker logic) ...
                                />
                            ))}
                            
                            {/* ... (InfoWindow logic) ... */}
                            {selectedHospital !== null && hospitals[selectedHospital] && (
                                <InfoWindow
                                    position={{
                                        lat: hospitals[selectedHospital].lat,
                                        lng: hospitals[selectedHospital].lng,
                                    }}
                                    onCloseClick={() => setSelectedHospital(null)}
                                >
                                    <div className="text-sm font-medium">
                                        {hospitals[selectedHospital].name}
                                    </div>
                                </InfoWindow>
                            )}
                        </GoogleMap>
                    </div>

                    {/* Hospital list - assumes HospitalCard is defined */}
                    <div className="w-full md:w-1/4 mt-4 md:mt-0 flex md:flex-col flex-row gap-2 max-h-[600px] md:overflow-y-auto overflow-x-auto">
                        {hospitals.length === 0 && <p>No hospitals found nearby.</p>}
                        {hospitals.map((hospital, i) => (
                            <div
                                key={i}
                                onClick={() => setSelectedHospital(i)}
                                style={{
                                    cursor: 'pointer',
                                    minWidth: '250px',
                                    flex: '0 0 auto',
                                }}
                            >
                                <HospitalCard
                                    hospital={hospital}
                                    selected={selectedHospital === i}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Maps;