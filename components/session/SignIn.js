/*
  This is the main sign in page
*/
import React from 'react';
import { Text } from 'native-base';
import { Button } from 'react-native-elements';
import { View, StyleSheet,AsyncStorage, ImageBackground, Image, Dimensions, 
    TextInput, BackHandler, KeyboardAvoidingView, Keyboard } from 'react-native';
import axios from "axios";
import { userData } from '../../redux/actions/index'
import { connect } from 'react-redux'
import image from '../../Images/back.jpg' 
import logo from '../../Images/logo.gif'
import Toast from 'react-native-easy-toast'
import AnimatedLoader from "react-native-animated-loader";

const { width: WIDTH } = Dimensions.get('window')
class SignIn extends React.Component {
    constructor(props, { }) {
        super(props);
        this.state = {
            email: "",
            password: "",
            errors: "",
            visible: false
        };
        this.signinUser = this.signinUser.bind(this);
        this.validateCredentials = this.validateCredentials.bind(this);
        this.signup = this.signup.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
    }

    componentWillMount = async () => {
        try {
            const username = await AsyncStorage.getItem('@username')
            const password = await AsyncStorage.getItem('@password')
            if (username !== null && password !== null) {
                this.signinUser(true, username, password);
            }
        } catch (e) {
            // error reading value
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    // Binds 'go back' action to hardware back button press
    handleBackPress = () => {
        this.props.history.goBack();
        return true;
    }

    // Invoked to validate the user's email and password
    validateCredentials() {
        Keyboard.dismiss();
        this.setState({ errors: "" });
        let valid = false;
        if (!(this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))) {
            this.refs.toast.show("Please enter a valid email")
        }
        else if (this.state.password.length < 8) {
            this.refs.toast.show("Password should be at least of 8 characters")
        } else {
            this.signinUser();
        }
    }

    // Invoked to store user's credentials in the App Storage for automatic login
    setUserDetail = async (response) => {
        const username = await AsyncStorage.getItem('@username')
        const password = await AsyncStorage.getItem('@password')
        const userId = await AsyncStorage.getItem('@uid');
        if(userId === null){
            await AsyncStorage.setItem("@uid", response.data.userID)
        }
        this.setState({visible: false})
        if (username !== null && password !== null) {
            this.props.dispatch(userData(response.data));
            this.props.history.push("/map");
        }else{
            const username = ["@username", this.state.email]
            const password = ["@password", this.state.password]
            var that = this;
            await AsyncStorage.multiSet([username, password], function () {
                that.props.dispatch(userData(response.data));
                that.props.history.push("/map");
            })
        }    
    }

    // Invoked to send user's data to the server for logging in
    signinUser(stored, username, password)  {
        Keyboard.dismiss()
        this.setState({visible: true})
        let that = this
        axios.post("/signIn", {
            email: stored ? username : this.state.email,
            password: stored ? password : this.state.password
        }).then((response) => {
            this.setUserDetail(response);
        }).catch((error) => {
            console.log("error")
            that.setState({ visible: false })
            this.refs.toast.show(error.response.data.message)
            AsyncStorage.clear();
        });
    }

    // Invoked to navigate to the Sign Up Page
    signup() {
        this.props.history.push({
            pathname: "/signup"
        })
    }

    // Invoked to handle the user's email
    handleEmailChange(event) {
        let processedData = event.nativeEvent.text;
        this.setState({ email: processedData })
    }

    // Invoked to handle the user's password
    handlePasswordChange(event) {
        let processedData = event.nativeEvent.text;
        this.setState({ password: processedData })
    }

    render() {
        return (
            <ImageBackground source = {image} style={styles.backgroundcontainer}>
                <AnimatedLoader
                    visible={this.state.visible}
                    overlayColor="rgba(255,255,255,1)"
                    source={require("../../Images/loader.json")}
                    animationStyle={styles.lottie}
                    speed={1}
                />
                 <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <View style={styles.logocontainer}>
                        <Image source={logo} style={styles.logo}/> 
                    </View>
                    <View style={styles.logocontainer}>
                        <Text style={styles.logotext}>FAST FOOD VISIT COUNTER</Text>
                    </View>
                    <View style={styles.logocontainer}>
                        <Text style={styles.logotext}>Sign In</Text>
                    </View>
                    <View>
                        <TextInput 
                            style={styles.input}
                            placeholder={'Email'}
                            placeholderTextColor={'rgb(36,133,202)'}
                            underlineColorAndroid='transparent'
                            value={this.state.email}
                            onChange={this.handleEmailChange}
                        />
                    </View>
                    <View>
                        <TextInput 
                                style={styles.input}
                                placeholder={'Password'}
                                placeholderTextColor={'rgb(36,133,202)'}
                                underlineColorAndroid='transparent'
                                secureTextEntry={true} 
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                            />
                    </View>
                    <View style={styles.action}>
                        <Button title="Login" raised onPress={this.validateCredentials} buttonStyle={styles.nextButton}></Button>
                    </View>
                    <View style={styles.alternate}>
                        <Button title="New User" type="outline" onPress={this.signup}></Button>
                    </View>
                </KeyboardAvoidingView>
                <Toast ref="toast" textStyle={{ color: 'red' }} fadeOutDuration={1000} fadeInDuration={2500} />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    backgroundcontainer:{
        flex: 1,
        width: null,
        height: null,
        justifyContent: 'center',
        alignItems: 'center'
    },
    logocontainer:{
        alignItems: 'center'
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 130
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        height: '100%'
    },
    action: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '2%',
        marginTop: '3%'
    },
    alternate: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    logotext:{
          color: 'red',
          fontSize: 20,
          fontWeight: '500',
          marginTop: 10,
          opacity: 0.5
    },
    card: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: '5%',
        marginRight: '5%',
        maxWidth: '100%'
    },
    input: {
        width: WIDTH - 55,
        height: 45,
        borderRadius: 45,
        fontSize: 16,
        paddingLeft: 45,
        backgroundColor: 'rgb(255,255,255)',
        color: 'rgb(36,133,202)',
        marginHorizontal: 25,
        marginBottom: '2%'
    },
    nextButton: {
        backgroundColor: 'rgb(36,133,202)',
        borderRadius: 45,
        paddingLeft: 40,
        paddingRight: 40
    },
    lottie: {
        width: 400,
        height: 400
    }
});

export default connect()(SignIn)
