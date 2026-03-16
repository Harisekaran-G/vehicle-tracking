import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';

export default function VehicleSelectScreen() {
  const router = useRouter();

  const vehicles = [
    { id: 'TN 01 AF 1234', route: 'Chennai Central - OMR', status: 'Moving' },
    { id: 'TN 38 BE 5678', route: 'Coimbatore Town Hall', status: 'Stopped' },
    { id: 'TN 59 CJ 9012', route: 'Madurai Central - Periyar', status: 'Moving' },
    { id: 'TN 66 DL 3456', route: 'Salem Bus Stand - Junction', status: 'Moving' },
    { id: 'TN 72 MK 7890', route: 'Tirunelveli - Palayamkottai', status: 'Stopped' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Select Vehicle" />
      <ScrollView contentContainerStyle={styles.list}>
        {vehicles.map((v) => (
          <VehicleCard 
            key={v.id} 
            vehicleId={v.id} 
            route={v.route} 
            status={v.status} 
            onPress={() => router.push({
              pathname: '/passenger-live-map',
              params: { vehicleId: v.id, route: v.route }
            })} 
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
  },
  list: {
    padding: 20,
  },
});
