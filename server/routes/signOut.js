/*
Developed by : Akshay Nakra
Kuldeep Suhag
Rohit Ajith Kumar
*/

/* This file is used to signout the user */
require("firebase/auth")

module.exports = (req, res) => {
    logout(res)
}

async function logout(res){
    await firebase.auth().signOut()
    res.status(200).send("logout")
}