import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { useRouter } from 'expo-router';
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

interface TaskLog {
  vehicle: string;
  driver: string;
  type: string;
  timestamp: string;
  reason?: string;
  minutes?: string;
}

interface AlertLog {
  vehicle: string;
  message: string;
  time: string;
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Record<string, VehicleData>>({});
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const vehiclesRef = ref(database, 'vehicles');
    const logsRef = ref(database, 'events');
    const alertsRef = ref(database, 'alerts');

    const unsubscribeVehicles = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVehicles(data);
        const vals = Object.values(data) as VehicleData[];
        setTotalCount(vals.length);
        setActiveCount(vals.filter(v => v.status !== 'Idle' && v.status !== 'Stopped').length);
      }
    });

    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const logsArray = Object.values(data) as TaskLog[];
        logsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setTaskLogs(logsArray.slice(0, 5));
      }
    });

    const unsubscribeAlerts = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const alertsArray = Object.values(data) as AlertLog[];
        alertsArray.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        // Show up to 5 alerts
        setAlerts(alertsArray.slice(0, 5));
      }
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeLogs();
      unsubscribeAlerts();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Fleet Dashboard" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <View style={[styles.card, { width: '31%' }]}>
            <Text style={styles.cardTitle}>Active Fleet</Text>
            <Text style={styles.cardValue}>
              {totalCount > 0 ? `${activeCount} / ${totalCount}` : '84 / 102'}
            </Text>
          </View>
          <View style={[styles.card, { width: '31%' }]}>
            <Text style={styles.cardTitle}>Distance (km)</Text>
            <Text style={styles.cardValue}>12,482</Text>
          </View>
          <View style={[styles.card, { width: '31%' }]}>
            <Text style={styles.cardTitle}>Safety Score</Text>
            <Text style={[styles.cardValue, { color: '#5cb85c' }]}>94.8</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.liveMapBtn}
          onPress={() => router.push('/admin_live_map')}
        >
          <Text style={styles.liveMapBtnText}>Open Live Map</Text>
        </TouchableOpacity>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Task & Delay Monitoring</Text>
          {taskLogs.length > 0 ? (
            taskLogs.map((log, index) => {
              const isDelay = log.type === 'delay';
              return (
                <View key={index} style={[styles.logItem, isDelay && styles.delayLogBg]}>
                  <View style={[styles.statusDot, { backgroundColor: isDelay ? '#d9534f' : log.type === 'delivery completed' ? '#5cb85c' : '#fd8b00' }]} />
                  <View style={styles.logTextContainer}>
                    <Text style={[styles.logEvent, isDelay && { color: '#d9534f' }]}>
                      {isDelay ? `🚨 DELAY: ${log.minutes}m` : log.type?.toUpperCase()}
                    </Text>
                    <Text style={styles.logDetail}>
                      {log.vehicle} • {log.driver}
                      {log.reason ? `\nReason: ${log.reason}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No recent tasks logged.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Live Alerts Panel</Text>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <View key={index} style={[styles.alertItem, index === alerts.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.alertDot, { backgroundColor: alert.message.toLowerCase().includes('long idle') ? '#fd8b00' : '#d9534f' }]} />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No active alerts.</Text>
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Fleet Status</Text>

          {Object.entries(vehicles).length > 0 ? (
            Object.entries(vehicles).map(([id, v]) => {
              const vehicle = v as VehicleData;
              return (
                <View key={id} style={styles.statusRow}>
                  <Text style={styles.statusLabel}>{id}</Text>
                  <Text style={vehicle.status === 'Moving' ? styles.statusMoving : (vehicle.status === 'Idle' ? styles.statusIdle : styles.statusStopped)}>
                    {vehicle.status}
                  </Text>
                </View>
              );
            })
          ) : (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>TN 01 AF 1234 (Chennai-OMR)</Text>
                <Text style={styles.statusMoving}>Moving</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>TN 38 BE 5678 (Coimbatore)</Text>
                <Text style={styles.statusStopped}>Stopped</Text>
              </View>
              <View style={[styles.statusRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.statusLabel}>TN 59 CJ 9012 (Madurai)</Text>
                <Text style={styles.statusIdle}>Idle</Text>
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
  liveMapBtn: {
    backgroundColor: '#041627',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveMapBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  statusIdle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fd8b00',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  logTextContainer: {
    flex: 1,
  },
  logEvent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#041627',
  },
  logDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  delayLogBg: {
    backgroundColor: '#fff0f0',
  },
});
