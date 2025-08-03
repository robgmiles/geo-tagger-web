import React from 'react';
import { MapPin, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithMetadata } from '@/utils/exifUtils';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  image: ImageWithMetadata;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDownload: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  isSelected,
  onSelect,
  onRemove,
  onDownload
}) => {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-elevation",
        isSelected && "ring-2 ring-primary shadow-elevation"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <img
            src={image.preview}
            alt={`Preview of ${image.file.name}`}
            className="w-full h-full object-cover"
          />
          
          {/* GPS Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant={image.hasGpsData ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium",
                image.hasGpsData 
                  ? "bg-map-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {image.hasGpsData ? "GPS" : "No GPS"}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Info */}
        <div className="p-3">
          <h4 className="text-sm font-medium text-foreground truncate">
            {image.file.name}
          </h4>
          <div className="mt-2 space-y-1">
            {image.gpsData ? (
              <div className="text-xs text-coordinates font-mono">
                <div>Lat: {image.gpsData.latitude.toFixed(6)}°</div>
                <div>Lng: {image.gpsData.longitude.toFixed(6)}°</div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No GPS coordinates found
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {(image.file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};