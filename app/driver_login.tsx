import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/Header';

export default function DriverLoginScreen() {
  const router = useRouter();
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleType, setVehicleType] = useState('supplier');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header title="Driver Portal" />
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Driver Name"
          placeholderTextColor="#999"
          value={driverId}
          onChangeText={setDriverId}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Vehicle ID (e.g., TN 66 DL 3456)"
          placeholderTextColor="#999"
          value={vehicleId}
          onChangeText={setVehicleId}
          autoCapitalize="characters"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.typeSelector}>
          {['supplier', 'delivery', 'vendor'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, vehicleType === type && styles.typeButtonActive]}
              onPress={() => setVehicleType(type)}
            >
              <Text style={[styles.typeButtonText, vehicleType === type && styles.typeButtonTextActive]}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push({
            pathname: '/driver_tracking',
            params: { driverId, vehicleId, vehicleType }
          })}
        >
          <Text style={styles.loginButtonText}>Login System</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#041627',
    marginBottom: 8,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#041627',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeButtonActive: {
    backgroundColor: '#041627',
  },
  typeButtonText: {
    color: '#041627',
    fontSize: 12,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  loginButton: {
    backgroundColor: '#041627',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#041627',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
