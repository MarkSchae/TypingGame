# Typing Space Invaders

## Project Overview

Typing Space Invaders is a browser-based game that combines fast typing with classic space shooter mechanics. Players control a ship that fires bullets at descending alien ships by typing letters accurately. Mistyped letters prevent the ship from firing until corrected. The game starts slowly for beginners, gradually increasing in difficulty by accelerating enemy ships and altering their spawn positions. Players have 20 lives and face a boss level, with optional ship upgrades unlocked after reaching certain milestones. The game tracks player statistics during each session, which are stored in the backend database to calculate leaderboard rankings and lifetime stats.

The front-end is written in JavaScript, enabling dynamic interactions without page reloads. Players can view real-time leaderboards, send messages, and comment on the leaderboard, creating a social gaming experience. The project was originally conceived as a simplified Steam-style launcher, blending gaming, user interactivity, and real-time communication.

## Distinctiveness and Complexity

This project stands out due to its advanced use of JavaScript and integration of complex backend functionality. Key features include:

* **Dynamic game mechanics**: Real-time typing-to-shoot gameplay, enemy movement, level progression, and ship upgrades.
* **Player statistics tracking**: Session stats are calculated on the front end and persisted in the backend database, forming the basis of leaderboard rankings.
* **Leaderboard and polling**: Leaderboard data is updated every 60 seconds via polling, ensuring players always see the latest rankings without reloading the page.
* **Custom Django user model**: Includes profile picture, gamertag, and country. Users can update their profile pictures using PUT requests, with live previews handled via a temporary file upload workflow.
* **Real-time communication**: WebSocket-based chat allows users to interact in lobbies, fostering a community hub experience.
* **Third-party API integration**: Weather data is displayed to inform players when it’s ideal to play indoors.
* **Enhanced security**: Account deletion, input validation, and safe handling of uploads and user data.

Overall, the project demonstrates proficiency in JavaScript-driven interactivity, database integration, and real-time communication within a web application.

## Project Structure

* **game.js**: Core game logic — rendering, gameplay loop, bullet mechanics, level progression, ship upgrades, and player stats tracking.

* **gamestyle.css**: Basic styling leveraging Bootstrap.

* **stats.js**: Handles AJAX requests for leaderboard updates, comment submissions, player messaging, and account management.

* **HTML templates**:

  * `game.html` – gameplay interface
  * `index.html` – landing page
  * `leaderboard.html` – real-time rankings
  * `profile.html` – user profiles
  * `stats.html` – lifetime player statistics
  * `login.html` / `register.html` – authentication
  * `layout.html` – shared layout and navigation

* **Django backend**:

  * `models.py` – stores user data, game stats, leaderboard info, comments, and messages
  * `views.py` – handles request routing, database interactions, and WebSocket communication
  * `urls.py` – maps URLs to views

## Installation and Running

1. Install dependencies: `Pillow`, `Daphne`, `redis_channels`
2. Start Redis (required for WebSocket functionality):

   ```bash
   docker run --rm -p 6379:6379 redis:7
   ```
3. Run the Django server:

   ```bash
   python3 manage.py runserver
   ```

## Future Plans

* Host the game online with real-time streaming of gameplay.
* Expand social features: friend management, private interactions, and enhanced profile metrics.
* Add more games, including multiplayer options.
* Integrate voice feedback for typing, new levels, and interactive stats visualizations.
* Develop parental controls, user behavior scoring, and in-app shop functionality.
* Improve UX with custom error pages, achievements, and gamified stats.
