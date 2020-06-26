const request = require("superagent");
const NodeCache = require("node-cache");

const {
  EMMY_API_URL,
  MAPQUEST_BASE_URL,
  OSR_BASE_URL,
  MIN_FUEL_LEVEL,
  HOME_LONGITUDE,
  HOME_LATITUDE,
  AREA_LATITUDE1,
  AREA_LONGITUDE1,
  AREA_LATITUDE2,
  AREA_LONGITUDE2,
  OSR_API_KEY,
  MAPQUEST_API_KEY,
  CACHE_DATA_TIMEOUT,
} = require("./config");

const cache = new NodeCache();

// super simple hashing functions, we don't need anything more than this for our usecase
const hashFunction = (key) => {
  var hash = 0;
  for (var i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i) * i;
  }
  return hash;
};

const getDistanceData = async (address, zipCode) => {
  const { body: geocoding} = await request.get(MAPQUEST_BASE_URL).query({
    key: MAPQUEST_API_KEY,
    location: `${address},${zipCode},Berlin`,
  });

  const { lat, lng } = geocoding.results[0]?.locations[0]?.latLng;

  if (!lat || !lng) {
    //TODO figure out what to do in case we can't find coordinates
  }

  const formatedHomeCoordinates = `${HOME_LONGITUDE},${HOME_LATITUDE}`;
  const formatedTargetCoordinates = `${lng},${lat}`;


  const {body: result} = await request.get(OSR_BASE_URL).query({
    api_key: OSR_API_KEY,
    start: formatedHomeCoordinates,
    end: formatedTargetCoordinates,
  });

  const { distance, duration } = result.features[0]?.properties.summary;

  if (!distance || !duration) {
    //TODO same as above - needs to be handled
  }

  return { distance, duration };
};

const main = async () => {
  try{
    const { body: data } = await request.get(`${EMMY_API_URL}map/cars`).query({
      lat1: AREA_LATITUDE1,
      lon1: AREA_LONGITUDE1,
      lat2: AREA_LATITUDE2,
      lon2: AREA_LONGITUDE2,
    });
  
    //let's not look at scooters without enough juice
    let hasEnoughFuel = data.filter((scooter) => {
      return scooter.fuelLevel > MIN_FUEL_LEVEL;
    });

    for (const scooter of hasEnoughFuel) {
      let { address, zipCode } = scooter;
      const hash = hashFunction(address + zipCode);
      scooter.distanceData = cache.get(hash);

      //check if we already have the coordinates/data necesary, if not get it
      if (scooter.distanceData == undefined) {
        let distanceData = await getDistanceData(address, zipCode);
        cache.set(hash, distanceData, CACHE_DATA_TIMEOUT);
        scooter.distanceData = distanceData;
      } else {
        // lets refresh the timeout on the data
        cache.ttl(hash, CACHE_DATA_TIMEOUT);
      }
    }
  }catch(e){
    console.error(e);
  }

};

main();
