import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function PassengerTrackingScreen() {
  return (
    <View style={styles.container}>
      <Header title="Vehicle Telemetry" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Driver Name</Text>
          <Text style={styles.value}>John Doe</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.label}>Speed</Text>
            <Text style={styles.value}>45 mph</Text>
          </View>
          <View style={[styles.card, styles.flexCard]}>
            <Text style={styles.label}>ETA</Text>
            <Text style={styles.value}>12 min</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Route Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
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
});
