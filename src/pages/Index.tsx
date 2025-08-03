import React, { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ImageUpload } from '@/components/ImageUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { MapEditor } from '@/components/MapEditor';
import { MetadataEditor } from '@/components/MetadataEditor';
import { BulkActions } from '@/components/BulkActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2 } from 'lucide-react';
import JSZip from 'jszip';
import { 
  ImageWithMetadata, 
  GPSCoordinates, 
  CommonMetadata,
  processImageFile, 
  updateImageMetadata 
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

  const handleBulkLocationUpdate = useCallback((coordinates: GPSCoordinates) => {
    setImages(prev => prev.map(img => 
      !img.hasGpsData 
        ? { ...img, gpsData: coordinates, hasGpsData: true }
        : img
    ));
    
    const updatedCount = images.filter(img => !img.hasGpsData).length;
    toast({
      title: "Bulk Location Applied",
      description: `Location applied to ${updatedCount} image${updatedCount !== 1 ? 's' : ''}`,
    });
  }, [images, toast]);

  const handleMetadataUpdate = useCallback((imageId: string, metadata: CommonMetadata) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, metadata }
        : img
    ));
    
    toast({
      title: "Metadata Updated",
      description: `Metadata saved for the image`,
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
      
      if (image.gpsData || image.metadata) {
        // Update EXIF with GPS and/or metadata
        blob = await updateImageMetadata(image.file, image.gpsData, image.metadata);
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
    images.forEach(image => URL.revokeObjectURL(image.preview));
    setImages([]);
    setSelectedImageId(null);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;

    const zip = new JSZip();
    
    try {
      for (const image of images) {
        let blob: Blob;
        
        // Check if image has any updates (GPS or metadata)
        if (image.gpsData || image.metadata) {
          blob = await updateImageMetadata(image.file, image.gpsData, image.metadata);
        } else {
          blob = image.file;
        }
        
        // Add to zip with original filename
        zip.file(image.file.name, blob);
      }
      
      // Generate zip and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images-with-metadata.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `Downloaded ${images.length} images as ZIP file`,
      });
    } catch (error) {
      console.error('Error creating zip:', error);
      toast({
        title: "Download Failed",
        description: "There was an error creating the ZIP file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDownloadAll}
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearAll}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All
                      </Button>
                    </div>
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
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {images.length > 1 && (
              <BulkActions
                images={images}
                selectedImage={selectedImage}
                onBulkLocationUpdate={handleBulkLocationUpdate}
              />
            )}
          </div>

          {/* Middle Panel - Map Editor */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MapEditor
              selectedImage={selectedImage}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>

          {/* Right Panel - Metadata Editor */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <MetadataEditor
              selectedImage={selectedImage}
              onMetadataUpdate={handleMetadataUpdate}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
