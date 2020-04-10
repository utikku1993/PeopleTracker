/*
  This is the main sign up page
*/
import React from 'react';
import { Text } from 'native-base';
import { Button } from 'react-native-elements';
import { View, StyleSheet, ImageBackground, Image, TextInput, Dimensions, Keyboard, KeyboardAvoidingView, BackHandler } from 'react-native';
import { addUser } from '../../redux/actions/index'
import { connect } from 'react-redux'
import image from '../../Images/back.jpg'
import logo from '../../Images/logo.gif'
import Toast, { DURATION } from 'react-native-easy-toast'
const { width: WIDTH } = Dimensions.get('window')

class SignUp extends React.Component {
    constructor(props, { }) {
        super(props);
        this.state = {
            email: "",
            patient: "",
            password: "",
            confirmPassword: "",
            errors: ""
        };
        this.signupUser = this.signupUser.bind(this);
        this.validateCredentials = this.validateCredentials.bind(this);
        this.login = this.login.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handlePatientChange = this.handlePatientChange.bind(this);
        this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
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

    // Invoked to validate the users sign up credentials
    validateCredentials() {
        let valid = false;
        if (!(this.state.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))) {
            this.refs.toast.show("Please enter a valid email")
            valid = true;
        }
        else if (this.state.password.length < 8) {
            this.refs.toast.show("Password should be at least of 8 characters")
            valid = true;
        }
        else if (this.state.password !== this.state.confirmPassword) {
            this.refs.toast.show("Both the passwords don't match")
            valid = true;
        }
        return valid;
    }

    // Invoked to save user's credentials and redirect to profile page
    signupUser() {
        Keyboard.dismiss()
        if (!this.validateCredentials()) {
            var data = {
                id: this.state.patient,
                email: this.state.email,
                password: this.state.password
            }
            this.props.dispatch(addUser(data));
            this.props.history.push("/profile");
        }
    }

    // Invoked to navigate to the Sign In Page
    login() {
        this.props.history.push({
            pathname: "/signin"
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

    // Invoked to handle the user's confirm password
    handleConfirmPasswordChange(event) {
        let processedData = event.nativeEvent.text;
        this.setState({ confirmPassword: processedData })
    }

    // Invoked to handle the user's patient id
    handlePatientChange(event) {
        let processedData = event.nativeEvent.text;
        this.setState({ patient: processedData })
    }

    render() {
        return (
            <ImageBackground source={image} style={styles.backgroundcontainer}>
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                    <View style={styles.logocontainer}>
                        <Image source={logo} style={styles.logo} />
                    </View>
                    <View style={styles.logocontainer}>
                        <Text style={styles.logotext}>FAST FOOD VISIT COUNTER</Text>
                    </View>
                    <View style={styles.logocontainer}>
                        <Text style={styles.logotext}>Create a New Account</Text>
                    </View>
                    <View style={{ marginTop: '1%' }}>
                        <TextInput
                            style={styles.input}
                            placeholder={'Patient ID'}
                            keyboardType="numeric"
                            placeholderTextColor={'rgb(36,133,202)'}
                            underlineColorAndroid='transparent'
                            value={this.state.patient}
                            onChange={this.handlePatientChange}
                        />
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
                            value={this.state.password}
                            onChange={this.handlePasswordChange}
                            secureTextEntry={true}
                        />
                    </View>
                    <View>
                        <TextInput
                            style={styles.input}
                            placeholder={'Confirm Password'}
                            placeholderTextColor={'rgb(36,133,202)'}
                            underlineColorAndroid='transparent'
                            value={this.state.confirmPassword}
                            onChange={this.handleConfirmPasswordChange}
                            secureTextEntry={true}
                        />
                    </View>
                    <View style={styles.action}>
                        <Button title="Next" raised onPress={this.signupUser} buttonStyle={styles.nextButton}></Button>
                    </View>
                    <View style={styles.alternate}>
                        <Button title="Already Have An Account" type="outline" onPress={this.login} style={styles.loginButton}></Button>
                    </View>
                </KeyboardAvoidingView >
                <Toast ref="toast" textStyle={{ color: 'red' }} fadeOutDuration={1000} fadeInDuration={2500} />
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    backgroundcontainer: {
        flex: 1,
        width: null,
        height: null,
        justifyContent: 'center',
        alignItems: 'center'
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
    logo: {
        width: 120,
        height: 120,
        borderRadius: 130
    },
    logotext: {
        color: 'red',
        fontSize: 20,
        fontWeight: '500',
        marginTop: 10,
        opacity: 0.5
    },
    logocontainer: {
        alignItems: 'center'
    },
    text: {
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 130

    },
    nextButton: {
        backgroundColor: 'rgb(36,133,202)',
        borderRadius: 45,
        paddingLeft: 40,
        paddingRight: 40
    }
});

export default connect()(SignUp)