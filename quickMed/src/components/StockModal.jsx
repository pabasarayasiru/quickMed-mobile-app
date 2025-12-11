import React, { memo } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import colours from "../constants/colours";

function StockModal({ visible, pharmacy, onClose }) {
  if (!pharmacy) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{pharmacy.pharmacyName}</Text>
          <Text style={styles.stock}>
            {pharmacy.medicine}: {pharmacy.stock} in stock
          </Text>
          <Text
            style={styles.phone}
            onPress={() => Linking.openURL(`tel:${pharmacy.phone}`)}
          >
            📞 Call {pharmacy.phone}
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default memo(StockModal);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 280,
    padding: 20,
    backgroundColor: colours.cardColor,
    borderRadius: 12,
    alignItems: "center",
  
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
  },
  stock: {
    fontSize: 16,
    marginBottom: 10,
  },
  phone: {
    color: colours.secondary,
    fontSize: 16,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: colours.toggleColour,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
