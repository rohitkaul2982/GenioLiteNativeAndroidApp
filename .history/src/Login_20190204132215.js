import React, {Component} from 'react';
import {View,Text,AsyncStorage,PermissionsAndroid,StyleSheet,NetInfo,Keyboard,Platform} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Button } from 'react-native-elements';
import md5 from 'react-native-md5';
import DeviceInfo from 'react-native-device-info';

import paths from './Constants';

console.ignoredYellowBox = ['Remote debugger'];

async function requestLocationPermission() {
  try {
    const grantedLocation = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    )
    if (grantedLocation === PermissionsAndroid.RESULTS.GRANTED) {
      requestWritePermission();
      console.log("You can use the Location");
      
    } else {
      console.log("Location permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
async function requestWritePermission() {
  try {
    const grantedWrite = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    )
    if (grantedWrite === PermissionsAndroid.RESULTS.GRANTED) {
      requestReadPermission()
      console.log("You can use the WRITE")
    } else {
      console.log("WRITE permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
async function requestReadPermission() {
  try {
    const grantedRead = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    )
    if (grantedRead === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the READ")
    } else {
      console.log("READ permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
requestLocationPermission();



export default class Login extends Component {

  static navigationOptions = { title: 'Welcome', header: null };

  constructor(props){
    super(props);
    this.state={
            isConnected:true,
            username:'',
            password:'',
            showMsg: false,
            text:'',
            loginUrl:'http://accounts.justdial.com/api/serviceAuth.php?',
            //loginUrl:'http://vivek.jdsoftware.com/SSO/api/serviceAuth.php?',
            isLogging:false,
            isLoggedIn:false,
            signInError:0,
            current_app_version:paths.APP_VERSION,
    }

    this.deviceInfo = {};
    this.params = {};
    this.geocodes = {
      latitude: null,
      longitude: null,
      error: null,
      src:'location'
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

  async getVersion() {
    var self = this;
    return fetch(paths.VERSION_API, {
        headers : { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }

      })
      .then((response) => response.json())
      .then((responseJson) => {
          //console.log(responseJson)
          var new_app_version = responseJson.result.version;
          //var new_app_version = 0.8;
          if(new_app_version > self.state.current_app_version){
            // Download new app
            self.props.navigation.push('NewApp', {
              app_version: new_app_version,
              data: responseJson.result
            })
          }else{
            self.storeItem('app_version',new_app_version);

          }
      })
      .catch((error) => {
        console.error('getVersion',error);
      });
  }

  
  

  componentWillMount() {
    var self = this;
    //registerAppListener(self.props.navigation);
    //this.getVersion();

    var notification_url = self.props.navigation.getParam('notification_url', null);
    
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);

    this.retrieveItem('genio_empcode').then((empcode)=>{
      if(empcode && !this.state.isConnected){
         self.props.navigation.push('Offline');
      }else if(empcode && this.state.isConnected){
        var MODULE = notification_url == 1 ? 'GenioLite' : 'GenioLite';
        self.props.navigation.push(MODULE, {
          'employeeID': empcode,'notification_url':notification_url
        })
      }else{
        self.setState({isLogging:false,isLoggedIn:true})
      }
    }).catch((error)=>{
      console.log('Promise is rejected with error: ' + error);
    });

    
  }

  componentDidMount() {         
    //SplashScreen.hide();
    
    DeviceInfo.getMACAddress().then(mac => { this.deviceInfo['MACAddress'] = mac } );

    this.deviceInfo['APILevel'] = (Platform.OS != 'ios') ? (DeviceInfo.getAPILevel() || '') : '';
    this.deviceInfo['OS'] = Platform.OS;
    this.deviceInfo['OS_version'] = DeviceInfo.getSystemVersion() || '';
    this.deviceInfo['brand'] = DeviceInfo.getBrand() || '';
    this.deviceInfo['carrier'] = DeviceInfo.getCarrier() || '';
    this.deviceInfo['buildNumber'] = DeviceInfo.getBuildNumber() || '';
    this.deviceInfo['deviceCountry'] = DeviceInfo.getDeviceCountry() || '';
    this.deviceInfo['deviceId'] = DeviceInfo.getDeviceId();
    this.deviceInfo['freeDiskStorage'] = DeviceInfo.getFreeDiskStorage() || '';    
    this.deviceInfo['manufacturer'] = DeviceInfo.getManufacturer() || '';
    this.deviceInfo['phoneNumber'] = (Platform.OS == 'android') ? (DeviceInfo.getPhoneNumber() || '') : '';
    this.deviceInfo['readableVersion'] = DeviceInfo.getReadableVersion() || ''    
    this.deviceInfo['RAM'] = DeviceInfo.getTotalMemory() || '';
    this.deviceInfo['model'] = DeviceInfo.getModel() || '';

    this.watchId = setInterval(()=>{
      navigator.geolocation.getCurrentPosition(
        (position) => {        
          this.geocodes.latitude = position.coords.latitude;
          this.geocodes.longitude = position.coords.longitude;
          this.deviceInfo['location'] = this.geocodes;
        },
        (error) => {
          //console.warn(error);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 600000 },
      );
    },700)
    
    

   
   
   
    this.params['app_version'] = this.state.current_app_version;
    this.params['deviceInfo']  = this.deviceInfo;


  }

  componentWillUnmount() {

      this.setState({isLogging:false,isLoggedIn:true});
      NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
      clearInterval(this.watchId);
  }

  handleConnectivityChange = isConnected => {

    if (isConnected) {
      this.setState({ isConnected });
      this.getVersion();
    } else {
      this.setState({ isConnected });
    }
  };

  onLogin(){
    var trimed_username = this.state.username.trim();
    this.setState({ isLogging: true,username: trimed_username});
    Keyboard.dismiss();
    
    var self = this;
    let hex_password = md5.hex_md5( this.state.password );
    let hash_key = md5.hex_md5("Q-ZedAP^I76A%'>j0~'z]&w7bR64{sasd&%^$#@(*()()~!@" + this.state.username + hex_password);
    var params = 'auth_token=TUFEaRsasqqNlUYcdeKmnaaKrrxWbdgR&username='+this.state.username+'&pass='+hex_password+'&hashed_key='+hash_key;
    fetch(self.state.loginUrl+params)
        .then((response) => response.json())
        .then((responseJson) => {
        var error = responseJson.errorcode;
        self.params['empcode'] = self.state.username;
        self.setState({ isLogging: false });
        if(error == 0){
            this.setState({signInError:0});
            clearInterval(this.watchId);
            fetch(paths.LOGGER_API, {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(self.params),
            })
            // .then((response) => response.json())
            // .then((responseJson) => {
            //   console.warn(responseJson)
            // })
            // .catch((error) => {
            //   console.error(error);
            // });

            self.props.navigation.push('GenioLite', {
              employeeID: self.state.username,
            })
            
        }else if(error == 1){
          this.setState({signInError:1});
        }else{
          //this.state.loader = false;
        }
      }).catch((error) => {
          this.setState({ isLogging: false });
          console.warn('onLogin catch error',error);
          //this.state.loader = false;
      });
  }

  onRecovery(){
    this.props.navigation.push('ForgotPassword', {
      empcode: this.state.username,
    })
  }

  render() {
    if(this.state.isLoggedIn == false){
      return false;
    }
    
    const self = this;
    return (
        <View style={{
          flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center' ,
          backgroundColor: '#0050ab'}}
        >

          <Text style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'#ffffff',marginTop:0}}>
              Login into Geniolite v{this.state.current_app_version}
          </Text>
          <View style={{width:320,marginBottom:35  }}>
            <TextField
                label='User Code'
                value={this.state.username}
                onChangeText={ (username) => this.setState({ username }) }
                textColor="white"
                baseColor="grey"
                tintColor="lightgrey"
                activeLineWidth={1}
                autoFocus={true}
            />
            <TextField
                label='Password'
                secureTextEntry={true}
                value={this.state.password}
                onChangeText={ (password) => this.setState({ password }) }
                textColor="white"
                baseColor="grey"
                tintColor="lightgrey"
                activeLineWidth={1}
                autoCapitalize='none'
            />                
          </View>
         
            
          <Button
            //raised
            loading = {this.state.isLogging}
            loadingRight = {this.state.isLogging}
            disabled = {!this.state.isConnected}
            //backgroundColor = {'#ff9a00'}
            onPress = {this.onLogin.bind(this)}
            title='                      LOGIN                     '
            buttonStyle={{
                backgroundColor: "#ff9a00",
                width: 320,
                //height: 45,
                //borderColor: "transparent",
                //borderWidth: 0,
                borderRadius: 30
            }}
          />

          
          { (this.state.signInError == 1) && <Text
              style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'red',marginTop:0}}>
              Please enter valid credentials
          </Text>}

          <Text style={ContainerStyles.recovery} onPress={this.onRecovery.bind(this)}>
              Forgot Password ?
          </Text>

          {!this.state.isConnected &&
            <View style={ContainerStyles.containerHorizontal}>
              <Text style={{color:'white'}}>You are Offline. Check internet connection !!</Text>
            </View>
          }
            
        </View>
    );
  }
}

const ContainerStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  containerHorizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "red",
    marginTop:30,
    borderRadius: 10
  },
  recovery : {fontFamily:'Helvetica-Light',fontSize: 14,color:'#ffffff',marginTop:10,textAlign:'right',marginLeft:200}

});
