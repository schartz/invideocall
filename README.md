InvideoCall Simple Video Conferencing
======================

This system builds on the server example provided by [Easyrtc](https://easyrtc.com/)

Files and Folders:
------------------

 - package.json - Provides project information allowing npm to find and install required modules.
 - server.js - Server code.

 
Installing Required Modules:
----------------------------
Installation is pretty straightforward. At its very heart, its your run of the mill node app.

 - Execute `yarn install` in the root folder to install dependencies.
 - This will read the package.json file to find and install the required modules including EasyRTC, Express, and Socket.io.
 - Required modules will go into a new 'node_modules' sub-folders.


Running the Server:
-------------------

 - Type `yarn run watch` for compiling assets.
 - In an another terminal instance `sudo node server.js` to run the main application
 - This codebase contains a sample self signed OpenSSL certificate for speeding up the development process.
 
 
 Raise an issue if you are stuck. Docs and wiki are coming soon (As soon as I get time)