import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";

type IndicatorValues = {
  [key: string]: number;
};

const unitMap: Record<string, string> = {
  Voltage: "Volt",
  Current: "A",
  Power: "Watt",
  "Turbine Speed": "RPM",
  "Flow Rate": "L/s",
  Pressure: "Pa",
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 12,
  barPercentage: 0.5,
};

const initialValues: IndicatorValues = {
  Voltage: 0.8,
  Current: 0.6,
  Power: 0.75,
  "Turbine Speed": 0.9,
  "Flow Rate": 0.65,
  Pressure: 0.7,
};

export default function Home(): JSX.Element {
  const [animatedValues, setAnimatedValues] = useState<IndicatorValues>(
    Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: 0 }),
      {} as IndicatorValues
    )
  );

  const resetAnimation = () => {
    Object.keys(initialValues).forEach((key) => {
      let value = 0;
      const interval = setInterval(() => {
        if (value >= initialValues[key]) {
          clearInterval(interval);
        } else {
          value += 0.05;
          setAnimatedValues((prev) => ({ ...prev, [key]: value }));
        }
      }, 50);
    });
  };

  useEffect(() => {
    resetAnimation();
  }, []);

  const handleCardPress = (label: string) => {
    console.log(`📊 ${label} clicked!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>System Performance</Text>

      <View style={styles.grid}>
        {Object.keys(animatedValues).map((label, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleCardPress(label)}
          >
            <Text style={styles.cardTitle}>{label}</Text>

            <View style={styles.chartContainer}>
              <ProgressChart
                data={{ labels: [label], data: [animatedValues[label]] }}
                width={Dimensions.get("window").width / 2.5}
                height={120}
                strokeWidth={12}
                radius={45}
                chartConfig={chartConfig}
                hideLegend={true}
              />
              <Text style={styles.valueText}>
                {Math.round(animatedValues[label] * 100)} {unitMap[label]}
              </Text>
            </View>
          </TouchableOpacity>
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
});
