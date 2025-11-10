// This function must run when form is submitted and/or add an interval something about polling 
const postForm = document.querySelector('#post_form');
if (postForm) {
  document.querySelector('#post_form').addEventListener('submit', event => {
    event.preventDefault();
    updatePosts();
    document.querySelector('#post_content-text').value = '';
  });
}


async function updatePosts() { // This must now change to a post and the submit of the form must be stopped in the html

  const postContent = document.querySelector('#post_content-text').value;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    try {
        // Update the leaderboard without requiring a page reload
        // Need to fetch the new data with the new rankins and skill ratings and manipulated the html to updating the already loaded div
      const response = await fetch('/aliens/leaderboard', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
          // Key value pairs for the data in the posted form to add new posts/comments to the leaderboard
          postContent: postContent
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const leaderboardPosts = data.posts;
      const postsDiv = document.querySelector('#posts');
      postsDiv.innerHTML = '';
      

      // Clear form fields on submitt
      // If response is ok then handle changing the html after the post has been sent
      // Do not forget to save post to the backend if giving an option to edit  
      leaderboardPosts.forEach(post => {
        
        newli = document.createElement('li');

        // Edit innerhtml of created div
        newli.innerHTML = `<strong>Username:</strong> ${post.posted_by}<br>` +
                            `<strong>Post:</strong> ${post.content}<br>` +
                            `<strong>Posted at:</strong> ${post.created_at}<br>`;
                            //`<strong>Likes:</strong> ${post.likes}<br>`;

        // Append created div to the div in the all posts html page 
        postsDiv.appendChild(newli);
      })

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Handle errors if any
    }
  }
  
// Might have to seperate the views if this does not work because at the moment the json is only returned when the form is submitted.
// Or I can manipulate the entire page from the js file and leave the rendering of the html page from the index html
// Must learn how to implement web sockets
// Remember to handle running this function and now creating a new empty div from the post

async function updateLeaderboard() {
  try {
      // Update the leaderboard without requiring a page reload
      // Need to fetch the new data with the new rankins and skill ratings and manipulated the html to updating the already loaded div
    const response = await fetch('/aliens/leaderboard', {
      headers: {
        'X-Fetch-Leaderboard': 'FetchLeaderboard'
    }
    });
    const data = await response.json();
    const leaderboardEntries = data;
    console.log(leaderboardEntries);
    console.log(leaderboardEntries[0][0]);
    console.log (typeof leaderboardEntries);
    console.log('Is leaderboardEntries an array?', Array.isArray(leaderboardEntries));

    const leaderboardBody = document.querySelector('#leaderboard-body');
    const leaderboardTableRow = leaderboardBody.querySelectorAll('tr');
    //console.log(leaderboardBody);

    // Iterate through each entry in data and update existing rows Things need to be worked on here
    leaderboardEntries.forEach((entry, index) => {
      console.log('Index:', index);
      console.log('Entry:', entry);
      console.log('Rank:', entry.user_rank);
      console.log('Gamertag:', entry.gamertag);
      console.log('Skill Rating:', entry.user_skill_rating);
      const leaderboardTableRow = leaderboardBody.querySelectorAll('tr');
      console.log(leaderboardTableRow);
      const stats = [
        entry.user_rank,
        entry.gamertag,
        entry.user_skill_rating
      ];
      console.log(stats);

      /* This code is to stop runtime errors if there are more entries than rows which can occur if new users are playing at time of viewing leaderboard
        if (index < leaderboardTableRows.length) {
          row = leaderboardTableRows[index]; // Update existing row
        } else {
          row = leaderboardBody.insertRow(); // Add new row if needed
          for (let i = 0; i < 3; i++) { // Assuming each row should have 3 cells
            row.insertCell();
          }
        }
      */
      
      // Might be better to clear data and create new rows(I will seee if this works first)
      if (leaderboardTableRow) {
        let row = leaderboardTableRow[index];
        for (let x = 0; x < row.cells.length; x++) {
          row.cells[x].innerHTML = stats[x];
          console.log(row.cells[x]);
          console.log(stats[x]);
        }
        
      // Update existing row collumData
      // Lets do a for loop here rather
      // This is now working but needs to be looped through each cell of each row. Maybe convert to array and use map method to run a function on each element of the arry
      //leaderboardTableRow[0].cells[0].innerHTML = entry.user_rank;  // Update rank cell
      //console.log(leaderboardTableRow[0].innerHTML);
      //leaderboardTableRow[0].cells[1].innerHTML = entry.gamertag;  // Update gamertag cell
      //leaderboardTableRow[0].cells[2].innerHTML = entry.user_skill_rating;  // Update skill rating cell

    }
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    // Handle errors if any
  }
}
  // Call the function to update the leaderboard
// Call fetchUpdates every 60 seconds for real time polling updates without using web sockets which i need to learn still
setInterval(updateLeaderboard, 60000);


// Use buttons to toggle between views
document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));// Inbox is parsed as a parameter, in this case becomes mailbox in the loadmailbox function
document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
document.querySelector('#compose').addEventListener('click', compose_mail);
document.querySelector('#compose-form').addEventListener('submit', compose_mail_form_submit);

function compose_mail() {

  // Show compose view and hide other views
  document.querySelector('#mails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#details-mails').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function compose_mail_form_submit(event) {
  console.log("function is running");
  
  // Prevent default form submission which may interfere with AJAX request
  event.preventDefault();
  // Post to compose mail in order to save the new mail
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  fetch('/aliens/compose_mail', { //(fetching api)
  method: 'POST', //(Posting the new mail to the view/url)
    headers: {
      'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
      // JSON data keys and values
      // Am I goin do async here or leave as normal fetch?
        recipients: recipient, // Get this data from the compose form using querry selector to get the value inside the input field in the form
        subject: subject,
        body: body
    })
  })
  
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to send mail. User does not exist.');
    } else {
      load_mailbox('sent');
    }
    return response.json();
  }) 
  
}

