import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Save, RotateCcw, Search } from 'lucide-react';
import { ImageWithMetadata, GPSCoordinates } from '@/utils/exifUtils';

// Fix for Leaflet default markers in webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDJDMTMuMzcgMiA4IDcuMzcgOCAxNEM4IDE5LjI1IDEyLjUgMjguNzUgMjAgMzhDMjcuNSAyOC43NSAzMiAxOS4yNSAzMiAxNEMzMiA3LjM3IDI2LjYzIDIgMjAgMloiIGZpbGw9IiMzOTc2NjAiLz4KPHBhdGggZD0iTTIwIDEwQzE3Ljc5IDEwIDE2IDExLjc5IDE2IDE0QzE2IDE2LjIxIDE3Ljc5IDE4IDIwIDE4QzIyLjIxIDE4IDI0IDE2LjIxIDI0IDE0QzI0IDExLjc5IDIyLjIxIDEwIDIwIDEwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDJDMTMuMzcgMiA4IDcuMzcgOCAxNEM4IDE5LjI1IDEyLjUgMjguNzUgMjAgMzhDMjcuNSAyOC43NSAzMiAxOS4yNSAzMiAxNEMzMiA3LjM3IDI2LjYzIDIgMjAgMloiIGZpbGw9IiMzOTc2NjAiLz4KPHBhdGggZD0iTTIwIDEwQzE3Ljc5IDEwIDE2IDExLjc5IDE2IDE0QzE2IDE2LjIxIDE3Ljc5IDE4IDIwIDE4QzIyLjIxIDE4IDI0IDE2LjIxIDI0IDE0QzI0IDExLjc5IDIyLjIxIDEwIDIwIDEwWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  shadowUrl: '',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapEditorProps {
  selectedImage: ImageWithMetadata | null;
  onLocationUpdate: (imageId: string, coordinates: GPSCoordinates) => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({
  selectedImage,
  onLocationUpdate
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map('map', {
        center: [40.7128, -74.0060], // NYC default
        zoom: 10
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add click handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setCurrentCoords({ lat, lng });
        setHasUnsavedChanges(true);
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      });

      mapRef.current = map;
    }

    // Update map when selected image changes
    if (selectedImage && selectedImage.gpsData) {
      const { latitude, longitude } = selectedImage.gpsData;
      setCurrentCoords({ lat: latitude, lng: longitude });
      setHasUnsavedChanges(false);
      
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 15);
        
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
        }
      }
    } else if (selectedImage && !selectedImage.gpsData) {
      setCurrentCoords(null);
      setHasUnsavedChanges(false);
      
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }

    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectedImage]);

  const handleSave = () => {
    if (selectedImage && currentCoords) {
      const coordinates: GPSCoordinates = {
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        latitudeRef: currentCoords.lat >= 0 ? 'N' : 'S',
        longitudeRef: currentCoords.lng >= 0 ? 'E' : 'W'
      };
      
      onLocationUpdate(selectedImage.id, coordinates);
      setHasUnsavedChanges(false);
    }
  };

  const handleReset = () => {
    if (selectedImage && selectedImage.gpsData) {
      const { latitude, longitude } = selectedImage.gpsData;
      setCurrentCoords({ lat: latitude, lng: longitude });
      setHasUnsavedChanges(false);
      
      if (mapRef.current && markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], 15);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`
      );
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Update map view to the found location
        mapRef.current.setView([lat, lng], 13);
        
        // Clear search input
        setSearchQuery('');
      } else {
        console.warn('No results found for:', searchQuery);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-map-primary" />
            Location Editor
          </CardTitle>
          {selectedImage && (
            <Badge variant="outline" className="text-xs">
              {selectedImage.file.name}
            </Badge>
          )}
        </div>
        
        {selectedImage && (
          <div className="text-sm text-muted-foreground">
            {selectedImage.hasGpsData 
              ? "Click map to update location" 
              : "Click map to set initial location"
            }
          </div>
        )}
        
        {/* Search Bar */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            size="sm"
            variant="outline"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          id="map" 
          className="w-full h-64 lg:h-96 border-t"
          style={{ minHeight: '300px' }}
        />
        
        {selectedImage && currentCoords && (
          <div className="p-4 border-t bg-muted/20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium">Current Coordinates</div>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  Unsaved changes
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm font-mono text-coordinates mb-4">
              <div>
                <span className="text-muted-foreground">Latitude:</span>
                <div>{currentCoords.lat.toFixed(6)}°</div>
              </div>
              <div>
                <span className="text-muted-foreground">Longitude:</span>
                <div>{currentCoords.lng.toFixed(6)}°</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Location
              </Button>
              
              {selectedImage.hasGpsData && (
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {!selectedImage && (
          <div className="p-8 text-center text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an image to edit its location</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};