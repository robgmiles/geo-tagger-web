import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { MapEditor } from '@/components/MapEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2 } from 'lucide-react';
import { 
  ImageWithMetadata, 
  GPSCoordinates, 
  processImageFile, 
  updateImageGPS 
} from '@/utils/exifUtils';

const Index = () => {
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedImage = images.find(img => img.id === selectedImageId) || null;

  const handleImagesSelect = useCallback(async (files: File[]) => {
    const newImages: ImageWithMetadata[] = [];
    
    for (const file of files) {
      try {
        const imageData = await processImageFile(file);
        newImages.push(imageData);
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Error",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }
    
    setImages(prev => [...prev, ...newImages]);
    
    // Auto-select first image if none selected
    if (!selectedImageId && newImages.length > 0) {
      setSelectedImageId(newImages[0].id);
    }
  }, [selectedImageId, toast]);

  const handleLocationUpdate = useCallback((imageId: string, coordinates: GPSCoordinates) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, gpsData: coordinates, hasGpsData: true }
        : img
    ));
    
    toast({
      title: "Location Updated",
      description: `GPS coordinates saved for the image`,
    });
  }, [toast]);

  const handleImageRemove = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    
    if (selectedImageId === imageId) {
      const remaining = images.filter(img => img.id !== imageId);
      setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [selectedImageId, images]);

  const handleDownloadImage = useCallback(async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      let blob: Blob;
      
      if (image.gpsData) {
        // Update EXIF with GPS data
        blob = await updateImageGPS(image.file, image.gpsData);
      } else {
        // Download original file
        blob = image.file;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geotag_${image.file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `${image.file.name} is being downloaded`,
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the image",
        variant: "destructive"
      });
    }
  }, [images, toast]);

  const handleClearAll = () => {
    setImages([]);
    setSelectedImageId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Image Management */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <ImageUpload 
                  onImagesSelect={handleImagesSelect}
                  currentImageCount={images.length}
                  maxFiles={5}
                />
              </CardContent>
            </Card>

            {images.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Images ({images.length}/5)
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleClearAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {images.map(image => (
                      <ImagePreview
                        key={image.id}
                        image={image}
                        isSelected={selectedImageId === image.id}
                        onSelect={() => setSelectedImageId(image.id)}
                        onRemove={() => handleImageRemove(image.id)}
                        onDownload={() => handleDownloadImage(image.id)}
                        onSetLocation={() => setSelectedImageId(image.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Map Editor */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MapEditor
              selectedImage={selectedImage}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
