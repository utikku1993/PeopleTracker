import React from 'react';
import { View } from 'react-native';
import axios from "axios";
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { NativeRouter } from 'react-router-native';
import reducers from './redux/reducers/index';
import Home from './components/Home';

export default class App extends React.Component {

  componentDidMount() {
    console.disableYellowBox = true;
    axios.defaults.baseURL = 'http://43.240.98.141:5000';
  }

  render() {
    const store = createStore(reducers, {});
    return (
      <Provider store={store}>
        <NativeRouter>
          <View style={{ flex: 1 }} >
            <Home />
          </View>
        </NativeRouter>
      </Provider>
    );
  }
}