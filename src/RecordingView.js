import React, {Component} from 'react';
import {View,Text,AsyncStorage,PermissionsAndroid,StyleSheet,NetInfo,Keyboard,Platform} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Card, Header, Icon, ListItem } from 'react-native-elements';
import md5 from 'react-native-md5';
import DeviceInfo from 'react-native-device-info';

import paths from './Constants';
import RNFetchBlob from 'rn-fetch-blob';



export default class RecordingView extends Component {

  static navigationOptions = { title: 'Welcome', header: null };

  constructor(props){
    super(props);
    this.state={
            isConnected:true,
            text:'',
            loginUrl:'http://accounts.justdial.com/api/serviceAuth.php?',
            //loginUrl:'http://vivek.jdsoftware.com/SSO/api/serviceAuth.php?',
            isLogging:false,
            isLoggedIn:false,
            signInError:0,
            current_app_version:paths.APP_VERSION,
            recordingArr:[],
            empcode:""
    }
    
  }

  
  

  componentWillMount() {
    var self = this;
    //registerAppListener(self.props.navigation);
    //this.getVersion();
    const { navigator } = this.props.navigation;
    var empcode = this.props.navigation.getParam('empcode', null)
    this.setState({ empcode: empcode });
  }

  componentDidMount() {         
    //SplashScreen.hide();
    var thisObj = this;
    setTimeout(() => {
      thisObj.showRecordings();
    }, 100);
  }

  componentWillUnmount() {

      
  }

  async showRecordings() {
    var files = await RNFetchBlob.fs.ls("/storage/emulated/0/CallRecords");
    console.log(files); 
    this.setState({recordingArr:[]});
    var objAsgn = Object.assign(this.state);
    
    for(var key in files) {
      objAsgn['recordingArr'][key] = {};
      var recSpl = files[key].split("-");
      var dateSpl = recSpl[2].split("_");
      var newDateStr = "";
      for (var dateKey in dateSpl) {
        if (dateKey >= 3) {
          if(dateKey == 3) {
            newDateStr = newDateStr.replace(/-\s*$/, "");  
            newDateStr += " " + dateSpl[dateKey] + ":";
          } else {
            newDateStr += dateSpl[dateKey] + ":";
          }
        } else {
          newDateStr += dateSpl[dateKey] + "-";
        }
      }
      newDateStr = newDateStr.replace(/:\s*$/, "");
      objAsgn['recordingArr'][key]['date'] = newDateStr;
      objAsgn['recordingArr'][key]['parentid'] = recSpl[0];
      objAsgn['recordingArr'][key]['recName'] = files[key];
    }
    this.setState({ recordingArr: objAsgn['recordingArr']});
  }
  returnBack() {
    this.props.navigation.push('GenioLite', {
      employeeID: this.state.empcode,
    })
  }
  uploadrec(files) {
    this.setState({ isOverlay:1});
    var thisObj = this;
    var pusFileArr = [];
    var dataFileName = {};
    
    pusFileArr.push({
      name: "uploader", filename: files, type: "audio/aac", data: RNFetchBlob.wrap("/storage/emulated/0/CallRecords/" + files)
    })
    dataFileName[0] = files;
    pusFileArr.push({ name: "fileData", data: JSON.stringify(dataFileName) });
    RNFetchBlob.fetch('POST', paths.GENIO_URL + '/recordService/contract/updateFileRecord', { 'Content-Type': 'multipart/form-data' }, pusFileArr).then(response => {
      var fileData = [];
      fileData = JSON.parse(response.data);
      for (var delKey in fileData['retData']) {
        RNFetchBlob.fs.unlink("/storage/emulated/0/CallRecords/" + fileData['retData'][delKey]['rec']).then(() => {
          thisObj.showRecordings();
          thisObj.setState({ isOverlay: 0 });
          //return false;
        }).catch((err) => {
          this.setState({ isOverlay: 0 });
        })
      }
    }).catch((err) => {
      console.log(err);
      this.setState({ isOverlay: 0 });
    })
  }
  render() {
    const self = this;
    return (
      <View style={{height:"100%",flex:1}}>
        <Header
          statusBarProps={{ barStyle: 'light-content' }} 
          outerContainerStyles={{ height: Platform.OS === 'ios' ? 70 : 70 - 24, backgroundColor:"#0090b5" }}
          leftComponent={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
              name="arrow-back"
              type="MaterialCommunityIcons"
              color="#FFFFFF"
              onPress={this.returnBack.bind(this)} 
              onLongPress={this.returnBack.bind(this)} />
              <Text style={{color:"#FFFFFF",fontSize:15,marginLeft:15}}>Call Recordings</Text>
            </View>
          }
        />
        <View style={{backgroundColor:"#FFFFFF",marginTop:10}}>
            {self.state.recordingArr.map((u, i) => {
              return (
                <ListItem
                  key={i}
                  title={u.date}
                  subtitle={u.parentid}
                  leftIcon={{ name: "file-upload", type:"MaterialCommunityIcons",color:"#000000" }}
                  onPress={() => self.uploadrec(u.recName)}
                />
              );
              })
            }
        </View>
        {self.state.isOverlay == 1 &&
          <View style={ContainerStyles.overlay}>

            <Icon
              raised
              name={"file-upload"}
              type='MaterialCommunityIcons'
              color='red'
            />
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 15 }}>Uploading Recording</Text>
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
    alignItems: 'center'
  }
});
