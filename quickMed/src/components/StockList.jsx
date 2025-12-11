import React, { memo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colours from "../constants/colours";

const StockRow = memo(({ item, openUpdateModal, handleDelete }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.itemName}>{item.displayName || item.name}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
        <MaterialIcons name="delete" size={22} color={colours.warning} />
      </TouchableOpacity>
    </View>
    <View style={styles.row}>
      <Text style={styles.stockText}>
        Stock: <Text style={styles.stockCount}>{item.quantity}</Text>
      </Text>
      <TouchableOpacity onPress={() => openUpdateModal(item)}>
        <MaterialIcons name="edit" size={22} color={colours.editIcon} />
      </TouchableOpacity>
    </View>
  </View>
));

export default function StockList({ stock, openUpdateModal, handleDelete }) {
  return (
    <FlatList
      data={stock}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StockRow item={item} openUpdateModal={openUpdateModal} handleDelete={handleDelete} />
      )}

      // SPEED BOOSTERS 🔥
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      removeClippedSubviews
      windowSize={8}
      getItemLayout={(d, i) => ({ length: 90, offset: 90 * i, index: i })}
    />
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: colours.cardColor,
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: colours.gray,
    shadowColor: colours.black,
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colours.black,
  },
  stockText: {
    marginTop: 4,
    color: colours.gray,
  },
  stockCount: {
    fontWeight: "600",
    color: colours.black,
  },
});
