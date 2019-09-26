import React, { Component } from 'react';
import { View,Platform,AppState } from 'react-native';
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
      url:'http://accounts.justdial.com/api/redirect.php?',
      token: "",
      tokenCopyFeedback: ""

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
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    FCM.createNotificationChannel({
      id: 'default',
      name: 'Default',
      description: 'used for example',
      priority: 'high'
    })
    registerAppListener(this.props.navigation);
    FCM.getInitialNotification().then(notif => {
      this.setState({
        initNotif: notif
      });
      if (notif && notif.targetScreen === "detail") {
        setTimeout(() => {
          this.props.navigation.navigate("Detail");
        }, 500);
      }
    });

    try {
      let result = await FCM.requestPermissions({
        badge: false,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error(e);
    }

    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
      this.setState({ token: token || "" });
    });

    if (Platform.OS === "ios") {
      FCM.getAPNSToken().then(token => {
        console.log("APNS TOKEN (getFCMToken)", token);
      });
    }

    FCM.subscribeToTopic('com.geniolite.'+empidnew);
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


