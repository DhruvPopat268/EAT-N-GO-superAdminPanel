/**
 * Get current time in IST (Indian Standard Time)
 * @returns {number} Current time in minutes from midnight (IST)
 */
const getCurrentISTTime = () => {
  const now = new Date();
  const istParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(now);
  
  const parsedHour = parseInt(istParts.find(part => part.type === 'hour').value);
  const parsedMinute = parseInt(istParts.find(part => part.type === 'minute').value);
  
  return parsedHour * 60 + parsedMinute;
};

/**
 * Check if restaurant is currently open based on IST time
 * @param {string} openTime - Opening time in "HH:MM" format
 * @param {string} closeTime - Closing time in "HH:MM" format
 * @param {boolean} isManuallyClosed - Whether restaurant is manually closed
 * @returns {boolean} True if restaurant is open, false otherwise
 */
const isRestaurantOpen = (openTime, closeTime, isManuallyClosed = false) => {
  if (!openTime || !closeTime || isManuallyClosed) {
    return false;
  }

  const currentTime = getCurrentISTTime();
  
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  const openTimeMinutes = openHour * 60 + openMin;
  const closeTimeMinutes = closeHour * 60 + closeMin;
  
  if (closeTimeMinutes > openTimeMinutes) {
    // Same day (e.g., 9:00 to 22:00)
    return currentTime >= openTimeMinutes && currentTime <= closeTimeMinutes;
  } else {
    // Crosses midnight (e.g., 22:00 to 2:00)
    return currentTime >= openTimeMinutes || currentTime <= closeTimeMinutes;
  }
};

module.exports = {
  getCurrentISTTime,
  isRestaurantOpen
};