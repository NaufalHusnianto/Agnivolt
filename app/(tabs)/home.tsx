import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { database, ref, onValue } from "../firebaseConfig";
import { format } from "date-fns";

const unitMap: Record<string, string> = {
  arus: "A",
  daya: "Watt",
  tegangan: "Volt",
  rpm: "RPM",
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
};


export default function Home(): JSX.Element {
  const [sensorData, setSensorData] = useState<{ arus: number; daya: number; tegangan: number; rpm: number }>({
    arus: 0,
    daya: 0,
    tegangan: 0,
    rpm: 0,
  });
  
  
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; 
  };

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const reference = ref(database, `TurbineData/turbine1/daily_data/${today}`);

    const onValueChange = onValue(reference, (snapshot) => {
      if (snapshot.exists()) {
        const newData = snapshot.val() as Partial<typeof maxValues>; 
      
        console.log("Data diperbarui:", newData);
      
        const filteredData: { arus: number; daya: number; tegangan: number; rpm: number } = {
          arus: (newData.arus ?? 0) / maxValues.arus,
          daya: (newData.daya ?? 0) / maxValues.daya,
          tegangan: (newData.tegangan ?? 0) / maxValues.tegangan,
          rpm: (newData.rpm ?? 0) / maxValues.rpm,
        };
      
        setSensorData(filteredData);
      }else{
        setSensorData({
          arus: 0,
          daya: 0,
          tegangan: 0,
          rpm: 0,
        });
      }
    });

    return () => onValueChange();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>System Performance</Text>

      <View style={styles.grid}>
        {sensorData ? (
          Object.keys(sensorData).map((label, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{label.toUpperCase()}</Text>

              <View style={styles.chartContainer}>
                <ProgressChart
                  data={{ labels: [label], data: [sensorData[label as keyof typeof sensorData]] }}
                  width={Dimensions.get("window").width / 2.5}
                  height={120}
                  strokeWidth={12}
                  radius={45}
                  chartConfig={chartConfig} 
                  hideLegend={true}
                />
                <Text style={styles.valueText}>
                  {Math.round(sensorData[label as keyof typeof sensorData] * maxValues[label as keyof typeof maxValues])} {unitMap[label as keyof typeof unitMap]}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#25292e",
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
    fontWeight: "semibold",
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
  noDataText: { textAlign: 'center', fontSize: 18, color: 'red' },
});
