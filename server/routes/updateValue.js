/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/*   This file is for updating values in the application such as height, weight, patient ID, doctor ID and 
 current goal */
require('firebase/database')
require('firebase/auth')
firebase = require('firebase/app');
var bleach = require('bleach');

module.exports = (req, res) => {
    if (req.body) {
        updateValue(bleach.sanitize(req.body.userId),bleach.sanitize(req.body.updateValue), req.body.label, res);
    }
}
/* This function gets true if the value is updated or false if not */
async function updateValue(uid, updatedValue, label, res){
        if (uid) {
            updated = await databaseUpdate(uid, updatedValue, label)
            res.status(200).send("updated");
        }else{
            res.status(400).send("No user");
        }  
}
/* This function updates the database with the new value */
async function databaseUpdate(uid, updateValue, label) {
    switch (label) {
        case "height":
            await firebase.database().ref('users').child(uid).update({
                height: updateValue
            })
            break;
        case "weight":
            await firebase.database().ref('users').child(uid).update({
                weight: updateValue
            })
            break;
        case "currentGoal":
            await firebase.database().ref('users').child(uid).update({
                currentGoal: updateValue
            })
            break;
        case "patient":
            await firebase.database().ref('users').child(uid).update({
                patientId: updateValue
            })
            break;
        case "doctor":
            await firebase.database().ref('users').child(uid).update({
                doctorId: updateValue
            })
            break;
    }
    return true;
}