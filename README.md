# Explore More

This is a single page for obtaining some basic travel information, and maybe to inspire your next vacation or extended weekend.

Simply enter in where you'll be traveling from, and where your destination is, click search, and you'll have an interactive map, some of the best restaurants in the area to visit, and some flight cost and weather estimates (since no one wants to go vacation where it might be raining!).

This project was refactored from my very first single page app I built, and I wanted to make practical use of some new CSS tricks I had learned, and a little ES6 syntax as well to make DOM manipulation a little more simple.

## Built With:
* Sass
* BEM methodology
* ES6
* HTML5

## APIs Used
* [HERE](https://developer.here.com/) - For the interactive map.
* [Zomato](https://developers.zomato.com/api) - For restaurant information.
* [Amadeus](https://developers.amadeus.com/) - For travel and flight information.
* [DarkSky](https://darksky.net/dev) - For weather "time machine" that predicts forecasts for a date based on historical data.

### All API requests go through a personal proxy server I use for smaller projects, for added security and to bypass any specific CORS issues I may run across.