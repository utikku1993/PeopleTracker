/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is checking if the user is in Restaurant or in Park for more than 5 mins or 20 mins respectively,
if yes then the count is increased and the name of restaurant/park is stored along with time */
require('firebase/database')
require('firebase/auth')
var moment = require('moment')
var bleach = require('bleach');
firebaseInstance = require('firebase/app')
var category;
var place;
var visitTime;

module.exports = (req, res) => {
    visitTime = new moment().parseZone("Australia/Melbourne").format();
    if (req.body) {
        checkUser(req.body, res)
    }
}


/* This function checks if we get uid from client */
function checkUser(userData, res){
    if(userData.uid){
        inKFCorPark(bleach.sanitize(userData.uid), userData.latitude, userData.longitude, res)
    }else{
        res.status(200).send("No user");
        return;
    }
}

/* This function will check if the location of user matches with any restaurant +- 0.0001 */
async function inKFCorPark(userID, userlatitude, userLongtitude, res) {
    var uid = userID;
    await firebase.database().ref("Restaurants").once('value', async function (snapshot) {
        snapshot.forEach(function (child) {
            var restaurant = child.val();
            if ((Math.abs(userlatitude.toFixed(4) - restaurant.lat.toFixed(4)) <= 0.0001) && (Math.abs(userLongtitude.toFixed(4) - restaurant.long.toFixed(4)) <= 0.0001)) {
                category = "Rest"
                place = restaurant.place;
                timeSpentValidation(uid)
            }
        });
    });

/* This function will check if the location of user matches with any parks +- 0.005 on latitide and 0.002 on longitude */
    await firebase.database().ref("Parks").once('value', async function (snapshot) {
        snapshot.forEach(function (child) {
            var park = child.val();
            if ((Math.abs(userlatitude.toFixed(4) - park.lat.toFixed(4)) <= 0.005) && (Math.abs(userLongtitude.toFixed(4) - park.long.toFixed(4)) <= 0.002)) {
                category = "Parks"
                place = park.place
                timeSpentValidation(uid)
            }
        });
    });

    var restaurantCount, parkCount;
    var sen;
/* This function will send back the updated count values to client */
    await firebase.database().ref("users").child(uid).once("value", function (snapshot) {
        sen = {
            restaurantCount: snapshot.val().restaurantCount,
            parkCount: snapshot.val().parkCount
        }
        res.status(200).send(sen);
    });
}

/* This function will check if the user has previous Visited time and place set, if not we set it. If its already
set, we get the previous time and compare with the current time to understand the time spent */
async function timeSpentValidation(uid) {
    await firebase.database().ref("users").child(uid).once("value", function (childSnapshot) {
        if (childSnapshot.hasChild('previousTime') == false || childSnapshot.val().previousTime == 0) {
            firebaseInstance.database().ref('users').child(uid).update({
                previousTime: visitTime,
                previousPlace: place
            });
        }
        else if (childSnapshot.val().previousPlace != place) {
            firebaseInstance.database().ref('users').child(uid).update({
                previousTime: visitTime,
                previousPlace: place
            });
        }
        else {
            var currentTime = new moment().parseZone("Australia/Melbourne")
            var vistedTime = moment(childSnapshot.val().previousTime);
            currentTime = moment(visitTime);
            visitedPlace = childSnapshot.val().previousPlace
            const diff = currentTime.diff(vistedTime);
            const diffDuration = moment.duration(diff);
            if ((Math.abs(diffDuration.minutes()) >= 5) && (visitedPlace === place)) {
                updateValues(vistedTime , uid);
            }
        }
    });
}

/*This function will call respective function based on the category i.e restaurant or park */
function updateValues(vistedTime, uid) {
    switch (category) {
        case "Parks": compareParkPlaceTime(vistedTime, uid);
            break;

        case "Rest": compareRestaurantPlaceTime(vistedTime, uid);
            break
    }
}

/* This function will compare the last visited restaurant time and update only if there is 20 mins extra or
an hour change in previous and current time. This is done to make sure multiple counter are not increased for 
same restaurant (every 5 mins) */
async function compareRestaurantPlaceTime(vistedTime, uid) {
    await firebaseInstance.database().ref("users").child(uid).once("value", function (childSnapshot) {
        if (childSnapshot.hasChild('historyRest') == false) {
            updateRestaurantCount(vistedTime, uid);
        }
        else {
            firebaseInstance.database().ref("users").child(uid).child('historyRest').orderByKey().limitToLast(1).once('value', function (childSnapshot) {
                var data = childSnapshot.val();
                var visitedTimeStamp;
                var lastVisitedPlace;
                for (var key in data) {
                    visitedTimeStamp = key;
                    lastVisitedPlace = data[key]["place"]
                }
                var historyTime = moment(visitedTimeStamp);
                var calledTime = moment(visitTime);
                const diff = historyTime.diff(calledTime);
                const diffDuration = moment.duration(diff);

                if ((Math.abs(diffDuration.minutes()) >= 20 && (diffDuration.hours()) == 0)
                    || diffDuration.hours > 0 || lastVisitedPlace !== place)
                 {
                    updateRestaurantCount(vistedTime, uid);
                }
            });
        }
    });
}

/* This function is same as the compareRestPlace time, with slight changes. As here it is updated every 4 hours gap
in the same day */
async function compareParkPlaceTime(vistedTime, uid) {
    await firebaseInstance.database().ref("users").child(uid).once("value", function (childSnapshot) {
        if (childSnapshot.hasChild('historyPark') == false) {
            updateParkCount(vistedTime, uid);
        }
        else {
            firebaseInstance.database().ref("users").child(uid).child('historyPark').orderByKey().limitToLast(1).once('value', function (childSnapshot) {
                var data = childSnapshot.val();
                var visitedTimeStamp;
                var lastVisitedPlace;
                for (var key in data) {
                    visitedTimeStamp = key;
                    lastVisitedPlace = data[key]["place"]
                }
                var historyTime = moment(visitedTimeStamp);
                var calledTime = moment(visitTime);
                const diff = historyTime.diff(calledTime);
                const diffDuration = moment.duration(diff);
                if ((Math.abs(diffDuration.hours()) > 4)) {
                    updateParkCount(vistedTime, uid);
                }
            });
        }
    });
}

/* This function will update the count as well as the place for a Restaurant and set previous place and time
to default values  */
async function updateRestaurantCount(vistedTime, uid) {
    let count = await getCount(uid , true)
    var updateCount = firebaseInstance.database().ref("users");
    count = count + 1;
    updateCount.child(uid).update({ restaurantCount: count, previousPlace: "null" ,  previousTime: 0 });
    updateCount.child(uid).child("historyRest").child(vistedTime.format()).set({
        place: visitedPlace
    });
}

/* This function will update the count as well as the place for a Park and set previous place and time
to default values */
async function updateParkCount(vistedTime, uid) {
    let count = await getCount(uid, false)
    var updateCount = firebaseInstance.database().ref("users");
    count = count + 1;
    updateCount.child(uid).update({ parkCount: count, previousPlace: "null",  previousTime: 0 });
    updateCount.child(uid).child("historyPark").child(vistedTime.format()).set({
        place: place
    });
}

/* This function will get the current count of Restaurant or Park from firebase */
async function getCount(uid, isRestaurant) {
    var updateCount = firebaseInstance.database().ref("users");
    await updateCount.child(uid).once("value", function (snapshot) {
        data = snapshot.val();
    });
    if(isRestaurant){
        return parseInt(data.restaurantCount);
    }else{
        return parseInt(data.parkCount);
    }
    
}