const axios = require('axios');

async function getCurrencyFromCountry(country) {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${country}`);
    const currencies = response.data[0].currencies;
    const currencyCode = Object.keys(currencies)[0];
    return currencyCode;
  } catch (error) {
    console.error('Error fetching currency:', error.message);
    return null;
  }
}

module.exports = { getCurrencyFromCountry };
