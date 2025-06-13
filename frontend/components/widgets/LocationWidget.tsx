import { useEffect, useState } from "react";
import { MapPin, MapPinOff, Navigation, Globe, Loader } from "lucide-react";
import BaseWidget from "./BaseWidget";
import { cn } from "@/lib/utils";

interface LocationWidgetProps {
  onRemove?: () => void;
}

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  supported: boolean;
  loading: boolean;
  error: string | null;
}

export default function LocationWidget({ onRemove }: LocationWidgetProps) {
  const [locationInfo, setLocationInfo] = useState<LocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    city: null,
    country: null,
    supported: true,
    loading: true,
    error: null
  });

  // Reverse geocoding function using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'DevTools-Widget/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        return {
          address: data.display_name || 'Address not found',
          city: address.city || address.town || address.village || 'Unknown',
          country: address.country || 'Unknown'
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    
    return {
      address: 'Address not available',
      city: 'Unknown',
      country: 'Unknown'
    };
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationInfo(prev => ({ 
        ...prev, 
        supported: false, 
        loading: false,
        error: 'Geolocation not supported' 
      }));
      return;
    }

    const updateLocation = async () => {
      setLocationInfo(prev => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          // First update with coordinates
          setLocationInfo(prev => ({
            ...prev,
            latitude,
            longitude,
            accuracy,
            supported: true,
            loading: false,
            error: null
          }));

          // Then fetch address information
          const addressInfo = await reverseGeocode(latitude, longitude);
          setLocationInfo(prev => ({
            ...prev,
            ...addressInfo
          }));
        },
        (error) => {
          let errorMessage = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location timeout';
              break;
          }
          setLocationInfo(prev => ({ 
            ...prev, 
            loading: false,
            error: errorMessage 
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getLocationIcon = () => {
    if (locationInfo.loading) {
      return <Loader className="h-4 w-4 animate-spin" />;
    }
    if (locationInfo.error) {
      return <MapPinOff className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  };

  const getLocationStatus = () => {
    if (locationInfo.loading) return { color: "text-muted-foreground", text: "Locating..." };
    if (!locationInfo.supported || locationInfo.error) return { color: "text-red-500", text: "Error" };
    if (locationInfo.accuracy) {
      if (locationInfo.accuracy < 10) return { color: "text-emerald-500", text: "Precise" };
      if (locationInfo.accuracy < 50) return { color: "text-blue-500", text: "Good" };
      if (locationInfo.accuracy < 100) return { color: "text-yellow-500", text: "Fair" };
      return { color: "text-orange-500", text: "Rough" };
    }
    return { color: "text-emerald-500", text: "Located" };
  };



  const formatCoordinate = (coord: number | null) => {
    if (coord === null) return 'N/A';
    return coord.toFixed(4);
  };

  const status = getLocationStatus();

  return (
    <BaseWidget
      title="Location"
      icon={getLocationIcon()}
      onRemove={onRemove}
    >
      <div className="w-full space-y-2">
        {locationInfo.supported && !locationInfo.error ? (
          <>
            {/* Location Status and City */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("text-lg font-semibold", status.color)}>
                  {locationInfo.city || 'Unknown'}
                </span>
                <Globe className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className={cn("text-xs font-medium", status.color)}>
                {status.text}
              </span>
            </div>



            {/* Country and Accuracy Details */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {locationInfo.country || 'Unknown Country'}
              </span>
              {locationInfo.accuracy && (
                <span>
                  ±{Math.round(locationInfo.accuracy)}m accuracy
                </span>
              )}
            </div>

            {/* Address Information */}
            {!locationInfo.loading && locationInfo.address && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
                  {locationInfo.address.split(',').slice(0, 3).join(', ')}
                </p>
              </div>
            )}

            {/* Coordinates */}
            {!locationInfo.loading && locationInfo.latitude && locationInfo.longitude && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono tabular-nums">
                  {formatCoordinate(locationInfo.latitude)}°N
                </span>
                <span className="font-mono tabular-nums">
                  {formatCoordinate(locationInfo.longitude)}°E
                </span>
              </div>
            )}

            {/* Loading State */}
            {locationInfo.loading && (
              <div className="flex items-center justify-center py-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Navigation className="h-4 w-4 animate-pulse" />
                  <span className="text-xs">Getting location...</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-1">
            {locationInfo.loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Navigation className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : (
              <div className="text-center">
                <MapPinOff className="h-5 w-5 text-muted-foreground/50 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">
                  {locationInfo.error || 'Location not available'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseWidget>
  );
} 