var openWeatherAPI = "b10de883ce95addb319317f5fe828984";
var lat = 44.95299;
var lon = -93.3429;
var queryString = "Saint Louis Park";

$(function () {});

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
    });
}

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
    });
}

getLocation(queryString);
getWeather(lat, lon);
