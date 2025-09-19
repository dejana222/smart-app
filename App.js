import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const API_URL = 'http://10.0.2.2:5000/predict';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceOn, setDeviceOn] = useState(true);
  const THRESHOLD = 2.0;

  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(json => {
        console.log('Received data:', json);
        if (Array.isArray(json.prediction) && json.prediction.every(item => typeof item === 'number' && !isNaN(item))) {
          setData(json.prediction);
        } else {
          console.error('Invalid prediction data:', json.prediction);
          setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const toggleDevice = () => setDeviceOn(!deviceOn);

  const autoSuggest = () => {
    if (data.length > 0 && Math.max(...data) > THRESHOLD && deviceOn) {
      alert('Potrošnja je visoka! Razmislite o isključivanju uređaja.');
    }
  };

  useEffect(() => autoSuggest(), [data]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Učitavanje predikcija...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Smart Home - Energy Saver</Text>
      <LineChart
        data={{ labels: Array.from({ length: data.length }, (_, i) => `${i+1}h`), datasets: [{ data }] }}
        width={screenWidth - 16}
        height={220}
        yAxisSuffix="kWh"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#e0f7fa',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 150, 136, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: '4', strokeWidth: '2', stroke: '#00796b' }
        }}
        style={{ marginVertical: 16, borderRadius: 16 }}
      />
      <Text style={styles.deviceStatus}>Uređaj je: {deviceOn ? 'UKLJUČEN' : 'ISKLJUČEN'}</Text>
      <Button title={deviceOn ? 'Isključi uređaj' : 'Uključi uređaj'} onPress={toggleDevice} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 16 },
  deviceStatus: { fontSize: 18, textAlign: 'center', marginVertical: 16 },
});