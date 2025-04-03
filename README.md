ReadMe file for my final project (500 words)

Explain the project (Was almost going for a steam clone)


Project is a space invaders type of game that uses typing to propel bullets from a ship and destroy approaching alien ships.
The game on the front end is written in JS. The game has levels with increasing levels of difficulty. Difficulty is increased by increasing the speed of the alien ships and changing the starting position of the new ships.
Type to shoot. If you make a mistake the ship will not shoot until you type the correct letter. Starts very slowly for beginners.
Alien ships descend from the top of the playing board, if they reach the player ship or the end of the play board without being shot down the player loses a life. You get 20 lives.
There is one boss level and after a certain level the player can choose one upgrade for their ship.
The player accumulates certain stats as they play such as the amount of bullets they shoot each round that they play. The stats are stored on the front end in the js file functionality. When the game ends the stats are sent to the backend to be permanently stored.
All player stats are stored in the database on the backend. Theses stats are used to calculate which player that has played the game had the best round and adds their name to the leaderboard.
The leaderboard is on a page that polls so it will update every 60s whilst viewing the leaderboard.
The player stats are viewable in their stats page to view their lifetime game stats.
Players can also send each other messages as well as comment on the leaderboard.


Explain how the project is distinct and complex
DISTINCTIVNESS AND COMPLEXITY 

I used JS much more than the other projects. I built a simple game within JS. I wrote code that tracks the users stats whilst playing the game and saves the stats in a database, the stats update after each playthrough. I created a leaderboard page which polls the database and updates at regular intervals so that players will always see a up to date ranking. I created a profile page which includes a custom user model. I had to change the Django default user settings to allow me to have a custom user model which allowed for a more engaging user experience. One of the custom user fields is a profile pic which I also allow the user to change their profile pic. I had to learn how to deal with images in Django and how to upload to a media folder. I had to again bypass the Django default settings as Django only deals with files from a POST method and not a PUT method. The image is shown as a preview first then the user can save the profile pic to the database. The other distinct and complex aspect of my project is that of a live chat feature for players who want to chat to each other about a certain game like a community hub. I also built a API request to a third party site in order to view the weather at certain intervals and days so that gamers could see when it is best to stay indoors and play their favorite game.

Game written in JS. Page polling. Many of the features of the project are designed to occur without a page reload. formulae to calculate the leaderboard positions.
I intended it to be a simplified clone of a game launcher like Steam. A user has to know the username/be friends with another user in order to send them a message.

As I progressed through the development of my project I realized that I was becoming more interested in tyring to create a Steam like clone which would offer a dynamic user experience. My project is a mix of gaming, user interactivity, and real-time communication. My project stands out due to its combination of advanced features, significantly increased use of JS, and the challenges I faced while integrating advanced functionalities.

I built a simple space invaders type game in JavaScript that combined my love for gaming and typing very fast. The type of project I made showcases my ability to handle dynamic frontend interactions.
The game tracks user stats during each playthrough, saving and updating this data in a database after every session. This required designing backend logic to persist and manage player performance metrics effectively including a simple formulae to determine a ranking score for the leaderboard.
I implemented a real-time leaderboard page that polls the database at regular intervals, ensuring players always see up-to-date rankings without needing to reload the page.

I created a custom user model in Django, deviating from the default settings to include fields like a profile picture, gamertag, and country of origin/home, which enhances user engagement.
The profile picture feature required me to learn and manage file handling in Django, including configuring a media folder for uploads.
I had to bypass the Django default settings manually handling the PUT request to change the profile picture for the user as Django only deals with files from a POST method and not a PUT method. I had to use the temporary file handler and multi part parser in order to show the new picture as a preview first then the user can save the profile pic to the database via a PUT request.

I developed a live chat feature using WebSockets, allowing players to communicate in real-time. This functionality creates a "community hub" where users can discuss games, adding a social dimension.
The chat system is designed so that users how need help or would like a person to join them in a multiplayer game can do so by entering the same game lobby and chatting to one another.

