const request = require("superagent");

const { GEOCODING_API_URL, MAPS_API_KEY, TOWN } = require("../config");

const hashFunction = (key) => {
  var hash = 0;
  for (var i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i) * i;
  }
  return hash;
};

async function getCoordinates(address) {
  const { body: data } = await request.get(GEOCODING_API_URL).query({
    address: `${address},${TOWN}`,
    key: MAPS_API_KEY,
  });

  const { lat, lng } = data.results[0]?.geometry.location;

  if (!lat || !lng) {
    //TODO figure out what to do in case we can't find coordinates
  }
  return { lat, lng };
}

async function setConfigCoordinates(config) {
  const addresses = ["AREA_ADDRESS1", "AREA_ADDRESS2"];

  for (const address of addresses) {
    if (config[address]) {
      let { lat, lng } = await getCoordinates(config[address]);
      config[`${address}_LAT`] = lat;
      config[`${address}_LNG`] = lng;
    }
  }

  return config;
}

module.exports = { hashFunction, setConfigCoordinates };
