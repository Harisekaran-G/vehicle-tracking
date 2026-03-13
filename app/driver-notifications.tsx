import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Header from '../components/Header';

export default function DriverNotificationsScreen() {
  const [gpsAlerts, setGpsAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(false);
  const [routeAlerts, setRouteAlerts] = useState(true);

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>GPS Connection Alerts</Text>
          <Switch 
            value={gpsAlerts} 
            onValueChange={setGpsAlerts}
            trackColor={{ false: '#e0e0e0', true: '#fd8b00' }}
            thumbColor={'#fff'}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Maintenance Alerts</Text>
          <Switch 
            value={maintenanceAlerts} 
            onValueChange={setMaintenanceAlerts}
            trackColor={{ false: '#e0e0e0', true: '#fd8b00' }}
            thumbColor={'#fff'}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Route Alerts</Text>
          <Switch 
            value={routeAlerts} 
            onValueChange={setRouteAlerts}
            trackColor={{ false: '#e0e0e0', true: '#fd8b00' }}
            thumbColor={'#fff'}
          />
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
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#041627',
    fontWeight: '500',
  },
});
