const express = require("express");
const cors = require("cors");
const SSE = require("sse-pubsub");
const NodeCache = require("node-cache");
const Scoot = require("./src/Scoot");
const Display = require("./src/Display");
const { setConfigCoordinates } = require("./src/utils");
const config = require("./config");

async function main() {
  try {
    const app = express();
    app.use(cors());
    app.set("view engine", "pug");

    const configWithCoords = await setConfigCoordinates(config);

    const cache = new NodeCache();

    const eventSender = new SSE();

    const scoot = new Scoot(cache, configWithCoords, eventSender);

    new Display(scoot, configWithCoords);

    //Temporary for testing chrome extension
    let count = 0;
    setInterval(() => {
      console.log("test count", count);
      eventSender.publish(JSON.stringify({ count: count % 10 }), "myEvent");
      count++;
    }, 15000);

    app.get("/", async (req, res) => {
      let scooter = await scoot.getClosestScooter();
      res.render("index", {
        mapSize: req.query.extension ? 300 : 600,
        title: "Closest scooter",
        apiKey: configWithCoords.MAPS_API_KEY,
        homeAddress: configWithCoords.HOME_ADDRESS,
        scooter,
      });
    });

    app.get("/subscribe", (req, res) => {
      eventSender.subscribe(req, res);
    });

    app.listen(config.PORT, () =>
      console.log(`App started at http://localhost:${config.PORT}`)
    );
  } catch (e) {
    console.log(e);
  }
}
main();
