import { useEffect, useState } from "react";
import { MapPin, MapPinOff } from "lucide-react";
import BaseWidget from "./BaseWidget";

interface LocationWidgetProps {
  onRemove?: () => void;
}

export default function LocationWidget({ onRemove }: LocationWidgetProps) {
  const [locationInfo, setLocationInfo] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    supported: boolean;
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    supported: true,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationInfo(prev => ({ 
        ...prev, 
        supported: false, 
        error: 'Not supported' 
      }));
      return;
    }

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationInfo({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            supported: true,
            error: null
          });
        },
        (error) => {
          let errorMessage = 'Access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Timeout';
              break;
          }
          setLocationInfo(prev => ({ 
            ...prev, 
            error: errorMessage 
          }));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatCoordinate = (coord: number | null) => {
    if (coord === null) return 'N/A';
    return coord.toFixed(3);
  };

  return (
    <BaseWidget
      title="Location"
      icon={locationInfo.error ? <MapPinOff className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
      onRemove={onRemove}
    >
      <div className="flex items-end justify-between w-full h-full">
        {!locationInfo.supported || locationInfo.error ? (
          <span className="text-xs text-red-500">
            {locationInfo.error}
          </span>
        ) : locationInfo.latitude !== null && locationInfo.longitude !== null ? (
          <>
            <div className="flex flex-col">
              <span className="text-xs font-medium leading-tight">
                {formatCoordinate(locationInfo.latitude)}°
              </span>
              <span className="text-xs font-medium leading-tight">
                {formatCoordinate(locationInfo.longitude)}°
              </span>
            </div>
            {locationInfo.accuracy && (
              <span className="text-xs text-muted-foreground">
                ±{Math.round(locationInfo.accuracy)}m
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            Loading...
          </span>
        )}
      </div>
    </BaseWidget>
  );
} 