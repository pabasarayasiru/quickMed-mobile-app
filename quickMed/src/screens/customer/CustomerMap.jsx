import React, { useState, useEffect } from "react";
import { View} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location"; 
import SafeScreen from "../../components/SafeScreen";
import StockModal from "../../components/StockModal";

export default function CustomerMap({ route }) {
  const { results, medicine } = route.params; 
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Get current user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);


  // Default map region 
  const initialRegion =
  userLocation ||
  (results.length < 0
    ? {
        latitude: results[0].location._latitude,
        longitude: results[0].location._longitude,
        latitudeDelta: 2, 
        longitudeDelta: 2,
      }
    : {
        latitude: 7.8731,  
        longitude: 80.7718,
        latitudeDelta: 2.5,  
        longitudeDelta: 2.5,
      });

  return (
    <SafeScreen headerTitle={`Pharmacies with "${medicine}"`} enableBack={true}>
      <View style={{ flex: 1 , borderRadius: 0, overflow: 'hidden' , borderColor: 'grey', borderWidth: 1}}>
        {initialRegion && (
          <MapView
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            showsUserLocation={true}  
            showsMyLocationButton={true} 
            zoomControlEnabled={true} 
            zoomEnabled={true}        
            scrollEnabled={true}
          >
            {/* Show pharmacy markers */}
            {results.map((item, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: item.location._latitude,
                  longitude: item.location._longitude,
                }}
                onPress={() => setSelectedPharmacy(item)} 
              />
            ))}
          </MapView>
        )}

        {/*  Modal for pharmacy details */}

        <StockModal
          visible={!!selectedPharmacy}
          pharmacy={selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
     
      </View>
    </SafeScreen>
  );
}
