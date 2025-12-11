import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; 
import colours from "../constants/colours";

export default function CustomInput({
  value,
  onChangeText,
  placeholder = "",
  color = colours.gray,
  style = {},
  secureText = false, 
  ...props
}) {
  const [isSecure, setIsSecure] = useState(secureText);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={color}
        secureTextEntry={isSecure}
        style={[styles.input, style]}
        {...props}
      />
      {secureText && (
        <TouchableOpacity
          onPress={() => setIsSecure(!isSecure)}
          style={styles.icon}
        >
          <Ionicons
            name={isSecure ? "eye-off" : "eye"}
            size={24}
            color={colours.gray}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    marginTop: 10,
    borderWidth: 1,
    borderColor: colours.gray,
    borderRadius: 5,
  },
  input: {
    padding: 10,
    paddingRight: 20,
    fontSize: 16,
    color: colours.black,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
});
