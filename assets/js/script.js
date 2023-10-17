

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
    $("#forecastList").text("");
    for (i = 0; i < weatherData.list.length; i++) {
      //the weather data comes back with 40 results corresponding to 3-hour blocks over the next 5 days.
      //we are looking at the current weather, and then selecting the weather 8, 16, 24, 32, and 40 blocks in the future.
      //this isn't great data for a daily forecast, we should be using the api that returns data for entire days, but that costs $$
      if (i === 0 || (i + 1) % 8 === 0) {
        //calculating the strings to add to the block
        var date = dayjs.unix(weatherData.list[i].dt).format("ddd, MMM D");
        var iconCode = weatherData.list[i].weather[0].icon;
        var iconDescription = weatherData.list[i].weather[0].description;
        var temperature =
          Math.round(
            (Number(weatherData.list[i].main.temp) - 273.15) * 1.8 + 32
          ) + "°F";
        var wind = Math.round(weatherData.list[i].wind.speed * 1.151) + " mph";
        var relHumidity = weatherData.list[i].main.humidity + "%";
        var columnSelector = " col-lg-2"; //add a bootstrap class so we get the 5-day forecast below

        //some special text formatting for the current date, and no column selector so it takes up the whole width on larger screens. 
        if (i === 0) {
          var date = dayjs
            .unix(weatherData.list[i].dt)
            .format("dddd, MMMM D, YYYY");
          columnSelector = " col-lg-10"; //make sure this is as wide as it's fellows 
        }

        //constructing the code block from the defined strings
        var weatherBlock =
          "<li id='block-index-" +
          i +
          "' class='weatherBlock" +
          columnSelector +
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
    buildHistoryList();
    $("#block-index-0").after("<h3>Five Day Forecast</h3>");
  }

  //take the city from our geoData and display it as a header on the forecast blocks.
  function setCity(geoData) {
    var cityIdentity;
    //I am so happy this works! 
    var countryName = countries[geoData.country]
    

    //if we're in the US, we use the state. Else we use the country. 
    if (geoData.country === "US") {
      console.log("in US");
      cityIdentity = geoData.name + ", " + geoData.state;
    } else {
      cityIdentity = geoData.name + ", " + countryName;
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
      "&appid=b10de883ce95addb319317f5fe828984"

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
    cities.unshift(cityObject);

    //some fun JSON fudging to remove duplicates - from https://www.geeksforgeeks.org/how-to-remove-duplicates-from-an-array-of-objects-using-javascript/#
    jsonObject = cities.map(JSON.stringify);
    uniqueSet = new Set(jsonObject);
    cities = Array.from(uniqueSet).map(JSON.parse);

    //keep the list a manageable size
    cities = cities.slice(0,6)

    //store the de-duplicated array.
    localStorage.setItem("savedCities", JSON.stringify(cities));
  }

  // grab our location and store it.
  function getLocation(queryString) {
    var requestUrl =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      queryString +
      "&appid=b10de883ce95addb319317f5fe828984"

    fetch(requestUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        if (!data.length) {
          // if we get a null or 0 length response, we want to pop a modal here "no city was found, please try again"
          alert("No city found, please try again!");
          return;
        } else if (data.length === 1) {
          //only one possibility - we'll get the weather from location 0.
          saveCity(data[0]);
          setCity(data[0]);
          getWeather(data[0].lat, data[0].lon);
        } else {
          //placeholder. This should pop a modal asking you which city you want the data for. For now we display the first entry.
          saveCity(data[0]);
          setCity(data[0]);
          getWeather(data[0].lat, data[0].lon);
        }
      });
  }

  function buildHistoryList() {
    $("#historyList").text("");
    var cityDisplay = [];
    var savedCities = JSON.parse(localStorage.getItem("savedCities"));
    if (savedCities !== null) {
      cityDisplay = savedCities;
    }
    console.log(cityDisplay[0].name);
    for (i = 0; i < cityDisplay.length; i++) {
      console.log(cityDisplay[i]);
      var cityName = cityDisplay[i].name;
      var lat = cityDisplay[i].lat;
      var lon = cityDisplay[i].lon;
      console.log("city name: ", cityName);
      console.log(lat);
      console.log(lon);
      var buttonString =
        '<button type="button" id="cityButton-' +
        i +
        '" class="btn btn-secondary cityBtn mt-3 w-100" data-index="' +
        i +
        '">' +
        cityName +
        "</button>";
      $("#historyList").append(buttonString);
    }
  }

  function loadCity(index) {
    var geoData = JSON.parse(localStorage.getItem("savedCities"));
    setCity(geoData[index]);
    getWeather(geoData[index].lat, geoData[index].lon);
  }

  $("#citySearchForm").on("submit", function (e) {
    e.preventDefault();
    queryString = $("#citySearchInput").val();
    $("#citySearchInput").val("")
    getLocation(queryString);
  });

   $(document).on("click", ".cityBtn", function(e) {
    e.preventDefault();
    var index = $(this).attr("data-index");
    console.log(index)
    loadCity(index);
  });

  buildHistoryList();
  // for testing - using a static location
  //   getLocation(queryString);
});
