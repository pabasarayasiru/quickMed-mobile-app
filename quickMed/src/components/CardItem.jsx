import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colours from "../constants/colours";

export default function CardItem({ item, onCallPress, subscriptions, toggleSubscribe }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.nameDistance}>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <TouchableOpacity onPress={toggleSubscribe}>
          <Text style={{ color: subscriptions ? colours.primary : colours.gray, fontWeight: "bold" }}>
            {subscriptions ? "Subscribed" : "Subscribe"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text style={{ color: colours.gray }}>{item.phone}</Text>
        <TouchableOpacity onPress={onCallPress}>
          <Ionicons name="call" size={24} color={colours.primary} />
        </TouchableOpacity>
      </View>

      {item.distance && (
        <Text style={{ marginTop: 5 }}>Distance: {item.distance.toFixed(2)} km</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colours.gray,
    padding: 8,
    paddingHorizontal: 12,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: colours.cardColor
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nameDistance: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
  },
  distance: {
    marginLeft: 10,
    fontSize: 14,
    color: colours.gray,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
});
