Steps to Run
1. Go to Project root and run "npm install"
2. Then go inside server folder and run "npm install"
3. Then inside the server folder, run "nodemon server.js". This starts the server for you.
4. Then go to root folder and run "expo start --android" to run the app. 

Extra Steps:
1. Allow port 5000 to be used externally. In linux you can do that using sudo ufw allow 5000/tcp
2. Go to config.js and replace the "ip address" with your own "ip".