// Mailbox is a variable that is parsed as a parameter to the function, it comes from the function call when the button is clicked (can have any name)
function load_mailbox(mailbox) {
  console.log("function is running");
  
  // Get to retrive emails from database
  fetch(`/aliens/mails/${mailbox}`)
  .then(response => response.json())
  .then(mails => {
    console.log(mails);
    // Display each mail in its own div
    // Loop through the emails and create a div each time for each mail to be displayed
    // Accessing each variable using forEach
    mails.forEach(mail => {
      // Create div for each mail in the mailbox
      const emailDiv = document.createElement('div');
      // Differnet color for read vs no read
      if (mail.read === false){
        emailDiv.style.backgroundColor = 'white';
      } else if (mail.read === true){
        emailDiv.style.backgroundColor = '#D3D3D3';
      }
      // Create button for each mail that when clicked takes the user to the detailed mail view which shows the actual body of the mail
      const emailLink = document.createElement('button');
      // Set the text content of the link to the mail subject
      emailLink.textContent = 'Email Content'; 
      // For each mail add a eventlistener for click and call to a function that shows other details about the mail
      emailLink.addEventListener('click', () => {
        handleEmailClick(parseInt(mail.id)); // Call the function to handle the click
        //updateReadEmail(mail.id);
      });

      
      // For each mail create a button for archiving and unarchiving/ Change the archive button the a button that allows the mail text to become the text for the game as a challenge
      //const archiveButton = document.createElement('button');
      //archiveButton.textContent = mail.archived ? 'Unarchive' : 'Archive';
      // Add the event listner and another function
      //archiveButton.addEventListener('click', () => {
        //toggleArchiveStatus(mail.id, !mail.archived);
      //});

      // Email view must display sender, subject, and timestamp
      emailDiv.innerHTML = `<strong>Sender:</strong> ${mail.sender}<br>` +
                           `<strong>Subject:</strong> ${mail.subject}<br>` +
                           `<strong>Time:</strong> ${mail.timestamp}<br>`;
      document.querySelector('#mails-view').appendChild(emailDiv);
      // Append the button to the div element
      //emailDiv.appendChild(archiveButton);
      // Append the anchor element to the emailDiv
      emailDiv.appendChild(emailLink);      
    });

  });

  // Show the mailbox and hide other views
  document.querySelector('#mails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#details-mails').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}



