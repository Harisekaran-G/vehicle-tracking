import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';
import VehicleCard from '../components/VehicleCard';

export default function VehicleSelectScreen() {
  const router = useRouter();

  const vehicles = [
    { id: 'AF-402', route: 'Downtown Express', status: 'Moving' },
    { id: 'AF-119', route: 'Airport Shuttle', status: 'Stopped' },
    { id: 'AF-882', route: 'City Loop', status: 'Moving' },
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
            onPress={() => router.push('/passenger-live-map')} 
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
