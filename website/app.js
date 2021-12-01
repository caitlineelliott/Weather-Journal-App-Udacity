// Make Date + Time
const makeDateAndTime = () => {
    const today = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dateTime = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()} | ${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return dateTime;
};

// Event listener to add function to existing HTML DOM element
document.querySelector('#generate').addEventListener('click', generate);

/* Function called by event listener */
async function generate(e) {
    e.preventDefault();

    // Form validation
    let form = document.querySelector("#journal-form");
    form.checkValidity();
    form.reportValidity();

    // Get User Data
    const userZip = document.querySelector('#zip').value;
    const userDate = makeDateAndTime();
    const userEntry = document.querySelector('#feelings').value;
    const userMood = document.querySelector('input:checked').id;
    const moodName = document.querySelector('input:checked').labels[0].id;

    await postData('/add', {
        zip: userZip,
        date: userDate,
        mood: userMood,
        moodLabel: moodName,
        entry: userEntry
    });

    await getData('/all');
}

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
        document.querySelector('#entry-container').style.display = "block";

        // entry date
        document.querySelector('#date-label').innerHTML = data.date;

        // mood / weather / temp containers
        let mood = document.querySelector('#moodIcon');
        let weather = document.querySelector("#weather");
        let temp = document.querySelector('#temp-num');

        // changes mood icon + temp to match weather icon from API
        const colorChange = (hex) => {
            mood.style.color = hex;
            temp.style.color = hex;
        };

        const iconColor = () => {
            if (parseInt(data.icon.slice(0, 2)) === 3) {
                colorChange('#f2f2f1');
            } else if (data.icon.includes('n')) {
                colorChange('#48484a');
            } else if (parseInt(data.icon.slice(0, 2)) < 3) {
                colorChange('#ec6f4d');
            } else if (parseInt(data.icon.slice(0, 2)) === 10) {
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
        weatherIcon.src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;
        // weather name
        document.querySelector('#weather-name').innerHTML = data.weatherName;

        // temp
        temp.innerHTML = data.temp;
        // daily high + low
        document.querySelector('#high-low').innerHTML = data.highLow;

        // journal entry
        let feelings = document.querySelector('#entry-text');
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