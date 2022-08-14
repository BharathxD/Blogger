const express = require("express");
const router = express.Router();

const axios = require("axios");
const https = require("https");

const Post = require("../models/post_model");

/* Initializing Global Variables */

let lat,
  lon,
  cityName,
  weatherData,
  weatherTemp,
  weatherMain,
  weatherIcon,
  weatherDescription,
  weatherStatus;

weatherStatus = true;

/* ------------------ */
/* IP Geolocation API */

axios
    .get(
      //! Requires Ipgeolocation API 
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.IPG_API_KEY}`
    )
    .then( async (response) => {
      const responseData = await response.data;
      lat = responseData.latitude;
      lon = responseData.longitude;
      console.log(lat);
    })
    .catch((error) => {
      console.log(error);
    });

/* Home Route */

router.get("/", (req, res) => {

  /* Weather API */

  const apikey = process.env.Weather_API_KEY;
  const unit = "metric";
  //! Requires OpenweatherAPI 
  const url = `https://api.openweathermap.org/data/2.5/weather?&appid=${apikey}&lat=${lat}&lon=${lon}&units=${unit}`;
  https.get(url, (response) => {
    if (response.statusCode === 404) {
      weatherStatus = false;
    } else {
      response.on("data", (data) => {
        weatherData = JSON.parse(data);
        console.log(weatherData);
        cityName = weatherData.name;
        weatherTemp = weatherData.main.temp;
        weatherMain = weatherData.weather[1].main;
        weatherDescription = weatherData.weather[0].description;
        weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
      });
    }
  });

  /* Incorporating all the posts from PostDB into the homescreen at once */

  Post.find((err, foundItems) => {
    !err
      ? res.render("home", {
          posts: foundItems,
          cityName: cityName,
          weatherTemp: weatherTemp,
          weatherIcon: weatherIcon,
          weatherDescription: weatherDescription,
          weatherMain: weatherMain,
          weatherStatus: weatherStatus,
        })
      : console.log(err);
  });
});

module.exports = router;
