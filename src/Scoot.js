const request = require("superagent");
const { hashFunction } = require("./utils");

// temporary solution since i'm not developing on the RpI
let sense;
try {
  sense = require("sense-hat-led");
} catch (e) {
  console.log("Can't detect a SenseHat attached");
}

module.exports = class Scoot {
  constructor(cache, config) {
    this.cache = cache;
    this.config = config;
    this.init();
  }

  async getScooterDistance(scooterAddress) {
    const { body: result } = await request
      .get(this.config.DISTANCES_API_URL)
      .query({
        units: "metric",
        mode: "walking",
        region: "de", // This param influences results ( Region Biasing )
        origins: this.config.HOME_ADDRESS,
        destinations: scooterAddress,
        key: this.config.MAPS_API_KEY,
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

  async getClosestScooter() {
    try {
      const { body: data } = await request
        .get(`${this.config.EMMY_API_URL}map/cars`)
        .query({
          lat1: this.config.AREA_ADDRESS1_LAT,
          lon1: this.config.AREA_ADDRESS1_LNG,
          lat2: this.config.AREA_ADDRESS2_LAT,
          lon2: this.config.AREA_ADDRESS2_LNG,
        });

      //let's not look at scooters without enough juice
      let hasEnoughFuel = data.filter((scooter) => {
        return scooter.fuelLevel > this.config.MIN_FUEL_LEVEL;
      });

      for (const scooter of hasEnoughFuel) {
        let { carId, address, zipCode } = scooter;
        const formattedAddress = `${address},${zipCode}`;
        //added the scooter id to hash in case two scooters ar at the same address
        const hash = hashFunction(`${carId}${formattedAddress}`);
        scooter.distanceData = this.cache.get(hash);

        //check if we already have the coordinates/data necesary, if not get it
        if (scooter.distanceData == undefined) {
          let distanceData = await this.getScooterDistance(formattedAddress);
          this.cache.set(hash, distanceData, this.config.CACHE_DATA_TIMEOUT);
          scooter.distanceData = distanceData;
        } else {
          // lets refresh the timeout on the data
          this.cache.ttl(hash, this.config.CACHE_DATA_TIMEOUT);
        }
      }

      const closestScooter = hasEnoughFuel.reduce((min, curr) =>
        min.distanceData.duration < curr.distanceData.duration ? min : curr
      );

      return closestScooter;
    } catch (e) {
      console.error(e);
    }
  }

  displayClosestScoot(whatToDispolay) {
    sense.lowLight = true;

    // testing persistent message display
    const whatever = () =>
      sense.showMessage(
        whatToDispolay,
        0.2,
        this.config.PI_TEXT_COLOR,
        this.config.PI_BG_COLOR,
        done
      );
    function done() {
      whatever();
    }
  }

  init() {
    if (sense) {
      console.log("----- SenseHat was detected ! ------");
      this.displayClosestScoot();
    }
  }
};
