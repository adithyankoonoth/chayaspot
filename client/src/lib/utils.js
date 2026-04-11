// Check if a spot is currently open
export function isOpenNow(opensAt, closesAt) {
  if (!opensAt || !closesAt) return null;
  const now = new Date();
  const [oh, om] = opensAt.split(':').map(Number);
  const [ch, cm] = closesAt.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  if (closeMins < openMins) {
    return nowMins >= openMins || nowMins < closeMins;
  }
  return nowMins >= openMins && nowMins < closeMins;
}

// Format time from 24h to 12h
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Open Google Maps directions
export function openDirections(lat, lng, name) {
  const destination = `${lat},${lng}`;
  const label = encodeURIComponent(name || 'Chai Spot');

  // On iOS — opens Apple Maps or Google Maps app
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  // On Android — opens Google Maps app directly
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isAndroid) {
    // This opens Google Maps app on Android with navigation started
    window.location.href = `google.navigation:q=${destination}&label=${label}`;

    // Fallback after 500ms if app didn't open
    setTimeout(() => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`,
        '_blank'
      );
    }, 500);
  } else if (isIOS) {
    // Opens Google Maps app on iOS if installed, else Apple Maps
    window.open(
      `comgooglemaps://?daddr=${destination}&directionsmode=driving`,
      '_blank'
    );
    // Fallback to browser Google Maps
    setTimeout(() => {
      window.open(
        `https://maps.google.com/?daddr=${destination}`,
        '_blank'
      );
    }, 500);
  } else {
    // Desktop — open in browser
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_name=${label}&travelmode=driving`,
      '_blank'
    );
  }
}

// Parse lat/lng from a Google Maps URL
export function parseGoogleMapsUrl(url) {
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /\?q=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
}

// Format distance
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// Haversine distance
export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
