import React, { Component } from 'react';
import { View,Platform,AppState,AsyncStorage } from 'react-native';
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
import NewApp from './src/NewApp';


//console.ignoredYellowBox = ['Remote debugger'];

const RootStack = createStackNavigator(
  {
    Login: Login,
    GenioLite: GenioWebView,
    NewApp: NewApp
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
      app_version:0.2,
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

    this.retrieveItem('app_version').then((version)=>{
      console.log('app_version', version);
      var version = parseFloat(version);
      if(version < this.state.app_version){
        // Download new app
        self.props.navigation.push('NewApp', {
          version: version,
        })
      }else{
        this.storeItem('app_version',this.state.app_version);
      }
    }).catch((error)=>{
      console.log('Promise is rejected with error (app_version): ' + error);
    })

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


     FCM.subscribeToTopic('com.geniolite.rn.'+'10033590');
    

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


