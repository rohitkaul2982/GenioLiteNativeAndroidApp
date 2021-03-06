import React, {Component} from 'react';
import {Platform,
 StyleSheet,
 View,Button,Text,
 BackHandler,
 Linking,
 ProgressBarAndroid,
 ActivityIndicator,AsyncStorage,NetInfo} from 'react-native';
import FCM from "react-native-fcm";


// import module
import CustomWebView from 'react-native-webview-android-file-upload'; 
//import SplashScreen from 'react-native-splash-screen';

import paths from './Constants';



//console.ignoredYellowBox = ['Remote debugger'];




export default class GenioWebView extends Component {

  static navigationOptions = { title: 'GenioWebView', header: null };

  constructor(props){
    super(props);
    this.state = {
      isConnected:true,
      latitude: null,
      longitude: null,
      error: null,
      locationPermission:null,
      platform:Platform.OS,
      isLoggedIn:0,
      empcode:'',
      url:paths.ACCOUNTS_URL,
      //url:'http://vivek.jdsoftware.com/SSO/api/redirect.php?'
    }

    this.geocodes = {
      latitude: null,
      longitude: null,
      error: null,
      platform:Platform.OS,
      src:'location'
    }

    this.genioInfo = {
      platform:Platform.OS,
      src:'route',
      route:'notification'
    }
    
  }

  componentWillMount() {

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.geocodes.latitude = position.coords.latitude;
        this.geocodes.longitude = position.coords.longitude;

        this.webview.postMessage(JSON.stringify(this.geocodes));
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
    );

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
    }

    const { navigation } = this.props;
    const employeeID = navigation.getParam('employeeID', null);
    this.setState({empcode:employeeID});

    
    

    NetInfo.getConnectionInfo().then((connectionInfo) => {
      //console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
      if(connectionInfo.type && connectionInfo.type == 'none'){
        this.setState({isConnected:false})
      }
    });
  }

  componentDidMount() {
      this.storeItem('genio_empcode',this.state.empcode);
      FCM.subscribeToTopic('com.geniolite.rn.v2.'+this.state.empcode);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geocodes.latitude = position.coords.latitude;
          this.geocodes.longitude = position.coords.longitude;
          this.webview.postMessage(JSON.stringify(this.geocodes));
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
      );
     
      this.watchId = navigator.geolocation.watchPosition(
          (position) => {
              this.geocodes.latitude = position.coords.latitude;
              this.geocodes.longitude = position.coords.longitude;
              //console.log('componentDidMount watch',this.geocodes)
              this.webview.postMessage(JSON.stringify(this.geocodes));              
          },
          (error) => this.setState({ error: error.message }),
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 1 },
      );
      NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
      
      //AppState.addEventListener('change', this._handleAppStateChange);
      //SplashScreen.hide();


      const notification_url = this.props.navigation.getParam('notification_url', null);
      this.webview.postMessage(JSON.stringify(this.genioInfo));
      console.warn('notification_url',notification_url)
      if(notification_url){
        
      }


  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
    
    if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress');
    }
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    //AppState.removeEventListener('change', this._handleAppStateChange);
    

  }

  handleConnectivityChange = isConnected => {
    // NetInfo.getConnectionInfo().then((connectionInfo) => {
    //   console.log('Initial, type: ' + connectionInfo.type + ', effectiveType: ' + connectionInfo.effectiveType);
    //   console.log(connectionInfo);
    // });
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };

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
      console.log(error.message);
    }
    return
  }



  onAndroidBackPress = () => {
    this.webview.goBack();
    return true;
  }




  onErrorLoad_Webview(err){
    console.log("onErrorLoad_Webview ",err)  
    this.props.navigation.push('Offline');

     
  }

  onNavigationStateChange(navState){
    //console.log('navState',navState)
    var url = navState.url;
    this.storeItem('lastActiveUrl',url)
    var pattern = new RegExp("processTransaction");
    var is_transaction = pattern.test(url);

    var pattern = new RegExp("genio_lite");
    var is_geniolite = pattern.test(url);

    var pattern = new RegExp("genio_cpm");
    var is_cpm = pattern.test(url);
    
    if((is_transaction && is_geniolite && is_cpm)){
      Linking.openURL(url);
    }
  }

  renderLoading(){
    
    return (
      <View style={[styles.container, styles.horizontal]}>
        <ProgressBarAndroid styleAttr="Normal" color="#f89750" />
      </View>
    )
    
  }

  onLoadStart(){    
    {!this.state.isConnected && this.props.navigation.push('Offline'); }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.geocodes.latitude = position.coords.latitude;
        this.geocodes.longitude = position.coords.longitude;
        this.webview.postMessage(JSON.stringify(this.geocodes));
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
    );
    
  }
  onLoadEnd(){    
    {!this.state.isConnected && this.props.navigation.push('Offline'); }
    navigator.geolocation.getCurrentPosition(
        (position) => {
          this.geocodes.latitude = position.coords.latitude;
          this.geocodes.longitude = position.coords.longitude;
          this.webview.postMessage(JSON.stringify(this.geocodes));
        },
        (error) => this.setState({ error: error.message }),
        { enableHighAccuracy:false, timeout: 20000, maximumAge: 60000 },
      );
  }

  IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
  }

  msgHandler(event){
      var self = this;
      if(self.IsJsonString(event.nativeEvent.data)){
          var msg = JSON.parse(event.nativeEvent.data);
          if(msg.isClean == 1){
            self.storeItem('genio_empcode','');
            AsyncStorage.clear();
            self.props.navigation.push('Login');
          }

      }
  }

  onShouldStartLoadWithRequest(){

  }

  

  render() {
    console.log('isConnected--->',this.state.isConnected)
    const uri_source=this.state.url + "empcode=" + this.state.empcode + "&redirect_url=5" + "&auth_token=TUFEaRsasqqNlUYcdeKmnaaKrrxWbdgR"+"&SERVICE_PARAM=127";
    return (
      <View style={ContainerStyles.container}>
        <CustomWebView
          webviewRef={e => (this.webview = e)} // webviewRef name should not changed
          source={{uri:uri_source}}
          domStorageEnabled={true}
          startInLoadingState={true}
          mediaPlaybackRequiresUserAction={true}
          onError={this.onErrorLoad_Webview.bind(this)}
          mixedContentMode={'compatibility'}
          geolocationEnabled={true} // Only for Android
          allowUniversalAccessFromFileURLs={true}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          renderLoading={this.renderLoading.bind(this)}
          onLoadEnd={this.onLoadEnd.bind(this)}
          onLoadStart={this.onLoadStart.bind(this)}
          scalesPageToFit={true}
          onMessage={this.msgHandler.bind(this)}
          //onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest.bind(this)}
          // any other props supported by React Native's WebView
        />
        {!this.state.isConnected &&
        <View style={ContainerStyles.containerHorizontal}>
          <Text style={{color:'white'}}>You are Offline. Check internet connection !!</Text>
        </View>}
      </View>
      
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    padding: 10
  }
});

const ContainerStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerHorizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
    backgroundColor: "red"

  }
});

