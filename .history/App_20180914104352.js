import React, { Component } from 'react';
import { View,Platform,AppState,AsyncStorage } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import NavigationService from './NavigationService';



// import module
//import SplashScreen from 'react-native-splash-screen';
import FCM, { NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Listeners";

registerKilledListener();

// Components
import Login from './src/Login';
import GenioWebView from './src/GenioWebView';
import NewApp from './src/NewApp';
import Offline from './src/Offline';
import Notifications from './src/Notifications';


//console.ignoredYellowBox = ['Remote debugger'];


const TopLevelNavigator = createStackNavigator(
  {
    Login: Login,
    GenioLite: GenioWebView,
    NewApp: NewApp,
    Offline: Offline,
    Notifications: Notifications
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
      url:'http://accounts.justdial.com/api/redirect.php?',
      token: "",
      tokenCopyFeedback: "",
      initNotif:null   
    }    
  }

  async storeItem(key, item) {
    try {
        //we want to wait for the Promise returned by AsyncStorage.setItem()
        //to be resolved to the actual value before returning the value
        var jsonOfItem = await AsyncStorage.setItem(key, JSON.stringify(item));
        return jsonOfItem;
    } catch (error) {
      console.log(error.message);
    }
  }

  async retrieveItem(key) {
    try {
      const retrievedItem =  await AsyncStorage.getItem(key);
      const item = JSON.parse(retrievedItem);
      return item;
    } catch (error) {
      console.log('retrieveItem Error',error.message);
    }
    return
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentWillMount(){
    
  }
  
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);    

    try {
      let result = await FCM.requestPermissions({
        badge: false,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error(e);
    }

    //FCM.subscribeToTopic('com.geniolite.rn.'+'10033590');
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
     
        <TopLevelNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
    );
  }
} // End of main class


