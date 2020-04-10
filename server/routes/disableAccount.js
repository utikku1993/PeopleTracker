/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/


/* This file is used to delete an account from the application and firebase */
require("firebase/auth")
var admin = require('firebase-admin')
var serviceAccount = require("../adminservice.json") // Needs admin access 
var bleach = require('bleach');

var app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://computing-project-236008.firebaseio.com"
});

module.exports = (req, res) => {
    app.auth().deleteUser(bleach.sanitize(req.body.userId))
    res.status(200).send("deleted")
}
