/* This file is the entry point of server. It contains how each request is handled. 
Also each input from client is santized to secure it from xss attacks */
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const moment = require('moment-timezone')
const authentication = require('./firebaseconfig')
firebase = require('firebase/app');

exports.firebaseApp = firebase.initializeApp(authentication.config);
moment.tz.setDefault("Australia/Melbourne");

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
/* All of them are post because they contains user id being posted to them and to make it more secure */
app.post("/signUp", require("./routes/signUp"));
app.post("/signIn", require("./routes/signIn"));
app.post("/userLocation", require("./routes/processLocation"));

app.post("/getDate", require("./routes/getDate"));
app.post("/getHistory", require("./routes/getHistory"));

app.post("/updateSteps", require("./routes/updateSteps"));
app.post("/updateValue", require("./routes/updateValue"));
app.post("/signOut", require("./routes/signOut"));
app.post("/disable", require("./routes/disableAccount"));

app.listen(port, (req, res) => {
    console.log(`server listening on port: ${port}`)
 });
