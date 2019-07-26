moment().format();
let map;
let currentGeocode = {
  lng: undefined,
  lat: undefined
}

// simulate navigation for displaying content
let navigation = {
  showMap: () => {
    $("#foodContent").addClass("hidden");
    $("#travelContent").addClass("hidden");
    $("#mapContent").removeClass("hidden");
  },
  showFood: () => {
    $("#travelContent").addClass("hidden");
    $("#mapContent").addClass("hidden");
    $("#foodContent").removeClass("hidden");
  },
  showTravel: () => {
    $("#mapContent").addClass("hidden");
    $("#foodContent").addClass("hidden");
    $("#travelContent").removeClass("hidden");
  }
}

// map creation
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

  $("#navMap").on("click", () => {
    navigation.showMap();
    })

  $("#navFood").on("click", () => {
    navigation.showFood();
  })

  $("#navTravel").on("click", () => {
    navigation.showTravel();
  })

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
      const zomatoIdURL = `https://jdproxy.herokuapp.com/exploremore/zomato/${query}`;

      $.ajax({
        url: zomatoIdURL,
        method: "GET",
        
      }).then((response) => {
        let restaurants = [];

        for (i = 0; i < response.restaurants.length; i++) {
          let information = {
            id: i + 1,
            name: response.restaurants[i].restaurant.name,
            location: response.restaurants[i].restaurant.location.locality,
            rating: response.restaurants[i].restaurant.user_rating.aggregate_rating,
            type: response.restaurants[i].restaurant.cuisines,
            link: response.restaurants[i].restaurant.url,
            thumb: response.restaurants[i].restaurant.thumb
          };
          restaurants.push(information)
        }

        // html template for each restaurant to display
        let foodHTML = (restaurant) => {
          return `<div class="container">
                    <img src=${restaurant.thumb} alt="Restaurant image" class="content__food--img">
                    <ul class="content__food--info">
                      <li class="content__food--item"><a href=${restaurant.link} target="_blank">${restaurant.name}</a></li>
                      <li class="content__food--item">${restaurant.location}</li>
                      <li class="content__food--item">${restaurant.type}</li>
                      <li class="content__food--item">${restaurant.rating} <i class="fas fa-star"></i></li>
                    </ul>
                  </div>`
        }

        // mapping data to each template and throwing them all in the same div
        let foodList = (restaurantData) => {
          return `<div> 
                    ${restaurantData.map(foodHTML).join('')}
                  </div>`
        }

        // filtering by id to make it easy which column to map the data to
        let even = restaurants.filter(restaurant => restaurant.id % 2 === 0)
        let odd = restaurants.filter(restaurant => restaurant.id % 2 > 0)

        // actual DOM manipulation
        $("#foodContent1").html(foodList(odd))
        $("#foodContent2").html(foodList(even))
      })
    }

    getZomato(queries.destination);
  });

  $("#update").on("click", () => {

    // search parameters
    let startDate = $("#startDate").val()
    let returnDate = $("#returnDate").val()

    // search parameters
    const queries = {
      start: $("#start").val(),
      destination: $("#destination").val(),
    }

    // take the two date values and convert them into unix using moment for our weather api
    let unixStart = moment(startDate, "YYYY-MM-DD").unix();
    let unixReturn = moment(returnDate, "YYYY-MM-DD").unix();

    // weather api call
    const getWeather = (lat, lng, date) => {
      const weatherURL = `https://jdproxy.herokuapp.com/exploremore/weather/${lat}/${lng}/${date}`;

      // darksky api doesn't allow cors access, so we pass it through a proxy server using fetch instead of ajax
      fetch(weatherURL, {
        method: 'GET',
      }).then((response) => {
        return response.json();
      }).then((data) => {
        let weatherData = data.daily.data[0]

        // convert decimal values to percentages
        let convertFloat = (num) => {
          if (num === 1) return "100%"
          else {
            let newNum = num.toString();
            let numArr = newNum.split(".");
            newNum = numArr[1].substr(0, 2);
            return newNum + "%"
          }
        }

        // html template for weather
        let weatherHTML = (weather) => {
          return `<div class="container u-center-text">
                    <div class="content__travel--weather"><i class="fas fa-thermometer-quarter"></i> ${Math.floor(weather.temperatureLow)}&deg;F to <i
                    class="fas fa-thermometer-full"></i> ${Math.floor(weather.temperatureHigh)}&deg;F</div>
                    <div class="content__travel--weather"><i class="fas fa-cloud-rain"></i> ${convertFloat(weather.precipProbability)} ${weather.precipType}</div>
                    <div class="content__travel--weather"><i class="fas fa-shower"></i> ${convertFloat(weather.humidity)} Humidity</div>
                    <div class="content__travel--weather-small">${weather.summary}</div>
                  </div>`
        }

        // DOM manipulation
        $("#weatherWrap").html(weatherHTML(weatherData))
      })
    }

    // flight prices api call
    const getFlights = (origin, destination, departDate, returnDate) => {
      const flightURL = `https://jdproxy.herokuapp.com/exploremore/flightsearch/${origin}/${destination}/${departDate}/${returnDate}`

      fetch(flightURL, {
        method: 'GET',
      }).then((response) => {
        return response.json();
      }).then((data) => {
        const airlines = data.dictionaries.carriers;
        let flights = [];

        for (i = 0; i < data.data.length; i++) {
          let flightInfo = {
            price: data.data[i].offerItems[0].price.total,
            airline: airlines[data.data[i].offerItems[0].services[0].segments[0].flightSegment.carrierCode]
          }
          flights.push(flightInfo);
        }

        let flightHTML = (flight) => {
          return `<div class="container">
                    <ul class="content__travel--info">
                      <li class="content__travel--item">${flight.airline}</li>
                      <li class="content__travel--item"><i class="fas fa-arrow-right"></i></li>
                      <li class="content__travel--item">~$${flight.price} per person</li>
                    </ul>
                  </div>`
        }

        let flightList = (flightData) => {
          return `<div>
                    ${flightData.map(flightHTML).join('')}
                  </div>`
        }

        $("#flightContent").html(flightList(flights))
      })
    }

    getFlights(queries.start, queries.destination, startDate, returnDate);
    getWeather(currentGeocode.lat, currentGeocode.lng, unixStart)
  })
})


