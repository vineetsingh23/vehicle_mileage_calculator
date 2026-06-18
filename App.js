import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
  // Inputs matching your spreadsheet data
  const [insuranceLimit, setInsuranceLimit] = useState('5000');
  const [startOdometer, setStartOdometer] = useState('18246');
  const [currentOdometer, setCurrentOdometer] = useState('19988');
  const [startDateStr, setStartDateStr] = useState('2026-03-15'); // YYYY-MM-DD

  // States for calculated metrics
  const [daysDriven, setDaysDriven] = useState(1);
  const [totalDriven, setTotalDriven] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [remainingKm, setRemainingKm] = useState(0);

  useEffect(() => {
    // 1. Calculate days difference
    const start = new Date(startDateStr);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    setDaysDriven(diffDays);

    // 2. Mileage calculations
    const startOdo = parseFloat(startOdometer) || 0;
    const currentOdo = parseFloat(currentOdometer) || 0;
    const limit = parseFloat(insuranceLimit) || 0;

    const driven = Math.max(0, currentOdo - startOdo);
    const avg = driven / diffDays;
    const remaining = limit - driven;

    setTotalDriven(driven);
    setAvgPerDay(avg);
    setRemainingKm(remaining);
  }, [insuranceLimit, startOdometer, currentOdometer, startDateStr]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Vehicle Mileage Tracker</Text>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driving Limit (Insurance)</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={insuranceLimit} 
            onChangeText={setInsuranceLimit} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Starting Odometer</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={startOdometer} 
            onChangeText={setStartOdometer} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Odometer</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric" 
            value={currentOdometer} 
            onChangeText={setCurrentOdometer} 
          />
        </View>

        {/* Dashboard Metrics */}
        <Text style={styles.subHeader}>Dashboard Metrics</Text>
        <View style={styles.divider} />

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Total Days Tracked:</Text>
          <Text style={styles.metricValue}>{daysDriven} Days</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Total Driven:</Text>
          <Text style={styles.metricValue}>{totalDriven.toFixed(1)} Km</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Average Per Day:</Text>
          <Text style={styles.metricValue}>{avgPerDay.toFixed(2)} Km/Day</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Remaining Balance:</Text>
          <Text style={[styles.metricValue, { color: remainingKm < 0 ? '#ff4444' : '#00C851' }]}>
            {remainingKm.toFixed(1)} Km
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 30, color: '#555' },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 10 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  metricLabel: { fontSize: 16, color: '#333' },
  metricValue: { fontSize: 16, fontWeight: 'bold' }
});
