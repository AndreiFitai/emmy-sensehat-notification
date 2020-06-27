const request = require("superagent");

const { MAPQUEST_API_KEY, MAPQUEST_BASE_URL, TOWN } = require('../config');

const hashFunction = (key) => {
  var hash = 0;
  for (var i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i) * i;
  }
  return hash;
};

async function getCoordinates(addressWithZipCode) {
  const { body: geocoding } = await request.get(MAPQUEST_BASE_URL).query({
    key: MAPQUEST_API_KEY,
    location: `${addressWithZipCode},${TOWN}`,
  });

  const { lat, lng } = geocoding.results[0]?.locations[0]?.latLng;

  if (!lat || !lng) {
    //TODO figure out what to do in case we can't find coordinates
  }
  return { lat, lng };
}

module.exports = { hashFunction, getCoordinates };