// View mail that was clicked on
function handleEmailClick(mailId) {
  // Logic to show further details regarding the mail and to hide the other divs
  // Fetch request to get the further details of the mail
  fetch(`/aliens/mails/${mailId}`)
  .then(response => response.json())
  .then(mail => {
    // Create reply button
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    // Add the event listner and perform desired actrions when clidked
    replyButton.addEventListener('click', () => {
      document.querySelector('#details-mails').style.display = 'none';
      document.querySelector('#compose-recipients').value = `${mail.sender}`;
      if(!mail.subject.startsWith('Re:')) {
        document.querySelector('#compose-subject').value = `Re: ${mail.subject}`;
      }
      else {
        document.querySelector('#compose-subject').value = `${mail.subject}`;
      }
      document.querySelector('#compose-body').value = `On ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`; 
      document.querySelector('#compose-view').style.display = 'block';
      // Move the cursor to the next line
      const composeBody = document.querySelector('#compose-body');
      const mailText = `On ${mail.timestamp} ${mail.sender} wrote:\n ${mail.body}\n`;   
      composeBody.value = mailText;     
      // Set focus to the compose body textarea
      composeBody.focus();    
      // Move the cursor to the end of the text
      composeBody.setSelectionRange(mailText.length, mailText.length);
    });
    // Empty detailed mail view div first
    document.querySelector('#details-mails').innerHTML = '';
    // Create div for the detailed view of each mail
    const detailMailDiv = document.createElement('div');
    // Add the innerhtml to the detailed view of the mail using the sender, recipients, subject, timestamp, and body.
    detailMailDiv.innerHTML = `<strong>Sender:</strong> ${mail.sender}<br>` +
    `<strong>Subject:</strong> ${mail.subject}<br>` +
    `<strong>Time:</strong> ${mail.timestamp}<br>` + 
    `<strong>Body:</strong> ${mail.body}<br>` +
    `<strong>Recipients:</strong> ${mail.recipients}`;
    // Append the div to the details-emails div in inbox.html
    document.querySelector('#details-mails').appendChild(detailMailDiv);
    // Append button to detailed mail view div
    detailMailDiv.appendChild(replyButton);
});

  
  // Create a new div in inbox.html and style display that as block
  document.querySelector('#details-mails').style.display = 'block';
  document.querySelector('#mails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
}

// Update mail to be read
function updateReadEmail(mailId) {
  fetch(`/aliens/mails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}
// Add error handling

// Button to delete user account
document.querySelector('#delete-account').addEventListener('click', async() => {
  console.log('the function is running');
  let confirmation = confirm("Are you sure you want to delete your account?");
  //const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  if (confirmation ) 
    try {
        // Update the leaderboard without requiring a page reload
        // Need to fetch the new data with the new rankins and skill ratings and manipulated the html to updating the already loaded div
      const response = await fetch('/aliens/delete', {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // Might have to add one on the button and get it with querryselector, not sure if this works like this
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data.message);
      alert(data.message);  // Notify the user
      if (data.message.includes('successfully')) {
          window.location.href = '/aliens';  // Redirect after account deletion
      };

    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Handle errors if any
    }

  else {
    alert("Account deletion cancelled.");
  }
});


// If I want to add the abitlity to change the user's profile pic:

// Onclicking the photo run a function that gives the user the option to choose a new file
// Once the new file is chosen, run the update AJAX call to change the picture in the database
// Might have to wait for the new image to be inserted then get that image and update the model field with the PUT AJAX
document.querySelector('#change-image').addEventListener('change', event => {
  const file = event.target.files[0]; // Gets the selected file, there is only one file
  if (file) {
      const reader = new FileReader(); // Create a new FileReader object which allows for reading of the object
      reader.onload = e => { // The onload function is a event listener which triggers when the file is read successfully, the function uploads the base string so that the img can be displayed without being uploaded first 
          document.querySelector('#profile-pic').src = e.target.result; // Update the image on the profile page. This contains the base 64 string of the img which can be used directly in the html for the img to be displayed
      };
      reader.readAsDataURL(file); // Reads the file and converts the file to a base64 string for preview. This is triggered immediatley and runs asyncronusly, then when its done the onload function triggers. Have to define the onload first so that the file is not read before the onload function is defined
  }
});

document.querySelector('#confirm-update-btn').addEventListener('click', updateProfilePicture); 

async function updateProfilePicture() {
  const fileInput = document.querySelector('#change-image'); // Get the file input element
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  const userId = document.getElementById('user-id').getAttribute('data-user-id'); // Must make sure this works as it is better security than embeding in the html and retriving
  if (!fileInput.files || fileInput.files.length === 0) {
    console.error("No file selected!");
    alert("Please select a file to upload.");
    return;
}
  const file = fileInput.files[0]; // Get the selected file from the input, there could be more files hence the files[0]

  if (file) {
      const formData = new FormData(); // Create a FormData object to hold the file. Formdata object is used to encode the image file as the image file is binary and the formdata object encodes this so it can be sent as json
      formData.append('profile_picture', file); // Append the selected file to the FormData object with the name profile_picture. Creating a key and value pair to be sent to the server
      console.log(formData);
      console.log(file);
      console.log(...formData);  // Logs the contents of the FormData object

      // Log FormData content to verify the file is appended correctly
      for (const [key, value] of formData.entries()) {
        console.log(key, value);  // Should show 'profile_picture' and the file object
      }
      try {
          // Use 'await' to wait for the fetch request to complete
          // The response object holds the raw data from the servers response such as success codes and a stream of raw data
          const response = await fetch(`/aliens/player_profile/${userId}`, {
            method: 'PUT',  // Send the request using PUT (could be POST)
            body: formData,  // Attach the FormData object containing the image
            headers: {
                'X-CSRFToken': csrfToken,  // Add the CSRF token for protection
            },
          });

          const data = await response.json(); // Wait for the raw response data to be converted to JSON
          console.log(data);

          if (data.success) { // If the server confirms success
              alert('Profile picture updated successfully!');
              document.getElementById('profile-pic').src = URL.createObjectURL(file); // Update the image on the page without reloading
          } else {
              alert('Error updating profile picture.'); // Show an error message if the update failed
              console.log(data.message);
          }

      } catch (error) {
          console.error('Error:', error); // Handle any errors that occur during the fetch
      }
  }
}




