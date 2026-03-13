import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ref, update } from 'firebase/database';
import { database } from '../config/firebase';
import MapHUD from '../components/MapHUD';

export default function DriverTrackingScreen() {
  const router = useRouter();
  const [isTracking, setIsTracking] = useState(true);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [speed, setSpeed] = useState(0);

  // Mocked IDs
  const vehicleId = "AF-402";
  const driverId = "DRV-001";

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 1,
        },
        (loc) => {
          if (isTracking) {
            const currentSpeed = (loc.coords.speed || 0) * 2.23694; // convert to mph
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude
            });
            setSpeed(currentSpeed);

            // Update Firebase
            const vehicleRef = ref(database, `vehicles/${vehicleId}`);
            update(vehicleRef, {
              driverId: driverId,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speed: currentSpeed.toFixed(1),
              fuelLevel: '78%',
              status: currentSpeed > 0 ? 'Moving' : 'Stopped',
              lastUpdated: new Date().toISOString()
            }).catch(err => console.error("Firebase update error:", err));
          }
        }
      );
    };

    if (isTracking) {
      startTracking();
    } else if (locationSubscription) {
      (locationSubscription as Location.LocationSubscription).remove();
      // Mark as stopped in Firebase
      const vehicleRef = ref(database, `vehicles/${vehicleId}`);
      update(vehicleRef, {
        status: 'Stopped',
        speed: "0",
        lastUpdated: new Date().toISOString()
      }).catch(err => console.error(err));
    }

    return () => {
      if (locationSubscription) {
        (locationSubscription as Location.LocationSubscription).remove();
      }
    };
  }, [isTracking]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.latitude : 37.78825,
          longitude: location ? location.longitude : -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{ 
            latitude: location ? location.latitude : 37.78825, 
            longitude: location ? location.longitude : -122.4324 
          }}
          title="Vehicle Location"
          pinColor="#fd8b00"
        />
      </MapView>

      <MapHUD speed={speed.toFixed(0)} signal="Strong" fuel="78%" />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.pauseButton, !isTracking && styles.resumeButton]} 
          onPress={() => setIsTracking(!isTracking)}
        >
          <Text style={styles.pauseButtonText}>
            {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={() => router.push('/driver-notifications')}
        >
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041627',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  pauseButton: {
    flex: 1,
    backgroundColor: '#d9534f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  resumeButton: {
    backgroundColor: '#5cb85c',
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#041627',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
