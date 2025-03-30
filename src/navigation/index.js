import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MerchantNavigator from './MerchantNavigator';

const RootStack = createStackNavigator();

const Navigation = () => {
  // You would check here if the user is authenticated
  const isAuthenticated = false;
  const isMerchant = false;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : isMerchant ? (
        <RootStack.Screen name="MerchantApp" component={MerchantNavigator} />
      ) : (
        <RootStack.Screen name="MainApp" component={MainNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default Navigation;
