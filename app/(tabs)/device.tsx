import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";

// Mock Data untuk perangkat yang terhubung
const initialDevices = [
  { id: "1", name: "Device A", status: "Connected" },
  { id: "2", name: "Device B", status: "Disconnected" },
  { id: "3", name: "Device C", status: "Connected" },
];

export default function Device() {
  const [devices, setDevices] = useState(initialDevices);

  const handleAddDevice = () => {
    const newDevice = {
      id: (devices.length + 1).toString(),
      name: `Device ${devices.length + 1}`,
      status: "Connected",
    };
    setDevices([...devices, newDevice]);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Button untuk menambahkan perangkat */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
        <Text style={styles.addButtonText}>Add Device</Text>
      </TouchableOpacity>

      {/* Daftar perangkat yang terhubung */}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deviceItem}>
            <Text style={styles.deviceName}>{item.name}</Text>
            <Text style={styles.deviceStatus}>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
  },
  deviceStatus: {
    fontSize: 14,
    color: "#888",
  },
});
