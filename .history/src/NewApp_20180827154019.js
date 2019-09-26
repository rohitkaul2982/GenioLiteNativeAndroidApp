import React, {Component} from 'react';
import {View,Text,AsyncStorage,Linking} from 'react-native';
import { Button } from 'react-native-elements';

//console.ignoredYellowBox = ['Remote debugger'];

export default class NewApp extends Component {

  static navigationOptions = { title: 'New app available', header: null };

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
            signInError:0,
            app_version:null
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
      const { navigation } = this.props;
      const app_version = navigation.getParam('app_version', null);
      this.setState({app_version});
  }

  componentDidMount() {    
    
    //SplashScreen.hide();
  }

  componentWillUnmount() {
    
  }

  onDownload() {
    //var url = 'itms-services://?action=download-manifest&url=https://labs.justdial.com/genio_lite/GenioLite.plist';
    var url = "http://lite.genio.in/geniolite/app.html";
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  }
  
  render() {
       
    const self = this;
    return (
        <View style={{
          flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center' ,
          backgroundColor: '#0050ab'}}
        >

          <Text style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'#ffffff',marginTop:0,marginBottom:20}}>
              Newer version of Geniolite ({this.state.app_version}) is now available.
          </Text>
          
            
          <Button
            raised
            loading = {this.state.isLogging}
            loadingRight = {this.state.isLogging}
            backgroundColor = {'#ff9a00'}
            onPress = {this.onDownload.bind(this)}
            title='                      Download                     ' 
          />
            
        </View>
    );
  }
}
