/*
    This is the view profile page, where the user can see his details and his current BMI
*/
import React from 'react';
import { View, StyleSheet, BackHandler, Image, ImageBackground, Keyboard, Dimensions, ScrollView, TouchableOpacity, AsyncStorage } from 'react-native';
import { Text } from 'native-base';
import axios from "axios";
import { Header } from 'react-native-elements'
import { connect } from 'react-redux'
import { TextField } from 'react-native-material-textfield'
import DialogInput from 'react-native-dialog-input';
import Toast from 'react-native-easy-toast'
import AnimatedLoader from "react-native-animated-loader";
import AppFooter from '../footer/AppFooter'
import { setHeight, setWeight, setDoctorID, setPatientId } from '../../redux/actions/index'

const { width: WIDTH } = Dimensions.get('window')
class Profile extends React.Component {
    constructor(props, { }) {
        super(props);
        this.state = {
            showWeightModal: false,
            showHeightModal: false,
            showPatientModal: false,
            showDoctorModal: false,
            visible: false,
            bmi: 0,
            bmiString: "",
            bmiColor: "white"
        };
        this.showWeightDialog = this.showWeightDialog.bind(this);
        this.showHeightDialog = this.showHeightDialog.bind(this);
        this.showPatientDialog = this.showPatientDialog.bind(this);
        this.showDoctorDialog = this.showDoctorDialog.bind(this);
        this.calculateBMI = this.calculateBMI.bind(this);
        this.signout = this.signout.bind(this);
        this.disableAccount = this.disableAccount.bind(this);
    }

    // Invoked to show the Update Weight Dialog
    showWeightDialog() {
        this.setState({ showWeightModal: !(this.state.showWeightModal) });
    }

    // Invoked to show the Update Height Dialog
    showHeightDialog() {
        this.setState({ showHeightModal: !(this.state.showHeightModal) });
    }

    // Invoked to show the Update Patient ID Dialog
    showPatientDialog() {
        this.setState({ showPatientModal: !(this.state.showPatientModal) });
    }

    // Invoked to show the Update Doctor's ID Dialog
    showDoctorDialog() {
        this.setState({ showDoctorModal: !(this.state.showDoctorModal) });
    }

