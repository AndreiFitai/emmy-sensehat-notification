## TODO

- sort scooters by time to reach.
- set up node-cron to retreive data once in a while
- set up proper error handling and logging
- simple page to be accessed locally and display details.
- implement a map with the directions ( maybe a redirect to google maps )

## Requirements
- NodeJS 14.4
- OpenSourceRouting.org API Key ( free )
- MapQuest.com API Key ( free )

## Details
I want to know in a glance if i should take public transport or if i can easily rent an Emmy scooter ( https://emmy-sharing.de/en/ ) near my apartment.
This will run on my Raspberry Pi and using the attached SenseHats LED Matrix, it will display the walking distance in meters and minutes to the closest scooter.
I want to add a simple webpage that i can access locally for more functionality.

This project is using MapQuest.com's open source API ( relies solely on data contributed by OpenStreetMap ) and OpenRouteService.org API.

Using mapquest open source api to get scooter coordinates as their api is easy to use, good free tier and with good results.

Using opensourcerouting api to figure out walking distance and time from home to the scooter.

Theoretically i could use mapquests open source routing api which accepts coordinates and addresses to calculate walking distance thus eliminating the need to do 2 seperate calls to get the distance and time, however the results are not accurate compared to opensourcerouting ( as baseline i manually compared to google maps directions )