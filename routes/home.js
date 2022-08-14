/* Express Router */

const express = require("express");
const router = express.Router();

/* ----------------------------- */
/* Initializing Global Variables */

var Lat,
  Lon,
  cityName,
  weatherData,
  weatherTemp,
  weatherMain,
  weatherIcon,
  weatherDescription,
  weatherStatus;

/* --------------------------- */  
/* Importing node dependencies */ 

const axios = require("axios").default;
const https = require("https");

/* -------------- */  
/* MongoDB PostDB */ 

const Post = require("../models/post_model");

/* ---------- */  
/* Home Route */ 

router.get("/", async (req, res) => {

  //* IP Geolocation API 
  //! Requires API Key

  await axios
    .get(
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.IPG_API_KEY}`
    )
    .then((response) => {
      Lat = response.data.latitude;
      Lon = response.data.longitude;
    })
    .catch((error) => {
      console.log(error);
    });

  //* openWeather API 
  //! Requires API Key
  
  const url = `https://api.openweathermap.org/data/2.5/weather?&lat=${Lat}&lon=${Lon}&appid=${process.env.Weather_API_KEY}&units=metric`;
  https
    .get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", async () => {
        weatherData = await JSON.parse(data);
        weatherStatus = weatherData.cod == 200 ? true : false;
        cityName = weatherData.name;
        weatherTemp = weatherData.main.temp;
        weatherMain = weatherData.weather[0].main;
        weatherDescription = weatherData.weather[0].description;
        weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
      });
    })
    .on("error", (err) => {
      console.log(err.message);
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
