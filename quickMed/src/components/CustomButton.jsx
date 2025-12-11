import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colours from "../constants/colours";

export default function CustomButton({ title, color = colours.primary, style = {}, ...props }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    alignItems: "center",
    borderColor: colours.header,
    borderWidth: 1,
  },
  text: {
    color: colours.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
