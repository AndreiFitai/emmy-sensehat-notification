## TODO

- set up proper error handling and logging
- simple page to be accessed locally and display details and route to closest scooter

## Requirements

- NodeJS 14.4
- OpenSourceRouting.org API Key ( free )
- MapQuest.com API Key ( free )

## Details

I want to know in a glance if i should take public transport or if i can easily rent an Emmy scooter ( https://emmy-sharing.de/en/ ) near my apartment.
This will run on my Raspberry Pi and using the attached SenseHats LED Matrix, it will display the walking distance in meters and minutes to the closest scooter.
I want to add a simple webpage that i can access locally for more functionality.

For geocodding and routing i'm using Google Maps API.

I initially wanted to use the opensource geocodding api offered by MapQuest and the routing api offered by openrouteservice.org however there are issues with both services.

- MapQuests api doesn't geocode German specific addresses properly ( e.g. "B96a 70e, 10437, Berlin" returns coordinates located in Kansas and don't worry it's a coincidence there's a small town called Oberlin there )
- openrouteservice.org doesn't have enough walking route accuracy for my personal preference and in some cases where the scooter was 50 meters away from my home it suggested a way longer route.


./node_modules/.bin/web-push generate-vapid-keys