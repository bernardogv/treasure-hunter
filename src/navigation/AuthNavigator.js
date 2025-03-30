import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Import your auth screens here
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      {/* 
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
