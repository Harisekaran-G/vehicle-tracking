import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';

interface VehicleData {
    driverId: string;
    latitude: number;
    longitude: number;
    speed: string;
    status: string;
    lastUpdated: string;
}

export default function AdminLiveMapScreen() {
    const router = useRouter();
    const [vehicles, setVehicles] = useState<Record<string, VehicleData>>({});

    useEffect(() => {
        const vehiclesRef = ref(database, 'vehicles');
        const unsubscribe = onValue(vehiclesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setVehicles(data);
            }
        });

        return () => unsubscribe();
    }, []);

    const getMarkerColor = (status: string) => {
        if (status === 'Moving') return '#5cb85c';
        if (status === 'Idle') return '#fd8b00';
        return '#d9534f'; // Stopped or other
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin_dashboard')}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Live Fleet Map</Text>
            </View>

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 13.0827,
                    longitude: 80.2707,
                    latitudeDelta: 10.0,
                    longitudeDelta: 10.0,
                }}
            >
                {Object.entries(vehicles).map(([id, vehicle]) => {
                    if (!vehicle.latitude || !vehicle.longitude) return null;
                    return (
                        <Marker
                            key={id}
                            coordinate={{
                                latitude: vehicle.latitude,
                                longitude: vehicle.longitude
                            }}
                            pinColor={getMarkerColor(vehicle.status)}
                        >
                            <Callout style={styles.callout}>
                                <Text style={styles.calloutTitle}>{id}</Text>
                                <Text style={styles.calloutText}>Driver: {vehicle.driverId}</Text>
                                <Text style={styles.calloutText}>Status: {vehicle.status}</Text>
                            </Callout>
                        </Marker>
                    );
                })}
            </MapView>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#5cb85c' }]} />
                    <Text style={styles.legendText}>Moving</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#fd8b00' }]} />
                    <Text style={styles.legendText}>Idle</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#d9534f' }]} />
                    <Text style={styles.legendText}>Stopped</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#041627',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#041627',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    backButton: {
        marginRight: 15,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    map: {
        flex: 1,
    },
    callout: {
        padding: 10,
        minWidth: 150,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    calloutText: {
        fontSize: 14,
        color: '#444',
    },
    legendContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-around',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});
