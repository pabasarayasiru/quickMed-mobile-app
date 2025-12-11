import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  addStock,
  updateStock,
  deleteStock,
  fetchStocks,
  getPharmacyById
} from "../../services/api";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import StockList from "../../components/StockList";
import StockManageModal from "../../components/StockManageModal";
import Header from "../../components/Header";
import colours from "../../constants/colours";

export default function PharmacyDashboard({ route, pharmacyId: propId  }) {
  const pharmacyId = propId || route?.params?.pharmacyId;

  // Add stock state
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");

  // Update stock state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateMedicineName, setUpdateMedicineName] = useState("");
  const [updateQuantity, setUpdateQuantity] = useState("1");
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  // Stock and search
  const [stock, setStock] = useState([]);
  const [search, setSearch] = useState("");

  const [pharmacyName, setPharmacyName] = useState("");




  // Add stock
  const handleAdd = async () => {
    if (!medicine) return Alert.alert("Enter medicine name");
    try {
      const res = await addStock(pharmacyId, medicine, parseInt(quantity));
      if (!res.success) return Alert.alert("Error", res.error || "Cannot add medicine");
      Alert.alert("Added", `${medicine} added to stock`);
      setMedicine("");
      setQuantity("");
      loadStocks(); 

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Open update modal
  const openUpdateModal = (item) => {
    setSelectedMedicineId(item.id);
    setUpdateMedicineName(item.name);
    setUpdateQuantity(item.quantity.toString());
    setUpdateModalVisible(true);
  };


  const loadPharmacyDetails = async () => {
    try {
      const res = await getPharmacyById(pharmacyId);
      if (res && res.success) {
        setPharmacyName(res.name || "Unnamed Pharmacy");
      } else if (res.name) {
        setPharmacyName(res.name);
      } else {
        setPharmacyName("Unknown Pharmacy");
      }
    } catch (error) {
      console.error("Error loading pharmacy:", error);
      setPharmacyName("Error loading name");
    }
  };


  // Update stock
  const handleUpdate = async () => {
    if (!selectedMedicineId) return Alert.alert("No medicine selected");
    try {
      await updateStock(pharmacyId, updateMedicineName, parseInt(updateQuantity));
      Alert.alert("Updated", `${updateMedicineName} stock updated`);
      setUpdateModalVisible(false);
      loadStocks(); 

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Delete stock
  const handleDelete = (medicineId, name) => {
    Alert.alert("Confirm Delete", `Are you sure you want to delete ${name}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStock(pharmacyId, medicineId);
            Alert.alert("Deleted", `${name} removed from stock`);
            if (medicineId === selectedMedicineId) setUpdateModalVisible(false);
            loadStocks();

          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };



  const loadStocks = async (query = "") => {
    try {
      const res = await fetchStocks(pharmacyId, query);

      if (res && res.success && res.results) {
        setStock(res.results);
      } 
    
      else if (Array.isArray(res)) {
        setStock(res);
      } 
      else {
        setStock([]);
        if (query) Alert.alert("Not found", "No stock found");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };


  useEffect(() => {
    if (pharmacyId) {
      loadPharmacyDetails();
      loadStocks();
    }
  }, [pharmacyId]);


    useEffect(() => {
      const timer = setTimeout(() => {
        loadStocks(search);
      }, 300); 
      return () => clearTimeout(timer);
    }, [search]);

  return (
    <>
      <Header headerTitle={pharmacyName} />
      <View style={{ padding: 15, flex: 1, paddingBottom: 0, }}>

        {/* --- Add Stock --- */}
        <View
          style={{
            backgroundColor: colours.container, 
            borderRadius: 12,
            padding: 10,
            marginBottom: 10,
            shadowColor: colours.black,
            shadowOffset: { width: 2, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
            ➕ Add New Medicine
          </Text>

          <CustomInput
            placeholder="Medicine name"
            value={medicine}
            onChangeText={setMedicine}
          />
          <CustomInput
            placeholder="Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
          />

          <CustomButton title="Add Stock" onPress={handleAdd} />
        </View>


        {/* --- Search --- */}
        <CustomInput
            placeholder="Search medicine"
            value={search}
            onChangeText={setSearch}
            style={{ marginRight: 80}}
        />


        {/* --- Stock List --- */}
        <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>📦 Current Stock</Text>
        <StockList
          stock={stock}
          openUpdateModal={openUpdateModal}
          handleDelete={handleDelete}
        />

        {/* --- Update Modal --- */}
        <StockManageModal
          visible={updateModalVisible}
          medicineName={updateMedicineName}
          quantity={updateQuantity}
          setQuantity={setUpdateQuantity}
          onSave={handleUpdate}
          onCancel={() => setUpdateModalVisible(false)}
        />
      </View>   
    </>
  );
}



