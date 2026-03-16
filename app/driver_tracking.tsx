import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ScrollView, Modal, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ref, update, push, set } from 'firebase/database';
import { database } from '../config/firebase';
import MapHUD from '../components/MapHUD';


export default function DriverTrackingScreen() {
  const router = useRouter();
  const { driverId, vehicleId } = useLocalSearchParams();
  const [isTracking, setIsTracking] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [idleTime, setIdleTime] = useState(0);
  const [delayModalVisible, setDelayModalVisible] = useState(false);
  const [delayTime, setDelayTime] = useState('');
  const [delayReason, setDelayReason] = useState('');

  // Fallback if not provided (for development/testing)
  const activeVehicleId = (vehicleId as string) || "TN 01 AF 1234";
  const activeDriverId = (driverId as string) || "Arun Kumar";

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
            const currentSpeed = (loc.coords.speed || 0) * 3.6; // convert to km/h
            setLocation({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude
            });
            setSpeed(currentSpeed);

            // Update Firebase
            const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);
            const newStatus = currentSpeed > 0 ? 'moving' : 'idle';
            update(vehicleRef, {
              driverId: activeDriverId,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speed: currentSpeed.toFixed(1),
              status: currentSpeed > 0 ? 'Moving' : 'Idle',
              lastUpdated: new Date().toISOString()
            }).catch(err => console.error("Firebase update error:", err));

            // Delay Detection Logic
            if (currentSpeed === 0) {
              setIdleTime((prev: number) => {
                const newTime = prev + 3; // loc updates every 3s
                if (newTime >= 600) { // 10 mins = 600 seconds
                  // Create alert logic
                  const alertsRef = ref(database, 'alerts');
                  push(alertsRef, {
                    vehicle: activeVehicleId,
                    message: `Long idle time (10+ mins)`,
                    time: new Date().toISOString()
                  });
                  return 0; // Reset counter after alert
                }
                return newTime;
              });
              setIdleTime(0);
            }
          }
        }
      );
    };

    if (isTracking) {
      startTracking();
    } else if (locationSubscription) {
      (locationSubscription as Location.LocationSubscription).remove();
      // Mark as idle in Firebase
      const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);
      update(vehicleRef, {
        status: 'Idle',
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

  // Task Reporting
  const logTaskEvent = (eventType: string) => {
    // Also update vehicle status when logging events
    const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);
    update(vehicleRef, {
      status: eventType,
      lastUpdated: new Date().toISOString()
    }).catch(err => console.error(err));

    const eventsRef = ref(database, 'events');
    const newEventRef = push(eventsRef);
    set(newEventRef, {
      type: eventType.toLowerCase(),
      vehicle: activeVehicleId,
      driver: activeDriverId,
      timestamp: new Date().toISOString(),
    })
      .then(() => Alert.alert('Success', `Task "${eventType}" logged successfully.`))
      .catch((err: Error) => console.error("Task log error:", err));
  };

  // Delay Reporting
  const submitDelay = () => {
    if (!delayTime || !delayReason) {
      Alert.alert('Error', 'Please enter delay time and reason.');
      return;
    }

    const eventsRef = ref(database, 'events');
    const newEventRef = push(eventsRef);
    set(newEventRef, {
      type: 'delay',
      vehicle: activeVehicleId,
      driver: activeDriverId,
      reason: delayReason,
      minutes: delayTime,
      timestamp: new Date().toISOString()
    })
      .then(() => {
        Alert.alert('Success', 'Delay reported to Admin.');
        setDelayModalVisible(false);
        setDelayTime('');
        setDelayReason('');
      })
      .catch(err => console.error(err));
  };

  const simulateRouteDeviation = () => {
    const alertsRef = ref(database, 'alerts');
    const newAlertRef = push(alertsRef);
    set(newAlertRef, {
      vehicle: activeVehicleId,
      message: `${activeVehicleId} route deviation detected`,
      time: new Date().toISOString()
    })
      .then(() => Alert.alert('Simulated', 'Route deviation alert generated.'))
      .catch(err => console.error(err));
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location ? location.latitude : 11.6643,
          longitude: location ? location.longitude : 78.1460,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={{
            latitude: location ? location.latitude : 11.6643,
            longitude: location ? location.longitude : 78.1460
          }}
          title={activeVehicleId}
          description="Driver Location"
          pinColor="#041627"
        />
      </MapView>

      <MapHUD speed={speed.toFixed(0)} signal="Strong" />

      {/* Task Buttons Panel */}
      <View style={styles.taskPanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.taskScroll}>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Departed')}>
            <Text style={styles.taskButtonText}>Departed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('In Transit')}>
            <Text style={styles.taskButtonText}>In Transit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Arrived')}>
            <Text style={styles.taskButtonText}>Arrived</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.taskButton, { backgroundColor: '#5cb85c' }]} onPress={() => logTaskEvent('Delivery Completed')}>
            <Text style={styles.taskButtonText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.taskButton, { backgroundColor: '#d9534f' }]} onPress={() => setDelayModalVisible(true)}>
            <Text style={styles.taskButtonText}>Log Delay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.taskButton, { backgroundColor: '#fd8b00' }]} onPress={simulateRouteDeviation}>
            <Text style={styles.taskButtonText}>SimDeviation</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Delay Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={delayModalVisible}
        onRequestClose={() => setDelayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Delay</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Delay Minutes (e.g. 15)"
              keyboardType="numeric"
              value={delayTime}
              onChangeText={setDelayTime}
            />
            <TextInput
              style={[styles.modalInput, { height: 100 }]}
              placeholder="Reason for delay (e.g. Heavy Traffic)"
              multiline
              value={delayReason}
              onChangeText={setDelayReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setDelayModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#d9534f' }]}
                onPress={submitDelay}
              >
                <Text style={styles.modalButtonText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.pauseButton, !isTracking && styles.resumeButton, { marginRight: 0 }]}
          onPress={() => setIsTracking(!isTracking)}
        >
          <Text style={styles.pauseButtonText}>
            {isTracking ? 'Pause Tracking' : 'Resume Tracking'}
          </Text>
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
  taskPanel: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 15,
  },
  taskScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  taskButton: {
    backgroundColor: '#041627',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#041627',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
