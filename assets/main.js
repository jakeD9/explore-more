let map;

let initializeMap = (city) => {
  // maps object instantiated with credentials
  let platform = new H.service.Platform({
    'app_id': 'QTX9Ulhk71aSUq6SF51d',
    'app_code': 'JEHV174h_P1Oj2Q_cBEuGA',
    useHTTPS: true
  });

  // gets default map types from the platform object
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

  // interactive ui
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

  // click handler so that nothing runs without it being clicked first
  $("#search").on("click", () => {

    // identify some keys and values to be used
    const zomatoKey = "af0b75e10ec2c9e797c35598e8fc0207";
    const weatherKey = "7cc8e08326886fb8098d2b341400c7da";
    const userLocationQuery = $("#destination").val();

    // google map init, setting our latitude and longitude for weather api
    initializeMap("Denver");

    // look up zomato city id since we can't just search restaurants by name
    const getZomatoPlaceId = (query) => {
      const zomatoIdURL = "https://developers.zomato.com/api/v2.1/cities?q=" + query;

      $.ajax({
        url: zomatoIdURL,
        method: "GET",
        headers: {
          'user-key': zomatoKey,
          'content-type': "application/json"
        }
      }).then((response) => {
        let grabbedId = response.location_suggestions[0].id;
        console.log(`Zomato City Id = ${grabbedId}`);
        getZomatoRestaurants(grabbedId)
      })
    }

    //zomato restaurant lookup by city id
    const getZomatoRestaurants = (id) => {
      const zomatoRestaurantURL = "https://developers.zomato.com/api/v2.1/search?entity_id=" + id + "&entity_type=city&count=10&sort=rating";

      $.ajax({
        url: zomatoRestaurantURL,
        method: "GET",
        headers: {
          'user-key': zomatoKey,
          'content-type': "application/json"
        }
      }).then((response) => {
        console.log(response);

        for (i = 0; i < response.restaurants.length; i++) {
          var information = {
            name: response.restaurants[i].restaurant.name,
            rating: response.restaurants[i].restaurant.user_rating.agreegate_rating,
            type: response.restaurants[i].restaurant.cuisines,
            link: response.restaurants[i].restaurant.events_url,
          };

          console.log(information);
        }
      })
    }

    getZomatoPlaceId(userLocationQuery);


    // google map init
    // lat + long from map init
    // grab lat + long to darkskyapi
    // append to page
  });
})


