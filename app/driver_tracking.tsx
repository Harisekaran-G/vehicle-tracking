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
  const { driverId, vehicleId, vehicleType } = useLocalSearchParams();
  const [isTracking, setIsTracking] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [speed, setSpeed] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Idle');
  const [arrivalTime, setArrivalTime] = useState<number | null>(null);
  const [delayAlertSent, setDelayAlertSent] = useState(false);
  const [delayModalVisible, setDelayModalVisible] = useState(false);
  const [delayTime, setDelayTime] = useState('');
  const [delayReason, setDelayReason] = useState('');

  // Fallback if not provided (for development/testing)
  const activeVehicleId = (vehicleId as string) || "TN 01 AF 1234";
  const activeDriverId = (driverId as string) || "Arun Kumar";
  const activeVehicleType = (vehicleType as string) || "supplier";

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
          timeInterval: 5000,
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

            // Update Firebase only with location and speed - status handled by buttons
            const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);
            update(vehicleRef, {
              driverName: activeDriverId,
              vehicleType: activeVehicleType,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speed: currentSpeed.toFixed(1),
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
      // Mark as idle in Firebase
      const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);
      update(vehicleRef, {
        status: 'Idle',
        speed: "0",
        lastUpdated: new Date().toISOString()
      }).catch(err => console.error(err));
      setCurrentStatus('Idle');
    }

    // Delay/Waiting Time interval check
    const waitInterval = setInterval(() => {
      setCurrentStatus(status => {
        setArrivalTime(arrTime => {
          setDelayAlertSent(alertSent => {
            if (status === 'Arrived at Factory' && arrTime) {
              const waitMs = new Date().getTime() - arrTime;
              const waitMins = Math.floor(waitMs / 60000);
              const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);

              update(vehicleRef, { waitingTime: waitMins }).catch(console.error);

              if (waitMins >= 10 && !alertSent) {
                const alertsRef = ref(database, 'alerts');
                push(alertsRef, {
                  vehicleID: activeVehicleId,
                  message: `Truck ${activeVehicleId} waiting at gate for ${waitMins} minutes`,
                  time: new Date().toISOString()
                });
                return true; // Mark alert as sent
              }
            }
            return alertSent;
          });
          return arrTime;
        });
        return status;
      });
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(waitInterval);
      if (locationSubscription) {
        (locationSubscription as Location.LocationSubscription).remove();
      }
    };
  }, [isTracking]);

  // Task Reporting
  const logTaskEvent = (eventType: string) => {
    const timestamp = new Date().toISOString();
    const vehicleRef = ref(database, `vehicles/${activeVehicleId}`);

    let updateData: any = {
      status: eventType,
      lastUpdated: timestamp
    };

    setCurrentStatus(eventType);

    if (eventType === 'Arrived at Factory') {
      const nowMs = new Date().getTime();
      updateData.arrivalTime = timestamp;
      updateData.waitingTime = 0;
      setArrivalTime(nowMs);
      setDelayAlertSent(false); // Reset delay alert

      // Push arrival event
      const eventsRef = ref(database, 'events');
      push(eventsRef, {
        type: 'arrival',
        vehicleID: activeVehicleId,
        driver: activeDriverId,
        time: timestamp
      });

    } else if (eventType === 'Departed') {
      updateData.departureTime = timestamp;
      updateData.waitingTime = 0;
      setArrivalTime(null); // Clear waiting time tracker

      // Push departure event
      const eventsRef = ref(database, 'events');
      push(eventsRef, {
        type: 'departure',
        vehicleID: activeVehicleId,
        time: timestamp
      });
    }

    update(vehicleRef, updateData)
      .then(() => Alert.alert('Status Updated', `Status changed to ${eventType}`))
      .catch(err => console.error(err));
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
      vehicleID: activeVehicleId,
      driver: activeDriverId,
      reason: delayReason,
      minutes: delayTime,
      time: new Date().toISOString()
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
      vehicleID: activeVehicleId,
      message: `Vehicle ${activeVehicleId} route deviation detected`,
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
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('En Route')}>
            <Text style={styles.taskButtonText}>En Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Arrived at Factory')}>
            <Text style={styles.taskButtonText}>Arrived</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Loading')}>
            <Text style={styles.taskButtonText}>Loading</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Unloading')}>
            <Text style={styles.taskButtonText}>Unloading</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Departed')}>
            <Text style={styles.taskButtonText}>Departed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.taskButton} onPress={() => logTaskEvent('Idle')}>
            <Text style={styles.taskButtonText}>Idle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.taskButton, { backgroundColor: '#d9534f' }]} onPress={() => setDelayModalVisible(true)}>
            <Text style={styles.taskButtonText}>Log Delay</Text>
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
