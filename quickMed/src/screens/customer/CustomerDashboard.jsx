import React, { useState, useEffect } from "react";
import { View,FlatList, Alert, Linking } from "react-native";
import { searchMedicine, fetchPharmacies, subscribePharmacy, unsubscribePharmacy, subscribeMedicine} from "../../services/api";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import CardItem from "../../components/CardItem";
import Header from "../../components/Header";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db} from "../../services/firebaseConfig";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import colours from "../../constants/colours";
import { showLocalNotification, getExpoPushToken } from "../../services/notifications";

export default function CustomerDashboard({ navigation, setActiveTab, userId, setUserId, setUserType,location }) {
  const [medicine, setMedicine] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
  const [pharmacies, setPharmacies] = useState([]);
  const [subscriptions, setSubscriptions] = useState({}); 
 


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User detected in Dashboard:", user.uid);
        setUserId(user.uid);

        try {
          const pharmacyDoc = await getDoc(doc(db, "pharmacies", user.uid));
          if (pharmacyDoc.exists()) {
            const data = pharmacyDoc.data();
            if (data.role === "pharmacy") {
              setUserType("pharmacy");
              console.log("User Type:", data.role);
            } else {
              const customerDoc = await getDoc(doc(db, "customers", user.uid));
              if (customerDoc.exists()) {
                setUserType("customer");
                console.log("User Type: customer");
              } else {
                setUserType(null);
              }
            }
          } else {
            const customerDoc = await getDoc(doc(db, "customers", user.uid));
            if (customerDoc.exists()) {
              setUserType("customer");
              console.log("User Type: customer");
            } else {
              setUserType(null);
            }
          }
        } catch (err) {
          console.log("Error loading user type in Dashboard:", err);
        }

        try {
          // Query subscribe_pharmacy collection for this user's subscriptions
          const subsQuery = query(
            collection(db, "subscribe_pharmacy"),
            where("userId", "==", user.uid)
          );
          const subsSnapshot = await getDocs(subsQuery);
          const subs = {};

          subsSnapshot.forEach((doc) => {
            const data = doc.data();
            subs[data.pharmacyId] = true;
          });

          setSubscriptions(subs);
          console.log("Loaded Subscriptions:", subs);
        } catch (err) {
          console.log("Error loading subscriptions:", err);
        }

      } else {
        setUserId(null);
        setUserType(null);
        setSubscriptions({});
      }
    });

    return () => unsubscribe();
  }, []);



  const toggleSubscribe = async (pharmacyId, pharmacyName) => {
    if (!userId) {
      Alert.alert("Login Required", "Please log in to subscribe to a pharmacy.");
      setActiveTab("login");
      return;
    }

    const isSubscribed = subscriptions[pharmacyId];

    try {
      if (isSubscribed) {
        const res = await unsubscribePharmacy(pharmacyId, userId);
        if (res && res.success) {
          setSubscriptions((prev) => ({ ...prev, [pharmacyId]: false }));
          showLocalNotification("Unsubscribed", `You unsubscribed from ${pharmacyName} pharmacy`, false);
          Alert.alert("Unsubscribed", "You will no longer receive notifications.");
        } else {
          console.error("Unsubscribe failed:", res?.message);
          Alert.alert("Unsubscribe Failed", res?.message || "Unable to unsubscribe. Try again.");
        }
      } else {
        const res = await subscribePharmacy(pharmacyId, userId);
        if (res && res.success) {
          setSubscriptions((prev) => ({ ...prev, [pharmacyId]: true }));
          showLocalNotification("Subscribed!", `You will now receive updates from ${pharmacyName} pharmacy`, true);
          Alert.alert("Subscribed", "You will now receive stock updates!");
        } else {
          console.error("Subscribe failed:", res?.message);
          Alert.alert("Subscribe Failed", res?.message || "Unable to subscribe. Try again.");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  const handleSubscribeMedicine = async (medicine) => {
    if (!userId) {
      Alert.alert("Login Required", "Please log in to subscribe to medicines.");
      setActiveTab("login");
      return;
    }

    try {
      console.log("Subscribing to medicine:", medicine, "User:", userId);
      const res = await subscribeMedicine(medicine, userId);

      if (res.success) {
        Alert.alert(
          "Subscribed",
          `You will be notified when ${medicine} becomes available.`
        );
        console.log("Medicine subscription successful");
      } else {
        console.error("Subscription failed:", res.message);
        Alert.alert(
          "Subscription Failed",
          res.message || "Unable to subscribe. Please try again."
        );
      }
    } catch (err) {
      console.error("Subscribe error:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to subscribe. Check your connection."
      );
    }
  };

  const handleSearchMedicine = async () => {
    if (!medicine || !medicine.trim()) {
      Alert.alert("Input Error", "Please enter a medicine name");
      return;
    }

    if (!userId) {
      Alert.alert("Login Required", "Please log in to search medicines.");
      setActiveTab("login");
      return;
    }

    try {
      console.log("Searching for medicine:", medicine);
      const res = await searchMedicine(medicine);

      if (res.success && res.results && res.results.length > 0) {
        console.log("Found medicines:", res.results.length);
        navigation.navigate("CustomerMap", {
          results: res.results,
          medicine: medicine,
        });
      } else {
        console.log("Medicine not available:", medicine);
        Alert.alert(
          "Medicine Not Available",
          `${medicine} is currently unavailable. Would you like to subscribe and get notified when it becomes available?`,
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancelled subscription"),
              style: "cancel",
            },
            {
              text: "Subscribe",
              onPress: () => handleSubscribeMedicine(medicine),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Error",
        error.message || "Failed to search. Please try again."
      );
    }
  };



  const loadPharmacies = async (query = "") => {
    try {
      const res = await fetchPharmacies(query, location);
      if (res.success ) {
        setPharmacies(res.results );
      } else {
        setPharmacies([]);
        if (query) Alert.alert("Not found", "No pharmacy found");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  
  useEffect(()=>{
    if(location){
      console.log("Location changed → recompute nearest");
      loadPharmacies();
    }
  },[location]);






  useEffect(() => {
    const timer = setTimeout(() => {
      loadPharmacies(pharmacyName);
    }, 200); 
    return () => clearTimeout(timer);
  }, [pharmacyName]);




  const handleCall = (phone) => {
    Alert.alert(
      "Make a Call",
      `Do you want to call ${phone}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:${phone}`);
          },
        },
      ],
      { cancelable: true }
    );
  };




  return (
    <>
      <Header headerTitle="Dashboard" />
      <View style={{ padding: 15, flex: 1, paddingBottom: 0, }}>

        {/* Medicine Search */}
        <View
          style={{
            backgroundColor: colours.container, 
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            shadowColor: colours.black,
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <CustomInput
            placeholder="Enter medicine"
            value={medicine}
            onChangeText={setMedicine}
          />

          <CustomButton title="Search Medicine" onPress={handleSearchMedicine} />
        </View>        

        {/* Pharmacy Search */}
        <CustomInput
          placeholder="Search pharmacy by name"
          value={pharmacyName}
          onChangeText={setPharmacyName}
        />

        {/* Pharmacy List */}
        <FlatList
          style={{marginTop : 10}}
          data={pharmacies}
          keyExtractor={(item) => item.id}
          initialNumToRender={20}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (

            <CardItem
              item={item}
              onCallPress={() => handleCall(item.phone)}
              subscriptions={subscriptions[item.id]}
              toggleSubscribe={() => toggleSubscribe(item.id, item.name)}
            />

          )}
        />
      </View>
    </>
  );
}







