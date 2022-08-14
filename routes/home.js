const express = require("express");
const router = express.Router();

var Lat,
  Lon,
  cityName,
  weatherData,
  weatherTemp,
  weatherMain,
  weatherIcon,
  weatherDescription,
  weatherStatus = true;
  

const axios = require("axios").default;
const https = require("https");

const Post = require("../models/post_model");



router.get("/", async (req, res) => {

   await axios
  .get(`https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.IPG_API_KEY}`)
  .then((response) => {
    Lat = response.data.latitude;
    Lon = response.data.longitude;
  })
  .catch((error) => {console.log(error);});

const url = `https://api.openweathermap.org/data/2.5/weather?&lat=${Lat}&lon=${Lon}&appid=${process.env.Weather_API_KEY}&units=metric`;
 https.get(url, (response) => {
    response.on("data", async (data) => {
      weatherData = await JSON.parse(data);
      cityName = await weatherData.name;
      weatherTemp = await weatherData.main.temp;
      weatherMain = await weatherData.weather[1].main;
      weatherDescription = await weatherData.weather[0].description;
      weatherIcon = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
    });
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
