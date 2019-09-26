import React, {Component} from 'react';
import {StyleSheet,View,Text,AsyncStorage,PermissionsAndroid} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Button } from 'react-native-elements';
import md5 from 'react-native-md5';



//import SplashScreen from 'react-native-splash-screen';

//console.ignoredYellowBox = ['Remote debugger'];




async function requestLocationPermission() {
  try {
    const grantedLocation = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Cool Photo App Camera Permission',
        'message': 'Cool Photo App needs access to your camera ' +
                   'so you can take awesome pictures.'
      }
    )
    if (grantedLocation === PermissionsAndroid.RESULTS.GRANTED) {
      requestWritePermission();
      console.log("You can use the camera")
    } else {
      console.log("Camera permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
async function requestWritePermission() {
  try {
    const grantedWrite = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'Cool Photo App Camera Permission',
        'message': 'Cool Photo App needs access to your camera ' +
                   'so you can take awesome pictures.'
      }
    )
    if (grantedWrite === PermissionsAndroid.RESULTS.GRANTED) {
      requestReadPermission()
      console.log("You can use the camera")
    } else {
      console.log("Camera permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
async function requestReadPermission() {
  try {
    const grantedRead = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        'title': 'Cool Photo App Camera Permission',
        'message': 'Cool Photo App needs access to your camera ' +
                   'so you can take awesome pictures.'
      }
    )
    if (grantedRead === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera")
    } else {
      console.log("Camera permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
requestLocationPermission();



export default class NewApp extends Component {

  static navigationOptions = { title: 'Welcome', header: null };

  constructor(props){
    super(props);
    this.state={
            username:'',
            password:'',
            showMsg: false,
            text:'',
            //loginUrl:'http://192.168.20.237/api/serviceAuth.php?',
            loginUrl:'http://accounts.justdial.com/api/serviceAuth.php?',
            //loginUrl:'http://vivek.jdsoftware.com/SSO/api/serviceAuth.php?',
            isLogging:false,
            isLoggedIn:false,
            signInError:0
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

  
  

  componentWillMount() {
    var self = this;
    this.retrieveItem('app_version').then((version)=>{
      console.log('app_version', version);
      var version = parseFloat(version);
      if(version < this.state.app_version){
        // Download new app
      }
    }).catch((error)=>{
      console.log('Promise is rejected with error: ' + error);
    })
    
    this.retrieveItem('genio_empcode').then((empcode)=>{
      console.log('retrieveItem', empcode)
      if(empcode){
        self.props.navigation.push('GenioLite', {
          employeeID: empcode,
        })
      }else{
        self.setState({isLogging:false,isLoggedIn:true})
      }
    }).catch((error)=>{
      console.log('Promise is rejected with error: ' + error);
    })
  }

  componentDidMount() {    
    
    //SplashScreen.hide();
  }

  componentWillUnmount() {
    
  }
  onLogin(){

    console.log("login",this.state)
    this.setState({ isLogging: true });
    var self = this;
    let hex_password = md5.hex_md5( this.state.password );
    let hash_key = md5.hex_md5("Q-ZedAP^I76A%'>j0~'z]&w7bR64{sasd&%^$#@(*()()~!@" + this.state.username + hex_password);
    console.log(hash_key);
    var params = 'auth_token=TUFEaRsasqqNlUYcdeKmnaaKrrxWbdgR&username='+this.state.username+'&pass='+hex_password+'&hashed_key='+hash_key;
    console.log(self.state.loginUrl+params);
    fetch(self.state.loginUrl+params)
        .then((response) => response.json())
        .then((responseJson) => {
        console.log('responseJson',responseJson);
        var error = responseJson.errorcode;
        //var msg   = responseJson.msg;
        //this.state.loader = true;
        self.setState({ isLogging: false });
        if(error == 0){
            this.setState({signInError:0})
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
          console.warn('catch error',error);
          //this.state.loader = false;
      });
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
              Login To GenioLite
          </Text>
          <View style={{width:320,marginBottom:40  }}>
            <TextField
                label='User Code'
                value={this.state.username}
                onChangeText={ (username) => this.setState({ username }) }
                textColor="white"
                baseColor="grey"
                tintColor="lightgrey"
                activeLineWidth={1}
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
            raised
            loading = {this.state.isLogging}
            loadingRight = {this.state.isLogging}
            backgroundColor = {'#ff9a00'}
            onPress = {this.onLogin.bind(this)}
            title='                      LOGIN                     ' 
          />

          
          { (this.state.signInError == 1) && <Text
              style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'red',marginTop:0}}>
              Please enter valid credentials
          </Text>}
            
        </View>
    );
  }
}
