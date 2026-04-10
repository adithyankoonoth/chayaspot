// OSM Nominatim — completely free, no API key, no card needed

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocode a place name to coordinates using OSM Nominatim
 * e.g. "payyanur" → { lat: 12.1, lng: 75.2 }
 */
export async function geocodePlace(query) {
  try {
    const params = new URLSearchParams({
      q: query + ', Kerala, India',
      format: 'json',
      limit: 1,
      addressdetails: 1,
    });

    const res = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ChayaSpot/1.0' },
    });

    const data = await res.json();
    if (!data || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (err) {
    console.error('Nominatim error:', err);
    return null;
  }
}

/**
 * Reverse geocode coordinates to a place name
 */
export async function reverseGeocode(lat, lng) {
  try {
    const params = new URLSearchParams({ lat, lon: lng, format: 'json' });
    const res = await fetch(`${NOMINATIM_URL}/reverse?${params}`, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'ChayaSpot/1.0' },
    });
    const data = await res.json();
    return data?.display_name || null;
  } catch (err) {
    return null;
  }
}

/**
 * Haversine distance in km between two coordinates
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Filter and sort spots by proximity to a searched location
 * radiusKm = how far to search (default 30km)
 */
export function filterSpotsByProximity(spots, centerLat, centerLng, radiusKm = 30) {
  return spots
    .map(spot => {
      if (!spot.latitude || !spot.longitude) return { ...spot, _distance: null };
      const dist = getDistance(centerLat, centerLng, spot.latitude, spot.longitude);
      return { ...spot, _distance: dist };
    })
    .filter(spot => spot._distance === null || spot._distance <= radiusKm)
    .sort((a, b) => {
      if (a._distance === null) return 1;
      if (b._distance === null) return -1;
      return a._distance - b._distance;
    });
}
