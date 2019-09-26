import React, { Component } from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from 'react-navigation';


// import module
//import SplashScreen from 'react-native-splash-screen';

// Components
import Login from './src/Login';
import GenioWebView from './src/GenioWebView';

//console.ignoredYellowBox = ['Remote debugger'];

const RootStack = createStackNavigator(
  {
    Login: Login,
    GenioLite: GenioWebView,
  },
  {
    initialRouteName: 'Login',
  }
);

export default class App extends Component {

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  componentDidMount() {
    //SplashScreen.hide();
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(nextAppState)
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({appState: nextAppState});
  }
  
  render() {
    return (
      <RootStack />
    );
  }
} // End of main class


