import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db, doc, setDoc } from "../../services/firebaseConfig";
import { registerPharmacy } from "../../services/api";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import colours from "../../constants/colours";
import { registerForPushNotificationsAsync } from "../../services/notifications";

export default function PharmacyRegister({ setActiveTab, setUserType, setUserId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [marker, setMarker] = useState(null);
  const [region, setRegion] = useState(null);


  const mapRef = useRef(null);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, 
        maximumAge: 1000, 
    });
    const newRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setRegion(newRegion);
    setMarker({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500); 
    }
  };


  useEffect(() => {
    getCurrentLocation();
  }, []);

  const register = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!marker) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }
    if (!phone) {
      Alert.alert("Error", "Phone number is required");
      return;
    }

    if (!/^\d{9,12}$/.test(phone)) {
      Alert.alert("Error", "Phone number must be between 9 and 12 digits");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(db, "users", user.uid), { token }, { merge: true });
      }      

      await registerPharmacy(user.uid, name, phone, marker.latitude, marker.longitude);

      Alert.alert("Registration successful");
      setUserType("pharmacy");
      setActiveTab("pharmacyIcon");
      setUserId(user.uid);
      
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <View style={{ padding: 15, flex: 1, paddingBottom: 20,}}>

      <CustomInput
        placeholder="Pharmacy Name"
        value={name}
        onChangeText={setName}
      />
      <CustomInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureText={true} 
      />
      <CustomInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureText={true}
      />

      {/* Map Picker */}
      {region && (
        <View style={{ marginBottom: 10 , marginTop: 10, borderRadius: 12, overflow: "hidden", borderColor: colours.gray, borderWidth: 1 }}>
          <MapView
            ref={mapRef}
            style={{ height: 250 }}
            initialRegion={region}
            onPress={(e) => setMarker(e.nativeEvent.coordinate)} 
            cacheEnabled={true}
            loadingEnabled={true}
            showsMyLocationButton={true}
          >
            {marker && <Marker coordinate={marker} draggable onDragEnd={(e) => setMarker(e.nativeEvent.coordinate)} />}
          </MapView>

          {/* Floating My Location Button */}
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={getCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <CustomButton 
        title="Register" 
        onPress={register} 
      />

    </View>
  );
}

const styles = StyleSheet.create({
  myLocationButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: colours.secondary,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});
