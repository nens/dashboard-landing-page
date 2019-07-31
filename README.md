This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  
Under the header "Create React App" is all information regarding "Create React App".
Above that is all information specific to this repo.

## Install

### `npm install`

## Run for Dev

### `./start`

Will prompt for username password and use "npm start" to run the app.  
Or run "npm start" directly to test unauthorized:  

### `npm start`  

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

## Proxy

Running the app in dev mode will proxy to staging (nxt3.staging.lizard.net).  
This can be configured in "./config/webpackDevServer.config.js".  

## Production build

### `npm run build`

Will run a production build.  
The full build will be in the "./build" folder.  
A .zip of the complete build will be at "./zip/dashboard-landing-page.zip".  
The .zip file will be used for the release script.  

## Release 

### `npm run release`   

Will use the "release-it"  library to release to github.  

## Create React App

Below link is about the "Create React App" tool used to create this app.  
Some of the information is no longer applicable.  
Instead use the information above (in this readme).  
Also please note that in order to get the proxy working with authentication the app is already "Ejected".  
See [README_CREATE_REACT_APP.md](./README_CREATE_REACT_APP.md)   

