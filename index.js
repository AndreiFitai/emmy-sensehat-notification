const http = require("http");
const NodeCache = require("node-cache");
const Scoot = require("./src/Scoot");
const { setConfigCoordinates } = require("./src/utils");

const config = require("./config");

const main = async () => {
  const cache = new NodeCache();

  const configWithCoords = await setConfigCoordinates(config);

  const scoot = new Scoot(cache, configWithCoords);

  http.createServer(async (req, res) => {
      if (req.url != "/favicon.ico") {
        let { distanceData } = scoot.closestScoot;

        res.write(
          `Closest scooter is ${distanceData.duration} minutes away and ${distanceData.distance} meters away`
        );
        res.end();
      }
    })
    .listen(config.PORT, () => {
      console.log(`Server started at - http://localhost:${config.PORT}`);
    });
};

main();