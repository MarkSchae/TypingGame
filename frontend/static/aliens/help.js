// JS to retrive the users inputs from the html page 
// Update the table using the user inputs on the front end without reload
// Update the table on the backend in the python
// The link to a persons profile page from the help table: they provide the gamertag, maybe match profile to gamertag and add the link to that profile

// Retrive the inputs for the help wanted table and update real time
const helpForm = document.querySelector('#help-table-form');
if (helpForm) {
  helpForm.addEventListener('submit', async event => {
    event.preventDefault();
    await updateHelpWantedTable();
    event.target.reset(); // clears all inputs at once
  });
}

async function updateHelpWantedTable() {
  const gamertag = document.querySelector('input[name="table-gamertag"]').value.trim();
  const helpGame = document.querySelector('input[name="table-help-game"]').value.trim();
  const helpGameDay = document.querySelector('input[name="table-help-game-day"]').value.trim();

  try {
    const response = await fetch('https://typinggame-production.up.railway.app/aliens/leaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'table-gamertag': gamertag,
        'table-help-game': helpGame,
        'table-help-game-day': helpGameDay
      })
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    const helpTable = data.help_table;

    const rowsHtml = helpTable.map(entry => `
      <tr>
        <td>${entry.gamertag}</td>
        <td>${entry.game}</td>
        <td>${entry.game_day}</td>
        <td><a href="/aliens/player_profile/${entry.user_id}/">Player's Profile</a></td>
      </tr>
    `).join('');

    document.querySelector('#help-table-body').innerHTML = rowsHtml;

  } catch (error) {
    console.error('Error updating help wanted table:', error);
  }
}

// Incompass this entire script inside a querryselctor, maybe later
document.querySelector('#weather-check').addEventListener('click', () => {

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location access granted.");
        
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
  
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=1d1675f9c1a86366e68f309febc0ca37&units=metric`;
  
        try {
          const response = await fetch(forecastUrl);
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
  
          const data = await response.json();
          console.log("Forecast data:", data);
          console.log("Forecast data:", data.city);
          console.log("Forecast data:", data.sunrise);
          console.log("Forecast data:", data.sunset);
          // You can now work with the JSON data
          // Can loop through the array to get the weather in increments of 3 hours for the next 5 days, I will add other features later
          weatherDiv = document.querySelector('#weather');
          weatherDiv.innerHTML = `<strong>City:</strong> ${data.city.name}<br>` +
                                 `<strong>Sunrise:</strong> ${data.city.sunrise}<br>` +
                                 `<strong>Sunset:</strong> ${data.city.sunset}<br>` +
                                 `<strong>Current temp:</strong> ${data.list[0].main.temp}<br>` +
                                 `<strong>Current wind speed:</strong> ${data.list[0].wind.speed}<br>` +
                                 `<strong>Current day and time:</strong> ${data.list[0].dt_txt}<br>`
        } catch (error) {
          console.error("Failed to fetch forecast data:", error);
        }
      },
      (error) => {
        if (error.code === 1) {
          console.error("User denied the request for Geolocation.");
          alert(
            "It seems you've denied location access. To use this feature, please follow these steps:\n\n" +
            "1. Open your browser settings.\n" +
            "2. Navigate to Privacy or Permissions settings.\n" +
            "3. Allow location access for this website.\n" +
            "4. Reload the page and try again."
          );
        } else if (error.code === 2) {
          console.error("Location information is unavailable.");
          alert(
            "Unable to determine your location. Please check your GPS or internet connection and try again."
          );
        } else if (error.code === 3) {
          console.error("The request to get location timed out.");
          alert(
            "The request for your location timed out. Please try again or check your network settings."
          );
        } else {
          console.error("An unknown error occurred while getting location.");
          alert(
            "An unknown error occurred while trying to get your location. Please try again later."
          );
        }
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert(
      "Your browser does not support geolocation. Please use a modern browser to access this feature."
    );
  }
});
