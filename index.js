const http = require('http');
const NodeCache = require("node-cache");
const ScootCheck = require("./src/ScootCheck")
const { getCoordinates } = require('./src/utils')

const {PORT, HOME_ADDRESS} = require("./config");

const main = async () => {
  const cache = new NodeCache();

  const homeCoordinates = getCoordinates(HOME_ADDRESS);

  const scootCheck = new ScootCheck(cache, homeCoordinates);

  http.createServer(async (req, res) =>{
    let result = await scootCheck.getClosestScooter();
    console.log('----- result ------', result);
    res.write('hello woild'); //write a response
    res.end(); //end the response
  }).listen(PORT, () =>{
  console.log(`server start at - http://localhost:${PORT}`); //the server object listens on port 3000
  });
};

main();
