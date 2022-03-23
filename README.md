# Embedly Cortico Example

This project is an example of the cortico embed utilizing player.js. We use a stripped down version of our embed that only displays a
button and uses or GlobalAudioContext (utilized for all LVN audio). We use the HTML5Adapter provided by player.js to allow our iframe to be modified by the parent site that is displaying it.

## Issue

While doing this integration, we ran into an issue where our embed would not run appropriately on the [player.js test site](playerjs.io/tests.htm). Upon further investigation, we kept receiving an error from google stating
`DOMException: play() failed because the user didn't interact with the document first. https://goo.gl/xX8pDD`.
This is because web browser do not allow autoplay of audio before the user interacts with the webpage. We were able to get the test to pass on Firefox, but not Chrome. However, the provided iframe src from player.js passes on Chrome. We are unable to tell why this occurs, but this application shows that their test src has the same issues when tested on a different site.

## Running our Application

`yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The app should open and provide two links. The first link (Cortico) is the cortico url in an iframe. The second link is the player.js url in an iframe. The page runs a testsuite on load. in the Chrome browser, when clicking through the link, we see that both pass the test. When refreshing while on one of the pages, we get the Chrome play error.
