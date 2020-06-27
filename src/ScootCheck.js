const request = require("superagent");
const { hashFunction, getCoordinates } = require("./utils");
const {
  EMMY_API_URL,
  OSR_BASE_URL,
  MIN_FUEL_LEVEL,
  AREA_LATITUDE1,
  AREA_LONGITUDE1,
  AREA_LATITUDE2,
  AREA_LONGITUDE2,
  OSR_API_KEY,
  CACHE_DATA_TIMEOUT,
} = require("../config");

module.exports = class ScootCheck {
  constructor(cache, homeCoordinates) {
      this.cache = cache;
      this.homeCoordinates = homeCoordinates;
  }

  async getScooterDistance(scooterAddress) {
    const { lat, lng } = await getCoordinates(scooterAddress);

    const formatedHomeCoordinates = `${this.homeCoordinates.lng},${this.homeCoordinates.lng}`;

    const formatedTargetCoordinates = `${lng},${lat}`;

    const { body: result } = await request.get(OSR_BASE_URL).query({
      api_key: OSR_API_KEY,
      start: formatedHomeCoordinates,
      end: formatedTargetCoordinates,
    });

    const { distance, duration } = result.features[0]?.properties.summary;

    if (!distance || !duration) {
      //TODO same as above - needs to be handled
    }

    return { distance, duration };
  }

  async getClosestScooter() {
    try {
      const { body: data } = await request
        .get(`${EMMY_API_URL}map/cars`)
        .query({
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
        const formattedAddress = `${address},${zipCode}`;
        const hash = hashFunction(formattedAddress);
        scooter.distanceData = this.cache.get(hash);

        //check if we already have the coordinates/data necesary, if not get it
        if (scooter.distanceData == undefined) {
          let distanceData = await this.getScooterDistance(formattedAddress);
          this.cache.set(hash, distanceData, CACHE_DATA_TIMEOUT);
          scooter.distanceData = distanceData;
        } else {
          // lets refresh the timeout on the data
          this.cache.ttl(hash, CACHE_DATA_TIMEOUT);
        }
      }
      return hasEnoughFuel[0] || "Nothing here lol";
    } catch (e) {
      console.error(e);
    }
  }
};
