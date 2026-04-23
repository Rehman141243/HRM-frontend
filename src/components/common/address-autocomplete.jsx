"use client";

import * as React from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * AddressAutocomplete component using OpenStreetMap Nominatim API
 * No API key required.
 */
export function AddressAutocomplete({ value, onChange, onSelectAddress, className }) {
    const [query, setQuery] = React.useState(value || "");
    const [suggestions, setSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const wrapperRef = React.useRef(null);

    // Sync internal state with prop if it changes externally
    React.useEffect(() => {
        setQuery(value || "");
    }, [value]);

    // Handle outside clicks to close dropdown
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}&addressdetails=1&limit=5`,
                {
                    headers: {
                        "Accept-Language": "en-US,en;q=0.9",
                    },
                }
            );
            const data = await response.json();
            setSuggestions(data);
            setIsOpen(true);
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query !== value) {
                fetchSuggestions(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, value]);

    const handleSelect = (suggestion) => {
        const displayName = suggestion.display_name;
        const address = suggestion.address;

        // Construct simplified details
        const city = address.city || address.town || address.village || address.hamlet || "";
        const country = address.country || "";
        const lat = suggestion.lat;
        const lon = suggestion.lon;
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

        setQuery(displayName);
        onChange(displayName);

        if (onSelectAddress) {
            onSelectAddress({
                address: displayName,
                city,
                country,
                latitude: lat,
                longitude: lon,
                map_link: mapLink,
            });
        }

        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <div className="relative">
                <Input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                    }}
                    placeholder="Search address using OpenStreetMap..."
                    className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MapPin className="h-4 w-4" />
                    )}
                </div>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                    <ul className="max-h-60 overflow-auto py-1 text-sm">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(item)}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                            >
                                <MapPin className="mr-2 h-4 w-4 min-w-4 text-muted-foreground" />
                                <span className="line-clamp-1">{item.display_name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
