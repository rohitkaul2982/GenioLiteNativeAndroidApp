import React, {Component} from 'react';
import {Platform,
 StyleSheet,
 View,
 BackHandler,
 AsyncStorage,NetInfo} from 'react-native';

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
      url:paths.RECOVERY_URL,     
    }
    
  }

  componentWillMount() {

    
    const { navigation } = this.props;
    const empcode = navigation.getParam('empcode', null);
    //this.setState({empcode:empcode}); 


  }

  componentDidMount() {
      //this.storeItem('genio_empcode',this.state.empcode);
     
      if (Platform.OS === 'android') {
       // BackHandler.addEventListener('hardwareBackPress', this.onAndroidBackPress);
      }      
  }

  componentWillUnmount() {
    
    if (Platform.OS === 'android') {
        //BackHandler.removeEventListener('hardwareBackPress');
    }
  }

  onAndroidBackPress = () => {
    this.webview.goBack();
    return true;
  }

  async isNetwork(){
    let result = await NetInfo.isConnected.fetch();
    return result;
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

  onNavigationStateChange(navState){
    console.log(navState.url);
    const is_logout = navState.url.includes('logout_param');
    const is_rediect = navState.url.includes('redirect_url=1');
    if(is_logout || is_rediect){
      this.props.navigation.push('Login');
    }
    
  }

  


  render() {

    return (
      <View style= {{'flex':1}}>        
        <CustomWebView
          webviewRef={e => (this.webview = e)} // webviewRef name should not changed
          source={{uri:this.state.url}}
          domStorageEnabled={true}
          startInLoadingState={true}
          mediaPlaybackRequiresUserAction={true}
          mixedContentMode={'compatibility'}
          geolocationEnabled={true} // Only for Android
          allowUniversalAccessFromFileURLs={true}
          onNavigationStateChange={this.onNavigationStateChange.bind(this)}
          scalesPageToFit={true}
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

