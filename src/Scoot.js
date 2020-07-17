const request = require("superagent");
const { hashFunction, getDistanceData} = require("./utils");

// temporary solution since i'm not developing on the RpI
let sense;
try {
  sense = require("sense-hat-led");
  console.log("----- SenseHat was detected ! ------");
} catch (e) {
  console.log("----- Can't detect a SenseHat attached to system ! ------");
}

module.exports = class Scoot {
  constructor(cache, config) {
    this.cache = cache;
    this.config = config;
    this.closestScoot = {};
    this.init();
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
      // no point in saving walking duration in seconds so i'm converting it to minutes and rounding up
      closestScooter.distanceData.duration = Math.round(closestScooter.distanceData.duration / 60)

      return closestScooter;
    } catch (e) {
      console.error(e);
    }
  }

  async refreshClosestScooter(){
    // gets the closest scooter every 15 minutes
    this.closestScoot = await this.getClosestScooter();
    setTimeout(() => {
      this.refreshClosestScooter()
    }, 900000);
  }

  async displayOnPi() {
    let message;
    sense.lowLight = true;
    // make sure orientation on the rPI is optimal
    sense.setRotation(180)
    let isDisplayClear = true;

    setInterval(() => {
      if(this.closestScoot){
        const { distanceData: { distance, duration} } =  this.closestScoot;
        message = ` ${duration} mins - ${distance} m `
      } else {
        message = "No scooter nearby :("
      }
      if(isDisplayClear) {
        sense.showMessage(
          message,
          0.05,
          this.config.PI_TEXT_COLOR,
          this.config.PI_BG_COLOR,
          () => { isDisplayClear = true}
        );
      }
      isDisplayClear = false;
    }, 2000);
  }
  

  async init() {
    this.refreshClosestScooter();
    if (sense) {
      this.displayOnPi();
    }
  }
};
