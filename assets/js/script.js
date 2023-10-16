var openWeatherAPI = "b10de883ce95addb319317f5fe828984";

//placeholders
// var lat;
// var lon ;
var queryString = "";
var cities = [];

//wait till all the scripts are loaded.
$(function () {
  //   $("#citySearchConfirm").modal(); // unusused

  //display the data once we have a city.
  function displayWeather(weatherData) {
    $("#forecastList").text("")
    for (i = 0; i < weatherData.list.length; i++) {
      //the weather data comes back with 40 results corresponding to 3-hour blocks over the next 5 days.
      //we are looking at the current weather, and then selecting the weather 8, 16, 24, 32, and 40 blocks in the future.
      //this isn't great data for a daily forecast, we should be using the api that returns data for entire days, but that costs $$
      if (i === 0 || (i + 1) % 8 === 0) {
        //calculating the strings to add to the block
        var date = dayjs
          .unix(weatherData.list[i].dt)
          .format("dddd, MMM D");
        var iconCode = weatherData.list[i].weather[0].icon;
        var iconDescription = weatherData.list[i].weather[0].description;
        var temperature =
          Math.round(
            (Number(weatherData.list[i].main.temp) - 273.15) * 1.8 + 32
          ) + "°F";
        var wind = Math.round(weatherData.list[i].wind.speed * 1.151) + " mph";
        var relHumidity = weatherData.list[i].main.humidity + "%";
        var columnSelector = " col-2"

        if(i === 0) {
            var date = dayjs
            .unix(weatherData.list[i].dt)
            .format("dddd, MMMM D, YYYY");
            columnSelector = ""
        }
    

        //constructing the block from the defined strings
        var weatherBlock =
          "<li id='block-index-" + i + 
          "' class='weatherBlock" + columnSelector +
          "'><div><h4>" +
          date +
          "</h4><img src='http://openweathermap.org/img/w/" +
          iconCode +
          ".png' alt='" +
          iconDescription +
          "'><p>Temp.: " +
          temperature +
          "<br>Wind: " +
          wind +
          "<br>Humidity: " +
          relHumidity +
          "</p></div></li>";
        $("#forecastList").append(weatherBlock);
      }
    }
  }

  //take the city from our geoData and display it as a header on the forecast blocks.
  function setCity(geoData) {
    var cityIdentity;
    var countryName = countries[geoData[0].country]
    
    // .substring(
    //   0,
 //   countries[geoData[0].country].indexOf(",")
    // );
    console.log("in", geoData[0].country);
    console.log(countryName);
    //if we're in the US, we use the state. Else we use the country code to lookup the country and use that text. Some of the entries have commas, removing text after the comma.
    if (geoData[0].country === "US") {
      console.log("in US");
      cityIdentity = geoData[0].name + ", " + geoData[0].state;
    } else {
      cityIdentity = geoData[0].name + ", " + countryName;
    }

    $("#cityIdentity").text(cityIdentity);
  }

  //api request to grab the weather. needs a lat and lon.
  function getWeather(lat, lon) {
    var requestUrl =
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      openWeatherAPI;

    fetch(requestUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        displayWeather(data);
      });
  }

  function saveCity(cityObject) {
    var savedCities = JSON.parse(localStorage.getItem("savedCities"));
    if (savedCities !== null) {
      cities = savedCities; // create the local event table
    }
    //add our city to the list
    cities.push(cityObject);

    //some fun JSON fudging to remove duplicates - from https://www.geeksforgeeks.org/how-to-remove-duplicates-from-an-array-of-objects-using-javascript/#
    jsonObject = cities.map(JSON.stringify);
    uniqueSet = new Set(jsonObject);
    cities = Array.from(uniqueSet).map(JSON.parse);

    //store the de-duplicated array.
    localStorage.setItem("savedCities", JSON.stringify(cities));
  }

  // grab our location and store it.
  function getLocation(queryString) {
    var requestUrl =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      queryString +
      "&appid=" +
      openWeatherAPI;
    openWeatherAPI;

    fetch(requestUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        if (!data.length) {
          // if we get a null or 0 length response, we want to pop a modal here "no city was found, please try again"
          prompt("No city found, please try again!");
          return;
        } else if (data.length === 1) {
          //only one possibility - we'll get the weather from location 0.
          saveCity(data);
          setCity(data);
          getWeather(data[0].lat, data[0].lon);
        } else {
          //placeholder. This should pop a modal asking you which city you want the data for. For now we display the first entry.
          saveCity(data);
          setCity(data);
          getWeather(data[0].lat, data[0].lon);
        }
      });
  }

  $("#citySearchForm").on("submit", function (e) {
    e.preventDefault();
    queryString = $("#citySearchInput").val();
    getLocation(queryString);
  });
  // for testing - using a static location
  //   getLocation(queryString);
});