    componentDidMount() {
        this.calculateBMI(this.props.userDetails.height, this.props.userDetails.weight);
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userDetails.height != this.props.userDetails.height || prevProps.userDetails.weight != this.props.userDetails.weight) {
            this.calculateBMI(this.props.userDetails.height, this.props.userDetails.weight);
        }
    }

    // Binds 'go back' action to hardware back button press
    handleBackPress = () => {
        this.props.history.goBack();
        return true;
    }

    // Invoked to calculate the BMI and set his BMI color 
    calculateBMI(height, weight) {
        if (height > 0 && weight > 0) {
            var bmi = 10000 * (weight / ((height) * (height)));
            var bmiString, bmiColor;
            bmi = Math.round(bmi * 100) / 100
            if (bmi < 18.5) {
                bmiString = "Underweight"
                bmiColor = "#ffa300"
            } else if (bmi >= 25) {
                bmiString = "Overweight"
                bmiColor = "#ff3d00"
            } else if (bmi >= 30) {
                bmiString = "Obese"
                bmiColor = "#d31616"
            } else {
                bmiString = "Normal"
                bmiColor = "#23a00c"
            }
            this.setState({ bmi: bmi, bmiString: bmiString, bmiColor: bmiColor })
        }
    }

    // Invoked to update the user details after update operation
    updateRedux(inputText, updateValue) {
        switch (updateValue) {
            case "height":
                this.props.dispatch(setHeight(inputText))
                break;
            case "weight":
                this.props.dispatch(setWeight(inputText))
                break;
            case "patient":
                this.props.dispatch(setPatientId(inputText))
                break;
            case "doctor":
                this.props.dispatch(setDoctorID(inputText))
                break;
        }
    }

    // Invoked to update the respective entry in the database
    updateValue(inputText, updateValue) {
        switch (updateValue) {
            case "height":
                this.setState({ showHeightModal: !(this.state.showHeightModal) });
                break;
            case "weight":
                this.setState({ showWeightModal: !(this.state.showWeightModal) });
                break;
            case "patient":
                this.setState({ showPatientModal: !(this.state.showPatientModal) });
                break;
            case "doctor":
                this.setState({ showDoctorModal: !(this.state.showDoctorModal) });
                break;
        }
        if (isNaN(parseInt(inputText, 10))) {
            this.refs.toast.show('Enter a valid number')
        }
        else if (parseInt(inputText, 10) <= 0) {
            this.refs.toast.show("The value can't be zero")
        }
        else {
            this.setState({ visible: true })
            let that = this
            axios.post("/updateValue", {
                updateValue: inputText,
                label: updateValue,
                userId: this.props.userDetails.userID
            }).then((response) => {
                that.setState({ visible: false })
                this.updateRedux(inputText, updateValue)
            }).catch((error) => {
                that.setState({ visible: false })
                console.log(error);
            });
        }
    }

    // Invoked to signout from the app and clear local storage
    signout() {
        this.setState({ visible: true })
        var that = this;
        axios.post("/signOut", {}).then((response) => {
            that.setState({ visible: false })
            AsyncStorage.clear();
            that.props.history.push("/");
        }).catch((error) => {
            that.setState({ visible: false })
            console.log("error", error)
        });

    }

    // Invoked to deactivate a user's account
    disableAccount() {
        this.setState({visible: true})
        var that = this;
        axios.post("/disable", {
            userId: this.props.userDetails.userID
        }).then((response) => {
            that.setState({visible: false})
            that.props.history.push("/");
        }).catch((error) => {
            console.log("error", error)
            that.setState({
                visible: false
            })
        });
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: '#00FFF' }}>
                <Header centerComponent={{
                    text: 'Profile', style: {
                        margin: 24,
                        fontSize: 15,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#34495e',
                    }
                }} />
                <ImageBackground source={require('../../Images/back.jpg')} style={styles.backgroundImage}>
                    <AnimatedLoader
                        visible={this.state.visible}
                        overlayColor="rgba(255,255,255,1)"
                        source={require("../../Images/loader.json")}
                        animationStyle={styles.lottie}
                        speed={1}
                    />
                    <View style={{ marginLeft: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                        {this.props.userDetails.image ?
                            <Image style={styles.image} source={{
                                uri:
                                    'data:text/plain;base64,' + this.props.userDetails.image,
                            }}
                            /> : <Text></Text>}
                    </View>
                    <ScrollView>
                        <View style={{ flex: 1 }}>
                            <View style={{ marginLeft: 20 }}>
                                <TextField editable={false} label='Name' value={this.props.userDetails.name} />
                            </View>
                            <View style={{ marginLeft: 20 }}>
                                <TextField editable={false} label='Email ID' value={this.props.userDetails.email} />
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-start' }}>
                                <View style={styles.inputWrap}>
                                    <TextField editable={false} label='Patient ID' value={this.props.userDetails.patientId.toString()} />
                                </View>
                                <View style={styles.inputWrap}>
                                    <TouchableOpacity style={styles.updateBtn} onPress={this.showPatientDialog}>
                                        <Text style={styles.buttonText}> Update </Text>
                                    </TouchableOpacity>
                                    <DialogInput isDialogVisible={this.state.showPatientModal}
                                        title={"Patient ID Update"}
                                        message={"Enter your new Patient ID"}
                                        submitInput={(inputText) => this.updateValue(inputText, "patient")}
                                        closeDialog={() => { this.showPatientDialog(true) }}
                                    >
                                    </DialogInput>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-start' }}>
                                <View style={styles.inputWrap}>
                                    <TextField editable={false} label='Doctor ID' value={this.props.userDetails.doctorId.toString()} />
                                </View>
                                <View style={styles.inputWrap}>
                                    <TouchableOpacity style={styles.updateBtn} onPress={this.showDoctorDialog}>
                                        <Text style={styles.buttonText}> Update </Text>
                                    </TouchableOpacity>
                                    <DialogInput isDialogVisible={this.state.showDoctorModal}
                                        title={"Doctor ID Update"}
                                        message={"Enter your new Doctor ID"}
                                        submitInput={(inputText) => this.updateValue(inputText, "doctor")}
                                        closeDialog={() => { this.showDoctorDialog(true) }}
                                    >
                                    </DialogInput>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-start' }}>
                                <View style={styles.inputWrap}>
                                    <TextField editable={false} label='Height in cm' value={this.props.userDetails.height.toString()} />
                                </View>
                                <View style={styles.inputWrap}>
                                    <TouchableOpacity style={styles.updateBtn} onPress={this.showHeightDialog}>
                                        <Text style={styles.buttonText}> Update </Text>
                                    </TouchableOpacity>
                                    <DialogInput isDialogVisible={this.state.showHeightModal}
                                        title={"Height Update"}
                                        message={"Enter your current Height"}
                                        hintInput={"Eg. 60"}
                                        submitInput={(inputText) => this.updateValue(inputText, "height")}
                                        closeDialog={() => { this.showHeightDialog(true) }}
                                    >
                                    </DialogInput>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-start' }}>
                                <View style={styles.inputWrap}>
                                    <TextField editable={false} label='Weight in KG' value={this.props.userDetails.weight.toString()} />
                                </View>
                                <View style={styles.inputWrap}>
                                    <TouchableOpacity style={styles.updateBtn} onPress={this.showWeightDialog}>
                                        <Text style={styles.buttonText}>Update</Text>
                                    </TouchableOpacity>
                                    <DialogInput isDialogVisible={this.state.showWeightModal}
                                        title={"Weight Update"}
                                        message={"Enter your current Weight"}
                                        hintInput={"Eg. 60"}
                                        submitInput={(inputText) => this.updateValue(inputText, "weight")}
                                        closeDialog={() => { this.showWeightDialog(true) }}
                                    >
                                    </DialogInput>
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: "row", alignItems: 'flex-start' }}>
                                <View style={styles.inputWrap}>
                                    <TextField editable={false} label='BMI' value={this.state.bmi.toString()} />
                                </View>
                                <View style={styles.BMILabelView}>
                                    <Text style={[styles.BMILabel, { backgroundColor: this.state.bmiColor, }]}>{this.state.bmiString} </Text>
                                </View>
                            </View>
                            <View>
                                <TouchableOpacity style={styles.updateBtn} onPress={this.signout}>
                                    <Text style={styles.buttonText}> Logout </Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                <TouchableOpacity style={styles.actionBtn} onPress={this.disableAccount}>
                                    <Text style={styles.buttonText}> Deactivate Account </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </ScrollView>
                    <Toast ref="toast" textStyle={{ color: 'red' }} fadeOutDuration={1000} fadeInDuration={2500} />
                </ImageBackground >
                <View style={{ height: 50, backgroundColor: '#ecf0f1' }}>
                    <AppFooter props={this.props} />
                </View>
            </View >

        );
    }
}

