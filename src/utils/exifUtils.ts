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

// Convert decimal degrees to DMS rational format for EXIF (piexifjs expects rational numbers)
export function decimalToDMS(decimal: number): [[number, number], [number, number], [number, number]] {
  // Validate coordinate range
  if (Math.abs(decimal) > 180) {
    throw new Error(`Invalid coordinate: ${decimal}. Must be between -180 and 180.`);
  }
  
  const absDecimal = Math.abs(decimal);
  const degrees = Math.floor(absDecimal);
  const minutesFloat = (absDecimal - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const secondsFloat = (minutesFloat - minutes) * 60;
  
  // Convert seconds to rational number to maintain precision
  // Use denominator of 1000 to maintain 3 decimal places
  const secondsNumerator = Math.round(secondsFloat * 1000);
  const secondsDenominator = 1000;
  
  console.log(`Converting ${decimal}° to DMS: ${degrees}°${minutes}'${secondsFloat.toFixed(3)}"`);
  
  return [
    [degrees, 1],
    [minutes, 1], 
    [secondsNumerator, secondsDenominator]
  ];
}

// Convert DMS format to decimal degrees (handles both rational and simple array formats)
export function dmsToDecimal(dms: any, ref: string): number {
  let degrees: number, minutes: number, seconds: number;
  
  // Handle rational format: [[deg_num, deg_den], [min_num, min_den], [sec_num, sec_den]]
  if (Array.isArray(dms[0]) && dms[0].length === 2) {
    degrees = dms[0][0] / dms[0][1];
    minutes = dms[1][0] / dms[1][1];
    seconds = dms[2][0] / dms[2][1];
  } 
  // Handle simple array format: [degrees, minutes, seconds]
  else {
    degrees = dms[0];
    minutes = dms[1];
    seconds = dms[2];
  }
  
  const decimal = degrees + minutes / 60 + seconds / 3600;
  const result = ref === 'S' || ref === 'W' ? -decimal : decimal;
  
  console.log(`Converting DMS [${degrees}, ${minutes}, ${seconds}] ${ref} to decimal: ${result}`);
  
  return result;
}

// Convert string to UTF-16 byte array for XP fields
function stringToUTF16Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xff);
    bytes.push((code >> 8) & 0xff);
  }
  // Add null terminator
  bytes.push(0, 0);
  return bytes;
}

// Convert UTF-16 byte array to string for XP fields
function utf16BytesToString(bytes: number[]): string {
  let str = '';
  for (let i = 0; i < bytes.length - 1; i += 2) {
    const code = bytes[i] | (bytes[i + 1] << 8);
    if (code === 0) break; // null terminator
    str += String.fromCharCode(code);
  }
  return str;
}

// Extract common metadata from EXIF
export function extractCommonMetadata(exifData: any): CommonMetadata {
  try {
    const metadata: CommonMetadata = {};
    
    if (exifData?.['0th']) {
      const ifd0 = exifData['0th'];
      
      // Try XP fields first (Windows-compatible), then fall back to standard fields
      if (ifd0[piexifjs.ImageIFD.XPTitle]) {
        metadata.title = utf16BytesToString(ifd0[piexifjs.ImageIFD.XPTitle]);
      } else if (ifd0[piexifjs.ImageIFD.DocumentName]) {
        metadata.title = ifd0[piexifjs.ImageIFD.DocumentName];
      }
      
      if (ifd0[piexifjs.ImageIFD.XPSubject]) {
        metadata.description = utf16BytesToString(ifd0[piexifjs.ImageIFD.XPSubject]);
      } else if (ifd0[piexifjs.ImageIFD.ImageDescription]) {
        metadata.description = ifd0[piexifjs.ImageIFD.ImageDescription];
      }
      
      if (ifd0[piexifjs.ImageIFD.XPAuthor]) {
        metadata.artist = utf16BytesToString(ifd0[piexifjs.ImageIFD.XPAuthor]);
      } else if (ifd0[piexifjs.ImageIFD.Artist]) {
        metadata.artist = ifd0[piexifjs.ImageIFD.Artist];
      }
      
      if (ifd0[piexifjs.ImageIFD.Copyright]) {
        metadata.copyright = ifd0[piexifjs.ImageIFD.Copyright];
      }
      
      if (ifd0[piexifjs.ImageIFD.XPKeywords]) {
        metadata.keywords = utf16BytesToString(ifd0[piexifjs.ImageIFD.XPKeywords]);
      } else if (ifd0[piexifjs.ImageIFD.Software] && ifd0[piexifjs.ImageIFD.Software].startsWith('Keywords: ')) {
        metadata.keywords = ifd0[piexifjs.ImageIFD.Software].replace('Keywords: ', '');
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
          // Validate coordinates
          if (Math.abs(coordinates.latitude) > 90) {
            throw new Error(`Invalid latitude: ${coordinates.latitude}. Must be between -90 and 90.`);
          }
          if (Math.abs(coordinates.longitude) > 180) {
            throw new Error(`Invalid longitude: ${coordinates.longitude}. Must be between -180 and 180.`);
          }
          
          if (!exifData.GPS) {
            exifData.GPS = {};
          }

          console.log(`Setting GPS coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
          
          // Convert decimal to DMS format
          const latDMS = decimalToDMS(coordinates.latitude);
          const lonDMS = decimalToDMS(coordinates.longitude);
          
          const latRef = coordinates.latitude >= 0 ? 'N' : 'S';
          const lonRef = coordinates.longitude >= 0 ? 'E' : 'W';

          console.log(`GPS DMS values - Lat: ${JSON.stringify(latDMS)} ${latRef}, Lon: ${JSON.stringify(lonDMS)} ${lonRef}`);

          // Set GPS data
          exifData.GPS[piexifjs.GPSIFD.GPSLatitude] = latDMS;
          exifData.GPS[piexifjs.GPSIFD.GPSLongitude] = lonDMS;
          exifData.GPS[piexifjs.GPSIFD.GPSLatitudeRef] = latRef;
          exifData.GPS[piexifjs.GPSIFD.GPSLongitudeRef] = lonRef;
        }
        
        // Set common metadata using Windows-compatible XP fields
        if (metadata) {
          if (metadata.description && metadata.description.trim()) {
            // Use XPSubject for Windows "Subject" field
            exifData['0th'][piexifjs.ImageIFD.XPSubject] = stringToUTF16Bytes(metadata.description.trim());
          }
          
          if (metadata.artist && metadata.artist.trim()) {
            // Use XPAuthor for Windows "Authors" field
            exifData['0th'][piexifjs.ImageIFD.XPAuthor] = stringToUTF16Bytes(metadata.artist.trim());
            // Also set Artist as fallback
            exifData['0th'][piexifjs.ImageIFD.Artist] = metadata.artist.trim();
          }
          
          if (metadata.copyright && metadata.copyright.trim()) {
            exifData['0th'][piexifjs.ImageIFD.Copyright] = metadata.copyright.trim();
          }
          
          if (metadata.keywords && metadata.keywords.trim()) {
            // Use XPKeywords for Windows "Tags" field
            exifData['0th'][piexifjs.ImageIFD.XPKeywords] = stringToUTF16Bytes(metadata.keywords.trim());
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