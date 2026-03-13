import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import Header from '../components/Header';

export default function PassengerLiveMapScreen() {
  const router = useRouter();
  const [vehicleLocation, setVehicleLocation] = useState({ latitude: 37.78825, longitude: -122.4324 });
  const vehicleId = "AF-402";

  useEffect(() => {
    const vehicleRef = ref(database, `vehicles/${vehicleId}`);
    
    // Subscribe to real-time driver coordinates
    const unsubscribe = onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.latitude && data.longitude) {
        setVehicleLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    });

    return () => {
      // Need to invoke unsubscribe directly rather than off() without callback handling
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Live Map" />
      <MapView
        style={styles.map}
        region={{
          latitude: vehicleLocation.latitude,
          longitude: vehicleLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
      >
        <Marker
          coordinate={vehicleLocation}
          title={vehicleId}
          description="Downtown Express"
          pinColor="#041627"
        />
        <Marker
          coordinate={{ latitude: 37.77825, longitude: -122.4124 }}
          title="You"
          pinColor="#fd8b00"
        />
      </MapView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.trackButton} onPress={() => router.push('/passenger-tracking')}>
          <Text style={styles.trackButtonText}>Track Vehicle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  trackButton: {
    backgroundColor: '#041627',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
