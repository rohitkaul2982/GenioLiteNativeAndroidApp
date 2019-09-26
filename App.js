import React, { Component } from 'react';
import { Platform, AppState, AsyncStorage, PermissionsAndroid, Linking } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import NavigationService from './NavigationService';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import BackgroundJob from 'react-native-background-job';
import RNFetchBlob from 'rn-fetch-blob';
import paths from './src/Constants';
//import SplashScreen from 'react-native-splash-screen';
import FCM from "react-native-fcm";
import RNFS from "react-native-fs";

// Components
import Login from './src/Login';
import GenioWebView from './src/GenioWebView';
import NewApp from './src/NewApp';
import Offline from './src/Offline';
import ForgotPassword from './src/ForgotPassword';
import RecordingView from './src/RecordingView';


console.ignoredYellowBox = ['Remote debugger'];


const TopLevelNavigator = createStackNavigator(
  {
    Login: Login,
    GenioLite: { screen: GenioWebView},
    NewApp: NewApp,
    Offline: Offline,
    ForgotPassword: ForgotPassword,
    RecordingView: RecordingView,

  },
  {
    initialRouteName: 'Login',
  }
);

const backgroundJob = {
  jobKey: "myJob",
  job: () => uploadRecording()
};

BackgroundJob.register(backgroundJob);

var backgroundSchedule = {
  jobKey: "myJob",
  timeout:20000,
  period:900000,
  persist:true,
  allowExecutionInForeground:true,
  notificationText:"Task in background",
  notificationTitle:"Task in background"
}

BackgroundJob.schedule(backgroundSchedule);

async function uploadRecording() { //Function to upload recording data in background
  console.log("background service")
  var files = await RNFetchBlob.fs.ls("/storage/emulated/0/CallRecords");
  var pusFileArr = [];
  var i = 0;
  var dataFileName = {};

  for (var fileKey in files) {
    pusFileArr.push({
      name: "uploader", filename: files[fileKey], type: "audio/aac", data: RNFetchBlob.wrap("/storage/emulated/0/CallRecords/" + files[fileKey])
    })
    dataFileName[i] = files[fileKey];
    i++;
  }
  pusFileArr.push({ name: "fileData", data: JSON.stringify(dataFileName) });
  RNFetchBlob.fetch('POST', paths.GENIO_URL + '/recordService/contract/updateFileRecord', { 'Content-Type': 'multipart/form-data' }, pusFileArr).then(response => {
    var fileData = [];
    fileData  = JSON.parse(response.data);
    for (var delKey in fileData['retData']) {
      RNFetchBlob.fs.unlink("/storage/emulated/0/CallRecords/" + fileData['retData'][delKey]['rec']).then(() => { 
        
      }).catch((err) => { 

      })
    }
  }).catch((err) => {
    console.log(err);
  })
}

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      appState: AppState.currentState,
      platform:Platform.OS,
      url:'http://accounts.justdial.com/api/redirect.php?',
      token: "",
      tokenCopyFeedback: "",
      initNotif:null,
      recordingname:"",
      callStart: 0, phoneNum:"",compname:""
    }    
    this.recordCalls = this.recordCalls.bind(this);
    this.requestRecordPermission = this.requestRecordPermission.bind(this);
    this.requestPhonePermission = this.requestPhonePermission.bind(this);
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
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  componentWillMount(){
    
  }
  
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);  
    if (Platform.OS === 'android') {
      console.log('android');
      Linking.addEventListener('url', this.handleOpenURL);
    } else {
      Linking.addEventListener('url', this.handleOpenURL);
    }
    
    Rec = async (data) => {
      console.log(data);
      //let audioPath = '/storage/emulated/0/DCIM/filerec.aac';
      let audioPath = "/storage/emulated/0/CallRecords/"+this.state.recordingname;
      console.log(audioPath);
      if (data.state === 'extra_state_offhook') {
        if (this.state.callStart == 1) {
          AudioRecorder.prepareRecordingAtPath(audioPath, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac"
          })

          await AudioRecorder.startRecording();
        }
      } else if (data.state === 'extra_state_idle') {
        if (this.state.callStart == 1) {
          await AudioRecorder.stopRecording();
          var recSplit  = this.state.recordingname.split("-");
          var recName = this.state.recordingname;
          var cityName = recSplit[3].split(".");
          var thisObj   = this;
          RNFetchBlob.fetch('POST', paths.GENIO_URL + '/recordService/contract/addTMERecord', { 'Content-Type': 'application/json' }, JSON.stringify({ parentid: recSplit[0], empcode: recSplit[1], filename: recName, city: cityName[0], recDate: recSplit[2], phoneNum: thisObj.state.phoneNum,compname:thisObj.state.compname})).then(response=>{
            console.log(response);
          })
          this.setState({callStart:0});
        }
      }
    }
    FCM.createNotificationChannel({
      id: 'default',
      name: 'Default',
      description: 'used for example',
      priority: 'high'
    })  

    try {
      let result = await FCM.requestPermissions({
        badge: true,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error(e);
    }

    FCM.subscribeToTopic('geniolite_broadcast');
    //SplashScreen.hide();
    var thisObj = this;
    
  }
  
  handleOpenURL = (event) => { // D
    //this.navigate(event.url);
    console.log(event.url);
  }
  _handleAppStateChange = (nextAppState) => {
    console.log(nextAppState);
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foregroundsssss!')
    } else {
    }
    this.setState({appState: nextAppState});
  }

  async recordCalls(tell,mssg,compname,phoneNum) {
    if (typeof tell !== 'undefined') {
      console.log(tell);
      this.requestRecordPermission(tell, mssg, compname, phoneNum);
    }
  }

  async requestRecordPermission(tell, mssg, compname, phoneNum) {
    try {
      const grantedWrite = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      )
      if (grantedWrite === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the Recording")
        this.requestPhonePermission(tell, mssg, compname, phoneNum);
      } else {
        console.log("WRITE permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  async requestPhonePermission(tell, mssg, compname, phoneNum) {
  try {
    const grantedWrite = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
    )
    if (grantedWrite === PermissionsAndroid.RESULTS.GRANTED) {
	    console.log(mssg);
      RNFetchBlob.fs.isDir("/storage/emulated/0/CallRecords").then((exist)=>{
        if(!exist) {
          RNFetchBlob.fs.mkdir("/storage/emulated/0/CallRecords").then(()=>{
            this.setState({ recordingname: mssg + '.aac', callStart: 1,phoneNum:phoneNum,compname:compname });
          }).catch((err)=>{
            return false;
          });
        } else {
          this.setState({ recordingname: mssg + '.aac', callStart: 1, phoneNum: phoneNum, compname: compname });
        }
      })
      //this.setState({ recordingname: '/storage/emulated/0/DCIM/' + mssg + '.aac', callStart: 1 });
      Linking.openURL('tel:' + tell);
    } else {
      console.log("WRITE permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}
  
  render() {
    var thisObj = this;
    return (
      
        <TopLevelNavigator
          ref={navigatorRef => {
            NavigationService.setTopLevelNavigator(navigatorRef);
        }} screenProps={{recordCalls:thisObj.recordCalls}}
        />
      
    );
  }
} // End of main class


