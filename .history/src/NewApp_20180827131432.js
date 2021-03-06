import React, {Component} from 'react';
import {StyleSheet,View,Text,AsyncStorage,Linking} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { Button } from 'react-native-elements';
import md5 from 'react-native-md5';



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
        
    // this.retrieveItem('genio_empcode').then((empcode)=>{
    //   console.log('retrieveItem', empcode)
    //   if(empcode){
    //     self.props.navigation.push('GenioLite', {
    //       employeeID: empcode,
    //     })
    //   }else{
    //     self.setState({isLogging:false,isLoggedIn:true})
    //   }
    // }).catch((error)=>{
    //   console.log('Promise is rejected with error: ' + error);
    // })
  }

  componentDidMount() {    
    
    //SplashScreen.hide();
  }

  componentWillUnmount() {
    
  }

  onDownload() {
    //var url = 'itms-services://?action=download-manifest&url=https://labs.justdial.com/genio_lite/GenioLite.plist';
    var url = 'www.google.com';
    Linking.openURL(url).catch(err => console.error('An error occurred', err));
  }
  
  render() {
       
    const self = this;
    return (
        <View style={{
          flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center' ,
          backgroundColor: '#0050ab'}}
        >

          <Text style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'#ffffff',marginTop:0}}>
              Newer version of Geniolite app is now available.
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
