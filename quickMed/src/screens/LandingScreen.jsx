import React, { useState, useRef, useEffect, use, useId } from "react";
import SafeScreen from "../components/SafeScreen";
import Footer from "../components/Footer";
import CustomerDashboard from "./customer/CustomerDashboard";
import LoginScreen from "./LoginScreen";
import UserToggleRegisterScreen from "./UserToggleRegister";
import { View, Text, Animated, Alert } from "react-native";
import PharmacyDashboard from "./pharmacy/PharmacyDashboard";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { LogBox } from "react-native";
import * as Location from "expo-location";
import { monitorMobileContext } from "../services/mobileNotifications";


LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications (remote notifications)",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);


export default function LandingScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("home");
  const [userType, setUserType] = useState(null); // "pharmacy" or "customer"
  const [userId, setUserId] = useState(null); // Firebase UID
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [location, setLocation] = useState(null);



  const fadeAnim = useRef(new Animated.Value(1)).current;

  // fade animation when switching tabs
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  useEffect(() => {

    (async ()=> {
      await registerForPushNotificationsAsync();

      const f = await Location.requestForegroundPermissionsAsync();
      const b = await Location.requestBackgroundPermissionsAsync();

      if (f.status !== "granted") return Alert.alert("Location Denied");
      if (b.status !== "granted") console.log("Background Location Not Allowed");

      monitorMobileContext(); 

    })();

  }, []);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // wait until first screen content is mounted
    const timeout = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timeout);
  }, []);


  // Fetch location ONCE for whole app 
  useEffect(() => {
    const loadLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Cannot get your location");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    };

    loadLocation();
  }, []); 





  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <CustomerDashboard navigation={navigation} setActiveTab={setActiveTab} userId={userId} setUserId={setUserId} setUserType={setUserType} location={location}/>;

      case "login":
        return (
          <LoginScreen
            setActiveTab={setActiveTab}
            setUserType={setUserType}
            setUserId={setUserId}
            loggedInEmail={loggedInEmail}
            setLoggedInEmail={setLoggedInEmail}
          />
        );

      case "profile":
        return <UserToggleRegisterScreen setActiveTab={setActiveTab} setUserType={setUserType} setUserId={setUserId} />;

      case "pharmacyIcon":
        if (userType === "pharmacy" && userId)
          return <PharmacyDashboard pharmacyId={userId} />;
        else
          return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "red", fontSize: 16 }}>
                Access Denied — Pharmacy users only
              </Text>
            </View>
          );

      default:
        return <CustomerDashboard navigation={navigation} setActiveTab={setActiveTab} userId={userId} setUserId={setUserId} setUserType={setUserType} location={location} />;
    }
  };

  return (
    <SafeScreen>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {!isReady ? (
        <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>
          <Text style={{fontSize:22,color:"gray"}}>Loading...</Text>
        </View>
      ) : (
        renderContent()
      )}
      </Animated.View>

      <Footer active={activeTab} userType={userType} setActiveTab={setActiveTab} />
    </SafeScreen>
  );
}
