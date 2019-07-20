moment().format();
let map;
let currentGeocode = {
  lng: undefined,
  lat: undefined
}

let initializeMap = (city) => {

  // maps object instantiated with credentials
  let platform = new H.service.Platform({
    'app_id': 'QTX9Ulhk71aSUq6SF51d',
    'app_code': 'JEHV174h_P1Oj2Q_cBEuGA',
    useHTTPS: true
  });

  // setting ppi we want our map to display at
  let pixelRatio = window.devicePixelRatio || 1;
  let defaultLayers = platform.createDefaultLayers({
    tileSize: pixelRatio === 1 ? 256 : 512,
    ppi: pixelRatio === 1 ? undefined : 320
  });

  // actually initializing the map to the dom element
  map = new H.Map(
    document.getElementById('mapEmbed'),
    defaultLayers.normal.map,
    { pixelRatio: pixelRatio });

  // interactive ui setup
  let behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  let ui = H.ui.UI.createDefault(map, defaultLayers);

  // defining geocoding parameters to search
  let geocodeSearch = {
    searchText: city
  };

  // callback function to parse geocoding response
  let onResult = (result) => {
    let location =
      result.Response.View[0].Result,
      position,
      marker;

    position = {
      lat: location[0].Location.DisplayPosition.Latitude,
      lng: location[0].Location.DisplayPosition.Longitude
    }

    moveMap(map, position.lat, position.lng);
    currentGeocode.lat = position.lat;
    currentGeocode.lng = position.lng;
    console.log("Location changed. \n LONGITUDE: " + currentGeocode.lng + "\n LATITUDE: " + currentGeocode.lat);
  };

  let geocoder = platform.getGeocodingService();
  geocoder.geocode(
    geocodeSearch,
    onResult, (e) => {
      alert(e);
    });
}

let moveMap = (map, lat, lng) => {
  map.setCenter({
    lat: lat,
    lng: lng
  })
  map.setZoom(12);
}

$(document).ready(function () {
  initializeMap(" ");

  // click handler so that nothing runs without it being clicked first
  $("#search").on("click", () => {

    const queries = {
      start: $("#start").val(),
      destination: $("#destination").val(),
    }

    // remove the map if it exists
    $("#mapEmbed").empty();

    // google map init, setting our latitude and longitude for weather api
    initializeMap(queries.destination);

    // look up zomato city id since we can't just search restaurants by city name
    const getZomato = (query) => {
      const zomatoIdURL = `http://localhost:3030/exploremore/zomato/${query}`;

      $.ajax({
        url: zomatoIdURL,
        method: "GET",
        
      }).then((response) => {
        for (i = 0; i < response.restaurants.length; i++) {
          var information = {
            name: response.restaurants[i].restaurant.name,
            rating: response.restaurants[i].restaurant.user_rating.agreegate_rating,
            type: response.restaurants[i].restaurant.cuisines,
            link: response.restaurants[i].restaurant.events_url
          };
          console.log(information);
        }
      })
    }

    getZomato(queries.destination);
  });

  $("#update").on("click", () => {

    // declare some values
    let startDate = $("#startDate").val()
    let returnDate = $("#returnDate").val()

    // objects to store our airport codes and search parameters
    const queries = {
      start: $("#start").val(),
      destination: $("#destination").val(),
    }

    // take the two date values and convert them into unix using moment for our weather api
    let unixStart = moment(startDate, "YYYY-MM-DD").unix();
    let unixReturn = moment(returnDate, "YYYY-MM-DD").unix();

    // weather api call
    const getWeather = (lat, lng, date) => {
      const weatherURL = `http://localhost:3030/exploremore/weather/${lat}/${lng}/${date}`;
      console.log(weatherURL);

      // darksky api doesn't allow cors access, so we pass it through a proxy server using fetch instead of ajax
      fetch(weatherURL, {
        method: 'GET',
      }).then((response) => {
        return response.json();
      }).then((data) => {
        let weatherData = data.daily.data[0]
        console.log(weatherData.summary);
        console.log(weatherData.precipProbability);
        console.log(weatherData.precipType);
        console.log(weatherData.temperatureHigh, weatherData.temperatureLow);
        console.log(weatherData.humidity);
      })
    }

    // flight prices api call
    const getFlights = (origin, destination, departDate, returnDate) => {
      const flightURL = `http://localhost:3030/exploremore/flightsearch/${origin}/${destination}/${departDate}/${returnDate}`

      fetch(flightURL, {
        method: 'GET',
      }).then((response) => {
        return response.json();
      }).then((data) => {
        console.log(data);
      })
    }

    getFlights(queries.start, queries.destination, startDate, returnDate);
    getWeather(currentGeocode.lat, currentGeocode.lng, unixStart)
  })
})


