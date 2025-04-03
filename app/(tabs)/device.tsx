import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { getDatabase, ref, get } from "firebase/database";

// Mock Data untuk perangkat yang terhubung
const initialDevices = [
  { id: "1", name: "Device A", status: "Connected" },
  { id: "2", name: "Device B", status: "Disconnected" },
  { id: "3", name: "Device C", status: "Connected" },
];
import { ToastAndroid, Platform } from "react-native";

const showAlert = (message: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("Error", message);
  }
};


export default function Device() {
  const [devices, setDevices] = useState(initialDevices);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputTurbineId, setInputTurbineId] = useState("");

  // Fungsi untuk mengecek apakah id_turbine ada di Firebase
  const checkTurbineExists = async (id_turbine: string) => {
    const db = getDatabase();
    const turbineRef = ref(db, `TurbineData/${id_turbine}`);

    try {
      const snapshot = await get(turbineRef);
      return snapshot.exists();
    } catch (error) {
      console.error("⚠️ Error saat mengecek database:", error);
      return false;
    }
  };

  // Fungsi untuk menambahkan perangkat berdasarkan ID Turbine
  const handleAddDevice = async () => {
    console.log("Checking inputTurbineId:", inputTurbineId);
  
    if (!inputTurbineId.trim()) {
      console.log("Alert triggered: No ID entered");
      showAlert("Masukkan ID Turbine terlebih dahulu!");
      return;
    }
  
    console.log("Checking Firebase for turbine:", inputTurbineId);
    const exists = await checkTurbineExists(inputTurbineId);
    console.log("Turbine exists:", exists);
  
    if (exists) {
      console.log("Adding device to list...");
      const newDevice = {
        id: inputTurbineId,
        name: `Turbine ${inputTurbineId}`,
        status: "Connected",
      };
      setDevices([...devices, newDevice]);
      setModalVisible(false);
      setInputTurbineId("");
    } else {
      console.log("Alert triggered: Turbine not found");
      showAlert(`Turbine dengan ID "${inputTurbineId}" tidak ditemukan!`);
    }
  };
  

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Button untuk menambahkan perangkat */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
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

      {/* Modal Dialog untuk input ID Turbine */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Masukkan ID Turbine</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan ID Turbine..."
              value={inputTurbineId}
              onChangeText={setInputTurbineId}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAddDevice}>
                <Text style={styles.buttonText}>Cari & Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#5cb85c",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

