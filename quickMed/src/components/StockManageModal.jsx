import React, { memo } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import colours from "../constants/colours";

function StockManageModal({
  visible,
  medicineName,
  quantity,
  setQuantity,
  onSave,
  onCancel,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>📝 Update Stock</Text>

          <CustomInput
            placeholder="Medicine name"
            value={medicineName}
            editable={false}
            style={styles.inputDisabled}
          />

          <CustomInput
            placeholder="Top-up Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <View style={styles.button}>
              <CustomButton title="Save" onPress={onSave} />
            </View>
            <View style={styles.button}>
              <CustomButton title="Cancel" color={colours.gray} onPress={onCancel} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default memo(StockManageModal);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: colours.white,
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 18,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
