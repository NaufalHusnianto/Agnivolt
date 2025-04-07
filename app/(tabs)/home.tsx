import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { database, ref, onValue, off } from "../firebaseConfig";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const unitMap: Record<string, string> = {
  arus: "A",
  daya: "Watt",
  tegangan: "Volt",
  rpm: "RPM",
  ketinggianAir: "cm",
  debit: "L/s",
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 12,
  barPercentage: 0.5,
};

const maxValues: Record<string, number> = {
  arus: 5,
  daya: 50,
  tegangan: 10,
  rpm: 1000,
  ketinggianAir: 30,
  debit: 5,
};

export default function Home(): JSX.Element {
  const [sensorData, setSensorData] = useState({
    arus: 0,
    daya: 0,
    tegangan: 0,
    rpm: 0,
    ketinggianAir: 0,
    debit: 0,
  });

  const [deviceList, setDeviceList] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const setSensorDataZero = () => {
    setSensorData({
      arus: 0,
      daya: 0,
      tegangan: 0,
      rpm: 0,
      ketinggianAir: 0,
      debit: 0,
    });
  };

  const fetchDevices = async () => {
    try {
      setRefreshing(true);
      const storedDevices = await AsyncStorage.getItem("devices");

      if (storedDevices && isMounted.current) {
        const parsed = JSON.parse(storedDevices);
        if (Array.isArray(parsed)) {
          const ids = parsed.map((device: any) => device.id);
          setDeviceList(ids);

          if (ids.length > 0) {
            setSelectedDevice((prev) => prev ?? ids[0]);
          } else {
            setSelectedDevice(null);
            setSensorDataZero(); // reset nilai grafik
          }
        } else {
          setDeviceList([]);
          setSelectedDevice(null);
          setSensorDataZero();
        }
      } else {
        setDeviceList([]);
        setSelectedDevice(null);
        setSensorDataZero();
      }
    } catch (err) {
      console.error("Gagal memuat device list:", err);
      if (isMounted.current) {
        setDeviceList([]);
        setSelectedDevice(null);
        setSensorDataZero();
      }
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    fetchDevices();
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDevice) {
      setSensorDataZero();
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const dataRef = ref(
      database,
      `TurbineData/${selectedDevice}/daily_data/${today}`
    );

    const handleValueChange = (
      snapshot: import("firebase/database").DataSnapshot
    ) => {
      if (!isMounted.current) return;

      if (snapshot.exists()) {
        const newData = snapshot.val();

        const filteredData = {
          arus: (newData.arus ?? 0) / maxValues.arus,
          daya: (newData.daya ?? 0) / maxValues.daya,
          tegangan: (newData.tegangan ?? 0) / maxValues.tegangan,
          rpm: (newData.rpm ?? 0) / maxValues.rpm,
          ketinggianAir: (newData.water_level ?? 0) / maxValues.ketinggianAir,
          debit: (newData.flowRate ?? 0) / maxValues.debit,
        };

        setSensorData(filteredData);
      } else {
        setSensorDataZero();
      }
    };

    onValue(dataRef, handleValueChange);

    return () => {
      off(dataRef, "value", handleValueChange);
    };
  }, [selectedDevice]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchDevices} />
      }
    >
      <Text style={styles.header}>System Performance</Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Device : </Text>
        <Picker
          selectedValue={selectedDevice}
          onValueChange={(itemValue) => setSelectedDevice(itemValue)}
          style={styles.picker}
        >
          {deviceList.length > 0 ? (
            deviceList.map((device, index) => (
              <Picker.Item label={device} value={device} key={index} />
            ))
          ) : (
            <Picker.Item label="Tidak ada device" value={null} />
          )}
        </Picker>
      </View>

      <View style={styles.grid}>
        {Object.keys(sensorData).map((label, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{label.toUpperCase()}</Text>
            <View style={styles.chartContainer}>
              <ProgressChart
                data={{
                  labels: [label],
                  data: [sensorData[label as keyof typeof sensorData]],
                }}
                width={Dimensions.get("window").width / 2.5}
                height={120}
                strokeWidth={12}
                radius={45}
                chartConfig={chartConfig}
                hideLegend={true}
              />
              <Text style={styles.valueText}>
                {(
                  sensorData[label as keyof typeof sensorData] *
                  maxValues[label as keyof typeof maxValues]
                ).toFixed(1)}{" "}
                {unitMap[label as keyof typeof unitMap]}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#25292e",
  },
  pickerWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 40,
  },
  card: {
    width: Dimensions.get("window").width / 2.5,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#25292e",
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
  },
});
