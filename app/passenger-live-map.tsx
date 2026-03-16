import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import Header from '../components/Header';

export default function PassengerLiveMapScreen() {
  const router = useRouter();
  const { vehicleId, route } = useLocalSearchParams();
  const [vehicleLocation, setVehicleLocation] = useState({ latitude: 11.6643, longitude: 78.1460 });
  const [myLocation, setMyLocation] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const setupLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to see your position on the map.');
          return;
        }

        // Get initial location immediately
        let initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        if (isMounted) {
          setMyLocation({
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude
          });
        }

        // Then start watching for updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 1,
          },
          (loc) => {
            if (isMounted) {
              setMyLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
              });
            }
          }
        );
      } catch (error) {
        console.error("Error getting location: ", error);
      }
    };

    setupLocationTracking();

    const vehicleRef = ref(database, `vehicles/${vehicleId}`);
    
    // Subscribe to real-time driver coordinates
    const unsubscribe = onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.latitude && data.longitude && isMounted) {
        setVehicleLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [vehicleId]);

  return (
    <View style={styles.container}>
      <Header title="Live Map" />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: vehicleLocation.latitude,
          longitude: vehicleLocation.longitude,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker
          coordinate={vehicleLocation}
          title={vehicleId as string}
          description={route as string}
          pinColor="#041627"
        />
        {myLocation && (
          <Marker
            coordinate={myLocation}
            title="You"
            pinColor="#fd8b00"
          />
        )}
      </MapView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.trackButton} 
          onPress={() => router.push({
            pathname: '/passenger-tracking',
            params: { vehicleId, route }
          })}
        >
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
