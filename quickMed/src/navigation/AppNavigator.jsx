import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import CustomerMap from "../screens/customer/CustomerMap";
import CustomerDashboard from "../screens/customer/CustomerDashboard";
import UserToggleRegisterScreen from "../screens/UserToggleRegister";
import PharmacyRegister from "../screens/pharmacy/PharmacyRegisterScreen";
import PharmacyDashboard from "../screens/pharmacy/PharmacyDashboard";
import LoginScreen from "../screens/LoginScreen";
import LandingScreen from "../screens/LandingScreen";
import SplashScreen from "../screens/SplashScreen";
import CustomerRegister from "../screens/customer/CustomerRegister";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">


        <Stack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }}/>

        <Stack.Screen name="Login" component={LoginScreen} />


        <Stack.Screen name="PharmacyRegister" component={PharmacyRegister} />
        <Stack.Screen name="CustomerRegister" component={CustomerRegister} />
        <Stack.Screen name="UserToggleRegister" component={UserToggleRegisterScreen} />

        <Stack.Screen name="PharmacyDashboard" component={PharmacyDashboard} />
        <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />

        <Stack.Screen name="CustomerMap" component={CustomerMap} options={{ headerShown: false }}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
