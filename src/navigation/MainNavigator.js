import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import your main screens here
// import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
// import MessagingScreen from '../screens/messaging/ConversationsScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator>
      {/*
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Messages" component={MessagingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      */}
    </Tab.Navigator>
  );
};

export default MainNavigator;
