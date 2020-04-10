/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file will get the last saved date of Steps from the database */
require('firebase/database')
firebase = require('firebase/app');
var bleach = require('bleach');

/* This function creats the StepData reference and passed to getLastDate function */
module.exports = (req, res) => {
    if (req.body) {
        var ref = firebase.database().ref("StepData");
        userRef = ref.child(bleach.sanitize(req.body.uid))
        getLastDate(userRef , res)
    } else {
        res.status(403).end();
    }
};

/* This function will get the last Date from firebase. If no date is present, 
   it will send the last week date (6 days from the present date ) */
async function getLastDate(userRef , res){
    var date;
    await userRef.orderByKey().limitToLast(1).once('value', function (childSnapshot) {
        var row = childSnapshot.val();
        if(row === null){
            let today = new Date()
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
            let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 8, 0, 0, 0, 0)
            var lastWeekDate = start.getDate() + '-' + (start.getMonth() + 1) + '-' + start.getFullYear();
            res.status(200).send(lastWeekDate);
        }else{
            for (var key in row) {
                 date = row[key]["date"]
                res.status(200).send(date.toString());
            }
        }

    });
}