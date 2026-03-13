import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface VehicleCardProps {
  vehicleId: string;
  route: string;
  status: string;
  onPress: () => void;
}

export default function VehicleCard({ vehicleId, route, status, onPress }: VehicleCardProps) {
  const isMoving = status.toLowerCase() === 'moving';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.vehicleId}>{vehicleId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isMoving ? '#e6f4ea' : '#fce8e6' }]}>
          <Text style={[styles.statusText, { color: isMoving ? '#137333' : '#c5221f' }]}>
            {status}
          </Text>
        </View>
      </View>
      <Text style={styles.routeText}>{route}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#fd8b00',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#041627',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: 14,
    color: '#666',
  },
});
