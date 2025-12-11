import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, doc, setDoc } from "../../services/firebaseConfig";
import { registerCustomer } from "../../services/api";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { registerForPushNotificationsAsync } from "../../services/notifications";

export default function CustomerRegister({ setActiveTab, setUserType, setUserId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const register = async () => {
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(db, "users", userCred.user.uid), { token }, { merge: true });
      }    

      await registerCustomer(userCred.user.uid, email);
      Alert.alert("Success", "Customer registered");
      setUserType("customer");
      setActiveTab("home"); 
      setUserId(userCred.user.uid);
      
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <View style={{ padding: 15, flex: 1, paddingBottom: 0,}}>

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
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

      <CustomButton
        title="Register"
        onPress={register}
      />
    </View>
  );
}
