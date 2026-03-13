import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import Header from '../components/Header';

interface VehicleData {
  driverId: string;
  fuelLevel: string;
  lastUpdated: string;
  latitude: number;
  longitude: number;
  speed: string;
  status: string;
}

export default function AdminDashboardScreen() {
  const [vehicles, setVehicles] = useState<Record<string, VehicleData>>({});
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const vehiclesRef = ref(database, 'vehicles');
    
    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVehicles(data);
        const vals = Object.values(data) as VehicleData[];
        setTotalCount(vals.length);
        setActiveCount(vals.filter(v => v.status === 'Moving').length);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Fleet Dashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Fleet</Text>
            <Text style={styles.cardValue}>
              {totalCount > 0 ? `${activeCount} / ${totalCount}` : '84 / 102'}
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Distance (km)</Text>
            <Text style={styles.cardValue}>12,482</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fuel (gal)</Text>
            <Text style={styles.cardValue}>3.2k</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Safety Score</Text>
            <Text style={[styles.cardValue, { color: '#5cb85c' }]}>94.8</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Live Alerts Panel</Text>
          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Vehicle AF-119 stopped unexpectedly.</Text>
          </View>
          <View style={[styles.alertItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.alertDot, { backgroundColor: '#fd8b00' }]} />
            <Text style={styles.alertText}>Vehicle AF-402 route deviation.</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Fleet Status</Text>
          
          {Object.entries(vehicles).length > 0 ? (
            Object.entries(vehicles).map(([id, vehicle]) => (
              <View key={id} style={styles.statusRow}>
                <Text style={styles.statusLabel}>{id}</Text>
                <Text style={vehicle.status === 'Moving' ? styles.statusMoving : styles.statusStopped}>
                  {vehicle.status}
                </Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>AF-402 (Downtown)</Text>
                <Text style={styles.statusMoving}>Moving</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>AF-119 (Airport)</Text>
                <Text style={styles.statusStopped}>Stopped</Text>
              </View>
              <View style={[styles.statusRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.statusLabel}>AF-882 (City Loop)</Text>
                <Text style={styles.statusMoving}>Moving</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#041627',
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#041627',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#041627',
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d9534f',
    marginRight: 12,
  },
  alertText: {
    fontSize: 14,
    color: '#444',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 15,
    color: '#333',
  },
  statusMoving: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5cb85c',
  },
  statusStopped: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d9534f',
  },
});
