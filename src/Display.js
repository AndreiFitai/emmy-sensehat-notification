// temporary solution since i'm not developing on the RpI
let sense;
try {
  sense = require("sense-hat-led");
  console.log("----- SenseHat was detected ! ------");
} catch (e) {
  console.log("----- Can't detect a SenseHat attached to system ! ------");
}

module.exports = class Display {
  constructor(scoot, config) {
    this.scoot = scoot;
    this.config = config;
    this.init();
  }

  async displayOnPi() {
    sense.lowLight = true; // not sure if this does anything
    sense.setRotation(180) // make sure orientation on the rPI is right
    let isDisplayClear = true;

    setInterval(() => {
      let message = " No scooter nearby :( ";
      if(this.scoot.closestScoot.distanceData){
        const { distanceData: { distance, duration} } =  this.scoot.closestScoot;
        message = ` ${duration} mins - ${distance} m `
      }

      if(isDisplayClear) {
        isDisplayClear = false;
        sense.showMessage(
          message,
          0.05,
          this.config.PI_TEXT_COLOR,
          this.config.PI_BG_COLOR,
          () => { isDisplayClear = true}
        );
      }
    }, 2000);
  }
  
  init() {
    if (sense) {
      this.displayOnPi();
    }
  }
};