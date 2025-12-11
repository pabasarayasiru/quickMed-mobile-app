import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import CustomerRegister from "./customer/CustomerRegister";
import PharmacyRegister from "./pharmacy/PharmacyRegisterScreen";
import Header from "../components/Header";
import colours from "../constants/colours";

export default function UserToggleRegisterScreen({
  setActiveTab,
  setUserType,
  setUserId,
}) {
  const [selectedRole, setSelectedRole] = useState("customer");
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleRole = (role) => {
    setSelectedRole(role);
    Animated.spring(slideAnim, {
      toValue: role === "customer" ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <>
      <Header headerTitle={"Register"} />
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.toggleContainer}>
          <Animated.View
            style={[
              styles.activeBackground,
              { transform: [{ translateX }] },
            ]}
          />
          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => toggleRole("customer")}
          >
            <Text
              style={[
                styles.toggleText,
                selectedRole === "customer" && styles.activeText,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toggleOption}
            onPress={() => toggleRole("pharmacy")}
          >
            <Text
              style={[
                styles.toggleText,
                selectedRole === "pharmacy" && styles.activeText,
              ]}
            >
              Pharmacy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Form */}
        <View style={{ flex: 1, width: "100%" }}>
          {selectedRole === "customer" ? (
            <CustomerRegister
              setActiveTab={setActiveTab}
              setUserType={setUserType}
              setUserId={setUserId}
            />
          ) : (
            <PharmacyRegister
              setActiveTab={setActiveTab}
              setUserType={setUserType}
              setUserId={setUserId}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
}





const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 18,
    backgroundColor: colours.white,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  toggleContainer: {
    flexDirection: "row",
    width: "90%",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    position: "relative",
    marginBottom: 5,
    overflow: "hidden",
    borderColor: colours.gray,
    borderWidth: 1,
  },
  activeBackground: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: colours.toggleColour,
    borderRadius: 10,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 16,
    color: colours.gray,
    fontWeight: "600",
  },
  activeText: {
    color: colours.white,
  },
});
