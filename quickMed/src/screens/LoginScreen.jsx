import React, { useState, useEffect } from "react";
import { View, TextInput, Text, Button, Alert, Image } from "react-native";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import colours from "../constants/colours";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import Header from "../components/Header";
import { registerForPushNotificationsAsync } from "../services/notifications";

export default function LoginScreen({ setActiveTab, setUserType, setUserId, setLoggedInEmail, loggedInEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserId(user.uid);
      setLoggedInEmail(maskEmail(user.email));
    } else {
      setLoggedInEmail(null);
    }
  });

    return () => unsubscribe();
  }, []);



  const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    if (!name || !domain) return email;
    return name.substring(0, 1) + "*****@" + domain;
  };



  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(db, "users", user.uid), { token }, { merge: true });
      }



      setUserId(user.uid);
      setLoggedInEmail(maskEmail(user.email));

      //  Check if pharmacy
      const pharmacyDoc = await getDoc(doc(db, "pharmacies", user.uid));
      if (pharmacyDoc.exists()) {
        const data = pharmacyDoc.data();
        if (data.role === "pharmacy") {
          setUserType("pharmacy");
          setActiveTab("pharmacyIcon"); 
          return;
        }
      }

      //  Check if customer
      const customerDoc = await getDoc(doc(db, "customers", user.uid));
      if (customerDoc.exists()) {
        setUserType("customer");
        setActiveTab("home"); 
        return;
      }

      Alert.alert("Access Denied", "Account not found in pharmacy or customer records.");

    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      setUserId(null);
      setUserType(null);
      setActiveTab("login");
      setLoggedInEmail(null);
      Alert.alert("Logged out", "You have been signed out successfully.");
    } catch (error) {
      Alert.alert("Logout failed", error.message);
    }
  };



  return (
    <>
      <Header headerTitle="Login" />

      <View style={{
          padding: 15,
          flex: 1,
          justifyContent: "center",
        }}>

        <View
          style={{
            backgroundColor: colours.white, 
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            borderColor: colours.header,
            borderWidth: 0.5,
            shadowColor: colours.black,
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          {loggedInEmail ? (
          <>
            <Text style={{ marginBottom: 5, fontSize: 17, color: colours.gray, textAlign: "center" }}>
              You are already logged in as
            </Text>
            <Text style={{ marginBottom: 15, fontSize: 17, color: colours.primary, textAlign: "center" }}>
              {loggedInEmail}
            </Text>
          </>

          ) : (
            <Text style={{ marginBottom: 15, fontSize: 17, color: colours.gray, textAlign: "center" }}>
              Please log in to continue
            </Text>
          )}

          <CustomInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />

          <CustomInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureText={true}
          />

          <CustomButton
            title="Login"
            onPress={login}
          />

          {!loggedInEmail && (
              <Text style={{ marginTop: 15, textAlign: "center", color: colours.gray , fontSize: 14}}>
                Don’t have an account?{"  "}
                <Text
                  style={{ color: colours.secondary, fontWeight: "bold" , fontSize: 17}}
                  onPress={() => setActiveTab("profile")}
                >
                  Register here
                </Text>
              </Text>
            )}

          {loggedInEmail && (
            <CustomButton
              title="Logout"
              onPress={logout}
              color={colours.toggleColour}
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </View>
    </>
  );
}
