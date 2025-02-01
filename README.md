# gwent-classic
![cover](https://user-images.githubusercontent.com/26311830/116256903-f1599b00-a7b6-11eb-84a1-16dcb5c9bfc6.jpg)

This is a **multiplayer-only** fork using node.js for the server.

## How to run server
These are the instructions to run a server, if you're just going to connect, ignore this part.

#### Install dependencies
This project requires [Node.js](https://nodejs.org/en/download) to run and install dependencies.<br> After having Node.js installed open a command terminal in the project's root (where index.html is located, in windows 11 right clicking should display an option to open in terminal) and run `npm install`

#### Run the server
Open a command terminal in the project's root and run `node server.js`. After a few seconds you should see a message "## Server is up and running ##", if you don't see this message something went wrong, make sure you have node.js intalled.

## How to play multiplayer
Either  you or a friend must host the server. I cannot afford to run one for everyone but there are some very easy options out there such as [Glitch](https://glitch.com), [Fly.io](https://fly.io/docs/js/), [Render](https://render.com/) and many others. 

#### Connect clients to the same server
in `gwent.js` look for `const socket = new WebSocket('ws://localhost:8080');`. This address should be common between you and your friends, change it to the server's address. (Localhost means it's running in your machine only and will not connect to your friends)

## Rules
The game is played in the same way as the original. The player aims to win two of three rounds, where victory within a given round is determined by whoever scores the most points. 

#### Cards and Points
Points are obtained by placing down unit cards, each with their corresponding values. Some unit cards have special effects as denoted by a symbol on their left side. The cards and their effects can be examined by selecting them or the row they have been palced on. The game also includes a nubmer of special cards that apply effects like negative weather conditions or bosting card points when played.

#### Turns
A turn consists of playing a single card. Your opponent then does the same until either one of you passes. At this point the remaining player can continue to place cards until they decide to pass. When both players have passed the round is ended. In addition of placing cards, they player may also activate their leader ability by clicking on their leader if it is available to them.

#### Factions
The faction you pick will affect your game in three ways. It limits the specific cards you can use to neutral cards, special cards, and the unit cards in your faction. This includes the leader card that you can pick and the corresponding leader ability. Each faction also has a special effect that is displayed when selecting a faction and at the top of the customization screen for the currently selected faction.

## Features
#### All cards from the TW3 + DLC
All cards from the base games and DLC can be used by you and the AI. This includes the additions from Hearts of Stone and Skellige as a playable deck from Blood and Wine. The total count of cards available corresponds to the number you can find in the original game.

#### Faithful to the original minigame
This remake aims to resemble the orignal minigame as closely as possible from the font to the UI layout and notifications. Some changes have been made in the form of buttons to toggle the music and pass your current turn. The deck customization screen also includes buttons to upload and download decks.

#### AI opponent
Ai has been completely disabled in this fork. To play against AI use the [original project](https://github.com/asundr/gwent-classic).

#### Customize, save and upload decks
You can select a faction to play as at the top of the screen and then add and remove cards from your deck by clicking on the cards in either scroll-down menu. You can also pick a leader card by selecting the current leader and scrolling through the options for that faction. At the top of the screen there are buttons to upload and download decks to play with. These are stored in json format and are checked to see if they comply with their assigned faction and maximum card counts.

#### Music tracks
There are no music tracks in this fork. I have decided to remove then because they were causing many issues and making debugging harder.
