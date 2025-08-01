import piexifjs from 'piexifjs';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  latitudeRef: 'N' | 'S';
  longitudeRef: 'E' | 'W';
}

export interface CommonMetadata {
  title?: string;
  description?: string;
  artist?: string;
  copyright?: string;
  keywords?: string;
}

export interface ImageWithMetadata {
  file: File;
  id: string;
  preview: string;
  gpsData?: GPSCoordinates;
  hasGpsData: boolean;
  metadata?: CommonMetadata;
}

// Convert decimal degrees to DMS (Degrees, Minutes, Seconds) format for EXIF
export function decimalToDMS(decimal: number): [number, number, number] {
  const degrees = Math.floor(Math.abs(decimal));
  const minutes = Math.floor((Math.abs(decimal) - degrees) * 60);
  const seconds = ((Math.abs(decimal) - degrees) * 60 - minutes) * 60;
  return [degrees, minutes, seconds];
}

// Convert DMS format to decimal degrees
export function dmsToDecimal(dms: [number, number, number], ref: string): number {
  const decimal = dms[0] + dms[1] / 60 + dms[2] / 3600;
  return ref === 'S' || ref === 'W' ? -decimal : decimal;
}

// Extract common metadata from EXIF
export function extractCommonMetadata(exifData: any): CommonMetadata {
  try {
    const metadata: CommonMetadata = {};
    
    if (exifData?.['0th']) {
      const ifd0 = exifData['0th'];
      if (ifd0[piexifjs.ImageIFD.ImageDescription]) {
        metadata.description = ifd0[piexifjs.ImageIFD.ImageDescription];
      }
      if (ifd0[piexifjs.ImageIFD.Artist]) {
        metadata.artist = ifd0[piexifjs.ImageIFD.Artist];
      }
      if (ifd0[piexifjs.ImageIFD.Copyright]) {
        metadata.copyright = ifd0[piexifjs.ImageIFD.Copyright];
      }
      if (ifd0[piexifjs.ImageIFD.XPTitle]) {
        metadata.title = ifd0[piexifjs.ImageIFD.XPTitle];
      }
      if (ifd0[piexifjs.ImageIFD.XPKeywords]) {
        metadata.keywords = ifd0[piexifjs.ImageIFD.XPKeywords];
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

// Extract GPS data from EXIF
export function extractGPSFromExif(exifData: any): GPSCoordinates | null {
  try {
    const gps = exifData?.GPS;
    if (!gps || !gps[piexifjs.GPSIFD.GPSLatitude] || !gps[piexifjs.GPSIFD.GPSLongitude]) {
      return null;
    }

    const latDMS = gps[piexifjs.GPSIFD.GPSLatitude];
    const lonDMS = gps[piexifjs.GPSIFD.GPSLongitude];
    const latRef = gps[piexifjs.GPSIFD.GPSLatitudeRef];
    const lonRef = gps[piexifjs.GPSIFD.GPSLongitudeRef];

    const latitude = dmsToDecimal(latDMS, latRef);
    const longitude = dmsToDecimal(lonDMS, lonRef);

    return {
      latitude,
      longitude,
      latitudeRef: latRef as 'N' | 'S',
      longitudeRef: lonRef as 'E' | 'W'
    };
  } catch (error) {
    console.error('Error extracting GPS data:', error);
    return null;
  }
}

// Read EXIF data from image file
export async function readExifData(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binary = e.target?.result as string;
        const exifData = piexifjs.load(binary);
        resolve(exifData);
      } catch (error) {
        console.error('Error reading EXIF data:', error);
        resolve(null);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Update GPS and metadata in EXIF and return new image blob
export async function updateImageMetadata(
  file: File, 
  coordinates?: GPSCoordinates, 
  metadata?: CommonMetadata
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binary = e.target?.result as string;
        let exifData = piexifjs.load(binary);

        // Ensure required IFDs exist
        if (!exifData['0th']) {
          exifData['0th'] = {};
        }
        
        if (coordinates) {
          if (!exifData.GPS) {
            exifData.GPS = {};
          }

          // Convert decimal to DMS format
          const latDMS = decimalToDMS(coordinates.latitude);
          const lonDMS = decimalToDMS(coordinates.longitude);

          // Set GPS data
          exifData.GPS[piexifjs.GPSIFD.GPSLatitude] = latDMS;
          exifData.GPS[piexifjs.GPSIFD.GPSLongitude] = lonDMS;
          exifData.GPS[piexifjs.GPSIFD.GPSLatitudeRef] = coordinates.latitude >= 0 ? 'N' : 'S';
          exifData.GPS[piexifjs.GPSIFD.GPSLongitudeRef] = coordinates.longitude >= 0 ? 'E' : 'W';
        }
        
        // Set common metadata
        if (metadata) {
          if (metadata.description) {
            exifData['0th'][piexifjs.ImageIFD.ImageDescription] = metadata.description;
          }
          if (metadata.artist) {
            exifData['0th'][piexifjs.ImageIFD.Artist] = metadata.artist;
          }
          if (metadata.copyright) {
            exifData['0th'][piexifjs.ImageIFD.Copyright] = metadata.copyright;
          }
          if (metadata.title) {
            exifData['0th'][piexifjs.ImageIFD.XPTitle] = metadata.title;
          }
          if (metadata.keywords) {
            exifData['0th'][piexifjs.ImageIFD.XPKeywords] = metadata.keywords;
          }
        }

        // Create new binary with updated EXIF
        const newBinary = piexifjs.insert(piexifjs.dump(exifData), binary);
        
        // Convert back to blob
        const byteCharacters = atob(newBinary.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        
        resolve(blob);
      } catch (error) {
        console.error('Error updating GPS data:', error);
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Legacy function for backward compatibility
export async function updateImageGPS(file: File, coordinates: GPSCoordinates): Promise<Blob> {
  return updateImageMetadata(file, coordinates);
}

// Process uploaded image files
export async function processImageFile(file: File): Promise<ImageWithMetadata> {
  const id = Math.random().toString(36).substr(2, 9);
  const preview = URL.createObjectURL(file);
  
  try {
    const exifData = await readExifData(file);
    const gpsData = extractGPSFromExif(exifData);
    const metadata = extractCommonMetadata(exifData);
    
    return {
      file,
      id,
      preview,
      gpsData: gpsData || undefined,
      hasGpsData: !!gpsData,
      metadata
    };
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      file,
      id,
      preview,
      hasGpsData: false
    };
  }
}