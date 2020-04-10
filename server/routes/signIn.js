/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is for SignIn and for sending the user details to the user */
require('firebase/auth')
require('firebase/database')
require('firebase/firestore');
require('firebase/storage');
const fetch = require('node-fetch');
var fire = require('../server');
var firebaseStorage = firebase.storage().ref();
var bleach = require('bleach');

/* This function will signin the user and get the image of the user from firebase storage if present */
module.exports = (req, res) => {
  const timeOut = 500;
  setTimeout((function () {
    if (req.body) {
      var email = bleach.sanitize(req.body.email)
      var password = bleach.sanitize(req.body.password)

      fire.firebaseApp.auth().signInWithEmailAndPassword(email, password)
        .then(function (user) {
          if (user) {
            var loggedInUser = user.user
            var ref = firebase.database().ref('users');
            ref.child(loggedInUser.uid).once("value", function (childSnapshot) {
              var data = childSnapshot.val();

              firebaseStorage.child(loggedInUser.uid).getDownloadURL().then(function (url) {
                sendUserData(url, data, res, loggedInUser.uid);
              }).catch(function (error) {
                sendUserData(null, data, res, loggedInUser.uid);
              });
            });
          }
        }).catch(function (error) {
          console.log(error);
          res.status(400).send(error);
        });
    }
  }), timeOut);
};

/* This function will create a object containing the details of user and send it back */
async function sendUserData(url, data, res, uid) {
  if (url != null) {
    var urlFirebase = await fetch(url);
    var image = await urlFirebase.text();
  } else {
    var image = null;
  }
  let userDetails = {
    name: data.name,
    email: data.email,
    patientId: data.patientId,
    doctorId: data.doctorId,
    height: data.height,
    weight: data.weight,
    image: image,
    userID: uid,
    currentGoal: data.currentGoal,
    restaurantCount: data.restaurantCount,
    parkCount: data.parkCount
  }
  res.status(200).send(userDetails);
}
