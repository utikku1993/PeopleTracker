/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is for adding the step data to firebase for a user */
require('firebase/database')
firebase = require('firebase/app');
var bleach = require('bleach');

/* This function is for pushing the step data to database. Step data has a key as date 
and value as number of steps for that date */
module.exports = (req, res) => {
    if (req.body) {
        var ref = firebase.database().ref("StepData");
        userRef = ref.child(bleach.sanitize(req.body.uid))
        for (let i = 0; i < req.body.stepData.length; i++) {
            userRef.push(req.body.stepData[i]);
        }
        res.status(200).send("Successful");
    } else {
        res.status(403).end();
    }
};
