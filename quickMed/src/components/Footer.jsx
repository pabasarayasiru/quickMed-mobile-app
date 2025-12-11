import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colours from "../constants/colours";

function Footer({ active, userType, setActiveTab }) {
  const handlePress = (tab) => {
    if (tab === "pharmacyIcon" && userType !== "pharmacy") {
      Alert.alert("Access Denied", `Only pharmacy users can access this section`);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => handlePress("pharmacyIcon")}>
        <Ionicons
          name="medkit-outline"
          size={28}
          color={active === "pharmacyIcon" ? colours.primaryLight : colours.black}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("home")}>
        <Ionicons
          name="home-outline"
          size={28}
          color={active === "home" ? colours.primaryLight : colours.black}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("login")}>
        <Ionicons
          name="log-in-outline"
          size={28}
          color={active === "login" ? colours.primaryLight : colours.black}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("profile")}>
        <Ionicons
          name="person-outline"
          size={28}
          color={active === "profile" ? colours.primaryLight : colours.black}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: colours.header,
    paddingBottom: 0, 
  },
});


export default memo(Footer);