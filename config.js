require("dotenv").config();

module.exports = {
  // set api base URLS
  EMMY_API_URL: "https://emio-frontend.com/api/prod/v2.07/",
  MAPQUEST_BASE_URL: "http://open.mapquestapi.com/geocoding/v1/address",
  OSR_BASE_URL: "https://api.openrouteservice.org/v2/directions/foot-walking",


  MIN_FUEL_LEVEL: 15,

  // Where i live - please don't stalk ;)
  HOME_LATITUDE: process.env.HOME_LATITUDE,
  HOME_LONGITUDE: process.env.HOME_LONGITUDE,

  // Where to look for scooters 
  AREA_LATITUDE1: "52.551474",
  AREA_LONGITUDE1: "13.429815",
  AREA_LATITUDE2: "52.545277",
  AREA_LONGITUDE2: "13.444649",

  // API Key for openrouteservice.org - gets direction details
  OSR_API_KEY: process.env.OSR_API_KEY,

  //API key for MapQuest geocoding service - extracts coordinates
  MAPQUEST_API_KEY: process.env.MAPQUEST_API_KEY,

  // how many seconds to keep scooter data in cache
  CACHE_DATA_TIMEOUT: 1200,
};