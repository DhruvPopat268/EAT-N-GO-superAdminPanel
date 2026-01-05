// Haversine distance calculation
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate distance from point to line segment
function distanceToLineSegment(pointLat, pointLng, lat1, lng1, lat2, lng2) {
  const A = pointLat - lat1;
  const B = pointLng - lng1;
  const C = lat2 - lat1;
  const D = lng2 - lng1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return calculateDistance(pointLat, pointLng, lat1, lng1);
  
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

  return calculateDistance(pointLat, pointLng, xx, yy);
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
    
    // Calculate distance from restaurant to route line
    const distanceToRoute = distanceToLineSegment(restLat, restLng, currentLat, currentLng, destLat, destLng);
    
    // Return true if within buffer radius
    return distanceToRoute <= bufferRadius;
  });
}

module.exports = {
  getRestaurantsAlongRoute,
  calculateDistance
};