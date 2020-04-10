/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is used for getting the history of restaurant /park visited by a user */
require('firebase/database');
require('firebase/auth');
var bleach = require('bleach');
var user = firebase.database().ref("users");
module.exports = (req, res) => {
    if (req.body) {
        getHistory(req.body.history, bleach.sanitize(req.body.uid), res)
    }
}

async function getHistory(isPark, uid, res) {
    if (uid) {
        historyisPresent = await isHistory(uid, isPark);
        if (historyisPresent) {
            res.status(200).send(await getData(uid, isPark))
        } else {
            res.status(200).send("No data")
        }
    }
}

/* This function checks if the user has history for the restaurant or park */
async function isHistory(uid, isPark) {
    let place = isPark ? 'historyPark' : 'historyRest'
    let isPresent
    await firebase.database().ref("users").child(uid).on("value", function (snapshot) {
        if (snapshot.hasChild(place)) {
            isPresent = true;
        } else {
            isPresent = false;
        }
    });
    return isPresent;
}

/*This function will get the history from firebase if present */
async function getData(uid, isPark) {
    var history = []
    let place = isPark ? 'historyPark' : 'historyRest'
    await user.child(uid).child(place).orderByKey().on('value', function (childSnapshot) {
        data = childSnapshot.val();
        for (var key in data) {
            let value = {
                histimestamp: key,
                histplace: data[key]["place"]
            }
            history.push(value);
        }
    });
    return history;
}
