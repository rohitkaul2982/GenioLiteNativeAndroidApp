import React, {Component} from 'react';
import {Platform,
 StyleSheet,
 View,Text,
 BackHandler,
 Linking,
 AsyncStorage,NetInfo} from 'react-native';
import { Icon,Button } from 'react-native-elements';

// import module
import CustomWebView from 'react-native-webview-android-file-upload'; 
//import SplashScreen from 'react-native-splash-screen';

import paths from './Constants';

console.ignoredYellowBox = ['Remote debugger'];



export default class ForgotPassword extends Component {

  static navigationOptions = { title: 'ForgotPassword', header: null };

  constructor(props){
    super(props);
    this.state = {
      isConnected:true,
      isOverlay:1,
      latitude: null,
      longitude: null,
      error: null,
      locationPermission:null,
      platform:Platform.OS,
      isLoggedIn:0,
      empcode:'',
      url:paths.RECOVERY_URL,
      icon_name:'progress-empty',
      loader_msg:'Genio is loading up ...',
      lastActiveUrl:'',
      isNotification:0,
      init_token:0,
      padding:0,
      isOffline:false,
      offlineIcon:'refresh-cw',
      isLoading:false,
      connectMsg : 'Internet connection lost !!'
      
    }

    this.loaderInverval = '';
    
  }

  componentWillMount() {

    
    const { navigation } = this.props;
    const employeeID = navigation.getParam('employeeID', null);
    this.setState({empcode:employeeID}); 

    var i=0;
    //var progress_icons = ['progress-empty','progress-one','progress-two','progress-full'];
    var progress_icons = ['dot-single','dots-two-horizontal','dots-three-horizontal'];
    
    var thisObj = this;
    this.loaderInverval = setInterval(()=>{
      if(i > 2)
        i=0;
      else
        i=i+1;
      thisObj.setState({
        icon_name : progress_icons[i]
      });

    },200)
  }

  componentDidMount() {
      this.storeItem('genio_empcode',this.state.empcode);
     
      if (Platform.OS === 'android') {
        BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
      }

      setTimeout(()=>{
        this.setState({isOverlay:0,loader_msg:''});
        clearInterval(this.loaderInverval);
      },20000);
      
      //SplashScreen.hide();
      
  }

  async isNetwork(){
    let result = await NetInfo.isConnected.fetch();
    return result;
  } 
  

  componentWillUnmount() {
    
    if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress');
    }
  }

  handleConnectivityChange = isConnected => {
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
    this.setState({isOffline:true})  
  }

  onNavigationStateChange(navState){
  }


  onLoadStart(){ }
  onLoadEnd(){ }

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
      //console.log(event.nativeEvent.data)
      
  }

  //onShouldStartLoadWithRequest(){}
  
  reload(){
    this.setState({offlineIcon:'activity',isLoading:true})
    this.isNetwork().then((connection)=>{
      if(connection){
        this.setState({isOffline:false,offlineIcon:'refresh-cw',isLoading:false})
        this.webview.reload();
      }else{
        this.setState({isOffline:true,offlineIcon:'refresh-cw',isLoading:false});
        setTimeout(()=>{
          this.setState({connectMsg:'Kindly check the internet connectivity and try again.'})
        },5000)
      } 
    });
  }
  

  render() {

    return (
      <View style= {{'flex': 1}}>
        
        <CustomWebView
          webviewRef={e => (this.webview = e)} // webviewRef name should not changed
          source={{uri:this.state.url}}
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

  },
  overlay: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.6,
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
    alignItems:'center'
  }  
});

