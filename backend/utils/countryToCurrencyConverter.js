const axios = require("axios");

async function getCurrencyFromCountry(country) {
  try {
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${country}`
    );

    // Pick correct country match
    const exact = response.data.find(c =>
      c.name.common.toLowerCase() === country.toLowerCase() ||
      c.name.official.toLowerCase() === country.toLowerCase()
    ) || response.data[0];

    const currencies = exact.currencies;
    const code = Object.keys(currencies)[0];

    return {
      code,
      name: currencies[code].name,
      symbol: currencies[code].symbol
    };

  } catch (err) {
    console.error("Currency fetch error:", err.message);
    return {
      code: "",
      name: "",
      symbol: ""
    };
  }
}

module.exports = { getCurrencyFromCountry };