const express = require('express')
const cors = require('cors')
const SSE = require('sse-pubsub');
const NodeCache = require("node-cache");
const Scoot = require("./src/Scoot");
const Display = require("./src/Display");
const { setConfigCoordinates } = require("./src/utils");
const config = require("./config");

async function main(){
  const app = express();
  app.use(cors());

  const configWithCoords = await setConfigCoordinates(config);
  
  const cache = new NodeCache();
  
  const scoot = new Scoot(cache, configWithCoords);
  
  const display = new Display(scoot, configWithCoords);
  
  const feed = new SSE();
  
  //Temporary for testing chrome extension
  let count = 0
  setInterval(() => {
    console.log('test count', count)
    feed.publish(JSON.stringify({ count: count % 10 }), 'myEvent')
    count++
  }, 15000);
  
  app.get('/', async (req, res) =>{
    let { distanceData } = await scoot.getClosestScooter();
    res.send(`Closest scooter is ${distanceData.duration} minutes away and ${distanceData.distance} meters away`)
  })
  
  app.get('/subscribe', (req, res)=>{
    feed.subscribe(req, res)
  })
  
  app.listen(config.PORT, () => console.log(`App started at http://localhost:${config.PORT}`))
}
main();
