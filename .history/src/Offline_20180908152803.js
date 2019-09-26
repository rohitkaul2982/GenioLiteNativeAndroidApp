import React, {Component} from 'react';
import {View,Text,AsyncStorage,Linking} from 'react-native';
import { Button } from 'react-native-elements';
import paths from './Constants';


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
      return item;
    } catch (error) {
      console.log('retrieveItem newApp',error.message);
    }
    return
  }

  
  

  componentWillMount() {
      const { navigation } = this.props;
      const app_version = navigation.getParam('app_version', null);
      console.log(app_version)
      this.setState({app_version});
  }

  componentDidMount() {    
    
    //SplashScreen.hide();
  }

  componentWillUnmount() {
    
  }

  reload() {
    this.props.navigation.push('Login', {
      app_version: 0.0,
    })
  }
  
  render() {
       
    const self = this;
    return (
        <View style={{
          flex:1,flexDirection:'column',justifyContent:'center',alignItems:'center' ,
          backgroundColor: '#0050ab'}}
        >

          <Text style={{fontFamily:'Helvetica-Light',fontSize: 14,color:'#ffffff',marginTop:0,marginBottom:20,marginRight:40,marginLeft:40}}>
              Hi, Device internet seems to be down.Please check your internet connection or try again later.
          </Text>
          
            
          <Button
            //raised
            loading = {this.state.isLogging}
            loadingRight = {this.state.isLogging}
            //backgroundColor = {'#ff9a00'}
            onPress = {this.reload.bind(this)}
            buttonStyle={{
                backgroundColor: "rgba(92, 99,216, 1)",
                //width: 300,
                //height: 45,
                //borderColor: "transparent",
                //borderWidth: 0,
                borderRadius: 30
            }}
            title='                      Reload                    ' 
          />
            
        </View>
    );
  }
}
