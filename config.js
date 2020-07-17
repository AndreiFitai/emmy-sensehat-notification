require("dotenv").config();

module.exports = {
  PORT: 3000,

  // set api base URLS and the maps API key
  EMMY_API_URL: "https://emio-frontend.com/api/prod/v2.07/",
  GEOCODING_API_URL: "https://maps.googleapis.com/maps/api/geocode/json",
  DISTANCES_API_URL: "https://maps.googleapis.com/maps/api/distancematrix/json",
  MAPS_API_KEY: process.env.MAPS_API_KEY,

  MIN_FUEL_LEVEL: 15,

  // Where i live - Street name and number and postal code
  TOWN: "Berlin",
  HOME_ADDRESS: "" || process.env.HOME_ADDRESS,

  /* Where to look for scooters
  From what i can tell, the first and second set of coordinates 
  refer to the upper left and down right corner of a square
  imposed over the map ( normal orientation - north )
  */
  AREA_ADDRESS1: "Prenzlauer Promenade 179-180",
  AREA_ADDRESS2: "Pieskower Weg 16-46, 10409",

  //* Optional can use coordinates instead of addresses to define search area
  //* If both coordinates and addresses are present, coordinates will be prioritized
  AREA_ADDRESS1_LAT: "52.554534",
  AREA_ADDRESS1_LNG: "13.429695",
  AREA_ADDRESS2_LAT: "52.540896",
  AREA_ADDRESS2_LNG: "13.444144",

  // how many seconds to keep scooter data in cache
  CACHE_DATA_TIMEOUT: 1200,

  //What color the text and bg should have on the senseHAT on the raspberryPi
  PI_TEXT_COLOR: [227, 33, 25],
  PI_BG_COLOR: [0, 0, 0],
};
