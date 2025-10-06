'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

type HeroProps = {
    onLocationSelect: (coords: { lat: number; lng: number }) => void;
};

const Hero: React.FC<HeroProps> = ({ onLocationSelect }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY;

    useEffect(() => {
        // Initialize Google Places Autocomplete when component mounts
        if (window.google && inputRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
                inputRef.current,
                {
                    types: ['(cities)'], // Restrict to cities/regions
                    fields: ['geometry', 'name'] // Only get what we need
                }
            );

            // Listen for place selection
            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                
                if (place?.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    
                    onLocationSelect({ lat, lng });
                    
                    // Smooth scroll to map
                    setTimeout(() => {
                        const mapSection = document.getElementById('find-hospital');
                        if (mapSection) {
                            mapSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                }
            });
        }
    }, [onLocationSelect]);

    const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    try {
        // Call your server-side API route instead
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Geocoding Error:', data);
            alert(`Geocoding failed: ${data.error_message || data.status}`);
            return;
        }

        const location = data?.results?.[0]?.geometry?.location;
        if (location) {
            onLocationSelect({ lat: location.lat, lng: location.lng });
            
            setTimeout(() => {
                const mapSection = document.getElementById('find-hospital');
                if (mapSection) {
                    mapSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            alert('Location not found. Try a more specific name.');
        }
    } catch (err) {
        console.error('Error geocoding location:', err);
        alert('Error finding location.');
    }
};


    return (
        <section
            className="relative w-full min-h-[60vh] flex items-center bg-cover bg-center"
            style={{ backgroundImage: "url('/bg8.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/40 z-0" />
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
                <div className="md:w-3/4 py-16 px-auto md:px-20">
                    <h1 className="font-bold text-white drop-shadow-lg mb-2 text-left">
                        Find the Nearest Hospital in Seconds
                    </h1>
                    
                    <form onSubmit={handleSearch} className="w-full max-w-md text-left">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-2 border-white bg-white rounded-lg shadow px-1 py-1 gap-2 sm:gap-0">
                            <div className="flex flex-row flex-1 items-center">
                                <FiSearch className="text-green text-xl mx-2" />
                                <input
                                    ref={inputRef}
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="bg-transparent outline-none border-none text-gray-600 placeholder-green w-full py-2 px-1"
                                    placeholder="Enter your location"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto ml-0 sm:ml-2 bg-green hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                Find Hospitals
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Hero;
