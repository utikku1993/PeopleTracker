/* 
  This is the main landing page
  The user will be redirected here after Login or Sign Up
  It contains the counters for both the parks and restaurants
*/
import React from 'react';
import { Constants, MapView, Location, Permissions, Pedometer } from 'expo';
import { StyleSheet, View, Alert, BackHandler, ImageBackground, FlatList } from 'react-native';
import AppFooter from '../footer/AppFooter'
import { Card, CardItem, Text } from 'native-base';
import { Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from "axios";
import { connect } from 'react-redux'
import { Header } from 'react-native-elements'
import AnimatedLoader from "react-native-animated-loader";
import Modal from "react-native-modal";
import moment from "moment";

class Map extends React.Component {
  isComponentPresent = false;
  constructor(props, { }) {
    super(props);
    this.state = {
      mapRegion: null,
      hasLocationPermissions: false,
      locationResult: null,
      isPedometerAvailable: null,
      restaurantCount: 0,
      parkCount: 0,
      visible: true,
      showRestModal: false,
      showParkModal: false,
      parkData: null,
      restData: null
    };
  }

  componentDidMount() {
    this.isComponentPresent = true;
    this.getUsersLocation();
    this.getLastSavedStepDateFromServer();
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    this.isComponentPresent = false;
  }

  componentWillMount() {
    let that = this
    setTimeout(function () {
      that.setState({
        visible: false
      });
    }, 5000);
  }

  // Binds 'go back' action to hardware back button press
  handleBackPress = () => {
    this.props.history.goBack();
    return true;
  }

  // Formats the Park/Restaurant History data as required for displaying.
  formatDataForModal(historyData) {
    for (let i = 0; i < historyData.length; i++) {
      historyData[i].index = i;
      let date = new moment(historyData[i].histimestamp)
      date = date.parseZone("Australia/Melbourne")
      historyData[i].date = "Date: " + date.date() + '/' + (date.month() + 1) + '/' + date.year() + "         " + "Time: " + ((date.hour() > 12) ? (date.hour() - 12) : date.hour()) + ':' + ((date.minutes() < 10) ? ("0" + date.minutes()) : date.minutes()) + ((date.hour() >= 12) ? " PM" : " AM");
    }
    return historyData
  }

  // Created to get History of Park or Restaurant from the Server
  getHistoryFromServer = (isPark) => {
    let historyData = []
    axios.post("/getHistory", {
      history: isPark,
      uid: this.props.userDetails.userID
    }).then((response) => {
      if (response.data !== "No data") {
        for (let i = 0; i < response.data.length; i++) {
          historyData.push(response.data[i])
        }
        historyData = this.formatDataForModal(historyData);
        if (isPark) {
          this.setState({ showParkModal: true, parkData: historyData });
        } else {
          this.setState({
            showRestModal: true, restData: historyData
          });
        }
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  // Created to get the last saved Date of Step Data from the Server
  getLastSavedStepDateFromServer() {
    axios.post("/getDate", {
      uid: this.props.userDetails.userID
    }).then((response) => {
      this.getStepDataFromPedometerForServer(response.data);
    }).catch((error) => {
      console.log(error);
    });
  }

  // Created to get the Required Step Data from the Pedometer
  async getStepDataFromPedometerForServer(lastSavedStepDataDate) {
    let that = this
    Pedometer.isAvailableAsync().then(
      result => {
        this.setState({
          isPedometerAvailable: true
        });
      },
      error => {
        this.setState({
          isPedometerAvailable: false
        });
        console.log("Error with Pedometer: " + error)
      }
    );

    let dataForServer = []
    let today = new Date()
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
    let nextRequiredDate = lastSavedStepDataDate
    nextRequiredDate = nextRequiredDate.split("-")
    nextRequiredDate = new Date(parseInt(nextRequiredDate[2]), parseInt(nextRequiredDate[1]) - 1, parseInt(nextRequiredDate[0]) + 1, 0, 0, 0, 0)

    let numberOfDays = Math.round((today - nextRequiredDate) / (1000 * 60 * 60 * 24))

    for (let i = numberOfDays; i > 0; i--) {
      let stepDataObject = {}
      let start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 0, 0, 0, 0)
      let end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1, 0, 0, 0, 0)
      stepDataObject.date = start.getDate() + '-' + (start.getMonth() + 1) + '-' + start.getFullYear();

      Pedometer.getStepCountAsync(start, end).then(
        result => {
          stepDataObject.step = result.steps
        },
        error => {
          console.log("error")
          stepDataObject.step = 0
        }
      );
      dataForServer.push(stepDataObject);
    }
    setTimeout(function () {
      that.sendDataToServer(dataForServer)
    }, 2000);
  }

  sendDataToServer = (stepDataForServer) => {
    axios.post("/updateSteps", {
      stepData: stepDataForServer,
      uid: this.props.userDetails.userID
    }).then((response) => {
    }).catch((error) => {
      console.log(error);
    });
  }

  // Called when the user's position changes on the map
  handleMapRegionChange = async () => {
    this.getUsersLocation();
  };

  // Created to get the user's current position using GPS
  getUsersLocation = async () => {
    let isGPSOn = await Location.hasServicesEnabledAsync();
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (this.isComponentPresent) {
      if (status === 'granted') {
        this.setState({ hasLocationPermissions: true });
      }

      if (isGPSOn) {
        let location = await Location.getCurrentPositionAsync({});
        if (this.isComponentPresent) {
          this.setState({
            locationResult: location,
            mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
          });
          this.sendUsersLocationToServer(location.coords.latitude, location.coords.longitude)
        }
        // The map is sized according to the width and height specified in the styles and/or calculated by react-native.
        // The map computes two values, longitudeDelta/width and latitudeDelta/height, compares those 2 computed values, and takes the larger of the two.
        // The map is zoomed according to the value chosen in step 2 and the other value is ignored.
        // If the chosen value is longitudeDelta, then the left edge is longitude - longitudeDelta and the right edge is longitude + longitudeDelta. The top and bottom are whatever values are needed to fill the height without stretching the map.
        // If the chosen value is latitudeDelta, then the bottom edge is latitude - latitudeDelta and the top edge is latitude + latitudeDelta. The left and right are whatever values are needed to fill the width without stretching the map.
      } else {
        Alert.alert(
          'Location Services Are Disabled',
          'Please turn on location services to proceed.',
          [
            { text: 'Close App', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        )
      }
    }
  };

  // Created to send the user's position to the Server
  sendUsersLocationToServer(latitude, longitude) {
    let that = this
    if (latitude != null && longitude != null && latitude != "" && longitude != "") {
      axios.post("/userLocation", {
        latitude: latitude,
        longitude: longitude,
        uid: this.props.userDetails.userID
      }).then((response) => {
        if (this.isComponentPresent) {
          if (that.state.restaurantCount !== response.data.restaurantCount || that.state.parkCount !== response.data.parkCount) {
            that.setState({
              restaurantCount: response.data.restaurantCount,
              parkCount: response.data.parkCount,
            });
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  // Used to render the details for the park or restaurant history
  renderRow({ item }) {
    return (
      <ListItem
        title={item.histplace}
        subtitle={item.date}
      />
    )
  }

  render() {
    return (
      <>
        <View style={{ flex: 1 }}>
          <Header centerComponent={{
            text: 'Home Page', style: {
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
            <View>
              {
                this.state.locationResult === null ?
                  <Text>Finding your current location...</Text> :
                  this.state.hasLocationPermissions === false ?
                    <Text>Please provide location permissions.</Text> :
                    this.state.mapRegion === null ?
                      <Text>Map region doesn't exist.</Text> :
                      <MapView
                        style={{ alignSelf: 'stretch', height: '85%', marginTop: '-1%' }}
                        region={this.state.mapRegion}
                        showsUserLocation={true}
                        showsPointsOfInterest={false}
                        followsUserLocation={false}
                        zoomLevel={20}
                        provider="google"
                        onRegionChange={region => this.state.mapRegion = region}
                        onUserLocationChange={location => this.handleMapRegionChange(location)}
                      />
              }
              <View style={{ flex: 1, flexDirection: "row", alignItems: 'center', marginTop: '2%' }}>
                <View style={{ width: '50%' }}>
                  <Button
                    buttonStyle={{ backgroundColor: "red", width: '100%', height: '100%', marginRight: 5 }}
                    icon={
                      <Icon
                        name="md-pizza"
                        size={60}
                        color="white"
                      />
                    }
                    onPress={() => { this.getHistoryFromServer(false) }}
                    title={" " + this.state.restaurantCount.toString()}
                  />
                </View>
                <View style={{ width: '50%' }}>
                  <Button
                    buttonStyle={{ backgroundColor: "green", width: '100%', height: '100%', marginLeft: 5 }}
                    icon={
                      <Icon
                        name="ios-american-football"
                        size={60}
                        color="white"
                      />
                    }
                    onPress={() => { this.getHistoryFromServer(true) }}
                    title={" " + this.state.parkCount.toString()}
                  />
                </View>
              </View>
            </View>
          </ImageBackground>
          <Modal isVisible={this.state.showRestModal}>
            <Card>
              <CardItem header>
                <Text>Restaurant History</Text>
              </CardItem>
              <CardItem>
                <FlatList
                  data={this.state.restData}
                  renderItem={this.renderRow}
                  keyExtractor={item => item.index.toString()}
                />
              </CardItem>
              <CardItem>
                <Button title="Hide" onPress={() => { this.setState({ showRestModal: false }) }} />
              </CardItem>
            </Card>
          </Modal>
          <Modal isVisible={this.state.showParkModal}>
            <Card>
              <CardItem header>
                <Text>Park History</Text>
              </CardItem>
              <CardItem>
                <FlatList
                  data={this.state.parkData}
                  renderItem={this.renderRow}
                  keyExtractor={item => item.index.toString()}
                />
              </CardItem>
              <CardItem>
                <Button title="Hide" onPress={() => { this.setState({ showParkModal: false }) }} />
              </CardItem>
            </Card>
          </Modal>
        </View>
        <AppFooter props={this.props} />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: '5%',
    marginRight: '5%',
    maxWidth: '100%'
  },
  backgroundImage: {
    flex: 1,
    alignSelf: 'stretch',
    width: null,
    justifyContent: 'center'
  },
  lottie: {
    width: 400,
    height: 400
  }
});

const mapStateToProps = (state) => {
  return {
    userDetails: state
  }
}

export default connect(mapStateToProps)(Map)