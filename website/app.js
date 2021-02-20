// Personal API Key for OpenWeatherMap API
const APIKey = '46612cfd63ae0eb9ca04308c63fd244b';

// Make Date + Time
const makeDateAndTime = () => {
    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
    if (today.getHours() > 12) {
        let dateTime = `${date} | ${today.getHours() - 12}:${today.getMinutes()} p.m.`;
        return dateTime;
    } else {
        let dateTime = `${date} | ${today.getHours()}:${today.getMinutes()} a.m.`;
        return dateTime;
    }
};

// Event listener to add function to existing HTML DOM element
document.querySelector('#generate').addEventListener('click', generate);

/* Function called by event listener */
async function generate(event) {
    event.preventDefault();

    // GET Weather data from ZIP + API
    const userZip = document.querySelector('#zip').value;
    const weather = await getWeather(userZip, APIKey);
    const weathIcon = weather.weather[0].icon;
    const userTemp = `${Math.trunc((weather.main.temp - 273.15) * 9 / 5 + 32)}\u00B0`;

    // GET User Data from form
    const userDate = makeDateAndTime();
    const userEntry = document.querySelector('#feelings').value;
    const userMood = document.querySelector('input:checked').id;

    // GET USER data labels
    const moodName = document.querySelector('input:checked').labels[0].id;
    const weathName = `${weather.weather[0].description}`;
    const highLow = `${Math.trunc((weather.main.temp_max - 273.15) * 9 / 5 + 32)}\u00B0 / ${Math.trunc((weather.main.temp_min - 273.15) * 9 / 5 + 32)}\u00B0`;

    console.log(`CAPTURED DATA! ${makeDateAndTime()}`);

    await postData('/add', {
        date: userDate,
        mood: userMood,
        moodLabel: moodName,
        weather: weathIcon,
        weatherName: weathName,
        temp: userTemp,
        highLow: highLow,
        entry: userEntry
    });

    await getData('/all');
}

/* Function to GET Web API Data*/
const getWeather = async (userZip, APIKey) => {
    try {
        const request = await fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${userZip},us&appid=${APIKey}`);
        return await request.json();
    }
    catch (e) {
        console.log('FAILED TO FETCH WEATHER API DATA:', e);
    }
};

/* Function to POST data */
const postData = async (url = '', data = {}) => {
    try {
        console.log(`DATA SENT TO SERVER ${makeDateAndTime()}`);
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    }
    catch {
        console.log('FAILED TO POST DATA TO SERVER');
    }
};

/* Function to GET Project Data */
const getData = async (url) => {
    try {
        const request = await fetch(url);
        const data = await request.json();

        // UPDATE UI
        document.querySelector('#journal-prompt').style.display = "none";
        document.querySelector('#entryContainer').style.display = "block";

        // entry date
        document.querySelector('#date-label').innerHTML = data.date;

        // mood / weather / temp containers
        let mood = document.querySelector('#moodIcon');
        let weather = document.querySelector("#weather");
        let temp = document.querySelector('#temp');

        // changes mood icon + temp to match weather icon from API
        const colorChange = (hex) => {
            mood.style.color = hex;
            temp.style.color = hex;
        };

        const iconColor = () => {
            if (parseInt(data.weather.slice(0, 2)) === 3) {
                colorChange('#f2f2f1');
            } else if (data.weather.includes('n')) {
                colorChange('#48484a');
            } else if (parseInt(data.weather.slice(0, 2)) < 3) {
                colorChange('#ec6f4d');
            } else if (parseInt(data.weather.slice(0, 2)) === 10) {
                colorChange('#ec6f4d');
            } else {
                colorChange('#48484a');
            }
        };

        iconColor();

        // mood
        mood.classList.add(`${data.moodLabel}`);
        // mood name
        document.querySelector('#mood-name').innerHTML = data.mood;

        // weather
        let weatherIcon = document.querySelector('#weather').firstElementChild;
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather}@2x.png`;
        // weather name
        document.querySelector('#weather-name').innerHTML = data.weatherName;

        // temp
        temp.innerHTML = data.temp;
        // daily high + low
        document.querySelector('#temp-feels').innerHTML = data.highLow;

        // journal entry
        let feelings = document.querySelector('#content');
        feelings.innerText = data.entry;

        console.log(`DATA POSTED TO UI ${makeDateAndTime()}`);
    }
    catch (e) {
        console.log('DATA NOT RETREIVED FROM SERVER', e);
    }
};

// EXTRA NON RUBRIC JS

// back btn actions: remove previous entries + back btn + display prompt
document.querySelector('#back').addEventListener('click', function () {
    window.location.reload();
});