I also built a API request to a third party site in order for users to view the weather at certain intervals and days so that gamers could see when it is best to stay indoors and play their favorite game.

I added a delete function so that users can delete their account in its entirety. I also added much more security checks on both the front and back-end, I have become much more conscious of how to prevent a security breach at least on a surface level in Django.


Describe what is in each file in the project and how to run the project

install pillow
install daphne
install reddis_channels

docker run --rm -p 6379:6379 redis:7(required for websocket functionality) 
python3 manage.py runserver

game.js: This file contains the JS code that draws the game sprites and functions that run the game loop. The JS functions in this file create and shoot the bullets, destroy and remove the alien ships, move to the next level, 
increase the speed and change position of the alien ships, keep track of the players stats and send them to the backend when the game is over, run the animations, positioning of the different sprites, adding upgrades to the players ship, generating text for the player to type in order to shoot the bullets, increasing the speed at which bullets are fired and the players ship is moving side to side based on how fast the player is typing.

gamestyle.css: This file contains the styling choices for the website which are very basic and make use of the bootstrap library.

stats.js: This file contains the JS functions and AJAX calls that update the leaderboard based on new stats of each player that has played the game, updates the comments on the leaderboard without requiring a reload and sending the new comment to  the database, polls the html page so that any new stats of new game runs can be used to update the leaderboard, normal mailing system to send messages to players if you know their gamertag/are friends of yours, delete your account.

All the html files: game.html is the html file that displays the typing space invaders style game for the user to play.
The index.html file is the landing page for each unregistered user(still working on a few things here like letting a person play the game but not save any progress because they do not have an account)

The layout.html file contains the base html that is seen on each html page like the header bar and hrefs. 

The leaderboard.html displays the leaderboard and rankings to the user. 

The stats.html file displays the users lifetime playing stats such as total kills. Still working on displaying the stats in a more interactive manner.

The profile.html displays the users profile like their name, country etc (would like to add other preferences like friends, profile photo, time spent playing each game).

The login.html file allows the user to submit their username and password to access their account.

The register.html file provides the user with a form to fill in with their preferences and password in order to create an account.

The models.py is database which stores the players profile, stats, leaderboard variables, etc. User model with all the usual fields as a abstract user model but I added 3 fields (gamertag, country, and name) to better represent the person in their profile.
The stats model contains the fields that represent the users stats from the games that they have played (some fields are still in development).
The leaderboard model represents all the users rankings based on the formulae used to calculate a average performance score for each user.
The post model stores all the comments that users make on the leaderboard. 
The mail model stores all the messages that users send to each other (this is also still in development) 

urls.py: route patterns for the https requests from the user. It maps the urls to the views.

views.py: python code running on the backend to save, delete, update data in the database. Also to send data and create a communication channel between the front and backend. This file contains the logic for handling requests and returning responses. It connects the user’s request to the correct template or API response.


Plans for the future

Host the game somewhere.
Add real-time viewing so players can watch their friends play. Add a function where you can add/remove friends. Add interactivity for friends only. Add more to the profile page to allow a user to customize their experience. Add more games to play (I did make a simple multiplayer tic tac toe to further my understanding of websockets). Speech(voice) reading the words for the user to type level. More levels.
Add/remove friends. More aspects to the profile page like time spent playing each game and maybe some interesting information about how the user plays that game that the friends can see and comment on.
Delete a user but keep their sent emails and the senders gamertag. Add graphs etc for better viewing of the player stats.
More functionality for friends only. User behaviour score based on reports of bad behaviour on the site etc. Parental controls or maybe just a rule that users under the age of 18 cannot add friends without parental consent. Maybe some sort of shop and e commerce thing for in app currency.Add other features place that shows the games the users have played and certian stats/awards related to those games. Game reviews, I already have this system implemented for comments on the leaderboard. A custom error page that loads whenever there is a error so for every error it loads the same thing each time.
