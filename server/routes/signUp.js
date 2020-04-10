/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is written to signup a user. The user is added to authentication as well as user details are added
in database */
require('firebase/auth')
require('firebase/database')
require('firebase/firestore');
require('firebase/storage');
var firebaseApp = require('../server');
var bleach = require('bleach');
global.XMLHttpRequest = require("xhr2");

/* This function will send the email and password to authentication and get a user id back */
module.exports = (req, res) => {
  const timeOut = 500;
  setTimeout((function () {
    if (req.body) {
      var email = bleach.sanitize(req.body.email)
      var password = bleach.sanitize(req.body.password)

      firebaseApp.firebaseApp.auth().createUserWithEmailAndPassword(email, password)
        .then(function (user) {
          setUser(req, res, user.user.uid)
        })
        .catch(function (err) {
          if (err.code == 'auth/email-already-in-use') {
            res.status(400).send(err);
          }
        })
    }
  }), timeOut);
}

/* This function will set all the details of user in the database and send back the details as well to store in
redux */

function setUser(req, res, uid) {
  var firebaseStorage = firebase.storage().ref();
  var metadata = {contentType: 'image/jpeg'};
  if (uid) {
    let userData = {
      name: bleach.sanitize(req.body.name),
      email: bleach.sanitize(req.body.email),
      patientId: bleach.sanitize(req.body.patientId),
      doctorId: bleach.sanitize(req.body.doctorId),
      height: bleach.sanitize(req.body.height),
      weight: bleach.sanitize(req.body.weight),
      restaurantCount: 0,
      parkCount: 0,
      previousTime: null,
    }
    firebase.database().ref('users/' + uid).set({
      ...userData
    });
    if (req.body.image != null) {
      firebaseStorage.child(uid).putString(req.body.image, 'raw', metadata).then(function () {
      });
    }
    userData.image =  bleach.sanitize(req.body.image);
    userData.userID = bleach.sanitize(uid);
    res.status(200).send(userData);
  }
  else {
    res.status(400).send("No user found");
  }
}