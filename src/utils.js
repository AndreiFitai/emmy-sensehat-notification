const request = require("superagent");

const { GEOCODING_API_URL, MAPS_API_KEY, DISTANCES_API_URL,HOME_ADDRESS, TOWN } = require("../config");

const hashFunction = (key) => {
  var hash = 0;
  for (var i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i) * i;
  }
  return hash;
};

const getCoordinates = async (address) => {
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

const setConfigCoordinates = async (config) => {
  const addresses = ["AREA_ADDRESS1", "AREA_ADDRESS2"];

  for (const address of addresses) {
    if (config[address] && (!config[`${address}_LAT`] || !config[`${address}_LNG`])) {
      console.log('calculating address coordinates')
      let { lat, lng } = await getCoordinates(config[address]);
      config[`${address}_LAT`] = lat;
      config[`${address}_LNG`] = lng;
    }
  }

  return config;
}

const getDistanceData = async (address) => {
  const { body: result } = await request
    .get(DISTANCES_API_URL)
    .query({
      units: "metric",
      mode: "walking",
      region: "de", // This param influences results ( Region Biasing )
      origins: HOME_ADDRESS,
      destinations: address,
      key: MAPS_API_KEY,
    });

  const {
    distance: { value: distance },
    duration: { value: duration },
  } = result.rows[0]?.elements[0];

  if (!distance || !duration) {
    //TODO same as above - needs to be handled
  }

  return { distance, duration };
}

module.exports = { hashFunction, setConfigCoordinates, getDistanceData };
