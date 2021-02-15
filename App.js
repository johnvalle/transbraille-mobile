import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CameraScreen from "./screens/CameraScreen";
import DashboardScreen from "./screens/DashboardScreen";
import BrailleTextScreen from "./screens/BrailleTextScreen"

export default function App() {

  const RootStack = createStackNavigator();

  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Dashboard">
        <RootStack.Screen name="Transbraille" component={DashboardScreen} options={{ headerShown: false }} />
        <RootStack.Screen name="Camera" component={CameraScreen} options={{ headerShown: true, headerStyle: { height: 80 } }} />
        <RootStack.Screen name="BrailleText" component={BrailleTextScreen} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}