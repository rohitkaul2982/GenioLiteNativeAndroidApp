import React, { Component } from 'react';
import { Platform,AppState } from 'react-native';
import { createStackNavigator } from 'react-navigation';



// import module
//import SplashScreen from 'react-native-splash-screen';
import FCM, { NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Listeners";
import firebaseClient from "./FirebaseClient";

registerKilledListener();

// Components
import Login from './src/Login';
import GenioWebView from './src/GenioWebView';

//console.ignoredYellowBox = ['Remote debugger'];

const RootStack = createStackNavigator(
  {
    Login: Login,
    GenioLite: GenioWebView,
  },
  {
    initialRouteName: 'Login',
  }
);

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      appState: AppState.currentState,
      platform:Platform.OS,
      url:'http://accounts.justdial.com/api/redirect.php?'

    }
    
  }

  async retrieveItem(key) {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      console.log('item',item)
      return item;
    } catch (error) {
      console.log(error.message);
    }
    return
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    //SplashScreen.hide();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({appState: nextAppState});
  }
  
  render() {
    return (
      <RootStack />
    );
  }
} // End of main class


