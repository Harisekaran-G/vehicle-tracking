import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import Header from '../components/Header';

interface VehicleData {
  driverId: string;
  speed: string;
  fuelLevel: string;
  status: string;
  delayMinutes?: string;
  delayReason?: string;
}
export default function PassengerTrackingScreen() {
  const { vehicleId, route } = useLocalSearchParams();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  useEffect(() => {
    if (!vehicleId) return;

    const vehicleRef = ref(database, `vehicles/${vehicleId}`);

    const unsubscribe = onValue(vehicleRef, (snapshot) => {
      const data = snapshot.val();
      setVehicleData(data);
    });

    return () => unsubscribe();
  }, [vehicleId]);

  return (
    <View style={styles.container}>
      <Header title="Vehicle Telemetry" />
      <View style={styles.content}>
        {vehicleData?.delayMinutes && (
          <View style={styles.delayCard}>
            <Text style={styles.delayTitle}>⚠️ Delay Reported</Text>
            <Text style={styles.delayText}>
              Approx. {vehicleData.delayMinutes} mins delay due to: {vehicleData.delayReason}
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.label}>Vehicle & Route</Text>
          <Text style={styles.value}>{vehicleId}</Text>
          <Text style={styles.routeText}>{route}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Driver Name</Text>
          <Text style={styles.value}>{vehicleData?.driverId || 'Loading...'}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.label}>Speed</Text>
            <Text style={styles.value}>
              {vehicleData ? `${vehicleData.speed} km/h` : '--'}
            </Text>
          </View>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.label}>Fuel Level</Text>
            <Text style={styles.value}>
              {vehicleData?.fuelLevel || '78%'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Route Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>65% Completed</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
  },
  content: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  flexCard: {
    flex: 0.48,
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#041627',
  },
  routeText: {
    fontSize: 16,
    color: '#fd8b00',
    fontWeight: '600',
    marginTop: 4,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fd8b00',
    width: '65%',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  delayCard: {
    backgroundColor: '#fff0f0',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffccd2',
  },
  delayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d9534f',
    marginBottom: 4,
  },
  delayText: {
    fontSize: 14,
    color: '#444',
  },
});
