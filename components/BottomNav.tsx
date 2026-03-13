import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function BottomNav() {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity style={styles.navItem}>
        <Text style={styles.navTextActive}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Text style={styles.navText}>Map</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    backgroundColor: '#041627',
    paddingVertical: 16,
    justifyContent: 'space-around',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#668096',
    fontSize: 14,
  },
  navTextActive: {
    color: '#fd8b00',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
