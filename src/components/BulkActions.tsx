import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users } from 'lucide-react';
import { ImageWithMetadata, GPSCoordinates } from '@/utils/exifUtils';

interface BulkActionsProps {
  images: ImageWithMetadata[];
  selectedImage: ImageWithMetadata | null;
  onBulkLocationUpdate: (coordinates: GPSCoordinates) => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  images,
  selectedImage,
  onBulkLocationUpdate
}) => {
  const handleApplyLocationToAll = () => {
    if (selectedImage?.gpsData) {
      onBulkLocationUpdate(selectedImage.gpsData);
    }
  };

  const imagesWithoutGPS = images.filter(img => !img.hasGpsData).length;
  const canApplyToAll = selectedImage?.hasGpsData && imagesWithoutGPS > 0;

  if (images.length <= 1) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-bulk-primary" />
          Bulk Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedImage?.hasGpsData && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Apply location from <span className="font-medium">{selectedImage.file.name}</span> to other images
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Images without location: {imagesWithoutGPS}</span>
            </div>
            
            <Button
              onClick={handleApplyLocationToAll}
              disabled={!canApplyToAll}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Apply to All Images
            </Button>
          </div>
        )}
        
        {!selectedImage?.hasGpsData && (
          <div className="text-sm text-muted-foreground text-center py-2">
            Select an image with location data to apply to others
          </div>
        )}
      </CardContent>
    </Card>
  );
};