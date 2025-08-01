import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  maxFiles?: number;
  currentImageCount: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesSelect,
  maxFiles = 5,
  currentImageCount
}) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/jpeg') || file.type.startsWith('image/jpg')
    );
    
    const remainingSlots = maxFiles - currentImageCount;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      onImagesSelect(filesToAdd);
    }
  }, [onImagesSelect, maxFiles, currentImageCount]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/jpeg') || file.type.startsWith('image/jpg')
    );
    
    const remainingSlots = maxFiles - currentImageCount;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      onImagesSelect(filesToAdd);
    }
  };

  const canAcceptMore = currentImageCount < maxFiles;

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          canAcceptMore 
            ? "border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer" 
            : "border-muted-foreground/30 bg-muted/30 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={(e) => e.preventDefault()}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/jpg"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={!canAcceptMore}
        />
        
        <div className="flex flex-col items-center gap-4">
          {canAcceptMore ? (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-photo flex items-center justify-center shadow-photo">
                <Upload className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Upload JPEG Photos
                </h3>
                <p className="text-muted-foreground mt-1">
                  Drag & drop or click to select images
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentImageCount} / {maxFiles} images selected
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Maximum images reached
                </h3>
                <p className="text-muted-foreground mt-1">
                  Remove images to upload new ones
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ImageIcon className="w-4 h-4" />
        <span>Only JPEG/JPG files supported for EXIF metadata editing</span>
      </div>
    </div>
  );
};