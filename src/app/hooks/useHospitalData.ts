// hooks/useHospitalData.ts
import { useState, useEffect } from 'react';
import { Hospital } from '../components/HospitalCard';

export const useHospitalData = (location: { lat: number; lng: number } | null) => {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);

    useEffect(() => {
        if (!location) return;

        const fetchHospitals = async () => {
            try {
                const response = await fetch(`/api/places?lat=${location.lat}&lng=${location.lng}`);
                const data = await response.json();

                if (data.places) {
                    // Transform NEW Places API response to match your Hospital interface
                    const transformedHospitals: Hospital[] = data.places.map((place: any) => ({
                        name: place.displayName.text,
                        lat: place.location.latitude,
                        lng: place.location.longitude,
                        vicinity: place.formattedAddress, // Use formattedAddress as vicinity
                        rating: undefined, // New API doesn't include rating by default
                        open: undefined    // New API doesn't include open status by default
                    }));
                    
                    setHospitals(transformedHospitals);
                } else {
                    setHospitals([]);
                }
            } catch (error) {
                console.error('Error fetching hospitals:', error);
                setHospitals([]);
            }
        };

        fetchHospitals();
    }, [location]);

    return hospitals;
};
