import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, MapPin, Download, Upload, Edit, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground py-6 px-4 shadow-elevation">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">About GeoTagger</h1>
              <p className="text-primary-foreground/80 text-sm">
                Free online photo geotagging and metadata editor
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy-First Photo Geotagging Tool
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                GeoTagger is a free, client-side photo geotagging and EXIF metadata editor. Add GPS coordinates and metadata to your photos without uploading them to any server. Your images never leave your device, ensuring complete privacy and security.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Shield className="w-3 h-3 mr-1" />
                  100% Client-Side
                </Badge>
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  GPS Coordinates
                </Badge>
                <Badge variant="secondary">
                  <Edit className="w-3 h-3 mr-1" />
                  EXIF Metadata
                </Badge>
                <Badge variant="secondary">
                  <Download className="w-3 h-3 mr-1" />
                  Batch Download
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>How to Add GPS to Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Upload Your Photos</h3>
                      <p className="text-sm text-muted-foreground">Click "Choose Images" to select up to 5 photos from your device. Supports JPEG format.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                    <div>
                      <h3 className="font-semibold mb-1">Select a Photo</h3>
                      <p className="text-sm text-muted-foreground">Click on any uploaded photo thumbnail to select it for editing.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Set Location</h3>
                      <p className="text-sm text-muted-foreground">Use the search bar to find a location, or click directly on the map to set GPS coordinates.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</div>
                    <div>
                      <h3 className="font-semibold mb-1">Add Metadata</h3>
                      <p className="text-sm text-muted-foreground">Fill in subject, description, and artist information in the metadata editor.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">5</div>
                    <div>
                      <h3 className="font-semibold mb-1">Save Changes</h3>
                      <p className="text-sm text-muted-foreground">Click "Save Location" and update metadata to apply changes to your photo.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">6</div>
                    <div>
                      <h3 className="font-semibold mb-1">Download</h3>
                      <p className="text-sm text-muted-foreground">Download individual photos or use "Download All" to get a ZIP file with all your geotagged images.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Add GPS coordinates to photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Edit EXIF metadata (subject, description, artist)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Interactive map with location search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Batch processing up to 5 images</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">100% client-side processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">No image uploads to servers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Bulk location assignment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">ZIP download for multiple images</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How do I add GPS coordinates to my photos?</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your photos, select one, then either search for a location or click directly on the map. Click "Save Location" to embed the GPS coordinates into your photo's EXIF data.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Is this photo geotagging tool free to use?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, GeoTagger is completely free to use. There are no hidden fees, subscriptions, or limits on how many photos you can geotag.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Are my photos uploaded to your servers?</h3>
                <p className="text-sm text-muted-foreground">
                  No, your photos never leave your device. All processing happens in your browser (client-side), ensuring complete privacy and security of your images.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">What photo metadata can I edit?</h3>
                <p className="text-sm text-muted-foreground">
                  You can edit the subject, description, and artist fields in your photo's EXIF metadata, plus add GPS coordinates (latitude and longitude).
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">Can I geotag multiple photos at once?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upload up to 5 photos and use the bulk location feature to apply the same GPS coordinates to multiple images that don't already have location data.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">What image formats are supported?</h3>
                <p className="text-sm text-muted-foreground">
                  Currently, GeoTagger supports JPEG images with EXIF metadata. This covers most photos taken with digital cameras and smartphones.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold mb-2">How do I download my geotagged photos?</h3>
                <p className="text-sm text-muted-foreground">
                  You can download individual photos by clicking the download button on each thumbnail, or use "Download All" to get a ZIP file containing all your processed images.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card>
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Geotagging?</h2>
              <p className="text-muted-foreground mb-6">
                Begin adding GPS coordinates and metadata to your photos with our free, privacy-focused tool.
              </p>
              <Link to="/">
                <Button size="lg" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Start Geotagging Photos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default About;