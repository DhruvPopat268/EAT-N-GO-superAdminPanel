const axios = require('axios');

// Haversine distance calculation (fallback)
function calculateDistanceHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Distance Matrix API calculation
async function calculateDistance(lat1, lng1, lat2, lng2) {
  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lng1}&destinations=${lat2},${lng2}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
      return response.data.rows[0].elements[0].distance.value; // Returns distance in meters
    }
    return calculateDistanceHaversine(lat1, lng1, lat2, lng2);
  } catch (error) {
    console.error('Distance Matrix API error:', error.message);
    return calculateDistanceHaversine(lat1, lng1, lat2, lng2);
  }
}

// Calculate distance from point to line segment (uses Haversine for geometry)
function distanceToLineSegment(pointLat, pointLng, lat1, lng1, lat2, lng2) {
  const A = pointLat - lat1;
  const B = pointLng - lng1;
  const C = lat2 - lat1;
  const D = lng2 - lng1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return calculateDistanceHaversine(pointLat, pointLng, lat1, lng1);
  
  let param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    xx = lat1;
    yy = lng1;
  } else if (param > 1) {
    xx = lat2;
    yy = lng2;
  } else {
    xx = lat1 + param * C;
    yy = lng1 + param * D;
  }

  return calculateDistanceHaversine(pointLat, pointLng, xx, yy);
}

// Check if restaurant is ahead on route (not backwards)
function isAheadOnRoute(restaurantLat, restaurantLng, currentLat, currentLng, destLat, destLng) {
  // Vector from current to destination
  const routeVectorLat = destLat - currentLat;
  const routeVectorLng = destLng - currentLng;
  
  // Vector from current to restaurant
  const restaurantVectorLat = restaurantLat - currentLat;
  const restaurantVectorLng = restaurantLng - currentLng;
  
  // Dot product to check if restaurant is in forward direction
  const dotProduct = routeVectorLat * restaurantVectorLat + routeVectorLng * restaurantVectorLng;
  
  return dotProduct >= 0; // Positive means forward direction
}

// Determine which side of route the restaurant is on using cross product
function getRouteSide(restaurantLat, restaurantLng, currentLat, currentLng, destLat, destLng) {
  // Vector from current to destination (route direction)
  const routeX = destLat - currentLat;
  const routeY = destLng - currentLng;
  
  // Vector from current to restaurant
  const restX = restaurantLat - currentLat;
  const restY = restaurantLng - currentLng;
  
  // Cross product: (routeX * restY) - (routeY * restX)
  const cross = (routeX * restY) - (routeY * restX);
  
  if (cross > 0) return 'left';
  if (cross < 0) return 'right';
  return 'center'; // Exactly on route
}

// Main function to filter restaurants along route
function getRestaurantsAlongRoute(restaurants, currentLocation, destinationLocation, bufferRadius = 500) {
  const { lat: currentLat, lng: currentLng } = currentLocation;
  const { lat: destLat, lng: destLng } = destinationLocation;
  
  return restaurants.filter(restaurant => {
    const restLat = parseFloat(restaurant.contactDetails.latitude);
    const restLng = parseFloat(restaurant.contactDetails.longitude);
    
    // Skip if coordinates are invalid
    if (!restLat || !restLng) return false;
    
    // Check if restaurant is ahead on route (not backwards)
    if (!isAheadOnRoute(restLat, restLng, currentLat, currentLng, destLat, destLng)) {
      return false;
    }
    
    // Calculate distance from restaurant to route line (uses Haversine for filtering)
    const distanceToRoute = distanceToLineSegment(restLat, restLng, currentLat, currentLng, destLat, destLng);
    
    // Return true if within buffer radius
    return distanceToRoute <= bufferRadius;
  });
}

module.exports = {
  getRestaurantsAlongRoute,
  calculateDistance,
  calculateDistanceHaversine,
  distanceToLineSegment,
  isAheadOnRoute,
  getRouteSide
};