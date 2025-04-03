// JS to retrive the users inputs from the html page 
// Update the table using the user inputs on the front end without reload
// Update the table on the backend in the python
// The link to a persons profile page from the help table: they provide the gamertag, maybe match profile to gamertag and add the link to that profile

// Retrive the inputs
const helpInputs = document.querySelector('#help-table');
if (helpInputs) {
  document.querySelector('#help-table').addEventListener('submit', event => {
    event.preventDefault();
    updateHelpWantedTable();
    // Clearing the existing text in the inputs (Is there a way to do this for multiple inputs at once?)
    document.querySelector('.form-control').value = '';
  });
}

async function updateHelpWantedTable() {
    // Write the function to post the input data to the backend to save the model
    // Update the table on the front end without a page reload when the json data returns from the backend, can also do this from the users inputs
    // Find a way to match the gamertag to a users profile and add the link next to the help wanted add, then add a add/remove friend button
  const gamertag = document.querySelector('input[name="table-gamertag"]').value;
  const helpGame = document.querySelector('input[name="table-help-game"]').value;
  const helpGameDay = document.querySelector('input[name="table-help-game-day"]').value;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
      const response = await fetch('/aliens/help_wanted', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          // Key value pairs for the data in the posted form to add new posts/comments to the leaderboard
          tableGamertag: gamertag,
          helpGame: helpGame,
          helpGameDay: helpGameDay, 
        })
      });
      // Write the code for getting the returned json and updating the table
      // I did this for the leaderboard, maybe just use the same approach?
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      helpTable = response.serialized_help_wanted_entries

      const rowsHtml = helpTable.map(entry => `
        <tr>
          <td>${entry.gamertag}</td>
          <td>${entry.game}</td>
          <td>${entry.game_day}</td>
          <td><a href="aliens/player_profile/${entry.user.id}/">Player's Profile</a></td>
        </tr>
      `).join('');
      
      document.querySelector('#help-wanted-table').innerHTML = rowsHtml;
      
    }

    catch (error) {
      console.log('message:', error);
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
