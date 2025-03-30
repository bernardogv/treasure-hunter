import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import your merchant screens here
// import DashboardScreen from '../screens/merchant/DashboardScreen';
// import InventoryScreen from '../screens/merchant/InventoryScreen';
// import OffersScreen from '../screens/merchant/OffersScreen';

const Tab = createBottomTabNavigator();

const MerchantNavigator = () => {
  return (
    <Tab.Navigator>
      {/*
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      */}
    </Tab.Navigator>
  );
};

export default MerchantNavigator;
