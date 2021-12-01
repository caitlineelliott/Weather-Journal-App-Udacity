const dotenv = require('dotenv');
dotenv.config();

const fetch = require("node-fetch");

// Setup empty JS object to act as endpoint for all routes
projectData = {};

// Express to run server and routes
const express = require('express');

// Start up an instance of app
const app = express();

/* Dependencies */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// // Cors for cross origin allowance
const cors = require('cors');
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

const port = 3002;

// Spin up the server
// Callback to debug
const server = app.listen(port, listening);

function listening() {
    console.log("server running");
    console.log(`running on localhost: ${port}`);
};

// Initialize all route with a callback function
app.get('/all', getData);

// Callback function to complete GET '/all'
function getData(req, res) {
    res.send(projectData);
};

// Post Route
app.post('/add', addData);

async function addData(req, res) {
    const newData = req.body;

    projectData["date"] = newData.date;
    projectData["entry"] = newData.entry;
    projectData["mood"] = newData.mood;
    projectData["moodLabel"] = newData.moodLabel;

    let weather = await getWeather(newData.zip, process.env.API_KEY);

    projectData["weather"] = weather;
    projectData["icon"] = weather.weather[0].icon;
    projectData["temp"] = `${Math.trunc(weather.main.temp)}\u00B0`;
    projectData["highLow"] = `${Math.trunc(weather.main.temp_max)}\u00B0 / ${Math.trunc(weather.main.temp_min)}\u00B0`;
    projectData["weatherName"] = `${weather.weather[0].description}`;

    res.send(projectData);
};

/* Function to GET Web API Data*/
const getWeather = async (userZip, APIKey) => {
    try {
        const request = await fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${userZip},us&appid=${APIKey}&units=imperial`);
        return await request.json();
    }
    catch (e) {
        console.log('FAILED TO FETCH WEATHER API DATA:', e);
    }
};