import React, { Component } from 'react';
import { View,Platform,AppState,AsyncStorage } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import NavigationService from './NavigationService';



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


const TopLevelNavigator = createStackNavigator(
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

    FCM.createNotificationChannel({
      id: 'default',
      name: 'Default',
      description: 'used for example',
      priority: 'high'
    })
    //registerAppListener(this.props.navigation);
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


    //FCM.subscribeToTopic('com.geniolite.rn.'+'10033590');
    //SplashScreen.hide();
  }

  showLocalNotification() {
    FCM.presentLocalNotification({
      channel: 'default',
      id: new Date().valueOf().toString(), // (optional for instant notification)
      title: "Test Notification with action", // as FCM payload
      body: "Force touch to reply", // as FCM payload (required)
      sound: "default", // "default" or filename
      priority: "high", // as FCM payload
      click_action: "com.myapp.MyCategory", // as FCM payload - this is used as category identifier on iOS.
      badge: 10, // as FCM payload IOS only, set 0 to clear badges
      number: 10, // Android only
      ticker: "My Notification Ticker", // Android only
      auto_cancel: true, // Android only (default true)
      large_icon:
        "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg", // Android only
      icon: "ic_launcher", // as FCM payload, you can relace this with custom icon you put in mipmap
      big_text: "Show when notification is expanded", // Android only
      sub_text: "This is a subText", // Android only
      color: "red", // Android only
      vibrate: 300, // Android only default: 300, no vibration if you pass 0
      wake_screen: true, // Android only, wake up screen when notification arrives
      group: "group", // Android only
      picture:
        "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png", // Android only bigPicture style
      ongoing: true, // Android only
      my_custom_data: "my_custom_field_value", // extra data you want to throw
      lights: true, // Android only, LED blinking (default false)
      show_in_foreground: true // notification when app is in foreground (local & remote)
    });
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


