import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, FileText, X } from 'lucide-react';
import { ImageWithMetadata, CommonMetadata } from '@/utils/exifUtils';

interface MetadataEditorProps {
  selectedImage: ImageWithMetadata | null;
  onMetadataUpdate: (imageId: string, metadata: CommonMetadata) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  selectedImage,
  onMetadataUpdate
}) => {
  const [metadata, setMetadata] = useState<CommonMetadata>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      setMetadata(selectedImage.metadata || {});
      setHasUnsavedChanges(false);
    }
  }, [selectedImage]);

  const handleFieldChange = (field: keyof CommonMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (selectedImage) {
      onMetadataUpdate(selectedImage.id, metadata);
      setHasUnsavedChanges(false);
    }
  };

  const handleReset = () => {
    if (selectedImage) {
      setMetadata(selectedImage.metadata || {});
      setHasUnsavedChanges(false);
    }
  };

  const clearField = (field: keyof CommonMetadata) => {
    handleFieldChange(field, '');
  };

  if (!selectedImage) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select an image to edit its metadata</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-metadata-primary" />
            Metadata Editor
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {selectedImage.file.name}
          </Badge>
        </div>
        
        {hasUnsavedChanges && (
          <Badge variant="outline" className="text-xs text-orange-600 w-fit">
            Unsaved changes
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Subject</Label>
              {metadata.description && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearField('description')}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Textarea
              id="description"
              value={metadata.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Image subject"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="artist">Artist/Author</Label>
              {metadata.artist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearField('artist')}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Input
              id="artist"
              value={metadata.artist || ''}
              onChange={(e) => handleFieldChange('artist', e.target.value)}
              placeholder="Photographer or creator name"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="copyright">Copyright</Label>
              {metadata.copyright && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearField('copyright')}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Input
              id="copyright"
              value={metadata.copyright || ''}
              onChange={(e) => handleFieldChange('copyright', e.target.value)}
              placeholder="Copyright information"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="keywords">Keywords</Label>
              {metadata.keywords && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearField('keywords')}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Input
              id="keywords"
              value={metadata.keywords || ''}
              onChange={(e) => handleFieldChange('keywords', e.target.value)}
              placeholder="Tags, keywords (comma separated)"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Metadata
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};