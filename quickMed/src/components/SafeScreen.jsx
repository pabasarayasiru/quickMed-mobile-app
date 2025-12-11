import React, { memo } from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import colours from "../constants/colours";

function SafeScreen({ children, style, headerTitle, headerComponent, enableBack, onBackPress}) {
  return (
    <SafeAreaView style={styles.safeArea}>

      <Header 
        headerTitle={headerTitle} 
        headerComponent={headerComponent} 
        enableBack={enableBack} 
        onBackPress={onBackPress}
      />

      {/* Main Content */}
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

export default memo(SafeScreen);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colours.white,
  },
  container: {
    flex: 1,
  },
});
