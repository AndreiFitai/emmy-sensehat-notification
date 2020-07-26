const request = require("superagent");
const deepEqual = require("deep-equal");
const { hashFunction, getDistanceData } = require("./utils");

module.exports = class Scoot {
  constructor(cache, config, eventSender) {
    this.cache = cache;
    this.config = config;
    this.closestScoot = {};
    if (eventSender) this.eventSender = eventSender;
    this.init();
  }

  async getClosestScooter() {
    try {
      const { body: data } = await request
        .get(`${this.config.EMMY_API_URL}`)
        .query({
          lat1: this.config.AREA_ADDRESS1_LAT,
          lon1: this.config.AREA_ADDRESS1_LNG,
          lat2: this.config.AREA_ADDRESS2_LAT,
          lon2: this.config.AREA_ADDRESS2_LNG,
        });
      //let's not look at scooters without enough "juice"
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
          let distanceData = await getDistanceData(formattedAddress);
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

      closestScooter.distanceData.duration = Math.round(
        closestScooter.distanceData.duration / 60
      );

      if (this.eventSender && !deepEqual(this.closestScoot, closestScooter)) {
        this.eventSender.publish(JSON.stringify(closestScooter));
      }

      this.closestScoot = closestScooter;

      return closestScooter;
    } catch (e) {
      console.error(e);
    }
  }

  refreshClosestScooter() {
    // gets the closest scooter every 15 minutes
    this.getClosestScooter();
    setTimeout(() => {
      this.refreshClosestScooter();
    }, 900000);
  }

  init() {
    this.refreshClosestScooter();
  }
};
