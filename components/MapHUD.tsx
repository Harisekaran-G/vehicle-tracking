import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MapHUDProps {
  speed: string;
  signal: string;
  fuel: string;
}

export default function MapHUD({ speed, signal, fuel }: MapHUDProps) {
  return (
    <View style={styles.hudContainer}>
      <View style={styles.hudBox}>
        <Text style={styles.hudLabel}>Speed</Text>
        <Text style={styles.hudValue}>{speed} mph</Text>
      </View>
      <View style={styles.hudLine} />
      <View style={styles.hudBox}>
        <Text style={styles.hudLabel}>GPS</Text>
        <Text style={[styles.hudValue, { color: '#5cb85c' }]}>{signal}</Text>
      </View>
      <View style={styles.hudLine} />
      <View style={styles.hudBox}>
        <Text style={styles.hudLabel}>Fuel</Text>
        <Text style={styles.hudValue}>{fuel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(4, 22, 39, 0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  hudBox: {
    flex: 1,
    alignItems: 'center',
  },
  hudLine: {
    width: 1,
    height: 30,
    backgroundColor: '#334c63',
  },
  hudLabel: {
    color: '#99b3c6',
    fontSize: 12,
    marginBottom: 4,
  },
  hudValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
