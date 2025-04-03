import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { getDatabase, ref, onValue } from "firebase/database";

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#0000ff" },
};

export default function HistoryScreen() {
  const [showDropdown, setShowDropdown] = useState(false);

  const [labels, setLabels] = useState<string[]>([]);
  const [voltageData, setVoltageData] = useState<number[]>([0]);
  const [currentData, setCurrentData] = useState<number[]>([0]);

  useEffect(() => {
    const database = getDatabase();
    const reference = ref(database, "TurbineData/turbine1/daily_data");

    const listener = onValue(reference, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dates: string[] = Object.keys(data).sort();

        const newVoltage: number[] = [];
        const newCurrent: number[] = [];

        dates.forEach((date) => {
          const daily = data[date];
          if (daily.count > 0) {
            newVoltage.push(daily.total_tegangan / daily.count);
            newCurrent.push(daily.total_arus / daily.count);
            console.log("Voltage Data:", voltageData);
            console.log("Current Data:", currentData);
          }
        });

        setLabels(dates);
        setVoltageData(newVoltage);
        setCurrentData(newCurrent);
      }
    });

    return () => listener();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>

        {/* Dropdown Button */}
        <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => console.log("Opsi 1")}
          >
            <Text style={styles.menuText}>Opsi 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => console.log("Opsi 2")}
          >
            <Text style={styles.menuText}>Opsi 2</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.chartTitle}>Voltage Over Time</Text>
        <LineChart
          data={{ labels, datasets: [{ data: voltageData }] }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />

        <Text style={styles.chartTitle}>Current Over Time</Text>
        <LineChart
          data={{ labels, datasets: [{ data: currentData }] }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
