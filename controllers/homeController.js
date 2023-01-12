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

const homeController = async (req, res) => {
  try {
    //* IP Geolocation API 
    //! Requires API Key
    const { data: locationData } = await axios.get(
      `https://ipgeolocation.abstractapi.com/v1/?api_key=${process.env.IPG_API_KEY}`
    );
    const { latitude: Lat, longitude: Lon } = locationData;

    //* openWeather API 
    //! Requires API Key
    const { data: weatherData } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?&lat=${Lat}&lon=${Lon}&appid=${process.env.Weather_API_KEY}&units=metric`
    );

    const { name: cityName, main, weather } = weatherData;
    const [{ description, icon, main: weatherMain }] = weather;
    const weatherTemp = main.temp;
    const weatherIcon = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const weatherDescription = description;
    const weatherStatus = weatherData.cod === 200;

    /* Incorporating all the posts from PostDB into the homescreen at once */
    const foundItems = await Post.find();
    res.render("home", {
      posts: foundItems,
      cityName,
      weatherTemp,
      weatherIcon,
      weatherDescription,
      weatherMain,
      weatherStatus,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = homeController;
