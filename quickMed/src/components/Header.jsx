import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colours from "../constants/colours";
import { useMemo } from "react";

export default function Header({ 
  headerTitle, 
  headerComponent, 
  enableBack = false, 
  onBackPress 
}) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const showHeader = useMemo(() => headerTitle || headerComponent, [headerTitle, headerComponent]);


  if (!showHeader) return null;

  return (
    <View style={styles.container}>
      {enableBack && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colours.white} />
        </TouchableOpacity>
      )}

      {headerComponent ? (
        <View style={styles.header}>{headerComponent}</View>
      ) : (
        <View style={styles.header}>
          <Text style={styles.headerText}>{headerTitle}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 65,
    backgroundColor: colours.header,
    borderBottomWidth: 2,
    borderBottomColor: colours.primaryBorder,
    paddingHorizontal: 10,
  },
  backButton: {
    marginRight: 3,
    padding: 0,
  },
  header: {
    flex: 1,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
    color: colours.white,
    textAlign: "left",
    paddingLeft: 10,
  },
});
