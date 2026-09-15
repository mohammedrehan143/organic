export interface LocationAddressResult {
  formattedAddress: string;
  road?: string;
  houseNumber?: string;
  building?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  name: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  lat: number;
  lng: number;
  formatted: string;
}

/**
 * High precision GPS reverse geocoding (zoom=18 building/house precision)
 */
export async function getCurrentLocationAddress(): Promise<LocationAddressResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

  const { latitude, longitude } = coords;

  try {
    // Primary: OpenStreetMap Nominatim with zoom=18 for exact building/house precision
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&namedetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'ZafirooCafeApp/1.0',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const houseNumber = addr.house_number || '';
      const building = addr.building || addr.amenity || addr.shop || '';
      const road = addr.road || addr.pedestrian || addr.footway || addr.suburb || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || '';
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      const postcode = addr.postcode || '';

      const parts = [
        building,
        houseNumber ? `No. ${houseNumber}` : '',
        road,
        suburb,
        city,
        state,
        postcode,
      ].filter(Boolean);

      const formatted = parts.length > 0 ? parts.join(', ') : data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      return {
        formattedAddress: formatted,
        road,
        houseNumber,
        building,
        suburb,
        city,
        state,
        postcode,
        lat: latitude,
        lng: longitude,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode error, attempting fallback:', err);
  }

  // Secondary fallback: BigDataCloud free client geocoding
  try {
    const fallbackRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const locality = data.locality || '';
      const city = data.city || '';
      const principalSubdivision = data.principalSubdivision || '';
      const postcode = data.postcode || '';

      const parts = [locality, city, principalSubdivision, postcode].filter(Boolean);
      return {
        formattedAddress: parts.join(', ') || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        city,
        state: principalSubdivision,
        postcode,
        lat: latitude,
        lng: longitude,
      };
    }
  } catch (err) {
    console.warn('Secondary reverse geocode error:', err);
  }

  // Final fallback to raw coordinates
  return {
    formattedAddress: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
    lat: latitude,
    lng: longitude,
  };
}

/**
 * Concatenates Line 1 (auto-detected/selected road & locality) and Line 2 (unit/flat/landmark)
 * into a single uninterrupted string, avoiding duplicate tokens.
 */
export function formatFullOneLineAddress(line1: string, line2?: string): string {
  const l1 = (line1 || '').trim();
  const l2 = (line2 || '').trim();

  if (!l2) return l1;
  if (!l1) return l2;

  // Check if line2 is already contained inside line1 or vice versa
  if (l1.toLowerCase().includes(l2.toLowerCase())) {
    return l1;
  }
  if (l2.toLowerCase().includes(l1.toLowerCase())) {
    return l2;
  }

  return `${l2}, ${l1}`;
}

/**
 * Builds a 1-click Google Maps navigation URL using coordinates or 1-line query
 */
export function buildGoogleMapsUrl(address: string, lat?: number, lng?: number): string {
  if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const cleanAddress = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${cleanAddress}`;
}

/**
 * Queries Photon OpenStreetMap POI API for instant address suggestions
 */
export async function searchAddressQuery(query: string): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) return [];

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query.trim())}&limit=5`
    );
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) return [];

    return data.features.map((feature: any) => {
      const p = feature.properties || {};
      const [lng, lat] = feature.geometry?.coordinates || [0, 0];

      const parts = [
        p.name,
        p.street ? `${p.housenumber ? p.housenumber + ' ' : ''}${p.street}` : '',
        p.district,
        p.city,
        p.state,
        p.postcode,
      ].filter(Boolean);

      return {
        name: p.name || 'Location',
        street: p.street,
        city: p.city,
        state: p.state,
        country: p.country,
        postcode: p.postcode,
        lat,
        lng,
        formatted: parts.join(', '),
      };
    });
  } catch (err) {
    console.warn('Photon POI search error:', err);
    return [];
  }
}
