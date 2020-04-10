/*
  This is the landing page when user starts the app
  The user has the option to pick between signing up or signing in
*/
import { View, StyleSheet, ImageBackground, Image, Dimensions, TouchableOpacity, AppState, AsyncStorage } from 'react-native';
import { Text } from 'native-base';
import doc from '../../Images/doc.gif'
import React from 'react';
import { connect } from 'react-redux'
import { Location, TaskManager } from 'expo';
import axios from "axios";
let history;
const { height: HEIGHT } = Dimensions.get('window')

class Start extends React.Component {
    constructor(props, { }) {
        super(props);
        this.signup = this.signup.bind(this);
        this.signin = this.signin.bind(this);
    }

    async componentDidMount() {
        history = this.props.history;
        await Location.startLocationUpdatesAsync('location', {
            accuracy: Location.Accuracy.BestForNavigation
        });
    }

    // Called to navigate to the Sign Up Page
    signup() {
        this.props.history.push({
            pathname: "/signUp"
        })
    }

    // Called to navigate to the Sign In Page
    signin() {
        this.props.history.push({
            pathname: "/signIn"
        })
    }

    render() {
        return (
            <ImageBackground backgroundColor='white' style={styles.backgroundcontainer}>
                <View style={styles.logocontainer}>
                    <Image source={doc} style={styles.image} />
                </View>
                <View>
                    <Text style={styles.text} h3>
                        Fast Food Visit Counter
                    </Text>
                </View>
                <View>
                    <TouchableOpacity style={styles.btnlogin} onPress={this.signin}>
                        <Text style={styles.text}>SignIn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnlogin} onPress={this.signup}>
                        <Text style={styles.text}>Register</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }
}
const styles = StyleSheet.create({
    backgroundcontainer: {
        flex: 1,
        width: null,
        height: HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    image: {
        width: 290,
        height: HEIGHT - 190,
        borderRadius: 130
    },
    btnlogin: {
        width: 100,
        height: 45,
        borderRadius: 45,
        backgroundColor: "#432577",
        justifyContent: 'center',
        marginTop: 20

    },
    text: {
        color: "rgb(36,133,202)",
        fontSize: 16,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold'
    }
});

// Invoked to check if the user is currently logged in
async function checkUser(locations) {
    const uid = await AsyncStorage.getItem('@uid')
    let path = history.location.pathname.slice(1);
    if (uid !== null) {
        if ((AppState.currentState === 'background' && uid !== "none") ||
            (AppState.currentState === 'active' && (path === 'settings' || path === 'viewProfile'))) {
            axios.post("/userLocation", {
                    latitude: locations[0].coords.latitude,
                    longitude: locations[0].coords.longitude,
                    uid: uid
            }).then((response) => {

            })
        }
    }

}

// Invoked to check users location in the background
TaskManager.defineTask('location', ({ data, error }) => {
    if (error) {
        console.log(error.message)
    }
    if (data) {
        const { locations } = data;
        checkUser(locations);
    }
});

export default connect()(Start)