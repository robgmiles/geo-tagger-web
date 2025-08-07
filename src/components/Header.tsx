import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Shield, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-hero text-primary-foreground py-6 px-4 shadow-elevation">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GeoTagger</h1>
              <p className="text-primary-foreground/80 text-sm">
                Privacy-first EXIF GPS editor
              </p>
            </div>
          </div>
          <Link to="/about" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/20">
            <Shield className="w-3 h-3 mr-1" />
            Client-side only
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/20">
            <MapPin className="w-3 h-3 mr-1" />
            OpenStreetMap
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/20">
            Up to 5 images
          </Badge>
        </div>
      </div>
    </header>
  );
};