const styles = StyleSheet.create({
    inputWrap: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column',
        marginLeft: 20
    },
    updateBtn: {
        backgroundColor: 'rgb(67,167,238)',
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        borderRadius: 45,
        justifyContent: 'center',
    },
    actionBtn: {
        backgroundColor: 'rgb(255,69,96)',
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        borderRadius: 45,
        justifyContent: 'center',
    },
    profile: {
        backgroundColor: 'white',
    },
    card: {
        flexDirection: 'column',
        justifyContent: 'center',
        marginLeft: '5%',
        marginRight: '5%',
        maxWidth: '100%'

    },
    paragraph: {
        margin: 24,
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#34495e'
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,

    },
    backgroundImage: {
        flex: 1,
        alignSelf: 'stretch',
        width: null,
        justifyContent: 'center'
    },
    headtext: {
        width: WIDTH - 55,
        fontWeight: 'bold',
        fontSize: 15,

    },
    input: {
        width: WIDTH - 55,
        fontSize: 16,
        paddingLeft: 45,
        marginHorizontal: 25,
        marginBottom: '2%'
    },
    lottie: {
        width: 400,
        height: 400
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        textAlign: 'center',
    },
    BMILabel: {
        color: 'white',
        padding: 10,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 15,
        borderRadius: 45,
        justifyContent: 'center',
    },
    BMILabelView: {
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
        marginLeft: 20
    }
});

const mapStateToProps = (state) => {
    return {
        userDetails: state
    }
}

export default connect(mapStateToProps)(Profile); 