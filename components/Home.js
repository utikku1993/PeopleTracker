/*
    This is the Main Index Page, where the different components will be fetche based on the url
*/
import React from 'react';
import { View} from 'react-native';
import { Route, Switch } from 'react-router-native'
import Map from './views/Map';
import ViewProfile from './views/Profile';
import Settings from './views/Settings';
import Signup from './session/SignUp';
import SignIn from './session/SignIn';
import Profile from "./session/Profile";
import Start from './session/Start'

class Home extends React.Component {

    render() {
        return (
                <View style={{flex: 1}}>
                    <Switch>
                        <Route exact path="/" component={Start}/>
                        <Route exact path="/signin" component={SignIn} />
                        <Route exact path="/profile" component={Profile} />
                        <Route exact path="/map" component={Map} />
                        <Route exact path="/viewProfile" component={ViewProfile} />
                        <Route exact path="/settings" component={Settings} />
                        <Route exact path="/signup" component={Signup} />
                    </Switch>
                </View>
        );
    }
}

export default Home; 