const axios = require('axios');

/**
 * Fetches user location details including address, distance, and duration to restaurant
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @param {Object} restaurantLocation - Restaurant's location {latitude, longitude}
 * @returns {Object} - {address, distance, duration}
 */
async function getUserLocationDetails(userLocation, restaurantLocation) {
  const result = {
    address: null,
    distance: null,
    duration: null
  };

  // Fetch address from coordinates using Geocoding API
  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.latitude},${userLocation.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const geocodeResponse = await axios.get(geocodeUrl);
    
    if (geocodeResponse.data.status === 'OK' && geocodeResponse.data.results[0]) {
      result.address = geocodeResponse.data.results[0].formatted_address;
    }
  } catch (error) {
    console.error('Geocoding API error:', error.response?.data || error.message);
  }

  // Fetch distance and duration using Distance Matrix API
  if (restaurantLocation?.latitude && restaurantLocation?.longitude) {
    try {
      const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLocation.latitude},${userLocation.longitude}&destinations=${restaurantLocation.latitude},${restaurantLocation.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const distanceResponse = await axios.get(distanceUrl);
      
      if (distanceResponse.data.status === 'OK' && distanceResponse.data.rows[0]?.elements[0]?.status === 'OK') {
        const element = distanceResponse.data.rows[0].elements[0];
        const distanceInMeters = element.distance.value;
        const durationInSeconds = element.duration.value;
        
        // Format distance in km
        const distanceInKm = distanceInMeters / 1000;
        result.distance = distanceInKm % 1 === 0 ? `${distanceInKm} Km` : `${distanceInKm.toFixed(1)} Km`;
        
        // Format duration
        let totalMinutes = Math.round(durationInSeconds / 60);
        if (totalMinutes < 1) totalMinutes = 1;
        
        if (totalMinutes < 60) {
          result.duration = `${totalMinutes} Minutes`;
        } else if (totalMinutes < 1440) {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          result.duration = minutes > 0 ? `${hours} Hours and ${minutes} Minutes` : `${hours} Hours`;
        } else {
          const days = Math.floor(totalMinutes / 1440);
          const remainingMinutes = totalMinutes % 1440;
          const hours = Math.floor(remainingMinutes / 60);
          const minutes = remainingMinutes % 60;
          
          let parts = [`${days} Day${days > 1 ? 's' : ''}`];
          if (hours > 0) parts.push(`${hours} Hours`);
          if (minutes > 0) parts.push(`${minutes} Minutes`);
          result.duration = parts.join(' and ');
        }
      }
    } catch (error) {
      console.error('Distance Matrix API error:', error.response?.data || error.message);
    }
  }

  return result;
}

module.exports = { getUserLocationDetails };
