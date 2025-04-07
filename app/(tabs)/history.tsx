import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Device = {
  id: string;
  name: string;
  status: string;
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: () => "#007AFF",
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#007AFF" },
  propsForLabels: {
    fontSize: 10,
  },
};

const filterOptions = [
  { label: "1 Minggu Terakhir", value: "7d" },
  { label: "1 Bulan Terakhir", value: "1m" },
  { label: "3 Bulan Terakhir", value: "3m" },
  { label: "1 Tahun Terakhir", value: "1y" },
];

const filterByDateRange = (dates: string[], range: string): string[] => {
  const now = new Date();
  const getDate = (str: string) => new Date(str);

  let startDate: Date;

  switch (range) {
    case "7d":
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      break;
    case "1m":
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "1y":
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(0);
  }

  return dates.filter((dateStr) => getDate(dateStr) >= startDate);
};

export default function HistoryScreen() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [voltageData, setVoltageData] = useState<number[]>([0]);
  const [currentData, setCurrentData] = useState<number[]>([0]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRange, setFilterRange] = useState("1m");

  const resetChartData = () => {
    setLabels([]);
    setVoltageData([0]);
    setCurrentData([0]);
  };

  const fetchDevices = useCallback(async () => {
    try {
      const storedDevices = await AsyncStorage.getItem("devices");
      if (storedDevices) {
        const parsed: Device[] = JSON.parse(storedDevices);
        setDeviceList(parsed);
        if (parsed.length === 0) {
          setSelectedDevice(null);
          resetChartData();
        } else {
          const stillExists = parsed.find((d) => d.id === selectedDevice?.id);
          if (!stillExists) {
            setSelectedDevice(parsed[0]);
          }
        }
      } else {
        setDeviceList([]);
        setSelectedDevice(null);
        resetChartData();
      }
    } catch (err) {
      console.error("Gagal mengambil data devices:", err);
      setDeviceList([]);
      setSelectedDevice(null);
      resetChartData();
    }
  }, [selectedDevice]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  useEffect(() => {
    if (!selectedDevice) {
      resetChartData();
      return;
    }

    const database = getDatabase();
    const reference = ref(
      database,
      `TurbineData/${selectedDevice.id}/daily_data`
    );

    const listener = onValue(reference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allDates: string[] = Object.keys(data).sort();
        const dates = filterByDateRange(allDates, filterRange);

        const newVoltage: number[] = [];
        const newCurrent: number[] = [];

        dates.forEach((date) => {
          const daily = data[date];
          if (daily.count > 0) {
            newVoltage.push(daily.total_tegangan / daily.count);
            newCurrent.push(daily.total_arus / daily.count);
          }
        });

        setLabels(dates);
        setVoltageData(newVoltage.length ? newVoltage : [0]);
        setCurrentData(newCurrent.length ? newCurrent : [0]);
      } else {
        resetChartData();
      }
    });

    return () => listener();
  }, [selectedDevice, filterRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          History - {selectedDevice?.name ?? "Select Device"}
        </Text>
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {deviceList.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.menuItem}
              onPress={() => {
                setSelectedDevice(device);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.menuText}>{device.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterButton,
                  filterRange === option.value && styles.filterButtonActive,
                ]}
                onPress={() => setFilterRange(option.value)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterRange === option.value &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.chartTitle}>Voltage Over Time</Text>
        <LineChart
          data={{
            labels,
            datasets: [{ data: voltageData }],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          xLabelsOffset={-10}
          verticalLabelRotation={45}
          style={{
            marginVertical: 8,
            paddingBottom: 20,
            borderRadius: 16,
          }}
        />

        <Text style={styles.chartTitle}>Current Over Time</Text>
        <LineChart
          data={{ labels, datasets: [{ data: currentData }] }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          xLabelsOffset={-10}
          verticalLabelRotation={45}
          style={{
            marginVertical: 8,
            paddingBottom: 20,
            borderRadius: 16,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  dropdownMenu: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    padding: 10,
    zIndex: 999,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 15,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  filterLabel: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#9ecdff",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#000",
  },
  filterButtonTextActive: {
    fontWeight: "bold",
    color: "#007AFF",
  },
});
